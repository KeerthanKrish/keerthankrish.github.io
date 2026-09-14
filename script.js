// Typing effect for the hero role line
const roles = [
  'Software Engineer',
  'Building things for the web',
  'Open to opportunities',
];

const roleEl = document.getElementById('hero-role-text');

if (roleEl) {
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      roleEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      roleEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? 35 : 65);
  };

  tick();
}

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  });
}

// Card tilt-on-hover
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function attachTilt(cards, maxDeg) {
  cards.forEach((card) => {
    let frame = null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * maxDeg * 2;
      const rotateX = (0.5 - y) * maxDeg * 2;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (frame) cancelAnimationFrame(frame);
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

if (!reduceMotionQuery.matches) {
  attachTilt(document.querySelectorAll('.term'), 8);
  attachTilt(document.querySelectorAll('.stat'), 18);
}

// Custom cursor
const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
const cursor = document.getElementById('custom-cursor');

if (supportsFinePointer && cursor) {
  document.documentElement.classList.add('custom-cursor-active');

  const skipMotion = reduceMotionQuery.matches;

  let shown = false;
  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx;
  let cy = ty;

  const interactiveSelector = 'a, button';

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!shown) {
      cx = tx;
      cy = ty;
      cursor.style.display = 'block';
      shown = true;
    }
  });

  document.documentElement.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
    shown = false;
  });

  const greenBgSelector = '.btn-primary';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursor.classList.add('is-pointer');
    }
    if (e.target.closest(greenBgSelector)) {
      cursor.classList.add('is-on-green');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const stillInside = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(interactiveSelector);
    if (e.target.closest(interactiveSelector) && !stillInside) {
      cursor.classList.remove('is-pointer');
    }
    const stillOnGreen = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(greenBgSelector);
    if (e.target.closest(greenBgSelector) && !stillOnGreen) {
      cursor.classList.remove('is-on-green');
    }
  });

  // Trailing pixel dots
  const trailEl = document.getElementById('cursor-trail');
  const TRAIL_LENGTH = skipMotion ? 0 : 6;
  const SAMPLE_DIST = 10;
  const trailHistory = [];
  const trailDots = [];
  let lastSampleX = cx;
  let lastSampleY = cy;

  if (trailEl && TRAIL_LENGTH > 0) {
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      dot.style.opacity = '0';
      trailEl.appendChild(dot);
      trailDots.push(dot);
    }
  }

  function frame() {
    cx = tx;
    cy = ty;

    if (shown) {
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;

      if (TRAIL_LENGTH > 0) {
        if (Math.hypot(cx - lastSampleX, cy - lastSampleY) > SAMPLE_DIST) {
          trailHistory.unshift({ x: lastSampleX, y: lastSampleY });
          if (trailHistory.length > TRAIL_LENGTH) trailHistory.length = TRAIL_LENGTH;
          lastSampleX = cx;
          lastSampleY = cy;
        }

        trailDots.forEach((dot, i) => {
          const point = trailHistory[i];
          if (point) {
            dot.style.transform = `translate(${point.x}px, ${point.y}px)`;
            dot.style.opacity = String((1 - i / TRAIL_LENGTH) * 0.5);
          } else {
            dot.style.opacity = '0';
          }
        });
      }
    } else if (TRAIL_LENGTH > 0) {
      trailDots.forEach((dot) => { dot.style.opacity = '0'; });
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// Click pixel-burst
if (!reduceMotionQuery.matches) {
  const BURST_COUNT = 14;
  const BURST_COLORS = ['var(--accent)', 'var(--accent-2)'];
  const burstSkipSelector = 'a, button';

  document.addEventListener('click', (e) => {
    if (window.__brickGameActive) return;
    if (e.target.closest(burstSkipSelector)) return;

    const originX = e.clientX;
    const originY = e.clientY;

    for (let i = 0; i < BURST_COUNT; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-burst-particle';
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.background = BURST_COLORS[i % BURST_COLORS.length];
      document.body.appendChild(particle);

      const angle = (Math.PI * 2 * i) / BURST_COUNT + (Math.random() - 0.5) * 0.4;
      const distance = 26 + Math.random() * 40;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => particle.remove(), 550);
    }
  });
}
