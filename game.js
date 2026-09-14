(() => {
  const GRAVITY = 0.9;
  const FALL_DURATION = 900;

  function triggerFallAndGame() {
    const page = document.querySelector('.page');
    if (!page || page.dataset.falling === '1') return;
    page.dataset.falling = '1';

    const blocks = Array.from(page.children);
    const state = blocks.map((el) => {
      const rect = el.getBoundingClientRect();
      el.style.position = 'fixed';
      el.style.top = `${rect.top}px`;
      el.style.left = `${rect.left}px`;
      el.style.width = `${rect.width}px`;
      el.style.margin = '0';
      el.style.zIndex = '500';
      return {
        el,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: -4 - Math.random() * 3,
        rot: 0,
        vrot: (Math.random() - 0.5) * 8,
      };
    });

    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      state.forEach((s) => {
        s.vy += GRAVITY;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.vrot;
        s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`;
        s.el.style.opacity = String(Math.max(0, 1 - elapsed / 1400));
      });

      if (elapsed < FALL_DURATION + 400) {
        requestAnimationFrame(step);
      } else {
        page.style.display = 'none';
        startGame();
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('keydown', (e) => {
    if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      triggerFallAndGame();
    }
  });

  // ---- Brick breaker ----

  let gameActive = false;

  function startGame() {
    if (gameActive) return;
    gameActive = true;
    window.__brickGameActive = true;

    const overlay = document.getElementById('brick-game');
    const canvas = document.getElementById('brick-canvas');
    const scoreEl = document.getElementById('brick-score');
    const livesEl = document.getElementById('brick-lives');
    const messageEl = document.getElementById('brick-message');
    if (!overlay || !canvas) return;

    overlay.classList.add('active');
    messageEl.classList.remove('visible');

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight - 44;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const styles = getComputedStyle(document.documentElement);
    const accent = (styles.getPropertyValue('--accent-rgb').trim() || '57,255,157');
    const accent2 = (styles.getPropertyValue('--accent-2-rgb').trim() || '124,92,255');

    const paddle = { w: 90, h: 12, x: width / 2 - 45, y: height - 30, speed: 8 };
    const ball = { r: 6, x: width / 2, y: height - 50, vx: 4, vy: -4 };

    const rows = 5;
    const cols = Math.max(6, Math.min(12, Math.floor(width / 70)));
    const brickPad = 6;
    const brickTop = 60;
    const brickW = (width - brickPad * (cols + 1)) / cols;
    const brickH = 20;

    const bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: brickPad + c * (brickW + brickPad),
          y: brickTop + r * (brickH + brickPad),
          w: brickW,
          h: brickH,
          alive: true,
          color: r % 2 === 0 ? accent : accent2,
        });
      }
    }

    let score = 0;
    let lives = 3;
    let over = false;
    let rafId;
    const keys = { left: false, right: false };

    function updateHud() {
      scoreEl.textContent = `Score: ${score}`;
      livesEl.textContent = `Lives: ${lives}`;
    }
    updateHud();

    function resetBall() {
      ball.x = width / 2;
      ball.y = height - 50;
      ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ball.vy = -4;
      paddle.x = width / 2 - paddle.w / 2;
    }

    function showMessage(text) {
      messageEl.textContent = text;
      messageEl.classList.add('visible');
    }

    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'ArrowRight') keys.right = true;
      if (e.key === 'Escape') endGame();
    }
    function onKeyUp(e) {
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
    }
    function onMouseMove(e) {
      paddle.x = Math.min(width - paddle.w, Math.max(0, e.clientX - paddle.w / 2));
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);

    function endGame() {
      if (!gameActive) return;
      gameActive = false;
      window.__brickGameActive = false;
      over = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      overlay.classList.remove('active');
      messageEl.classList.remove('visible');

      const page = document.querySelector('.page');
      if (page) {
        page.style.display = '';
        page.removeAttribute('data-falling');
        Array.from(page.children).forEach((el) => {
          el.style.position = '';
          el.style.top = '';
          el.style.left = '';
          el.style.width = '';
          el.style.margin = '';
          el.style.zIndex = '';
          el.style.transform = '';
          el.style.opacity = '';
        });
      }
    }

    function loop() {
      if (over) return;

      if (keys.left) paddle.x -= paddle.speed;
      if (keys.right) paddle.x += paddle.speed;
      paddle.x = Math.min(width - paddle.w, Math.max(0, paddle.x));

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r < 0 || ball.x + ball.r > width) ball.vx *= -1;
      if (ball.y - ball.r < 0) ball.vy *= -1;

      if (
        ball.vy > 0 &&
        ball.y + ball.r > paddle.y &&
        ball.y + ball.r < paddle.y + paddle.h &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.w
      ) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hit * 5;
        ball.vy = -Math.abs(ball.vy);
      }

      if (ball.y - ball.r > height) {
        lives--;
        updateHud();
        if (lives <= 0) {
          showMessage('Game over — press Esc to return');
          over = true;
        } else {
          resetBall();
        }
      }

      for (const b of bricks) {
        if (!b.alive) continue;
        if (
          ball.x + ball.r > b.x &&
          ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y &&
          ball.y - ball.r < b.y + b.h
        ) {
          b.alive = false;
          ball.vy *= -1;
          score += 10;
          updateHud();
          break;
        }
      }

      if (!over && bricks.every((b) => !b.alive)) {
        showMessage('You win! Press Esc to return');
        over = true;
      }

      ctx.clearRect(0, 0, width, height);

      for (const b of bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = `rgb(${b.color})`;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }

      ctx.fillStyle = `rgb(${accent})`;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.fillRect(ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);

      if (!over) {
        rafId = requestAnimationFrame(loop);
      }
    }

    rafId = requestAnimationFrame(loop);
  }
})();
