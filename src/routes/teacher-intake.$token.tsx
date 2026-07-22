import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Send, ArrowRight } from "lucide-react";
import {
  PortalShell,
  PortalCard,
  Field,
  Textarea,
  Input,
  Select,
  Required,
  CheckboxRow,
  FrequencyRow,
} from "@/components/novi/PortalShell";

export const Route = createFileRoute("/teacher-intake/$token")({
  head: () => ({
    meta: [
      { title: "Teacher questionnaire — Novi" },
      {
        name: "description",
        content:
          "Share classroom examples with the school speech-language pathologist to support a student's evaluation.",
      },
      { property: "og:title", content: "Teacher questionnaire — Novi" },
      {
        property: "og:description",
        content: "Classroom examples help the SLP write a stronger evaluation.",
      },
    ],
  }),
  component: TeacherIntakePage,
});

const student = {
  name: "Maya Rodriguez",
  grade: "2nd",
  school: "Lincoln Elementary",
  slp: "Rachel Smith, M.S., CCC-SLP",
};

function TeacherIntakePage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PortalShell subtitle="Teacher questionnaire">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-emerald-900">
            Thank you. Your input has been submitted to the SLP.
          </h2>
          <p className="mt-2 text-sm text-emerald-800">
            {student.slp} will use your classroom examples when writing {student.name}'s
            evaluation report.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/evaluations/$id"
              params={{ id: "ev-001" }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to demo workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell subtitle="Teacher questionnaire">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Student</div>
            <div className="mt-0.5 text-base font-semibold">{student.name}</div>
            <div className="text-sm text-muted-foreground">
              {student.grade} · {student.school}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>SLP: {student.slp}</div>
          </div>
        </div>
        <p className="mt-4 rounded-md bg-muted/60 p-3 text-sm text-foreground/90">
          This should take about 3–5 minutes. Your classroom examples help the SLP write a
          stronger evaluation. This prototype uses fictional data.
        </p>
      </div>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <PortalCard step={1} title="Teacher info">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={<>Your name <Required /></>}>
              <Input required placeholder="e.g. Ms. Patel" />
            </Field>
            <Field label={<>Role <Required /></>}>
              <Select required defaultValue="">
                <option value="" disabled>Select…</option>
                <option>General education teacher</option>
                <option>Special education teacher</option>
                <option>Reading specialist</option>
                <option>ESL / ELL teacher</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Best way to reach you">
              <Select defaultValue="Email">
                <option>Email</option>
                <option>Phone / extension</option>
                <option>In person</option>
              </Select>
            </Field>
            <Field label="Email or extension">
              <Input placeholder="Optional" />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={2} title="Classroom concerns">
          <div className="space-y-3">
            <Field label={<>What communication concerns do you notice? <Required /></>}>
              <Textarea required rows={3} />
            </Field>
            <Field label="In which settings do they show up?">
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                <CheckboxRow label="Whole-group instruction" />
                <CheckboxRow label="Small group / partner work" />
                <CheckboxRow label="1-on-1 with teacher" />
                <CheckboxRow label="Independent work" />
                <CheckboxRow label="Recess / social" />
                <CheckboxRow label="Specials (art, PE, music)" />
              </div>
            </Field>
            <Field label="How often do they occur?">
              <Select defaultValue="Several times a week">
                <option>Occasionally</option>
                <option>A few times a month</option>
                <option>Several times a week</option>
                <option>Daily</option>
                <option>Multiple times per day</option>
              </Select>
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={3} title="Academic impact">
          <div className="space-y-2">
            <FrequencyRow label="Reading / listening comprehension" />
            <FrequencyRow label="Written expression" />
            <FrequencyRow label="Oral participation" />
            <FrequencyRow label="Following directions" />
            <Field label="Other classroom impact">
              <Textarea rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={4} title="Functional communication">
          <div className="space-y-2">
            <FrequencyRow label="Following directions" />
            <FrequencyRow label="Asking for help" />
            <FrequencyRow label="Answering questions" />
            <FrequencyRow label="Retelling or explaining" />
            <FrequencyRow label="Peer interaction" />
            <FrequencyRow label="Group discussion" />
          </div>
        </PortalCard>

        <PortalCard step={5} title="Examples">
          <p className="mb-3 text-xs text-muted-foreground">
            2–3 concrete examples make the biggest difference. Setting, what happened, and impact.
          </p>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-md border border-border bg-background p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Example {n}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <Input placeholder="Setting (e.g. reading group)" />
                  <Input placeholder="What happened" className="md:col-span-2" />
                </div>
                <Textarea placeholder="Impact on the student or class" rows={2} className="mt-2" />
              </div>
            ))}
          </div>
        </PortalCard>

        <PortalCard step={6} title="Supports tried">
          <div className="grid gap-2 sm:grid-cols-2">
            <CheckboxRow label="Visual supports" />
            <CheckboxRow label="Repetition / rephrasing" />
            <CheckboxRow label="Small group support" />
            <CheckboxRow label="Sentence starters" />
            <CheckboxRow label="Extra wait time" />
            <CheckboxRow label="Preferential seating" />
          </div>
          <Field label="Other supports">
            <Textarea rows={2} />
          </Field>
        </PortalCard>

        <PortalCard step={7} title="Final notes">
          <Field label="Anything else the SLP should know?">
            <Textarea rows={4} />
          </Field>
        </PortalCard>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">
            Submitted responses go directly to the SLP working with this student.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" /> Submit questionnaire
          </button>
        </div>
      </form>
    </PortalShell>
  );
}