export type EvalStatus =
  | "Intake needed"
  | "Waiting on parent"
  | "Waiting on teacher"
  | "Assessment info needed"
  | "Ready to generate"
  | "Draft in review";

export type WorkflowStep =
  | "Student info"
  | "Parent input"
  | "Teacher input"
  | "Assessments"
  | "Draft";

export const workflowSteps: WorkflowStep[] = [
  "Student info",
  "Parent input",
  "Teacher input",
  "Assessments",
  "Draft",
];

export interface ParentIntake {
  submitted: boolean;
  submittedDate?: string;
  concerns?: string;
  developmentalHistory?: string;
  medicalHistory?: string;
  communicationBackground?: string;
  homeLanguageContext?: string;
  priorServices?: string;
}

export interface TeacherIntake {
  submitted: boolean;
  submittedDate?: string;
  classroomConcerns?: string;
  academicImpact?: string;
  functionalCommunication?: string;
  behaviorSocial?: string;
  examples?: string;
  supportsTried?: string;
}

export interface AssessmentEntry {
  name: string;
  standardScore: string;
  percentile: string;
  notes: string;
}

export interface AssessmentInfo {
  entries: AssessmentEntry[];
  slpObservations: string;
  strengths: string;
  concerns: string;
  educationalImpact: string;
}

export interface DraftSections {
  background: string;
  reasonForReferral: string;
  parentInputSummary: string;
  teacherInputSummary: string;
  assessmentResults: string;
  presentLevels: string;
  interpretation: string;
  recommendations: string;
  summary: string;
}

export interface Evaluation {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  school: string;
  dob: string;
  primaryLanguage: string;
  evaluationType: string;
  referralReason: string;
  consentDate: string;
  dueDate: string;
  status: EvalStatus;
  missingItems: string[];
  nextAction: string;
  currentStep: WorkflowStep;
  parent: ParentIntake;
  teacher: TeacherIntake;
  assessments: AssessmentInfo;
  draft?: DraftSections;
  previousEvaluation?: boolean;
  medicalHistoryDetails?: boolean;
  educationalHistoryDetails?: boolean;
}

const emptyAssessments: AssessmentInfo = {
  entries: [],
  slpObservations: "",
  strengths: "",
  concerns: "",
  educationalImpact: "",
};

