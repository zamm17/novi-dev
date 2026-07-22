# Novi prototype smoke test

Run this manual checklist before any demo. All data is fictional and stored
in the current browser only.

## Reset

- [ ] Click **Reset demo data** in the sidebar.

## Dashboard

- [ ] Shows 5 active evaluations.
- [ ] No "Assessment info needed" counter or status appears anywhere.
- [ ] "Due within one week" counter shows at least 2 students.

## Maya Rodriguez — full end-to-end

- [ ] Maya starts as **Missing information** with both parent and teacher
      questionnaires marked missing.
- [ ] Open Maya's **parent** intake form, click **Autofill demo responses**
      once, submit. Return to Maya's workspace → Parent Input is submitted.
- [ ] Open Maya's **teacher** intake form, click **Autofill demo responses**
      once, submit. Return to Maya's workspace → Teacher Input is submitted.
- [ ] Maya's status becomes **Ready to generate**.
- [ ] Click **Generate draft**. All 16 editable sections render:
      Evaluation information, Reason for referral, Sources of data,
      Background and history, Parent input summary, Teacher input summary,
      Behavioral observations, Testing conditions and validity,
      Assessment results, Speech sound profile, Present levels,
      Educational impact, Interpretation, Eligibility considerations,
      Recommendations, Summary.
- [ ] When the Edge Function succeeds, the Supabase function invocation
      counter increases by 1.
- [ ] The "Using local demo draft" toast appears **only** when the Edge
      Function is unavailable.

## Other sample students

- [ ] **Jamal** supports a parent-only intake demo (teacher already in).
- [ ] **Sophie** supports a teacher-only intake demo (parent already in).
- [ ] **Aiyana** opens with a draft already in review.
