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
  const POS_EASE = skipMotion ? 1 : 0.25;
  const ROT_EASE = skipMotion ? 1 : 0.18;
  const MOVE_THRESHOLD = 0.4;

  let shown = false;
  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx;
  let cy = ty;
  let angle = 0;
  let targetAngle = 0;

  const interactiveSelector = 'a, button';

  function lerpAngle(a, b, t) {
    const diff = (((b - a + 180) % 360) + 360) % 360 - 180;
    return a + diff * t;
  }

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

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursor.classList.add('is-pointer');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const stillInside = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(interactiveSelector);
    if (e.target.closest(interactiveSelector) && !stillInside) {
      cursor.classList.remove('is-pointer');
    }
  });

  function frame() {
    const dx = tx - cx;
    const dy = ty - cy;
    cx += dx * POS_EASE;
    cy += dy * POS_EASE;

    const speed = Math.hypot(dx, dy);
    targetAngle = speed > MOVE_THRESHOLD ? Math.atan2(dy, dx) * (180 / Math.PI) + 135 : 0;
    angle = lerpAngle(angle, targetAngle, ROT_EASE);

    if (shown) {
      cursor.style.transform = `translate(${cx}px, ${cy}px) rotate(${angle}deg)`;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
