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

// TODO: Replace these prototype fallback constants with proper deploy-time env
// vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) before production.
const PROTOTYPE_SUPABASE_URL = "https://gpfzajwjmygwszmnschx.supabase.co";
const PROTOTYPE_SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZnphandqbXlnd3N6bW5zY2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2ODg5NjMsImV4cCI6MjEwMDI2NDk2M30.Chgfz9Twxrq5_wfznD4v4eWI2dgf_qCrSUztrqFke6Y";

function resolveSupabaseConfig(): { url?: string; key?: string } {
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    PROTOTYPE_SUPABASE_URL;
  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    PROTOTYPE_SUPABASE_PUBLIC_KEY;
  return { url, key };
}

export function getDraftEndpointUrl(): string {
  const { url } = resolveSupabaseConfig();
  return `${url ?? ""}/functions/v1/generate-evaluation-draft`;
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
  const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();
  const fallback = (error?: string): GenerateDraftResult => ({
    draft: buildDraftFromPayload(payload),
    source: "local-fallback",
    error,
  });

  if (!supabaseUrl || !supabaseKey) {
    return fallback(
      "Missing Supabase config: VITE_SUPABASE_URL or Supabase public key was not available in the browser build.",
    );
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/generate-evaluation-draft`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return fallback(
        `Edge function returned ${res.status} ${res.statusText}: ${text.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as unknown;
    if (!isDraftSections(data)) {
      return fallback("Edge function returned unexpected shape");
    }
    return { draft: data, source: "edge-function" };
  } catch (e) {
    return fallback(
      `Network error calling edge function: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

export function hasSupabaseDraftConfig(): boolean {
  const { url, key } = resolveSupabaseConfig();
  return Boolean(url && key);
}