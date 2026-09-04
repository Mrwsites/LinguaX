/* ===== LinguaX State Management — Phase 1.5.1 ===== */
(function () {
  'use strict';

  const LX = window.LX;
  const P = LX.persist;
  const SS = P.STAGE_STATUS; // Stage status constants

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
    currentView: 'dashboard',  // dashboard | lesson | lesson_review | teacher | admin | attempts | attempt_detail | attempt_compare | path | level_path | scenario
    currentLessonId: P.LESSON_ID,
    currentStage: 0,           // index into STAGES array

    // Current attempt tracking
    currentAttemptId: null,
    isReadOnly: false,
    readOnlyAttemptId: null,

    // Phase 2 Module B — routing state
    reviewLessonId: null,       // lesson id for #/lesson/:id/review
    pathLevel: null,            // level code for #/path/:level
    scenarioFamily: null,       // scenario family id for #/scenario/:family

    // Phase 2 Module C — Learning Path state
    // Map of unitCode → boolean (is the unit accordion expanded?)
    unitExpanded: {},           // persists across renders within a session

    // Phase 2 Module D — Attempt History routing state
    historyLessonId: null,      // lesson id for #/attempts/:lessonId
    selectedAttemptId: null,    // attempt id for #/attempts/:lessonId/:attemptId (detail from history)

    // Compare mode
    compareAttemptIds: [null, null],

    // ── Stage status map (stageKey → STAGE_STATUS value) ──
    // This is the LIVE in-memory status for each stage in the current attempt.
    stageStatuses: {},

    // Legacy compat: stagesCompleted is now derived from stageStatuses
    // but kept for backward compat with progress functions
    stagesCompleted: new Set(),

    // Exercise state — restored from saved attempt on resume
    exerciseState: {
      recognition:         { answers: {}, checked: false, score: 0, total: 0 },
      matching:            { answers: {}, checked: false, score: 0, total: 0 },
      controlledProduction:{ answers: {}, checked: false, score: 0, total: 0 },
      questionTransform:   { answers: {}, checked: false, score: 0, total: 0 },
    },

    // Lightweight check activities for informational stages (Phase 1.5.1)
    stageCheckState: {
      visual:       { answers: {}, submitted: false, score: 0, total: 0 },
      grammar:      { answers: {}, submitted: false, score: 0, total: 0 },
      coresentence: { answers: {}, submitted: false, score: 0, total: 0 },
      vocabulary:   { answers: {}, submitted: false, score: 0, total: 0 },
      phrases:      { answers: {}, submitted: false, score: 0, total: 0 },
    },

    // Dialogue state — Phase 1.5.1: includes Part A (choices) and Part B (frames)
    dialogueState: {
      partAChoices: {},      // turn index → chosen text
      partAChecked: false,
      partAScore: 0,
      partATotal: 0,
      partBFrames: {},       // frame index → typed text
      partBChecked: false,
      partBScore: 0,
      partBTotal: 0,
      completed: false,      // true when both parts submitted
    },

    // Information gap state
    infoGapState: {
      answers: {},
      completed: false,
      score: 0,
      total: 0,
    },

    // Transfer challenge state
    transferState: {
      selectedScenario: 0,
      responses: {},
      submitted: false,
      score: null,
      feedback: null,
    },

    // Rubric scores + evidence tracking
    rubricScores: {},
    rubricEvidence: {},      // which rubric categories have actual evidence

    // Save-status indicator
    saveStatus: 'idle',
    lastSavedAt: null,

    // Active learning time tracking
    _activeDurationSeconds: 0,
    _activeTimerStart: null,
    _pageVisible: true,
    _lastActivityAt: Date.now(),
    _inactivityThreshold: 5 * 60 * 1000,

    // Auto-save timer
    _autoSaveTimer: null,
    _autoSaveInterval: 15000,

    // Legacy attempt records (kept for backward compat)
    attemptRecords: {
      stage05_attempt: null,
      stage06_attempts: [],
    },
    reviewSchedule: null,
  };

  // ── STAGE STATUS HELPERS ──

  /**
   * Get the current status for a stage key.
   */
  function getStageStatus(stageKey) {
    return state.stageStatuses[stageKey] || SS.NOT_STARTED;
  }

  /**
   * Check if a stage is navigable (current, viewed, attempted, completed).
   */
  function isStageNavigable(stageIdx) {
    if (state.isReadOnly) return true; // All stages clickable in read-only
    if (stageIdx === state.currentStage) return true;
    const stageKey = STAGES[stageIdx]?.id;
    if (!stageKey) return false;
    const status = getStageStatus(stageKey);
    return status !== SS.NOT_STARTED;
  }

  /**
   * Check if a stage is locked (future, not yet unlocked).
   */
  function isStageLocked(stageIdx) {
    if (state.isReadOnly) return false;
    if (stageIdx <= state.currentStage) return false;
    // A stage is unlocked if the previous stage has been at least VIEWED
    const prevKey = STAGES[stageIdx - 1]?.id;
    if (!prevKey) return false;
    const prevStatus = getStageStatus(prevKey);
    return prevStatus === SS.NOT_STARTED;
  }

  // ── PROGRESS CALCULATION ──

  function getInstructionalProgress() {
    const viewedStatuses = new Set([
      SS.VIEWED, SS.COMPLETED, SS.ATTEMPTED, SS.NEEDS_REVIEW, SS.NOT_ASSESSED
    ]);
    const count = INSTRUCTIONAL_STAGE_KEYS.filter(key => {
      const status = getStageStatus(key);
      return viewedStatuses.has(status);
    }).length;
    const pct = Math.min(100, Math.round((count / P.INSTRUCTIONAL_STAGE_COUNT) * 100));
    return { count, total: P.INSTRUCTIONAL_STAGE_COUNT, pct };
  }

  function getEvidenceProgress() {
    const evidenceStatuses = new Set([SS.COMPLETED, SS.ATTEMPTED, SS.NEEDS_REVIEW]);
    const count = P.EVIDENCE_STAGE_KEYS.filter(key => {
      const status = getStageStatus(key);
      return evidenceStatuses.has(status);
    }).length;
    return { count, total: P.EVIDENCE_STAGE_KEYS.length };
  }

  // ── CENTRAL STAGE UPDATE FUNCTION (Phase 1.5.1) ──
  /**
   * The primary function for ALL stage state changes.
   * Calls persist.updateStageAttempt, updates in-memory state,
   * re-renders sidebar and progress indicator.
   *
   * @param {string} stageKey
   * @param {object} payload  - { status, responseData, score, maxScore, feedback, completedAt }
   */
  function updateStageStatus(stageKey, payload) {
    if (!state.currentAttemptId || state.isReadOnly) return;

    // Update in-memory state
    const newStatus = payload.status;
    if (newStatus) {
      state.stageStatuses[stageKey] = newStatus;
      // Sync legacy stagesCompleted set
      if (newStatus === SS.COMPLETED || newStatus === SS.ATTEMPTED || newStatus === SS.NEEDS_REVIEW || newStatus === SS.VIEWED) {
        state.stagesCompleted.add(stageKey);
      }
    }

    // Persist via central function
    P.updateStageAttempt(state.currentAttemptId, stageKey, payload);

    // Re-render sidebar and progress
    _renderSidebar();
    _renderProgressIndicator();

    // Schedule auto-save
    scheduleAutoSave();
  }

  // ── SIDEBAR LIVE RENDER ──
  function _renderSidebar() {
    const stageList = document.getElementById('stage-list');
    if (!stageList) return;
    stageList.innerHTML = _buildSidebarItems();
    // Re-attach click handlers
    stageList.querySelectorAll('.stage-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.stage);
        if (item.classList.contains('stage-locked')) return;
        _navigateToStage(idx);
      });
    });
  }

  function _buildSidebarItems() {
    return STAGES.map((s, i) => {
      const status = state.isReadOnly
        ? _getReadOnlyStageStatus(s.id)
        : getStageStatus(s.id);
      const isActive = i === state.currentStage;
      const locked = !state.isReadOnly && i > 0 && isStageLocked(i) && !isActive;
      const isInstructional = INSTRUCTIONAL_STAGE_KEYS.includes(s.id);

      const { cls: statusCls, icon: statusIcon, label: statusLabel } = _stageStatusVisual(status, isActive, locked);

      return `
      <div class="stage-item${isActive ? ' active' : ''}${locked ? ' stage-locked' : ''}" 
           data-stage="${i}"
           aria-label="${s.label}: ${statusLabel}"
           ${locked ? 'aria-disabled="true"' : ''}>
        <div class="stage-num ${statusCls}">${statusIcon}</div>
        <div class="stage-info">
          <div class="stage-label">${s.label}</div>
          <div class="stage-sublabel">${s.tag}${isActive ? '' : ''}</div>
        </div>
        ${isActive ? '<span class="stage-active-arrow" aria-hidden="true">▶</span>' : ''}
        <span class="stage-status-label visually-hidden">${statusLabel}</span>
      </div>`;
    }).join('');
  }

  function _getReadOnlyStageStatus(stageKey) {
    if (!state.readOnlyAttemptId) return SS.NOT_STARTED;
    const sa = P.getStageAttempt(state.readOnlyAttemptId, stageKey);
    return sa?.status || SS.NOT_STARTED;
  }

  function _stageStatusVisual(status, isActive, locked) {
    if (locked) {
      return { cls: 'stage-num-locked', icon: '🔒', label: 'Not started' };
    }
    if (isActive) {
      return { cls: 'stage-num-active', icon: '▶', label: 'Current stage' };
    }
    switch (status) {
      case SS.COMPLETED:
        return { cls: 'stage-num-completed', icon: '✓', label: 'Complete' };
      case SS.NEEDS_REVIEW:
        return { cls: 'stage-num-review', icon: '⚠', label: 'Review needed' };
      case SS.ATTEMPTED:
        return { cls: 'stage-num-attempted', icon: '◑', label: 'Attempted' };
      case SS.IN_PROGRESS:
        return { cls: 'stage-num-inprogress', icon: '…', label: 'In progress' };
      case SS.VIEWED:
        return { cls: 'stage-num-viewed', icon: '👁', label: 'Viewed' };
      case SS.NOT_ASSESSED:
        return { cls: 'stage-num-viewed', icon: '—', label: 'Not assessed' };
      case SS.NOT_STARTED:
      default:
        return { cls: 'stage-num-default', icon: '', label: 'Not started' };
    }
  }

  function _renderProgressIndicator() {
    // Learning progress bar
    const prog = getInstructionalProgress();
    const ev = getEvidenceProgress();

    const progPctEl = document.getElementById('lx-progress-pct');
    const progCountEl = document.getElementById('lx-progress-count');
    const progBarEl = document.getElementById('lx-progress-bar-fill');
    const evCountEl = document.getElementById('lx-evidence-count');

    if (progPctEl) progPctEl.textContent = prog.pct + '%';
    if (progCountEl) progCountEl.textContent = `${prog.count} of ${prog.total} learning stages`;
    if (progBarEl) progBarEl.style.width = prog.pct + '%';
    if (evCountEl) evCountEl.textContent = `Evidence: ${ev.count} of ${ev.total}`;
  }

  function _navigateToStage(idx) {
    const fromStage = STAGES[state.currentStage]?.id;
    const toStage = STAGES[idx]?.id;

    // Save current stage state before navigating
    _saveCurrentStageDraft();

    if (state.currentAttemptId && !state.isReadOnly && fromStage !== toStage) {
      P.logStageChange(state.currentAttemptId, fromStage, toStage);
      performAutoSave();
    }
    state.currentStage = idx;
    // Re-render the whole lesson view
    if (window.LX && window.LX._renderLesson) {
      window.LX._renderLesson();
    }
    window.scrollTo(0, 0);
  }

  function _saveCurrentStageDraft() {
    // Called before navigation — save any in-progress work
    if (!state.currentAttemptId || state.isReadOnly) return;
    const stageKey = STAGES[state.currentStage]?.id;
    if (!stageKey) return;
    const currentStatus = getStageStatus(stageKey);
    // Don't downgrade a completed/attempted stage
    if (currentStatus === SS.COMPLETED || currentStatus === SS.VIEWED) return;
    if (currentStatus === SS.NOT_STARTED) return;
    // Save as-is
    performAutoSave();
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
    // Build stageAttempts map from current in-memory state
    const stageAttempts = {};

    // Informational stage checks
    ['visual', 'grammar', 'coresentence', 'vocabulary', 'phrases'].forEach(key => {
      const cs = state.stageCheckState[key];
      if (cs && (cs.submitted || cs.answers && Object.keys(cs.answers).length > 0)) {
        stageAttempts[key] = {
          status: getStageStatus(key),
          responseData: cs,
          score: cs.score,
          maxScore: cs.total,
        };
      }
    });

    // Practice
    const es = state.exerciseState;
    const practiceStatus = getStageStatus('practice');
    stageAttempts['practice'] = {
      status: practiceStatus,
      responseData: {
        recognition: es.recognition,
        matching: es.matching,
        controlledProduction: es.controlledProduction,
        questionTransform: es.questionTransform,
      },
    };

    // Dialogue
    const ds = state.dialogueState;
    const dialogueStatus = getStageStatus('dialogue');
    stageAttempts['dialogue'] = {
      status: dialogueStatus,
      responseData: {
        partAChoices: ds.partAChoices,
        partAChecked: ds.partAChecked,
        partAScore: ds.partAScore,
        partATotal: ds.partATotal,
        partBFrames: ds.partBFrames,
        partBChecked: ds.partBChecked,
        partBScore: ds.partBScore,
        partBTotal: ds.partBTotal,
        completed: ds.completed,
      },
    };

    // Info Gap
    const igs = state.infoGapState;
    const infogapStatus = getStageStatus('infogap');
    stageAttempts['infogap'] = {
      status: infogapStatus,
      responseData: {
        answers: igs.answers,
        completed: igs.completed,
        score: igs.score,
        total: igs.total,
      },
      score: igs.score,
      maxScore: igs.total,
    };

    // Transfer
    const ts = state.transferState;
    const transferStatus = getStageStatus('transfer');
    stageAttempts['transfer'] = {
      status: transferStatus,
      responseData: {
        selectedScenario: ts.selectedScenario,
        responses: ts.responses,
        submitted: ts.submitted,
        score: ts.score,
      },
    };

    // Feedback
    const feedbackStatus = getStageStatus('feedback');
    stageAttempts['feedback'] = {
      status: feedbackStatus,
      responseData: {
        rubricScores: state.rubricScores,
        rubricEvidence: state.rubricEvidence,
      },
    };

    // Overview / review
    ['overview', 'review'].forEach(key => {
      const s = getStageStatus(key);
      if (s !== SS.NOT_STARTED) {
        stageAttempts[key] = { status: s };
      }
    });

    return {
      currentStageKey,
      currentStageIndex: state.currentStage,
      activeDurationSeconds: getActiveDurationSeconds(),
      stageAttempts,
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
      _restoreAttemptState(attempt);
    }

    startActiveTimer();
    scheduleAutoSave();
    return attempt;
  }

  function _restoreAttemptState(attempt) {
    // Restore stage index
    state.currentStage = attempt.current_stage_index || 0;

    // Restore stageStatuses from persisted stage_attempts
    const stageAttempts = P.getStageAttempts(attempt.id);
    state.stageStatuses = {};
    state.stagesCompleted = new Set();

    Object.entries(stageAttempts).forEach(([key, sa]) => {
      if (sa && sa.status) {
        state.stageStatuses[key] = sa.status;
        if ([SS.COMPLETED, SS.VIEWED, SS.ATTEMPTED, SS.NEEDS_REVIEW].includes(sa.status)) {
          state.stagesCompleted.add(key);
        }
      }
    });

    // Restore exercise state (Practice)
    if (stageAttempts['practice']?.response_data_json) {
      const pd = stageAttempts['practice'].response_data_json;
      if (pd.recognition) state.exerciseState.recognition = pd.recognition;
      if (pd.matching) state.exerciseState.matching = pd.matching;
      if (pd.controlledProduction) state.exerciseState.controlledProduction = pd.controlledProduction;
      if (pd.questionTransform) state.exerciseState.questionTransform = pd.questionTransform;
    }

    // Restore stage check state (lightweight activities)
    ['visual', 'grammar', 'coresentence', 'vocabulary', 'phrases'].forEach(key => {
      if (stageAttempts[key]?.response_data_json) {
        state.stageCheckState[key] = stageAttempts[key].response_data_json;
      }
    });

    // Restore dialogue state (Phase 1.5.1 new format)
    if (stageAttempts['dialogue']?.response_data_json) {
      const dd = stageAttempts['dialogue'].response_data_json;
      state.dialogueState.partAChoices = dd.partAChoices || {};
      state.dialogueState.partAChecked = dd.partAChecked || false;
      state.dialogueState.partAScore = dd.partAScore || 0;
      state.dialogueState.partATotal = dd.partATotal || 0;
      state.dialogueState.partBFrames = dd.partBFrames || {};
      state.dialogueState.partBChecked = dd.partBChecked || false;
      state.dialogueState.partBScore = dd.partBScore || 0;
      state.dialogueState.partBTotal = dd.partBTotal || 0;
      state.dialogueState.completed = dd.completed || false;
      // Backward compat: old format had 'choices' array
      if (dd.choices && !dd.partAChoices) {
        dd.choices.forEach((c, i) => { state.dialogueState.partAChoices[i] = c; });
      }
    }

    // Restore info gap state
    if (stageAttempts['infogap']?.response_data_json) {
      const id = stageAttempts['infogap'].response_data_json;
      state.infoGapState.answers = id.answers || {};
      state.infoGapState.completed = id.completed || false;
      state.infoGapState.score = id.score || 0;
      state.infoGapState.total = id.total || 0;
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
      state.rubricEvidence = stageAttempts['feedback'].response_data_json.rubricEvidence || {};
    }

    // Restore active duration
    state._activeDurationSeconds = attempt.active_duration_seconds || 0;
  }

  // ── MARK STAGE VIEWED (for informational stages) ──
  function markStageViewed(stageKey) {
    const current = getStageStatus(stageKey);
    // Don't downgrade if already completed/attempted
    if ([SS.COMPLETED, SS.ATTEMPTED, SS.NEEDS_REVIEW].includes(current)) return;
    updateStageStatus(stageKey, { status: SS.VIEWED });
  }

  // ── MARK STAGE COMPLETE (legacy path, used by Next Stage button) ──
  function markStageComplete(stageKey) {
    if (!stageKey) return;
    const current = getStageStatus(stageKey);
    // Never downgrade an already-assessed stage
    if ([SS.COMPLETED, SS.NEEDS_REVIEW, SS.ATTEMPTED].includes(current)) {
      scheduleAutoSave();
      return;
    }
    // Informational/nav stages → VIEWED (not scored)
    const viewedOnlyStages = ['overview', 'review', 'feedback'];
    if (viewedOnlyStages.includes(stageKey)) {
      updateStageStatus(stageKey, { status: SS.VIEWED });
    } else if (current === SS.NOT_STARTED || current === SS.VIEWED) {
      // If learner clicked Next without doing the activity — mark as VIEWED only
      // so it shows as "visited" but not "completed"
      updateStageStatus(stageKey, { status: SS.VIEWED });
    }
    // IN_PROGRESS stages remain IN_PROGRESS until learner submits
    scheduleAutoSave();
  }

  // ── COMPLETE LESSON ──
  function completeLesson() {
    if (!state.currentAttemptId) return;

    pauseActiveTimer();

    const score = LX.autoScoreRubric();
    const band = LX.getScoreBand(score);
    const resultBand = { 'Reteach': 'RETEACH', 'Emerging': 'EMERGING', 'Developing': 'DEVELOPING', 'Secure': 'SECURE', 'Strong': 'STRONG' }[band.label] || 'DEVELOPING';

    const tc = LX.lesson_A1_001.transferChallenge;
    const selectedScenario = tc.scenarios[state.transferState.selectedScenario] || tc.scenarios[0];

    const exerciseScores = {
      recognition: state.exerciseState.recognition,
      matching: state.exerciseState.matching,
      controlledProduction: state.exerciseState.controlledProduction,
      questionTransform: state.exerciseState.questionTransform,
    };

    const ds = state.dialogueState;

    const completionData = {
      totalScore: score,
      resultBand,
      activeDurationSeconds: getActiveDurationSeconds(),
      stagesCompleted: Array.from(state.stagesCompleted),
      exerciseScores,
      dialogueCompleted: ds.completed,
      dialogueChoices: Object.values(ds.partAChoices),
      dialoguePartBCompleted: ds.partBChecked,
      dialogueFrames: ds.partBFrames,
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
      rubricEvidence: state.rubricEvidence,
      feedback: band.desc,
    };

    const attempt = P.completeAttempt(state.currentAttemptId, completionData);

    const reviewEvents = P.getReviewEvents(state.currentAttemptId);
    state.reviewSchedule = reviewEvents.map(r => ({
      type: r.review_type.toLowerCase(),
      due: r.scheduled_for,
      label: _reviewTypeLabel(r.review_type),
      completed: r.status === 'COMPLETED',
    }));
    if (LX.learnerData) LX.learnerData.reviewQueue = state.reviewSchedule;

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
    _saveCurrentStageDraft();
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

  /**
   * Evidence-based auto-scoring (Phase 1.5.1).
   * Only scores rubric categories where actual evidence exists.
   */
  function autoScoreRubric() {
    const es = state.exerciseState;
    const ds = state.dialogueState;
    const ts = state.transferState;
    const igs = state.infoGapState;
    const gcs = state.stageCheckState;

    // Reset evidence tracker
    state.rubricEvidence = {};

    const recScore    = es.recognition.total > 0 ? es.recognition.score / es.recognition.total : null;
    const matchScore  = es.matching.total > 0 ? es.matching.score / es.matching.total : null;
    const ctrlScore   = es.controlledProduction.total > 0 ? es.controlledProduction.score / es.controlledProduction.total : null;
    const grammarScore = (gcs.grammar && gcs.grammar.submitted && gcs.grammar.total > 0)
      ? gcs.grammar.score / gcs.grammar.total : null;

    const dialoguePartADone = ds.partAChecked && ds.partATotal > 0;
    const dialoguePartBDone = ds.partBChecked && ds.partBTotal > 0;
    const dialogueDone = dialoguePartADone || dialoguePartBDone;
    const dialogueScore = dialogueDone
      ? ((ds.partAScore || 0) + (ds.partBScore || 0)) / ((ds.partATotal || 0) + (ds.partBTotal || 0))
      : null;

    const infoGapDone = igs.completed && igs.total > 0;
    const infoGapScore = infoGapDone ? igs.score / igs.total : null;

    const transferDone = ts.submitted;
    const transferResponded = ts.responses && Object.values(ts.responses).some(v => v && v.trim().length > 5);

    const newScores = {};
    const newEvidence = {};

    // target_grammar: Practice recognition + controlled + Guided Dialogue + InfoGap
    if (recScore !== null || ctrlScore !== null || dialogueDone || infoGapDone) {
      const vals = [recScore, ctrlScore].filter(v => v !== null);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      newScores['target_grammar'] = Math.min(2, Math.round(avg * 2));
      newEvidence['target_grammar'] = true;
    }

    // verb_be_agreement: Grammar quick check + Practice recognition
    if (grammarScore !== null || recScore !== null) {
      const vals = [grammarScore, recScore].filter(v => v !== null);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      newScores['verb_be_agreement'] = Math.min(2, Math.round(avg * 2));
      newEvidence['verb_be_agreement'] = true;
    }

    // vocabulary: Vocab check + Matching
    if (matchScore !== null || (gcs.vocabulary && gcs.vocabulary.submitted)) {
      const vals = [matchScore].filter(v => v !== null);
      if (gcs.vocabulary && gcs.vocabulary.submitted && gcs.vocabulary.total > 0) {
        vals.push(gcs.vocabulary.score / gcs.vocabulary.total);
      }
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      newScores['vocabulary'] = Math.min(2, Math.round(avg * 2));
      newEvidence['vocabulary'] = true;
    }

    // questions_negatives: Practice controlled + Guided Dialogue
    if (ctrlScore !== null || dialogueDone) {
      const vals = [ctrlScore, dialogueScore].filter(v => v !== null);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      newScores['questions_negatives'] = Math.min(2, Math.round(avg * 2));
      newEvidence['questions_negatives'] = true;
    }

    // meaning: Guided Dialogue + Transfer text
    if (dialogueDone || transferDone) {
      const vals = [];
      if (dialogueDone) vals.push(dialogueScore);
      if (transferDone && transferResponded) vals.push(0.8); // formative only
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      newScores['meaning'] = Math.min(2, Math.round(avg * 2));
      newEvidence['meaning'] = true;
    }

    // interaction: Guided Dialogue + InfoGap + Transfer completion
    if (dialogueDone || infoGapDone || transferDone) {
      const vals = [dialogueScore, infoGapScore].filter(v => v !== null);
      if (transferDone) vals.push(transferResponded ? 1.0 : 0.5);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      newScores['interaction'] = Math.min(2, Math.round(avg * 2));
      newEvidence['interaction'] = true;
    }

    // repair: Only score if a repair prompt was explicitly presented (not in this lesson yet)
    // Leave as NOT_ASSESSED

    // transfer: Submitted Stage 10 transfer scenario
    if (transferDone) {
      newScores['transfer'] = transferResponded ? (Object.values(ts.responses).filter(v => v && v.trim().length > 10).length >= 2 ? 2 : 1) : 1;
      newEvidence['transfer'] = true;
    }

    state.rubricScores = newScores;
    state.rubricEvidence = newEvidence;

    return calculateRubricScore();
  }

  // ── LEGACY COMPAT ──
  function saveStage05Attempt(dialogueChoices, infoGapAnswers) {
    const snapshot = {
      id: `attempt-stage05-${Date.now()}`,
      type: 'stage05_curated_scenario',
      lessonId: state.currentLessonId,
      lessonVersion: LX.lesson_A1_001?.version,
      dialogueChoices: [...(dialogueChoices || [])],
      infoGapAnswers: { ...(infoGapAnswers || {}) },
      completedAt: new Date().toISOString(),
      immutable: true,
    };
    state.attemptRecords.stage05_attempt = snapshot;
    if (LX.learnerData) LX.learnerData.attempts.push(snapshot);
    scheduleAutoSave();
    return snapshot;
  }

  function saveStage06Attempt(scenarioId, responses, score, feedback) {
    const attempt = {
      id: `attempt-stage06-${Date.now()}`,
      type: 'stage06_transfer_scenario',
      lessonId: state.currentLessonId,
      scenarioId,
      responses: { ...(responses || {}) },
      score,
      feedback,
      rubricScores: { ...state.rubricScores },
      completedAt: new Date().toISOString(),
    };
    state.attemptRecords.stage06_attempts.push(attempt);
    if (LX.learnerData) LX.learnerData.attempts.push(attempt);
    return attempt;
  }

  // ── PUBLIC API ──
  LX.state = state;
  LX.STAGES = STAGES;
  LX.INSTRUCTIONAL_STAGE_KEYS = INSTRUCTIONAL_STAGE_KEYS;
  LX.INSTRUCTIONAL_STAGE_COUNT = P.INSTRUCTIONAL_STAGE_COUNT;
  LX.STAGE_STATUS = SS;

  LX.getInstructionalProgress = getInstructionalProgress;
  LX.getEvidenceProgress = getEvidenceProgress;
  LX.getStageStatus = getStageStatus;
  LX.isStageNavigable = isStageNavigable;
  LX.isStageLocked = isStageLocked;
  LX.updateStageStatus = updateStageStatus;
  LX.markStageViewed = markStageViewed;
  LX.markStageComplete = markStageComplete;

  LX.startLesson = startLesson;
  LX.completeLesson = completeLesson;
  LX.saveAndExit = saveAndExit;
  LX.performAutoSave = performAutoSave;
  LX.buildProgressData = buildProgressData;
  LX.scheduleAutoSave = scheduleAutoSave;
  LX.recordActivity = recordActivity;
  LX.startActiveTimer = startActiveTimer;
  LX.pauseActiveTimer = pauseActiveTimer;
  LX.getActiveDurationSeconds = getActiveDurationSeconds;

  LX.autoScoreRubric = autoScoreRubric;
  LX.calculateRubricScore = calculateRubricScore;
  LX.getScoreBand = getScoreBand;

  // Sidebar rendering
  LX._renderSidebar = _renderSidebar;
  LX._buildSidebarItems = _buildSidebarItems;
  LX._renderProgressIndicator = _renderProgressIndicator;
  LX._navigateToStage = _navigateToStage;

  // Legacy
  LX.saveStage05Attempt = saveStage05Attempt;
  LX.saveStage06Attempt = saveStage06Attempt;

})();
