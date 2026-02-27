/* ============================================================
   RICHARD McGEE — EDITORIAL CODE
   JavaScript: Generative Art, Animations, Interactions
   ============================================================ */

(function () {
  'use strict';

  // ── Generative Art Canvas ──────────────────────────────────
  // Inspired by Vera Molnár & Sol LeWitt: flowing lines with
  // subtle organic movement. Minimal, contemplative.

  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrameId;
  let canvasW, canvasH;
  let mouse = { x: -1000, y: -1000 };

  function initCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = canvas.parentElement.offsetWidth;
    canvasH = canvas.parentElement.offsetHeight;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function initParticles() {
    const count = Math.min(Math.floor((canvasW * canvasH) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.7 
          ? (Math.random() > 0.5 ? 'rgba(45, 155, 110, 0.6)' : 'rgba(107, 176, 152, 0.5)')
          : 'rgba(245, 240, 232, 0.15)',
        baseX: 0,
        baseY: 0,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.002 + 0.001,
        amplitude: Math.random() * 30 + 10
      });
    }
    particles.forEach(p => { p.baseX = p.x; p.baseY = p.y; });
  }

  let time = 0;

  function drawCanvas() {
    ctx.clearRect(0, 0, canvasW, canvasH);
    time += 0.005;

    // Draw flowing grid lines (Sol LeWitt inspired)
    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light'
      ? 'rgba(10, 10, 10, 0.04)'
      : 'rgba(245, 240, 232, 0.025)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const yBase = (canvasH / 8) * i + 50;
      for (let x = 0; x < canvasW; x += 3) {
        const y = yBase + Math.sin((x * 0.003) + time + i * 0.5) * 30
                       + Math.sin((x * 0.007) + time * 1.3) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw and update particles
    particles.forEach((p, idx) => {
      p.angle += p.speed;
      p.x = p.baseX + Math.sin(p.angle) * p.amplitude + Math.sin(time + idx * 0.1) * 5;
      p.y = p.baseY + Math.cos(p.angle * 0.7) * p.amplitude * 0.6;

      // Soft drift
      p.baseX += p.vx;
      p.baseY += p.vy;

      // Wrap around
      if (p.baseX < -50) p.baseX = canvasW + 50;
      if (p.baseX > canvasW + 50) p.baseX = -50;
      if (p.baseY < -50) p.baseY = canvasH + 50;
      if (p.baseY > canvasH + 50) p.baseY = -50;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    // Draw connections between close particles
    const connectionDist = 120;
    const accentLine = document.documentElement.getAttribute('data-theme') === 'light'
      ? 'rgba(31, 122, 84, ALPHA)'
      : 'rgba(45, 155, 110, ALPHA)';
    const defaultLine = document.documentElement.getAttribute('data-theme') === 'light'
      ? 'rgba(10, 10, 10, ALPHA)'
      : 'rgba(245, 240, 232, ALPHA)';

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          const alpha = ((1 - dist / connectionDist) * 0.12).toFixed(3);
          const isAccent = particles[i].color.includes('45, 155') || particles[j].color.includes('45, 155');
          ctx.strokeStyle = isAccent 
            ? accentLine.replace('ALPHA', alpha) 
            : defaultLine.replace('ALPHA', alpha);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animFrameId = requestAnimationFrame(drawCanvas);
  }

  // Pause canvas when not visible
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animFrameId) drawCanvas();
      } else {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });
  }, { threshold: 0.1 });

  initCanvas();
  drawCanvas();
  heroObserver.observe(canvas);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initCanvas, 300);
  });


  // ── Scroll Reveal ──────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger animations within the same section
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let idx = 0;
        siblings.forEach((sib, j) => {
          if (sib === entry.target) idx = j;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // Grant bars also need visible class
  const grantItems = document.querySelectorAll('.grants__item');
  const grantObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        grantObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  grantItems.forEach(el => grantObserver.observe(el));


  // ── Navigation ──────────────────────────────────────────────
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile menu
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });


  // ── Theme Toggle ───────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  let currentTheme = 'dark';

  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
  });


  // ── Publication Search ─────────────────────────────────────
  const pubSearch = document.getElementById('pubSearch');
  const pubItems = document.querySelectorAll('.pub__item');

  pubSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    pubItems.forEach(item => {
      const title = item.querySelector('.pub__item-title').textContent.toLowerCase();
      const journal = item.querySelector('.pub__item-journal').textContent.toLowerCase();
      const keywords = (item.dataset.keywords || '').toLowerCase();
      const desc = item.querySelector('.pub__item-desc').textContent.toLowerCase();
      const match = !query || 
        title.includes(query) || 
        journal.includes(query) || 
        keywords.includes(query) ||
        desc.includes(query);
      item.classList.toggle('hidden', !match);
    });
  });


  // ── Smooth Scroll for nav links ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });


  // ── Subtle parallax on hero content ────────────────────────
  const heroContent = document.querySelector('.hero__content');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH = window.innerHeight;
        if (scrollY < heroH) {
          const ratio = scrollY / heroH;
          heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
          heroContent.style.opacity = 1 - ratio * 0.7;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });


  // ── Active nav link highlight ──────────────────────────────
  const sections = document.querySelectorAll('.section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` 
            ? 'var(--text)' 
            : '';
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(s => sectionObserver.observe(s));


  // ── Easter Egg: Konami Code ────────────────────────────────
  // ↑↑↓↓←→←→BA unlocks a hidden academic achievement
  const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        showEasterEgg();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function showEasterEgg() {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'easter-toast';
    toast.innerHTML = `
      <div class="easter-toast__icon">&#127942;</div>
      <div class="easter-toast__content">
        <strong class="easter-toast__title">Achievement Unlocked</strong>
        <span class="easter-toast__subtitle mono">You clearly know your way around a keyboard.</span>
        <span class="easter-toast__pvalue mono">p &lt; 0.001</span>
      </div>
    `;
    document.body.appendChild(toast);

    // Trigger entrance
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('easter-toast--visible');
      });
    });

    // Remove after 5s
    setTimeout(() => {
      toast.classList.remove('easter-toast--visible');
      setTimeout(() => toast.remove(), 600);
    }, 5000);
  }


  // ── Easter Egg: Console Message ────────────────────────────
  console.log(
    '%c\n  PEER REVIEW NOTICE\n\n' +
    '  Manuscript: "style.css"\n' +
    '  Status: Accepted with minor revisions\n\n' +
    '  Reviewer 1: "Elegant use of CSS variables.\n' +
    '  However, the author should justify the choice\n' +
    '  of border-radius: 4px over 3px. Please provide\n' +
    '  a 95%% confidence interval."\n\n' +
    '  Reviewer 2: "Reject. Needs more gradients."\n\n' +
    '  Editor\'s note: Reviewer 2 still uses Comic Sans.\n\n' +
    '  ─────────────────────────────────────────\n' +
    '  Built by Prof. Richard McGee\n' +
    '  ORCID: 0000-0002-3125-8253\n' +
    '  Try the Konami code. ↑↑↓↓←→←→BA\n\n',
    'color: #2d9b6e; font-family: monospace; font-size: 12px; line-height: 1.6;'
  );


  // ── Easter Egg: Click the "RM" logo 5 times ───────────────
  let logoClickCount = 0;
  let logoClickTimer;
  const logo = document.querySelector('.nav__logo');

  logo.addEventListener('click', (e) => {
    // Only count clicks when already at the top
    if (window.scrollY < 100) {
      logoClickCount++;
      clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2000);

      if (logoClickCount >= 5) {
        logoClickCount = 0;
        // Briefly swap the decorative section line numbers to academic jokes
        const lineNums = document.querySelectorAll('.section__line-num');
        const jokes = ['n=1', 'β=.8', 'r²≈1', 'df=∞', 'H₀:☕', 'α=.05', 'OR>1', 'NNT=2', 'IRR?'];
        const originals = [];
        lineNums.forEach((el, i) => {
          originals.push(el.textContent);
          el.textContent = jokes[i] || jokes[0];
          el.style.color = 'var(--accent)';
        });
        // Revert after 4 seconds
        setTimeout(() => {
          lineNums.forEach((el, i) => {
            el.textContent = originals[i];
            el.style.color = '';
          });
        }, 4000);
      }
    }
  });

})();
