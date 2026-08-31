# LinguaX — Phase 1

**English for the moments that matter.**

A CEFR-aligned English learning application built on the Tim Ferriss grammar-deconstruction method.

## Project Overview

- **Name**: LinguaX
- **Version**: Phase 1.0.0
- **Goal**: Structured, CEFR-aligned English learning — grammar, practice, scenarios, transfer
- **Stack**: Hono + TypeScript + Cloudflare Pages (Edge)
- **Frontend**: Vanilla JS SPA with no framework dependency
- **Data**: Fully seeded curriculum in `public/static/js/data.js` (CURATED_CORE)

## URLs

- **Landing Page**: `/` — Marketing page with design reference + feature overview
- **App**: `/app` — Full SPA learning application
- **API Health**: `/api/health`

## Application Architecture

```
/ (Landing)          → Marketing landing page
/app                 → Learner dashboard (role-aware)
/app#/lesson         → Lesson viewer (12 stages)
/app#/teacher        → Teacher review dashboard
/app#/admin          → Platform admin content management
```

## CEFR Levels Supported

A0 · A1 · A2 · B1 · B2 · C1 · C2 (plus A0/Pre-A1 foundation)

## MVP Lesson: A1 Lost Property

**ID**: `A1-BE-LOST-PROPERTY-001`  
**Grammar**: Present simple `is/are` + Possession `'s` + Questions `Is/Are…?`  
**Core sentences**: #1, #2, #7, #8 (Tim Ferriss deconstruction set)  
**Scenario**: Lost property desk → Hotel reception (transfer)

### 12 Lesson Stages

| Stage | Label | Description |
|---|---|---|
| 0 | Overview | Lesson map, objective, grammar focus |
| 1 | Visual Time | Object visuals + language mind-map |
| 2 | Grammar Focus | Definition, how/when/why, errors, verb-to-be table |
| 3 | Core Sentences | 4 model sentences with breakdown, word tables, tense links |
| 4 | Vocabulary | 5 groups: objects, descriptions, ownership, actions, locations |
| 4b | Useful Sentences | 5 groups: statements, questions, negatives, polite, expansion |
| 5 | Practice | Recognition (6), Matching (4), Controlled (5), Transform (4) |
| 5b | Guided Dialogue | 6-turn scripted lost-property dialogue with choices |
| 5c | Information Gap | Match 4 objects to 4 owners via questioning |
| 6 | Transfer Challenge | 4 curated scenarios (hotel, classroom, shopping, airport) |
| 7 | Feedback & Rubric | 8-dimension rubric, 0–16 score, band feedback |
| 8 | Review Plan | 6-point spaced review schedule |

## Role System

Switch roles via the dev toolbar (top of app):

| Role | View | Access |
|---|---|---|
| 👩‍🎓 Learner | Dashboard + Lesson | Personal progress, exercises, scenarios |
| 👩‍🏫 Teacher | Teacher Dashboard | Learner list, attempt records, review schedule |
| 🛠️ Platform Admin | Admin Panel | Content governance, grammar points, scenarios |

## Content Governance

Two content types enforced throughout:

- **`CURATED_CORE`**: Platform-created, protected, locked. Grammar definitions, core sentences, canonical scenarios, assessment standards.
- **`AI_GENERATED_PRACTICE`**: _(Phase 2)_ Generated from approved templates only. Always tagged with source lesson ID, grammar point, CEFR level, scenario family, validation status.

### Stage 05 / Stage 06 Isolation (Key Design)

```
Curated lesson v1.0.0
  ├── Stage 05 curated scenario → immutable attempt snapshot (protected)
  │     └── Learner attempt record (stage05_curated_scenario)
  └── Stage 06 transfer scenarios → separate attempt records
        └── Learner attempt record (stage06_transfer_scenario)
              ├── scenarioId (from curated bank or future AI)
              ├── sourceStage05AttemptId (links back)
              ├── validationStatus
              └── generationRequestId (null = curated, uuid = AI)
```

## Data Architecture

### Seeded Data (data.js)

- `LX.cefrLevels` — 7 CEFR levels with support rules and output expectations
- `LX.verbToBe` — Present, past, future verb-to-be reference tables
- `LX.grammarPoints` — 4 grammar points for A1 lesson
- `LX.coreSentences` — All 12 Tim Ferriss deconstruction sentences
- `LX.scenarioFamilies` — 10 approved scenario families
- `LX.lesson_A1_001` — Complete MVP lesson with all 12 stages of content
- `LX.learnerData` — Simulated learner profile and progress (replaces Supabase in Phase 1)
- `LX.teacherData` — Simulated teacher profile and learner roster
- `LX.adminData` — Simulated admin profile and content stats

### Mastery Rubric (8 dimensions, 0–2 per dimension, max 16)

| Score | Band | Action |
|---|---|---|
| 0–5 | Reteach | More support needed |
| 6–10 | Emerging | Repeat guided practice |
| 11–13 | Functional | Fresh scenario expansion |
| 14–16 | Independent | Advance + spaced review |

## Local Development

```bash
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs

# Or directly:
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

## Deployment

```bash
npm run build
npx wrangler pages deploy dist --project-name webapp
```

## Phase 2 Roadmap

- [ ] Supabase integration (auth, Postgres, RLS)
- [ ] AI generation endpoint (structured JSON output, grammar/CEFR/scenario validation)
- [ ] Organisation multi-tenancy
- [ ] Curriculum Studio (platform admin can create/edit lessons)
- [ ] Spaced review task runner (timed delivery of review events)
- [ ] Voice/audio response capture
- [ ] Additional lessons (A2, B1...)

## Definition of Done — Phase 1 ✅

- [x] Learner can access A1 Lost Property lesson
- [x] All 12 lesson sections are implemented and navigable
- [x] Recognition, controlled, guided, and independent-transfer exercises exist
- [x] Rubric-based feedback (8 dimensions, 0–16 score)
- [x] Stage 05 attempt stored as immutable curated snapshot
- [x] Stage 06 transfer stored as separate attempt with source reference
- [x] Review schedule created on lesson completion
- [x] Teacher view shows learner attempts and review schedule
- [x] Platform admin view shows curated vs generated content governance
- [x] CEFR level, grammar point, scenario family, content source tracked on all records
- [x] Responsive mobile-first layout
- [x] Colour-coded sections (grammar=purple, vocab=amber, practice=red, scenario=blue, transfer=rose)
- [x] Real curriculum data (not placeholder text)

---

*LinguaX Phase 1 — Built to spec. Grammar you can use, not just grammar you know.*
