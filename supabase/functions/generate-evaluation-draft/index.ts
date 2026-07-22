// Supabase Edge Function: generate-evaluation-draft
//
// Accepts POST of an EvaluationDraftPayload (see src/lib/draft-payload.ts on
// the frontend) and returns a DraftSections JSON object.
//
// Required environment variables (set via `supabase secrets set` or the
// Supabase dashboard — NEVER commit these to source):
//   OPENAI_API_KEY   OpenAI API key used server-side only.
//
// The frontend reads:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
// and calls `${VITE_SUPABASE_URL}/functions/v1/generate-evaluation-draft`.
// If either the config or this function is unavailable, the client falls
// back to a deterministic local draft — Novi always produces something the
// SLP can review and edit.
//
// Clinical guardrails are baked into the prompt below. The SLP remains the
// reviewer and clinical decision-maker; this function only produces an
// editable draft grounded in the supplied data.

// deno-lint-ignore-file no-explicit-any

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DRAFT_KEYS = [
  "evaluationInformation",
  "reasonForReferral",
  "sourcesOfData",
  "backgroundAndHistory",
  "parentInputSummary",
  "teacherInputSummary",
  "behavioralObservations",
  "testingConditionsAndValidity",
  "assessmentResults",
  "speechSoundProfile",
  "presentLevels",
  "educationalImpact",
  "interpretation",
  "eligibilityConsiderations",
  "recommendations",
  "summary",
] as const;

type DraftSections = Record<(typeof DRAFT_KEYS)[number], string>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validatePayload(p: any): string | null {
  if (!p || typeof p !== "object") return "Payload must be an object";
  if (!p.student || typeof p.student !== "object") return "Missing student";
  if (!p.evaluation || typeof p.evaluation !== "object")
    return "Missing evaluation";
  if (typeof p.referralReason !== "string") return "Missing referralReason";
  if (!p.parentIntake || !p.teacherIntake)
    return "Missing parent/teacher intake";
  if (!Array.isArray(p.assessments)) return "Missing assessments array";
  if (!p.observations || typeof p.observations !== "object")
    return "Missing observations";
  return null;
}

const SYSTEM_PROMPT = `You are assisting a school-based Speech-Language Pathologist (SLP) by drafting sections of a special-education speech/language evaluation report.

Clinical guardrails — follow strictly:
- Do NOT determine eligibility. Eligibility is determined by the IEP team.
- Do NOT diagnose beyond the provided data. Avoid medical diagnoses.
- Use cautious, professional school-evaluation language ("appears to", "based on parent report", "teacher reported", "results suggest", "as measured by").
- Ground every claim ONLY in the supplied parent input, teacher input, assessment results, oral motor / hearing data if present, and SLP observations. Do not invent scores, dates, hearing results, services, history, or classroom examples.
- If bilingual, cultural, or linguistic information is limited, say that more information may be needed rather than making unsupported claims about difference vs. disorder.
- If information is missing for a section, say so briefly and note SLP review is required, rather than fabricating.
- Write a near-complete, editable, report-shaped draft. The SLP will review, revise, and finalize.

Section content expectations:
- evaluationInformation: student name, grade, school, DOB, evaluation type, consent date, due date.
- reasonForReferral: who referred and why, grounded in the supplied referral reason and teacher input.
- sourcesOfData: enumerate the data used — parent questionnaire, teacher questionnaire, standardized assessments, oral motor exam (if present), SLP observations, records/history (if available).
- backgroundAndHistory: developmental, medical, hearing, language, educational, and prior services history from parent input.
- parentInputSummary: concerns, strengths, home language, key parent-reported information.
- teacherInputSummary: classroom concerns, academic impact, strengths, supports tried, examples.
- behavioralObservations: cooperation, attention, response to cues, participation, observed communication behavior during testing.
- testingConditionsAndValidity: state whether results appear valid based on observations; flag any bilingual/cultural/linguistic considerations that affect interpretation.
- assessmentResults: name each measure, report standard score and percentile, and describe subtest patterns using only the supplied notes.
- speechSoundProfile: target sounds, positions affected, error patterns, connected speech intelligibility, stimulability, oral motor / hearing findings when provided. If not applicable or not enough data, say so.
- presentLevels: strengths and areas of need in functional terms.
- educationalImpact: connect communication needs to classroom participation, oral reading, peer interaction, confidence, academics, and access to instruction.
- interpretation: cautious clinical impression across parent, teacher, assessment, and observation data.
- eligibilityConsiderations: cautious, team-based language. It may say the data may support the IEP team's consideration of speech/language eligibility, but must NOT decide eligibility.
- recommendations: concrete, school-relevant target areas, cueing/supports, classroom supports, and carryover opportunities.
- summary: brief closing summary framing the report for the IEP team.

Output format — return ONLY a single JSON object at the top level with EVERY one of these 16 exact keys present, and each value MUST be a string:

{
  "evaluationInformation": "string",
  "reasonForReferral": "string",
  "sourcesOfData": "string",
  "backgroundAndHistory": "string",
  "parentInputSummary": "string",
  "teacherInputSummary": "string",
  "behavioralObservations": "string",
  "testingConditionsAndValidity": "string",
  "assessmentResults": "string",
  "speechSoundProfile": "string",
  "presentLevels": "string",
  "educationalImpact": "string",
  "interpretation": "string",
  "eligibilityConsiderations": "string",
  "recommendations": "string",
  "summary": "string"
}

Do NOT wrap the object in a "draft", "sections", "data", or any other parent key. Do NOT nest these keys under another object. Do NOT return arrays. No markdown, no code fences, no commentary outside the JSON. Every one of the 16 keys above must be present at the top level as a string.`;

