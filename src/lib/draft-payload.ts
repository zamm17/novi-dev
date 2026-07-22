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
    speechSoundProfile?: string;
    oralMotor?: string;
    hearing?: string;
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
    speechSoundProfile?: string;
    oralMotor?: string;
    hearing?: string;
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
      speechSoundProfile:
        assessmentState?.speechSoundProfile ?? ev.assessments.speechSoundProfile,
      oralMotor: assessmentState?.oralMotor ?? ev.assessments.oralMotor,
      hearing: assessmentState?.hearing ?? ev.assessments.hearing,
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

  const MISSING = "No information was generated for this section. SLP review required.";
  const backgroundLead = `${student.firstName} ${student.lastName} is a ${student.grade}-grade student at ${student.school} referred for a ${evaluation.type.toLowerCase()}.`;
  const backgroundDetails = summarizeSections(parentIntake, [
    "Developmental history",
    "Medical and hearing history",
    "Language background",
    "School and educational history",
    "School history",
    "Prior services",
  ]);
  const backgroundAndHistory = [backgroundLead, backgroundDetails].filter(Boolean).join("\n\n");

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

  const assessmentResults = assessments.length
    ? assessments
        .map((a) => `${a.name}: SS ${a.standardScore}, %ile ${a.percentile}. ${a.notes}`)
        .join("\n")
    : MISSING;

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

  const evaluationInformation = [
    `Student: ${student.firstName} ${student.lastName}.`,
    `Grade: ${student.grade}. School: ${student.school}.`,
    `DOB: ${student.dob}. Primary language: ${student.primaryLanguage}.`,
    `Evaluation type: ${evaluation.type}.`,
    `Consent received: ${evaluation.consentDate}. Due date: ${evaluation.dueDate}.`,
  ].join(" ");

  const sourcesList: string[] = [];
  if (parentIntake.source !== "none") sourcesList.push("parent questionnaire");
  if (teacherIntake.source !== "none") sourcesList.push("teacher questionnaire");
  if (assessments.length) sourcesList.push("standardized assessments");
  if (observations.slpObservations) sourcesList.push("SLP observations during testing");
  if (observations.oralMotor) sourcesList.push("oral mechanism examination");
  if (observations.hearing) sourcesList.push("hearing screening");
  const sourcesOfData = sourcesList.length
    ? `This draft is grounded in: ${sourcesList.join(", ")}. Additional records may be reviewed by the SLP.`
    : MISSING;

  const behavioralObservations = observations.slpObservations
    ? observations.slpObservations
    : MISSING;

  const validityParts: string[] = [];
  if (observations.slpObservations) {
    validityParts.push(
      "Based on available SLP observations, results appear to be a valid representation of the student's current skills, pending SLP confirmation of testing conditions and any cultural or linguistic considerations.",
    );
  } else {
    validityParts.push("SLP review required to confirm testing conditions and validity of results.");
  }
  if (observations.hearing) validityParts.push(`Hearing context: ${observations.hearing}`);
  if (observations.oralMotor) validityParts.push(`Oral-motor context: ${observations.oralMotor}`);
  const testingConditionsAndValidity = validityParts.join(" ");

  const bilingual = /\//.test(student.primaryLanguage) || /spanish|vietnamese|bilingual/i.test(student.primaryLanguage);
  const speechSoundProfile = (() => {
    const hasArticEntry = assessments.some((a) => /GFTA|articulation|sounds/i.test(a.name));
    if (!hasArticEntry) return "No articulation-specific assessment data provided. SLP review required if a speech sound profile is relevant.";
    const notes = assessments
      .filter((a) => /GFTA|articulation|sounds/i.test(a.name))
      .map((a) => a.notes)
      .filter(Boolean)
      .join(" ");
    return [
      "Speech sound profile based on available data:",
      notes,
      bilingual ? "Bilingual/linguistic context should be considered; additional information may be needed to distinguish difference from disorder." : "",
    ].filter(Boolean).join(" ");
  })();

  const educationalImpact = observations.educationalImpact || MISSING;

  const eligibilityConsiderations =
    "The information gathered may support the IEP team's consideration of speech/language eligibility. Eligibility is determined by the IEP team based on all available data. Novi does not determine eligibility.";

  const recommendations = [
    "The IEP team should consider the student's need for specially designed instruction based on the findings above.",
    "Suggested targets, cueing strategies, classroom supports, and carryover opportunities should be finalized by the SLP.",
  ].join(" ");

  return {
    evaluationInformation,
    reasonForReferral: referralReason || MISSING,
    sourcesOfData,
    backgroundAndHistory: backgroundAndHistory || MISSING,
    parentInputSummary: parentInputSummary || MISSING,
    teacherInputSummary: teacherInputSummary || MISSING,
    behavioralObservations,
    testingConditionsAndValidity,
    assessmentResults,
    speechSoundProfile,
    presentLevels: presentLevels || MISSING,
    educationalImpact,
    interpretation: interpretation || MISSING,
    eligibilityConsiderations,
    recommendations,
    summary: `${student.firstName} presents with a communication profile summarized above. All sections are editable by the SLP; final decisions rest with the IEP team.`,
  };
}