export const evaluations: Evaluation[] = [
  {
    id: "ev-001",
    firstName: "Maya",
    lastName: "Rodriguez",
    grade: "2nd",
    school: "Lincoln Elementary",
    dob: "2017-04-12",
    primaryLanguage: "English / Spanish (home)",
    evaluationType: "Initial — Speech Sound Disorder",
    referralReason:
      "Teacher reports persistent difficulty producing /r/, /s/, and /th/ sounds impacting classroom participation and peer interaction.",
    consentDate: "2026-06-20",
    dueDate: "2026-08-14",
    status: "Waiting on parent",
    missingItems: ["Parent questionnaire", "Teacher questionnaire"],
    nextAction: "Send parent and teacher intake forms to collect background.",
    currentStep: "Parent input",
    parent: { submitted: false },
    teacher: { submitted: false },
    assessments: {
      entries: [
        { name: "GFTA-3 — Sounds in Words", standardScore: "72", percentile: "3", notes: "Multiple errors on /r/, /s/, /th/. Errors consistent across positions." },
        { name: "CELF-5 — Core Language", standardScore: "104", percentile: "61", notes: "Language skills within age expectations." },
        { name: "Oral Motor Exam", standardScore: "—", percentile: "—", notes: "Structure and function within normal limits." },
      ],
      slpObservations:
        "Maya was cooperative and engaged. Errors were stimulable in isolation for /r/ and /th/ with visual and tactile cues. Frontal lisp on /s/ was inconsistent.",
      strengths:
        "Strong receptive language, age-appropriate vocabulary, good social awareness, and cooperative testing behavior.",
      concerns:
        "Articulation errors reduce intelligibility in connected speech, especially with unfamiliar listeners, and are affecting classroom participation.",
      educationalImpact:
        "Reduced intelligibility is impacting oral participation and self-confidence during oral reading and discussions.",
    },
  },
  {
    id: "ev-002",
    firstName: "Jamal",
    lastName: "Washington",
    grade: "3rd",
    school: "Roosevelt Elementary",
    dob: "2016-09-03",
    primaryLanguage: "English",
    evaluationType: "Initial — Language",
    referralReason:
      "Difficulty following multi-step directions and answering inferential questions in class.",
    consentDate: "2026-06-25",
    dueDate: "2026-08-20",
    status: "Waiting on parent",
    missingItems: ["Parent questionnaire"],
    nextAction: "Follow up with parent — form sent 2026-06-27",
    currentStep: "Parent input",
    parent: { submitted: false },
    teacher: {
      submitted: true,
      submittedDate: "2026-06-30",
      classroomConcerns:
        "Jamal often needs directions repeated and paraphrased. Struggles with 'why' and 'how' questions after reading.",
      academicImpact:
        "Reading comprehension scores below grade level. Written responses lack detail.",
      functionalCommunication:
        "Follows 1-step directions consistently, 2-step with visual support. Rarely initiates conversation with peers.",
      behaviorSocial: "Well-liked, quiet, prefers small groups.",
      examples:
        "When asked 'Why do you think the character was sad?' responds with 'I don't know' or restates a fact.",
      supportsTried: "Visual schedules, chunked directions, sentence starters for written response.",
    },
    assessments: emptyAssessments,
  },
  {
    id: "ev-003",
    firstName: "Sophie",
    lastName: "Nguyen",
    grade: "K",
    school: "Lincoln Elementary",
    dob: "2020-11-18",
    primaryLanguage: "English / Vietnamese (home)",
    evaluationType: "Initial — Language & Articulation",
    referralReason:
      "Parent-initiated referral for reduced intelligibility and limited expressive vocabulary in English.",
    consentDate: "2026-07-01",
    dueDate: "2026-08-27",
    status: "Waiting on teacher",
    missingItems: ["Teacher questionnaire"],
    nextAction: "Follow up with classroom teacher",
    currentStep: "Teacher input",
    parent: {
      submitted: true,
      submittedDate: "2026-07-05",
      concerns:
        "Sophie is hard to understand in English. She uses shorter sentences than her older sibling did at this age.",
      developmentalHistory:
        "Walked at 13 months. First English words around 22 months. Combining 2 words by 26 months.",
      medicalHistory: "History of recurrent ear infections ages 1-3. Tubes placed at age 3. Cleared audiology 6 months ago.",
      communicationBackground:
        "Attended part-time preschool starting at age 4.",
      homeLanguageContext:
        "Vietnamese primary at home with grandparents; English with parents and siblings.",
      priorServices: "None.",
    },
    teacher: { submitted: false },
    assessments: emptyAssessments,
  },
  {
    id: "ev-004",
    firstName: "Ethan",
    lastName: "Kowalski",
    grade: "4th",
    school: "Roosevelt Elementary",
    dob: "2015-02-24",
    primaryLanguage: "English",
    evaluationType: "Reevaluation — Fluency",
    referralReason:
      "Three-year reevaluation for existing fluency IEP. Determine continued eligibility and update goals.",
    consentDate: "2026-06-10",
    dueDate: "2026-08-08",
    status: "Assessment info needed",
    missingItems: ["Assessment scores", "SLP observations"],
    nextAction: "Schedule and complete SSI-4 and connected speech sample",
    currentStep: "Assessments",
    parent: {
      submitted: true,
      submittedDate: "2026-06-18",
      concerns:
        "Ethan's stuttering seems worse when he's tired or excited. He's started avoiding some words.",
      developmentalHistory: "Milestones met on time. Stuttering onset around age 4.",
      medicalHistory: "No significant medical concerns.",
      communicationBackground:
        "Receiving school-based speech services for fluency since 1st grade.",
      homeLanguageContext: "English monolingual household.",
      priorServices: "School-based fluency therapy, current IEP.",
    },
    teacher: {
      submitted: true,
      submittedDate: "2026-06-22",
      classroomConcerns:
        "Ethan participates but sometimes gives up mid-sentence. Has mentioned not wanting to read aloud.",
      academicImpact: "Academics on grade level. Oral presentations avoided when possible.",
      functionalCommunication:
        "Communicates effectively one-on-one. Increased disfluency during whole-group answers.",
      behaviorSocial: "Good peer relationships. Some observed frustration during blocks.",
      examples: "Part-word repetitions ('b-b-b-because'), audible blocks on initial /s/ and /p/.",
      supportsTried: "Extra time for responses, opt-in oral reading, self-monitoring chart.",
    },
    assessments: {
      entries: [],
      slpObservations: "",
      strengths: "",
      concerns: "",
      educationalImpact: "",
    },
    previousEvaluation: true,
  },
  {
    id: "ev-005",
    firstName: "Aiyana",
    lastName: "Begay",
    grade: "1st",
    school: "Lincoln Elementary",
    dob: "2018-07-30",
    primaryLanguage: "English",
    evaluationType: "Initial — Language",
    referralReason:
      "Difficulty with narrative retell and expressive grammar noted by classroom teacher.",
    consentDate: "2026-05-28",
    dueDate: "2026-07-30",
    status: "Draft in review",
    missingItems: [],
    nextAction: "Finalize draft and prepare for eligibility meeting on 2026-07-25",
    currentStep: "Draft",
    parent: {
      submitted: true,
      submittedDate: "2026-06-05",
      concerns:
        "Aiyana struggles to tell us about her day in order. Sometimes leaves out key details.",
      developmentalHistory: "First words around 15 months, sentences by 3 years.",
      medicalHistory: "Unremarkable.",
      communicationBackground: "No prior services.",
      homeLanguageContext: "English only at home.",
      priorServices: "None.",
    },
    teacher: {
      submitted: true,
      submittedDate: "2026-06-08",
      classroomConcerns:
        "Retells lack sequence and detail. Uses simple sentence structures compared with peers.",
      academicImpact:
        "Difficulty with story elements in ELA; written narratives are brief and disorganized.",
      functionalCommunication: "Requests and comments appropriately; narrative language weaker.",
      behaviorSocial: "Cheerful, socially engaged, works well in pairs.",
      examples: "Retell of a familiar story omitted setting and resolution; used mostly SVO sentences.",
      supportsTried: "Story maps, sentence expansion prompts, picture supports.",
    },
    assessments: {
      entries: [
        { name: "CELF-5 — Core Language", standardScore: "78", percentile: "7", notes: "Below average; weakness in Formulated Sentences and Recalling Sentences." },
        { name: "TNL-2 — Narrative Language", standardScore: "76", percentile: "5", notes: "Reduced story grammar elements and use of literate language." },
      ],
      slpObservations:
        "Aiyana engaged well in testing. Narrative retells lacked orientation and resolution; sentence formulation required repeated prompting.",
      strengths: "Social communication, engagement, articulation, receptive vocabulary.",
      concerns: "Expressive language, narrative organization, sentence formulation.",
      educationalImpact:
        "Language difficulties are affecting written narratives, story comprehension, and oral participation in ELA.",
    },
    draft: {
      background:
        "Aiyana Begay is a 7-year-old first-grade student at Lincoln Elementary referred for an initial speech-language evaluation due to concerns with expressive language and narrative retell.",
      reasonForReferral:
        "Referral was initiated by the classroom teacher based on concerns about narrative organization, sentence formulation, and impact on written expression in ELA.",
      parentInputSummary:
        "Parent reports Aiyana struggles to share about her day in an organized way and often leaves out details. Developmental and medical history are unremarkable. English is the only language spoken at home.",
      teacherInputSummary:
        "Teacher reports weaknesses in narrative retell, simple sentence structures relative to peers, and reduced participation in ELA discussions. Story maps, sentence expansion, and picture supports have been trialed with limited generalization.",
      assessmentResults:
        "CELF-5 Core Language: SS 78 (7th percentile). TNL-2 Narrative: SS 76 (5th percentile). Both fall below average with specific weaknesses in Formulated Sentences, Recalling Sentences, and use of story grammar elements.",
      presentLevels:
        "Aiyana demonstrates age-appropriate articulation, social communication, and receptive vocabulary. She presents with weaknesses in expressive language, particularly narrative organization and sentence formulation.",
      interpretation:
        "Results are consistent with a language disorder in the area of expressive/narrative language. Findings are supported by parent, teacher, and standardized assessment data. Eligibility determination is made by the IEP team.",
      recommendations:
        "The IEP team should consider Aiyana's need for specially designed instruction in expressive and narrative language. Suggested targets include story grammar, sentence formulation, and organized retell using visual scaffolds.",
      summary:
        "Aiyana is a 7-year-old first grader with expressive/narrative language difficulties impacting classroom performance. Comprehensive evaluation data supports the IEP team's consideration of eligibility and services.",
    },
  },
];

