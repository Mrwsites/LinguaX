/* ===== LinguaX Phase 1.5.1 — Persistence Layer ===== */
/*
 * All learner attempt data is stored in localStorage under the key
 * "lx_store_v1". The structure is:
 *
 * {
 *   version: 1,
 *   organization_id: "org-demo",
 *   learner_id: "learner-alex-johnson",
 *   lesson_versions: { [lessonId]: LessonVersion },
 *   learner_assignments: { [lessonId]: LearnerAssignment },
 *   lesson_attempts: { [attemptId]: LessonAttempt },
 *   stage_attempts: { [attemptId]: { [stageKey]: StageAttempt } },
 *   scenario_instances: { [instanceId]: ScenarioInstance },
 *   scenario_attempts: { [instanceId]: ScenarioAttempt },
 *   review_events: { [attemptId]: ReviewEvent[] },
 *   attempt_events: { [attemptId]: AttemptEvent[] }
 * }
 *
 * Stage status values (Phase 1.5.1):
 *   NOT_STARTED   — Learner has not opened the stage
 *   VIEWED        — Learner opened/read an informational stage and continued
 *   IN_PROGRESS   — Learner has started an interaction but not submitted it
 *   ATTEMPTED     — Learner submitted, but results are incomplete or weak
 *   COMPLETED     — Learner completed the required interaction(s)
 *   NEEDS_REVIEW  — Submitted but low accuracy; should revisit
 *   NOT_ASSESSED  — No performance score; stage is informational only
 *
 * IMMUTABILITY RULE:
 * - A completed attempt record is NEVER modified after status = COMPLETED.
 * - New retries always create a brand-new attempt record with a new id and
 *   incremented attempt_number.
 */

