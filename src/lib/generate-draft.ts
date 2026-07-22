import type { DraftSections } from "./mock-data";
import {
  buildDraftFromPayload,
  type EvaluationDraftPayload,
} from "./draft-payload";

export interface GenerateDraftResult {
  draft: DraftSections;
  source: "edge-function" | "local-fallback";
  error?: string;
}

const REQUIRED_KEYS: (keyof DraftSections)[] = [
  "background",
  "reasonForReferral",
  "parentInputSummary",
  "teacherInputSummary",
  "assessmentResults",
  "presentLevels",
  "interpretation",
  "recommendations",
  "summary",
];

function isDraftSections(v: unknown): v is DraftSections {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return REQUIRED_KEYS.every((k) => typeof obj[k] === "string");
}

/**
 * Generate an evaluation draft.
 *
 * If Supabase config is present (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY),
 * this calls the `generate-evaluation-draft` Edge Function. On any failure
 * (missing config, network error, non-200, malformed JSON), it falls back to
 * the local deterministic draft built from the payload.
 *
 * No OpenAI key is ever read on the client — it lives only in the Edge
 * Function environment as OPENAI_API_KEY.
 */
export async function generateEvaluationDraft(
  payload: EvaluationDraftPayload,
): Promise<GenerateDraftResult> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const fallback = (error?: string): GenerateDraftResult => ({
    draft: buildDraftFromPayload(payload),
    source: "local-fallback",
    error,
  });

  if (!url || !anonKey) {
    return { draft: buildDraftFromPayload(payload), source: "local-fallback" };
  }

  try {
    const res = await fetch(
      `${url}/functions/v1/generate-evaluation-draft`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return fallback(`Edge function ${res.status}: ${text.slice(0, 160)}`);
    }
    const data = (await res.json()) as unknown;
    if (!isDraftSections(data)) {
      return fallback("Edge function returned unexpected shape");
    }
    return { draft: data, source: "edge-function" };
  } catch (e) {
    return fallback(e instanceof Error ? e.message : "Network error");
  }
}