export function getEvaluation(id: string) {
  return evaluations.find((e) => e.id === id);
}

export function statusTone(status: EvalStatus): "ready" | "review" | "waiting" | "missing" | "intake" {
  switch (status) {
    case "Ready to generate":
      return "ready";
    case "Draft in review":
      return "review";
    case "Waiting on parent":
    case "Waiting on teacher":
      return "waiting";
    case "Assessment info needed":
      return "missing";
    case "Intake needed":
      return "intake";
  }
}

export interface ChecklistItem {
  label: string;
  complete: boolean;
  required: boolean;
}

export function getChecklist(ev: Evaluation): ChecklistItem[] {
  return [
    { label: "Student demographics", complete: true, required: true },
    { label: "Referral reason", complete: Boolean(ev.referralReason), required: true },
    { label: "Parent questionnaire", complete: ev.parent.submitted, required: true },
    { label: "Teacher questionnaire", complete: ev.teacher.submitted, required: true },
    { label: "Assessment scores", complete: ev.assessments.entries.length > 0, required: true },
    { label: "SLP observations", complete: Boolean(ev.assessments.slpObservations), required: true },
    { label: "Previous evaluation", complete: Boolean(ev.previousEvaluation), required: false },
    { label: "Medical/developmental history details", complete: Boolean(ev.parent.medicalHistory), required: false },
    { label: "Educational history details", complete: Boolean(ev.teacher.academicImpact), required: false },
  ];
}

