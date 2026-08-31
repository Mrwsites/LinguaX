/* ===== LinguaX State Management ===== */
(function () {
  'use strict';

  const LX = window.LX;

  // ── STATE ──
  const state = {
    currentRole: 'learner',   // learner | teacher | platform_admin
    currentView: 'dashboard', // dashboard | lesson | teacher | admin
    currentLessonId: 'A1-BE-LOST-PROPERTY-001',
    currentStage: 0,          // 0-indexed lesson stage
    stagesCompleted: new Set(),

    // Exercise state
    exerciseState: {
      recognition: { answers: {}, checked: false, score: 0, total: 0 },
      matching: { answers: {}, checked: false, score: 0, total: 0 },
      controlledProduction: { answers: {}, checked: false, score: 0, total: 0 },
      questionTransform: { answers: {}, checked: false, score: 0, total: 0 },
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

    // Attempt records
    attemptRecords: {
      stage05_attempt: null,   // Immutable snapshot of guided scenario attempt
      stage06_attempts: [],    // Transfer challenge attempts (separate from stage05)
    },

    // Review schedule
    reviewSchedule: null,
  };

  // ── STAGE DEFINITIONS ──
  const STAGES = [
    { id: 'overview', label: 'Lesson Overview', icon: '📋', tag: 'Overview', color: '#5B61F6', tagClass: 'role-learner' },
    { id: 'visual', label: 'Visual Time', icon: '👁️', tag: 'Stage 01', color: '#5B61F6', tagClass: 'role-learner' },
    { id: 'grammar', label: 'Grammar Focus', icon: '📐', tag: 'Stage 02', color: '#7C3AED', tagClass: 'role-platform' },
    { id: 'coresentence', label: 'Core Sentences', icon: '🔑', tag: 'Stage 03', color: '#0D9488', tagClass: 'role-teacher' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📖', tag: 'Stage 04', color: '#D97706', tagClass: 'role-teacher' },
    { id: 'phrases', label: 'Useful Sentences', icon: '💬', tag: 'Stage 04b', color: '#2D7E5E', tagClass: '' },
    { id: 'practice', label: 'Practice', icon: '✏️', tag: 'Stage 05', color: '#DC2626', tagClass: '' },
    { id: 'dialogue', label: 'Guided Dialogue', icon: '🗣️', tag: 'Stage 05b', color: '#0369A1', tagClass: '' },
    { id: 'infogap', label: 'Information Gap', icon: '🔍', tag: 'Stage 05c', color: '#0369A1', tagClass: '' },
    { id: 'transfer', label: 'Transfer: New Situation', icon: '🚀', tag: 'Stage 06', color: '#BE123C', tagClass: '' },
    { id: 'feedback', label: 'Feedback & Score', icon: '📊', tag: 'Results', color: '#475569', tagClass: '' },
    { id: 'review', label: 'Review Plan', icon: '📅', tag: 'Review', color: '#475569', tagClass: '' },
  ];

  // ── HELPERS ──
  function markStageComplete(stageIdx) {
    state.stagesCompleted.add(stageIdx);
    // Save progress
    const progress = LX.learnerData.progress[state.currentLessonId];
    if (progress) {
      progress.stagesCompleted = Array.from(state.stagesCompleted);
      if (state.stagesCompleted.size === STAGES.length - 2) { // minus feedback & review
        progress.status = 'completed';
        progress.completedAt = new Date().toISOString();
        scheduleReview();
      }
    }
  }

  function scheduleReview() {
    const now = new Date();
    state.reviewSchedule = [
      { type: 'immediate', due: now.toISOString(), label: 'End-of-lesson oral recap', completed: false },
      { type: 'sameday', due: new Date(now.getTime() + 8 * 3600000).toISOString(), label: 'Same-day recognition task', completed: false },
      { type: 'nextlesson', due: new Date(now.getTime() + 24 * 3600000).toISOString(), label: 'Next-lesson guided scenario', completed: false },
      { type: 'threedays', due: new Date(now.getTime() + 3 * 24 * 3600000).toISOString(), label: '3-day dialogue task', completed: false },
      { type: 'sevendays', due: new Date(now.getTime() + 7 * 24 * 3600000).toISOString(), label: '7-day independent transfer', completed: false },
      { type: 'weeks', due: new Date(now.getTime() + 14 * 24 * 3600000).toISOString(), label: '2-week mixed grammar review', completed: false },
    ];
    LX.learnerData.reviewQueue = state.reviewSchedule;
  }

  function saveStage05Attempt(dialogueChoices, infoGapAnswers) {
    // IMPORTANT: This creates an immutable snapshot of the Stage 05 curated scenario.
    // A Stage 06 transfer attempt must NEVER overwrite this record.
    const snapshot = {
      id: `attempt-stage05-${Date.now()}`,
      type: 'stage05_curated_scenario',
      lessonId: state.currentLessonId,
      lessonVersion: LX.lesson_A1_001.version,
      contentType: 'CURATED_CORE',
      grammarPointIds: LX.lesson_A1_001.grammarPointIds,
      cefrLevel: 'A1',
      scenarioFamily: LX.lesson_A1_001.scenarioFamily,
      dialogueChoices: [...dialogueChoices],
      infoGapAnswers: { ...infoGapAnswers },
      completedAt: new Date().toISOString(),
      immutable: true,  // Flag: this record must not be mutated by generated practice
    };
    state.attemptRecords.stage05_attempt = snapshot;
    LX.learnerData.attempts.push(snapshot);
    return snapshot;
  }

  function saveStage06Attempt(scenarioId, responses, score, feedback) {
    // Stage 06 transfer — SEPARATE record from Stage 05.
    // content_source: CURATED_CORE (from curated scenario bank — pre-AI generation)
    const attempt = {
      id: `attempt-stage06-${Date.now()}`,
      type: 'stage06_transfer_scenario',
      lessonId: state.currentLessonId,
      lessonVersion: LX.lesson_A1_001.version,
      sourceStage05AttemptId: state.attemptRecords.stage05_attempt?.id || null,
      contentType: 'CURATED_CORE',  // Using curated scenario bank for Phase 1
      scenarioId,
      cefrLevel: 'A1',
      grammarPointIds: LX.lesson_A1_001.grammarPointIds,
      scenarioFamily: LX.lesson_A1_001.scenarioFamily,
      generationRequestId: null,  // null = curated, not AI-generated
      promptVersion: null,
      validationStatus: 'auto_approved',  // curated scenarios pre-validated
      releaseStatus: 'released',
      responses: { ...responses },
      score,
      feedback,
      rubricScores: { ...state.rubricScores },
      completedAt: new Date().toISOString(),
    };
    state.attemptRecords.stage06_attempts.push(attempt);
    LX.learnerData.attempts.push(attempt);
    return attempt;
  }

  function calculateRubricScore() {
    const dims = LX.lesson_A1_001.rubric.dimensions;
    let total = 0;
    dims.forEach(dim => {
      const score = state.rubricScores[dim.id] || 0;
      total += score;
    });
    return total;
  }

  function getScoreBand(score) {
    const bands = LX.lesson_A1_001.rubric.scoreBands;
    return bands.find(b => score >= b.min && score <= b.max) || bands[0];
  }

  // Auto-score based on exercise performance
  function autoScoreRubric() {
    const es = state.exerciseState;
    const ds = state.dialogueState;
    const ts = state.transferState;

    const recScore = es.recognition.total > 0 ? es.recognition.score / es.recognition.total : 0;
    const matchScore = es.matching.total > 0 ? es.matching.score / es.matching.total : 0;
    const ctrlScore = es.controlledProduction.total > 0 ? es.controlledProduction.score / es.controlledProduction.total : 0;
    const dialogueScore = ds.completed ? 1.5 : (ds.choices.length > 0 ? 0.5 : 0);
    const transferScore = ts.submitted ? (Object.keys(ts.responses).length >= 3 ? 1.5 : 1) : 0;

    state.rubricScores = {
      target_grammar: Math.min(2, Math.round((recScore + ctrlScore) * 2 / 2)),
      verb_be_agreement: Math.min(2, Math.round(recScore * 2)),
      vocabulary: Math.min(2, Math.round(matchScore * 2)),
      questions_negatives: Math.min(2, Math.round(ctrlScore * 2)),
      meaning: Math.min(2, Math.round(dialogueScore)),
      interaction: Math.min(2, Math.round(dialogueScore)),
      repair: 1, // Default 1 for attempted students
      transfer: Math.min(2, Math.round(transferScore)),
    };

    return calculateRubricScore();
  }

  // ── PUBLIC API ──
  LX.state = state;
  LX.STAGES = STAGES;
  LX.markStageComplete = markStageComplete;
  LX.saveStage05Attempt = saveStage05Attempt;
  LX.saveStage06Attempt = saveStage06Attempt;
  LX.autoScoreRubric = autoScoreRubric;
  LX.calculateRubricScore = calculateRubricScore;
  LX.getScoreBand = getScoreBand;

})();