(function () {
  'use strict';

  const STORE_KEY = 'lx_store_v1';
  const ORG_ID = 'org-demo';
  const LEARNER_ID = 'learner-alex-johnson';
  const LESSON_ID = 'A1-BE-LOST-PROPERTY-001'; // legacy default — kept for backward compat
  const LESSON_VERSION = '1.0.0';

  // Resolve lessonId: use provided value or fall back to legacy default.
  function _lid(lessonId) {
    return lessonId || LESSON_ID;
  }

  // Ensure a learner_assignment record exists for lessonId.
  // Creates a minimal record on demand so generic lessons don't need pre-seeded assignments.
  function _ensureAssignment(store, lessonId, now) {
    if (!store.learner_assignments[lessonId]) {
      store.learner_assignments[lessonId] = {
        id: `assign-${lessonId}-${LEARNER_ID}`,
        organization_id: ORG_ID,
        lesson_id: lessonId,
        lesson_version_id: null,
        learner_id: LEARNER_ID,
        assigned_by: null,
        assigned_at: now || new Date().toISOString(),
        due_at: null,
        teacher_note: null,
        status: 'NOT_STARTED',
        current_attempt_id: null,
        completed_at: null,
        created_at: now || new Date().toISOString(),
        updated_at: now || new Date().toISOString(),
      };
    }
    return store.learner_assignments[lessonId];
  }

  // ── STAGE STATUS CONSTANTS ──
  const STAGE_STATUS = {
    NOT_STARTED:  'NOT_STARTED',
    VIEWED:       'VIEWED',
    IN_PROGRESS:  'IN_PROGRESS',
    ATTEMPTED:    'ATTEMPTED',
    COMPLETED:    'COMPLETED',
    NEEDS_REVIEW: 'NEEDS_REVIEW',
    NOT_ASSESSED: 'NOT_ASSESSED',
  };

  // ── INSTRUCTIONAL STAGE KEYS (10 stages = 100%) ──
  // These are the only stages that count toward learner-visible progress.
  const INSTRUCTIONAL_STAGE_KEYS = [
    'visual',
    'grammar',
    'coresentence',
    'vocabulary',
    'phrases',
    'practice',
    'dialogue',
    'infogap',
    'transfer',
    'feedback',
  ];
  // 'overview' and 'review' do NOT count toward learner-visible progress.
  const INSTRUCTIONAL_STAGE_COUNT = INSTRUCTIONAL_STAGE_KEYS.length; // 10

  // ── EVIDENCE STAGES (required assessed activities) ──
  const EVIDENCE_STAGE_KEYS = [
    'visual',
    'grammar',
    'coresentence',
    'vocabulary',
    'phrases',
    'practice',
    'dialogue',
    'infogap',
    'transfer',
  ];

  // ── STORAGE HELPERS ──
  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[LX persist] Failed to load store:', e);
      return null;
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[LX persist] Failed to save store:', e);
    }
  }

  function getStore() {
    let store = loadStore();
    if (!store) {
      store = initStore();
      saveStore(store);
    }
    return store;
  }

  // ── STORE INITIALIZATION ──
  function initStore() {
    const now = new Date().toISOString();

    // Lesson version snapshot (immutable curriculum reference)
    const lessonVersionSnapshot = {
      id: `lv-${LESSON_ID}-${LESSON_VERSION.replace(/\./g, '-')}`,
      lesson_id: LESSON_ID,
      version_number: LESSON_VERSION,
      status: 'PUBLISHED',
      content_snapshot_json: {
        id: LESSON_ID,
        version: LESSON_VERSION,
        title: 'Lost Property: Is This Your Bag?',
        cefrLevel: 'A1',
        grammarPointIds: ['present_be_is', 'present_be_are', 'be_possession', 'be_question'],
        scenarioFamily: 'community_public',
        objective: 'I can describe an object, ask who it belongs to, and return it to the correct person.',
        estimatedMinutes: 25,
      },
      change_summary: 'Initial published version',
      created_by: 'platform_admin',
      reviewed_by: 'platform_admin',
      published_at: now,
      created_at: now,
    };

    // Minimal enrolment record for the demo learner
    const assignment = {
      id: `assign-${LESSON_ID}-${LEARNER_ID}`,
      organization_id: ORG_ID,
      lesson_id: LESSON_ID,
      lesson_version_id: lessonVersionSnapshot.id,
      learner_id: LEARNER_ID,
      assigned_by: null,
      assigned_at: now,
      due_at: null,
      teacher_note: null,
      status: 'NOT_STARTED',
      current_attempt_id: null,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    return {
      version: 1,
      organization_id: ORG_ID,
      learner_id: LEARNER_ID,
      lesson_versions: {
        [lessonVersionSnapshot.id]: lessonVersionSnapshot,
      },
      learner_assignments: {
        [LESSON_ID]: assignment,
      },
      lesson_attempts: {},
      stage_attempts: {},
      scenario_instances: {},
      scenario_attempts: {},
      review_events: {},
      attempt_events: {},
    };
  }

  // ── ATTEMPT MANAGEMENT ──

  /**
   * Create a new lesson attempt. Returns the new attempt object.
   * Always creates a fresh record — never modifies existing completed attempts.
   * @param {string} [lessonId] — lesson to create an attempt for (defaults to legacy LESSON_ID)
   */
  function createAttempt(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    const now = new Date().toISOString();
    const assignment = _ensureAssignment(store, lessonId, now);
    // For the legacy lesson use the existing lesson_version; for others use null or first available.
    const lessonVersionId = lessonId === LESSON_ID
      ? Object.keys(store.lesson_versions)[0]
      : null;

    // Count existing attempts to determine attempt_number
    const existing = Object.values(store.lesson_attempts).filter(
      a => a.lesson_id === lessonId && a.learner_id === LEARNER_ID
    );
    const attemptNumber = existing.length + 1;

    const attemptId = `attempt-${lessonId}-${LEARNER_ID}-${Date.now()}`;

    const attempt = {
      id: attemptId,
      organization_id: ORG_ID,
      assignment_id: assignment.id,
      learner_id: LEARNER_ID,
      lesson_id: lessonId,
      lesson_version_id: lessonVersionId,
      attempt_number: attemptNumber,
      status: 'IN_PROGRESS',
      started_at: now,
      last_saved_at: now,
      submitted_at: null,
      completed_at: null,
      duration_seconds: 0,
      active_duration_seconds: 0,
      current_stage_key: 'overview',
      current_stage_index: 0,
      completion_percent: 0,
      evidence_count: 0,
      total_score: null,
      max_score: 16,
      result_band: null,
      attempt_summary_json: null,
      created_at: now,
      updated_at: now,
    };

    store.lesson_attempts[attemptId] = attempt;
    store.stage_attempts[attemptId] = {};
    store.attempt_events[attemptId] = [];
    store.review_events[attemptId] = [];

    // Update assignment to point to this new attempt
    assignment.current_attempt_id = attemptId;
    assignment.status = 'IN_PROGRESS';
    assignment.updated_at = now;
    if (!assignment.lesson_id) assignment.lesson_id = lessonId;

    // Log event
    _logEvent(store, attemptId, 'ATTEMPT_STARTED', { attempt_number: attemptNumber });

    saveStore(store);
    return attempt;
  }

  /**
   * Get or create the current in-progress attempt for the lesson.
   * Returns { attempt, isNew }
   * @param {string} [lessonId] — lesson to look up (defaults to legacy LESSON_ID)
   */
  function getOrCreateActiveAttempt(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    const now = new Date().toISOString();
    const assignment = _ensureAssignment(store, lessonId, now);

    if (assignment.current_attempt_id) {
      const current = store.lesson_attempts[assignment.current_attempt_id];
      if (current && current.status === 'IN_PROGRESS') {
        return { attempt: current, isNew: false };
      }
    }

    // No active attempt — create one
    const attempt = createAttempt(lessonId);
    return { attempt, isNew: true };
  }

  /**
   * Central stage-attempt update function (Phase 1.5.1).
   * This is the SINGLE source of truth for all stage state changes.
   *
   * @param {string} attemptId  - The active lesson attempt id
   * @param {string} stageKey   - The stage key (e.g. 'practice', 'dialogue')
   * @param {object} payload    - { status, responseData, score, maxScore, feedback, completedAt, startedAt }
   * @returns {object|null}     - The updated stage_attempt record
   */
  function updateStageAttempt(attemptId, stageKey, payload) {
    const store = getStore();
    const attempt = store.lesson_attempts[attemptId];
    if (!attempt) {
      console.warn('[LX persist] updateStageAttempt: no attempt found', attemptId);
      return null;
    }

    // IMMUTABILITY GUARD
    if (attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') {
      console.warn('[LX persist] updateStageAttempt: attempt already completed — blocked');
      return null;
    }

    if (!store.stage_attempts[attemptId]) {
      store.stage_attempts[attemptId] = {};
    }

    const now = new Date().toISOString();
    const existing = store.stage_attempts[attemptId][stageKey];

    const updatedStage = {
      id: existing?.id || `sa-${attemptId}-${stageKey}`,
      organization_id: ORG_ID,
      lesson_attempt_id: attemptId,
      stage_key: stageKey,
      status: payload.status || STAGE_STATUS.IN_PROGRESS,
      started_at: existing?.started_at || payload.startedAt || now,
      last_saved_at: now,
      completed_at: (payload.status === STAGE_STATUS.COMPLETED || payload.status === STAGE_STATUS.NEEDS_REVIEW || payload.status === STAGE_STATUS.ATTEMPTED)
        ? (existing?.completed_at || payload.completedAt || now)
        : null,
      response_data_json: payload.responseData !== undefined ? payload.responseData : (existing?.response_data_json || null),
      score: payload.score !== undefined ? payload.score : (existing?.score ?? null),
      max_score: payload.maxScore !== undefined ? payload.maxScore : (existing?.max_score ?? null),
      feedback_json: payload.feedback !== undefined ? payload.feedback : (existing?.feedback_json || null),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    store.stage_attempts[attemptId][stageKey] = updatedStage;

    // Recalculate attempt progress
    _recalculateProgress(store, attempt, now);

    // Log event
    _logEvent(store, attemptId, 'STAGE_UPDATED', {
      stage_key: stageKey,
      status: updatedStage.status,
      score: updatedStage.score,
    });

    saveStore(store);
    return updatedStage;
  }

  /**
   * Recalculate learning progress and evidence count for an attempt.
   */
  function _recalculateProgress(store, attempt, now) {
    const stageAttempts = store.stage_attempts[attempt.id] || {};

    // Learning progress: instructional stages that are VIEWED / COMPLETED / ATTEMPTED / NEEDS_REVIEW
    const viewedStatuses = new Set([
      STAGE_STATUS.VIEWED, STAGE_STATUS.COMPLETED,
      STAGE_STATUS.ATTEMPTED, STAGE_STATUS.NEEDS_REVIEW, STAGE_STATUS.NOT_ASSESSED
    ]);
    const completedInstructional = INSTRUCTIONAL_STAGE_KEYS.filter(key => {
      const sa = stageAttempts[key];
      return sa && viewedStatuses.has(sa.status);
    });
    attempt.completion_percent = Math.min(
      100,
      Math.round((completedInstructional.length / INSTRUCTIONAL_STAGE_COUNT) * 100)
    );

    // Evidence count: evidence stages that are ATTEMPTED / COMPLETED / NEEDS_REVIEW
    const evidenceStatuses = new Set([STAGE_STATUS.COMPLETED, STAGE_STATUS.ATTEMPTED, STAGE_STATUS.NEEDS_REVIEW]);
    const evidenceCompleted = EVIDENCE_STAGE_KEYS.filter(key => {
      const sa = stageAttempts[key];
      return sa && evidenceStatuses.has(sa.status);
    });
    attempt.evidence_count = evidenceCompleted.length;
    attempt.last_saved_at = now;
    attempt.updated_at = now;
  }

  /**
   * Save progress for the current in-progress attempt (legacy auto-save path).
   */
  function saveProgress(attemptId, progressData) {
    const store = getStore();
    const attempt = store.lesson_attempts[attemptId];
    if (!attempt) return;

    // IMMUTABILITY GUARD
    if (attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') {
      console.warn('[LX persist] saveProgress: attempted to save into a completed attempt. Blocked.');
      return;
    }

    const now = new Date().toISOString();
    const startedAt = new Date(attempt.started_at);
    const nowDate = new Date();

    attempt.last_saved_at = now;
    attempt.updated_at = now;
    attempt.current_stage_key = progressData.currentStageKey || attempt.current_stage_key;
    attempt.current_stage_index = progressData.currentStageIndex !== undefined
      ? progressData.currentStageIndex : attempt.current_stage_index;

    // Calculate duration (wall clock from started_at)
    attempt.duration_seconds = Math.floor((nowDate - startedAt) / 1000);

    // Calculate active duration
    attempt.active_duration_seconds = progressData.activeDurationSeconds || attempt.active_duration_seconds;

    // Save stage-level responses using the new status model
    if (progressData.stageAttempts) {
      for (const [stageKey, saData] of Object.entries(progressData.stageAttempts)) {
        if (!saData) continue;
        const existing = store.stage_attempts[attemptId]?.[stageKey];
        store.stage_attempts[attemptId][stageKey] = {
          id: existing?.id || `sa-${attemptId}-${stageKey}`,
          organization_id: ORG_ID,
          lesson_attempt_id: attemptId,
          stage_key: stageKey,
          status: saData.status || STAGE_STATUS.IN_PROGRESS,
          started_at: existing?.started_at || saData.started_at || now,
          last_saved_at: now,
          completed_at: saData.completed_at || existing?.completed_at || null,
          response_data_json: saData.responseData !== undefined ? saData.responseData : (existing?.response_data_json || null),
          score: saData.score !== undefined ? saData.score : (existing?.score ?? null),
          max_score: saData.maxScore !== undefined ? saData.maxScore : (existing?.max_score ?? null),
          feedback_json: saData.feedback !== undefined ? saData.feedback : (existing?.feedback_json || null),
          created_at: existing?.created_at || now,
          updated_at: now,
        };
      }
    }

    // Recalculate progress
    _recalculateProgress(store, attempt, now);

    // Log auto-save event
    _logEvent(store, attemptId, 'AUTO_SAVED', {
      stage: attempt.current_stage_key,
      completion_percent: attempt.completion_percent,
    });

    saveStore(store);
    return attempt;
  }

  /**
   * Log a stage change event.
   */
  function logStageChange(attemptId, fromStage, toStage) {
    const store = getStore();
    _logEvent(store, attemptId, 'STAGE_CHANGED', { from: fromStage, to: toStage });
    saveStore(store);
  }

  /**
   * Log scenario selected event.
   */
  function logScenarioSelected(attemptId, scenarioId) {
    const store = getStore();
    _logEvent(store, attemptId, 'SCENARIO_SELECTED', { scenario_id: scenarioId });
    saveStore(store);
  }

  /**
   * Submit/complete the current attempt. Freezes the attempt record.
   * Creates scenario_instance + scenario_attempt snapshots.
   * Creates review_events.
   * NEVER call this on an already-completed attempt.
   */
  function completeAttempt(attemptId, completionData) {
    const store = getStore();
    const attempt = store.lesson_attempts[attemptId];
    if (!attempt) return;

    if (attempt.status === 'COMPLETED') {
      console.warn('[LX persist] Attempt already completed — will not overwrite.');
      return attempt;
    }

    const now = new Date().toISOString();
    const startedAt = new Date(attempt.started_at);
    const nowDate = new Date();

    attempt.status = 'COMPLETED';
    attempt.submitted_at = now;
    attempt.completed_at = now;
    attempt.last_saved_at = now;
    attempt.updated_at = now;
    attempt.duration_seconds = Math.floor((nowDate - startedAt) / 1000);
    attempt.active_duration_seconds = completionData.activeDurationSeconds || attempt.active_duration_seconds;
    attempt.completion_percent = 100;
    attempt.total_score = completionData.totalScore;
    attempt.result_band = completionData.resultBand;
    attempt.attempt_summary_json = {
      stagesCompleted: completionData.stagesCompleted || [],
      exerciseScores: completionData.exerciseScores || {},
      dialogueCompleted: completionData.dialogueCompleted || false,
      dialoguePartBCompleted: completionData.dialoguePartBCompleted || false,
      dialogueChoices: completionData.dialogueChoices || [],
      dialogueFrames: completionData.dialogueFrames || {},
      infoGapCompleted: completionData.infoGapCompleted || false,
      transferScenarioId: completionData.transferScenarioId || null,
      transferScenarioTitle: completionData.transferScenarioTitle || null,
      rubricScores: completionData.rubricScores || {},
      rubricEvidence: completionData.rubricEvidence || {},
    };

    // Store scenario_instance (snapshot of the exact scenario the learner saw)
    if (completionData.transferScenarioId) {
      const instanceId = `si-${attemptId}-transfer`;
      store.scenario_instances[instanceId] = {
        id: instanceId,
        organization_id: ORG_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: attempt.lesson_version_id,
        scenario_stage: 'TRANSFER',
        scenario_key: completionData.transferScenarioId,
        scenario_family: 'community_public',
        title: completionData.transferScenarioTitle || '',
        content_source: 'CURATED_SCENARIO_BANK',
        content_snapshot_json: completionData.transferScenarioSnapshot || null,
        validation_status: 'auto_approved',
        created_at: now,
      };

      store.scenario_attempts[instanceId] = {
        id: `sca-${attemptId}-transfer`,
        organization_id: ORG_ID,
        scenario_instance_id: instanceId,
        lesson_attempt_id: attemptId,
        learner_id: LEARNER_ID,
        status: 'COMPLETED',
        response_data_json: completionData.transferResponses || {},
        submitted_at: now,
        completed_at: now,
        score: completionData.transferScore || null,
        max_score: 4,
        rubric_score_json: completionData.rubricScores || null,
        feedback_json: completionData.feedback || null,
        created_at: now,
        updated_at: now,
      };
    }

    // Store guided dialogue scenario instance
    if (completionData.dialogueCompleted) {
      const dialogueInstanceId = `si-${attemptId}-dialogue`;
      store.scenario_instances[dialogueInstanceId] = {
        id: dialogueInstanceId,
        organization_id: ORG_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: attempt.lesson_version_id,
        scenario_stage: 'GUIDED_DIALOGUE',
        scenario_key: 'lost_property_dialogue',
        scenario_family: 'community_public',
        title: 'Lost Property Desk Dialogue',
        content_source: 'CURATED_SCENARIO_BANK',
        content_snapshot_json: { type: 'guided_dialogue', lessonId: attempt.lesson_id || LESSON_ID },
        validation_status: 'auto_approved',
        created_at: now,
      };
      store.scenario_attempts[dialogueInstanceId] = {
        id: `sca-${attemptId}-dialogue`,
        organization_id: ORG_ID,
        scenario_instance_id: dialogueInstanceId,
        lesson_attempt_id: attemptId,
        learner_id: LEARNER_ID,
        status: 'COMPLETED',
        response_data_json: {
          choices: completionData.dialogueChoices || [],
          frames: completionData.dialogueFrames || {},
        },
        submitted_at: now,
        completed_at: now,
        score: null,
        max_score: null,
        rubric_score_json: null,
        feedback_json: null,
        created_at: now,
        updated_at: now,
      };
    }

    // Create review_events for this attempt
    _createReviewEvents(store, attemptId, attempt, now);

    // Update assignment
    const lessonIdForAssign = attempt.lesson_id || LESSON_ID;
    const assignment = _ensureAssignment(store, lessonIdForAssign, now);
    assignment.status = 'COMPLETED';
    assignment.completed_at = now;
    assignment.updated_at = now;

    // Log completion event
    _logEvent(store, attemptId, 'ATTEMPT_COMPLETED', {
      total_score: attempt.total_score,
      result_band: attempt.result_band,
    });

    saveStore(store);
    return attempt;
  }

  /**
   * Start a new attempt on an already-completed lesson.
   * Resets the assignment's current_attempt_id to a fresh attempt.
   * The old completed attempts are NEVER modified.
   * @param {string} [lessonId] — lesson to restart (defaults to legacy LESSON_ID)
   */
  function startNewAttempt(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    const prev = Object.values(store.lesson_attempts).filter(
      a => a.lesson_id === lessonId && a.learner_id === LEARNER_ID
    );
    if (prev.length === 0) {
      console.warn('[LX persist] No previous attempts to restart from.');
    }
    const attempt = createAttempt(lessonId);
    return attempt;
  }

  // ── REVIEW EVENTS ──
  function _createReviewEvents(store, attemptId, attempt, now) {
    const lessonVersionId = attempt.lesson_version_id;
    const baseDate = new Date(now);

    const reviewEvents = [
      {
        id: `rev-${attemptId}-end_of_lesson`,
        organization_id: ORG_ID,
        learner_id: LEARNER_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: lessonVersionId,
        review_type: 'END_OF_LESSON_ORAL_RECAP',
        scheduled_for: new Date(baseDate).toISOString(),
        completed_at: null,
        status: 'AVAILABLE',
        prompt_snapshot_json: { prompt: 'Recall the key is/are forms without looking.' },
        response_data_json: null,
        score: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: `rev-${attemptId}-same_day`,
        organization_id: ORG_ID,
        learner_id: LEARNER_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: lessonVersionId,
        review_type: 'SAME_DAY_RECOGNITION',
        scheduled_for: new Date(baseDate.getTime() + 8 * 3600000).toISOString(),
        completed_at: null,
        status: 'SCHEDULED',
        prompt_snapshot_json: { prompt: 'Quick recognition: is or are?' },
        response_data_json: null,
        score: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: `rev-${attemptId}-next_lesson`,
        organization_id: ORG_ID,
        learner_id: LEARNER_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: lessonVersionId,
        review_type: 'NEXT_LESSON_GUIDED_SCENARIO',
        scheduled_for: new Date(baseDate.getTime() + 24 * 3600000).toISOString(),
        completed_at: null,
        status: 'SCHEDULED',
        prompt_snapshot_json: { prompt: 'Guided scenario using is/are with support.' },
        response_data_json: null,
        score: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: `rev-${attemptId}-three_day`,
        organization_id: ORG_ID,
        learner_id: LEARNER_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: lessonVersionId,
        review_type: 'THREE_DAY_DIALOGUE',
        scheduled_for: new Date(baseDate.getTime() + 3 * 24 * 3600000).toISOString(),
        completed_at: null,
        status: 'SCHEDULED',
        prompt_snapshot_json: { prompt: 'Short dialogue in a different setting.' },
        response_data_json: null,
        score: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: `rev-${attemptId}-seven_day`,
        organization_id: ORG_ID,
        learner_id: LEARNER_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: lessonVersionId,
        review_type: 'SEVEN_DAY_INDEPENDENT_TRANSFER',
        scheduled_for: new Date(baseDate.getTime() + 7 * 24 * 3600000).toISOString(),
        completed_at: null,
        status: 'SCHEDULED',
        prompt_snapshot_json: { prompt: 'Independent transfer with less support.' },
        response_data_json: null,
        score: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: `rev-${attemptId}-mixed`,
        organization_id: ORG_ID,
        learner_id: LEARNER_ID,
        lesson_attempt_id: attemptId,
        lesson_version_id: lessonVersionId,
        review_type: 'MIXED_REVIEW',
        scheduled_for: new Date(baseDate.getTime() + 14 * 24 * 3600000).toISOString(),
        completed_at: null,
        status: 'SCHEDULED',
        prompt_snapshot_json: { prompt: 'Mixed grammar and scenario context review.' },
        response_data_json: null,
        score: null,
        created_at: now,
        updated_at: now,
      },
    ];

    // Tag each review event with lesson_id so _buildLearnerProgress can correlate them
    reviewEvents.forEach(ev => { ev.lesson_id = attempt.lesson_id || LESSON_ID; });
    store.review_events[attemptId] = reviewEvents;
  }

  // ── ATTEMPT EVENT LOG ──
  function _logEvent(store, attemptId, eventType, metadata) {
    if (!store.attempt_events[attemptId]) {
      store.attempt_events[attemptId] = [];
    }
    store.attempt_events[attemptId].push({
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lesson_attempt_id: attemptId,
      event_type: eventType,
      event_at: new Date().toISOString(),
      metadata_json: metadata || null,
    });
  }

  // ── READ HELPERS ──

  /**
   * Get all attempts for a lesson, sorted newest first.
   * @param {string} [lessonId] — defaults to legacy LESSON_ID
   */
  function getAllAttempts(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    return Object.values(store.lesson_attempts)
      .filter(a => a.lesson_id === lessonId && a.learner_id === LEARNER_ID)
      .sort((a, b) => b.attempt_number - a.attempt_number);
  }

  /** Get a single attempt by id. */
  function getAttempt(attemptId) {
    const store = getStore();
    return store.lesson_attempts[attemptId] || null;
  }

  /** Get stage attempts for a given lesson attempt. */
  function getStageAttempts(attemptId) {
    const store = getStore();
    return store.stage_attempts[attemptId] || {};
  }

  /** Get a single stage attempt. */
  function getStageAttempt(attemptId, stageKey) {
    const store = getStore();
    return (store.stage_attempts[attemptId] || {})[stageKey] || null;
  }

  /** Get review events for an attempt, sorted by scheduled_for. */
  function getReviewEvents(attemptId) {
    const store = getStore();
    return (store.review_events[attemptId] || []).sort(
      (a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for)
    );
  }

  /** Get all review events across all attempts. */
  function getAllReviewEvents() {
    const store = getStore();
    return Object.values(store.review_events)
      .flat()
      .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));
  }

  /**
   * Mark a single review event as COMPLETED.
   * @param {string} eventId — the review event id (e.g. "rev-attempt-...-end_of_lesson")
   * @returns {object|null} the updated event, or null if not found
   */
  function markReviewComplete(eventId) {
    const store = getStore();
    const now = new Date().toISOString();
    for (const attemptId of Object.keys(store.review_events)) {
      const events = store.review_events[attemptId];
      const ev = events.find(e => e.id === eventId);
      if (ev) {
        ev.status = 'COMPLETED';
        ev.completed_at = now;
        ev.updated_at = now;
        saveStore(store);
        return ev;
      }
    }
    console.warn('[LX persist] markReviewComplete: event not found', eventId);
    return null;
  }

  /**
   * Returns true if the lesson has at least one COMPLETED attempt AND
   * there is at least one review event with scheduled_for <= now and status !== COMPLETED.
   * @param {string} [lessonId] — defaults to legacy LESSON_ID
   */
  function isLessonReviewDue(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    const now = new Date();
    // Find completed attempts for this lesson
    const completedAttempts = Object.values(store.lesson_attempts).filter(
      a => a.lesson_id === lessonId && a.status === 'COMPLETED'
    );
    if (completedAttempts.length === 0) return false;
    // Gather review events only for attempts belonging to this lesson
    const completedAttemptIds = new Set(completedAttempts.map(a => a.id));
    const lessonReviews = Object.entries(store.review_events)
      .filter(([aid]) => completedAttemptIds.has(aid))
      .flatMap(([, evts]) => evts);
    return lessonReviews.some(ev => ev.status !== 'COMPLETED' && new Date(ev.scheduled_for) <= now);
  }

  /**
   * Get the next pending review event for the lesson (the earliest due one).
   * @param {string} [lessonId] — defaults to legacy LESSON_ID
   */
  function getNextReviewEvent(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    // Find attempts for this lesson
    const lessonAttemptIds = new Set(
      Object.values(store.lesson_attempts)
        .filter(a => a.lesson_id === lessonId)
        .map(a => a.id)
    );
    const events = Object.entries(store.review_events)
      .filter(([aid]) => lessonAttemptIds.has(aid))
      .flatMap(([, evts]) => evts)
      .filter(ev => ev.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));
    return events[0] || null;
  }

  /**
   * Get the current assignment for a lesson.
   * @param {string} [lessonId] — defaults to legacy LESSON_ID
   */
  function getAssignment(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    return store.learner_assignments[lessonId] || null;
  }

  /**
   * Get the active (in-progress) attempt if any.
   * @param {string} [lessonId] — defaults to legacy LESSON_ID
   */
  function getActiveAttempt(lessonId) {
    lessonId = _lid(lessonId);
    const store = getStore();
    const assignment = store.learner_assignments[lessonId];
    if (!assignment?.current_attempt_id) return null;
    const attempt = store.lesson_attempts[assignment.current_attempt_id];
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;
    return attempt;
  }

  /**
   * Get the most recent completed attempt.
   * @param {string} [lessonId] — defaults to legacy LESSON_ID
   */
  function getLatestCompletedAttempt(lessonId) {
    const all = getAllAttempts(lessonId);
    return all.find(a => a.status === 'COMPLETED') || null;
  }

  /** Get scenario instance + scenario attempt for a given lesson attempt. */
  function getScenarioData(attemptId) {
    const store = getStore();
    const instances = Object.values(store.scenario_instances).filter(
      si => si.lesson_attempt_id === attemptId
    );
    const attempts = Object.values(store.scenario_attempts).filter(
      sa => sa.lesson_attempt_id === attemptId
    );
    return { instances, attempts };
  }

  /** Get attempt events log. */
  function getAttemptEvents(attemptId) {
    const store = getStore();
    return store.attempt_events[attemptId] || [];
  }

  // ── DURATION FORMATTING ──
  function formatDuration(seconds) {
    if (!seconds || seconds < 60) return '< 1 min';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem}m`;
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      });
    } catch (e) { return isoStr; }
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch (e) { return isoStr; }
  }

  // ── RESULT BAND ──
  function getResultBandLabel(band) {
    return {
      RETEACH: 'Reteach', EMERGING: 'Emerging',
      DEVELOPING: 'Developing', SECURE: 'Secure', STRONG: 'Strong'
    }[band] || band || '—';
  }

  function getResultBandColor(band) {
    return {
      RETEACH: '#DC2626', EMERGING: '#F59E0B',
      DEVELOPING: '#D97706', SECURE: '#16A34A', STRONG: '#0369A1'
    }[band] || '#475569';
  }

  // ══════════════════════════════════════════════════════════════
  // ── LEARNER PROFILE — currentPath, placement, gate tests ──
  // ══════════════════════════════════════════════════════════════
  const PROFILE_KEY = 'lx_learner_profile_v1';

  /**
   * Load learner profile from localStorage.
   * Profile shape:
   * {
   *   currentPath: 'A0' | 'A1' | 'A2' | null,
   *   placementTestResult: { score, recommendedLevel, takenAt } | null,
   *   gateTestResults: { [targetLevel]: { score, passed, takenAt } },
   * }
   */
  function getLearnerProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return _defaultProfile();
      const parsed = JSON.parse(raw);
      return Object.assign(_defaultProfile(), parsed);
    } catch (e) {
      console.warn('[LX persist] getLearnerProfile error:', e);
      return _defaultProfile();
    }
  }

  function _defaultProfile() {
    return {
      currentPath: null,         // null = not placed yet
      placementTestResult: null,
      gateTestResults: {},
    };
  }

  function setLearnerProfile(profile) {
    try {
      const current = getLearnerProfile();
      const merged = Object.assign({}, current, profile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn('[LX persist] setLearnerProfile error:', e);
    }
  }

  /** Set the learner's current learning path. */
  function setCurrentPath(level) {
    return setLearnerProfile({ currentPath: level });
  }

  /** Get the learner's current learning path (or null if not placed). */
  function getCurrentPath() {
    return getLearnerProfile().currentPath;
  }

  /** Save placement test result and set currentPath. */
  function savePlacementResult(score, recommendedLevel) {
    const result = {
      score: score,
      recommendedLevel: recommendedLevel,
      takenAt: new Date().toISOString(),
    };
    setLearnerProfile({
      placementTestResult: result,
      currentPath: recommendedLevel,
    });
    return result;
  }

  /** Save gate test result for a given target level. */
  function saveGateTestResult(targetLevel, score, passed) {
    const profile = getLearnerProfile();
    const gateResults = Object.assign({}, profile.gateTestResults || {});
    gateResults[targetLevel] = {
      score: score,
      passed: passed,
      takenAt: new Date().toISOString(),
    };
    const updates = { gateTestResults: gateResults };
    if (passed) updates.currentPath = targetLevel;
    setLearnerProfile(updates);
    return gateResults[targetLevel];
  }

  /** Get gate test result for a target level. */
  function getGateTestResult(targetLevel) {
    const profile = getLearnerProfile();
    return (profile.gateTestResults || {})[targetLevel] || null;
  }

  /** Clear placement (reset — useful for testing). */
  function clearPlacement() {
    localStorage.removeItem(PROFILE_KEY);
  }

  // ── PUBLIC API ──
  window.LX = window.LX || {};
  window.LX.persist = {
    // Write
    getOrCreateActiveAttempt,
    createAttempt,
    startNewAttempt,
    updateStageAttempt,   // PRIMARY: Phase 1.5.1 central function
    saveProgress,
    completeAttempt,
    logStageChange,
    logScenarioSelected,
    markReviewComplete,
    // Read
    getAllAttempts,
    getAttempt,
    getStageAttempts,
    getStageAttempt,
    getReviewEvents,
    getAllReviewEvents,
    getAssignment,
    getActiveAttempt,
    getLatestCompletedAttempt,
    getScenarioData,
    getAttemptEvents,
    isLessonReviewDue,
    getNextReviewEvent,
    // Utils
    formatDuration,
    formatDateTime,
    formatDate,
    getResultBandLabel,
    getResultBandColor,
    // Learner profile / placement / gate
    getLearnerProfile,
    setLearnerProfile,
    setCurrentPath,
    getCurrentPath,
    savePlacementResult,
    saveGateTestResult,
    getGateTestResult,
    clearPlacement,
    // Constants
    STAGE_STATUS,
    INSTRUCTIONAL_STAGE_KEYS,
    INSTRUCTIONAL_STAGE_COUNT,
    EVIDENCE_STAGE_KEYS,
    LESSON_ID,
    LEARNER_ID,
    ORG_ID,
  };

})();