export function isReadyForDraft(ev: Evaluation) {
  const required = getChecklist(ev).filter((c) => c.required);
  return required.every((c) => c.complete);
}

/**
 * Derives the status / missingItems / nextAction / currentStep from the current
 * state of an evaluation's checklist. Kept in one place so the dashboard and
 * workspace stay consistent.
 */
export function deriveEvaluationState(ev: Evaluation): {
  status: EvalStatus;
  missingItems: string[];
  nextAction: string;
  currentStep: WorkflowStep;
} {
  const list = getChecklist(ev);
  const missing = list.filter((c) => c.required && !c.complete).map((c) => c.label);

  if (missing.length === 0) {
    return {
      status: "Ready to generate",
      missingItems: [],
      nextAction: "Generate AI draft for SLP review.",
      currentStep: "Draft",
    };
  }

  const has = (label: string) => missing.includes(label);
  const parentMissing = has("Parent questionnaire");
  const teacherMissing = has("Teacher questionnaire");
  const assessmentsMissing = has("Assessment scores") || has("SLP observations");

  if (parentMissing && teacherMissing) {
    return {
      status: "Waiting on parent",
      missingItems: missing,
      nextAction: "Send parent and teacher intake forms to collect background.",
      currentStep: "Parent input",
    };
  }
  if (parentMissing) {
    return {
      status: "Waiting on parent",
      missingItems: missing,
      nextAction: "Follow up with parent — questionnaire still pending.",
      currentStep: "Parent input",
    };
  }
  if (teacherMissing) {
    return {
      status: "Waiting on teacher",
      missingItems: missing,
      nextAction: "Follow up with the classroom teacher — questionnaire still pending.",
      currentStep: "Teacher input",
    };
  }
  if (assessmentsMissing) {
    return {
      status: "Assessment info needed",
      missingItems: missing,
      nextAction: "Enter assessment scores and SLP observations.",
      currentStep: "Assessments",
    };
  }
  return {
    status: "Intake needed",
    missingItems: missing,
    nextAction: "Complete the remaining intake items.",
    currentStep: "Student info",
  };
}