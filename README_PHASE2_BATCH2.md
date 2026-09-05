# LinguaX — Phase 2 Batch 2 README

## Product Overview

LinguaX is a CEFR-aligned English-learning platform covering A0–C2.

**Live URL:** https://3000-i2feytjosoxp9r9ydv4fq-5185f4aa.sandbox.novita.ai/app

---

## Status: Phase 2 Batch 2 — Module E+ COMPLETE ✅

All Modules A–E+ are complete.

---

## Completed Features (Modules A–E+)

### Module A — Curriculum Metadata Corrections
- 212 lessons across A0–C2 in curriculum_data.js
- Correct IDs, titles, grammar focus, and objectives

### Module B — Dashboard / Navigation / Core Routes
- App shell, role switcher, navigation bar
- Routes: `#/`, `#/lesson`, `#/teacher`, `#/admin`, `#/path`, `#/path/:level`, `#/scenario/:family`

### Module C — Learning Path
- Level grid (`#/path`) — all 7 CEFR levels as clickable cards with progress rings
- Unit accordions with lesson rows
- Availability states: READY, IN_PROGRESS, COMPLETED, REVIEW_DUE, LOCKED, COMING_SOON, PATH_LOCKED

### Module D — Lesson Review, Restart, Attempt History
- Lesson review page (`#/lesson/:id/review`)
- Restart with new attempt (immutability preserved)
- Attempt history (`#/attempts/:lessonId`)
- Attempt detail and comparison pages

### Module E+ — Placement Test, A0–A2 Pathways, Path Gating

#### A0–A2 Published Pathways
- **A0 Foundation Bridge:** Lessons 1–8 PUBLISHED (8/10 lessons)
  - Classroom English, Greetings, Names, Countries, Numbers, Objects, Colours, "I am/You are/It is"
- **A1 Unit 1:** 4 lessons PUBLISHED (L1–L3 new + L4 existing anchor)
  - Introducing yourself, Describing people, Groups, Lost Property (existing)
- **A2 Unit 1:** 4 lessons PUBLISHED (L1–L4)
  - Past Simple: Regular verbs, Irregular verbs, Questions, Negatives
- **A2 Unit 2:** 4 lessons PUBLISHED (L1–L4)
  - Future: Going to (plans), Will (spontaneous), Will (predictions), Future arrangements

**Total published: 20 lessons** (was 1)

#### Placement Test (`#/placement`)
- 18 questions covering A0–A2 grammar and vocabulary
- Auto-scored (0–100%)
- Score thresholds: 0–39% → A0, 40–69% → A1, 70–100% → A2
- Saves `currentPath` to localStorage
- Entry via dashboard banner (new users) or nav

#### Change Path Flow (`#/change-path`)
- Shows current path, all A0/A1/A2 options
- Moving down: immediate (no test required)
- Moving up: gate test required

#### Gate Tests (`#/gate-test/:level`)
- A0 gate: 0% threshold (always passes — for moving down)
- A1 gate: 40% threshold (12 questions from A0/A1 bank)
- A2 gate: 70% threshold (12 questions from A1/A2 bank)
- Pass: assigns new path, redirects to path
- Fail: kind encouragement message, stay/move-down/retake options

#### Path Gating
- Dashboard shows placement banner for new users
- `#/path/:level` shows gate-test banner if level > currentPath
- Lesson rows show `PATH_LOCKED` chip for inaccessible levels
- `getLessonAvailability()` accepts optional `currentPath` parameter

---

## Route Inventory

| Route | View | Notes |
|-------|------|-------|
| `#/` | Dashboard | Placement banner if no path set |
| `#/lesson` | Lesson engine | A1-BE-LOST-PROPERTY-001 |
| `#/lesson/:id/review` | Lesson review | Any lesson |
| `#/path` | Level grid | All A0–C2 |
| `#/path/:level` | Level unit view | Gate banner if locked |
| `#/placement` | Placement test | 18 Qs, A0/A1/A2 |
| `#/change-path` | Change path | A0/A1/A2 options |
| `#/gate-test/:level` | Gate test | Level-specific |
| `#/attempts/:lessonId` | Attempt history | |
| `#/attempts/:lessonId/:attemptId` | Attempt detail | |
| `#/scenario/:family` | Scenario browser | |
| `#/teacher` | Teacher view | |
| `#/admin` | Platform admin view | |

---

## Data Architecture

### localStorage Keys
- `lx_store_v1` — lesson attempts, stage attempts, review events (Phase 1 schema)
- `lx_learner_profile_v1` — currentPath, placementTestResult, gateTestResults

### Learner Profile Schema
```json
{
  "currentPath": "A1",
  "placementTestResult": {
    "score": 55,
    "recommendedLevel": "A1",
    "takenAt": "2024-09-05T10:00:00Z"
  },
  "gateTestResults": {
    "A2": {
      "score": 65,
      "passed": false,
      "takenAt": "2024-09-05T10:30:00Z"
    }
  }
}
```

### Lesson Body Data
- `window.LX.lesson_A1_001` — full A1 Lost Property lesson (Phase 1 interactive engine)
- `window.LX.lessonBodies[id]` — structured bodies for new A0/A1/A2 lessons

---

## Technology Stack
- **Frontend:** Vanilla JS (ES5-compatible), Tailwind CSS (CDN)
- **Backend:** Hono (TypeScript), Cloudflare Workers
- **Build:** Vite + `@hono/vite-cloudflare-pages`
- **Storage:** localStorage (client-side, no server DB required)
- **Deployment:** Cloudflare Pages

---

## How to Run

```bash
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs
# Visit http://localhost:3000/app
```

---

## Known Limitations (Phase 2 Batch 2)

1. **New lesson interactivity** — A0/A2 lesson bodies are structured and show a preview modal. Full interactive 12-stage lesson engine for new lessons pending Phase 3.
2. **A0-BRG-L9, L10** — Not yet published (PLANNED). Will be published in Phase 3.
3. **A1 Units 2–6** — PLANNED, not published.
4. **A2 Units 3–6** — PLANNED, not published.
5. **B1–C2** — All PLANNED.
6. **Placement test audio** — Text-only questions; no listening component.
7. **currentPath only gates A0/A1/A2** — B1–C2 not path-gated in this batch.
