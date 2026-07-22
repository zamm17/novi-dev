# Novi Primer

## Executive Summary

Novi is an AI-powered workflow platform built exclusively for Speech-Language Pathologists (SLPs). The long-term vision is to become the operating system for school-based SLPs by eliminating administrative work that consumes hours every week while eventually adding high-value clinical tools.

The company originally started around Language Sample Analysis (LSA) automation, but customer discovery revealed that administrative work is a much more frequent and painful problem, especially in schools. As a result, the MVP has pivoted toward evaluation automation, while LSA remains a major future differentiator and potential competitive moat.

## Target User

Primary persona: Jenny, a 27-year-old California school-based SLP in an elementary school.

Jenny's context:

- Caseload around 50-70 students
- Works across multiple schools
- Uses SEIS and other district software
- Balances therapy, evaluations, IEPs, meetings, scheduling, and documentation

Jenny's goals:

- Spend more time providing therapy
- Finish paperwork before evenings and weekends
- Reduce repetitive documentation
- Avoid missing deadlines
- Produce high-quality evaluations quickly

Current workflow:

1. Receives referral
2. Collects teacher information
3. Collects parent information
4. Schedules assessment
5. Performs testing
6. Writes evaluation
7. Creates IEP if student qualifies
8. Provides therapy
9. Tracks progress
10. Writes progress reports
11. Handles reevaluations

Much of this process is fragmented across emails, PDFs, paper forms, district software, and manual copy/paste.

## Product Vision

Long term, Novi should become the AI operating system for school SLPs.

Novi is not just AI writing. It should:

- Collect information
- Organize information
- Generate drafts
- Surface missing information
- Automate repetitive workflows
- Eventually assist with clinical decision support

## Current Focus: P0

The current focus is administrative automation, especially an AI Evaluation Generator.

Goal: generate a near-complete first draft of an evaluation using structured inputs. The SLP remains the clinical decision maker.

Must-have inputs include:

- Student demographics
- Referral reason
- Assessment scores
- Observations
- Parent questionnaire
- Teacher questionnaire
- Medical/developmental history
- Educational history
- Previous evaluations, optional initially
- Eligibility information where applicable

The product should identify missing information before generation.

## Parent Portal

Parents complete:

- Developmental history
- Medical history
- Concerns
- Communication background

This replaces emailing PDFs and chasing incomplete paperwork.

## Teacher Portal

Teachers complete:

- Classroom concerns
- Academic performance
- Functional communication
- Behavior observations

This also replaces PDF-based information collection.

## AI Draft

Once inputs are collected, AI generates:

- Background
- Present levels
- Interpretation
- Narrative sections
- Recommendations
- Summary

The SLP edits and signs off.

## Future Roadmap

Clinical:

- Advanced Language Sample Analysis
- Automatic transcription
- SALT-style metrics
- MLU
- NDW
- TTR
- PGU
- Bilingual support
- Error tagging

Documentation:

- IEP draft generation
- Progress reports
- Reevaluations
- Session summaries
- Medicaid documentation

Therapy:

- Activity generation
- Lesson planning
- Goal suggestions
- Material recommendations
- Homework creation

Workflow:

- Scheduling assistance
- Deadline reminders
- Caseload management
- Missing paperwork detection
- Student timeline
- District reporting

## Buyers

Initial buyer: individual SLPs.

Reasons:

- Easier validation
- Faster feedback
- Less procurement

Long-term buyer: school districts.

Reasons:

- Larger contracts
- Central purchasing
- More defensible business
- District-wide deployment
- Higher ARR potential

## Tech Stack

Previous prototype stack:

- Frontend: Lovable, React, TypeScript, Tailwind
- Backend: Supabase, Supabase Edge Functions
- AI: OpenAI APIs
- Storage: Supabase

Architecture philosophy:

- Keep backend thin
- Push AI orchestration into Edge Functions
- Iterate extremely quickly

## Customer Discovery Insights

Largest validated pain points:

- Evaluations: gathering information, waiting on teachers and parents, writing repetitive sections, copy/paste, formatting
- Information collection: chasing teachers and parents, following up, managing incomplete forms
- Scheduling: classroom schedules, specials, pull-out conflicts, testing windows
- IEP documentation: repetitive documentation burden
- Language Sample Analysis: clinically valuable and painful, but less frequent than evaluations

Lower-priority items that generated noticeably less excitement:

- SOAP notes
- Therapy activity generation
- Generic AI chat

## Competitive Landscape

Current competitors include:

- SLP Toolkit
- Presence
- SEIS
- SALT
- Various report templates

Most products solve pieces of the workflow. Few solve end-to-end evaluation creation, information collection, AI drafting, and future LSA integration.

The opportunity is becoming the workflow hub rather than another isolated tool.

## Why This Problem Matters

An evaluation may require multiple stakeholders, numerous documents, several hours of writing, and repetitive language. The SLP is performing work that is only partially clinical.

Reducing this burden creates:

- More therapy time
- Less burnout
- Faster turnaround
- Better consistency

## Market Opportunity

Approximate United States market:

- Around 160k licensed SLPs
- Around 55-70k school-based SLPs
- Thousands of school districts
- Large and recurring evaluation workload

Revenue opportunity depends on pricing and district penetration, but the business has the potential to reach multi-million-dollar ARR, with a credible path into the tens of millions of ARR if Novi becomes the standard workflow platform across districts.

Expansion into pediatric clinics, private practices, and adjacent therapy disciplines such as OT/PT could further increase the addressable market.

## Product Philosophy

1. Solve the highest-frequency pain first.
2. AI assists. The clinician remains responsible.
3. Workflow beats isolated features.
4. Information collection is part of the product.
5. Build trust first through editable outputs, reviewable suggestions, and clinical transparency.

## Long-Term Vision

If successful, Novi becomes the central workspace where school SLPs manage the entire lifecycle of a student, from referral and information gathering through evaluations, IEPs, therapy, progress monitoring, and advanced clinical tools like Language Sample Analysis.
