/* ===== LinguaX Landing Page ===== */
(function () {
  'use strict';

  const root = document.getElementById('landing-root');

  const features = [
    { icon: '🎯', bg: '#EEF0FF', title: 'CEFR-Aligned Curriculum', desc: 'Every lesson is mapped to A0–C2 levels with clear "I can…" objectives and measurable outcomes.' },
    { icon: '🔄', bg: '#E6F4EF', title: 'See → Understand → Transfer', desc: 'The full learning loop: teach grammar, show meaning, practise accurately, use it for a real purpose.' },
    { icon: '🎭', bg: '#FEF3C7', title: 'Real-Life Scenarios', desc: 'Lost property desks, hotel receptions, airports, and more — practise English where it matters.' },
    { icon: '🧠', bg: '#F3E8FF', title: 'Mastery-Based Progress', desc: 'Four stages: recognition → controlled production → guided communication → independent transfer.' },
    { icon: '📅', bg: '#FFF1F2', title: 'Spaced Review', desc: 'Automatically scheduled review tasks at the end of lesson, same day, 3 days, 7 days, and 2–4 weeks.' },
    { icon: '👩‍🏫', bg: '#F0F9FF', title: 'Teacher & Admin Tools', desc: 'Teachers monitor progress, review attempts, and give feedback. Admins manage curriculum and organisations.' },
  ];

  const loopSteps = [
    { num: 1, label: 'See', sub: 'Visual input' },
    { num: 2, label: 'Understand', sub: 'Grammar focus' },
    { num: 3, label: 'Notice', sub: 'Core sentences' },
    { num: 4, label: 'Copy', sub: 'Controlled drills' },
    { num: 5, label: 'Build', sub: 'Form practice' },
    { num: 6, label: 'Speak', sub: 'Guided dialogue' },
    { num: 7, label: 'Solve', sub: 'Scenario task' },
    { num: 8, label: 'Expand', sub: 'New context' },
    { num: 9, label: 'Review', sub: 'Spaced recall' },
    { num: 10, label: 'Transfer', sub: 'Independent use' },
  ];

  const cefrLevels = [
    { code: 'A0', name: 'Pre-A1', desc: 'Foundation — visual, familiar, concrete', cls: 'level-a0' },
    { code: 'A1', name: 'Beginner', desc: 'Short exchanges about familiar topics', cls: 'level-a1' },
    { code: 'A2', name: 'Elementary', desc: 'Everyday routines and simple tasks', cls: 'level-a2' },
    { code: 'B1', name: 'Intermediate', desc: 'Connected experiences and stories', cls: 'level-b1' },
    { code: 'B2', name: 'Upper-Intermediate', desc: 'Choice, negotiation, justification', cls: 'level-b2' },
    { code: 'C1', name: 'Advanced', desc: 'Professional and academic tasks', cls: 'level-c1' },
    { code: 'C2', name: 'Mastery', desc: 'Precision, ambiguity, pragmatics', cls: 'level-c2' },
  ];

  const lessonCards = [
    { cefr: 'A1', cefrCls: 'cefr-a1', duration: '25 min', title: 'Describe and identify everyday objects', desc: 'I can describe an object, ask a simple question about it, and identify the correct item.', status: 'completed', statusCls: 'status-completed', statusLabel: 'Completed' },
    { cefr: 'A1', cefrCls: 'cefr-a1', duration: '30 min', title: 'Lost Property: Is This Your Bag?', desc: 'I can describe an object, ask who it belongs to, and return it to the correct person.', status: 'inprogress', statusCls: 'status-inprogress', statusLabel: 'In progress' },
    { cefr: 'A2', cefrCls: 'cefr-a2', duration: '35 min', title: 'Hotel Reception: Room Queries', desc: 'I can ask about my room, describe a problem, and understand the receptionist\'s response.', status: 'locked', statusCls: 'status-locked', statusLabel: 'Locked' },
  ];

  function html(str) {
    return str;
  }

  function renderNav() {
    return html(`
    <nav>
      <div class="nav-inner">
        <a href="/" class="nav-logo">
          <div class="nav-logo-mark">Lx</div>
          <span class="nav-logo-text">Lingua<span>X</span></span>
        </a>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#method" class="nav-link">Method</a>
          <a href="#levels" class="nav-link">CEFR Levels</a>
          <a href="/app" class="nav-cta">Start Learning →</a>
        </div>
      </div>
    </nav>`);
  }

  function renderHero() {
    const cards = lessonCards.map(card => `
      <div class="lesson-card">
        <div class="lesson-card-top">
          <span class="cefr-badge ${card.cefrCls}">${card.cefr}</span>
          <span class="lesson-duration">⏱ ${card.duration}</span>
        </div>
        <div class="lesson-card-title">${card.title}</div>
        <div class="lesson-card-desc">${card.desc}</div>
        <div class="lesson-card-footer">
          <span class="${card.statusCls}">${card.statusLabel}</span>
          <span class="arrow-btn">→</span>
        </div>
      </div>
    `).join('');

    return html(`
    <section class="hero">
      <div class="hero-content">
        <div class="hero-kicker"><span class="hero-kicker-dot"></span>YOUR LEARNING PATH</div>
        <h1 class="hero-title">English for the <em>moments that matter</em>.</h1>
        <p class="hero-subtitle">Understand the pattern, practise it accurately, then use it to solve a real communication task.</p>
        <div class="hero-actions">
          <a href="/app" class="btn-primary">Start Learning Free →</a>
          <a href="#method" class="btn-secondary">See the Method</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">7</span>
            <span class="stat-label">CEFR levels</span>
          </div>
          <div class="stat">
            <span class="stat-number">10</span>
            <span class="stat-label">Learning stages</span>
          </div>
          <div class="stat">
            <span class="stat-number">12</span>
            <span class="stat-label">Core grammar groups</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="learning-path-preview">
          <div class="path-header">
            <div class="path-kicker">YOUR LEARNING PATH</div>
            <div class="path-title">English for the moments that matter.</div>
            <div class="path-subtitle">Understand the pattern, practise it accurately, then use it to solve a real communication task.</div>
          </div>
          ${cards}
        </div>
      </div>
    </section>`);
  }

  function renderFeatures() {
    const cards = features.map(f => `
      <div class="feature-card">
        <div class="feature-icon" style="background:${f.bg}">${f.icon}</div>
        <div class="feature-title">${f.title}</div>
        <div class="feature-desc">${f.desc}</div>
      </div>
    `).join('');
    return html(`
    <section id="features" class="features-section">
      <div class="section-header">
        <div class="section-kicker">Why LinguaX</div>
        <h2 class="section-title">Structured learning that actually works</h2>
        <p class="section-subtitle">Built on CEFR standards, cognitive science, and real communicative English — not just grammar drills.</p>
      </div>
      <div class="features-grid">${cards}</div>
    </section>`);
  }

  function renderLoop() {
    const steps = loopSteps.map(s => `
      <div class="loop-step">
        <div class="loop-step-num">${s.num}</div>
        <div class="loop-step-label">${s.label}</div>
        <div class="loop-step-sub">${s.sub}</div>
      </div>
    `).join('');
    return html(`
    <section id="method" class="loop-section">
      <div class="loop-inner">
        <div class="section-header">
          <div class="section-kicker">The Method</div>
          <h2 class="section-title">The complete learning loop</h2>
          <p class="section-subtitle">Every lesson follows the full sequence from first encounter to independent use in a new context.</p>
        </div>
        <div class="loop-steps">${steps}</div>
      </div>
    </section>`);
  }

  function renderCEFR() {
    const cards = cefrLevels.map(l => `
      <div class="cefr-card ${l.cls}">
        <div class="cefr-card-level">${l.code}</div>
        <div class="cefr-card-name">${l.name}</div>
        <div class="cefr-card-desc">${l.desc}</div>
      </div>
    `).join('');
    return html(`
    <section id="levels" class="cefr-section">
      <div class="section-header">
        <div class="section-kicker">CEFR Framework</div>
        <h2 class="section-title">From first words to mastery</h2>
        <p class="section-subtitle">Every lesson is precisely calibrated to one CEFR level — so learners always know where they are and where they are going.</p>
      </div>
      <div class="cefr-grid">${cards}</div>
    </section>`);
  }

  function renderQuote() {
    return html(`
    <section class="quote-section">
      <div class="quote-inner">
        <p class="quote-text">"Don't just <em>study</em> English. <em>Use</em> it. Every lesson in LinguaX ends with a real task in a real situation."</p>
        <div class="quote-author">The LinguaX Method — Grammar you can use, not just grammar you know.</div>
      </div>
    </section>`);
  }

  function renderCTA() {
    return html(`
    <section class="cta-section">
      <div class="cta-card">
        <div class="section-header" style="margin-bottom:0">
          <h2 class="section-title">Ready to learn English that works?</h2>
          <p class="section-subtitle" style="color:rgba(255,255,255,0.65);max-width:480px;">Start your first lesson now — no sign-up required for your first session.</p>
        </div>
        <div class="cta-actions">
          <a href="/app" class="btn-primary">Start Lesson A1 Free →</a>
          <a href="#features" class="btn-secondary">Learn More</a>
        </div>
      </div>
    </section>`);
  }

  function renderFooter() {
    return html(`
    <footer>
      <div class="footer-inner">
        <div class="nav-logo" style="text-decoration:none;display:flex;align-items:center;gap:8px;">
          <div class="nav-logo-mark">Lx</div>
          <span class="nav-logo-text">Lingua<span>X</span></span>
        </div>
        <div class="footer-copy">© 2025 LinguaX. Built for learners who mean it.</div>
        <div class="footer-links">
          <a href="#" class="footer-link">Method</a>
          <a href="#" class="footer-link">Curriculum</a>
          <a href="#" class="footer-link">For Teachers</a>
        </div>
      </div>
    </footer>`);
  }

  function render() {
    root.innerHTML = [
      renderNav(),
      '<main>',
      renderHero(),
      renderFeatures(),
      renderLoop(),
      renderCEFR(),
      renderQuote(),
      renderCTA(),
      '</main>',
      renderFooter(),
    ].join('');

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  render();
})();
