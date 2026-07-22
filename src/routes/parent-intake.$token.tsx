import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { PortalShell, PortalCard, Field, Textarea, Input, Select, Required } from "@/components/novi/PortalShell";

export const Route = createFileRoute("/parent-intake/$token")({
  head: () => ({
    meta: [
      { title: "Parent questionnaire — Novi" },
      {
        name: "description",
        content:
          "Share your child's communication history with the school speech-language pathologist.",
      },
      { property: "og:title", content: "Parent questionnaire — Novi" },
      {
        property: "og:description",
        content: "Help the school SLP understand your child's communication history.",
      },
    ],
  }),
  component: ParentIntakePage,
});

const student = {
  name: "Maya Rodriguez",
  grade: "2nd",
  school: "Lincoln Elementary",
  slp: "Rachel Smith, M.S., CCC-SLP",
  evaluationType: "Initial speech-language evaluation",
};

function ParentIntakePage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PortalShell subtitle="Parent questionnaire">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-emerald-900">
            Thank you. Your responses have been submitted to the SLP.
          </h2>
          <p className="mt-2 text-sm text-emerald-800">
            {student.slp} will review your input as part of {student.name}'s evaluation.
            You don't need to do anything else right now.
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
    <PortalShell subtitle="Parent questionnaire">
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
            <div className="mt-0.5">{student.evaluationType}</div>
          </div>
        </div>
        <p className="mt-4 rounded-md bg-muted/60 p-3 text-sm text-foreground/90">
          Your responses help the school speech-language pathologist understand your child's
          communication history. This prototype uses fictional data — no responses are stored.
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
        <PortalCard step={1} title="Parent / guardian info">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={<>Your name <Required /></>}>
              <Input required placeholder="e.g. Elena Rodriguez" />
            </Field>
            <Field label={<>Relationship to student <Required /></>}>
              <Select required defaultValue="">
                <option value="" disabled>Select…</option>
                <option>Mother</option>
                <option>Father</option>
                <option>Guardian</option>
                <option>Grandparent</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Best way to reach you">
              <Select defaultValue="Email">
                <option>Email</option>
                <option>Phone call</option>
                <option>Text message</option>
              </Select>
            </Field>
            <Field label="Email or phone">
              <Input placeholder="Optional" />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={2} title="Main concerns">
          <div className="space-y-3">
            <Field label={<>What concerns do you have about your child's communication? <Required /></>}>
              <Textarea required rows={4} placeholder="It's okay to describe things in your own words." />
            </Field>
            <Field label="When did you first notice these concerns?">
              <Input placeholder="e.g. Around age 3, or last school year" />
            </Field>
            <Field label="What would you most like the school team to understand?">
              <Textarea rows={3} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={3} title="Developmental history">
          <div className="space-y-3">
            <Field label="First words or early communication">
              <Textarea rows={2} placeholder="Approximate age of first words, gestures, etc." />
            </Field>
            <Field label="Combining words or short sentences">
              <Textarea rows={2} placeholder="Approximate age, if you remember." />
            </Field>
            <Field label="Any developmental milestones or concerns to share">
              <Textarea rows={3} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={4} title="Medical and hearing history">
          <div className="space-y-3">
            <Field label="Any hearing concerns or hearing tests">
              <Textarea rows={2} placeholder="Dates and results, if known." />
            </Field>
            <Field label="Ear infections or ear tubes">
              <Textarea rows={2} />
            </Field>
            <Field label="Relevant medical history">
              <Textarea rows={3} />
            </Field>
            <Field label="Current medications or diagnoses (only if relevant)">
              <Textarea rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={5} title="Communication at home">
          <div className="space-y-3">
            <Field label={<>Languages used at home <Required /></>}>
              <Input required placeholder="e.g. English and Spanish" />
            </Field>
            <Field label="How does your child usually communicate needs and ideas?">
              <Textarea rows={3} />
            </Field>
            <Field label="What kinds of communication are easiest for your child?">
              <Textarea rows={2} />
            </Field>
            <Field label="What kinds of communication are hardest?">
              <Textarea rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={6} title="Prior services">
          <div className="space-y-3">
            <Field label="Previous speech therapy or evaluations">
              <Textarea rows={2} />
            </Field>
            <Field label="Outside services (private therapy, tutoring, etc.)">
              <Textarea rows={2} />
            </Field>
            <Field label="Strategies that have helped at home">
              <Textarea rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={7} title="Final notes">
          <Field label="Anything else the SLP should know?">
            <Textarea rows={4} />
          </Field>
        </PortalCard>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">
            Your responses go directly to the SLP working with your child.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" /> Submit questionnaire
          </button>
        </div>
      </form>
    </PortalShell>
  );
}