function buildUserPrompt(payload: any): string {
  return `Draft the evaluation report sections for the following student. Use only this data.\n\nPAYLOAD:\n${JSON.stringify(payload, null, 2)}`;
}

const MISSING_PLACEHOLDER =
  "No information was generated for this section. SLP review required.";

function coerceDraft(raw: unknown): DraftSections | null {
  if (!raw || typeof raw !== "object") return null;
  let obj = raw as Record<string, unknown>;
  // Tolerate common wrappers the model may add.
  const hasAnyKey = (o: Record<string, unknown>) =>
    DRAFT_KEYS.some((k) => typeof o[k] === "string");
  if (!hasAnyKey(obj)) {
    if (obj.draft && typeof obj.draft === "object") {
      obj = obj.draft as Record<string, unknown>;
    } else if (obj.sections && typeof obj.sections === "object") {
      obj = obj.sections as Record<string, unknown>;
    } else if (obj.data && typeof obj.data === "object") {
      obj = obj.data as Record<string, unknown>;
    }
  }
  const out = {} as DraftSections;
  for (const k of DRAFT_KEYS) {
    const v = obj[k];
    out[k] = typeof v === "string" && v.trim().length > 0
      ? v
      : MISSING_PLACEHOLDER;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return json(
      { error: "OPENAI_API_KEY is not configured on the Edge Function" },
      503,
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const invalid = validatePayload(payload);
  if (invalid) return json({ error: invalid }, 400);

  let openaiRes: Response;
  try {
    openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(payload) },
        ],
      }),
    });
  } catch (e) {
    return json(
      { error: `Upstream fetch failed: ${e instanceof Error ? e.message : String(e)}` },
      502,
    );
  }

  if (!openaiRes.ok) {
    const text = await openaiRes.text().catch(() => "");
    return json(
      { error: `OpenAI error ${openaiRes.status}: ${text.slice(0, 400)}` },
      502,
    );
  }

  const data = (await openaiRes.json()) as any;
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return json({ error: "Empty model response" }, 502);

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return json({ error: "Model did not return valid JSON" }, 502);
  }
  const draft = coerceDraft(parsed);
  if (!draft) {
    return json({ error: "Model JSON missing required DraftSections keys" }, 502);
  }

  return json(draft, 200);
});