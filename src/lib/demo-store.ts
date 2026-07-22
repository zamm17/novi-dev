import { useMemo, useSyncExternalStore } from "react";
import {
  deriveEvaluationState,
  evaluations,
  getEvaluation,
  type AssessmentEntry,
  type Evaluation,
} from "./mock-data";

export const DEMO_EVAL_ID = "ev-001";
const KEY_PREFIX = "novi.demo.";
const parentKey = (evalId: string) => `${KEY_PREFIX}parent.${evalId}`;
const teacherKey = (evalId: string) => `${KEY_PREFIX}teacher.${evalId}`;
const assessmentKey = (evalId: string) => `${KEY_PREFIX}assessments.${evalId}`;

/**
 * Resolves an intake token from the URL to a known evaluation id.
 * Preserves "demo" as an alias for Maya (ev-001).
 */
export function resolveEvalIdFromToken(token: string): string {
  if (token === "demo") return DEMO_EVAL_ID;
  return getEvaluation(token) ? token : DEMO_EVAL_ID;
}

export interface SubmittedField {
  name: string; // "Section > Question"
  values: string[];
}

export interface Submission {
  submittedAt: string;
  fields: SubmittedField[];
}

export interface AssessmentSubmission {
  submittedAt: string;
  entries: AssessmentEntry[];
  slpObservations: string;
  strengths: string;
  concerns: string;
  educationalImpact: string;
  speechSoundProfile?: string;
  oralMotor?: string;
  hearing?: string;
}

export interface SubmissionSection {
  title: string;
  fields: { label: string; values: string[] }[];
}

// ---------- storage cache (stable refs for useSyncExternalStore) ----------

const cache = new Map<string, unknown>();
let version = 0;
let resetVersion = 0;

function readKey<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function getFromCache<T>(key: string): T | null {
  if (!cache.has(key)) cache.set(key, readKey<T>(key));
  return (cache.get(key) as T | null) ?? null;
}

function getVersion(): number {
  return version;
}
function getResetVersion(): number {
  return resetVersion;
}
function serverZero(): number {
  return 0;
}

const listeners = new Set<() => void>();
function emit() {
  version += 1;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(KEY_PREFIX)) {
      cache.clear();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

// ---------- public API ----------

export function saveParentSubmission(evalId: string, fields: SubmittedField[]) {
  const sub: Submission = { submittedAt: new Date().toISOString(), fields };
  const key = parentKey(evalId);
  window.localStorage.setItem(key, JSON.stringify(sub));
  cache.set(key, sub);
  emit();
}

export function saveTeacherSubmission(evalId: string, fields: SubmittedField[]) {
  const sub: Submission = { submittedAt: new Date().toISOString(), fields };
  const key = teacherKey(evalId);
  window.localStorage.setItem(key, JSON.stringify(sub));
  cache.set(key, sub);
  emit();
}

export function saveAssessmentSubmission(
  evalId: string,
  data: Omit<AssessmentSubmission, "submittedAt">,
) {
  const sub: AssessmentSubmission = { ...data, submittedAt: new Date().toISOString() };
  const key = assessmentKey(evalId);
  window.localStorage.setItem(key, JSON.stringify(sub));
  cache.set(key, sub);
  emit();
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  // Clear every submission key we own, for every known evaluation and any
  // legacy keys still lingering from earlier demo sessions.
  const keysToRemove = new Set<string>();
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) keysToRemove.add(k);
    }
  } catch {
    // ignore
  }
  for (const ev of evaluations) {
    keysToRemove.add(parentKey(ev.id));
    keysToRemove.add(teacherKey(ev.id));
    keysToRemove.add(assessmentKey(ev.id));
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  cache.clear();
  resetVersion += 1;
  emit();
}

export function useParentSubmission(evalId: string): Submission | null {
  const v = useSyncExternalStore(subscribe, getVersion, serverZero);
  return useMemo(() => getFromCache<Submission>(parentKey(evalId)), [evalId, v]);
}
export function useTeacherSubmission(evalId: string): Submission | null {
  const v = useSyncExternalStore(subscribe, getVersion, serverZero);
  return useMemo(() => getFromCache<Submission>(teacherKey(evalId)), [evalId, v]);
}

