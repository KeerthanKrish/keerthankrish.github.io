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

  const lines = [
    '[ OK ] Initializing kernel...',
    '[ OK ] Mounting filesystem...',
    '[ OK ] Starting network services...',
    '[ OK ] Loading portfolio.service...',
    '[ OK ] Starting UI...',
    '',
    'Welcome, guest.',
  ];

  let i = 0;
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

  function nextLine() {
    if (done) return;
    if (i >= lines.length) {
      setTimeout(finish, 450);
      return;
    }
    const p = document.createElement('p');
    p.className = 'boot-line';
    p.textContent = lines[i];
    linesEl.appendChild(p);
    i++;
    setTimeout(nextLine, 140);
  }

  window.addEventListener('keydown', finish, { once: true });
  window.addEventListener('click', finish, { once: true });

  nextLine();
})();
