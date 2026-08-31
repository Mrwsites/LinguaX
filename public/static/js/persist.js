/* ===== LinguaX Phase 1.5 — Persistence Layer ===== */
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
  const LESSON_ID = 'A1-BE-LOST-PROPERTY-001';
  const LESSON_VERSION = '1.0.0';

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
   */
  function createAttempt() {
    const store = getStore();
    const assignment = store.learner_assignments[LESSON_ID];
    const lessonVersionId = Object.keys(store.lesson_versions)[0];

    // Count existing attempts to determine attempt_number
    const existing = Object.values(store.lesson_attempts).filter(
      a => a.lesson_id === LESSON_ID && a.learner_id === LEARNER_ID
    );
    const attemptNumber = existing.length + 1;

    const now = new Date().toISOString();
    const attemptId = `attempt-${LESSON_ID}-${LEARNER_ID}-${Date.now()}`;

    const attempt = {
      id: attemptId,
      organization_id: ORG_ID,
      assignment_id: assignment.id,
      learner_id: LEARNER_ID,
      lesson_id: LESSON_ID,
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

    // Log event
    _logEvent(store, attemptId, 'ATTEMPT_STARTED', { attempt_number: attemptNumber });

    saveStore(store);
    return attempt;
  }

  /**
   * Get or create the current in-progress attempt for the lesson.
   * Returns { attempt, isNew }
   */
  function getOrCreateActiveAttempt() {
    const store = getStore();
    const assignment = store.learner_assignments[LESSON_ID];

    if (assignment.current_attempt_id) {
      const current = store.lesson_attempts[assignment.current_attempt_id];
      if (current && current.status === 'IN_PROGRESS') {
        return { attempt: current, isNew: false };
      }
    }

    // No active attempt — create one
    const attempt = createAttempt();
    return { attempt, isNew: true };
  }

  /**
   * Save progress for the current in-progress attempt.
   * Persists: current stage, stage responses, exercise state, dialogue, transfer, etc.
   */
  function saveProgress(attemptId, progressData) {
    const store = getStore();
    const attempt = store.lesson_attempts[attemptId];
    if (!attempt) return;

    // IMMUTABILITY GUARD: never save into a completed attempt
    if (attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') {
      console.warn('[LX persist] Attempted to save into a completed attempt. Blocked.');
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

    // Calculate active duration (sum of active intervals from events)
    attempt.active_duration_seconds = progressData.activeDurationSeconds || attempt.active_duration_seconds;

    // Calculate completion percent (only instructional stages count)
    const completedInstructional = (progressData.stagesCompleted || []).filter(
      key => INSTRUCTIONAL_STAGE_KEYS.includes(key)
    );
    attempt.completion_percent = Math.min(
      100,
      Math.round((completedInstructional.length / INSTRUCTIONAL_STAGE_COUNT) * 100)
    );

    // Save stage-level responses
    if (progressData.stageResponses) {
      for (const [stageKey, responseData] of Object.entries(progressData.stageResponses)) {
        const existingStageAttempt = store.stage_attempts[attemptId][stageKey];
        store.stage_attempts[attemptId][stageKey] = {
          id: existingStageAttempt?.id || `sa-${attemptId}-${stageKey}`,
          organization_id: ORG_ID,
          lesson_attempt_id: attemptId,
          stage_key: stageKey,
          stage_label: progressData.stageLabels?.[stageKey] || stageKey,
          stage_index: progressData.stageIndices?.[stageKey] ?? 0,
          status: responseData.completed ? 'COMPLETED' : 'IN_PROGRESS',
          started_at: existingStageAttempt?.started_at || now,
          last_saved_at: now,
          completed_at: responseData.completed ? (existingStageAttempt?.completed_at || now) : null,
          response_data_json: responseData,
          score: responseData.score ?? null,
          max_score: responseData.maxScore ?? null,
          feedback_json: responseData.feedback ?? null,
          created_at: existingStageAttempt?.created_at || now,
          updated_at: now,
        };
      }
    }

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
      infoGapCompleted: completionData.infoGapCompleted || false,
      transferScenarioId: completionData.transferScenarioId || null,
      transferScenarioTitle: completionData.transferScenarioTitle || null,
      rubricScores: completionData.rubricScores || {},
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

      // Store scenario_attempt (learner's responses to the scenario)
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
        content_snapshot_json: { type: 'guided_dialogue', lessonId: LESSON_ID },
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
        response_data_json: { choices: completionData.dialogueChoices || [] },
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
    const assignment = store.learner_assignments[LESSON_ID];
    assignment.status = 'COMPLETED';
    assignment.completed_at = now;
    assignment.updated_at = now;
    // Note: current_attempt_id stays set so we can reference the last attempt

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
   */
  function startNewAttempt() {
    const store = getStore();
    const assignment = store.learner_assignments[LESSON_ID];

    // Verify the lesson has been attempted before
    const prev = Object.values(store.lesson_attempts).filter(
      a => a.lesson_id === LESSON_ID && a.learner_id === LEARNER_ID
    );
    if (prev.length === 0) {
      console.warn('[LX persist] No previous attempts to restart from.');
    }

    // Create a fresh attempt — old attempts are untouched
    const attempt = createAttempt();
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

  /** Get all attempts for the current lesson, sorted newest first. */
  function getAllAttempts() {
    const store = getStore();
    return Object.values(store.lesson_attempts)
      .filter(a => a.lesson_id === LESSON_ID && a.learner_id === LEARNER_ID)
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

  /** Get the current assignment. */
  function getAssignment() {
    const store = getStore();
    return store.learner_assignments[LESSON_ID] || null;
  }

  /** Get the active (in-progress) attempt if any. */
  function getActiveAttempt() {
    const store = getStore();
    const assignment = store.learner_assignments[LESSON_ID];
    if (!assignment?.current_attempt_id) return null;
    const attempt = store.lesson_attempts[assignment.current_attempt_id];
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;
    return attempt;
  }

  /** Get the most recent completed attempt. */
  function getLatestCompletedAttempt() {
    const all = getAllAttempts();
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
    return { RETEACH: 'Reteach', DEVELOPING: 'Developing', SECURE: 'Secure', STRONG: 'Strong' }[band] || band || '—';
  }

  function getResultBandColor(band) {
    return { RETEACH: '#DC2626', DEVELOPING: '#D97706', SECURE: '#16A34A', STRONG: '#0369A1' }[band] || '#475569';
  }

  // ── PUBLIC API ──
  window.LX = window.LX || {};
  window.LX.persist = {
    // Write
    getOrCreateActiveAttempt,
    createAttempt,
    startNewAttempt,
    saveProgress,
    completeAttempt,
    logStageChange,
    logScenarioSelected,
    // Read
    getAllAttempts,
    getAttempt,
    getStageAttempts,
    getReviewEvents,
    getAllReviewEvents,
    getAssignment,
    getActiveAttempt,
    getLatestCompletedAttempt,
    getScenarioData,
    getAttemptEvents,
    // Utils
    formatDuration,
    formatDateTime,
    formatDate,
    getResultBandLabel,
    getResultBandColor,
    // Constants
    INSTRUCTIONAL_STAGE_KEYS,
    INSTRUCTIONAL_STAGE_COUNT,
    LESSON_ID,
    LEARNER_ID,
    ORG_ID,
  };

})();
