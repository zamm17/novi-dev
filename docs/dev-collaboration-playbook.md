# Novi Development Collaboration Playbook

This playbook explains how the Novi team should collaborate on the MVP codebase. It is written for founders and collaborators who may be new to coding, GitHub, version control, Lovable, Supabase, or AI coding tools.

The short version: GitHub is the source of truth. Lovable, Codex, Claude Code, Cursor, and future engineers can all help edit the product, but the durable record of the product should live in the GitHub repository.

## Current Novi Setup

Novi is currently an evaluation automation prototype for school-based Speech-Language Pathologists.

The current app includes:

- A React and TypeScript frontend originally built through Lovable.
- A dashboard showing fictional evaluation cases.
- Parent and teacher intake forms.
- Browser-session demo storage for intake and assessment submissions.
- A Supabase Edge Function for AI draft generation.
- An OpenAI API call made server-side from Supabase, not from the browser.
- A local deterministic fallback draft if AI generation is unavailable.
- Markdown docs that preserve product, role, prototype debt, and collaboration context.

Current repo:

- GitHub app repo: `zamm17/novi-dev`
- Main product context: `docs/novi-primer.md`
- Prototype debt: `docs/prototype-debt.md`
- Dev/CTO advisor role: `docs/agent-roles/dev-cto-advisor.md`

Current prototype constraints:

- Use fictional data only.
- Do not enter real student, parent, teacher, clinical, district, or school data.
- Do not commit private API keys.
- Do not treat the prototype as production-ready.
- Keep `main` demo-stable whenever possible.

## Mental Model

Think of the project like this:

- GitHub is the shared notebook and source of truth.
- Lovable is a fast visual/frontend editing tool.
- Supabase is the backend and AI execution layer.
- Codex, Claude Code, Cursor, and similar tools are assistants that can edit the repo.
- Future hosting can happen outside Lovable because the code is portable.

Lovable is useful, but Novi should not be dependent on Lovable as the only place where the product exists. The repo should remain clean enough that a software engineer can clone it, run it, inspect it, and deploy it somewhere else later.

## Who Should Have Access

Co-founders who are actively building should usually have GitHub access.

Recommended access:

- Active builder/co-founder: GitHub `Write` access.
- Reviewer/advisor: GitHub `Read` or `Triage` access.
- Future engineer: GitHub `Write` access, and possibly admin access later.

Supabase access is separate from GitHub access.

Give Supabase access only to people who need to work on:

- Edge Functions
- database schema
- environment variables
- logs
- authentication
- storage
- backend settings

Do not share OpenAI API keys directly in chat, docs, screenshots, GitHub, Lovable prompts, or frontend code.

## Source Of Truth

GitHub should be the source of truth for:

- app code
- Supabase Edge Function code
- durable product docs
- collaboration docs
- prototype debt
- smoke-test checklists
- implementation decisions

Lovable can generate code, but after Lovable finishes, the important question is: did the change land in GitHub?

If a change is not in GitHub, assume it may be lost.

## Branching And Commits

`main` should mean: this version is safe to show in a demo.

Use branches for meaningful work.

Good branch examples:

- `feature/new-evaluation-flow`
- `feature/input-quality-checks`
- `fix-parent-autofill`
- `fix-ethan-assessment-save`
- `docs-collaboration-playbook`
- `supabase-draft-generation`

Small docs edits or tiny visual cleanups can go directly to `main` while we are moving fast, but as soon as multiple people are building, branches are safer.

Use this rule:

- Tiny typo or small docs cleanup: direct to `main` is okay.
- UI change that affects a demo flow: branch.
- AI generation, Supabase, data model, auth, forms, routing, or storage change: branch.
- Anything before a user-facing demo: branch, review, smoke test, then merge.

## Pull Requests

A pull request, often called a PR, is a proposed change before it becomes part of `main`.

For Novi right now, PRs do not need to be formal or slow. They are just a checkpoint.

A good PR should answer:

- What changed?
- Why did we change it?
- How did we test it?
- Any risk or follow-up?

Simple PR template:

```md
## What changed

## Why

## How I tested

## Notes / follow-up
```

Before merging into `main`, check:

- The app still opens.
- The main demo path still works.
- No real data was added.
- No secrets were committed.
- Any relevant smoke-test checklist still passes.

## Working With Lovable

Lovable is useful for fast frontend iteration. It can create screens, adjust styling, and make React code changes quickly.

Best practices:

- Prefer giving Lovable one focused prompt at a time.
- Ask Lovable to keep changes small and scoped.
- Tell Lovable not to add backend storage unless we explicitly want that.
- Tell Lovable not to add Lovable Cloud AI generation paths.
- Confirm each useful Lovable change is saved to GitHub.
- Review code after larger Lovable changes.

For non-trivial work, ask Lovable to work on a branch if available.

Examples of good Lovable prompts:

- "Fix the parent form autofill dropdown mismatch only. Do not redesign the page."
- "Add a New evaluation setup flow. Keep data in browser session only for now."
- "Update the dashboard counters. Do not change Supabase generation."

Examples of prompts to avoid:

- "Make everything production-ready."
- "Add auth, database, AI, and forms."
- "Improve the whole app."

Broad prompts invite broad, hard-to-review changes.

## Working With Codex, Claude Code, Cursor, Or Similar Tools

AI coding tools can help with:

