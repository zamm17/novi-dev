import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Circle,
  Copy,
  Sparkles,
  Save,
  RefreshCw,
  ClipboardCopy,
  Info,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/novi/AppShell";
import { StatusBadge } from "@/components/novi/StatusBadge";
import {
  getEvaluation,
  getChecklist,
  isReadyForDraft,
  workflowSteps,
  type Evaluation,
  type WorkflowStep,
  type AssessmentEntry,
  type DraftSections,
} from "@/lib/mock-data";
import {
  applySubmissionsToEval,
  groupSubmissionBySection,
  resetDemoData,
  saveAssessmentSubmission,
  useAssessmentSubmission,
  useParentSubmission,
  useTeacherSubmission,
  useDemoResetVersion,
  type Submission,
} from "@/lib/demo-store";
import {
  buildDraftFromPayload,
  buildEvaluationDraftPayload,
} from "@/lib/draft-payload";

export const Route = createFileRoute("/evaluations/$id")({
  loader: ({ params }) => {
    const ev = getEvaluation(params.id);
    if (!ev) throw notFound();
    return { ev };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.ev.firstName} ${loaderData.ev.lastName} — Novi`
          : "Evaluation — Novi",
      },
      {
        name: "description",
        content: "Evaluation workspace: track intake, assessments, and AI-assisted drafts.",
      },
    ],
  }),
  component: WorkspacePage,
});

const tabs = [
  "Overview",
  "Student Details",
  "Parent Input",
  "Teacher Input",
  "Assessments & Observations",
  "AI Draft",
] as const;
type Tab = (typeof tabs)[number];

// Map required checklist items -> destination tab + why it matters
const missingItemMeta: Record<
  string,
  { tab: Tab; why: string; action: string }
> = {
  "Student demographics": {
    tab: "Student Details",
    why: "Identifies the student and frames the report header.",
    action: "Go to student details",
  },
  "Referral reason": {
    tab: "Student Details",
    why: "Anchors the Reason for Referral section of the report.",
    action: "Go to student details",
  },
  "Parent questionnaire": {
    tab: "Parent Input",
    why: "Provides developmental, medical, and home-language history.",
    action: "Open parent input",
  },
  "Teacher questionnaire": {
    tab: "Teacher Input",
    why: "Provides classroom impact and functional communication data.",
    action: "Open teacher input",
  },
  "Assessment scores": {
    tab: "Assessments & Observations",
    why: "Required for the Assessment Results and Present Levels sections.",
    action: "Go to assessments",
  },
  "SLP observations": {
    tab: "Assessments & Observations",
    why: "Grounds interpretation and clinical impressions in the draft.",
    action: "Go to assessments",
  },
};

function WorkspacePage() {
  const { ev: baseEv } = Route.useLoaderData();
  const parentSub = useParentSubmission(baseEv.id);
  const teacherSub = useTeacherSubmission(baseEv.id);
  const assessmentSub = useAssessmentSubmission(baseEv.id);
  const resetVersion = useDemoResetVersion();
  const ev = useMemo(
    () =>
      applySubmissionsToEval(baseEv, {
        parent: parentSub,
        teacher: teacherSub,
        assessment: assessmentSub,
      }),
    [baseEv, parentSub, teacherSub, assessmentSub],
  );
  const [tab, setTab] = useState<Tab>("Overview");
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<DraftSections | null>(null);

  // Clear any locally generated draft when the demo is reset.
  useEffect(() => {
    setGeneratedDraft(null);
    setTab("Overview");
  }, [resetVersion]);

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    (async () => {
      // Preserve mock draft behavior for pre-seeded evaluations.
      if (ev.draft) {
        await new Promise((r) => setTimeout(r, 800));
        setGeneratedDraft(ev.draft);
        setGenerating(false);
        setTab("AI Draft");
        toast.success("Draft generated for SLP review");
        return;
      }
      const payload = buildEvaluationDraftPayload(ev, parentSub, teacherSub);
      const { generateEvaluationDraft } = await import("@/lib/generate-draft");
      const result = await generateEvaluationDraft(payload);
      setGeneratedDraft(result.draft);
      setGenerating(false);
      setTab("AI Draft");
      if (result.source === "edge-function") {
        toast.success("Draft generated for SLP review");
      } else {
        if (result.error) console.warn("[Novi] Draft generation fallback:", result.error);
        toast.message("Using local demo draft", {
          description:
            "AI generation was unavailable, so Novi used the prototype fallback.",
        });
      }
    })();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <StudentHeader ev={ev} />
        <WorkflowProgress current={ev.currentStep} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <TabBar tab={tab} setTab={setTab} />
            <div className="mt-4">
              {tab === "Overview" && (
                <OverviewTab
                  ev={ev}
                  setTab={setTab}
                  onGenerate={handleGenerate}
                  generating={generating}
                  hasGenerated={Boolean(generatedDraft)}
                  sessionParent={parentSub}
                  sessionTeacher={teacherSub}
                />
              )}
              {tab === "Student Details" && <StudentDetailsTab ev={ev} />}
              {tab === "Parent Input" && <ParentTab ev={ev} sessionSub={parentSub} />}
              {tab === "Teacher Input" && <TeacherTab ev={ev} sessionSub={teacherSub} />}
              {tab === "Assessments & Observations" && <AssessmentsTab ev={ev} />}
              {tab === "AI Draft" && (
                <DraftTab
                  ev={ev}
                  setTab={setTab}
                  generatedDraft={generatedDraft}
                  onGenerate={handleGenerate}
                  generating={generating}
                  parentSub={parentSub}
                  teacherSub={teacherSub}
                />
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <ChecklistCard ev={ev} setTab={setTab} />
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Demo prototype using fictional data. Novi assists — the SLP determines eligibility and
              clinical recommendations.
            </div>
            <ResetDemoButton />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function StudentHeader({ ev }: { ev: Evaluation }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {ev.firstName} {ev.lastName}
            </h1>
            <StatusBadge status={ev.status} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm md:grid-cols-3 lg:grid-cols-6">
            <Field label="Grade" value={ev.grade} />
            <Field label="School" value={ev.school} />
            <Field label="DOB" value={ev.dob} />
            <Field label="Evaluation" value={ev.evaluationType} />
            <Field label="Due" value={ev.dueDate} />
            <Field label="Language" value={ev.primaryLanguage} />
          </dl>
          <div className="mt-3 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Referral reason
            </div>
            <p className="mt-1 max-w-3xl text-foreground/90">{ev.referralReason}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="text-sm">
          <span className="font-medium">Next best action: </span>
          <span className="text-foreground/90">{ev.nextAction}</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function WorkflowProgress({ current }: { current: WorkflowStep }) {
  const idx = workflowSteps.indexOf(current);
  return (
    <ol className="mt-4 flex flex-wrap items-center gap-y-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      {workflowSteps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                done
                  ? "bg-emerald-100 text-emerald-800"
                  : active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/40 text-[10px] font-semibold">
                {i + 1}
              </span>
              {s}
            </div>
            {i < workflowSteps.length - 1 && (
              <span className="mx-1 h-px w-6 bg-border md:w-10" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ChecklistCard({ ev, setTab }: { ev: Evaluation; setTab: (t: Tab) => void }) {
  const list = getChecklist(ev);
  const required = list.filter((c) => c.required);
  const optional = list.filter((c) => !c.required);
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold">Missing information</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Required items must be complete before generating a draft.
      </p>
      <ul className="mt-3 space-y-2">
        {required.map((c) => {
          const meta = missingItemMeta[c.label];
          return (
            <li key={c.label} className="text-sm">
              <div className="flex items-start gap-2">
                {c.complete ? (
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                )}
                <span
                  className={
                    c.complete ? "text-foreground/80" : "font-medium text-foreground"
                  }
                >
                  {c.label}
                </span>
              </div>
              {!c.complete && meta && (
                <div className="ml-6 mt-1">
                  <p className="text-xs text-muted-foreground">{meta.why}</p>
                  <button
                    type="button"
                    onClick={() => setTab(meta.tab)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {meta.action} <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-border pt-3">
        <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Optional</div>
        <ul className="space-y-2">
          {optional.map((c) => (
            <li key={c.label} className="flex items-start gap-2 text-sm">
              {c.complete ? (
                <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-foreground/80">{c.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative px-3 py-2 text-sm transition-colors ${
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {active && (
                <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function copyLink(kind: "parent" | "teacher", evalId: string) {
  const path =
    kind === "parent" ? `/parent-intake/${evalId}` : `/teacher-intake/${evalId}`;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(url).catch(() => {});
  }
  toast.success(`${kind === "parent" ? "Parent" : "Teacher"} link copied`, {
    description: url,
  });
}

function NextActionPanel({
  ev,
  setTab,
  onGenerate,
  generating,
  hasGenerated,
}: {
  ev: Evaluation;
  setTab: (t: Tab) => void;
  onGenerate: () => void;
  generating: boolean;
  hasGenerated: boolean;
}) {
  type ActionSpec = {
    label: string;
    icon: React.ReactNode;
    why: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };

  let actions: ActionSpec[];
  switch (ev.status) {
    case "Missing information": {
      const parentAction: ActionSpec = {
        label: "Copy parent link",
        icon: <Copy className="h-4 w-4" />,
        why: "Multiple required items are missing. Share the relevant intake links to collect background information.",
        onClick: () => copyLink("parent", ev.id),
      };
      const teacherAction: ActionSpec = {
        label: "Copy teacher link",
        icon: <Copy className="h-4 w-4" />,
        why: "Multiple required items are missing. Share the relevant intake links to collect background information.",
        onClick: () => copyLink("teacher", ev.id),
        variant: "secondary",
      };
      actions = [];
      if (!ev.parent.submitted) actions.push(parentAction);
      if (!ev.teacher.submitted) actions.push({
        ...teacherAction,
        variant: actions.length === 0 ? "primary" : "secondary",
      });
      const assessmentsMissing =
        ev.missingItems.includes("Assessment scores") ||
        ev.missingItems.includes("SLP observations");
      if (assessmentsMissing) {
        actions.push({
          label: "Go to assessments",
          icon: <ArrowRight className="h-4 w-4" />,
          why: "Standard scores and SLP observations are required for the Assessment Results and Present Levels sections.",
          onClick: () => setTab("Assessments & Observations"),
          variant: actions.length === 0 ? "primary" : "secondary",
        });
      }
      if (actions.length === 0) {
        actions = [{
          label: "Open student details",
          icon: <ArrowRight className="h-4 w-4" />,
          why: "Multiple required items are missing. Complete intake to unlock the rest of the workflow.",
          onClick: () => setTab("Student Details"),
        }];
      }
      break;
    }
    case "Waiting on parent":
      actions = [{
        label: "Copy parent link",
        icon: <Copy className="h-4 w-4" />,
        why: "Parent intake supplies developmental, medical, and home-language history the report requires.",
        onClick: () => copyLink("parent", ev.id),
      }];
      break;
    case "Waiting on teacher":
      actions = [{
        label: "Copy teacher link",
        icon: <Copy className="h-4 w-4" />,
        why: "Teacher input describes classroom impact and functional communication — key context for eligibility discussion.",
        onClick: () => copyLink("teacher", ev.id),
      }];
      break;
    case "Ready to generate":
      actions = [{
        label: generating ? "Generating…" : "Generate draft",
        icon: generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        ),
        why: "All required inputs are present. Novi will assemble an editable draft grounded in this workspace.",
        onClick: onGenerate,
      }];
      break;
    case "Draft in review":
      actions = [{
        label: "Review draft",
        icon: <ArrowRight className="h-4 w-4" />,
        why: "Draft sections are ready for SLP review and editing before the eligibility meeting.",
        onClick: () => setTab("AI Draft"),
      }];
      break;
    default:
      actions = [{
        label: "Open student details",
        icon: <ArrowRight className="h-4 w-4" />,
        why: "Complete intake to unlock the rest of the workflow.",
        onClick: () => setTab("Student Details"),
      }];
  }

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-primary">
            Next action
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {ev.nextAction}
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{actions[0].why}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((a, i) => {
            const secondary = a.variant === "secondary";
            return (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                disabled={generating}
                className={
                  secondary
                    ? "inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-70"
                    : "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                }
              >
                {a.icon} {a.label}
              </button>
            );
          })}
        </div>
      </div>
      {hasGenerated && ev.status === "Ready to generate" && (
        <p className="mt-2 text-xs text-emerald-700">
          Draft available in the AI Draft tab.
        </p>
      )}
    </div>
  );
}

function BlockingPanel({
  missing,
  setTab,
}: {
  missing: { label: string }[];
  setTab: (t: Tab) => void;
}) {
  if (missing.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-amber-900">
            Draft generation is blocked by {missing.length} required item
            {missing.length === 1 ? "" : "s"}.
          </div>
          <ul className="mt-3 space-y-2">
            {missing.map((m) => {
              const meta = missingItemMeta[m.label];
              return (
                <li
                  key={m.label}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-amber-200 bg-white p-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{m.label}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {meta?.why ?? "Required to generate a complete draft."}
                    </p>
                  </div>
                  {meta && (
                    <button
                      type="button"
                      onClick={() => setTab(meta.tab)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      {meta.action} <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  ev,
  setTab,
  onGenerate,
  generating,
  hasGenerated,
  sessionParent,
  sessionTeacher,
}: {
  ev: Evaluation;
  setTab: (t: Tab) => void;
  onGenerate: () => void;
  generating: boolean;
  hasGenerated: boolean;
  sessionParent: Submission | null;
  sessionTeacher: Submission | null;
}) {
  const missing = getChecklist(ev).filter((c) => c.required && !c.complete);
  const ready = missing.length === 0;
  const scoresComplete = ev.assessments.entries.length > 0;
  const obsComplete = Boolean(ev.assessments.slpObservations);

  return (
    <div className="space-y-4">
      <NextActionPanel
        ev={ev}
        setTab={setTab}
        onGenerate={onGenerate}
        generating={generating}
        hasGenerated={hasGenerated}
      />
      {!ready && <BlockingPanel missing={missing} setTab={setTab} />}
      <div className="grid gap-4 md:grid-cols-2">
      <Card
        title="Parent intake"
        right={
          <div className="flex items-center gap-1.5">
            <Link
              to="/parent-intake/$token"
              params={{ token: ev.id }}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
            >
              Preview form
            </Link>
            <button
              type="button"
              onClick={() => copyLink("parent", ev.id)}
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" /> Copy parent link
            </button>
          </div>
        }
      >
        {ev.parent.submitted ? (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="h-4 w-4" /> Submitted {ev.parent.submittedDate}
            </div>
            <p className="mt-2 text-muted-foreground">
              {sessionParent
                ? "Submitted in this browser. Available in the Parent Input tab."
                : "Parent questionnaire is complete and available in the Parent Input tab."}
            </p>
          </div>
        ) : (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Not submitted yet
            </div>
            <p className="mt-2 text-muted-foreground">
              Copy the parent link and share via your usual channel.
            </p>
          </div>
        )}
      </Card>

      <Card
        title="Teacher intake"
        right={
          <div className="flex items-center gap-1.5">
            <Link
              to="/teacher-intake/$token"
              params={{ token: ev.id }}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
            >
              Preview form
            </Link>
            <button
              type="button"
              onClick={() => copyLink("teacher", ev.id)}
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" /> Copy teacher link
            </button>
          </div>
        }
      >
        {ev.teacher.submitted ? (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="h-4 w-4" /> Submitted {ev.teacher.submittedDate}
            </div>
            <p className="mt-2 text-muted-foreground">
              {sessionTeacher
                ? "Submitted in this browser. Available in the Teacher Input tab."
                : "Teacher questionnaire is complete and available in the Teacher Input tab."}
            </p>
          </div>
        ) : (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Not submitted yet
            </div>
            <p className="mt-2 text-muted-foreground">
              Copy the teacher link and share with the classroom teacher.
            </p>
          </div>
        )}
      </Card>

      <Card title="Assessment info">
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center gap-2">
            {scoresComplete ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            Assessment scores {scoresComplete ? "recorded" : "not yet entered"}
          </li>
          <li className="flex items-center gap-2">
            {obsComplete ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            SLP observations {obsComplete ? "recorded" : "not yet entered"}
          </li>
        </ul>
      </Card>

      <Card title="Draft readiness">
        {ready ? (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="h-4 w-4" /> Ready to generate
            </div>
            <p className="mt-2 text-muted-foreground">
              All required information is present. Generated text is fully editable.
            </p>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}{" "}
              {generating ? "Generating…" : "Generate evaluation draft"}
            </button>
          </div>
        ) : (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-rose-700">
              <AlertTriangle className="h-4 w-4" /> Generation blocked
            </div>
            <p className="mt-2 text-muted-foreground">Missing required items:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground/90">
              {missing.map((m) => (
                <li key={m.label}>{m.label}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="h-9 rounded-md border border-input bg-background px-3 outline-none ring-ring/40 focus:ring-2"
      />
    </label>
  );
}

function LabeledTextarea({
  label,
  defaultValue,
  rows = 3,
}: {
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm md:col-span-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <textarea
        defaultValue={defaultValue}
        rows={rows}
        className="rounded-md border border-input bg-background p-2 outline-none ring-ring/40 focus:ring-2"
      />
    </label>
  );
}

function StudentDetailsTab({ ev }: { ev: Evaluation }) {
  return (
    <Card title="Student details">
      <div className="grid gap-3 md:grid-cols-2">
        <LabeledInput label="First name" defaultValue={ev.firstName} />
        <LabeledInput label="Last name" defaultValue={ev.lastName} />
        <LabeledInput label="Date of birth" defaultValue={ev.dob} type="date" />
        <LabeledInput label="Grade" defaultValue={ev.grade} />
        <LabeledInput label="School" defaultValue={ev.school} />
        <LabeledInput label="Primary language" defaultValue={ev.primaryLanguage} />
        <LabeledInput label="Evaluation type" defaultValue={ev.evaluationType} />
        <LabeledInput label="Consent received date" defaultValue={ev.consentDate} type="date" />
        <LabeledInput label="Evaluation due date" defaultValue={ev.dueDate} type="date" />
        <LabeledTextarea label="Referral reason" defaultValue={ev.referralReason} />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => toast.success("Student details saved (demo).")}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>
    </Card>
  );
}

function IntakeSection({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <p className="mt-1 text-sm text-foreground/90">{value}</p>
    </div>
  );
}

function PendingIntake({
  who,
  onCopy,
  blockers,
  evalId,
}: {
  who: "Parent" | "Teacher";
  onCopy: () => void;
  blockers: string[];
  evalId: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border p-6 text-center">
      <AlertTriangle className="mx-auto h-6 w-6 text-amber-600" />
      <div className="mt-2 text-sm font-medium">{who} form not submitted yet</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Share the {who.toLowerCase()} link so they can complete the questionnaire.
      </p>
      <button
        type="button"
        onClick={onCopy}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Copy className="h-4 w-4" /> Copy {who.toLowerCase()} link
      </button>
      <div className="mt-2">
        <Link
          to={who === "Parent" ? "/parent-intake/$token" : "/teacher-intake/$token"}
          params={{ token: evalId }}
          target="_blank"
          className="text-xs font-medium text-primary hover:underline"
        >
          Preview {who.toLowerCase()} form →
        </Link>
      </div>
      {blockers.length > 0 && (
        <div className="mx-auto mt-4 max-w-md rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
          <div className="font-medium text-foreground">May block in the report:</div>
          <ul className="mt-1 list-disc pl-5">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ParentTab({ ev, sessionSub }: { ev: Evaluation; sessionSub: Submission | null }) {
  return (
    <Card
      title="Parent questionnaire"
      right={
        <span className="text-xs text-muted-foreground">
          {sessionSub
            ? `Submitted in this browser · ${ev.parent.submittedDate}`
            : ev.parent.submitted
              ? `Submitted ${ev.parent.submittedDate}`
              : "Pending"}
        </span>
      }
    >
      {sessionSub ? (
        <SessionResponses sub={sessionSub} />
      ) : ev.parent.submitted ? (
        <div className="grid gap-4 md:grid-cols-2">
          <IntakeSection label="Parent concerns" value={ev.parent.concerns} />
          <IntakeSection label="Developmental history" value={ev.parent.developmentalHistory} />
          <IntakeSection label="Medical history" value={ev.parent.medicalHistory} />
          <IntakeSection
            label="Communication background"
            value={ev.parent.communicationBackground}
          />
          <IntakeSection label="Home language / context" value={ev.parent.homeLanguageContext} />
          <IntakeSection label="Prior services" value={ev.parent.priorServices} />
        </div>
      ) : (
        <PendingIntake
          who="Parent"
          onCopy={() => copyLink("parent", ev.id)}
          evalId={ev.id}
          blockers={[
            "Developmental history",
            "Medical / hearing history",
            "Home language context",
          ]}
        />
      )}
    </Card>
  );
}

function TeacherTab({ ev, sessionSub }: { ev: Evaluation; sessionSub: Submission | null }) {
  return (
    <Card
      title="Teacher questionnaire"
      right={
        <span className="text-xs text-muted-foreground">
          {sessionSub
            ? `Submitted in this browser · ${ev.teacher.submittedDate}`
            : ev.teacher.submitted
              ? `Submitted ${ev.teacher.submittedDate}`
              : "Pending"}
        </span>
      }
    >
      {sessionSub ? (
        <SessionResponses sub={sessionSub} />
      ) : ev.teacher.submitted ? (
        <div className="grid gap-4 md:grid-cols-2">
          <IntakeSection label="Classroom concerns" value={ev.teacher.classroomConcerns} />
          <IntakeSection label="Academic impact" value={ev.teacher.academicImpact} />
          <IntakeSection
            label="Functional communication"
            value={ev.teacher.functionalCommunication}
          />
          <IntakeSection label="Behavior / social observations" value={ev.teacher.behaviorSocial} />
          <IntakeSection label="Examples" value={ev.teacher.examples} />
          <IntakeSection label="Supports tried" value={ev.teacher.supportsTried} />
        </div>
      ) : (
        <PendingIntake
          who="Teacher"
          onCopy={() => copyLink("teacher", ev.id)}
          evalId={ev.id}
          blockers={[
            "Classroom observations",
            "Academic impact",
            "Functional communication in the classroom",
          ]}
        />
      )}
    </Card>
  );
}

function AssessmentsTab({ ev }: { ev: Evaluation }) {
  const [entries, setEntries] = useState<AssessmentEntry[]>(ev.assessments.entries);

  const updateEntry = (i: number, patch: Partial<AssessmentEntry>) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };
  const removeEntry = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  };
  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { name: "", standardScore: "", percentile: "", notes: "" },
    ]);
  };

  return (
    <div className="space-y-4">
      <Card
        title="Assessment scores"
        right={
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Add assessment
          </button>
        }
      >
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Info className="mr-1 inline h-4 w-4" />
            No assessment scores entered yet. Add scores here — a draft can't be generated
            without them.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((a, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-md border border-border bg-background/40 p-3 md:grid-cols-[2fr_1fr_1fr_3fr_auto]"
              >
                <input
                  value={a.name}
                  onChange={(e) => updateEntry(i, { name: e.target.value })}
                  placeholder="CELF-5 Core Language"
                  aria-label="Assessment name"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/40 focus:ring-2"
                />
                <input
                  value={a.standardScore}
                  onChange={(e) => updateEntry(i, { standardScore: e.target.value })}
                  placeholder="85"
                  aria-label="Standard score"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/40 focus:ring-2"
                />
                <input
                  value={a.percentile}
                  onChange={(e) => updateEntry(i, { percentile: e.target.value })}
                  placeholder="16"
                  aria-label="Percentile"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/40 focus:ring-2"
                />
                <input
                  value={a.notes}
                  onChange={(e) => updateEntry(i, { notes: e.target.value })}
                  placeholder="Brief interpretation notes for the report"
                  aria-label="Notes"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/40 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  aria-label="Remove assessment"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEntry}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add another assessment
            </button>
          </div>
        )}
      </Card>

      <Card title="Observations & clinical notes">
        <div className="grid gap-3 md:grid-cols-2">
          <LabeledTextarea
            label="SLP observations"
            defaultValue={ev.assessments.slpObservations}
            rows={4}
          />
          <LabeledTextarea label="Student strengths" defaultValue={ev.assessments.strengths} />
          <LabeledTextarea label="Areas of concern" defaultValue={ev.assessments.concerns} />
          <LabeledTextarea
            label="Educational impact"
            defaultValue={ev.assessments.educationalImpact}
          />
        </div>
        {!ev.assessments.slpObservations && (
          <p className="mt-3 text-xs text-amber-700">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
            SLP observations are required before generating a draft.
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => toast.success("Assessments saved (demo).")}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </Card>
    </div>
  );
}

function buildDraft(
  ev: Evaluation,
  parentSub: Submission | null,
  teacherSub: Submission | null,
): DraftSections {
  if (ev.draft) return ev.draft;
  const payload = buildEvaluationDraftPayload(ev, parentSub, teacherSub);
  return buildDraftFromPayload(payload);
}

function ResetDemoButton() {
  return (
    <button
      type="button"
      onClick={() => {
        resetDemoData();
        toast.success("Demo data reset");
      }}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
    </button>
  );
}

function SessionResponses({ sub }: { sub: Submission }) {
  const sections = groupSubmissionBySection(sub);
  if (sections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Submitted, but no free-text answers were provided.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
        Submitted in this browser. Values below reflect what was entered on the shared
        questionnaire link.
      </div>
      {sections.map((s) => (
        <div key={s.title} className="rounded-md border border-border bg-background/40 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {s.title}
          </div>
          <dl className="mt-2 space-y-2">
            {s.fields.map((f) => (
              <div key={f.label} className="text-sm">
                <dt className="text-xs font-medium text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-foreground/90">
                  {f.values.join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

const draftSectionSources: Record<keyof DraftSections, string[]> = {
  evaluationInformation: ["Student details"],
  reasonForReferral: ["Referral reason", "Teacher input"],
  sourcesOfData: ["Parent intake", "Teacher input", "Assessments", "SLP observations"],
  backgroundAndHistory: ["Parent intake", "Student details"],
  parentInputSummary: ["Parent intake"],
  teacherInputSummary: ["Teacher input"],
  behavioralObservations: ["SLP observations"],
  testingConditionsAndValidity: ["SLP observations", "Student details"],
  assessmentResults: ["Assessment scores"],
  speechSoundProfile: ["Assessment scores", "SLP observations"],
  presentLevels: ["Assessment scores", "SLP observations", "Teacher input"],
  educationalImpact: ["Teacher input", "SLP observations"],
  interpretation: [
    "Assessment scores",
    "Parent intake",
    "Teacher input",
    "SLP observations",
  ],
  eligibilityConsiderations: ["All required inputs"],
  recommendations: ["SLP observations", "Educational impact"],
  summary: ["All required inputs"],
};

function DraftTab({
  ev,
  setTab,
  generatedDraft,
  onGenerate,
  generating,
  parentSub,
  teacherSub,
}: {
  ev: Evaluation;
  setTab: (t: Tab) => void;
  generatedDraft: DraftSections | null;
  onGenerate: () => void;
  generating: boolean;
  parentSub: Submission | null;
  teacherSub: Submission | null;
}) {
  const ready = isReadyForDraft(ev);
  const missing = getChecklist(ev).filter((c) => c.required && !c.complete);

  if (!ready) {
    return (
      <Card title="AI Draft">
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-700" />
            <div>
              <div className="font-medium text-rose-900">
                Draft generation is blocked.
              </div>
              <p className="mt-1 text-sm text-rose-900/80">
                Complete the required items below, then return here to generate an editable
                draft. Novi never makes eligibility decisions — the SLP remains the decision
                maker.
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {missing.map((m) => {
                  const meta = missingItemMeta[m.label];
                  return (
                    <li
                      key={m.label}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-rose-200 bg-white p-2.5"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{m.label}</div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {meta?.why ?? "Required for a complete draft."}
                        </p>
                      </div>
                      {meta && (
                        <button
                          type="button"
                          onClick={() => setTab(meta.tab)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                        >
                          {meta.action} <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const hasDraftContent = Boolean(generatedDraft || ev.draft);

  if (!hasDraftContent) {
    return (
      <Card title="AI Draft">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-emerald-700" />
          <div className="mt-2 text-sm font-medium text-emerald-900">
            Ready to generate
          </div>
          <p className="mx-auto mt-1 max-w-md text-sm text-emerald-900/80">
            All required information is complete. Generate an editable draft when
            you're ready. Novi assists — the SLP reviews and edits every section.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}{" "}
            {generating ? "Generating…" : "Generate draft"}
          </button>
        </div>
      </Card>
    );
  }

  const d: DraftSections = generatedDraft ?? buildDraft(ev, parentSub, teacherSub);

  const sections: { key: keyof DraftSections; label: string; rows?: number }[] = [
    { key: "evaluationInformation", label: "Evaluation information", rows: 3 },
    { key: "reasonForReferral", label: "Reason for referral", rows: 3 },
    { key: "sourcesOfData", label: "Sources of data", rows: 3 },
    { key: "backgroundAndHistory", label: "Background and history", rows: 5 },
    { key: "parentInputSummary", label: "Parent input summary", rows: 4 },
    { key: "teacherInputSummary", label: "Teacher input summary", rows: 4 },
    { key: "behavioralObservations", label: "Behavioral observations", rows: 4 },
    { key: "testingConditionsAndValidity", label: "Testing conditions and validity", rows: 3 },
    { key: "assessmentResults", label: "Assessment results", rows: 5 },
    { key: "speechSoundProfile", label: "Speech sound profile", rows: 4 },
    { key: "presentLevels", label: "Present levels of performance", rows: 4 },
    { key: "educationalImpact", label: "Educational impact", rows: 4 },
    { key: "interpretation", label: "Clinical interpretation", rows: 4 },
    { key: "eligibilityConsiderations", label: "Eligibility considerations (team decision)", rows: 4 },
    { key: "recommendations", label: "Recommendations", rows: 5 },
    { key: "summary", label: "Summary", rows: 4 },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-primary/25 bg-primary/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <div className="font-medium text-foreground">
              Draft generated by AI. SLP review and clinical judgment required.
            </div>
            <p className="mt-1 text-muted-foreground">
              Every section is editable. Novi does not determine eligibility.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Draft sections are based only on the information visible in this workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toast.success("Draft saved (demo).")}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4" /> Save draft
        </button>
        <button
          type="button"
          onClick={() => toast("Section regeneration simulated.")}
          className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" /> Regenerate section
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(sections.map((s) => `${s.label}\n${d[s.key]}`).join("\n\n"))
              .catch(() => {});
            toast.success("Report text copied to clipboard (demo).");
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <ClipboardCopy className="h-4 w-4" /> Copy report text
        </button>
      </div>

      <div className="space-y-3">
        {sections.map((s) => {
          const sources = draftSectionSources[s.key];
          return (
            <div key={s.key} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Sources
                  </span>
                  {sources.map((src) => (
                    <span
                      key={src}
                      className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                key={(generatedDraft ? "g-" : "s-") + s.key}
                defaultValue={d[s.key]}
                rows={s.rows ?? 3}
                className="w-full rounded-md border border-input bg-background p-2 text-sm outline-none ring-ring/40 focus:ring-2"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}