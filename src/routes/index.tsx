import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/novi/AppShell";
import { StatusBadge } from "@/components/novi/StatusBadge";
import { isDueWithinOneWeek, type Evaluation } from "@/lib/mock-data";
import { useDemoEvaluations } from "@/lib/demo-store";
import { AlertCircle, ArrowRight, CalendarClock, Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SLP Dashboard — Novi" },
      {
        name: "description",
        content:
          "Novi helps school-based Speech-Language Pathologists manage evaluations, missing information, and AI-assisted report drafts.",
      },
      { property: "og:title", content: "SLP Dashboard — Novi" },
      {
        property: "og:description",
        content: "Novi helps school-based Speech-Language Pathologists manage evaluations, missing information, and AI-assisted report drafts.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const evaluations = useDemoEvaluations();
  const active = evaluations.length;
  const missingInfo = evaluations.filter(
    (e) =>
      e.status === "Missing information" ||
      e.status === "Waiting on parent" ||
      e.status === "Waiting on teacher",
  ).length;
  const dueSoon = evaluations.filter((e) => isDueWithinOneWeek(e)).length;
  const ready = evaluations.filter((e) => e.status === "Ready to generate").length;
  const inReview = evaluations.filter((e) => e.status === "Draft in review").length;

  const stats = [
    { label: "Active evaluations", value: active, tone: "text-foreground" },
    { label: "Missing information", value: missingInfo, tone: "text-rose-700" },
    { label: "Due within one week", value: dueSoon, tone: "text-amber-700" },
    { label: "Ready to generate", value: ready, tone: "text-emerald-700" },
    { label: "Drafts in review", value: inReview, tone: "text-indigo-700" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Evaluations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track active evaluations, missing information, and drafts ready for review.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Today · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className={`mt-2 text-3xl font-semibold ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Active caseload</h2>
            <span className="text-xs text-muted-foreground">
              {evaluations.length} evaluations
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Student</th>
                  <th className="px-4 py-2 font-medium">Grade</th>
                  <th className="px-4 py-2 font-medium">School</th>
                  <th className="px-4 py-2 font-medium">Evaluation type</th>
                  <th className="px-4 py-2 font-medium">Due date</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Missing items</th>
                  <th className="px-4 py-2 font-medium">Next action</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev) => (
                  <tr
                    key={ev.id}
                    className="group border-b border-border last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/evaluations/$id"
                        params={{ id: ev.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {ev.firstName} {ev.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ev.grade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ev.school}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ev.evaluationType}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ev.dueDate}</td>
                    <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                    <td className="px-4 py-3">
                      {ev.missingItems.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Sparkles className="h-3.5 w-3.5" /> Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {ev.missingItems.join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground/90">{ev.nextAction}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <RowAction ev={ev} />
                        <Link
                          to="/evaluations/$id"
                          params={{ id: ev.id }}
                          className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                        >
                          Open <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Demo prototype using fictional data. Novi supports SLP clinical judgment — it does not
          make eligibility decisions.
        </p>
      </div>
    </AppShell>
  );
}

function copyIntakeLink(kind: "parent" | "teacher", evalId: string) {
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

function IntakeRowAction({ kind, evalId }: { kind: "parent" | "teacher"; evalId: string }) {
  const to = kind === "parent" ? "/parent-intake/$token" : "/teacher-intake/$token";
  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => copyIntakeLink(kind, evalId)}
        className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
      >
        <Copy className="h-3.5 w-3.5" /> Copy {kind} link
      </button>
      <Link
        to={to}
        params={{ token: evalId }}
        target="_blank"
        className="text-xs font-medium text-primary hover:underline"
      >
        Preview
      </Link>
    </div>
  );
}

function RowAction({ ev }: { ev: Evaluation }) {
  const parentMissing = ev.missingItems.includes("Parent questionnaire");
  const teacherMissing = ev.missingItems.includes("Teacher questionnaire");
  const assessmentsMissing =
    ev.missingItems.includes("Assessment scores") ||
    ev.missingItems.includes("SLP observations");
  switch (ev.status) {
    case "Missing information":
      return (
        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
          {parentMissing && (
            <button
              type="button"
              onClick={() => copyIntakeLink("parent", ev.id)}
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" /> Parent
            </button>
          )}
          {teacherMissing && (
            <button
              type="button"
              onClick={() => copyIntakeLink("teacher", ev.id)}
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" /> Teacher
            </button>
          )}
          {assessmentsMissing && !parentMissing && !teacherMissing && (
            <Link
              to="/evaluations/$id"
              params={{ id: ev.id }}
              className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <CalendarClock className="h-3.5 w-3.5" /> Add assessments
            </Link>
          )}
        </div>
      );
    case "Waiting on parent":
      return <IntakeRowAction kind="parent" evalId={ev.id} />;
    case "Waiting on teacher":
      return <IntakeRowAction kind="teacher" evalId={ev.id} />;
    case "Ready to generate":
      return (
        <Link
          to="/evaluations/$id"
          params={{ id: ev.id }}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Sparkles className="h-3.5 w-3.5" /> Generate draft
        </Link>
      );
    case "Draft in review":
      return (
        <Link
          to="/evaluations/$id"
          params={{ id: ev.id }}
          className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
        >
          Review draft
        </Link>
      );
    default:
      return null;
  }
}
