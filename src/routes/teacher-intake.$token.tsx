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
import { saveTeacherSubmission, serializeIntakeForm } from "@/lib/demo-store";

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
            Thanks — your responses were saved for this demo.
          </h2>
          <p className="mt-2 text-sm text-emerald-800">
            In this demo, {student.name}'s SLP workspace has been updated in this browser.
            session. In the real product, your classroom examples would be securely shared
            with {student.slp}.
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
          About 3–5 minutes. In this demo, submitting updates the SLP workspace in this
          browser session — nothing is sent anywhere. In the real product, responses would
          be securely shared with the SLP. Please use fictional information only.
        </p>
      </div>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fields = serializeIntakeForm(e.currentTarget);
          saveTeacherSubmission(fields);
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <PortalCard step={1} title="Teacher info">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={<>Your name <Required /></>}>
              <Input name="Q:Teacher info > Your name" required placeholder="e.g. Ms. Patel" />
            </Field>
            <Field label={<>Role <Required /></>}>
              <Select name="Q:Teacher info > Role" required defaultValue="">
                <option value="" disabled>Select…</option>
                <option>General education teacher</option>
                <option>Special education teacher</option>
                <option>Reading specialist</option>
                <option>ESL / ELL teacher</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Best way to reach you">
              <Select name="Q:Teacher info > Best way to reach you" defaultValue="Email">
                <option>Email</option>
                <option>Phone / extension</option>
                <option>In person</option>
              </Select>
            </Field>
            <Field label="Email or extension">
              <Input name="Q:Teacher info > Contact info" placeholder="Optional" />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={2} title="Student strengths">
          <div className="space-y-3">
            <Field label="What are the student's communication or classroom strengths?">
              <Textarea name="Q:Student strengths > Strengths" rows={3} />
            </Field>
            <Field label="When does the student communicate most successfully?">
              <Textarea name="Q:Student strengths > Successful settings" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={3} title="Classroom concerns">
          <div className="space-y-3">
            <Field label={<>What communication concerns do you notice? <Required /></>}>
              <Textarea name="Q:Classroom concerns > Concerns" required rows={3} />
            </Field>
            <Field label="In which settings do they show up?">
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {[
                  "Whole-group instruction",
                  "Small group / partner work",
                  "1-on-1 with teacher",
                  "Independent work",
                  "Recess / social",
                  "Specials (art, PE, music)",
                ].map((s) => (
                  <CheckboxRow key={s} label={s} name="Q:Classroom concerns > Settings" />
                ))}
              </div>
            </Field>
            <Field label="How often do they occur?">
              <Select name="Q:Classroom concerns > Frequency" defaultValue="Several times a week">
                <option>Occasionally</option>
                <option>A few times a month</option>
                <option>Several times a week</option>
                <option>Daily</option>
                <option>Multiple times per day</option>
              </Select>
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={4} title="Academic impact">
          <div className="space-y-2">
            <FrequencyRow
              label="Reading / listening comprehension"
              name="Q:Academic impact > Reading / listening comprehension"
            />
            <FrequencyRow
              label="Written expression"
              name="Q:Academic impact > Written expression"
            />
            <FrequencyRow
              label="Oral participation"
              name="Q:Academic impact > Oral participation"
            />
            <FrequencyRow
              label="Following directions"
              name="Q:Academic impact > Following directions"
            />
            <Field label="Other classroom impact">
              <Textarea name="Q:Academic impact > Other impact" rows={2} />
            </Field>
          </div>
        </PortalCard>

        <PortalCard step={5} title="Functional communication">
          <div className="space-y-2">
            <FrequencyRow
              label="Following multi-step oral directions"
              name="Q:Functional communication > Following multi-step oral directions"
            />
            <FrequencyRow
              label="Asking for help"
              name="Q:Functional communication > Asking for help"
            />
            <FrequencyRow
              label="Answering questions"
              name="Q:Functional communication > Answering questions"
            />
            <FrequencyRow
              label="Retelling or explaining"
              name="Q:Functional communication > Retelling or explaining"
            />
            <FrequencyRow
              label="Peer interaction"
              name="Q:Functional communication > Peer interaction"
            />
            <FrequencyRow
              label="Group discussion"
              name="Q:Functional communication > Group discussion"
            />
          </div>
        </PortalCard>

        <PortalCard step={6} title="Educational impact">
          <p className="mb-2 text-xs text-muted-foreground">
            How do these communication concerns affect the student's access to instruction or
            classroom participation? Check all that apply.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Grades / academic performance",
              "Oral participation",
              "Written work",
              "Following directions",
              "Independence",
              "Peer interaction",
              "Work completion",
              "Confidence / willingness to participate",
              "Not currently affecting classroom performance",
            ].map((s) => (
              <CheckboxRow key={s} label={s} name="Q:Educational impact > Areas affected" />
            ))}
          </div>
          <Field label="Notes (optional)">
            <Textarea name="Q:Educational impact > Notes" rows={2} />
          </Field>
        </PortalCard>

        <PortalCard step={7} title="Examples">
          <p className="mb-3 text-xs text-muted-foreground">
            One concrete example is the most important thing you can share. A second or third
            is a nice-to-have if you have time.
          </p>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => {
              const primary = n === 1;
              return (
                <div
                  key={n}
                  className={
                    primary
                      ? "rounded-md border-2 border-primary/40 bg-primary/5 p-4"
                      : "rounded-md border border-border bg-background p-3"
                  }
                >
                  <div
                    className={
                      primary
                        ? "text-xs font-semibold uppercase tracking-wide text-primary"
                        : "text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    }
                  >
                    Example {n}{" "}
                    {primary ? (
                      <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        Most important
                      </span>
                    ) : (
                      <span className="ml-1 text-[10px] font-medium text-muted-foreground">
                        (optional)
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    <Input
                      name={`Q:Examples > Example ${n} — setting`}
                      placeholder="Setting (e.g. reading group)"
                    />
                    <Input
                      name={`Q:Examples > Example ${n} — what happened`}
                      placeholder="What happened"
                      className="md:col-span-2"
                    />
                  </div>
                  <Textarea
                    name={`Q:Examples > Example ${n} — impact`}
                    placeholder="Impact on the student or class"
                    rows={2}
                    className="mt-2"
                  />
                </div>
              );
            })}
          </div>
        </PortalCard>

        <PortalCard step={8} title="Supports tried">
          <p className="mb-2 text-xs text-muted-foreground">
            For each support, tell us how the student responded.
          </p>
          <SupportsTable
            supports={[
              "Visual supports",
              "Repetition / rephrasing",
              "Small group support",
              "Sentence starters",
              "Extra wait time",
              "Preferential seating",
            ]}
          />
          <Field label="Other supports">
            <Textarea name="Q:Supports tried > Other supports" rows={2} />
          </Field>
        </PortalCard>

        <PortalCard step={9} title="Domain check">
          <p className="mb-2 text-xs text-muted-foreground">
            Any concerns observed in these areas? Check all that apply.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Speech intelligibility",
              "Vocabulary",
              "Grammar / sentence formulation",
              "Narrative / story retell",
              "Social communication",
              "Fluency / stuttering",
              "Voice",
              "None observed",
            ].map((s) => (
              <CheckboxRow key={s} label={s} name="Q:Domain check > Areas of concern" />
            ))}
          </div>
        </PortalCard>

        <PortalCard step={10} title="Final notes">
          <Field label="Anything else the SLP should know?">
            <Textarea name="Q:Final notes > Anything else" rows={4} />
          </Field>
        </PortalCard>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">
            In this demo, submitting updates the SLP workspace in this browser. In the
            real product, responses would be securely shared with the SLP.
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

function SupportsTable({ supports }: { supports: string[] }) {
  const opts = ["Helped", "Somewhat helped", "Did not help", "Not tried"] as const;
  return (
    <div className="space-y-2">
      {supports.map((s) => (
        <div
          key={s}
          className="rounded-md border border-border bg-background p-3"
        >
          <div className="text-sm font-medium">{s}</div>
          <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
            {opts.map((o) => (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-accent"
              >
                <input
                  type="radio"
                  name={`Q:Supports tried > ${s}`}
                  value={o}
                  className="h-3.5 w-3.5"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}