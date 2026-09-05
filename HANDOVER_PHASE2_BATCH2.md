# LinguaX — Phase 2 Batch 2 Handover Document

## Summary

Phase 2 Batch 2 is **complete**. All 5 modules (A, B, C, D, E+) are implemented, tested, and deployed.

---

## What Was Built in Each Module

### Module A — Curriculum metadata corrections (Batch 2, completed earlier)
- All 212 lesson stubs have correct IDs, titles, grammar focus, and objectives.

### Module B — Dashboard / Navigation
- App shell with role switcher (Learner / Teacher / Admin).
- Hash-router with 15+ route patterns.
- Navigation bar with back button and Learning Path link.

### Module C — Learning Path views
- `#/path` — level grid with progress rings for all 7 CEFR levels.
- `#/path/:level` — unit accordions with lesson rows and availability chips.
- Lesson availability resolved by `getLessonAvailability(lessonId, learnerProgress, currentPath)`.

### Module D — Lesson review, restart, attempt history
- `#/lesson/:id/review` — attempt summary, rubric breakdown, spaced-review plan.
- Restart creates new attempt; previous attempts immutable.
- `#/attempts/:lessonId` — attempt history list.
- `#/attempts/:lessonId/:attemptId` — attempt detail.

### Module E+ — Final validation + A0–A2 pathways + placement + gating

#### A. Published lesson bodies (new in this module)
File: `public/static/js/curriculum_data.js`

Added a `pub()` helper function and an `_mkBody()` factory. All new lesson bodies are stored in `window.LX.lessonBodies[lessonId]`.

**Published lessons:**
| ID | Level | Title |
|----|-------|-------|
| A0-BRG-L1 | A0 | Welcome to LinguaX |
| A0-BRG-L2 | A0 | Hello and Goodbye |
| A0-BRG-L3 | A0 | What Is Your Name? |
| A0-BRG-L4 | A0 | Where Are You From? |
| A0-BRG-L5 | A0 | How Old Are You? |
| A0-BRG-L6 | A0 | Familiar Objects |
| A0-BRG-L7 | A0 | Colours and Descriptions |
| A0-BRG-L8 | A0 | I Am, You Are, It Is |
| A1-U1-L1 | A1 | I Am … — Introducing Yourself |
| A1-U1-L2 | A1 | He Is, She Is |
| A1-U1-L3 | A1 | They Are, We Are |
| A1-BE-LOST-PROPERTY-001 | A1 | Lost Property (full interactive) |
| A2-U1-L1 | A2 | Yesterday I Worked |
| A2-U1-L2 | A2 | I Went, I Saw, I Had |
| A2-U1-L3 | A2 | Did You …? |
| A2-U1-L4 | A2 | I Didn't … |
| A2-U2-L1 | A2 | I'm Going to … |
| A2-U2-L2 | A2 | I'll Help You |
| A2-U2-L3 | A2 | It Will Be Cold |
| A2-U2-L4 | A2 | What Are Your Plans? |

#### B. Persist layer extensions
File: `public/static/js/persist.js`

New localStorage key: `lx_learner_profile_v1`

New public API:
```javascript
P.getLearnerProfile()           // → { currentPath, placementTestResult, gateTestResults }
P.setLearnerProfile(profile)    // merge-write
P.setCurrentPath(level)         // e.g. 'A1'
P.getCurrentPath()              // → 'A0' | 'A1' | 'A2' | null
P.savePlacementResult(score, recommendedLevel)   // saves + sets currentPath
P.saveGateTestResult(targetLevel, score, passed) // saves + sets currentPath if passed
P.getGateTestResult(targetLevel)                 // → { score, passed, takenAt } | null
P.clearPlacement()              // for testing only
```

#### C. State layer extension
File: `public/static/js/state.js`

```javascript
st.currentPath     // 'A0' | 'A1' | 'A2' | null — hydrated from localStorage on init
st.gateTestTarget  // target level for gate-test route
```

#### D. App layer — new views + gating
File: `public/static/js/app.js`

**New views:**
- `renderPlacementTestView()` — `#/placement`
- `renderChangePathView()` — `#/change-path`
- `renderGateTestView(targetLevel)` — `#/gate-test/:level`
- `_showPlacementResult(score, recommended)` — inline result screen
- `_showGateResult(level, score, passed, threshold, previousPath)` — inline result screen
- `_showLessonPreviewModal(lessonId)` — previews new published lesson bodies

**Gating logic:**
- Dashboard: if `!currentPath` → show placement banner; else show current path badge + "Change path" button.
- `#/path/:level`: if `level > currentPath` → show gate banner; disable lessons as PATH_LOCKED.
- `getLessonAvailability()` now accepts 3rd param `currentPath`; returns `PATH_LOCKED` if level > path.

