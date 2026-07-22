# Novi Prototype Debt

This file tracks intentional shortcuts in the current Novi evaluation automation prototype.

Current prototype goal: show founders and early SLP test users an end-to-end evaluation workflow using fictional data only. These items are acceptable for that goal, but should not be forgotten before real users, real student data, or district pilots.

## Current Working Prototype

- Frontend is built with Lovable, React, TypeScript, and Tailwind.
- Parent and teacher intake submissions are stored in browser localStorage for the demo student.
- AI draft generation calls a Supabase Edge Function.
- The Supabase Edge Function calls OpenAI using `OPENAI_API_KEY` stored server-side in Supabase secrets.
- The app keeps a deterministic local fallback so demos still work if AI generation fails.
- All generated draft sections remain editable by the SLP.

## Fix Before Any Real Student Data

- Add authentication for SLP users.
- Remove localStorage as the source of truth for parent, teacher, assessment, and draft data.
- Store evaluation data in Supabase tables with Row Level Security policies.
- Add explicit access controls for SLP, parent, teacher, and future district/admin roles.
- Replace shared/demo intake routes with per-student secure links or tokenized access.
- Add token expiration, revocation, and single-student scoping for parent/teacher forms.
- Lock CORS down from `*` to approved app domains.
- Add rate limiting or quota controls to the Edge Function to reduce cost abuse.
- Add payload size limits to the Edge Function.
- Add audit logs for intake submission, draft generation, draft edits, and export/copy events.
- Add data retention/deletion policy support.
- Confirm vendor/data-processing requirements before allowing real student, parent, or clinical data.

## Fix Before Broader UXR Or Paid Pilots

- Move public Supabase config out of hardcoded prototype constants and into proper deploy-time environment variables.
- Remove any temporary prototype debug UI after verification.
- Keep technical AI errors in logs or console only; show user-friendly fallback messages in the app.
- Delete or disable any unused Lovable Cloud function that was created during setup.
- Set OpenAI project budget limits and alerts.
- Add basic monitoring for Edge Function invocation count, error rate, latency, and OpenAI failures.
- Add a one-click prototype-only AI connection test or internal diagnostics panel, hidden from normal UXR participants.
- Add a clear fictional-data banner for all demo intake routes and evaluation pages.
- Clean up mock caseload inconsistencies so every row's status matches its missing information.
- Make assessment and observation edits affect draft readiness, not just local UI state.
- Decide whether generated drafts should be saved in browser state, Supabase, or not saved at all during testing.

## AI Workflow Hardening

- Replace the current chat-completions call with the preferred current OpenAI API surface before production.
- Use structured output/schema enforcement for `DraftSections` rather than relying only on prompt instructions and parser coercion.
- Add model/version configuration in the Edge Function environment.
- Add prompt versioning so generated drafts can be traced to the prompt used.
- Add lightweight eval cases for common evaluation types, including speech sound, language, fluency, and bilingual considerations.
- Add safeguards for missing, conflicting, or low-quality parent/teacher responses.
- Add clearer source attribution in the draft editor so SLPs can see which input supported each section.
- Avoid clinical claims that exceed supplied data; keep eligibility language team-based and cautious.

## Security And Cost Notes

- The Supabase anon/public key is browser-visible by design, but hardcoding it is still a prototype shortcut.
- The OpenAI API key must never be committed, shown in frontend code, or placed in Lovable Cloud secrets for this flow.
- A public Edge Function endpoint can be abused if someone obtains the URL and public key. Rate limits, auth, and budget alerts are required before wider sharing.
- The deterministic fallback is useful for demos, but users should be able to tell when AI generation failed versus succeeded.

## Current Known Demo Issues

- Autofill buttons are demo-only and should not appear in production intake forms.
- Parent/teacher form submissions only update the current browser.
- There is no backend persistence for evaluation state or generated drafts.
- The current demo is centered on Maya Rodriguez and does not support true multi-student intake links.
- Lovable-managed Supabase environment variables previously pointed to the wrong Supabase project, so the AI client was pinned to the known working prototype Supabase project.