- reviewing code
- writing focused changes
- creating docs
- debugging errors
- explaining unfamiliar code
- generating test plans
- preparing Lovable prompts

Best practices:

- Have the tool inspect the existing code before suggesting changes.
- Keep requests specific.
- Ask for a summary of files changed.
- Ask for risks and test steps.
- Do not paste real student or clinical data into AI tools.
- Do not paste private API keys into AI tools.

Good request:

"Review the parent and teacher intake flow. Check whether submitting each form updates the correct student and whether the dashboard status changes correctly."

Risky request:

"Rewrite the app."

## Working With Supabase

Supabase currently provides the backend function that calls OpenAI.

Important concepts:

- The frontend can safely know the Supabase project URL and public key for this prototype, though hardcoding them is prototype debt.
- The OpenAI API key must stay server-side in Supabase Edge Function secrets.
- Supabase Edge Function logs can help debug failed generation.
- Supabase invocation counts help confirm whether the frontend called the function.

Do not put `OPENAI_API_KEY` in:

- frontend `.env` variables
- Lovable public variables
- GitHub files
- screenshots
- docs
- browser code

For broader testing or real data, Supabase will need:

- authentication
- Row Level Security policies
- database tables
- secure intake tokens
- audit logs
- rate limits
- data retention rules

## Secrets And Sensitive Data

This matters a lot because Novi will eventually handle student and clinical data.

Never commit:

- OpenAI API keys
- Supabase service role keys
- private database passwords
- real student names
- real parent responses
- real teacher responses
- real evaluations
- real IEPs
- screenshots containing real student data

For this prototype:

- Use fictional data only.
- Keep demo submissions in browser localStorage.
- Keep generated drafts fictional.
- Keep all UXR participant testing data fictional unless we have proper consent, security, and compliance processes.

## Demo Stability

Before showing the product to a co-founder, SLP, advisor, or test user:

1. Pull or open the latest GitHub/Lovable version.
2. Reset demo data.
3. Run the smoke test.
4. Confirm AI generation uses Supabase if expected.
5. Confirm the fallback message only appears when AI is unavailable.
6. Confirm no broken or confusing demo-only state remains.

The most important demo path today is:

1. Open dashboard.
2. Open Maya Rodriguez.
3. Complete parent intake with autofill.
4. Complete teacher intake with autofill.
5. Confirm Maya becomes ready to generate.
6. Generate the evaluation draft.
7. Review the 16 editable draft sections.

Secondary demo paths:

- Jamal: parent-only intake.
- Sophie: teacher-only intake.
- Ethan: add assessment data and SLP observations, then generate.
- Aiyana: draft already in review.

## Current Product Direction To Preserve

The P0 wedge is evaluation automation.

Keep Novi centered on:

- parent information collection
- teacher information collection
- missing information detection
- structured assessment and observation inputs
- near-complete editable evaluation drafts
- SLP review and clinical decision-making

Avoid drifting into:

- generic AI chat
- unsupported clinical claims
- therapy activity generation as the primary MVP
- overbuilt district infrastructure before individual SLP validation

## Input Quality Principles

Novi's AI output will only be as good as its inputs.

The product should make input collection:

- easy enough that parents and teachers actually complete it
- structured enough that the AI can use it
- specific enough to include real examples
- cautious enough to avoid overclaiming
- transparent enough that the SLP can review sources

Parent and teacher forms should prefer:

- short sections
- plain language
- concrete examples
- conditional follow-up questions
- checkboxes plus short narrative fields
- "not sure" options where appropriate

The SLP workspace should distinguish:

- missing required information
- present but weak information
- optional context
- possible clinical caution flags

This helps avoid garbage-in, garbage-out draft generation.

## What To Do When Something Breaks

If the app breaks after a change:

1. Do not panic.
2. Identify the last change or commit.
3. Check whether it was a Lovable change, manual code change, or Supabase change.
4. Read the error message.
5. Ask Codex or another coding assistant to inspect the diff.
6. If on a branch, fix the branch before merging.
7. If already on `main`, create a fix branch or use GitHub to compare/revert carefully.

Avoid destructive Git actions unless an engineer confirms the path.

Do not use commands like reset, force push, or hard revert unless everyone understands what will be lost.

## When A Future Engineer Joins

Give the engineer:

- GitHub repo access.
- This playbook.
- `docs/novi-primer.md`.
- `docs/prototype-debt.md`.
- Supabase access if they are handling backend work.
- A walkthrough of the current demo.

Ask them first to:

- run the app locally
- review prototype debt
- review the Supabase function
- check the data model direction
- recommend the path from prototype storage to Supabase-backed storage

Good first engineering tasks:

- add a real schema for evaluations, students, intake submissions, assessments, and drafts
- add authentication and Row Level Security
- remove hardcoded prototype config
- add proper draft persistence
- add structured AI outputs and prompt versioning
- add smoke tests or lightweight automated tests for core flows

## Collaboration Norms

Move fast, but keep a trail.

Good habits:

- Write short commits.
- Use branches for meaningful changes.
- Keep `main` demo-stable.
- Update docs when product assumptions change.
- Track prototype shortcuts instead of forgetting them.
- Review AI-generated code before trusting it.
- Use fictional data only.
- Ask "does this help validate the P0 workflow?" before adding complexity.

The goal is not perfect process. The goal is enough structure that founders, AI tools, Lovable, and future engineers can all work on Novi without stepping on each other.
