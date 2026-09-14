(() => {
  const overlay = document.getElementById('boot-sequence');
  if (!overlay) return;
  const linesEl = document.getElementById('boot-lines');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let alreadyBooted = false;
  try {
    alreadyBooted = sessionStorage.getItem('bootDone') === '1';
  } catch (e) {}

  if (alreadyBooted || reduceMotion) {
    overlay.style.display = 'none';
    return;
  }

  let done = false;

  function finish() {
    if (done) return;
    done = true;
    overlay.classList.add('hidden');
    try {
      sessionStorage.setItem('bootDone', '1');
    } catch (e) {}
    window.removeEventListener('keydown', finish);
    window.removeEventListener('click', finish);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function typeLine(timestamp, text, ok) {
    return new Promise((resolve) => {
      const p = document.createElement('p');
      p.className = 'boot-line';

      const tsSpan = document.createElement('span');
      tsSpan.className = 'boot-ts';
      tsSpan.textContent = `[ ${timestamp} ] `;
      p.appendChild(tsSpan);

      const textSpan = document.createElement('span');
      p.appendChild(textSpan);

      linesEl.appendChild(p);

      let idx = 0;
      function typeChar() {
        if (done) {
          resolve();
          return;
        }
        if (idx < text.length) {
          textSpan.textContent += text[idx];
          idx++;
          setTimeout(typeChar, 6 + Math.random() * 10);
        } else {
          if (ok) {
            const okSpan = document.createElement('span');
            okSpan.className = 'boot-ok';
            okSpan.textContent = ' [ OK ]';
            p.appendChild(okSpan);
          }
          resolve();
        }
      }
      typeChar();
    });
  }

  function typeProgressBar(label) {
    return new Promise((resolve) => {
      const p = document.createElement('p');
      p.className = 'boot-line';
      linesEl.appendChild(p);

      const total = 22;
      let filled = 0;
      function step() {
        if (done) {
          resolve();
          return;
        }
        const bar = '█'.repeat(filled) + '░'.repeat(total - filled);
        const pct = Math.round((filled / total) * 100);
        p.textContent = `${label} [${bar}] ${pct}%`;
        filled++;
        if (filled <= total) {
          setTimeout(step, 16);
        } else {
          resolve();
        }
      }
      step();
    });
  }

  async function runBoot() {
    await typeLine('0.000000', 'Booting portfolio-os...', false);
    if (done) return;
    await typeLine('0.041823', 'Initializing kernel modules...', true);
    if (done) return;
    await typeLine('0.183211', 'Mounting /home/keerthan...', true);
    if (done) return;
    await typeLine('0.298754', 'Starting network.service...', true);
    if (done) return;
    await typeProgressBar('Loading assets');
    if (done) return;
    await typeLine('0.601332', 'Starting display manager...', true);
    if (done) return;
    await delay(200);
    if (done) return;

    const welcome = document.createElement('p');
    welcome.className = 'boot-line boot-welcome';
    welcome.textContent = 'Welcome, user.';
    linesEl.appendChild(welcome);

    await delay(500);
    finish();
  }

  window.addEventListener('keydown', finish, { once: true });
  window.addEventListener('click', finish, { once: true });

  runBoot();
})();
