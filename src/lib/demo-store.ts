import { useMemo, useSyncExternalStore } from "react";
import { deriveEvaluationState, evaluations, type Evaluation } from "./mock-data";

const PARENT_KEY = "novi.demo.parent.ev-001";
const TEACHER_KEY = "novi.demo.teacher.ev-001";
export const DEMO_EVAL_ID = "ev-001";

export interface SubmittedField {
  name: string; // "Section > Question"
  values: string[];
}

export interface Submission {
  submittedAt: string;
  fields: SubmittedField[];
}

export interface SubmissionSection {
  title: string;
  fields: { label: string; values: string[] }[];
}

// ---------- storage cache (stable refs for useSyncExternalStore) ----------

let cachedParent: Submission | null | undefined;
let cachedTeacher: Submission | null | undefined;
let resetVersion = 0;

function readKey(key: string): Submission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Submission) : null;
  } catch {
    return null;
  }
}

function ensureLoaded() {
  if (cachedParent === undefined) cachedParent = readKey(PARENT_KEY);
  if (cachedTeacher === undefined) cachedTeacher = readKey(TEACHER_KEY);
}

function getParentSnapshot(): Submission | null {
  ensureLoaded();
  return cachedParent ?? null;
}
function getTeacherSnapshot(): Submission | null {
  ensureLoaded();
  return cachedTeacher ?? null;
}
function getResetVersion(): number {
  return resetVersion;
}
function getServerSnapshot(): Submission | null {
  return null;
}
function getResetServerSnapshot(): number {
  return 0;
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PARENT_KEY || e.key === TEACHER_KEY || e.key === null) {
      cachedParent = undefined;
      cachedTeacher = undefined;
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

export function saveParentSubmission(fields: SubmittedField[]) {
  const sub: Submission = { submittedAt: new Date().toISOString(), fields };
  window.localStorage.setItem(PARENT_KEY, JSON.stringify(sub));
  cachedParent = sub;
  emit();
}

export function saveTeacherSubmission(fields: SubmittedField[]) {
  const sub: Submission = { submittedAt: new Date().toISOString(), fields };
  window.localStorage.setItem(TEACHER_KEY, JSON.stringify(sub));
  cachedTeacher = sub;
  emit();
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PARENT_KEY);
  window.localStorage.removeItem(TEACHER_KEY);
  cachedParent = null;
  cachedTeacher = null;
  resetVersion += 1;
  emit();
}

export function useParentSubmission() {
  return useSyncExternalStore(subscribe, getParentSnapshot, getServerSnapshot);
}
export function useTeacherSubmission() {
  return useSyncExternalStore(subscribe, getTeacherSnapshot, getServerSnapshot);
}

/**
 * Returns a number that increments every time resetDemoData() is called.
 * Components can use it as an effect key to clear locally-derived state
 * (e.g. generated drafts held only in React state).
 */
export function useDemoResetVersion() {
  return useSyncExternalStore(subscribe, getResetVersion, getResetServerSnapshot);
}

/**
 * All evaluations with any locally-submitted parent/teacher intake applied
 * to the demo student (ev-001). Keeps the dashboard consistent with the
 * workspace.
 */
export function useDemoEvaluations(): Evaluation[] {
  const parent = useParentSubmission();
  const teacher = useTeacherSubmission();
  return useMemo(
    () => evaluations.map((e) => applySubmissionsToEval(e, { parent, teacher })),
    [parent, teacher],
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
  subs: { parent: Submission | null; teacher: Submission | null },
): Evaluation {
  if (ev.id !== DEMO_EVAL_ID) return ev;
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
  const derived = deriveEvaluationState(next);
  return { ...next, ...derived };
}