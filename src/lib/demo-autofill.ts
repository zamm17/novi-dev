// Demo-only autofill helpers for the parent/teacher intake forms.
// Applies fictional values to named form controls so testers can move
// through the end-to-end demo quickly without filling every field.

export type AutofillValues = Record<string, string | string[]>;

function nativeValueSetter(el: HTMLElement) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  return Object.getOwnPropertyDescriptor(proto, "value")?.set;
}

function setNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
) {
  const setter = nativeValueSetter(el);
  if (setter) setter.call(el, value);
  else (el as { value: string }).value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function setNativeChecked(el: HTMLInputElement, checked: boolean) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked")?.set;
  if (setter) setter.call(el, checked);
  else el.checked = checked;
  el.dispatchEvent(new Event("click", { bubbles: true }));
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function applyOnce(form: HTMLFormElement, values: AutofillValues): number {
  let count = 0;
  for (const [name, val] of Object.entries(values)) {
    const nodes = form.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(`[name="${CSS.escape(name)}"]`);
    if (nodes.length === 0) continue;
    nodes.forEach((el) => {
      if (
        el instanceof HTMLInputElement &&
        (el.type === "checkbox" || el.type === "radio")
      ) {
        const arr = Array.isArray(val) ? val : [val];
        const shouldCheck = arr.includes(el.value);
        if (el.checked !== shouldCheck) {
          setNativeChecked(el, shouldCheck);
          count++;
        }
        return;
      }
      const str = Array.isArray(val) ? val.join(", ") : val;
      if (el.value !== str) {
        setNativeValue(el, str);
        count++;
      }
    });
  }
  return count;
}

/**
 * Apply autofill values to a form. Runs immediately and again on the next
 * animation frame so uncontrolled inputs settle on the first user click even
 * if hydration or re-renders would otherwise clobber the initial write.
 * Returns the number of fields updated on the initial pass.
 */
export function applyAutofill(form: HTMLFormElement, values: AutofillValues): number {
  const count = applyOnce(form, values);
  const rerun = () => {
    if (form.isConnected) applyOnce(form, values);
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(rerun);
  else setTimeout(rerun, 0);
  return count;
}

/**
 * Fictional demo values with the student's first name / last name substituted
 * in so multiple sample evaluations can autofill sensibly.
 */
export function parentAutofill(firstName: string, lastName: string): AutofillValues {
  const F = firstName;
  return {
  "Q:Parent info > Your name": `Parent of ${F}`,
  "Q:Parent info > Relationship": "Guardian",
  "Q:Parent info > Best way to reach you": "Email",
  "Q:Parent info > Contact info": `parent.${F.toLowerCase()}@example.com`,

  "Q:Main concerns > Concerns":
    `${F} is hard to understand when talking quickly, and I've noticed some communication frustration recently.`,
  "Q:Main concerns > When first noticed": "Around the start of the school year",
  "Q:Main concerns > What to understand":
    `${F} is aware of communication difficulties and sometimes hesitates in class as a result.`,

  "Q:Child strengths > Communication strengths":
    `${F} is social, curious, and communicates strongly with familiar family and friends.`,
  "Q:Child strengths > Enjoys":
    "Drawing, animals, reading, and active play.",
  "Q:Child strengths > What helps":
    "Slowing down, visual cues, and patient listeners.",

  "Q:Developmental history > First words":
    "Around 12 months — approximate age.",
  "Q:Developmental history > Combining words":
    "Around age 2. Early milestones were generally on time.",
  "Q:Developmental history > Milestones or concerns":
    "Early milestones were generally on time; exact ages not fully remembered.",

  "Q:Medical and hearing history > Recent hearing screening": "Yes",
  "Q:Medical and hearing history > Hearing screening details":
    "Passed school hearing screening in spring 2026.",
  "Q:Medical and hearing history > Ear infections or tubes":
    "A few ear infections as a toddler, no current hearing concerns.",
  "Q:Medical and hearing history > Relevant medical history":
    "No major medical concerns reported.",
  "Q:Medical and hearing history > Medications or diagnoses": "None.",

  "Q:Language background > Primary language": "English",
  "Q:Language background > Languages understood": "English",
  "Q:Language background > Languages spoken": "English",
  "Q:Language background > Languages with family": "English at home",
  "Q:Language background > Needs interpreter": "No",
  "Q:Language background > Concerns show up in": "English only",

  "Q:Communication at home > Usual communication":
    `${F} uses full sentences and asks questions. Sometimes repeats when misunderstood.`,
  "Q:Communication at home > Easiest":
    "One-on-one conversations at home with familiar family.",
  "Q:Communication at home > Hardest":
    "Being understood by unfamiliar listeners.",

  "Q:School history > Prior evaluations or plans":
    "No prior IEP or 504 plan.",
  "Q:School history > Outside academic support": "None.",
  "Q:School history > Academic concerns":
    "Teacher has provided reminders and informal supports.",
  "Q:School history > Attendance / school changes":
    "Regular attendance, no school changes.",

  "Q:Prior services > Previous speech therapy":
    "No previous speech therapy.",
  "Q:Prior services > Outside services": "None.",
  "Q:Prior services > Helpful strategies":
    "Slowing down and repeating helps a lot.",

  "Q:Final notes > Anything else":
    `Family would like ${F} ${lastName} to feel more confident participating in class.`,
  };
}

export function teacherAutofill(firstName: string, lastName: string): AutofillValues {
  const F = firstName;
  return {
  "Q:Teacher info > Your name": "Ms. Patel",
  "Q:Teacher info > Role": "General education teacher",
  "Q:Teacher info > Best way to reach you": "Email",
  "Q:Teacher info > Contact info": "patel@example.edu",

  "Q:Student strengths > Strengths":
    `${F} participates, works hard, and is kind with peers.`,
  "Q:Student strengths > Successful settings":
    "Small group discussion and partner work.",

  "Q:Classroom concerns > Concerns":
    `Communication difficulties reduce participation during whole-group and unfamiliar-listener contexts.`,
  "Q:Classroom concerns > Settings": [
    "Whole-group instruction",
    "Small group / partner work",
    "Recess / social",
  ],
  "Q:Classroom concerns > Frequency": "Daily",

  "Q:Academic impact > Reading / listening comprehension": "Not a concern",
  "Q:Academic impact > Written expression": "Sometimes",
  "Q:Academic impact > Oral participation": "Often",
  "Q:Academic impact > Following directions": "Sometimes",
  "Q:Academic impact > Other impact":
    `Peers occasionally ask ${F} to repeat during oral reading.`,

  "Q:Functional communication > Following multi-step oral directions": "Sometimes",
  "Q:Functional communication > Asking for help": "Not a concern",
  "Q:Functional communication > Answering questions": "Sometimes",
  "Q:Functional communication > Retelling or explaining": "Often",
  "Q:Functional communication > Peer interaction": "Sometimes",
  "Q:Functional communication > Group discussion": "Often",

  "Q:Educational impact > Areas affected": [
    "Oral participation",
    "Peer interaction",
    "Confidence / willingness to participate",
  ],
  "Q:Educational impact > Notes":
    `Communication is the main barrier to full classroom participation for ${F}.`,

  "Q:Examples > Example 1 — setting": "Oral reading group",
  "Q:Examples > Example 1 — what happened":
    `${F} had trouble being understood and peers asked ${F} to repeat.`,
  "Q:Examples > Example 1 — impact":
    `${F} lost place and became quieter for the rest of the activity.`,
  "Q:Examples > Example 2 — setting": "Science share-out",
  "Q:Examples > Example 2 — what happened":
    `${F} spoke quietly after being misunderstood by a peer.`,
  "Q:Examples > Example 2 — impact":
    "Reduced participation for the rest of the share-out.",

  "Q:Supports tried > Visual supports": "Helped",
  "Q:Supports tried > Repetition / rephrasing": "Somewhat helped",
  "Q:Supports tried > Small group support": "Helped",
  "Q:Supports tried > Sentence starters": "Not tried",
  "Q:Supports tried > Extra wait time": "Helped",
  "Q:Supports tried > Preferential seating": "Not tried",
  "Q:Supports tried > Other supports":
    "Gentle correction and modeling the target sound.",

  "Q:Domain check > Areas of concern": ["Speech intelligibility"],

  "Q:Final notes > Anything else":
    `${F} ${lastName} is motivated and responds well to gentle support.`,
  };
}