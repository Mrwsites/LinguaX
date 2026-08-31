/* ===== LinguaX Main Application — Phase 1.5 ===== */
(function () {
  'use strict';

  const LX = window.LX;
  const P = LX.persist;
  const st = LX.state;

  // ── UTILS ──
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function $(sel, root) { return (root || document).querySelector(sel); }

  // ── ROUTER ──
  function getRoute() {
    const hash = location.hash.replace('#', '') || '';
    if (hash.startsWith('/lesson')) return 'lesson';
    if (hash.startsWith('/teacher')) return 'teacher';
    if (hash.startsWith('/admin')) return 'admin';
    if (hash.startsWith('/attempts/compare')) return 'attempt_compare';
    if (hash.startsWith('/attempts/')) return 'attempt_detail';
    if (hash.startsWith('/attempts')) return 'attempts';
    return 'dashboard';
  }

  function navigate(route) {
    location.hash = route;
    const r = route.replace('#', '');
    if (r.startsWith('/lesson')) st.currentView = 'lesson';
    else if (r.startsWith('/teacher')) st.currentView = 'teacher';
    else if (r.startsWith('/admin')) st.currentView = 'admin';
    else if (r.startsWith('/attempts/compare')) st.currentView = 'attempt_compare';
    else if (r.startsWith('/attempts/')) {
      // e.g. /attempts/attempt-id-here
      st.readOnlyAttemptId = r.replace('/attempts/', '');
      st.currentView = 'attempt_detail';
    }
    else if (r.startsWith('/attempts')) st.currentView = 'attempts';
    else st.currentView = 'dashboard';
    render();
  }

  window.addEventListener('hashchange', () => {
    const route = location.hash.replace('#', '') || '';
    if (route.startsWith('/attempts/compare')) {
      st.currentView = 'attempt_compare';
    } else if (route.startsWith('/attempts/')) {
      st.readOnlyAttemptId = route.replace('/attempts/', '');
      st.currentView = 'attempt_detail';
    } else if (route.startsWith('/attempts')) {
      st.currentView = 'attempts';
    } else {
      st.currentView = getRoute();
    }
    render();
  });

  // ── ROOT ──
  const root = document.getElementById('app-root');

  function render() {
    root.innerHTML = '';
    const shell = el('div', 'app-shell');
    shell.appendChild(renderNav());
    const main = el('main', 'app-main');
    const content = el('div', 'app-content fade-in');

    content.appendChild(renderRoleSwitcher());

    if (st.currentView === 'lesson')           content.appendChild(renderLessonView());
    else if (st.currentView === 'teacher')     content.appendChild(renderTeacherView());
    else if (st.currentView === 'admin')       content.appendChild(renderAdminView());
    else if (st.currentView === 'attempts')    content.appendChild(renderAttemptsPage());
    else if (st.currentView === 'attempt_detail')  content.appendChild(renderAttemptDetailPage());
    else if (st.currentView === 'attempt_compare') content.appendChild(renderAttemptComparePage());
    else content.appendChild(renderDashboard());

    main.appendChild(content);
    shell.appendChild(main);
    root.appendChild(shell);
    attachHandlers();
  }

  // ── NAV ──
  function renderNav() {
    const profiles = {
      learner: LX.learnerData.profile,
      teacher: LX.teacherData.profile,
      platform_admin: LX.adminData.profile,
    };
    const p = profiles[st.currentRole] || profiles.learner;
    const roleClass = { learner: 'role-learner', teacher: 'role-teacher', platform_admin: 'role-platform' }[st.currentRole] || 'role-learner';
    const roleName = { learner: 'Learner', teacher: 'Teacher', platform_admin: 'Platform Admin' }[st.currentRole] || 'Learner';

    const showBack = st.currentView !== 'dashboard';
    const nav = el('nav', 'app-nav');
    nav.innerHTML = `
    <div class="app-nav-inner">
      <a href="/app" class="app-logo" id="nav-home-btn">
        <div class="app-logo-mark">Lx</div>
        <span class="app-logo-text">Lingua<span>X</span></span>
      </a>
      <div class="flex items-center gap-12">
        <span class="nav-role-badge ${roleClass}">${roleName}</span>
        <div class="nav-avatar">${p.avatar}</div>
        <span style="font-size:14px;font-weight:600;color:var(--navy)">${p.name}</span>
        ${showBack ? `<button class="nav-back-btn" id="nav-back-btn">← Dashboard</button>` : ''}
      </div>
    </div>`;
    return nav;
  }

  // ── ROLE SWITCHER ──
  function renderRoleSwitcher() {
    const roles = [
      { id: 'learner', label: '👩‍🎓 Learner', view: 'dashboard' },
      { id: 'teacher', label: '👩‍🏫 Teacher', view: 'teacher' },
      { id: 'platform_admin', label: '🛠️ Platform Admin', view: 'admin' },
    ];
    const d = el('div', 'role-switcher');
    d.innerHTML = `<span class="role-switcher-label">View as:</span>` +
      roles.map(r => `<button class="role-btn${st.currentRole === r.id ? ' active' : ''}" data-role="${r.id}" data-view="${r.view}">${r.label}</button>`).join('');
    return d;
  }

  // ══════════════════════════════════════════════
  // ── DASHBOARD ──
  // ══════════════════════════════════════════════
  function renderDashboard() {
    const div = el('div');
    div.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Good day,</div>
      <div class="dashboard-title">Your Learning Path 📚</div>
    </div>`;
    const grid = el('div', 'dashboard-grid');
    grid.appendChild(renderLessonCards());
    grid.appendChild(renderSidebar());
    div.appendChild(grid);
    return div;
  }

  function renderLessonCards() {
    const lesson = LX.lesson_A1_001;
    const activeAttempt = P.getActiveAttempt();
    const latestCompleted = P.getLatestCompletedAttempt();
    const allAttempts = P.getAllAttempts();
    const completedCount = allAttempts.filter(a => a.status === 'COMPLETED').length;

    const col = el('div', 'dashboard-lessons');
    col.innerHTML = `<div class="section-title-sm">📚 Your Lessons</div>`;

    // ── Lesson card based on state ──
    const card = el('div', 'lesson-card-lg');

    if (activeAttempt) {
      // IN-PROGRESS state
      const prog = LX.getInstructionalProgress();
      const stageLabel = LX.STAGES[activeAttempt.current_stage_index]?.label || 'Overview';
      card.innerHTML = `
      <div class="lesson-card-accent-bar" style="background:var(--accent)"></div>
      <div class="lesson-card-body">
        <div class="lesson-card-meta">
          <span class="cefr-badge cefr-a1">A1</span>
          <span class="lesson-family">🏛️ Community & Public Places</span>
          <span class="lesson-duration">⏱ 25 min</span>
          <span class="lesson-duration">· Attempt ${activeAttempt.attempt_number}</span>
        </div>
        <div class="lesson-title">${lesson.title}</div>
        <div class="lesson-objective">${lesson.objective}</div>

        <div style="background:var(--accent-light);border-radius:8px;padding:12px 14px;margin:12px 0;border:1px solid var(--accent)">
          <div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:4px">▶ In progress</div>
          <div style="font-size:13px;color:var(--navy)">Last saved: ${P.formatDateTime(activeAttempt.last_saved_at)}</div>
          <div style="font-size:13px;color:var(--navy)">Current stage: ${stageLabel}</div>
        </div>

        <div class="lesson-progress-wrap">
          <div class="lesson-progress-label">
            <span class="lesson-progress-text">${prog.count} of ${prog.total} learning stages</span>
            <span class="lesson-progress-pct">${prog.pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${prog.pct}%;background:var(--accent)"></div>
          </div>
        </div>

        <div class="lesson-card-footer-lg" style="flex-wrap:wrap;gap:8px">
          <span class="status-pill status-pill-inprogress">▶ In progress</span>
          <button class="btn-continue" id="continue-lesson-btn">▶ Continue Lesson</button>
          ${completedCount > 0 ? `<button class="btn-outline-sm" id="view-attempts-btn-card">View all attempts</button>` : ''}
        </div>
      </div>`;

    } else if (latestCompleted) {
      // COMPLETED state
      const band = latestCompleted.result_band;
      const bandLabel = P.getResultBandLabel(band);
      const bandColor = P.getResultBandColor(band);
      const score = latestCompleted.total_score;
      const scenarioTitle = latestCompleted.attempt_summary_json?.transferScenarioTitle || '—';

      card.innerHTML = `
      <div class="lesson-card-accent-bar" style="background:var(--green)"></div>
      <div class="lesson-card-body">
        <div class="lesson-card-meta">
          <span class="cefr-badge cefr-a1">A1</span>
          <span class="lesson-family">🏛️ Community & Public Places</span>
          <span class="lesson-duration">⏱ 25 min</span>
        </div>
        <div class="lesson-title">${lesson.title}</div>
        <div class="lesson-objective">${lesson.objective}</div>

        <div style="background:var(--green-light);border-radius:8px;padding:12px 14px;margin:12px 0;border:1px solid var(--green)">
          <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:6px">✓ Completed · Attempt ${latestCompleted.attempt_number}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div style="font-size:13px;color:var(--navy)">Latest score: <strong>${score !== null ? score + '/16' : '—'}</strong></div>
            <div style="font-size:13px;color:${bandColor};font-weight:700">${bandLabel}</div>
            <div style="font-size:12px;color:var(--grey)">Completed: ${P.formatDate(latestCompleted.completed_at)}</div>
            <div style="font-size:12px;color:var(--grey)">Scenario: ${scenarioTitle}</div>
          </div>
        </div>

        <div class="lesson-card-footer-lg" style="flex-wrap:wrap;gap:8px">
          <span class="status-pill status-pill-completed">✓ Completed</span>
          <button class="btn-review" id="new-attempt-btn">⊕ New Attempt</button>
          <button class="btn-outline-sm" id="view-attempts-btn-card">Lesson History</button>
        </div>
      </div>`;

    } else {
      // NOT STARTED state
      card.innerHTML = `
      <div class="lesson-card-accent-bar" style="background:var(--accent)"></div>
      <div class="lesson-card-body">
        <div class="lesson-card-meta">
          <span class="cefr-badge cefr-a1">A1</span>
          <span class="lesson-family">🏛️ Community & Public Places</span>
          <span class="lesson-duration">⏱ 25 min</span>
          <span class="lesson-duration">· ${P.INSTRUCTIONAL_STAGE_COUNT} stages</span>
        </div>
        <div class="lesson-title">${lesson.title}</div>
        <div class="lesson-objective">${lesson.objective}</div>
        <div class="lesson-card-footer-lg">
          <span class="status-pill status-pill-notstarted">● Not started</span>
          <button class="btn-start" id="start-lesson-btn">→ Start Lesson</button>
        </div>
      </div>`;
    }

    col.appendChild(card);

    // Coming soon card
    const comingSoon = el('div', 'lesson-card-lg', `
    <div class="lesson-card-accent-bar" style="background:var(--border)"></div>
    <div class="lesson-card-body" style="opacity:0.5">
      <div class="lesson-card-meta">
        <span class="cefr-badge cefr-a2">A2</span>
        <span class="lesson-family">🏨 Travel & Transport</span>
        <span class="lesson-duration">⏱ 30 min</span>
      </div>
      <div class="lesson-title">Hotel Check-In: My Room Has a Problem</div>
      <div class="lesson-objective">I can describe a problem with my room and ask for help from a receptionist.</div>
      <div class="lesson-card-footer-lg">
        <span class="status-pill status-pill-locked">🔒 Coming soon</span>
      </div>
    </div>`);
    col.appendChild(comingSoon);

    return col;
  }

  function renderSidebar() {
    const col = el('div', 'dashboard-sidebar');
    const prog = LX.getInstructionalProgress();
    const allAttempts = P.getAllAttempts();
    const completedAttempts = allAttempts.filter(a => a.status === 'COMPLETED');
    const allReviews = P.getAllReviewEvents();

    // Mastery widget
    const masteryCard = el('div', 'sidebar-card');
    const hasProgress = prog.count > 0;
    masteryCard.innerHTML = `<div class="sidebar-card-title">🎯 Grammar Mastery</div>
    <div class="mastery-row">
      <span class="mastery-label">is (singular)</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${hasProgress ? 65 : 0}%;background:var(--accent)"></div></div>
      <span class="mastery-score text-accent">${hasProgress ? '65%' : '0%'}</span>
    </div>
    <div class="mastery-row">
      <span class="mastery-label">are (plural)</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${hasProgress ? 55 : 0}%;background:var(--accent)"></div></div>
      <span class="mastery-score text-accent">${hasProgress ? '55%' : '0%'}</span>
    </div>
    <div class="mastery-row">
      <span class="mastery-label">'s possession</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${prog.count > 3 ? 40 : 0}%;background:var(--teal)"></div></div>
      <span class="mastery-score" style="color:var(--teal)">${prog.count > 3 ? '40%' : '0%'}</span>
    </div>
    <div class="mastery-row">
      <span class="mastery-label">Is/Are…?</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${prog.count > 4 ? 30 : 0}%;background:var(--purple)"></div></div>
      <span class="mastery-score" style="color:var(--purple)">${prog.count > 4 ? '30%' : '0%'}</span>
    </div>`;
    col.appendChild(masteryCard);

    // Review queue
    const reviewCard = el('div', 'sidebar-card');
    const reviews = allReviews.length > 0
      ? allReviews.slice(0, 4).map(r => `
      <div class="review-item">
        <div class="review-dot" style="background:${r.status === 'AVAILABLE' ? 'var(--green)' : r.status === 'COMPLETED' ? 'var(--grey)' : 'var(--accent)'}"></div>
        <div class="review-info">
          <div class="review-grammar">${_reviewTypeLabel(r.review_type)}</div>
          <div class="review-due">${r.status === 'COMPLETED' ? '✓ Done' : r.status === 'AVAILABLE' ? '⚡ Available now' : 'Due: ' + P.formatDate(r.scheduled_for)}</div>
        </div>
      </div>`).join('')
      : `<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">Complete a lesson to see your review schedule</div></div>`;
    reviewCard.innerHTML = `<div class="sidebar-card-title">📅 Review Schedule</div>${reviews}`;
    col.appendChild(reviewCard);

    // Quick stats
    const statsCard = el('div', 'sidebar-card');
    statsCard.innerHTML = `<div class="sidebar-card-title">📊 Progress</div>
    <div class="flex" style="gap:16px;flex-wrap:wrap;margin-top:4px">
      <div class="stat-block" style="text-align:center;flex:1;min-width:60px">
        <div style="font-size:28px;font-weight:800;color:var(--accent)">${prog.pct}%</div>
        <div style="font-size:11px;color:var(--grey)">lesson done</div>
      </div>
      <div class="stat-block" style="text-align:center;flex:1;min-width:60px">
        <div style="font-size:28px;font-weight:800;color:var(--green)">${completedAttempts.length}</div>
        <div style="font-size:11px;color:var(--grey)">attempts done</div>
      </div>
      <div class="stat-block" style="text-align:center;flex:1;min-width:60px">
        <div style="font-size:28px;font-weight:800;color:var(--amber)">${allReviews.filter(r => r.status !== 'COMPLETED').length}</div>
        <div style="font-size:11px;color:var(--grey)">reviews due</div>
      </div>
    </div>
    ${allAttempts.length > 1 ? `<div style="margin-top:12px"><button class="btn-outline-sm" id="compare-attempts-btn" style="width:100%">📊 Compare attempts</button></div>` : ''}`;
    col.appendChild(statsCard);

    return col;
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

  // ══════════════════════════════════════════════
  // ── LESSON VIEW ──
  // ══════════════════════════════════════════════
  function renderLessonView() {
    const div = el('div', 'lesson-layout');
    div.appendChild(renderLessonSidebar());
    const content = el('div', 'lesson-content');

    // Save/exit bar
    if (!st.isReadOnly) {
      content.appendChild(renderSaveBar());
    } else {
      content.appendChild(renderReadOnlyBanner());
    }

    content.appendChild(renderLessonHeader());

    const stage = LX.STAGES[st.currentStage];
    content.appendChild(renderStageContent(stage));

    div.appendChild(content);
    return div;
  }

  function renderSaveBar() {
    const attempt = st.currentAttemptId ? P.getAttempt(st.currentAttemptId) : null;
    const attemptNum = attempt?.attempt_number || 1;
    const bar = el('div', 'lx-save-bar');
    bar.innerHTML = `
    <div class="lx-save-bar-inner">
      <span class="lx-attempt-badge">Attempt ${attemptNum}</span>
      <span class="lx-save-indicator saved" id="lx-save-indicator">Saved</span>
      <button class="lx-save-exit-btn" id="save-exit-btn">Save &amp; exit</button>
    </div>`;
    return bar;
  }

  function renderReadOnlyBanner() {
    const attempt = st.readOnlyAttemptId ? P.getAttempt(st.readOnlyAttemptId) : null;
    const bar = el('div', 'lx-readonly-banner');
    bar.innerHTML = `
    <div class="lx-save-bar-inner">
      <span class="lx-readonly-badge">🔒 Historical Attempt ${attempt?.attempt_number || '—'} — Read only</span>
      <button class="nav-back-btn" id="back-to-attempts-btn">← Back to Lesson History</button>
    </div>`;
    return bar;
  }

  function renderLessonSidebar() {
    const lesson = LX.lesson_A1_001;
    const prog = LX.getInstructionalProgress();
    const sidebar = el('div', 'lesson-sidebar');

    const stagesSource = st.isReadOnly && st.readOnlyAttemptId
      ? _buildReadOnlyStageCompletion()
      : null;

    const map = el('div', 'lesson-map');
    map.innerHTML = `
    <div class="lesson-map-title">📋 ${lesson.title}</div>
    <div class="lesson-map-obj" style="font-size:12px;color:var(--accent);font-weight:600">A1 · ${lesson.estimatedMinutes} min</div>
    <div class="lesson-map-obj">${lesson.objective}</div>
    <div style="margin:8px 0;padding:8px 10px;background:var(--grey-bg);border-radius:6px;font-size:12px;color:var(--grey)">
      ${prog.pct >= 100
        ? '<span style="color:var(--green);font-weight:700">✓ Lesson complete</span>'
        : `${prog.count} of ${prog.total} learning stages · ${prog.pct}%`}
    </div>
    <div class="divider"></div>
    <div class="stage-list" id="stage-list">
      ${LX.STAGES.map((s, i) => {
        const isActive = i === st.currentStage;
        const isDone = stagesSource ? stagesSource.has(s.id) : st.stagesCompleted.has(s.id);
        const isInstructional = LX.INSTRUCTIONAL_STAGE_KEYS.includes(s.id);
        let cls = 'stage-item';
        if (isActive) cls += ' active';
        if (isDone) cls += ' completed-stage';
        const isLocked = !st.isReadOnly && i > 0 && !st.stagesCompleted.has(LX.STAGES[i-1]?.id) && !isActive && !isDone;
        return `
        <div class="${cls}" data-stage="${i}" ${isLocked ? 'style="opacity:0.45;pointer-events:none"' : ''}>
          <div class="stage-num ${isActive ? 'stage-num-active' : isDone ? 'stage-num-done' : 'stage-num-default'}">
            ${isDone ? '✓' : i + 1}
          </div>
          <div class="stage-info">
            <div class="stage-label">${s.label}</div>
            <div class="stage-sublabel">${s.tag}${isInstructional ? '' : ''}</div>
          </div>
          ${isActive ? '<span style="font-size:12px">▶</span>' : ''}
          ${isDone ? '<span class="stage-check">✓</span>' : ''}
        </div>`;
      }).join('')}
    </div>`;
    sidebar.appendChild(map);
    return sidebar;
  }

  function _buildReadOnlyStageCompletion() {
    const stageAttempts = P.getStageAttempts(st.readOnlyAttemptId);
    return new Set(
      Object.entries(stageAttempts)
        .filter(([, sa]) => sa.status === 'COMPLETED')
        .map(([key]) => key)
    );
  }

  function renderLessonHeader() {
    const lesson = LX.lesson_A1_001;
    const card = el('div', 'lesson-header-card');
    card.innerHTML = `
    <div class="lesson-header-meta">
      <span class="cefr-badge cefr-a1">A1</span>
      <span style="font-size:12px;color:rgba(255,255,255,0.6)">⏱ ${lesson.estimatedMinutes} min</span>
      <span style="font-size:12px;color:rgba(255,255,255,0.6)">🏛️ ${lesson.scenarioFamilyName}</span>
      <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-weight:600">ID: ${lesson.id}</span>
    </div>
    <div class="lesson-header-title">${lesson.title}</div>
    <div class="lesson-header-obj"><strong>🎯 Learning goal:</strong> ${lesson.objective}</div>`;
    return card;
  }

  // ── STAGE ROUTER ──
  function renderStageContent(stage) {
    const stageMap = {
      overview: renderOverviewStage,
      visual: renderVisualStage,
      grammar: renderGrammarStage,
      coresentence: renderCoreSentenceStage,
      vocabulary: renderVocabStage,
      phrases: renderPhrasesStage,
      practice: renderPracticeStage,
      dialogue: renderDialogueStage,
      infogap: renderInfoGapStage,
      transfer: renderTransferStage,
      feedback: renderFeedbackStage,
      review: renderReviewStage,
    };
    const fn = stageMap[stage.id] || renderOverviewStage;
    return fn();
  }

  function sectionCard(color, stageTag, title, bodyHTML, navBtns) {
    const card = el('div', 'section-card');
    const header = el('div', 'section-header-block', `
      <div class="section-stage-tag" style="color:rgba(255,255,255,0.8)">${stageTag}</div>
      <div class="section-title-lg">${title}</div>
    `);
    header.style.background = `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`;
    card.appendChild(header);
    const body = el('div');
    body.innerHTML = bodyHTML;
    card.appendChild(body);
    if (navBtns) card.appendChild(navBtns);
    return card;
  }

  function navButtons(stageIdx) {
    const isFirst = stageIdx === 0;
    const isLast = stageIdx === LX.STAGES.length - 1;
    const isReadOnly = st.isReadOnly;
    const div = el('div', 'flex');
    div.innerHTML = `
    <div style="display:flex;justify-content:space-between;padding:16px 24px;border-top:1px solid var(--border)">
      ${!isFirst ? `<button class="nav-back-btn" id="prev-stage-btn">← Previous</button>` : '<span></span>'}
      ${isReadOnly
        ? (isLast ? `<button class="btn-outline-sm" id="back-to-attempts-btn">← Back to History</button>` : `<button class="btn-start" id="next-stage-btn" style="opacity:0.6;cursor:default">Next →</button>`)
        : (!isLast ? `<button class="btn-start" id="next-stage-btn">Next Stage →</button>` : `<button class="btn-review" id="finish-btn">🎉 Finish Lesson</button>`)
      }
    </div>`;
    return div;
  }

  // ── STAGE 0: OVERVIEW ──
  function renderOverviewStage() {
    const lesson = LX.lesson_A1_001;
    const stagesHtml = LX.STAGES.slice(1, -1).map((s, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="width:28px;height:28px;border-radius:50%;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">${i + 1}</span>
        <span style="font-size:14px;font-weight:600;color:var(--navy)">${s.label}</span>
        <span style="margin-left:auto;font-size:11px;color:var(--grey);background:var(--grey-bg);padding:2px 8px;border-radius:10px">${s.tag}</span>
      </div>`).join('');

    const body = `
    <div style="padding:24px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
        <div style="background:var(--accent-light);border-radius:var(--radius-md);padding:16px;border:1px solid var(--accent)">
          <div style="font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">🎯 Learning Objective</div>
          <div style="font-size:14px;color:var(--navy);line-height:1.5">${lesson.objective}</div>
        </div>
        <div style="background:var(--green-light);border-radius:var(--radius-md);padding:16px;border:1px solid var(--green)">
          <div style="font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">📐 Grammar Focus</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.5">Present simple of <strong>to be</strong>: <strong>is / are</strong><br>Possession with <strong>'s</strong><br>Yes/no questions with <strong>Is / Are</strong></div>
        </div>
        <div style="background:var(--amber-light);border-radius:var(--radius-md);padding:16px;border:1px solid var(--amber)">
          <div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">📦 Core Sentences</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.8">${lesson.coreSentences.sentences.map(s => `<em>"${s.model}"</em>`).join('<br>')}</div>
        </div>
        <div style="background:var(--purple-light);border-radius:var(--radius-md);padding:16px;border:1px solid var(--purple)">
          <div style="font-size:11px;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">🎭 Final Scenario</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.5">Lost property desk → 4 transfer scenarios<br><strong>${P.INSTRUCTIONAL_STAGE_COUNT} learning stages</strong> from grammar to transfer</div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px">What you will do in this lesson (${P.INSTRUCTIONAL_STAGE_COUNT} stages):</div>
      ${stagesHtml}
    </div>`;

    const card = el('div', 'section-card');
    const header = el('div', 'section-header-block');
    header.style.background = 'linear-gradient(135deg, #0B1325 0%, #1E2A45 100%)';
    header.innerHTML = `<div class="section-stage-tag" style="color:rgba(255,255,255,0.7)">Lesson Overview</div><div class="section-title-lg">${lesson.title}</div>`;
    card.appendChild(header);
    card.appendChild(el('div', '', body));
    card.appendChild(navButtons(0));
    return card;
  }

  // ── STAGE 1: VISUAL TIME ──
  function renderVisualStage() {
    const vt = LX.lesson_A1_001.visualTime;
    const visualsHtml = vt.visuals.map(v => {
      const sent = v.sentence.replace(`{${v.highlight}}`, `<strong style="color:var(--accent)">${v.highlight}</strong>`);
      return `<div class="visual-card">
        <div class="visual-emoji">${v.emoji}</div>
        <div class="visual-word">${v.word}</div>
        <div class="visual-sentence">${sent}</div>
      </div>`;
    }).join('');
    const mapItems = vt.mindMapItems.map(m =>
      `<span class="visual-chip${m.highlight ? ' highlight' : ''}">${m.text}</span>`
    ).join('');

    const bodyHTML = `
    <div class="visual-time-grid">
      ${visualsHtml}
      <div class="visual-map">
        <div class="visual-map-title">🗺️ ${vt.mindMapTitle}</div>
        <div class="visual-map-content">${mapItems}</div>
      </div>
    </div>
    <div style="padding:0 24px 20px;font-size:13px;color:var(--grey);text-align:center;font-style:italic">"${vt.tagline}"</div>`;

    return sectionCard('#5B61F6', vt.stage, `${vt.label}: ${vt.tagline}`, bodyHTML, navButtons(1));
  }

  // ── STAGE 2: GRAMMAR FOCUS ──
  function renderGrammarStage() {
    const gf = LX.lesson_A1_001.grammarFocus;
    const errorsSection = gf.sections.find(s => s.type === 'errors');
    const otherSections = gf.sections.filter(s => s.type !== 'errors');

    const sectionsHtml = otherSections.map(s => `
      <div class="grammar-block ${s.type}">
        <div class="grammar-block-title">${s.title}</div>
        <div class="grammar-block-content">${s.content}</div>
      </div>`).join('');

    const errorsHtml = errorsSection ? `
      <div class="grammar-block errors">
        <div class="grammar-block-title">${errorsSection.title}</div>
        ${errorsSection.errors.map(e => `
        <div style="margin-bottom:10px;padding:10px;background:white;border-radius:8px">
          <div style="font-size:13px"><span style="color:var(--red)">✗ ${e.wrong}</span></div>
          <div style="font-size:13px;margin-top:4px"><span style="color:var(--green)">✓ ${e.right}</span></div>
          <div style="font-size:11px;color:var(--grey);margin-top:4px">→ ${e.reason}</div>
        </div>`).join('')}
      </div>` : '';

    const tableRows = gf.verbToBeTable.rows.map(r => `
      <tr>
        <td><strong>${r.subject}</strong></td>
        <td class="positive">${r.positive}</td>
        <td class="negative">${r.negative}</td>
        <td class="question">${r.question}</td>
      </tr>`).join('');

    const bodyHTML = `
    <div class="grammar-section-body">
      <div class="grammar-name-tag">📐 ${gf.grammarName}</div>
      ${sectionsHtml}
      ${errorsHtml}
      <div style="font-size:13px;font-weight:700;color:var(--navy);margin:16px 0 10px">📊 Verb "to be" — Present Tense</div>
      <div class="grammar-table-wrap">
        <table class="grammar-table">
          <thead><tr><th>Subject</th><th>✓ Positive</th><th>✗ Negative</th><th>? Question</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>`;
    return sectionCard('#7C3AED', gf.stage, `${gf.label}: ${gf.tagline}`, bodyHTML, navButtons(2));
  }

  // ── STAGE 3: CORE SENTENCES ──
  function renderCoreSentenceStage() {
    const cs = LX.lesson_A1_001.coreSentences;
    const sentencesHtml = cs.sentences.map(s => {
      const partsHtml = s.breakdown.map(p => `
        <div class="sentence-part part-${p.type}">
          <div class="part-word">${p.word}</div>
          <div class="part-label">${p.role}</div>
        </div>`).join('');
      const breakdownRows = s.breakdown.map(p => `
        <tr>
          <td><strong>${p.word}</strong></td>
          <td>${p.role}</td>
          <td style="font-size:12px;color:var(--grey)">${p.reason}</td>
        </tr>`).join('');
      const wordRows = s.wordTable.map(w => `
        <tr>
          <td><strong>${w.word}</strong><br><span class="vocab-pos">${w.pos}</span></td>
          <td class="vocab-def">${w.definition}</td>
          <td class="vocab-example">${w.example}</td>
        </tr>`).join('');
      return `
      <div style="margin-bottom:28px;padding-bottom:28px;border-bottom:2px solid var(--border)">
        <div class="sentence-model">
          <div class="sentence-model-label">Core Sentence #${s.coreSentenceNum}</div>
          <div class="sentence-model-text">${s.model}</div>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Structure breakdown:</div>
        <div class="sentence-parts">${partsHtml}</div>
        <div class="grammar-table-wrap">
          <table class="grammar-table" style="margin:0">
            <thead><tr><th>Word / Phrase</th><th>Role</th><th>Why this grammar choice?</th></tr></thead>
            <tbody>${breakdownRows}</tbody>
          </table>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 8px">Important words — defined:</div>
        <div class="grammar-table-wrap">
          <table class="grammar-table">
            <thead><tr><th>Word</th><th>Plain-English meaning</th><th>Example sentence</th></tr></thead>
            <tbody>${wordRows}</tbody>
          </table>
        </div>
        ${s.tenseLink ? `<div style="margin-top:12px;padding:12px 16px;background:var(--accent-light);border-radius:8px;font-size:13px;color:var(--navy);border-left:3px solid var(--accent)"><strong>🔗 Tense link:</strong> ${s.tenseLink}</div>` : ''}
      </div>`;
    }).join('');

    const bodyHTML = `<div class="core-sentence-body"><div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${cs.tagline}</div>${sentencesHtml}</div>`;
    return sectionCard('#0D9488', cs.stage, `${cs.label}: ${cs.tagline}`, bodyHTML, navButtons(3));
  }

  // ── STAGE 4: VOCABULARY ──
  function renderVocabStage() {
    const vocab = LX.lesson_A1_001.vocabulary;
    const groupsHtml = Object.entries(vocab.groups).map(([key, group]) => {
      const rows = group.items.map(item => {
        const exWithHighlight = item.example.replace(`{${item.word}}`, `<strong style="color:var(--amber)">${item.word}</strong>`);
        return `<tr>
          <td><span class="vocab-emoji">${item.emoji}</span></td>
          <td><span class="vocab-word">${item.word}</span><span class="vocab-pos">${item.pos}</span></td>
          <td class="vocab-def">${item.def}</td>
          <td class="vocab-example">${exWithHighlight}</td>
        </tr>`;
      }).join('');
      return `
      <div class="vocab-group">
        <div class="vocab-group-title">${group.emoji} ${group.title}</div>
        <div class="grammar-table-wrap">
          <table class="vocab-table">
            <thead><tr><th></th><th>Word</th><th>Meaning</th><th>Example</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    }).join('');

    const bodyHTML = `<div class="vocab-section-body"><div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${vocab.tagline}</div>${groupsHtml}</div>`;
    return sectionCard('#D97706', vocab.stage, `${vocab.label}: ${vocab.tagline}`, bodyHTML, navButtons(4));
  }

  // ── STAGE 4b: USEFUL PHRASES ──
  function renderPhrasesStage() {
    const phrases = LX.lesson_A1_001.usefulSentences;
    const colorMap = {
      statements: 'var(--green)', questions: 'var(--accent)',
      negative: 'var(--red)', polite: 'var(--purple)', expansion: 'var(--teal)',
    };
    const groupsHtml = Object.entries(phrases.groups).map(([key, group]) => {
      const items = group.items.map(item =>
        `<div class="phrase-item">
          <div style="flex:1">
            <div class="phrase-text">${item.phrase}</div>
            <div class="phrase-function">${item.function}</div>
          </div>
        </div>`
      ).join('');
      return `
      <div class="phrase-group">
        <div class="phrase-group-title" style="color:${colorMap[key] || 'var(--grey)'}">
          ${group.function ? `${group.title} — ${group.function}` : group.title}
        </div>
        <div class="phrase-list">${items}</div>
      </div>`;
    }).join('');

    const bodyHTML = `<div class="phrases-body"><div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${phrases.tagline}</div>${groupsHtml}</div>`;
    return sectionCard('#2D7E5E', phrases.stage, `${phrases.label}: ${phrases.tagline}`, bodyHTML, navButtons(5));
  }

  // ── STAGE 5: PRACTICE ──
  function renderPracticeStage() {
    const ex = LX.lesson_A1_001.exercises;
    const allStagesHtml = ex.stages.map((stage, si) => renderExerciseStage(stage, si)).join('');
    const bodyHTML = `<div class="exercise-body"><div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${ex.tagline}</div>${allStagesHtml}</div>`;
    return sectionCard('#DC2626', ex.stage, `${ex.label}: ${ex.tagline}`, bodyHTML, navButtons(6));
  }

  function renderExerciseStage(stage, si) {
    if (stage.id === 'recognition' || stage.id === 'matching') return renderChoiceExercise(stage, si);
    if (stage.id === 'controlled_production') return renderFillExercise(stage, si);
    if (stage.id === 'question_transform') return renderTransformExercise(stage, si);
    return '';
  }

  function _choiceIsDisabled() { return st.isReadOnly; }

  function renderChoiceExercise(stage, si) {
    const stateKey = stage.id === 'recognition' ? 'recognition' : 'matching';
    const savedAnswers = st.exerciseState[stateKey]?.answers || {};
    const savedChecked = st.exerciseState[stateKey]?.checked || false;

    const itemsHtml = stage.items.map((item, i) => {
      const question = item.question || item.sentence;
      const savedChoice = savedAnswers[i];
      const opts = item.options.map(opt => {
        let btnClass = 'choice-btn';
        if (savedChecked && savedChoice !== undefined) {
          if (opt === item.answer) btnClass += ' correct-choice';
          else if (opt === savedChoice && opt !== item.answer) btnClass += ' wrong-choice';
          if (opt === savedChoice) btnClass += ' chosen';
        } else if (opt === savedChoice) {
          btnClass += ' chosen';
        }
        return `<button class="${btnClass}" data-stage="${stage.id}" data-item="${i}" data-opt="${opt}" ${_choiceIsDisabled() ? 'disabled' : ''}>${opt}</button>`;
      }).join('');
      return `
      <div class="exercise-fill" id="ex-${stage.id}-${i}">
        <div class="fill-sentence">${question}</div>
        <div class="choice-buttons">${opts}</div>
        <div class="exercise-feedback ${savedChecked ? 'show ' + (savedChoice === item.answer ? 'correct-fb' : 'incorrect-fb') : ''}" id="fb-${stage.id}-${i}">
          ${savedChecked ? `${savedChoice === item.answer ? '✅ Correct!' : `❌ Incorrect. Answer: "${item.answer}"`} <div class="exercise-explanation">${item.explanation}</div>` : '<span class="fb-icon"></span><span class="fb-text"></span>'}
        </div>
      </div>`;
    }).join('');

    return `
    <div class="exercise-stage">
      <div class="exercise-stage-header">
        <div class="exercise-stage-num">${stage.num}</div>
        <div>
          <div class="exercise-stage-title">${stage.title}</div>
          <div class="exercise-stage-type">${stage.type}</div>
        </div>
      </div>
      <div class="exercise-prompt">${stage.prompt}</div>
      <div class="exercise-items" id="exercise-items-${stage.id}">${itemsHtml}</div>
      ${!_choiceIsDisabled() ? `<button class="btn-check" id="check-${stage.id}" ${savedChecked ? 'disabled' : ''}>
        ${savedChecked ? 'Checked ✓' : 'Check answers'}
      </button>` : ''}
      <div class="exercise-feedback ${savedChecked ? 'show ' + (st.exerciseState[stateKey]?.score >= stage.items.length * 0.7 ? 'correct-fb' : 'incorrect-fb') : ''}" id="summary-${stage.id}">
        ${savedChecked ? `Score: ${st.exerciseState[stateKey]?.score}/${stage.items.length}` : ''}
      </div>
    </div>`;
  }

  function renderFillExercise(stage, si) {
    const savedAnswers = st.exerciseState.controlledProduction?.answers || {};
    const savedChecked = st.exerciseState.controlledProduction?.checked || false;

    const itemsHtml = stage.items.map((item, i) => {
      const savedVal = savedAnswers[i] || '';
      const isRight = savedChecked && savedVal.toLowerCase().includes(item.answer.toLowerCase().split(' ')[0]);
      return `
      <div class="exercise-fill" id="ex-${stage.id}-${i}">
        <div class="fill-sentence" style="margin-bottom:8px">${i + 1}. <em>${item.template}</em></div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <input type="text" class="fill-input" id="fill-${stage.id}-${i}" placeholder="Write your answer..."
            style="border:1.5px solid ${savedChecked ? (isRight ? 'var(--green)' : 'var(--red)') : 'var(--border)'};border-radius:8px;padding:8px 12px;font-family:var(--font);font-size:14px;width:280px;outline:none"
            data-stage="${stage.id}" data-item="${i}" data-answer="${item.answer}"
            value="${esc(savedVal)}" ${_choiceIsDisabled() ? 'readonly' : ''}>
          <span style="font-size:12px;color:var(--grey);font-style:italic">Hint: ${item.hint}</span>
        </div>
        <div class="exercise-feedback ${savedChecked ? 'show ' + (isRight ? 'correct-fb' : 'incorrect-fb') : ''}" id="fb-${stage.id}-${i}">
          ${savedChecked ? `${isRight ? '✅ Good!' : '❌ Incorrect.'} Model answer: <em>${item.answer}</em>` : ''}
        </div>
      </div>`;
    }).join('');
    return `
    <div class="exercise-stage">
      <div class="exercise-stage-header">
        <div class="exercise-stage-num">${stage.num}</div>
        <div>
          <div class="exercise-stage-title">${stage.title}</div>
          <div class="exercise-stage-type">${stage.type}</div>
        </div>
      </div>
      <div class="exercise-prompt">${stage.prompt}</div>
      <div class="exercise-items">${itemsHtml}</div>
      ${!_choiceIsDisabled() ? `<button class="btn-check" id="check-${stage.id}" ${savedChecked ? 'disabled' : ''}>
        ${savedChecked ? 'Checked ✓' : 'Check answers'}
      </button>` : ''}
      <div class="exercise-feedback" id="summary-${stage.id}"></div>
    </div>`;
  }

  function renderTransformExercise(stage, si) {
    const savedAnswers = st.exerciseState.questionTransform?.answers || {};
    const savedChecked = st.exerciseState.questionTransform?.checked || false;

    const itemsHtml = stage.items.map((item, i) => {
      const savedVal = savedAnswers[i] || '';
      const isRight = savedChecked && savedVal.toLowerCase().includes(item.answer.toLowerCase().split(' ')[0]);
      return `
      <div class="exercise-fill" id="ex-${stage.id}-${i}">
        <div style="font-size:14px;color:var(--grey);margin-bottom:6px">${i + 1}. Statement: <strong>${item.statement}</strong></div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;font-weight:600;color:var(--navy)">Question:</span>
          <input type="text" class="fill-input" id="fill-${stage.id}-${i}" placeholder="Write the question..."
            style="border:1.5px solid ${savedChecked ? (isRight ? 'var(--green)' : 'var(--red)') : 'var(--border)'};border-radius:8px;padding:8px 12px;font-family:var(--font);font-size:14px;min-width:260px;outline:none"
            data-stage="${stage.id}" data-item="${i}" data-answer="${item.answer}"
            value="${esc(savedVal)}" ${_choiceIsDisabled() ? 'readonly' : ''}>
        </div>
        <div style="font-size:12px;color:var(--grey);margin-top:4px;font-style:italic">Hint: ${item.hint}</div>
        <div class="exercise-feedback ${savedChecked ? 'show ' + (isRight ? 'correct-fb' : 'incorrect-fb') : ''}" id="fb-${stage.id}-${i}">
          ${savedChecked ? `${isRight ? '✅ Good!' : '❌ Incorrect.'} Model answer: <em>${item.answer}</em>` : ''}
        </div>
      </div>`;
    }).join('');
    return `
    <div class="exercise-stage">
      <div class="exercise-stage-header">
        <div class="exercise-stage-num">${stage.num}</div>
        <div>
          <div class="exercise-stage-title">${stage.title}</div>
          <div class="exercise-stage-type">${stage.type}</div>
        </div>
      </div>
      <div class="exercise-prompt">${stage.prompt}</div>
      <div class="exercise-items">${itemsHtml}</div>
      ${!_choiceIsDisabled() ? `<button class="btn-check" id="check-${stage.id}" ${savedChecked ? 'disabled' : ''}>
        ${savedChecked ? 'Checked ✓' : 'Check answers'}
      </button>` : ''}
      <div class="exercise-feedback" id="summary-${stage.id}"></div>
    </div>`;
  }

  // ── STAGE 5b: GUIDED DIALOGUE ──
  function renderDialogueStage() {
    const gd = LX.lesson_A1_001.guidedDialogue;
    const ds = st.dialogueState;
    const readOnly = st.isReadOnly;

    const turnsToShow = gd.dialogue.slice(0, Math.max(1, ds.currentTurn + 1));
    const turnsHtml = turnsToShow.map((turn, i) => {
      const isStudent = turn.speaker === 'student';
      if (turn.text) {
        return `
        <div class="dialogue-turn ${isStudent ? 'student' : ''}">
          <div class="dialogue-avatar ${isStudent ? 'avatar-student' : 'avatar-partner'}">${isStudent ? 'You' : 'P'}</div>
          <div>
            <div class="dialogue-speaker">${isStudent ? 'You (Lost Property Officer)' : 'Passenger'}</div>
            <div class="dialogue-bubble ${isStudent ? 'bubble-student' : 'bubble-partner'}">${turn.text}</div>
          </div>
        </div>`;
      }
      const chosen = ds.choices[i];
      if (chosen !== undefined) {
        return `
        <div class="dialogue-turn student">
          <div class="dialogue-avatar avatar-student">You</div>
          <div>
            <div class="dialogue-speaker">You (Lost Property Officer)</div>
            <div class="dialogue-bubble bubble-student">${chosen}</div>
          </div>
        </div>`;
      }
      if (!readOnly && i === ds.currentTurn) {
        const opts = turn.options.map((opt, oi) =>
          `<button class="response-option" data-turn="${i}" data-opt="${oi}">${opt}</button>`
        ).join('');
        return `
        <div style="padding:12px;background:var(--accent-light);border-radius:var(--radius-md);border:1.5px solid var(--accent)">
          <div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px">YOUR TURN — ${turn.prompt}</div>
          <div class="response-options">${opts}</div>
          <div id="dialogue-feedback-${i}" class="exercise-feedback" style="margin-top:8px"></div>
        </div>`;
      }
      return '';
    }).join('');

    const checklistHtml = gd.successChecklist.map(item =>
      `<div class="checklist-item"><span class="checklist-check">${ds.completed ? '✅' : '○'}</span>${item}</div>`
    ).join('');

    const bodyHTML = `
    <div class="scenario-body">
      <div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${gd.tagline}</div>
      <div class="scenario-header">
        <div class="scenario-setting-label">📍 Setting</div>
        <div class="scenario-setting-name">${gd.setting}</div>
      </div>
      <div class="scenario-roles">
        <div class="scenario-role-card">
          <div class="scenario-role-label">Your Role</div>
          <div class="scenario-role-title">🧑‍💼 ${gd.studentRole}</div>
        </div>
        <div class="scenario-role-card">
          <div class="scenario-role-label">Partner Role</div>
          <div class="scenario-role-title">🧳 ${gd.partnerRole}</div>
        </div>
      </div>
      <div class="scenario-info-blocks">
        <div class="scenario-info-block goal">
          <div class="scenario-info-label">🎯 Goal</div>
          <div class="scenario-info-text">${gd.goal}</div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:12px">💬 Dialogue:</div>
      <div class="dialogue-area" id="dialogue-area">${turnsHtml}</div>
      ${ds.completed ? `
      <div style="margin-bottom:16px;padding:14px 16px;background:var(--green-light);border-radius:var(--radius-sm);border:1px solid var(--green);font-size:14px;font-weight:600;color:var(--green)">
        ✅ Dialogue complete! Well done.
      </div>` : ''}
      <div class="checklist">
        <div class="checklist-title">✓ Success Checklist</div>
        ${checklistHtml}
      </div>
    </div>`;
    return sectionCard('#0369A1', gd.stage, `${gd.label}: ${gd.tagline}`, bodyHTML, navButtons(7));
  }

  // ── STAGE 5c: INFORMATION GAP ──
  function renderInfoGapStage() {
    const ig = LX.lesson_A1_001.informationGap;
    const igs = st.infoGapState;
    const readOnly = st.isReadOnly;

    const objectsHtml = ig.studentHas.map((item, i) => `
      <div style="background:var(--white);border-radius:var(--radius-sm);padding:14px;border:1.5px solid var(--border);text-align:center">
        <div style="font-size:36px;margin-bottom:8px">${item.emoji}</div>
        <div style="font-size:14px;font-weight:700;color:var(--navy)">${item.object}</div>
        <div style="font-size:12px;color:var(--grey)">${item.description}</div>
        <div style="margin-top:10px">
          <input type="text" class="transfer-item-input" id="ig-${i}" placeholder="Owner: ___"
            data-item="${i}" data-object="${item.object}"
            style="text-align:center;font-size:13px"
            value="${esc(igs.answers[i] || '')}" ${readOnly ? 'readonly' : ''}>
        </div>
        ${igs.completed && ig.answerKey[i] ? `<div style="font-size:12px;color:var(--green);margin-top:6px;font-weight:600">→ ${ig.answerKey[i].sentence}</div>` : ''}
      </div>`).join('');

    const partnerInfoHtml = igs.completed ? ig.partnerHas.map(p =>
      `<div style="font-size:13px;padding:8px 12px;background:var(--grey-bg);border-radius:8px;margin-bottom:6px">
        <strong>${p.object}</strong> → <em>${p.owner}</em>
      </div>`
    ).join('') : `<div style="padding:20px;text-align:center;color:var(--grey);font-style:italic">Your partner has this information. Ask questions to find out!</div>`;

    const bodyHTML = `
    <div class="scenario-body">
      <div style="font-size:13px;color:var(--grey);margin-bottom:16px;font-style:italic">${ig.instructions}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">👜 You can see: (Objects)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${objectsHtml}</div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">🏷️ Partner knows: (Owners)</div>
          <div style="background:var(--grey-bg);border-radius:var(--radius-md);padding:16px;border:1.5px dashed var(--border)">
            ${partnerInfoHtml}
          </div>
        </div>
      </div>
      <div style="margin-bottom:14px;padding:12px 16px;background:var(--accent-light);border-radius:8px;font-size:13px;color:var(--accent);font-weight:600">
        💡 Ask: "Is this John's bag?" / "Are these the teacher's keys?" / "Who does this belong to?"
      </div>
      ${!igs.completed && !readOnly ? `<button class="btn-start" id="check-infogap-btn">Check my answers →</button>` : `
      <div style="padding:14px 16px;background:var(--green-light);border-radius:8px;font-size:14px;font-weight:600;color:var(--green);border:1px solid var(--green)">
        ✅ Information gap complete! All items matched correctly.
      </div>`}
    </div>`;
    return sectionCard('#0369A1', ig.stage || 'Stage 05c', `${ig.label}: ${ig.tagline}`, bodyHTML, navButtons(8));
  }

  // ── STAGE 6: TRANSFER ──
  function renderTransferStage() {
    const tc = LX.lesson_A1_001.transferChallenge;
    const ts = st.transferState;
    const scenario = tc.scenarios[ts.selectedScenario];
    const readOnly = st.isReadOnly;

    const selectorHtml = tc.scenarios.map((s, i) =>
      `<button class="transfer-option-btn${ts.selectedScenario === i ? ' active' : ''}" data-scenario="${i}" ${readOnly ? 'disabled' : ''}>
        ${i === 0 ? '🏨' : i === 1 ? '📚' : i === 2 ? '🛍️' : '✈️'} ${s.title}
      </button>`
    ).join('');

    const itemsHtml = scenario.lostItems.map((item, i) => `
      <div class="transfer-item">
        <div class="transfer-item-label">${item.emoji} Object ${i + 1}</div>
        <div class="transfer-item-desc"><strong>${item.object}</strong> — ${item.description}</div>
        <input type="text" class="transfer-item-input" id="tr-${i}" placeholder="Write your sentence about this object..."
          data-item="${i}" value="${esc(ts.responses[i] || '')}" ${readOnly ? 'readonly' : ''}>
      </div>`).join('');

    const targetLangHtml = scenario.targetLanguage.map(t =>
      `<span style="padding:6px 12px;background:var(--red-light);border-radius:20px;font-size:13px;font-weight:600;color:var(--col-transfer)">${t}</span>`
    ).join('');

    const criteriaHtml = scenario.successCriteria.map(c =>
      `<div class="checklist-item"><span class="checklist-check">${ts.submitted ? '✅' : '○'}</span>${c}</div>`
    ).join('');

    const feedbackHtml = ts.submitted ? `
    <div style="margin-top:16px;padding:16px;background:var(--green-light);border-radius:var(--radius-md);border:1px solid var(--green)">
      <div style="font-size:14px;font-weight:700;color:var(--green);margin-bottom:8px">✅ Transfer challenge submitted!</div>
      <div style="font-size:13px;color:var(--navy)">Your responses have been recorded. Proceed to see your feedback and rubric score.</div>
    </div>` : '';

    const bodyHTML = `
    <div class="transfer-body">
      <div style="font-size:13px;color:var(--grey);margin-bottom:16px;font-style:italic">${tc.intro}</div>
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Choose your scenario:</div>
        <div class="transfer-selector">${selectorHtml}</div>
      </div>
      <div class="transfer-header">
        <div class="transfer-scenario-tag">${tc.stage} · New Situation · Curated Scenario Bank</div>
        <div class="transfer-setting">📍 ${scenario.setting}</div>
      </div>
      <div class="scenario-roles" style="margin-bottom:16px">
        <div class="scenario-role-card">
          <div class="scenario-role-label">Your Role</div>
          <div class="scenario-role-title">${scenario.studentRole}</div>
        </div>
        <div class="scenario-role-card">
          <div class="scenario-role-label">Their Role</div>
          <div class="scenario-role-title">${scenario.partnerRole}</div>
        </div>
      </div>
      <div class="scenario-info-blocks">
        <div class="scenario-info-block gap">
          <div class="scenario-info-label">🔍 Your Task</div>
          <div class="scenario-info-text">${scenario.newGap}</div>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--col-transfer);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">🎯 Target language — use these patterns:</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${targetLangHtml}</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:12px">✍️ Describe each object and say who it belongs to:</div>
      <div class="transfer-items">${itemsHtml}</div>
      <div style="margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">🗣️ Write your response to the guest/customer:</div>
        <textarea class="response-text-area" id="transfer-dialogue" placeholder="Write a short dialogue (4-6 lines) using the target language. Start with a greeting." rows="5" ${readOnly ? 'readonly' : ''}>${esc(ts.responses['dialogue'] || '')}</textarea>
      </div>
      <div class="checklist" style="margin-bottom:16px">
        <div class="checklist-title">✓ Success Checklist</div>
        ${criteriaHtml}
      </div>
      ${!ts.submitted && !readOnly ? `<button class="btn-start" id="submit-transfer-btn" style="background:var(--col-transfer)">Submit Transfer Challenge →</button>` : ''}
      ${feedbackHtml}
    </div>`;
    return sectionCard('#BE123C', tc.stage, `${tc.label}: ${tc.tagline}`, bodyHTML, navButtons(9));
  }

  // ── STAGE: FEEDBACK ──
  function renderFeedbackStage() {
    const score = LX.autoScoreRubric();
    const band = LX.getScoreBand(score);
    const dims = LX.lesson_A1_001.rubric.dimensions;

    const dimsHtml = dims.map(dim => {
      const dimScore = st.rubricScores[dim.id] || 0;
      const dots = [0, 1, 2].map(d =>
        `<div class="rubric-dot${d < dimScore ? ' filled' : ''}"></div>`
      ).join('');
      return `
      <div class="rubric-dim">
        <div class="rubric-dim-label">${dim.label}</div>
        <div class="rubric-dim-score">${dots}</div>
        <div class="rubric-dim-value">${dimScore}/${dim.max}</div>
      </div>`;
    }).join('');

    const statusClass = score >= 14 ? 'independent' : score >= 11 ? 'functional' : score >= 6 ? 'emerging' : '';

    // Attempt saved panel
    const attempt = st.currentAttemptId ? P.getAttempt(st.currentAttemptId) : null;
    const tc = LX.lesson_A1_001.transferChallenge;
    const scenarioTitle = tc.scenarios[st.transferState.selectedScenario]?.title || '—';
    const attemptSavedPanel = !st.isReadOnly && attempt ? `
    <div style="margin-bottom:20px;padding:16px;background:var(--navy);border-radius:var(--radius-md);color:white">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">📋 Attempt ${attempt.attempt_number} — Progress saved</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;opacity:0.9">
        <div>Started: ${P.formatDateTime(attempt.started_at)}</div>
        <div>Saved: ${P.formatDateTime(attempt.last_saved_at)}</div>
        <div>Transfer scenario: ${scenarioTitle}</div>
        <div>Score so far: ${score}/16 — ${band.label}</div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-outline-sm" id="view-attempts-btn" style="color:white;border-color:rgba(255,255,255,0.4)">View all attempts</button>
        <button class="btn-outline-sm" id="finish-lesson-from-feedback-btn" style="color:white;border-color:rgba(255,255,255,0.4)">Finish &amp; save attempt →</button>
      </div>
    </div>` : '';

    const bodyHTML = `
    <div class="feedback-body">
      ${attemptSavedPanel}
      <div class="rubric-score-hero">
        <div class="rubric-score-label">Your Score</div>
        <div><span class="rubric-score-num">${score}</span><span class="rubric-score-max"> / 16</span></div>
        <div class="rubric-score-status ${statusClass}">${band.label}</div>
      </div>
      <div style="margin-bottom:20px;padding:14px 16px;background:var(--grey-bg);border-radius:var(--radius-md);border-left:4px solid ${band.color}">
        <div style="font-size:13px;font-weight:700;color:${band.color};margin-bottom:6px">${band.label} — What this means:</div>
        <div style="font-size:14px;color:var(--navy)">${band.desc}</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">📊 Rubric Breakdown:</div>
      <div class="rubric-dimensions">${dimsHtml}</div>
      <div class="feedback-text-block">
        <div class="feedback-text-title">💬 Feedback</div>
        <div class="feedback-text">
          ${score >= 14
            ? "Excellent work! You used is/are consistently and correctly, formed questions naturally, and completed the transfer challenge in a new context. You are ready to advance. Your review is scheduled."
            : score >= 11
            ? "Good progress! Your grammar is mostly accurate. Focus on forming questions more naturally and using isn't/aren't in context. Try the expansion scenario again."
            : score >= 6
            ? "You are on your way! Review the grammar focus section and try the guided dialogue again. Pay attention to is (singular) vs are (plural)."
            : "Let's start again together. Go back to the Grammar Focus section. Look at the verb-to-be table. Try the recognition exercises again before the dialogue."}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="padding:14px;background:var(--green-light);border-radius:var(--radius-md);border:1px solid var(--green)">
          <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:8px">✅ What you did well:</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.6">• Attempted all exercise stages<br>• Completed the guided dialogue<br>• Worked through the transfer scenario</div>
        </div>
        <div style="padding:14px;background:var(--amber-light);border-radius:var(--radius-md);border:1px solid var(--amber)">
          <div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:8px">🎯 Focus next time:</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.6">• Check is/are agreement with subject number<br>• Invert is/are to form questions<br>• Use 's correctly for possession</div>
        </div>
      </div>
      <div style="margin-top:20px;padding:14px 16px;background:var(--navy);border-radius:var(--radius-md);color:white">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">📋 What to remember:</div>
        ${LX.lesson_A1_001.whatToRemember.map(r =>
          `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13px">
            <span>${r.emoji}</span><span>${r.rule}</span>
          </div>`).join('')}
      </div>
    </div>`;
    return sectionCard('#475569', 'Results', 'Feedback & Rubric Score', bodyHTML, navButtons(10));
  }

  // ── STAGE: REVIEW PLAN ──
  function renderReviewStage() {
    const rp = LX.lesson_A1_001.reviewPlan;
    if (!st.reviewSchedule && !st.isReadOnly) {
      LX.markStageComplete('review');
    }

    // Use persisted review events if available
    let reviewEvents;
    if (st.isReadOnly && st.readOnlyAttemptId) {
      reviewEvents = P.getReviewEvents(st.readOnlyAttemptId);
    } else if (st.currentAttemptId) {
      reviewEvents = P.getReviewEvents(st.currentAttemptId);
    } else {
      reviewEvents = [];
    }

    const eventsHtml = (reviewEvents.length > 0 ? reviewEvents : rp.events).map((event, i) => {
      if (event.review_type) {
        // Persisted event
        return `
        <div class="review-event">
          <div class="review-event-time">${['⚡', '📝', '🎯', '💬', '🚀', '🔄'][i] || '📅'} ${_reviewTimingLabel(event.review_type)}</div>
          <div class="review-event-title">${_reviewTypeLabel(event.review_type)}</div>
          <div class="review-event-desc">${event.prompt_snapshot_json?.prompt || ''}</div>
          <span class="review-event-tag" style="background:${event.status === 'AVAILABLE' ? 'var(--green-light)' : event.status === 'COMPLETED' ? 'var(--grey-bg)' : 'var(--accent-light)'};color:${event.status === 'AVAILABLE' ? 'var(--green)' : event.status === 'COMPLETED' ? 'var(--grey)' : 'var(--accent)'}">
            ${event.status === 'AVAILABLE' ? '⚡ Available now' : event.status === 'COMPLETED' ? '✓ Done' : 'Scheduled: ' + P.formatDate(event.scheduled_for)}
          </span>
        </div>`;
      } else {
        // Fallback to curriculum data format
        return `
        <div class="review-event">
          <div class="review-event-time">${event.icon} ${event.timing}</div>
          <div class="review-event-title">${event.label}</div>
          <div class="review-event-desc">${event.desc}</div>
          <span class="review-event-tag" style="background:var(--accent-light);color:var(--accent)">Scheduled</span>
        </div>`;
      }
    }).join('');

    const attempt = st.isReadOnly && st.readOnlyAttemptId
      ? P.getAttempt(st.readOnlyAttemptId)
      : (st.currentAttemptId ? P.getAttempt(st.currentAttemptId) : null);

    const completedPanel = attempt && attempt.status === 'COMPLETED' ? `
    <div style="margin-bottom:20px;padding:16px;background:var(--green-light);border-radius:var(--radius-md);border:1px solid var(--green)">
      <div style="font-size:14px;font-weight:700;color:var(--green);margin-bottom:6px">🎉 Attempt ${attempt.attempt_number} — Complete!</div>
      <div style="font-size:13px;color:var(--navy);margin-bottom:8px">
        Score: ${attempt.total_score !== null ? attempt.total_score + '/16' : '—'} · 
        Result: <strong>${P.getResultBandLabel(attempt.result_band)}</strong> · 
        Duration: ${P.formatDuration(attempt.active_duration_seconds || attempt.duration_seconds)}
      </div>
      <div style="font-size:13px;color:var(--navy)">Your review schedule has been created. Completing all reviews moves you from <em>functional</em> to <em>independent</em> mastery.</div>
    </div>` : `
    <div style="margin-bottom:20px;padding:16px;background:var(--green-light);border-radius:var(--radius-md);border:1px solid var(--green)">
      <div style="font-size:14px;font-weight:700;color:var(--green);margin-bottom:6px">🎉 Lesson Complete!</div>
      <div style="font-size:13px;color:var(--navy)">Your review schedule has been set. Completing all reviews is what moves you from <em>functional</em> to <em>independent</em> mastery.</div>
    </div>`;

    const bodyHTML = `
    <div class="review-body">
      <div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${rp.tagline}</div>
      ${completedPanel}
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px">Your Review Timeline:</div>
      <div class="review-timeline">${eventsHtml}</div>
      <div style="margin-top:24px;padding:16px;background:var(--navy);border-radius:var(--radius-md);color:white">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px">⭐ Final "What to remember"</div>
        ${LX.lesson_A1_001.whatToRemember.map(r =>
          `<div style="display:flex;gap:8px;margin-bottom:8px;font-size:13px"><span>${r.emoji}</span><span>${r.rule}</span></div>`
        ).join('')}
      </div>
      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <button class="btn-primary" id="back-dashboard-btn" style="padding:14px 32px;border-radius:var(--radius-md);border:none;font-size:15px;font-weight:700;background:var(--accent);color:white;cursor:pointer">
          ← Back to Dashboard
        </button>
        ${!st.isReadOnly ? `<button class="btn-outline-sm" id="view-attempts-btn" style="padding:14px 20px">📋 View lesson history</button>` : ''}
      </div>
    </div>`;
    return sectionCard('#475569', rp.stage, `${rp.label}: ${rp.tagline}`, bodyHTML, navButtons(11));
  }

  function _reviewTimingLabel(type) {
    return {
      END_OF_LESSON_ORAL_RECAP: 'End of lesson',
      SAME_DAY_RECOGNITION: 'Same day',
      NEXT_LESSON_GUIDED_SCENARIO: 'Next lesson',
      THREE_DAY_DIALOGUE: '3 days',
      SEVEN_DAY_INDEPENDENT_TRANSFER: '7 days',
      MIXED_REVIEW: '2–4 weeks',
    }[type] || '';
  }

  // ══════════════════════════════════════════════
  // ── ATTEMPTS PAGE ──
  // ══════════════════════════════════════════════
  function renderAttemptsPage() {
    const allAttempts = P.getAllAttempts(); // newest first
    const completedAttempts = allAttempts.filter(a => a.status === 'COMPLETED');

    const div = el('div');
    div.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Lesson History</div>
      <div class="dashboard-title">My Attempts 📋</div>
    </div>`;

    if (allAttempts.length === 0) {
      div.innerHTML += `<div style="text-align:center;padding:60px 20px;color:var(--grey)">
        <div style="font-size:48px;margin-bottom:16px">📋</div>
        <div style="font-size:16px;font-weight:600">No attempts yet</div>
        <div style="font-size:14px;margin-top:8px">Start a lesson to see your history here.</div>
      </div>`;
      return div;
    }

    // Action bar
    const actionBar = el('div', '', `
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn-start" id="new-attempt-btn-history">⊕ Start New Attempt</button>
      ${completedAttempts.length >= 2 ? `<button class="btn-outline-sm" id="compare-attempts-btn-page">📊 Compare Attempts</button>` : ''}
    </div>`);
    div.appendChild(actionBar);

    // Attempts table
    const tableWrap = el('div', 'grammar-table-wrap');
    tableWrap.style.overflowX = 'auto';

    const rows = allAttempts.map(attempt => {
      const scenarioTitle = attempt.attempt_summary_json?.transferScenarioTitle || '—';
      const statusBadge = attempt.status === 'COMPLETED'
        ? `<span style="color:var(--green);font-weight:700">✓ Completed</span>`
        : attempt.status === 'IN_PROGRESS'
        ? `<span style="color:var(--accent);font-weight:700">▶ In progress</span>`
        : `<span style="color:var(--grey)">${attempt.status}</span>`;

      const resultBandBadge = attempt.result_band
        ? `<span style="font-size:12px;padding:2px 8px;border-radius:20px;background:${P.getResultBandColor(attempt.result_band)}22;color:${P.getResultBandColor(attempt.result_band)};font-weight:600">${P.getResultBandLabel(attempt.result_band)}</span>`
        : '—';

      const durationStr = attempt.status === 'COMPLETED'
        ? P.formatDuration(attempt.active_duration_seconds || attempt.duration_seconds)
        : P.formatDuration(attempt.active_duration_seconds);

      const action = attempt.status === 'COMPLETED'
        ? `<button class="btn-outline-sm view-attempt-btn" data-attempt-id="${attempt.id}">View</button>`
        : `<button class="btn-continue resume-attempt-btn" data-attempt-id="${attempt.id}" style="font-size:12px;padding:6px 14px">Resume</button>`;

      return `<tr>
        <td style="font-weight:700">Attempt ${attempt.attempt_number}</td>
        <td>${statusBadge}</td>
        <td style="font-size:12px">${P.formatDateTime(attempt.started_at)}</td>
        <td style="font-size:12px">${attempt.completed_at ? P.formatDateTime(attempt.completed_at) : '—'}</td>
        <td style="font-size:12px">${durationStr}</td>
        <td>${attempt.total_score !== null ? `<strong>${attempt.total_score}/16</strong>` : '—'}</td>
        <td>${resultBandBadge}</td>
        <td style="font-size:12px;max-width:120px">${scenarioTitle}</td>
        <td>${action}</td>
      </tr>`;
    }).join('');

    tableWrap.innerHTML = `
    <table class="grammar-table" style="min-width:900px">
      <thead>
        <tr>
          <th>Attempt</th>
          <th>Status</th>
          <th>Started</th>
          <th>Completed</th>
          <th>Duration</th>
          <th>Score</th>
          <th>Result</th>
          <th>Scenario</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
    div.appendChild(tableWrap);

    return div;
  }

  // ══════════════════════════════════════════════
  // ── ATTEMPT DETAIL (READ-ONLY HISTORICAL VIEW) ──
  // ══════════════════════════════════════════════
  function renderAttemptDetailPage() {
    const attemptId = st.readOnlyAttemptId;
    const attempt = P.getAttempt(attemptId);

    if (!attempt) {
      return el('div', '', '<div style="padding:40px;text-align:center;color:var(--grey)">Attempt not found.</div>');
    }

    const stageAttempts = P.getStageAttempts(attemptId);
    const { instances: scenarioInstances, attempts: scenarioAttempts } = P.getScenarioData(attemptId);
    const reviewEvents = P.getReviewEvents(attemptId);
    const attemptEvents = P.getAttemptEvents(attemptId);
    const bandColor = P.getResultBandColor(attempt.result_band);
    const bandLabel = P.getResultBandLabel(attempt.result_band);

    const tc = LX.lesson_A1_001.transferChallenge;
    const transferSA = scenarioAttempts.find(sa => {
      const inst = scenarioInstances.find(si => si.id === sa.scenario_instance_id);
      return inst?.scenario_stage === 'TRANSFER';
    });
    const transferInstance = transferSA
      ? scenarioInstances.find(si => si.id === transferSA.scenario_instance_id)
      : null;

    const dialogueSA = scenarioAttempts.find(sa => {
      const inst = scenarioInstances.find(si => si.id === sa.scenario_instance_id);
      return inst?.scenario_stage === 'GUIDED_DIALOGUE';
    });

    const practiceStage = stageAttempts['practice']?.response_data_json;
    const infoGapStage = stageAttempts['infogap']?.response_data_json;

    const div = el('div');
    div.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div>
        <div class="dashboard-greeting">Lesson History</div>
        <div class="dashboard-title" style="font-size:20px">Attempt ${attempt.attempt_number} — Read-only historical record</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:10px">
        <button class="btn-outline-sm" id="back-to-attempts-btn">← Lesson History</button>
        ${P.getAllAttempts().filter(a => a.status === 'COMPLETED').length >= 2
          ? `<button class="btn-outline-sm" id="compare-from-detail-btn" data-attempt-id="${attempt.id}">📊 Compare</button>` : ''}
      </div>
    </div>`;

    // Attempt summary card
    const summaryCard = el('div', 'section-card');
    summaryCard.innerHTML = `
    <div style="padding:20px;background:var(--grey-bg);border-radius:var(--radius-md);border:1px solid var(--border)">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">ATTEMPT</div><div style="font-size:16px;font-weight:700;color:var(--navy)">Attempt ${attempt.attempt_number}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">STATUS</div><div style="font-size:14px;font-weight:700;color:var(--green)">✓ ${attempt.status}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">STARTED</div><div style="font-size:13px">${P.formatDateTime(attempt.started_at)}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">COMPLETED</div><div style="font-size:13px">${P.formatDateTime(attempt.completed_at)}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">ACTIVE TIME</div><div style="font-size:13px">${P.formatDuration(attempt.active_duration_seconds)}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">ELAPSED</div><div style="font-size:13px">${P.formatDuration(attempt.duration_seconds)}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">SCORE</div><div style="font-size:20px;font-weight:800;color:var(--navy)">${attempt.total_score !== null ? attempt.total_score + '/16' : '—'}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">RESULT</div><div style="font-size:16px;font-weight:800;color:${bandColor}">${bandLabel}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:3px">LESSON VERSION</div><div style="font-size:12px;color:var(--grey)">${attempt.lesson_version_id}</div></div>
      </div>
    </div>`;
    div.appendChild(summaryCard);

    // Rubric breakdown
    if (attempt.attempt_summary_json?.rubricScores) {
      const rubricCard = el('div', 'section-card', `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px">📊 Rubric Breakdown</div>
        <div class="rubric-dimensions">
          ${LX.lesson_A1_001.rubric.dimensions.map(dim => {
            const score = attempt.attempt_summary_json.rubricScores[dim.id] || 0;
            const dots = [0,1,2].map(d => `<div class="rubric-dot${d < score ? ' filled' : ''}"></div>`).join('');
            return `<div class="rubric-dim">
              <div class="rubric-dim-label">${dim.label}</div>
              <div class="rubric-dim-score">${dots}</div>
              <div class="rubric-dim-value">${score}/${dim.max}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`);
      div.appendChild(rubricCard);
    }

    // Exercise responses
    if (practiceStage) {
      const exCard = el('div', 'section-card');
      exCard.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px">✏️ Practice Stage Responses</div>
        ${['recognition', 'matching', 'controlledProduction', 'questionTransform'].map(key => {
          const data = practiceStage[key];
          if (!data || !data.checked) return '';
          return `<div style="margin-bottom:12px;padding:12px;background:var(--grey-bg);border-radius:8px">
            <div style="font-size:12px;font-weight:700;color:var(--grey);margin-bottom:4px">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
            <div style="font-size:13px">Score: <strong>${data.score}/${data.total}</strong> · ${Math.round((data.score/data.total)*100)||0}%</div>
          </div>`;
        }).join('')}
      </div>`;
      div.appendChild(exCard);
    }

    // Dialogue evidence
    if (dialogueSA) {
      const choices = dialogueSA.response_data_json?.choices || [];
      const dialogueCard = el('div', 'section-card');
      dialogueCard.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px">🗣️ Guided Dialogue Evidence</div>
        ${choices.length > 0
          ? choices.filter(Boolean).map((c, i) =>
              `<div style="padding:8px 12px;background:var(--accent-light);border-radius:8px;margin-bottom:6px;font-size:13px;border-left:3px solid var(--accent)">
                Turn ${i+1}: <em>"${esc(c)}"</em>
              </div>`).join('')
          : '<div style="color:var(--grey);font-size:13px;font-style:italic">No dialogue choices recorded.</div>'
        }
      </div>`;
      div.appendChild(dialogueCard);
    }

    // Info gap evidence
    if (infoGapStage?.answers && Object.keys(infoGapStage.answers).length > 0) {
      const igCard = el('div', 'section-card');
      const ig = LX.lesson_A1_001.informationGap;
      igCard.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px">🔍 Information Gap Evidence</div>
        ${ig.studentHas.map((item, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid var(--border)">
            <span style="font-size:20px">${item.emoji}</span>
            <span style="font-size:13px;font-weight:600">${item.object}</span>
            <span style="font-size:13px;color:var(--accent)">→</span>
            <span style="font-size:13px">${esc(infoGapStage.answers[i] || '—')}</span>
          </div>`).join('')}
      </div>`;
      div.appendChild(igCard);
    }

    // Transfer scenario snapshot + responses
    if (transferInstance) {
      const snap = transferInstance.content_snapshot_json || {};
      const responses = transferSA?.response_data_json || {};
      const transferCard = el('div', 'section-card');
      transferCard.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:4px">🚀 Transfer Scenario — Snapshot</div>
        <div style="font-size:11px;color:var(--grey);margin-bottom:14px">Content source: ${transferInstance.content_source} · This is the exact scenario content the learner saw.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="padding:12px;background:var(--grey-bg);border-radius:8px"><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:4px">SCENARIO</div><div style="font-size:14px;font-weight:600">${esc(snap.title || '—')}</div></div>
          <div style="padding:12px;background:var(--grey-bg);border-radius:8px"><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:4px">SETTING</div><div style="font-size:13px">${esc(snap.setting || '—')}</div></div>
          <div style="padding:12px;background:var(--grey-bg);border-radius:8px"><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:4px">YOUR ROLE</div><div style="font-size:13px">${esc(snap.studentRole || '—')}</div></div>
          <div style="padding:12px;background:var(--grey-bg);border-radius:8px"><div style="font-size:11px;font-weight:700;color:var(--grey);margin-bottom:4px">PARTNER ROLE</div><div style="font-size:13px">${esc(snap.partnerRole || '—')}</div></div>
        </div>
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Learner's Object Descriptions:</div>
        ${(snap.lostItems || []).map((item, i) => `
          <div style="padding:8px 12px;background:var(--accent-light);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--accent)">
            <div style="font-size:12px;font-weight:700;color:var(--grey)">${item.emoji} ${item.object}</div>
            <div style="font-size:13px;margin-top:4px">${esc(responses[i] || '—')}</div>
          </div>`).join('')}
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin:12px 0 8px">Dialogue response:</div>
        <div style="padding:12px;background:var(--grey-bg);border-radius:8px;font-size:13px;white-space:pre-wrap">${esc(responses['dialogue'] || '—')}</div>
        ${transferSA?.score !== null && transferSA?.score !== undefined ? `
          <div style="margin-top:12px;font-size:13px;color:var(--green);font-weight:600">Score: ${transferSA.score}/16</div>` : ''}
      </div>`;
      div.appendChild(transferCard);
    }

    // Review events linked to this attempt
    if (reviewEvents.length > 0) {
      const reviewCard = el('div', 'section-card');
      reviewCard.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px">📅 Review Events for This Attempt</div>
        ${reviewEvents.map((ev, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:18px">${['⚡','📝','🎯','💬','🚀','🔄'][i] || '📅'}</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${_reviewTypeLabel(ev.review_type)}</div>
              <div style="font-size:11px;color:var(--grey)">Due: ${P.formatDateTime(ev.scheduled_for)}</div>
            </div>
            <span style="font-size:11px;padding:3px 8px;border-radius:20px;background:${ev.status === 'COMPLETED' ? 'var(--green-light)' : ev.status === 'AVAILABLE' ? 'var(--amber-light)' : 'var(--accent-light)'};color:${ev.status === 'COMPLETED' ? 'var(--green)' : ev.status === 'AVAILABLE' ? 'var(--amber)' : 'var(--accent)'}">
              ${ev.status}
            </span>
          </div>`).join('')}
      </div>`;
      div.appendChild(reviewCard);
    }

    return div;
  }

  // ══════════════════════════════════════════════
  // ── ATTEMPT COMPARISON ──
  // ══════════════════════════════════════════════
  function renderAttemptComparePage() {
    const completedAttempts = P.getAllAttempts().filter(a => a.status === 'COMPLETED');
    const [idA, idB] = st.compareAttemptIds;
    const atA = idA ? P.getAttempt(idA) : completedAttempts[completedAttempts.length - 1];
    const atB = idB ? P.getAttempt(idB) : completedAttempts[0];

    const div = el('div');
    div.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Lesson History</div>
      <div class="dashboard-title">Compare Attempts 📊</div>
    </div>`;

    if (completedAttempts.length < 2) {
      div.innerHTML += `<div style="text-align:center;padding:60px;color:var(--grey)">
        <div style="font-size:48px;margin-bottom:16px">📊</div>
        <div style="font-size:16px;font-weight:600">Complete at least two attempts to compare</div>
      </div>`;
      return div;
    }

    // Attempt selectors
    const selectorHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--grey);margin-bottom:6px">ATTEMPT A</div>
        <select class="compare-select" id="compare-select-a" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:var(--font);font-size:13px">
          ${completedAttempts.map(a => `<option value="${a.id}" ${a.id === atA?.id ? 'selected' : ''}>Attempt ${a.attempt_number} — ${P.formatDate(a.completed_at)} — ${a.total_score}/16</option>`).join('')}
        </select>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--grey);margin-bottom:6px">ATTEMPT B</div>
        <select class="compare-select" id="compare-select-b" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:var(--font);font-size:13px">
          ${completedAttempts.map(a => `<option value="${a.id}" ${a.id === atB?.id ? 'selected' : ''}>Attempt ${a.attempt_number} — ${P.formatDate(a.completed_at)} — ${a.total_score}/16</option>`).join('')}
        </select>
      </div>
    </div>`;
    div.innerHTML += selectorHtml;

    if (!atA || !atB) {
      div.innerHTML += '<div style="color:var(--grey);padding:20px">Select two attempts to compare.</div>';
      return div;
    }

    // Build comparison rows
    function getSummaryVal(attempt, key) {
      return attempt.attempt_summary_json?.[key];
    }

    function recPct(attempt) {
      const rec = getSummaryVal(attempt, 'exerciseScores')?.recognition;
      if (!rec || !rec.total) return null;
      return Math.round((rec.score / rec.total) * 100);
    }
    function ctrlPct(attempt) {
      const c = getSummaryVal(attempt, 'exerciseScores')?.controlledProduction;
      if (!c || !c.total) return null;
      return Math.round((c.score / c.total) * 100);
    }
    function dialogueScore(attempt) {
      return getSummaryVal(attempt, 'dialogueCompleted') ? '2/2' : '0/2';
    }
    function infoGapScore(attempt) {
      return getSummaryVal(attempt, 'infoGapCompleted') ? '2/2' : '0/2';
    }
    function transferScoreStr(attempt) {
      const rs = getSummaryVal(attempt, 'rubricScores');
      return rs ? rs.transfer + '/2' : '—';
    }
    function activeDur(attempt) {
      return P.formatDuration(attempt.active_duration_seconds || attempt.duration_seconds);
    }

    function diffCell(valA, valB, isHigherBetter = true) {
      if (valA === null || valB === null || valA === undefined || valB === undefined) return '—';
      if (typeof valA === 'string' || typeof valB === 'string') return '';
      const diff = valB - valA;
      if (diff === 0) return '<span style="color:var(--grey)">—</span>';
      const isPositive = isHigherBetter ? diff > 0 : diff < 0;
      const color = isPositive ? 'var(--green)' : 'var(--red)';
      return `<span style="color:${color};font-weight:700">${diff > 0 ? '+' : ''}${diff}</span>`;
    }

    function numericOf(str) {
      if (typeof str === 'number') return str;
      if (typeof str === 'string' && str.includes('/')) return parseInt(str.split('/')[0]);
      return null;
    }

    const rows = [
      { label: 'Overall score', a: atA.total_score !== null ? atA.total_score + '/16' : '—', b: atB.total_score !== null ? atB.total_score + '/16' : '—', diff: diffCell(atA.total_score, atB.total_score) },
      { label: 'Result band', a: P.getResultBandLabel(atA.result_band), b: P.getResultBandLabel(atB.result_band), diff: '' },
      { label: 'Recognition accuracy', a: recPct(atA) !== null ? recPct(atA) + '%' : '—', b: recPct(atB) !== null ? recPct(atB) + '%' : '—', diff: diffCell(recPct(atA), recPct(atB)) },
      { label: 'Controlled production', a: ctrlPct(atA) !== null ? ctrlPct(atA) + '%' : '—', b: ctrlPct(atB) !== null ? ctrlPct(atB) + '%' : '—', diff: diffCell(ctrlPct(atA), ctrlPct(atB)) },
      { label: 'Guided dialogue', a: dialogueScore(atA), b: dialogueScore(atB), diff: diffCell(numericOf(dialogueScore(atA)), numericOf(dialogueScore(atB))) },
      { label: 'Information gap', a: infoGapScore(atA), b: infoGapScore(atB), diff: diffCell(numericOf(infoGapScore(atA)), numericOf(infoGapScore(atB))) },
      { label: 'Transfer score', a: transferScoreStr(atA), b: transferScoreStr(atB), diff: diffCell(numericOf(transferScoreStr(atA)), numericOf(transferScoreStr(atB))) },
      { label: 'Active learning time', a: activeDur(atA), b: activeDur(atB), diff: '' },
      { label: 'Transfer scenario', a: atA.attempt_summary_json?.transferScenarioTitle || '—', b: atB.attempt_summary_json?.transferScenarioTitle || '—', diff: '' },
      { label: 'Completed', a: P.formatDate(atA.completed_at), b: P.formatDate(atB.completed_at), diff: '' },
    ];

    const tableHtml = `
    <div class="grammar-table-wrap">
      <table class="grammar-table">
        <thead>
          <tr>
            <th>Measure</th>
            <th>Attempt ${atA.attempt_number}</th>
            <th>Attempt ${atB.attempt_number}</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr>
            <td style="font-weight:600">${r.label}</td>
            <td>${r.a}</td>
            <td>${r.b}</td>
            <td>${r.diff}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
    div.innerHTML += tableHtml;

    // Supportive insight
    const scoreImproved = atB.total_score !== null && atA.total_score !== null && atB.total_score > atA.total_score;
    const insight = scoreImproved
      ? `You improved your score from <strong>${atA.total_score}/16</strong> to <strong>${atB.total_score}/16</strong> — an increase of <strong>+${atB.total_score - atA.total_score} points</strong>. Keep focusing on using is/are in new contexts and forming questions confidently.`
      : atB.total_score === atA.total_score
      ? `Your score held steady at <strong>${atA.total_score}/16</strong>. Try working on controlled production and the transfer scenario with a different setting.`
      : `Your score changed from <strong>${atA.total_score}/16</strong> to <strong>${atB.total_score}/16</strong>. Review the grammar focus and try the guided dialogue again.`;

    div.innerHTML += `
    <div style="margin-top:20px;padding:16px;background:var(--accent-light);border-radius:var(--radius-md);border-left:4px solid var(--accent)">
      <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:6px">💡 Insight</div>
      <div style="font-size:14px;color:var(--navy);line-height:1.6">${insight}</div>
    </div>`;

    div.innerHTML += `
    <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn-outline-sm" id="back-to-attempts-btn">← Lesson History</button>
      <button class="btn-start" id="new-attempt-btn-compare">⊕ Start New Attempt</button>
    </div>`;

    return div;
  }

  // ══════════════════════════════════════════════
  // ── TEACHER VIEW ──
  // ══════════════════════════════════════════════
  function renderTeacherView() {
    const td = LX.teacherData;
    const allAttempts = P.getAllAttempts();
    const latestCompleted = P.getLatestCompletedAttempt();

    const div = el('div');
    div.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Teacher Dashboard</div>
      <div class="dashboard-title">Learner Progress 👩‍🏫</div>
    </div>`;

    const layout = el('div', 'teacher-layout');

    const listCol = el('div');
    listCol.innerHTML = `<div class="section-title-sm">Students (${td.learners.length})</div>`;
    td.learners.forEach((learner, i) => {
      const row = el('div', `learner-row${i === 0 ? ' active' : ''}`, `
        <div class="learner-avatar" style="background:${learner.color}">${learner.avatar}</div>
        <div>
          <div class="learner-name">${learner.name}</div>
          <div class="learner-level">Level: ${learner.level}</div>
        </div>
      `);
      row.dataset.learner = i;
      listCol.appendChild(row);
    });
    layout.appendChild(listCol);

    const detailCol = el('div');
    const learner = td.learners[0];
    const prog = LX.getInstructionalProgress();
    const completedAttempts = allAttempts.filter(a => a.status === 'COMPLETED');

    detailCol.innerHTML = `
    <div class="learner-detail-card">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div class="learner-avatar" style="background:${learner.color};width:48px;height:48px;font-size:16px">${learner.avatar}</div>
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--navy)">${learner.name}</div>
          <div style="font-size:13px;color:var(--grey)">CEFR Level: ${learner.level} · Lesson: A1 Lost Property</div>
        </div>
        <span class="cefr-badge cefr-a1" style="margin-left:auto">A1</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--accent)">${prog.pct}%</div>
          <div style="font-size:11px;color:var(--grey)">Lesson Progress</div>
        </div>
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--green)">${completedAttempts.length}</div>
          <div style="font-size:11px;color:var(--grey)">Completed Attempts</div>
        </div>
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--amber)">${latestCompleted?.total_score !== undefined && latestCompleted?.total_score !== null ? latestCompleted.total_score : '—'}</div>
          <div style="font-size:11px;color:var(--grey)">Latest Score /16</div>
        </div>
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--navy);font-size:16px">${P.getResultBandLabel(latestCompleted?.result_band)}</div>
          <div style="font-size:11px;color:var(--grey)">Result Band</div>
        </div>
      </div>

      <div class="divider"></div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Attempt Records</div>

      ${allAttempts.length > 0 ? allAttempts.map(a => `
        <div style="padding:12px 14px;background:var(--grey-bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="font-weight:700;color:var(--navy)">Attempt ${a.attempt_number}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${a.status === 'COMPLETED' ? 'var(--green-light)' : 'var(--accent-light)'};color:${a.status === 'COMPLETED' ? 'var(--green)' : 'var(--accent)'}">${a.status}</span>
            <span style="font-size:11px;color:var(--grey);margin-left:auto">${P.formatDateTime(a.started_at)}</span>
          </div>
          <div style="font-size:12px;color:var(--navy)">
            Score: ${a.total_score !== null ? a.total_score + '/16' : '—'} · 
            Result: ${P.getResultBandLabel(a.result_band)} · 
            Duration: ${P.formatDuration(a.active_duration_seconds)} ·
            Scenario: ${a.attempt_summary_json?.transferScenarioTitle || '—'}
          </div>
          <div style="font-size:11px;color:var(--green);margin-top:4px">🔒 Immutable record — ${a.lesson_version_id}</div>
        </div>`).join('')
      : '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No attempts yet.</div></div>'}

      <div class="divider"></div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Review Schedule</div>
      ${P.getAllReviewEvents().length > 0 ? P.getAllReviewEvents().slice(0, 6).map(r => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:14px">📅</span>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--navy)">${_reviewTypeLabel(r.review_type)}</div>
            <div style="font-size:11px;color:var(--grey)">Due: ${P.formatDate(r.scheduled_for)} · Attempt ${P.getAttempt(r.lesson_attempt_id)?.attempt_number || '—'}</div>
          </div>
          <span style="margin-left:auto;font-size:11px;padding:3px 8px;border-radius:20px;background:${r.status === 'COMPLETED' ? 'var(--green-light)' : 'var(--accent-light)'};color:${r.status === 'COMPLETED' ? 'var(--green)' : 'var(--accent)'}">
            ${r.status}
          </span>
        </div>`).join('')
      : '<div style="font-size:13px;color:var(--grey);font-style:italic">No review schedule yet.</div>'}
    </div>`;

    layout.appendChild(detailCol);
    div.appendChild(layout);
    return div;
  }

  // ══════════════════════════════════════════════
  // ── ADMIN VIEW ──
  // ══════════════════════════════════════════════
  function renderAdminView() {
    const ad = LX.adminData;
    const div = el('div');
    div.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Platform Admin</div>
      <div class="dashboard-title">Content Management 🛠️</div>
    </div>`;

    const statsHtml = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      <div style="background:var(--white);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border);text-align:center">
        <div style="font-size:32px;font-weight:800;color:var(--green)">${ad.contentStats.curatedLessons}</div>
        <div style="font-size:12px;color:var(--grey)">Curated Lessons</div>
        <div style="font-size:10px;color:var(--green);font-weight:700;margin-top:4px">CURATED_CORE</div>
      </div>
      <div style="background:var(--white);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border);text-align:center">
        <div style="font-size:32px;font-weight:800;color:var(--accent)">${ad.contentStats.generatedPractice}</div>
        <div style="font-size:12px;color:var(--grey)">Generated Practice</div>
        <div style="font-size:10px;color:var(--accent);font-weight:700;margin-top:4px">AI_GENERATED</div>
      </div>
      <div style="background:var(--white);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border);text-align:center">
        <div style="font-size:32px;font-weight:800;color:var(--amber)">${ad.contentStats.pendingReview}</div>
        <div style="font-size:12px;color:var(--grey)">Pending Review</div>
      </div>
      <div style="background:var(--white);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border);text-align:center">
        <div style="font-size:32px;font-weight:800;color:var(--navy)">${ad.contentStats.published}</div>
        <div style="font-size:12px;color:var(--grey)">Published</div>
      </div>
    </div>`;
    div.innerHTML += statsHtml;

    div.innerHTML += `<div class="admin-tabs" style="display:flex">
      <button class="admin-tab active" data-tab="lessons">Lessons</button>
      <button class="admin-tab" data-tab="grammar">Grammar Points</button>
      <button class="admin-tab" data-tab="core">Core Sentences</button>
      <button class="admin-tab" data-tab="scenarios">Scenario Bank</button>
      <button class="admin-tab" data-tab="data">Data Model</button>
    </div>`;

    const tabContent = el('div', '');
    tabContent.id = 'admin-tab-content';
    tabContent.innerHTML = renderAdminLessonsTab();
    div.appendChild(tabContent);
    return div;
  }

  function renderAdminLessonsTab() {
    const lesson = LX.lesson_A1_001;
    const gps = LX.grammarPoints;
    const gpBadges = lesson.grammarPointIds.map(gid => gps[gid] ? `<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:var(--purple-light);color:var(--purple);font-weight:600">${gps[gid].code}</span>` : '').join(' ');
    return `
    <div style="margin-bottom:16px">
      <div class="content-row">
        <div>
          <div class="content-row-title">${lesson.title}</div>
          <div style="font-size:11px;color:var(--grey);margin-top:3px">ID: ${lesson.id} · v${lesson.version} · CEFR: A1 · ${lesson.estimatedMinutes} min</div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${gpBadges}</div>
        </div>
        <span class="content-source-badge source-curated">CURATED_CORE</span>
        <span class="validation-badge validated">✓ Published</span>
      </div>
    </div>
    <div style="padding:16px;background:var(--grey-bg);border-radius:var(--radius-md)">
      <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:12px">Grammar Points in this lesson:</div>
      ${lesson.grammarPointIds.map(gid => {
        const gp = LX.grammarPoints[gid];
        if (!gp) return '';
        return `<div class="content-row" style="margin-bottom:8px">
          <div>
            <div class="content-row-title">${gp.title}</div>
            <div style="font-size:11px;color:var(--grey)">${gp.code} · Group ${gp.grammarGroup}</div>
          </div>
          <span class="content-source-badge source-curated">${gp.curated_status}</span>
          <span class="validation-badge validated">✓ Active</span>
        </div>`;
      }).join('')}
    </div>
    <div style="margin-top:16px;padding:14px 16px;background:var(--amber-light);border-radius:var(--radius-md);font-size:13px;color:var(--navy);border:1px solid var(--amber)">
      <strong>🔒 Content Governance:</strong> Curated core lessons are protected. AI generation creates <em>practice variants</em>, not replacements. Generated content is always tagged with source lesson ID, grammar point, CEFR level, scenario family, and validation status.
    </div>`;
  }

  function renderAdminGrammarTab() {
    return Object.values(LX.grammarPoints).map(gp => `
      <div class="content-row" style="flex-direction:column;align-items:flex-start;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px;width:100%;margin-bottom:8px">
          <div class="content-row-title">${gp.title}</div>
          <span class="content-source-badge source-curated" style="margin-left:auto">${gp.curated_status}</span>
          <span class="validation-badge validated">Active</span>
        </div>
        <div style="font-size:11px;color:var(--grey);margin-bottom:8px">${gp.code} · Group ${gp.grammarGroup}</div>
        <div style="font-size:13px;color:var(--navy);line-height:1.5;background:var(--grey-bg);padding:10px 14px;border-radius:8px;width:100%">${gp.definition}</div>
        <div style="font-size:12px;color:var(--red);margin-top:8px"><strong>Common errors:</strong> ${gp.commonErrors.slice(0, 2).join(' · ')}</div>
      </div>`).join('');
  }

  function renderAdminCoreTab() {
    return LX.coreSentences.map(cs => `
      <div class="content-row" style="flex-direction:column;align-items:flex-start;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;width:100%;margin-bottom:6px">
          <span style="font-size:11px;font-weight:700;color:var(--grey);background:var(--grey-bg);padding:3px 8px;border-radius:6px">#${cs.number}</span>
          <div style="font-size:15px;font-weight:700;color:var(--navy);font-style:italic">"${cs.sentence}"</div>
          <span style="margin-left:auto;font-size:11px;padding:3px 8px;border-radius:20px;background:var(--green-light);color:var(--green);font-weight:600">Group ${cs.group}</span>
        </div>
        <div style="font-size:11px;color:var(--grey)">Grammar: ${cs.grammarPointIds.join(', ') || 'See brief'}</div>
      </div>`).join('');
  }

  function renderAdminScenariosTab() {
    const tc = LX.lesson_A1_001.transferChallenge;
    return `
    <div style="margin-bottom:14px;padding:12px 16px;background:var(--accent-light);border-radius:8px;font-size:13px;color:var(--accent);font-weight:600">
      📚 Phase 1: Curated Scenario Bank (${tc.scenarios.length} scenarios) · Phase 2 will add AI generation pipeline
    </div>
    ${tc.scenarios.map(s => `
      <div class="content-row" style="flex-direction:column;align-items:flex-start;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;width:100%;margin-bottom:6px">
          <div class="content-row-title">${s.title}</div>
          <span class="content-source-badge source-curated" style="margin-left:auto">CURATED_SCENARIO_BANK</span>
          <span class="validation-badge validated">Pre-validated</span>
        </div>
        <div style="font-size:12px;color:var(--grey)">Setting: ${s.setting}</div>
        <div style="font-size:12px;color:var(--grey)">Roles: ${s.studentRole} ↔ ${s.partnerRole}</div>
        <div style="font-size:12px;color:var(--navy);margin-top:6px">Target: ${s.targetLanguage.join(' · ')}</div>
      </div>`).join('')}`;
  }

  function renderAdminDataModelTab() {
    const store = JSON.parse(localStorage.getItem('lx_store_v1') || '{}');
    const attempts = Object.values(store.lesson_attempts || {});
    const stageAttempts = Object.values(store.stage_attempts || {}).flat();
    return `
    <div style="font-size:13px;color:var(--navy);margin-bottom:16px">
      Phase 1.5 data model is stored in <code>localStorage["lx_store_v1"]</code>. In Phase 2 this will be replaced with a real database (Cloudflare D1 or equivalent).
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      <div style="padding:14px;background:var(--grey-bg);border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--accent)">${attempts.length}</div><div style="font-size:11px;color:var(--grey)">lesson_attempts</div></div>
      <div style="padding:14px;background:var(--grey-bg);border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--green)">${Object.keys(store.scenario_instances || {}).length}</div><div style="font-size:11px;color:var(--grey)">scenario_instances</div></div>
      <div style="padding:14px;background:var(--grey-bg);border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--amber)">${Object.values(store.review_events || {}).flat().length}</div><div style="font-size:11px;color:var(--grey)">review_events</div></div>
    </div>
    <div style="padding:14px;background:var(--green-light);border-radius:8px;font-size:13px;border:1px solid var(--green);margin-bottom:12px">
      <strong>✓ Entities:</strong> lesson_versions · learner_assignments · lesson_attempts · stage_attempts · scenario_instances · scenario_attempts · review_events · attempt_events
    </div>
    <div style="padding:14px;background:var(--amber-light);border-radius:8px;font-size:13px;border:1px solid var(--amber)">
      <strong>Immutability:</strong> Completed attempt records are never overwritten. Each new attempt creates a new record with a new ID and incremented attempt_number.
    </div>`;
  }

  // ══════════════════════════════════════════════
  // ── EVENT HANDLERS ──
  // ══════════════════════════════════════════════
  function attachHandlers() {
    // Role switcher
    $$('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        st.currentRole = btn.dataset.role;
        const view = btn.dataset.view;
        if (view === 'teacher') { st.currentView = 'teacher'; location.hash = '/teacher'; }
        else if (view === 'admin') { st.currentView = 'admin'; location.hash = '/admin'; }
        else { st.currentView = 'dashboard'; location.hash = ''; }
        render();
      });
    });

    // Nav back / home
    const navBack = document.getElementById('nav-back-btn');
    if (navBack) navBack.addEventListener('click', () => { navigate(''); });

    const navHome = document.getElementById('nav-home-btn');
    if (navHome) {
      navHome.addEventListener('click', (e) => {
        if (st.currentView !== 'dashboard') { e.preventDefault(); navigate(''); }
      });
    }

    // ── DASHBOARD buttons ──
    const startBtn = document.getElementById('start-lesson-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        _startOrResumeLesson(false);
      });
    }

    const continueBtn = document.getElementById('continue-lesson-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        _startOrResumeLesson(false);
      });
    }

    const newAttemptBtnDash = document.getElementById('new-attempt-btn');
    if (newAttemptBtnDash) {
      newAttemptBtnDash.addEventListener('click', () => {
        _showNewAttemptConfirm();
      });
    }

    const viewAttemptsBtnCard = document.getElementById('view-attempts-btn-card');
    if (viewAttemptsBtnCard) {
      viewAttemptsBtnCard.addEventListener('click', () => navigate('/attempts'));
    }

    const compareAttemptsBtnSidebar = document.getElementById('compare-attempts-btn');
    if (compareAttemptsBtnSidebar) {
      compareAttemptsBtnSidebar.addEventListener('click', () => {
        const completed = P.getAllAttempts().filter(a => a.status === 'COMPLETED');
        if (completed.length >= 2) {
          st.compareAttemptIds = [completed[completed.length - 1].id, completed[0].id];
        }
        navigate('/attempts/compare');
      });
    }

    // ── LESSON buttons ──
    const saveExitBtn = document.getElementById('save-exit-btn');
    if (saveExitBtn) {
      saveExitBtn.addEventListener('click', () => {
        LX.saveAndExit(() => {
          st.currentView = 'dashboard';
          location.hash = '';
          render();
        });
      });
    }

    const backToAttemptsBtn = document.getElementById('back-to-attempts-btn');
    if (backToAttemptsBtn) {
      backToAttemptsBtn.addEventListener('click', () => {
        st.isReadOnly = false;
        st.readOnlyAttemptId = null;
        navigate('/attempts');
      });
    }

    // Stage navigation
    $$('[data-stage]').forEach(item => {
      if (item.classList.contains('stage-item')) {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.stage);
          const fromStage = LX.STAGES[st.currentStage]?.id;
          const toStage = LX.STAGES[idx]?.id;
          st.currentStage = idx;
          if (st.currentAttemptId && !st.isReadOnly && fromStage !== toStage) {
            P.logStageChange(st.currentAttemptId, fromStage, toStage);
            LX.performAutoSave();
          }
          render();
          window.scrollTo(0, 0);
        });
      }
    });

    const prevBtn = document.getElementById('prev-stage-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        st.currentStage = Math.max(0, st.currentStage - 1);
        render(); window.scrollTo(0, 0);
      });
    }

    const nextBtn = document.getElementById('next-stage-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (st.isReadOnly) { st.currentStage = Math.min(LX.STAGES.length - 1, st.currentStage + 1); render(); window.scrollTo(0, 0); return; }
        const stageKey = LX.STAGES[st.currentStage]?.id;
        LX.markStageComplete(stageKey);
        const fromStage = stageKey;
        st.currentStage = Math.min(LX.STAGES.length - 1, st.currentStage + 1);
        const toStage = LX.STAGES[st.currentStage]?.id;
        if (st.currentAttemptId) {
          P.logStageChange(st.currentAttemptId, fromStage, toStage);
          LX.performAutoSave();
        }
        render(); window.scrollTo(0, 0);
      });
    }

    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        _finishLesson();
      });
    }

    const finishFromFeedback = document.getElementById('finish-lesson-from-feedback-btn');
    if (finishFromFeedback) {
      finishFromFeedback.addEventListener('click', () => {
        _finishLesson();
      });
    }

    const backDashBtn = document.getElementById('back-dashboard-btn');
    if (backDashBtn) {
      backDashBtn.addEventListener('click', () => {
        if (!st.isReadOnly) {
          LX.markStageComplete(LX.STAGES[st.currentStage]?.id);
          if (st.currentAttemptId) LX.performAutoSave();
        }
        st.isReadOnly = false;
        st.readOnlyAttemptId = null;
        st.currentView = 'dashboard';
        location.hash = '';
        render();
      });
    }

    const viewAttemptsBtn = document.getElementById('view-attempts-btn');
    if (viewAttemptsBtn) viewAttemptsBtn.addEventListener('click', () => navigate('/attempts'));

    // ── EXERCISE HANDLERS ──
    $$('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (st.isReadOnly) return;
        const stageId = btn.dataset.stage;
        const itemIdx = parseInt(btn.dataset.item);
        const opt = btn.dataset.opt;
        const key = toCamel(stageId);
        if (!st.exerciseState[key]) st.exerciseState[key] = { answers: {}, checked: false, score: 0, total: 0 };
        st.exerciseState[key].answers[itemIdx] = opt;
        $$(`[data-stage="${stageId}"][data-item="${itemIdx}"]`).forEach(b => b.classList.remove('chosen'));
        btn.classList.add('chosen');
        enableCheck(stageId);
        LX.scheduleAutoSave();
      });
    });

    $$('input.fill-input').forEach(input => {
      input.addEventListener('input', () => {
        if (st.isReadOnly) return;
        enableCheck(input.dataset.stage);
        const stageId = input.dataset.stage;
        const itemIdx = parseInt(input.dataset.item);
        const key = toCamel(stageId);
        if (!st.exerciseState[key]) st.exerciseState[key] = { answers: {}, checked: false, score: 0, total: 0 };
        st.exerciseState[key].answers[itemIdx] = input.value;
        LX.scheduleAutoSave();
      });
    });

    $$('[id^="check-"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.id.replace('check-', '');
        if (id === 'infogap') { checkInfoGap(); return; }
        checkExercise(id);
      });
    });

    // Dialogue options
    $$('.response-option[data-turn]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (st.isReadOnly) return;
        const turn = parseInt(btn.dataset.turn);
        const opt = parseInt(btn.dataset.opt);
        const gd = LX.lesson_A1_001.guidedDialogue;
        const dialogue = gd.dialogue;
        const chosen = dialogue[turn].options[opt];
        const correct = dialogue[turn].model;

        if (!st.dialogueState.choices) st.dialogueState.choices = [];
        st.dialogueState.choices[turn] = chosen;

        const fbEl = document.getElementById(`dialogue-feedback-${turn}`);
        const isCorrect = chosen === correct;
        if (fbEl) {
          fbEl.style.display = 'block';
          fbEl.textContent = isCorrect ? '✅ Excellent! That\'s the model answer.' : `Good try! The model answer is: "${correct}"`;
          fbEl.style.color = isCorrect ? 'var(--green)' : 'var(--amber)';
          fbEl.style.fontWeight = '600';
        }

        setTimeout(() => {
          st.dialogueState.currentTurn = turn + 2;
          if (st.dialogueState.currentTurn >= dialogue.length) {
            st.dialogueState.completed = true;
            LX.saveStage05Attempt(st.dialogueState.choices, st.infoGapState.answers);
          }
          LX.performAutoSave();
          render();
        }, 1200);
      });
    });

    const igBtn = document.getElementById('check-infogap-btn');
    if (igBtn) igBtn.addEventListener('click', checkInfoGap);

    // Transfer scenario selector
    $$('.transfer-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (st.isReadOnly) return;
        const idx = parseInt(btn.dataset.scenario);
        st.transferState.selectedScenario = idx;
        if (st.currentAttemptId) P.logScenarioSelected(st.currentAttemptId, LX.lesson_A1_001.transferChallenge.scenarios[idx]?.id);
        render();
      });
    });

    $$('.transfer-item-input').forEach(input => {
      input.addEventListener('input', () => {
        if (st.isReadOnly) return;
        const idx = input.dataset.item;
        if (idx !== undefined) st.transferState.responses[idx] = input.value;
        LX.scheduleAutoSave();
      });
    });

    const transferDialogue = document.getElementById('transfer-dialogue');
    if (transferDialogue) {
      transferDialogue.addEventListener('input', () => {
        if (st.isReadOnly) return;
        st.transferState.responses['dialogue'] = transferDialogue.value;
        LX.scheduleAutoSave();
      });
    }

    const submitTransfer = document.getElementById('submit-transfer-btn');
    if (submitTransfer) {
      submitTransfer.addEventListener('click', () => {
        if (st.isReadOnly) return;
        const scenario = LX.lesson_A1_001.transferChallenge.scenarios[st.transferState.selectedScenario];
        const score = LX.autoScoreRubric();
        const band = LX.getScoreBand(score);
        st.transferState.submitted = true;
        st.transferState.score = score;
        st.transferState.feedback = band.desc;
        LX.saveStage06Attempt(scenario.id, st.transferState.responses, score, band.desc);
        LX.performAutoSave();
        render();
      });
    }

    // ── ATTEMPTS PAGE buttons ──
    $$('.view-attempt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const aid = btn.dataset.attemptId;
        st.isReadOnly = true;
        st.readOnlyAttemptId = aid;
        // Restore the attempt state for read-only browsing
        const attempt = P.getAttempt(aid);
        if (attempt) {
          st.currentStage = attempt.current_stage_index || 0;
          // Restore stagesCompleted from saved stage attempts
          const sas = P.getStageAttempts(aid);
          st.stagesCompleted = new Set(
            Object.entries(sas).filter(([,sa]) => sa.status === 'COMPLETED').map(([k]) => k)
          );
          // Restore exercise/dialogue/transfer from saved data
          const practiceData = sas['practice']?.response_data_json;
          if (practiceData) {
            if (practiceData.recognition) st.exerciseState.recognition = practiceData.recognition;
            if (practiceData.matching) st.exerciseState.matching = practiceData.matching;
            if (practiceData.controlledProduction) st.exerciseState.controlledProduction = practiceData.controlledProduction;
            if (practiceData.questionTransform) st.exerciseState.questionTransform = practiceData.questionTransform;
          }
          const dialogueData = sas['dialogue']?.response_data_json;
          if (dialogueData) {
            st.dialogueState.currentTurn = dialogueData.currentTurn || 0;
            st.dialogueState.choices = dialogueData.choices || [];
            st.dialogueState.completed = dialogueData.completed || false;
          }
          const infoGapData = sas['infogap']?.response_data_json;
          if (infoGapData) {
            st.infoGapState.answers = infoGapData.answers || {};
            st.infoGapState.completed = infoGapData.completed || false;
          }
          const transferData = sas['transfer']?.response_data_json;
          if (transferData) {
            st.transferState.selectedScenario = transferData.selectedScenario || 0;
            st.transferState.responses = transferData.responses || {};
            st.transferState.submitted = transferData.submitted || false;
          }
          const feedbackData = sas['feedback']?.response_data_json;
          if (feedbackData?.rubricScores) st.rubricScores = feedbackData.rubricScores;
          else if (attempt.attempt_summary_json?.rubricScores) st.rubricScores = attempt.attempt_summary_json.rubricScores;
        }
        navigate(`/attempts/${aid}`);
      });
    });

    $$('.resume-attempt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const aid = btn.dataset.attemptId;
        const attempt = P.getAttempt(aid);
        if (attempt && attempt.status === 'IN_PROGRESS') {
          st.currentAttemptId = aid;
          st.isReadOnly = false;
          // Restore state
          st.currentStage = attempt.current_stage_index || 0;
          const sas = P.getStageAttempts(aid);
          st.stagesCompleted = new Set(Object.entries(sas).filter(([,sa]) => sa.status === 'COMPLETED').map(([k]) => k));
          const practiceData = sas['practice']?.response_data_json;
          if (practiceData) {
            if (practiceData.recognition) st.exerciseState.recognition = practiceData.recognition;
            if (practiceData.matching) st.exerciseState.matching = practiceData.matching;
            if (practiceData.controlledProduction) st.exerciseState.controlledProduction = practiceData.controlledProduction;
            if (practiceData.questionTransform) st.exerciseState.questionTransform = practiceData.questionTransform;
          }
          const dialogueData = sas['dialogue']?.response_data_json;
          if (dialogueData) { st.dialogueState.currentTurn = dialogueData.currentTurn || 0; st.dialogueState.choices = dialogueData.choices || []; st.dialogueState.completed = dialogueData.completed || false; }
          const infoGapData = sas['infogap']?.response_data_json;
          if (infoGapData) { st.infoGapState.answers = infoGapData.answers || {}; st.infoGapState.completed = infoGapData.completed || false; }
          const transferData = sas['transfer']?.response_data_json;
          if (transferData) { st.transferState.selectedScenario = transferData.selectedScenario || 0; st.transferState.responses = transferData.responses || {}; st.transferState.submitted = transferData.submitted || false; }
          LX.startActiveTimer();
          LX.scheduleAutoSave();
          st.currentView = 'lesson';
          location.hash = '/lesson';
          render();
        }
      });
    });

    const newAttemptBtnHistory = document.getElementById('new-attempt-btn-history');
    if (newAttemptBtnHistory) newAttemptBtnHistory.addEventListener('click', _showNewAttemptConfirm);

    const compareAttemptsPage = document.getElementById('compare-attempts-btn-page');
    if (compareAttemptsPage) {
      compareAttemptsPage.addEventListener('click', () => {
        const completed = P.getAllAttempts().filter(a => a.status === 'COMPLETED');
        if (completed.length >= 2) st.compareAttemptIds = [completed[completed.length - 1].id, completed[0].id];
        navigate('/attempts/compare');
      });
    }

    const backToAttemptsFromDetail = document.getElementById('back-to-attempts-btn');
    if (backToAttemptsFromDetail && st.currentView === 'attempt_detail') {
      backToAttemptsFromDetail.addEventListener('click', () => { navigate('/attempts'); });
    }

    const compareFromDetail = document.getElementById('compare-from-detail-btn');
    if (compareFromDetail) {
      compareFromDetail.addEventListener('click', () => {
        const aid = compareFromDetail.dataset.attemptId;
        const completed = P.getAllAttempts().filter(a => a.status === 'COMPLETED');
        const other = completed.find(a => a.id !== aid) || completed[0];
        st.compareAttemptIds = [aid, other?.id];
        navigate('/attempts/compare');
      });
    }

    // Comparison selects
    const selectA = document.getElementById('compare-select-a');
    const selectB = document.getElementById('compare-select-b');
    if (selectA) {
      selectA.addEventListener('change', () => {
        st.compareAttemptIds[0] = selectA.value;
        render();
      });
    }
    if (selectB) {
      selectB.addEventListener('change', () => {
        st.compareAttemptIds[1] = selectB.value;
        render();
      });
    }

    const newAttemptBtnCompare = document.getElementById('new-attempt-btn-compare');
    if (newAttemptBtnCompare) newAttemptBtnCompare.addEventListener('click', _showNewAttemptConfirm);

    // Admin tabs
    $$('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById('admin-tab-content');
        if (content) {
          const tabId = tab.dataset.tab;
          if (tabId === 'lessons') content.innerHTML = renderAdminLessonsTab();
          else if (tabId === 'grammar') content.innerHTML = renderAdminGrammarTab();
          else if (tabId === 'core') content.innerHTML = renderAdminCoreTab();
          else if (tabId === 'scenarios') content.innerHTML = renderAdminScenariosTab();
          else if (tabId === 'data') content.innerHTML = renderAdminDataModelTab();
        }
      });
    });
  }

  // ── HELPER: Start or resume lesson ──
  function _startOrResumeLesson(forceNew) {
    if (forceNew) {
      const attempt = P.startNewAttempt();
      _resetRuntimeState();
      st.currentAttemptId = attempt.id;
    } else {
      const attempt = LX.startLesson();
      if (!attempt) return;
      st.currentAttemptId = attempt.id;
    }
    st.isReadOnly = false;
    st.readOnlyAttemptId = null;
    st.currentView = 'lesson';
    location.hash = '/lesson';
    render();
  }

  function _resetRuntimeState() {
    st.currentStage = 0;
    st.stagesCompleted = new Set();
    st.exerciseState = {
      recognition:          { answers: {}, checked: false, score: 0, total: 0 },
      matching:             { answers: {}, checked: false, score: 0, total: 0 },
      controlledProduction: { answers: {}, checked: false, score: 0, total: 0 },
      questionTransform:    { answers: {}, checked: false, score: 0, total: 0 },
    };
    st.dialogueState = { currentTurn: 0, choices: [], completed: false };
    st.infoGapState = { answers: {}, completed: false };
    st.transferState = { selectedScenario: 0, responses: {}, submitted: false, score: null, feedback: null };
    st.rubricScores = {};
    st.attemptRecords = { stage05_attempt: null, stage06_attempts: [] };
    st._activeDurationSeconds = 0;
    st._activeTimerStart = null;
  }

  // ── HELPER: Show new attempt confirmation modal ──
  function _showNewAttemptConfirm() {
    const modal = el('div', 'lx-modal-overlay');
    modal.innerHTML = `
    <div class="lx-modal">
      <div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:12px">Start a new attempt?</div>
      <div style="font-size:14px;color:var(--grey);margin-bottom:20px;line-height:1.6">
        Your completed attempt and scores will stay saved. This creates a new attempt so you can practise again and compare your progress.
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn-outline-sm" id="modal-cancel-btn">Cancel</button>
        <button class="btn-start" id="modal-confirm-btn">Start new attempt</button>
      </div>
    </div>`;
    document.body.appendChild(modal);

    document.getElementById('modal-cancel-btn').addEventListener('click', () => modal.remove());
    document.getElementById('modal-confirm-btn').addEventListener('click', () => {
      modal.remove();
      _resetRuntimeState();
      _startOrResumeLesson(true);
    });
  }

  // ── HELPER: Finish lesson ──
  function _finishLesson() {
    if (!st.currentAttemptId) return;
    LX.markStageComplete(LX.STAGES[st.currentStage]?.id);
    LX.completeLesson();
    st.currentView = 'dashboard';
    location.hash = '';
    render();
  }

  // ── EXERCISE CHECKING ──
  function toCamel(str) {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  }

  function enableCheck(stageId) {
    const btn = document.getElementById(`check-${stageId}`);
    if (btn) btn.removeAttribute('disabled');
  }

  function checkExercise(stageId) {
    const es = LX.lesson_A1_001.exercises.stages.find(s => s.id === stageId);
    if (!es) return;
    const stateKey = toCamel(stageId);
    let correct = 0;
    const total = es.items.length;

    if (stageId === 'recognition' || stageId === 'matching') {
      es.items.forEach((item, i) => {
        const chosen = st.exerciseState[stateKey]?.answers?.[i];
        const answerRight = chosen === item.answer;
        if (answerRight) correct++;
        const fbEl = document.getElementById(`fb-${stageId}-${i}`);
        $$(`[data-stage="${stageId}"][data-item="${i}"]`).forEach(btn => {
          if (btn.dataset.opt === item.answer) btn.classList.add('correct-choice');
          else if (btn.dataset.opt === chosen && !answerRight) btn.classList.add('wrong-choice');
        });
        if (fbEl) {
          fbEl.classList.add('show');
          fbEl.classList.add(answerRight ? 'correct-fb' : 'incorrect-fb');
          fbEl.innerHTML = `${answerRight ? '✅' : '❌'} ${answerRight ? 'Correct!' : `Incorrect. Answer: "${item.answer}"`} <div class="exercise-explanation">${item.explanation}</div>`;
        }
      });
    } else {
      es.items.forEach((item, i) => {
        const input = document.getElementById(`fill-${stageId}-${i}`);
        const val = input ? input.value.trim() : '';
        const expected = item.answer;
        const answerRight = val.toLowerCase().includes(expected.toLowerCase().split(' ')[0]);
        if (answerRight) correct++;
        const fbEl = document.getElementById(`fb-${stageId}-${i}`);
        if (fbEl) {
          fbEl.classList.add('show');
          fbEl.classList.add(answerRight ? 'correct-fb' : 'incorrect-fb');
          fbEl.innerHTML = `${answerRight ? '✅ Good!' : '❌ Incorrect.'} Model answer: <em>${expected}</em>`;
        }
        if (input) input.style.borderColor = answerRight ? 'var(--green)' : 'var(--red)';
      });
    }

    if (!st.exerciseState[stateKey]) st.exerciseState[stateKey] = { answers: {}, checked: false, score: 0, total: 0 };
    st.exerciseState[stateKey] = { ...st.exerciseState[stateKey], checked: true, score: correct, total };

    const summaryEl = document.getElementById(`summary-${stageId}`);
    if (summaryEl) {
      summaryEl.classList.add('show');
      summaryEl.classList.add(correct >= total * 0.7 ? 'correct-fb' : 'incorrect-fb');
      summaryEl.innerHTML = `Score: ${correct}/${total} — ${correct >= total * 0.7 ? 'Well done! Move to the next activity.' : 'Review the answers above and try again.'}`;
    }
    const checkBtn = document.getElementById(`check-${stageId}`);
    if (checkBtn) { checkBtn.textContent = 'Checked ✓'; checkBtn.disabled = true; }

    LX.performAutoSave();
  }

  function checkInfoGap() {
    if (st.isReadOnly) return;
    const ig = LX.lesson_A1_001.informationGap;
    const answers = {};
    $$('[id^="ig-"]').forEach(input => {
      const i = parseInt(input.dataset.item);
      answers[i] = input.value;
    });
    st.infoGapState.answers = answers;
    st.infoGapState.completed = true;
    LX.saveStage05Attempt(st.dialogueState.choices || [], answers);
    LX.performAutoSave();
    render();
  }

  // ── INIT ──
  function init() {
    st.currentView = getRoute();
    render();
  }

  init();

})();
