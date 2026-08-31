/* ===== LinguaX Main Application ===== */
(function () {
  'use strict';

  const LX = window.LX;
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

  // ── ROUTER ──
  function getRoute() {
    const hash = location.hash.replace('#', '') || '';
    if (hash.startsWith('/lesson')) return 'lesson';
    if (hash.startsWith('/teacher')) return 'teacher';
    if (hash.startsWith('/admin')) return 'admin';
    return 'dashboard';
  }

  function navigate(route) {
    location.hash = route;
    route = route.replace('#', '');
    if (route.startsWith('/lesson')) { st.currentView = 'lesson'; render(); }
    else if (route.startsWith('/teacher')) { st.currentView = 'teacher'; render(); }
    else if (route.startsWith('/admin')) { st.currentView = 'admin'; render(); }
    else { st.currentView = 'dashboard'; render(); }
  }

  window.addEventListener('hashchange', () => {
    st.currentView = getRoute();
    render();
  });

  // ── RENDER ROOT ──
  const root = document.getElementById('app-root');

  function render() {
    root.innerHTML = '';
    const shell = el('div', 'app-shell');
    shell.appendChild(renderNav());
    const main = el('main', 'app-main');
    const content = el('div', 'app-content fade-in');

    // Role switcher (dev tool)
    content.appendChild(renderRoleSwitcher());

    if (st.currentView === 'lesson') content.appendChild(renderLessonView());
    else if (st.currentView === 'teacher') content.appendChild(renderTeacherView());
    else if (st.currentView === 'admin') content.appendChild(renderAdminView());
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
        ${st.currentView !== 'dashboard' ? `<button class="nav-back-btn" id="nav-back-btn">← Dashboard</button>` : ''}
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
    const progress = LX.learnerData.progress[lesson.id] || { status: 'not_started', stagesCompleted: [] };
    const pct = Math.round((st.stagesCompleted.size / (LX.STAGES.length - 2)) * 100);
    const isCompleted = progress.status === 'completed';
    const hasStarted = st.stagesCompleted.size > 0;

    const col = el('div', 'dashboard-lessons');
    col.innerHTML = `<div class="section-title-sm">📚 Your Lessons</div>`;

    // MVP lesson card
    const card = el('div', 'lesson-card-lg');
    card.innerHTML = `
    <div class="lesson-card-accent-bar" style="background:var(--accent)"></div>
    <div class="lesson-card-body">
      <div class="lesson-card-meta">
        <span class="cefr-badge cefr-a1">A1</span>
        <span class="lesson-family">🏛️ Community & Public Places</span>
        <span class="lesson-duration">⏱ 25 min</span>
        <span class="lesson-duration">· ${LX.STAGES.length - 2} stages</span>
      </div>
      <div class="lesson-title">${lesson.title}</div>
      <div class="lesson-objective">${lesson.objective}</div>
      ${hasStarted ? `
      <div class="lesson-progress-wrap">
        <div class="lesson-progress-label">
          <span class="lesson-progress-text">Progress: ${st.stagesCompleted.size}/${LX.STAGES.length - 2} stages</span>
          <span class="lesson-progress-pct">${pct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:var(--accent)"></div>
        </div>
      </div>` : ''}
      <div class="lesson-card-footer-lg">
        <span class="status-pill ${isCompleted ? 'status-pill-completed' : hasStarted ? 'status-pill-inprogress' : 'status-pill-notstarted'}">
          ${isCompleted ? '✓ Completed' : hasStarted ? '▶ In progress' : '● Not started'}
        </span>
        <button class="btn-${isCompleted ? 'review' : hasStarted ? 'continue' : 'start'}" id="start-lesson-btn">
          ${isCompleted ? '🔁 Review' : hasStarted ? '▶ Continue' : '→ Start Lesson'}
        </button>
      </div>
    </div>`;
    col.appendChild(card);

    // Coming soon
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

    // Mastery widget
    const masteryCard = el('div', 'sidebar-card');
    masteryCard.innerHTML = `<div class="sidebar-card-title">🎯 Grammar Mastery</div>
    <div class="mastery-row">
      <span class="mastery-label">is (singular)</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${st.stagesCompleted.size > 0 ? 65 : 0}%;background:var(--accent)"></div></div>
      <span class="mastery-score text-accent">${st.stagesCompleted.size > 0 ? '65%' : '0%'}</span>
    </div>
    <div class="mastery-row">
      <span class="mastery-label">are (plural)</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${st.stagesCompleted.size > 0 ? 55 : 0}%;background:var(--accent)"></div></div>
      <span class="mastery-score text-accent">${st.stagesCompleted.size > 0 ? '55%' : '0%'}</span>
    </div>
    <div class="mastery-row">
      <span class="mastery-label">'s possession</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${st.stagesCompleted.size > 3 ? 40 : 0}%;background:var(--teal)"></div></div>
      <span class="mastery-score" style="color:var(--teal)">${st.stagesCompleted.size > 3 ? '40%' : '0%'}</span>
    </div>
    <div class="mastery-row">
      <span class="mastery-label">Is/Are…?</span>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${st.stagesCompleted.size > 4 ? 30 : 0}%;background:var(--purple)"></div></div>
      <span class="mastery-score" style="color:var(--purple)">${st.stagesCompleted.size > 4 ? '30%' : '0%'}</span>
    </div>`;
    col.appendChild(masteryCard);

    // Review queue
    const reviewCard = el('div', 'sidebar-card');
    const reviews = LX.learnerData.reviewQueue.length > 0
      ? LX.learnerData.reviewQueue.slice(0, 4).map(r => `
      <div class="review-item">
        <div class="review-dot" style="background:var(--accent)"></div>
        <div class="review-info">
          <div class="review-grammar">${r.label}</div>
          <div class="review-due">Due: ${new Date(r.due).toLocaleDateString()}</div>
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
        <div style="font-size:28px;font-weight:800;color:var(--accent)">${st.stagesCompleted.size}</div>
        <div style="font-size:11px;color:var(--grey)">stages done</div>
      </div>
      <div class="stat-block" style="text-align:center;flex:1;min-width:60px">
        <div style="font-size:28px;font-weight:800;color:var(--green)">${LX.learnerData.attempts.length}</div>
        <div style="font-size:11px;color:var(--grey)">attempts</div>
      </div>
      <div class="stat-block" style="text-align:center;flex:1;min-width:60px">
        <div style="font-size:28px;font-weight:800;color:var(--amber)">${LX.learnerData.reviewQueue.length}</div>
        <div style="font-size:11px;color:var(--grey)">reviews due</div>
      </div>
    </div>`;
    col.appendChild(statsCard);

    return col;
  }

  // ══════════════════════════════════════════════
  // ── LESSON VIEW ──
  // ══════════════════════════════════════════════
  function renderLessonView() {
    const div = el('div', 'lesson-layout');
    div.appendChild(renderLessonSidebar());
    const content = el('div', 'lesson-content');

    // Lesson header always visible
    content.appendChild(renderLessonHeader());

    // Current stage content
    const stage = LX.STAGES[st.currentStage];
    content.appendChild(renderStageContent(stage));

    div.appendChild(content);
    return div;
  }

  function renderLessonSidebar() {
    const lesson = LX.lesson_A1_001;
    const sidebar = el('div', 'lesson-sidebar');

    // Lesson map
    const map = el('div', 'lesson-map');
    map.innerHTML = `
    <div class="lesson-map-title">📋 ${lesson.title}</div>
    <div class="lesson-map-obj" style="font-size:12px;color:var(--accent);font-weight:600">A1 · ${lesson.estimatedMinutes} min</div>
    <div class="lesson-map-obj">${lesson.objective}</div>
    <div class="divider"></div>
    <div class="stage-list" id="stage-list">
      ${LX.STAGES.map((s, i) => {
        const isActive = i === st.currentStage;
        const isDone = st.stagesCompleted.has(i);
        const isLocked = i > 0 && !st.stagesCompleted.has(i - 1) && !isActive && !isDone;
        let cls = 'stage-item';
        if (isActive) cls += ' active';
        if (isDone) cls += ' completed-stage';
        return `
        <div class="${cls}" data-stage="${i}" ${isLocked ? 'style="opacity:0.45;pointer-events:none"' : ''}>
          <div class="stage-num ${isActive ? 'stage-num-active' : isDone ? 'stage-num-done' : 'stage-num-default'}">
            ${isDone ? '✓' : i + 1}
          </div>
          <div class="stage-info">
            <div class="stage-label">${s.label}</div>
            <div class="stage-sublabel">${s.tag}</div>
          </div>
          ${isActive ? '<span style="font-size:12px">▶</span>' : ''}
          ${isDone ? '<span class="stage-check">✓</span>' : ''}
        </div>`;
      }).join('')}
    </div>`;
    sidebar.appendChild(map);
    return sidebar;
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

  // ── SECTION CARD WRAPPER ──
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

  function navButtons(stageIdx, extraId) {
    const isFirst = stageIdx === 0;
    const isLast = stageIdx === LX.STAGES.length - 1;
    const div = el('div', 'flex', `
    <div style="display:flex;justify-content:space-between;padding:16px 24px;border-top:1px solid var(--border)">
      ${!isFirst ? `<button class="nav-back-btn" id="prev-stage-btn">← Previous</button>` : '<span></span>'}
      ${!isLast ? `<button class="btn-start" id="next-stage-btn">Next Stage →</button>` : `<button class="btn-review" id="finish-btn">🎉 Finish Lesson</button>`}
    </div>`);
    return div;
  }

  // ── STAGE 0: OVERVIEW ──
  function renderOverviewStage() {
    const lesson = LX.lesson_A1_001;
    const stagesHtml = LX.STAGES.slice(1).map((s, i) => `
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
          <div style="font-size:13px;color:var(--navy);line-height:1.5">Lost property desk → Hotel reception<br><strong>10 stages</strong> from grammar to transfer</div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px">What you will do in this lesson:</div>
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

    const card = sectionCard('#5B61F6', vt.stage, `${vt.label}: ${vt.tagline}`, bodyHTML, navButtons(1));
    return card;
  }

  // ── STAGE 2: GRAMMAR FOCUS ──
  function renderGrammarStage() {
    const gf = LX.lesson_A1_001.grammarFocus;
    const gp_is = LX.grammarPoints['present_be_is'];
    const gp_are = LX.grammarPoints['present_be_are'];

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

    const bodyHTML = `<div class="core-sentence-body">${bodyHTML_inner(cs.tagline, sentencesHtml)}</div>`;
    function bodyHTML_inner(tagline, content) { return `<div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${tagline}</div>${content}`; }
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

    const bodyHTML = `<div class="vocab-section-body">${bodyHTML_inner(vocab.tagline, groupsHtml)}</div>`;
    function bodyHTML_inner(tagline, content) { return `<div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${tagline}</div>${content}`; }
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
    if (stage.id === 'recognition' || stage.id === 'matching') {
      return renderChoiceExercise(stage, si);
    }
    if (stage.id === 'controlled_production') {
      return renderFillExercise(stage, si);
    }
    if (stage.id === 'question_transform') {
      return renderTransformExercise(stage, si);
    }
    return '';
  }

  function renderChoiceExercise(stage, si) {
    const itemsHtml = stage.items.map((item, i) => {
      const question = item.question || item.sentence;
      const opts = item.options.map(opt =>
        `<button class="choice-btn" data-stage="${stage.id}" data-item="${i}" data-opt="${opt}">${opt}</button>`
      ).join('');
      return `
      <div class="exercise-fill" id="ex-${stage.id}-${i}">
        <div class="fill-sentence">${question}</div>
        <div class="choice-buttons">${opts}</div>
        <div class="exercise-feedback" id="fb-${stage.id}-${i}">
          <span class="fb-icon"></span> <span class="fb-text"></span>
          <div class="exercise-explanation" id="exp-${stage.id}-${i}"></div>
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
      <button class="btn-check" id="check-${stage.id}" disabled>Check answers</button>
      <div class="exercise-feedback" id="summary-${stage.id}"></div>
    </div>`;
  }

  function renderFillExercise(stage, si) {
    const itemsHtml = stage.items.map((item, i) => `
      <div class="exercise-fill" id="ex-${stage.id}-${i}">
        <div class="fill-sentence" style="margin-bottom:8px">${i + 1}. <em>${item.template}</em></div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <input type="text" class="fill-input" id="fill-${stage.id}-${i}" placeholder="Write your answer..." 
            style="border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-family:var(--font);font-size:14px;width:280px;outline:none" 
            data-stage="${stage.id}" data-item="${i}" data-answer="${item.answer}">
          <span style="font-size:12px;color:var(--grey);font-style:italic">Hint: ${item.hint}</span>
        </div>
        <div class="exercise-feedback" id="fb-${stage.id}-${i}"></div>
      </div>`).join('');
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
      <button class="btn-check" id="check-${stage.id}">Check answers</button>
      <div class="exercise-feedback" id="summary-${stage.id}"></div>
    </div>`;
  }

  function renderTransformExercise(stage, si) {
    const itemsHtml = stage.items.map((item, i) => `
      <div class="exercise-fill" id="ex-${stage.id}-${i}">
        <div style="font-size:14px;color:var(--grey);margin-bottom:6px">${i + 1}. Statement: <strong>${item.statement}</strong></div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;font-weight:600;color:var(--navy)">Question:</span>
          <input type="text" class="fill-input" id="fill-${stage.id}-${i}" placeholder="Write the question..." 
            style="border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-family:var(--font);font-size:14px;min-width:260px;outline:none"
            data-stage="${stage.id}" data-item="${i}" data-answer="${item.answer}">
        </div>
        <div style="font-size:12px;color:var(--grey);margin-top:4px;font-style:italic">Hint: ${item.hint}</div>
        <div class="exercise-feedback" id="fb-${stage.id}-${i}"></div>
      </div>`).join('');
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
      <button class="btn-check" id="check-${stage.id}">Check answers</button>
      <div class="exercise-feedback" id="summary-${stage.id}"></div>
    </div>`;
  }

  // ── STAGE 5b: GUIDED DIALOGUE ──
  function renderDialogueStage() {
    const gd = LX.lesson_A1_001.guidedDialogue;
    const ds = st.dialogueState;

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
      // Student turn with choices
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
      // Active student turn
      if (i === ds.currentTurn) {
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

    const objectsHtml = ig.studentHas.map((item, i) => `
      <div style="background:var(--white);border-radius:var(--radius-sm);padding:14px;border:1.5px solid var(--border);text-align:center">
        <div style="font-size:36px;margin-bottom:8px">${item.emoji}</div>
        <div style="font-size:14px;font-weight:700;color:var(--navy)">${item.object}</div>
        <div style="font-size:12px;color:var(--grey)">${item.description}</div>
        <div style="margin-top:10px">
          <input type="text" class="transfer-item-input" id="ig-${i}" placeholder="Owner: ___" 
            data-item="${i}" data-object="${item.object}"
            style="text-align:center;font-size:13px"
            value="${igs.answers[i] || ''}">
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
      ${!igs.completed ? `<button class="btn-start" id="check-infogap-btn">Check my answers →</button>` : `
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

    const selectorHtml = tc.scenarios.map((s, i) =>
      `<button class="transfer-option-btn${ts.selectedScenario === i ? ' active' : ''}" data-scenario="${i}">
        ${i === 0 ? '🏨' : i === 1 ? '📚' : i === 2 ? '🛍️' : '✈️'} ${s.title}
      </button>`
    ).join('');

    const itemsHtml = scenario.lostItems.map((item, i) => `
      <div class="transfer-item">
        <div class="transfer-item-label">${item.emoji} Object ${i + 1}</div>
        <div class="transfer-item-desc"><strong>${item.object}</strong> — ${item.description}</div>
        <input type="text" class="transfer-item-input" id="tr-${i}" placeholder="Write your sentence about this object..." 
          data-item="${i}" value="${ts.responses[i] || ''}">
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
        <textarea class="response-text-area" id="transfer-dialogue" placeholder="Write a short dialogue (4-6 lines) using the target language. Start with a greeting." rows="5">${ts.responses['dialogue'] || ''}</textarea>
      </div>

      <div class="checklist" style="margin-bottom:16px">
        <div class="checklist-title">✓ Success Checklist</div>
        ${criteriaHtml}
      </div>

      ${!ts.submitted ? `<button class="btn-start" id="submit-transfer-btn" style="background:var(--col-transfer)">Submit Transfer Challenge →</button>` : ''}
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

    const bodyHTML = `
    <div class="feedback-body">
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
          <div style="font-size:13px;color:var(--navy);line-height:1.6">
            • Attempted all exercise stages<br>
            • Completed the guided dialogue<br>
            • Worked through the transfer scenario
          </div>
        </div>
        <div style="padding:14px;background:var(--amber-light);border-radius:var(--radius-md);border:1px solid var(--amber)">
          <div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:8px">🎯 Focus next time:</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.6">
            • Check is/are agreement with subject number<br>
            • Invert is/are to form questions<br>
            • Use 's correctly for possession
          </div>
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
    // Schedule if not yet done
    if (!st.reviewSchedule) { LX.markStageComplete(10); }

    const eventsHtml = rp.events.map((event, i) => `
      <div class="review-event">
        <div class="review-event-time">${event.icon} ${event.timing}</div>
        <div class="review-event-title">${event.label}</div>
        <div class="review-event-desc">${event.desc}</div>
        <span class="review-event-tag" style="background:var(--accent-light);color:var(--accent)">Scheduled</span>
      </div>`).join('');

    const bodyHTML = `
    <div class="review-body">
      <div style="font-size:13px;color:var(--grey);margin-bottom:20px;font-style:italic">${rp.tagline}</div>
      
      <div style="margin-bottom:24px;padding:16px;background:var(--green-light);border-radius:var(--radius-md);border:1px solid var(--green)">
        <div style="font-size:14px;font-weight:700;color:var(--green);margin-bottom:6px">🎉 Lesson Complete!</div>
        <div style="font-size:13px;color:var(--navy)">Your review schedule has been set. Completing all reviews is what moves you from <em>functional</em> to <em>independent</em> mastery.</div>
      </div>

      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px">Your Review Timeline:</div>
      <div class="review-timeline">${eventsHtml}</div>

      <div style="margin-top:24px;padding:16px;background:var(--navy);border-radius:var(--radius-md);color:white">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px">⭐ Final "What to remember"</div>
        ${LX.lesson_A1_001.whatToRemember.map(r =>
          `<div style="display:flex;gap:8px;margin-bottom:8px;font-size:13px"><span>${r.emoji}</span><span>${r.rule}</span></div>`
        ).join('')}
      </div>

      <div style="margin-top:20px;text-align:center">
        <button class="btn-primary" id="back-dashboard-btn" style="padding:14px 32px;border-radius:var(--radius-md);border:none;font-size:15px;font-weight:700;background:var(--accent);color:white;cursor:pointer">
          ← Back to Dashboard
        </button>
      </div>
    </div>`;
    return sectionCard('#475569', rp.stage, `${rp.label}: ${rp.tagline}`, bodyHTML, navButtons(11));
  }

  // ══════════════════════════════════════════════
  // ── TEACHER VIEW ──
  // ══════════════════════════════════════════════
  function renderTeacherView() {
    const td = LX.teacherData;
    const div = el('div');
    div.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Teacher Dashboard</div>
      <div class="dashboard-title">Learner Progress 👩‍🏫</div>
    </div>`;

    const layout = el('div', 'teacher-layout');

    // Learner list
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

    // Learner detail
    const detailCol = el('div');
    const learner = td.learners[0];
    const attempts = LX.learnerData.attempts;
    const hasAttempts = attempts.length > 0;

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

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--accent)">${st.stagesCompleted.size}</div>
          <div style="font-size:11px;color:var(--grey)">Stages Complete</div>
        </div>
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--green)">${attempts.length}</div>
          <div style="font-size:11px;color:var(--grey)">Attempts Saved</div>
        </div>
        <div style="text-align:center;padding:14px;background:var(--grey-bg);border-radius:var(--radius-sm)">
          <div style="font-size:24px;font-weight:800;color:var(--amber)">${LX.calculateRubricScore()}</div>
          <div style="font-size:11px;color:var(--grey)">Rubric Score /16</div>
        </div>
      </div>

      <div class="divider"></div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Attempt Records</div>
      ${hasAttempts ? attempts.map(a => `
        <div style="padding:12px 14px;background:var(--grey-bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:${a.type.includes('stage05') ? 'var(--accent-light)' : 'var(--red-light)'};color:${a.type.includes('stage05') ? 'var(--accent)' : 'var(--col-transfer)'}">${a.type === 'stage05_curated_scenario' ? '📌 Stage 05 (Curated)' : '🚀 Stage 06 (Transfer)'}</span>
            <span style="font-size:11px;color:var(--grey);margin-left:auto">${new Date(a.completedAt).toLocaleString()}</span>
          </div>
          <div style="font-size:12px;color:var(--navy)">Lesson: ${a.lessonId} · CEFR: ${a.cefrLevel} · Content: ${a.contentType}</div>
          ${a.immutable ? '<div style="font-size:11px;color:var(--green);margin-top:4px">🔒 Immutable curated snapshot — protected from AI override</div>' : ''}
          ${a.scenarioId ? `<div style="font-size:11px;color:var(--grey);margin-top:4px">Scenario: ${a.scenarioId} · Validation: ${a.validationStatus}</div>` : ''}
        </div>`).join('') : '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No attempts yet. The learner has not completed any exercises.</div></div>'}

      <div class="divider"></div>
      <div style="font-size:13px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Review Schedule</div>
      ${LX.learnerData.reviewQueue.length > 0 ? LX.learnerData.reviewQueue.map(r => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:14px">${r.type === 'immediate' ? '⚡' : r.type === 'sameday' ? '📝' : r.type === 'threedays' ? '💬' : '🚀'}</span>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--navy)">${r.label}</div>
            <div style="font-size:11px;color:var(--grey)">Due: ${new Date(r.due).toLocaleString()}</div>
          </div>
          <span style="margin-left:auto;font-size:11px;padding:3px 8px;border-radius:20px;background:var(--accent-light);color:var(--accent);font-weight:600">Scheduled</span>
        </div>`).join('') : '<div style="font-size:13px;color:var(--grey);font-style:italic">No review schedule yet — learner has not completed the lesson.</div>'}
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

    // Stats row
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

    // Tabs
    div.innerHTML += `<div class="admin-tabs" style="display:flex">
      <button class="admin-tab active" data-tab="lessons">Lessons</button>
      <button class="admin-tab" data-tab="grammar">Grammar Points</button>
      <button class="admin-tab" data-tab="core">Core Sentences</button>
      <button class="admin-tab" data-tab="scenarios">Scenario Bank</button>
    </div>`;

    const tabContent = el('div', '', '');
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

    // Start lesson button
    const startBtn = document.getElementById('start-lesson-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        st.currentView = 'lesson';
        st.currentStage = st.stagesCompleted.size > 0 ? Math.min(st.stagesCompleted.size, LX.STAGES.length - 1) : 0;
        location.hash = '/lesson';
        render();
      });
    }

    // Nav back / home
    const navBack = document.getElementById('nav-back-btn');
    if (navBack) {
      navBack.addEventListener('click', () => {
        st.currentView = 'dashboard';
        location.hash = '';
        render();
      });
    }
    const navHome = document.getElementById('nav-home-btn');
    if (navHome) {
      navHome.addEventListener('click', (e) => {
        if (st.currentView !== 'dashboard') {
          e.preventDefault();
          st.currentView = 'dashboard';
          location.hash = '';
          render();
        }
      });
    }

    // Stage navigation
    $$('[data-stage]').forEach(item => {
      if (item.classList.contains('stage-item')) {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.stage);
          if (!item.style.pointerEvents || item.style.pointerEvents !== 'none') {
            st.currentStage = idx;
            render();
            window.scrollTo(0, 0);
          }
        });
      }
    });

    // Prev/Next stage
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
        LX.markStageComplete(st.currentStage);
        st.currentStage = Math.min(LX.STAGES.length - 1, st.currentStage + 1);
        render(); window.scrollTo(0, 0);
      });
    }
    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        LX.markStageComplete(st.currentStage);
        st.currentView = 'dashboard';
        location.hash = '';
        render();
      });
    }
    const backDashBtn = document.getElementById('back-dashboard-btn');
    if (backDashBtn) {
      backDashBtn.addEventListener('click', () => {
        LX.markStageComplete(st.currentStage);
        st.currentView = 'dashboard';
        location.hash = '';
        render();
      });
    }

    // Exercise: choice buttons
    $$('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stageId = btn.dataset.stage;
        const itemIdx = parseInt(btn.dataset.item);
        const opt = btn.dataset.opt;
        // Store choice
        st.exerciseState[toCamel(stageId)].answers[itemIdx] = opt;
        // Mark sibling buttons
        $$(`[data-stage="${stageId}"][data-item="${itemIdx}"]`).forEach(b => b.classList.remove('chosen'));
        btn.classList.add('chosen');
        // Enable check button
        enableCheck(stageId);
      });
    });

    // Exercise: fill inputs
    $$('input.fill-input').forEach(input => {
      input.addEventListener('input', () => enableCheck(input.dataset.stage));
    });

    // Check buttons
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
        const turn = parseInt(btn.dataset.turn);
        const opt = parseInt(btn.dataset.opt);
        const gd = LX.lesson_A1_001.guidedDialogue;
        const dialogue = gd.dialogue;
        const chosen = dialogue[turn].options[opt];
        const correct = dialogue[turn].model;

        // Store choice
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

        // Advance dialogue
        setTimeout(() => {
          st.dialogueState.currentTurn = turn + 2; // skip partner response
          if (st.dialogueState.currentTurn >= dialogue.length) {
            st.dialogueState.completed = true;
            LX.saveStage05Attempt(st.dialogueState.choices, st.infoGapState.answers);
          }
          render();
        }, 1200);
      });
    });

    // Info gap check
    const igBtn = document.getElementById('check-infogap-btn');
    if (igBtn) igBtn.addEventListener('click', checkInfoGap);

    // Transfer: scenario selector
    $$('.transfer-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        st.transferState.selectedScenario = parseInt(btn.dataset.scenario);
        st.transferState.responses = {};
        st.transferState.submitted = false;
        render();
      });
    });

    // Transfer: inputs
    $$('.transfer-item-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = input.dataset.item;
        if (idx !== undefined) st.transferState.responses[idx] = input.value;
      });
    });
    const transferDialogue = document.getElementById('transfer-dialogue');
    if (transferDialogue) {
      transferDialogue.addEventListener('input', () => {
        st.transferState.responses['dialogue'] = transferDialogue.value;
      });
    }

    // Transfer: submit
    const submitTransfer = document.getElementById('submit-transfer-btn');
    if (submitTransfer) {
      submitTransfer.addEventListener('click', () => {
        const scenario = LX.lesson_A1_001.transferChallenge.scenarios[st.transferState.selectedScenario];
        const score = LX.autoScoreRubric();
        const band = LX.getScoreBand(score);
        st.transferState.submitted = true;
        st.transferState.score = score;
        st.transferState.feedback = band.desc;
        LX.saveStage06Attempt(
          scenario.id,
          st.transferState.responses,
          score,
          band.desc
        );
        render();
      });
    }

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
        }
      });
    });
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
      📚 Phase 1: Curated Scenario Bank (4 scenarios) · Phase 2 will add AI generation pipeline
    </div>
    ${tc.scenarios.map(s => `
      <div class="content-row" style="flex-direction:column;align-items:flex-start;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;width:100%;margin-bottom:6px">
          <div class="content-row-title">${s.title}</div>
          <span class="content-source-badge source-curated" style="margin-left:auto">CURATED_CORE</span>
          <span class="validation-badge validated">Pre-validated</span>
        </div>
        <div style="font-size:12px;color:var(--grey)">Setting: ${s.setting}</div>
        <div style="font-size:12px;color:var(--grey)">Roles: ${s.studentRole} ↔ ${s.partnerRole}</div>
        <div style="font-size:12px;color:var(--navy);margin-top:6px">Target: ${s.targetLanguage.join(' · ')}</div>
      </div>`).join('')}`;
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

    st.exerciseState[stateKey] = { ...st.exerciseState[stateKey], checked: true, score: correct, total };
    const summaryEl = document.getElementById(`summary-${stageId}`);
    if (summaryEl) {
      summaryEl.classList.add('show');
      summaryEl.classList.add(correct >= total * 0.7 ? 'correct-fb' : 'incorrect-fb');
      summaryEl.innerHTML = `Score: ${correct}/${total} — ${correct >= total * 0.7 ? 'Well done! Move to the next activity.' : 'Review the answers above and try again.'}`;
    }
    const checkBtn = document.getElementById(`check-${stageId}`);
    if (checkBtn) checkBtn.textContent = 'Checked ✓';
  }

  function checkInfoGap() {
    const ig = LX.lesson_A1_001.informationGap;
    const answers = {};
    $$('[id^="ig-"]').forEach(input => {
      const i = parseInt(input.dataset.item);
      answers[i] = input.value;
    });
    st.infoGapState.answers = answers;
    st.infoGapState.completed = true;
    LX.saveStage05Attempt(st.dialogueState.choices || [], answers);
    render();
  }

  // ── INIT ──
  function init() {
    st.currentView = getRoute();
    render();
  }

  init();

})();
