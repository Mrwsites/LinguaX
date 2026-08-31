/* ===== LinguaX State Management — Phase 1.5 ===== */
(function () {
  'use strict';

  const LX = window.LX;
  const P = LX.persist; // Persistence layer

  // ── INSTRUCTIONAL STAGES (10 stages only — never count overview or review) ──
  const INSTRUCTIONAL_STAGE_KEYS = P.INSTRUCTIONAL_STAGE_KEYS;

  // ── ALL STAGES (including overview + review for navigation) ──
  const STAGES = [
    { id: 'overview',     label: 'Lesson Overview',        icon: '📋', tag: 'Overview', color: '#0B1325' },
    { id: 'visual',       label: 'Visual Time',            icon: '👁️',  tag: 'Stage 01', color: '#5B61F6' },
    { id: 'grammar',      label: 'Grammar Focus',          icon: '📐', tag: 'Stage 02', color: '#7C3AED' },
    { id: 'coresentence', label: 'Core Sentences',         icon: '🔑', tag: 'Stage 03', color: '#0D9488' },
    { id: 'vocabulary',   label: 'Vocabulary',             icon: '📖', tag: 'Stage 04', color: '#D97706' },
    { id: 'phrases',      label: 'Useful Sentences',       icon: '💬', tag: 'Stage 04b', color: '#2D7E5E' },
    { id: 'practice',     label: 'Practice',               icon: '✏️',  tag: 'Stage 05', color: '#DC2626' },
    { id: 'dialogue',     label: 'Guided Dialogue',        icon: '🗣️',  tag: 'Stage 05b', color: '#0369A1' },
    { id: 'infogap',      label: 'Information Gap',        icon: '🔍', tag: 'Stage 05c', color: '#0369A1' },
    { id: 'transfer',     label: 'Transfer: New Situation',icon: '🚀', tag: 'Stage 06', color: '#BE123C' },
    { id: 'feedback',     label: 'Feedback & Score',       icon: '📊', tag: 'Results',  color: '#475569' },
    { id: 'review',       label: 'Review Plan',            icon: '📅', tag: 'Review',   color: '#475569' },
  ];

  // ── RUNTIME STATE ──
  const state = {
    currentRole: 'learner',    // learner | teacher | platform_admin
    currentView: 'dashboard',  // dashboard | lesson | teacher | admin | attempts | attempt_detail | attempt_compare
    currentLessonId: P.LESSON_ID,
    currentStage: 0,           // index into STAGES array

    // Current attempt tracking
    currentAttemptId: null,    // Set when lesson is started/resumed
    isReadOnly: false,         // true when viewing a historical completed attempt
    readOnlyAttemptId: null,   // which attempt we are viewing in read-only mode

    // Compare mode
    compareAttemptIds: [null, null], // two attempt ids to compare

    // Stages completed in THIS session (set of stage keys)
    stagesCompleted: new Set(),

    // Exercise state — restored from saved attempt on resume
    exerciseState: {
      recognition:         { answers: {}, checked: false, score: 0, total: 0 },
      matching:            { answers: {}, checked: false, score: 0, total: 0 },
      controlledProduction:{ answers: {}, checked: false, score: 0, total: 0 },
      questionTransform:   { answers: {}, checked: false, score: 0, total: 0 },
    },

    // Dialogue state
    dialogueState: {
      currentTurn: 0,
      choices: [],
      completed: false,
    },

    // Information gap state
    infoGapState: {
      answers: {},
      completed: false,
    },

    // Transfer challenge state
    transferState: {
      selectedScenario: 0,
      responses: {},
      submitted: false,
      score: null,
      feedback: null,
    },

    // Rubric scores
    rubricScores: {},

    // Save-status indicator: 'idle' | 'saving' | 'saved' | 'error'
    saveStatus: 'idle',
    lastSavedAt: null,

    // Active learning time tracking
    _activeDurationSeconds: 0,
    _activeTimerStart: null,
    _pageVisible: true,
    _lastActivityAt: Date.now(),
    _inactivityThreshold: 5 * 60 * 1000, // 5 minutes

    // Auto-save timer
    _autoSaveTimer: null,
    _autoSaveInterval: 15000, // 15 seconds

    // Attempt records (legacy — kept for teacher view compatibility)
    attemptRecords: {
      stage05_attempt: null,
      stage06_attempts: [],
    },
    reviewSchedule: null,
  };

  // ── PROGRESS CALCULATION ──
  // Only instructional stages count. Never exceeds 100%.
  function getInstructionalProgress() {
    const completedInstructional = Array.from(state.stagesCompleted).filter(
      key => INSTRUCTIONAL_STAGE_KEYS.includes(key)
    );
    const count = completedInstructional.length;
    const pct = Math.min(100, Math.round((count / P.INSTRUCTIONAL_STAGE_COUNT) * 100));
    return { count, total: P.INSTRUCTIONAL_STAGE_COUNT, pct };
  }

  // ── ACTIVE TIME TRACKING ──
  function startActiveTimer() {
    if (state._activeTimerStart !== null) return;
    state._activeTimerStart = Date.now();
  }

  function pauseActiveTimer() {
    if (state._activeTimerStart === null) return;
    state._activeDurationSeconds += Math.floor((Date.now() - state._activeTimerStart) / 1000);
    state._activeTimerStart = null;
  }

  function getActiveDurationSeconds() {
    if (state._activeTimerStart !== null) {
      return state._activeDurationSeconds + Math.floor((Date.now() - state._activeTimerStart) / 1000);
    }
    return state._activeDurationSeconds;
  }

  // Pause active time when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      state._pageVisible = false;
      pauseActiveTimer();
    } else {
      state._pageVisible = true;
      state._lastActivityAt = Date.now();
      if (state.currentView === 'lesson' && !state.isReadOnly) {
        startActiveTimer();
      }
    }
  });

  // Pause active time after inactivity
  function recordActivity() {
    state._lastActivityAt = Date.now();
    if (!state._pageVisible) return;
    if (state.currentView === 'lesson' && !state.isReadOnly) {
      startActiveTimer();
    }
  }
  document.addEventListener('keydown', recordActivity, { passive: true });
  document.addEventListener('mousedown', recordActivity, { passive: true });
  document.addEventListener('touchstart', recordActivity, { passive: true });

  // Check for inactivity every 60s
  setInterval(() => {
    if (Date.now() - state._lastActivityAt > state._inactivityThreshold) {
      pauseActiveTimer();
    }
  }, 60000);

  // ── AUTO-SAVE ──
  function scheduleAutoSave() {
    if (state._autoSaveTimer) clearTimeout(state._autoSaveTimer);
    state._autoSaveTimer = setTimeout(() => {
      if (state.currentAttemptId && state.currentView === 'lesson' && !state.isReadOnly) {
        performAutoSave();
      }
    }, state._autoSaveInterval);
  }

  function performAutoSave(callback) {
    if (!state.currentAttemptId || state.isReadOnly) return;
    state.saveStatus = 'saving';
    _renderSaveIndicator();

    const currentStageKey = STAGES[state.currentStage]?.id || 'overview';
    const progressData = buildProgressData(currentStageKey);

    P.saveProgress(state.currentAttemptId, progressData);

    state.saveStatus = 'saved';
    state.lastSavedAt = new Date();
    _renderSaveIndicator();

    if (callback) callback();
    scheduleAutoSave();
  }

  function buildProgressData(currentStageKey) {
    const stagesCompletedKeys = Array.from(state.stagesCompleted);

    // Build stageLabels and stageIndices maps
    const stageLabels = {};
    const stageIndices = {};
    STAGES.forEach((s, i) => {
      stageLabels[s.id] = s.label;
      stageIndices[s.id] = i;
    });

    // Build stageResponses from current exercise/dialogue/transfer state
    const stageResponses = {};

    stageResponses['practice'] = {
      recognition: state.exerciseState.recognition,
      matching: state.exerciseState.matching,
      controlledProduction: state.exerciseState.controlledProduction,
      questionTransform: state.exerciseState.questionTransform,
      completed: state.stagesCompleted.has('practice'),
    };

    stageResponses['dialogue'] = {
      currentTurn: state.dialogueState.currentTurn,
      choices: state.dialogueState.choices,
      completed: state.dialogueState.completed,
    };

    stageResponses['infogap'] = {
      answers: state.infoGapState.answers,
      completed: state.infoGapState.completed,
    };

    stageResponses['transfer'] = {
      selectedScenario: state.transferState.selectedScenario,
      responses: state.transferState.responses,
      submitted: state.transferState.submitted,
      score: state.transferState.score,
      completed: state.transferState.submitted,
    };

    stageResponses['feedback'] = {
      rubricScores: state.rubricScores,
      completed: state.stagesCompleted.has('feedback'),
    };

    return {
      currentStageKey,
      currentStageIndex: state.currentStage,
      stagesCompleted: stagesCompletedKeys,
      activeDurationSeconds: getActiveDurationSeconds(),
      stageResponses,
      stageLabels,
      stageIndices,
    };
  }

  function _renderSaveIndicator() {
    const el = document.getElementById('lx-save-indicator');
    if (!el) return;
    if (state.saveStatus === 'saving') {
      el.textContent = 'Saving…';
      el.className = 'lx-save-indicator saving';
    } else if (state.saveStatus === 'saved') {
      const timeStr = state.lastSavedAt
        ? state.lastSavedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : '';
      el.textContent = `Saved · ${timeStr}`;
      el.className = 'lx-save-indicator saved';
    }
  }

  // ── START OR RESUME LESSON ──
  function startLesson() {
    const { attempt, isNew } = P.getOrCreateActiveAttempt();
    state.currentAttemptId = attempt.id;
    state.isReadOnly = false;
    state.readOnlyAttemptId = null;

    if (!isNew) {
      // Resume: restore saved state
      _restoreAttemptState(attempt);
      P._logEventPublic && P._logEventPublic(attempt.id, 'ATTEMPT_RESUMED');
    }

    startActiveTimer();
    scheduleAutoSave();
    return attempt;
  }

  function _restoreAttemptState(attempt) {
    // Restore stage index
    state.currentStage = attempt.current_stage_index || 0;

    // Restore stagesCompleted
    const stageAttempts = P.getStageAttempts(attempt.id);
    state.stagesCompleted = new Set(
      Object.entries(stageAttempts)
        .filter(([, sa]) => sa.status === 'COMPLETED')
        .map(([key]) => key)
    );

    // Restore exercise state
    if (stageAttempts['practice']?.response_data_json) {
      const pd = stageAttempts['practice'].response_data_json;
      if (pd.recognition) state.exerciseState.recognition = pd.recognition;
      if (pd.matching) state.exerciseState.matching = pd.matching;
      if (pd.controlledProduction) state.exerciseState.controlledProduction = pd.controlledProduction;
      if (pd.questionTransform) state.exerciseState.questionTransform = pd.questionTransform;
    }

    // Restore dialogue state
    if (stageAttempts['dialogue']?.response_data_json) {
      const dd = stageAttempts['dialogue'].response_data_json;
      state.dialogueState.currentTurn = dd.currentTurn || 0;
      state.dialogueState.choices = dd.choices || [];
      state.dialogueState.completed = dd.completed || false;
    }

    // Restore info gap state
    if (stageAttempts['infogap']?.response_data_json) {
      const id = stageAttempts['infogap'].response_data_json;
      state.infoGapState.answers = id.answers || {};
      state.infoGapState.completed = id.completed || false;
    }

    // Restore transfer state
    if (stageAttempts['transfer']?.response_data_json) {
      const td = stageAttempts['transfer'].response_data_json;
      state.transferState.selectedScenario = td.selectedScenario || 0;
      state.transferState.responses = td.responses || {};
      state.transferState.submitted = td.submitted || false;
      state.transferState.score = td.score || null;
    }

    // Restore rubric scores
    if (stageAttempts['feedback']?.response_data_json?.rubricScores) {
      state.rubricScores = stageAttempts['feedback'].response_data_json.rubricScores;
    }

    // Restore active duration
    state._activeDurationSeconds = attempt.active_duration_seconds || 0;
  }

  // ── MARK STAGE COMPLETE ──
  function markStageComplete(stageIdx) {
    const stageKey = STAGES[stageIdx]?.id;
    if (!stageKey) return;
    state.stagesCompleted.add(stageKey);
    scheduleAutoSave();
  }

  // ── COMPLETE LESSON ──
  function completeLesson() {
    if (!state.currentAttemptId) return;

    pauseActiveTimer();

    const score = LX.autoScoreRubric();
    const band = LX.getScoreBand(score);
    const resultBand = { 'Reteach': 'RETEACH', 'Developing': 'DEVELOPING', 'Secure': 'SECURE', 'Strong': 'STRONG' }[band.label] || 'DEVELOPING';

    const tc = LX.lesson_A1_001.transferChallenge;
    const selectedScenario = tc.scenarios[state.transferState.selectedScenario] || tc.scenarios[0];

    // Build exercise scores for summary
    const exerciseScores = {
      recognition: state.exerciseState.recognition,
      matching: state.exerciseState.matching,
      controlledProduction: state.exerciseState.controlledProduction,
      questionTransform: state.exerciseState.questionTransform,
    };

    const completionData = {
      totalScore: score,
      resultBand,
      activeDurationSeconds: getActiveDurationSeconds(),
      stagesCompleted: Array.from(state.stagesCompleted),
      exerciseScores,
      dialogueCompleted: state.dialogueState.completed,
      dialogueChoices: state.dialogueState.choices,
      infoGapCompleted: state.infoGapState.completed,
      transferScenarioId: selectedScenario.id,
      transferScenarioTitle: selectedScenario.title,
      transferScenarioSnapshot: {
        id: selectedScenario.id,
        title: selectedScenario.title,
        setting: selectedScenario.setting,
        studentRole: selectedScenario.studentRole,
        partnerRole: selectedScenario.partnerRole,
        newGap: selectedScenario.newGap,
        lostItems: selectedScenario.lostItems,
        targetLanguage: selectedScenario.targetLanguage,
        successCriteria: selectedScenario.successCriteria,
      },
      transferResponses: state.transferState.responses,
      transferScore: state.transferState.score,
      rubricScores: state.rubricScores,
      feedback: band.desc,
    };

    const attempt = P.completeAttempt(state.currentAttemptId, completionData);

    // Update legacy reviewSchedule for backward compat
    const reviewEvents = P.getReviewEvents(state.currentAttemptId);
    state.reviewSchedule = reviewEvents.map(r => ({
      type: r.review_type.toLowerCase(),
      due: r.scheduled_for,
      label: _reviewTypeLabel(r.review_type),
      completed: r.status === 'COMPLETED',
    }));
    LX.learnerData.reviewQueue = state.reviewSchedule;

    return attempt;
  }

  function _reviewTypeLabel(type) {
    return {
      END_OF_LESSON_ORAL_RECAP: 'End-of-lesson oral recap',
      SAME_DAY_RECOGNITION: 'Same-day recognition task',
      NEXT_LESSON_GUIDED_SCENARIO: 'Next-lesson guided scenario',
      THREE_DAY_DIALOGUE: '3-day dialogue task',
      SEVEN_DAY_INDEPENDENT_TRANSFER: '7-day independent transfer',
      MIXED_REVIEW: '2-week mixed grammar review',
    }[type] || type;
  }

  // ── SAVE AND EXIT ──
  function saveAndExit(callback) {
    performAutoSave(() => {
      pauseActiveTimer();
      if (callback) callback();
    });
  }

  // ── SCORE / RUBRIC ──
  function calculateRubricScore() {
    const dims = LX.lesson_A1_001.rubric.dimensions;
    let total = 0;
    dims.forEach(dim => { total += state.rubricScores[dim.id] || 0; });
    return total;
  }

  function getScoreBand(score) {
    const bands = LX.lesson_A1_001.rubric.scoreBands;
    return bands.find(b => score >= b.min && score <= b.max) || bands[0];
  }

  function autoScoreRubric() {
    const es = state.exerciseState;
    const ds = state.dialogueState;
    const ts = state.transferState;

    const recScore  = es.recognition.total > 0 ? es.recognition.score / es.recognition.total : 0;
    const matchScore = es.matching.total > 0 ? es.matching.score / es.matching.total : 0;
    const ctrlScore  = es.controlledProduction.total > 0 ? es.controlledProduction.score / es.controlledProduction.total : 0;
    const dialogueScore = ds.completed ? 1.5 : ds.choices.length > 0 ? 0.5 : 0;
    const transferScore = ts.submitted ? (Object.keys(ts.responses).length >= 3 ? 1.5 : 1) : 0;

    state.rubricScores = {
      target_grammar:   Math.min(2, Math.round((recScore + ctrlScore) * 2 / 2)),
      verb_be_agreement:Math.min(2, Math.round(recScore * 2)),
      vocabulary:       Math.min(2, Math.round(matchScore * 2)),
      questions_negatives: Math.min(2, Math.round(ctrlScore * 2)),
      meaning:          Math.min(2, Math.round(dialogueScore)),
      interaction:      Math.min(2, Math.round(dialogueScore)),
      repair:           1,
      transfer:         Math.min(2, Math.round(transferScore)),
    };

    return calculateRubricScore();
  }

  // ── LEGACY COMPAT (teacher view uses these) ──
  function saveStage05Attempt(dialogueChoices, infoGapAnswers) {
    const snapshot = {
      id: `attempt-stage05-${Date.now()}`,
      type: 'stage05_curated_scenario',
      lessonId: state.currentLessonId,
      lessonVersion: LX.lesson_A1_001.version,
      contentType: 'CURATED_CORE',
      grammarPointIds: LX.lesson_A1_001.grammarPointIds,
      cefrLevel: 'A1',
      scenarioFamily: LX.lesson_A1_001.scenarioFamily,
      dialogueChoices: [...(dialogueChoices || [])],
      infoGapAnswers: { ...(infoGapAnswers || {}) },
      completedAt: new Date().toISOString(),
      immutable: true,
    };
    state.attemptRecords.stage05_attempt = snapshot;
    LX.learnerData.attempts.push(snapshot);
    scheduleAutoSave();
    return snapshot;
  }

  function saveStage06Attempt(scenarioId, responses, score, feedback) {
    const attempt = {
      id: `attempt-stage06-${Date.now()}`,
      type: 'stage06_transfer_scenario',
      lessonId: state.currentLessonId,
      lessonVersion: LX.lesson_A1_001.version,
      sourceStage05AttemptId: state.attemptRecords.stage05_attempt?.id || null,
      contentType: 'CURATED_CORE',
      scenarioId,
      cefrLevel: 'A1',
      grammarPointIds: LX.lesson_A1_001.grammarPointIds,
      scenarioFamily: LX.lesson_A1_001.scenarioFamily,
      generationRequestId: null,
      promptVersion: null,
      validationStatus: 'auto_approved',
      releaseStatus: 'released',
      responses: { ...(responses || {}) },
      score,
      feedback,
      rubricScores: { ...state.rubricScores },
      completedAt: new Date().toISOString(),
    };
    state.attemptRecords.stage06_attempts.push(attempt);
    LX.learnerData.attempts.push(attempt);
    return attempt;
  }

  // ── PUBLIC API ──
  LX.state = state;
  LX.STAGES = STAGES;
  LX.INSTRUCTIONAL_STAGE_KEYS = INSTRUCTIONAL_STAGE_KEYS;
  LX.INSTRUCTIONAL_STAGE_COUNT = P.INSTRUCTIONAL_STAGE_COUNT;

  LX.getInstructionalProgress = getInstructionalProgress;
  LX.startLesson = startLesson;
  LX.markStageComplete = markStageComplete;
  LX.completeLesson = completeLesson;
  LX.saveAndExit = saveAndExit;
  LX.performAutoSave = performAutoSave;
  LX.buildProgressData = buildProgressData;
  LX.scheduleAutoSave = scheduleAutoSave;
  LX.recordActivity = recordActivity;
  LX.startActiveTimer = startActiveTimer;
  LX.pauseActiveTimer = pauseActiveTimer;
  LX.getActiveDurationSeconds = getActiveDurationSeconds;

  // Score / rubric
  LX.autoScoreRubric = autoScoreRubric;
  LX.calculateRubricScore = calculateRubricScore;
  LX.getScoreBand = getScoreBand;

  // Legacy
  LX.saveStage05Attempt = saveStage05Attempt;
  LX.saveStage06Attempt = saveStage06Attempt;

})();
