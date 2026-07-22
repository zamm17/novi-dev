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

export const parentAutofill: AutofillValues = {
  "Q:Parent info > Your name": "Elena Rodriguez",
  "Q:Parent info > Relationship": "Mother",
  "Q:Parent info > Best way to reach you": "Email",
  "Q:Parent info > Contact info": "elena.rodriguez@example.com",

  "Q:Main concerns > Concerns":
    "Maya is hard to understand when she talks quickly, especially with /r/, /s/, and /th/ sounds.",
  "Q:Main concerns > When first noticed": "Kindergarten",
  "Q:Main concerns > What to understand":
    "Maya is aware of her speech errors and sometimes avoids reading aloud.",

  "Q:Child strengths > Communication strengths":
    "Maya is social, curious, and loves explaining stories and science facts.",
  "Q:Child strengths > Enjoys":
    "Drawing, animals, reading graphic novels, and playing soccer.",
  "Q:Child strengths > What helps":
    "Slowing down, visual cues, and reminders to try the sound again.",

  "Q:Developmental history > First words":
    "Around 12 months, though I don't remember the exact age.",
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
  "Q:Language background > Languages understood": "English, some Spanish",
  "Q:Language background > Languages spoken": "English, some Spanish",
  "Q:Language background > Languages with family":
    "Spanish with grandparents and extended family",
  "Q:Language background > Needs interpreter": "No",
  "Q:Language background > Concerns show up in": "English only",

  "Q:Communication at home > Usual communication":
    "Uses full sentences, tells stories, and asks questions. Sometimes repeats herself when misunderstood.",
  "Q:Communication at home > Easiest":
    "One-on-one conversations at home with familiar family.",
  "Q:Communication at home > Hardest":
    "Being understood by unfamiliar listeners when she talks quickly.",

  "Q:School history > Prior evaluations or plans":
    "No prior IEP or 504 plan.",
  "Q:School history > Outside academic support": "None.",
  "Q:School history > Academic concerns":
    "Teacher has provided reminders and informal speech sound practice.",
  "Q:School history > Attendance / school changes":
    "Regular attendance, no school changes.",

  "Q:Prior services > Previous speech therapy":
    "No previous speech therapy.",
  "Q:Prior services > Outside services": "None.",
  "Q:Prior services > Helpful strategies":
    "Slowing down and repeating the word helps her be understood.",

  "Q:Final notes > Anything else":
    "Parent would like Maya to feel more confident speaking in class.",
};

export const teacherAutofill: AutofillValues = {
  "Q:Teacher info > Your name": "Ms. Patel",
  "Q:Teacher info > Role": "General education teacher",
  "Q:Teacher info > Best way to reach you": "Email",
  "Q:Teacher info > Contact info": "patel@lincoln.example.edu",

  "Q:Student strengths > Strengths":
    "Maya participates, works hard, has strong vocabulary, and is kind with peers.",
  "Q:Student strengths > Successful settings":
    "Small group discussion and partner work.",

  "Q:Classroom concerns > Concerns":
    "Speech sound errors reduce intelligibility, especially during oral reading and fast connected speech.",
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
    "Peers occasionally ask her to repeat during oral reading.",

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
    "Intelligibility is the main barrier to full classroom participation.",

  "Q:Examples > Example 1 — setting": "Oral reading group",
  "Q:Examples > Example 1 — what happened":
    "Maya produced /s/ and /th/ errors and peers asked her to repeat herself.",
  "Q:Examples > Example 1 — impact":
    "She lost her place and became quieter for the rest of the activity.",
  "Q:Examples > Example 2 — setting": "Science share-out",
  "Q:Examples > Example 2 — what happened":
    "She spoke quietly after being misunderstood by a peer.",
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
    "Maya is motivated and responds well to gentle correction.",
};