import type { AssessmentEntry, DraftSections, Evaluation } from "./mock-data";
import { groupSubmissionBySection, type Submission, type SubmissionSection } from "./demo-store";

export interface IntakePayload {
  source: "session" | "mock" | "none";
  submittedAt?: string;
  sections: SubmissionSection[];
  legacy?: unknown;
}

export interface EvaluationDraftPayload {
  student: {
    firstName: string;
    lastName: string;
    grade: string;
    school: string;
    dob: string;
    primaryLanguage: string;
  };
  evaluation: {
    id: string;
    type: string;
    consentDate: string;
    dueDate: string;
  };
  referralReason: string;
  parentIntake: IntakePayload;
  teacherIntake: IntakePayload;
  assessments: AssessmentEntry[];
  observations: {
    slpObservations: string;
    strengths: string;
    concerns: string;
    educationalImpact: string;
  };
  missingRequiredItems: string[];
}

function toIntake(
  session: Submission | null,
  legacy: Evaluation["parent"] | Evaluation["teacher"],
): IntakePayload {
  if (session) {
    return {
      source: "session",
      submittedAt: session.submittedAt,
      sections: groupSubmissionBySection(session),
      legacy,
    };
  }
  if (legacy.submitted) {
    return { source: "mock", sections: [], legacy };
  }
  return { source: "none", sections: [], legacy };
}

export function buildEvaluationDraftPayload(
  ev: Evaluation,
  parentSub: Submission | null,
  teacherSub: Submission | null,
  assessmentState?: {
    entries?: AssessmentEntry[];
    slpObservations?: string;
    strengths?: string;
    concerns?: string;
    educationalImpact?: string;
  },
): EvaluationDraftPayload {
  const entries = assessmentState?.entries ?? ev.assessments.entries;
  const missing: string[] = [];
  if (!ev.referralReason) missing.push("Referral reason");
  if (!parentSub && !ev.parent.submitted) missing.push("Parent questionnaire");
  if (!teacherSub && !ev.teacher.submitted) missing.push("Teacher questionnaire");
  if (entries.length === 0) missing.push("Assessment scores");
  const obs = assessmentState?.slpObservations ?? ev.assessments.slpObservations;
  if (!obs) missing.push("SLP observations");

  return {
    student: {
      firstName: ev.firstName,
      lastName: ev.lastName,
      grade: ev.grade,
      school: ev.school,
      dob: ev.dob,
      primaryLanguage: ev.primaryLanguage,
    },
    evaluation: {
      id: ev.id,
      type: ev.evaluationType,
      consentDate: ev.consentDate,
      dueDate: ev.dueDate,
    },
    referralReason: ev.referralReason,
    parentIntake: toIntake(parentSub, ev.parent),
    teacherIntake: toIntake(teacherSub, ev.teacher),
    assessments: entries,
    observations: {
      slpObservations: obs,
      strengths: assessmentState?.strengths ?? ev.assessments.strengths,
      concerns: assessmentState?.concerns ?? ev.assessments.concerns,
      educationalImpact:
        assessmentState?.educationalImpact ?? ev.assessments.educationalImpact,
    },
    missingRequiredItems: missing,
  };
}

function summarizeSections(intake: IntakePayload, titles: string[]): string {
  if (intake.source !== "session") return "";
  const wanted = new Set(titles);
  const parts: string[] = [];
  for (const g of intake.sections) {
    if (!wanted.has(g.title)) continue;
    const lines: string[] = [];
    for (const f of g.fields) {
      const val = f.values.join(", ");
      if (val) lines.push(`  • ${f.label}: ${val}`);
    }
    if (lines.length) parts.push(`${g.title}:\n${lines.join("\n")}`);
  }
  return parts.join("\n\n");
}

/**
 * Deterministic text assembly used until we wire a real Edge Function.
 * When a session submission exists, the summaries reflect the exact
 * responses entered on the shared intake form.
 */
export function buildDraftFromPayload(p: EvaluationDraftPayload): DraftSections {
  const {
    student,
    evaluation,
    referralReason,
    parentIntake,
    teacherIntake,
    assessments,
    observations,
  } = p;

  const backgroundLead = `${student.firstName} ${student.lastName} is a ${student.grade}-grade student at ${student.school} referred for a ${evaluation.type.toLowerCase()}.`;
  const backgroundDetails = summarizeSections(parentIntake, [
    "Developmental history",
    "Medical and hearing history",
    "Language background",
    "School history",
    "Prior services",
  ]);
  const background = [backgroundLead, backgroundDetails].filter(Boolean).join("\n\n");

  const parentLegacy = parentIntake.legacy as Evaluation["parent"] | undefined;
  const teacherLegacy = teacherIntake.legacy as Evaluation["teacher"] | undefined;

  const parentInputSummary =
    parentIntake.source === "session"
      ? summarizeSections(parentIntake, [
          "Main concerns",
          "Child strengths",
          "Communication at home",
          "Final notes",
        ]) || "Parent submitted the questionnaire for this demo."
      : parentLegacy?.concerns ?? "";

  const teacherInputSummary =
    teacherIntake.source === "session"
      ? summarizeSections(teacherIntake, [
          "Student strengths",
          "Classroom concerns",
          "Academic impact",
          "Functional communication",
          "Examples",
          "Final notes",
        ]) || "Teacher submitted the questionnaire for this demo."
      : teacherLegacy?.classroomConcerns ?? "";

  const assessmentResults = assessments
    .map((a) => `${a.name}: SS ${a.standardScore}, %ile ${a.percentile}. ${a.notes}`)
    .join("\n");

  const presentLevels = [
    observations.strengths,
    summarizeSections(teacherIntake, [
      "Student strengths",
      "Educational impact",
      "Domain check",
      "Supports tried",
    ]),
  ]
    .filter(Boolean)
    .join("\n\n");

  const interpretation = [
    "Results should be interpreted in the context of parent, teacher, and clinician information. Eligibility is determined by the IEP team.",
    observations.slpObservations,
    summarizeSections(teacherIntake, ["Educational impact", "Examples", "Supports tried"]),
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    background,
    reasonForReferral: referralReason,
    parentInputSummary,
    teacherInputSummary,
    assessmentResults,
    presentLevels,
    interpretation,
    recommendations:
      "The IEP team should consider the student's need for specially designed instruction based on the findings above. Novi does not determine eligibility.",
    summary: `Summary of ${student.firstName}'s evaluation for team discussion. All sections above are editable by the SLP.`,
  };
}