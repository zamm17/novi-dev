import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
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
} from "@/lib/mock-data";

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

function WorkspacePage() {
  const { ev } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("Overview");

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
              {tab === "Overview" && <OverviewTab ev={ev} onGoDraft={() => setTab("AI Draft")} />}
              {tab === "Student Details" && <StudentDetailsTab ev={ev} />}
              {tab === "Parent Input" && <ParentTab ev={ev} />}
              {tab === "Teacher Input" && <TeacherTab ev={ev} />}
              {tab === "Assessments & Observations" && <AssessmentsTab ev={ev} />}
              {tab === "AI Draft" && <DraftTab ev={ev} />}
            </div>
          </div>

          <aside className="space-y-4">
            <ChecklistCard ev={ev} />
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Demo prototype using fictional data. Novi assists — the SLP determines eligibility and
              clinical recommendations.
            </div>
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

function ChecklistCard({ ev }: { ev: Evaluation }) {
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
        {required.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-sm">
            {c.complete ? (
              <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
            )}
            <span className={c.complete ? "text-foreground/80" : "font-medium text-foreground"}>
              {c.label}
            </span>
          </li>
        ))}
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

function copyLink(kind: "parent" | "teacher") {
  toast.success(`Demo ${kind} link copied.`);
}

function OverviewTab({ ev, onGoDraft }: { ev: Evaluation; onGoDraft: () => void }) {
  const ready = isReadyForDraft(ev);
  const missing = getChecklist(ev).filter((c) => c.required && !c.complete);
  const scoresComplete = ev.assessments.entries.length > 0;
  const obsComplete = Boolean(ev.assessments.slpObservations);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        title="Parent intake"
        right={
          <button
            type="button"
            onClick={() => copyLink("parent")}
            className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
          >
            <Copy className="h-3.5 w-3.5" /> Copy parent link
          </button>
        }
      >
        {ev.parent.submitted ? (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="h-4 w-4" /> Submitted {ev.parent.submittedDate}
            </div>
            <p className="mt-2 text-muted-foreground">
              Parent questionnaire is complete and available in the Parent Input tab.
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
          <button
            type="button"
            onClick={() => copyLink("teacher")}
            className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
          >
            <Copy className="h-3.5 w-3.5" /> Copy teacher link
          </button>
        }
      >
        {ev.teacher.submitted ? (
          <div className="text-sm">
            <div className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="h-4 w-4" /> Submitted {ev.teacher.submittedDate}
            </div>
            <p className="mt-2 text-muted-foreground">
              Teacher questionnaire is complete and available in the Teacher Input tab.
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
              onClick={() => {
                toast.success("Draft generation simulated. Opening AI Draft tab.");
                onGoDraft();
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" /> Generate evaluation draft
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
}: {
  who: "Parent" | "Teacher";
  onCopy: () => void;
  blockers: string[];
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

function ParentTab({ ev }: { ev: Evaluation }) {
  return (
    <Card
      title="Parent questionnaire"
      right={
        <span className="text-xs text-muted-foreground">
          {ev.parent.submitted ? `Submitted ${ev.parent.submittedDate}` : "Pending"}
        </span>
      }
    >
      {ev.parent.submitted ? (
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
          onCopy={() => copyLink("parent")}
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

function TeacherTab({ ev }: { ev: Evaluation }) {
  return (
    <Card
      title="Teacher questionnaire"
      right={
        <span className="text-xs text-muted-foreground">
          {ev.teacher.submitted ? `Submitted ${ev.teacher.submittedDate}` : "Pending"}
        </span>
      }
    >
      {ev.teacher.submitted ? (
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
          onCopy={() => copyLink("teacher")}
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
  const hasEntries = ev.assessments.entries.length > 0;
  return (
    <div className="space-y-4">
      <Card title="Assessment scores">
        {hasEntries ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Assessment</th>
                  <th className="py-2 pr-3 font-medium">Standard score</th>
                  <th className="py-2 pr-3 font-medium">Percentile</th>
                  <th className="py-2 font-medium">Notes / interpretation</th>
                </tr>
              </thead>
              <tbody>
                {ev.assessments.entries.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0 align-top">
                    <td className="py-2 pr-3 font-medium">{a.name}</td>
                    <td className="py-2 pr-3">{a.standardScore}</td>
                    <td className="py-2 pr-3">{a.percentile}</td>
                    <td className="py-2 text-muted-foreground">{a.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Info className="mr-1 inline h-4 w-4" />
            No assessment scores entered yet. Add scores here — a draft can't be generated without
            them.
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

function DraftTab({ ev }: { ev: Evaluation }) {
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
              <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-rose-900">
                {missing.map((m) => (
                  <li key={m.label}>{m.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const d = ev.draft ?? {
    background: `${ev.firstName} ${ev.lastName} is a ${ev.grade}-grade student at ${ev.school} referred for a speech-language evaluation.`,
    reasonForReferral: ev.referralReason,
    parentInputSummary: ev.parent.concerns ?? "",
    teacherInputSummary: ev.teacher.classroomConcerns ?? "",
    assessmentResults: ev.assessments.entries
      .map((a) => `${a.name}: SS ${a.standardScore}, %ile ${a.percentile}. ${a.notes}`)
      .join("\n"),
    presentLevels: ev.assessments.strengths,
    interpretation:
      "Results should be interpreted in the context of parent, teacher, and clinician information. Eligibility is determined by the IEP team.",
    recommendations:
      "The IEP team should consider the student's need for specially designed instruction based on the findings above.",
    summary: `Summary of ${ev.firstName}'s evaluation for team discussion.`,
  };

  const sections: { key: keyof typeof d; label: string; rows?: number }[] = [
    { key: "background", label: "Background" },
    { key: "reasonForReferral", label: "Reason for referral" },
    { key: "parentInputSummary", label: "Parent input summary", rows: 4 },
    { key: "teacherInputSummary", label: "Teacher input summary", rows: 4 },
    { key: "assessmentResults", label: "Assessment results", rows: 5 },
    { key: "presentLevels", label: "Present levels", rows: 4 },
    { key: "interpretation", label: "Interpretation", rows: 4 },
    { key: "recommendations", label: "Recommendations", rows: 4 },
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
        {sections.map((s) => (
          <div key={s.key} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </span>
              <textarea
                defaultValue={d[s.key]}
                rows={s.rows ?? 3}
                className="w-full rounded-md border border-input bg-background p-2 text-sm outline-none ring-ring/40 focus:ring-2"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}