**New router entries:**
```javascript
'/placement'        → { view: 'placement' }
'/change-path'      → { view: 'change_path' }
'/gate-test/:level' → { view: 'gate_test', targetLevel: level }
```

**Placement test data (constant):**
```javascript
PLACEMENT_QUESTIONS  // 18 items: 6 A0, 6 A1, 6 A2
// Score thresholds: 0–39%=A0, 40–69%=A1, 70–100%=A2
```

**Gate test thresholds:**
```javascript
GATE_THRESHOLDS = { A0: 0, A1: 40, A2: 70 }
```

#### E. CSS extensions
File: `public/static/css/app.css`

New classes added at end of file:
- `.lx-placement-banner` — dashboard banner for unplaced users
- `.lx-current-path-badge` — current path indicator on dashboard
- `.lx-change-path-btn` — change path button
- `.lx-path-gate-banner` — locked-path warning on `#/path/:level`
- `.lx-test-page`, `.lx-test-question`, `.lx-test-option` — test form
- `.lx-result-card` — result screen
- `.lx-change-path-grid`, `.lx-path-option-card` — change path grid
- `.lx-preview-modal-content` — lesson preview modal
- `.lx-chip-pathlocked` — PATH_LOCKED availability chip

---

## Architecture Decisions

1. **New lessons show preview modals, not full interactive engine.** The interactive engine (12 stages with scored activities) currently only supports `A1-BE-LOST-PROPERTY-001`. All 19 new published lessons have full structured body data and can be upgraded to the full engine in Phase 3 by wiring the router to render the generic lesson body.

2. **Gate tests reuse placement questions.** The 18 placement questions are partitioned by level. Gate tests for A1 use A0+A1 questions; A2 gate uses A1+A2 questions. This avoids maintaining a separate question bank.

3. **Moving down is always free.** Moving to a lower path (e.g. A2 → A1) requires no test. We call `P.setCurrentPath(level)` directly.

4. **`getLessonAvailability` is non-breaking.** The third `currentPath` parameter is optional. If absent, gating is skipped (backward-compatible with all existing calls in Module C/D).

5. **No server-side auth.** All placement data is localStorage. In a production system, `lx_learner_profile_v1` should be backed by the server database.

---

## How to Run / Build / Test

```bash
# Prerequisites: Node.js 18+, npm installed, wrangler in devDependencies

# 1. Build
cd /home/user/webapp && npm run build

# 2. Start dev server (sandbox)
pm2 start ecosystem.config.cjs
# → http://localhost:3000/app

# 3. Manual route tests
curl http://localhost:3000/app         # 200 dashboard
# Then open browser and test:
#   #/placement          — placement test (18 Qs)
#   #/change-path        — change path grid
#   #/gate-test/A2       — A2 gate test
#   #/path/A0            — A0 bridge with 8 READY lessons
#   #/path/A1            — A1 with 4 READY lessons (L1–L4)
#   #/path/A2            — A2 with 8 READY lessons (U1 L1-4, U2 L1-4)

# 4. Clean placement data (test new-user flow)
# Open browser console and run:
#   localStorage.removeItem('lx_learner_profile_v1')
#   location.reload()
```

---

## Known Limitations

| Item | Status | Phase |
|------|--------|-------|
| A0-BRG-L9, L10 not published | PLANNED | Phase 3 |
| A1 Units 2–6 all PLANNED | Not started | Phase 3 |
| A2 Units 3–6 all PLANNED | Not started | Phase 3 |
| B1–C2 all PLANNED | Not started | Phase 4+ |
| New lessons (non-A1-001) open preview modal only | Partial | Phase 3 |
| Placement test: no listening component | Text only | Phase 4 |
| currentPath gates only A0–A2 | Limited | Phase 3+ |
| No server-side persistence for placement | localStorage | Phase 4 |

---

## Next Phase Recommendations

**Phase 3 — Full Interactive Engine for New Lessons**
1. Build a generic lesson renderer that reads `window.LX.lessonBodies[id]`.
2. Remove the "preview modal" fallback for new lessons.
3. Publish A0-BRG-L9, A0-BRG-L10, and A1-U2 through A1-U6 units.
4. Add B1-U1 as first B1 lesson (reading + past perfect).

**Phase 4 — Backend, Auth, Listening**
1. Move `lx_learner_profile_v1` to Cloudflare D1.
2. Add audio to placement/gate test (listening questions).
3. Implement teacher dashboard with class-level path analytics.
4. Gate B1–C2 with appropriate thresholds.
