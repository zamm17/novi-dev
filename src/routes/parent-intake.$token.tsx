import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import {
  PortalShell,
  PortalCard,
  Field,
  Textarea,
  Input,
  Select,
  Required,
  CheckboxRow,
} from "@/components/novi/PortalShell";
import { saveParentSubmission, serializeIntakeForm } from "@/lib/demo-store";

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
          const fields = serializeIntakeForm(e.currentTarget);
          saveParentSubmission(fields);
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <PortalCard step={1} title="Parent / guardian info">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={<>Your name <Required /></>}>
              <Input name="Q:Parent info > Your name" required placeholder="e.g. Elena Rodriguez" />
            </Field>
            <Field label={<>Relationship to student <Required /></>}>
              <Select name="Q:Parent info > Relationship" required defaultValue="">
                <option value="" disabled>Select…</option>
                <option>Mother</option>
                <option>Father</option>
                <option>Guardian</option>
                <option>Grandparent</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Best way to reach you">
              <Select name="Q:Parent info > Best way to reach you" defaultValue="Email">
                <option>Email</option>
                <option>Phone call</option>
                <option>Text message</option>
              </Select>
            </Field>
            <Field label="Email or phone">
              <Input name="Q:Parent info > Contact info" placeholder="Optional" />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={2} title="Main concerns">
          <div className="space-y-3">
            <Field label={<>What concerns do you have about your child's communication? <Required /></>}>
              <Textarea name="Q:Main concerns > Concerns" required rows={4} placeholder="It's okay to describe things in your own words." />
            </Field>
            <Field label="When did you first notice these concerns?">
              <Input name="Q:Main concerns > When first noticed" placeholder="e.g. Around age 3, or last school year" />
            </Field>
            <Field label="What would you most like the school team to understand?">
              <Textarea name="Q:Main concerns > What to understand" rows={3} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={3} title="Child strengths">
          <div className="space-y-3">
            <Field label="What are your child's communication strengths?">
              <Textarea name="Q:Child strengths > Communication strengths" rows={3} />
            </Field>
            <Field label="What does your child enjoy talking about or doing?">
              <Textarea name="Q:Child strengths > Enjoys" rows={2} />
            </Field>
            <Field label="What helps your child communicate successfully?">
              <Textarea name="Q:Child strengths > What helps" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={4} title="Developmental history">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              It's okay if you don't remember exact ages — "Not sure" is a fine answer.
            </p>
            <Field label="First words or early communication">
              <Textarea name="Q:Developmental history > First words" rows={2} placeholder="Approximate age, or 'Not sure / don't remember'." />
            </Field>
            <Field label="Combining words or short sentences">
              <Textarea name="Q:Developmental history > Combining words" rows={2} placeholder="Approximate age, or 'Not sure / don't remember'." />
            </Field>
            <Field label="Any developmental milestones or concerns to share">
              <Textarea name="Q:Developmental history > Milestones or concerns" rows={3} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={5} title="Medical and hearing history">
          <div className="space-y-3">
            <Field label="Has your child passed a recent hearing screening?">
              <Select name="Q:Medical and hearing history > Recent hearing screening" defaultValue="">
                <option value="" disabled>Select…</option>
                <option>Yes</option>
                <option>No</option>
                <option>Not sure</option>
              </Select>
            </Field>
            <Field label="Approximate date and result (if known)">
              <Input name="Q:Medical and hearing history > Hearing screening details" placeholder="e.g. Passed, spring 2025" />
            </Field>
            <Field label="Ear infections or ear tubes">
              <Textarea name="Q:Medical and hearing history > Ear infections or tubes" rows={2} />
            </Field>
            <Field label="Relevant medical history">
              <Textarea name="Q:Medical and hearing history > Relevant medical history" rows={3} />
            </Field>
            <Field label="Current medications or diagnoses (only if relevant)">
              <Textarea name="Q:Medical and hearing history > Medications or diagnoses" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={6} title="Language background">
          <div className="space-y-3">
            <Field label={<>Primary language your child uses most comfortably <Required /></>}>
              <Input name="Q:Language background > Primary language" required placeholder="e.g. English" />
            </Field>
            <Field label="Languages your child understands">
              <Input name="Q:Language background > Languages understood" placeholder="e.g. English, Spanish" />
            </Field>
            <Field label="Languages your child speaks">
              <Input name="Q:Language background > Languages spoken" placeholder="e.g. English, some Spanish" />
            </Field>
            <Field label="Languages used with caregivers and siblings">
              <Input name="Q:Language background > Languages with family" placeholder="e.g. Spanish with grandparents" />
            </Field>
            <Field label="Does your child need an interpreter?">
              <Select name="Q:Language background > Needs interpreter" defaultValue="">
                <option value="" disabled>Select…</option>
                <option>No</option>
                <option>Yes — for the child</option>
                <option>Yes — for the parent/guardian</option>
                <option>Not sure</option>
              </Select>
            </Field>
            <Field label="Where do the communication concerns show up?">
              <Select name="Q:Language background > Concerns show up in" defaultValue="">
                <option value="" disabled>Select…</option>
                <option>English only</option>
                <option>Home language only</option>
                <option>Both languages</option>
                <option>Not sure</option>
              </Select>
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={7} title="Communication at home">
          <div className="space-y-3">
            <Field label="How does your child usually communicate needs and ideas?">
              <Textarea name="Q:Communication at home > Usual communication" rows={3} />
            </Field>
            <Field label="What kinds of communication are easiest for your child?">
              <Textarea name="Q:Communication at home > Easiest" rows={2} />
            </Field>
            <Field label="What kinds of communication are hardest?">
              <Textarea name="Q:Communication at home > Hardest" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={8} title="School and educational history">
          <div className="space-y-3">
            <Field label="Previous school evaluations, IEPs, 504 plans, or intervention plans">
              <Textarea name="Q:School history > Prior evaluations or plans" rows={2} />
            </Field>
            <Field label="Tutoring or outside academic support">
              <Textarea name="Q:School history > Outside academic support" rows={2} />
            </Field>
            <Field label="Any academic areas of concern?">
              <Textarea name="Q:School history > Academic concerns" rows={2} />
            </Field>
            <Field label="Attendance, school changes, or learning history to share">
              <Textarea name="Q:School history > Attendance / school changes" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={9} title="Prior services">
          <div className="space-y-3">
            <Field label="Previous speech therapy or evaluations">
              <Textarea name="Q:Prior services > Previous speech therapy" rows={2} />
            </Field>
            <Field label="Outside services (private therapy, tutoring, etc.)">
              <Textarea name="Q:Prior services > Outside services" rows={2} />
            </Field>
            <Field label="Strategies that have helped at home">
              <Textarea name="Q:Prior services > Helpful strategies" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={10} title="Final notes">
          <Field label="Anything else the SLP should know?">
            <Textarea name="Q:Final notes > Anything else" rows={4} />
          </Field>
        </PortalCard>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">
            In this demo, submitting this form updates the SLP workspace in this browser session.
            In the real product, responses would be securely shared with the SLP.
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