export function useAssessmentSubmission(evalId: string): AssessmentSubmission | null {
  const v = useSyncExternalStore(subscribe, getVersion, serverZero);
  return useMemo(
    () => getFromCache<AssessmentSubmission>(assessmentKey(evalId)),
    [evalId, v],
  );
}

/**
 * Returns a number that increments every time resetDemoData() is called.
 * Components can use it as an effect key to clear locally-derived state
 * (e.g. generated drafts held only in React state).
 */
export function useDemoResetVersion() {
  return useSyncExternalStore(subscribe, getResetVersion, serverZero);
}

/**
 * All evaluations with any locally-submitted parent/teacher intake applied
 * to that specific student. Every sample evaluation is independently
 * updatable so multiple demo scenarios work.
 */
export function useDemoEvaluations(): Evaluation[] {
  const v = useSyncExternalStore(subscribe, getVersion, serverZero);
  return useMemo(
    () =>
      evaluations.map((e) =>
        applySubmissionsToEval(e, {
          parent: getFromCache<Submission>(parentKey(e.id)),
          teacher: getFromCache<Submission>(teacherKey(e.id)),
          assessment: getFromCache<AssessmentSubmission>(assessmentKey(e.id)),
        }),
      ),
    [v],
  );
}

// ---------- serialization + display helpers ----------

/**
 * Collects every named form control whose name starts with "Q:" into a
 * deduped list of {name, values[]}. Empty values are dropped.
 */
export function serializeIntakeForm(form: HTMLFormElement): SubmittedField[] {
  const fd = new FormData(form);
  const seen = new Map<string, string[]>();
  for (const [rawKey, rawVal] of fd.entries()) {
    if (!rawKey.startsWith("Q:")) continue;
    const key = rawKey.slice(2);
    const value = typeof rawVal === "string" ? rawVal.trim() : "";
    if (!value) continue;
    const arr = seen.get(key) ?? [];
    arr.push(value);
    seen.set(key, arr);
  }
  return [...seen.entries()].map(([name, values]) => ({ name, values }));
}

export function groupSubmissionBySection(sub: Submission): SubmissionSection[] {
  const groups = new Map<string, { label: string; values: string[] }[]>();
  for (const f of sub.fields) {
    const idx = f.name.indexOf(" > ");
    const title = idx >= 0 ? f.name.slice(0, idx) : "Other";
    const label = idx >= 0 ? f.name.slice(idx + 3) : f.name;
    const arr = groups.get(title) ?? [];
    arr.push({ label, values: f.values });
    groups.set(title, arr);
  }
  return [...groups.entries()].map(([title, fields]) => ({ title, fields }));
}

export function formatSubmittedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Merge session submissions into an evaluation. Only affects ev-001; other
 * evaluations keep their mock defaults.
 */
export function applySubmissionsToEval(
  ev: Evaluation,
  subs: {
    parent: Submission | null;
    teacher: Submission | null;
    assessment?: AssessmentSubmission | null;
  },
): Evaluation {
  let next = ev;
  if (subs.parent) {
    next = {
      ...next,
      parent: {
        ...next.parent,
        submitted: true,
        submittedDate: formatSubmittedDate(subs.parent.submittedAt),
      },
    };
  }
  if (subs.teacher) {
    next = {
      ...next,
      teacher: {
        ...next.teacher,
        submitted: true,
        submittedDate: formatSubmittedDate(subs.teacher.submittedAt),
      },
    };
  }
  if (subs.assessment) {
    const a = subs.assessment;
    next = {
      ...next,
      assessments: {
        ...next.assessments,
        entries: a.entries,
        slpObservations: a.slpObservations,
        strengths: a.strengths,
        concerns: a.concerns,
        educationalImpact: a.educationalImpact,
        speechSoundProfile: a.speechSoundProfile ?? next.assessments.speechSoundProfile,
        oralMotor: a.oralMotor ?? next.assessments.oralMotor,
        hearing: a.hearing ?? next.assessments.hearing,
      },
    };
  }
  const derived = deriveEvaluationState(next);
  return { ...next, ...derived };
}