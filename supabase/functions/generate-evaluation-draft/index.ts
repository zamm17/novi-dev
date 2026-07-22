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
  "background",
  "reasonForReferral",
  "parentInputSummary",
  "teacherInputSummary",
  "assessmentResults",
  "presentLevels",
  "interpretation",
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
- Do NOT determine eligibility. Eligibility is a team decision.
- Do NOT diagnose beyond the provided data. Avoid medical diagnoses.
- Use cautious, professional school-evaluation language ("appears to", "based on parent report", "as measured by").
- Ground every claim ONLY in the supplied parent input, teacher input, assessment results, and SLP observations. Do not invent scores, history, or classroom examples.
- If information is missing for a section, say so briefly (e.g., "Parent input was not available at the time of this draft.") rather than fabricating.
- Write a near-complete, editable draft. The SLP will review, revise, and finalize.

Output format — return ONLY a JSON object with these exact string keys:
background, reasonForReferral, parentInputSummary, teacherInputSummary, assessmentResults, presentLevels, interpretation, recommendations, summary.
No markdown, no code fences, no commentary outside the JSON.`;

function buildUserPrompt(payload: any): string {
  return `Draft the evaluation report sections for the following student. Use only this data.\n\nPAYLOAD:\n${JSON.stringify(payload, null, 2)}`;
}

function coerceDraft(raw: unknown): DraftSections | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const out = {} as DraftSections;
  for (const k of DRAFT_KEYS) {
    const v = obj[k];
    if (typeof v !== "string") return null;
    out[k] = v;
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