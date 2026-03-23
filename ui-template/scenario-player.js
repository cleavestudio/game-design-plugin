/* ============================================
   SCENARIO PLAYER — Animation playback controls
   Uses Web Animations API for true time control.
   Play/Pause/Restart, speed control, frame-accurate scrubber.
   ============================================ */

class ScenarioPlayer {
  /**
   * @param {HTMLElement} container - Element to append controls to (content area, not body)
   * @param {object} options - { duration: seconds }
   */
  constructor(container, options = {}) {
    this.container = container;
    this.duration = (options.duration || 2) * 1000; // convert to ms
    this.animations = []; // { animation: Animation, startTime: ms }
    this.playing = false;
    this.currentTime = 0;
    this.speed = 1;
    this.rafId = null;
    this.lastTimestamp = null;

    this.buildControls();
    this.pause();
  }

  /**
   * Register a Web Animation with its start time in the global timeline.
   * @param {Animation} animation - from element.animate()
   * @param {number} startTime - when this animation starts (in ms from timeline start)
   */
  add(animation, startTime = 0) {
    animation.pause();
    animation.currentTime = 0;
    this.animations.push({ animation, startTime });
  }

  buildControls() {
    const controls = document.createElement('div');
    controls.className = 'scenario-controls';
    controls.innerHTML = `
      <button class="sc-btn sc-restart" title="Restart (Home)">⟲</button>
      <button class="sc-btn sc-step-back" title="Step Back (←)">◀◀</button>
      <button class="sc-btn sc-play" title="Play/Pause (Space)">▶</button>
      <button class="sc-btn sc-step-fwd" title="Step Forward (→)">▶▶</button>
      <input type="range" class="sc-timeline" min="0" max="1000" value="0">
      <span class="sc-time">0.00 / ${(this.duration / 1000).toFixed(2)}s</span>
      <div class="sc-speed">
        <button class="sc-speed-btn" data-speed="0.1">0.1x</button>
        <button class="sc-speed-btn" data-speed="0.25">0.25x</button>
        <button class="sc-speed-btn" data-speed="0.5">0.5x</button>
        <button class="sc-speed-btn active" data-speed="1">1x</button>
        <button class="sc-speed-btn" data-speed="2">2x</button>
      </div>
    `;

    // Append to container, not body
    this.container.appendChild(controls);

    this.timeline = controls.querySelector('.sc-timeline');
    this.timeDisplay = controls.querySelector('.sc-time');
    this.playBtn = controls.querySelector('.sc-play');
    this.controlsEl = controls;

    controls.querySelector('.sc-play').onclick = () => this.togglePlay();
    controls.querySelector('.sc-restart').onclick = () => this.restart();
    controls.querySelector('.sc-step-back').onclick = () => this.step(-16); // ~1 frame at 60fps
    controls.querySelector('.sc-step-fwd').onclick = () => this.step(16);

    this.timeline.addEventListener('input', (e) => {
      const t = (e.target.value / 1000) * this.duration;
      this.seek(t);
    });

    controls.querySelectorAll('.sc-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.speed = parseFloat(btn.dataset.speed);
        controls.querySelectorAll('.sc-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); this.step(-16); }
      if (e.code === 'ArrowRight') { e.preventDefault(); this.step(16); }
      if (e.code === 'Home') { this.restart(); }
    });
  }

  play() {
    this.playing = true;
    this.playBtn.textContent = '⏸';
    this.lastTimestamp = performance.now();
    this.tick();
  }

  pause() {
    this.playing = false;
    this.playBtn.textContent = '▶';
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    // Pause all animations at current position
    this.syncAnimations();
    this.animations.forEach(a => a.animation.pause());
  }

  togglePlay() {
    if (this.playing) this.pause();
    else this.play();
  }

  restart() {
    this.pause();
    this.currentTime = 0;
    this.syncAnimations();
    this.updateUI();
  }

  seek(timeMs) {
    this.currentTime = Math.max(0, Math.min(this.duration, timeMs));
    this.syncAnimations();
    this.updateUI();
  }

  step(deltaMs) {
    this.pause();
    this.seek(this.currentTime + deltaMs);
  }

  /**
   * Sync all registered animations to the current global time.
   * Each animation's local time = globalTime - its startTime.
   */
  syncAnimations() {
    for (const { animation, startTime } of this.animations) {
      const localTime = this.currentTime - startTime;
      if (localTime < 0) {
        // Animation hasn't started yet
        animation.currentTime = 0;
        animation.pause();
      } else {
        const dur = animation.effect.getTiming().duration || animation.effect.getComputedTiming().duration;
        animation.currentTime = Math.min(localTime, dur);
        animation.pause();
      }
    }
  }

  tick() {
    if (!this.playing) return;

    const now = performance.now();
    const dt = (now - this.lastTimestamp) * this.speed;
    this.lastTimestamp = now;
    this.currentTime += dt;

    if (this.currentTime >= this.duration) {
      this.currentTime = this.duration;
      this.syncAnimations();
      this.updateUI();
      this.pause();
      return;
    }

    this.syncAnimations();
    // While playing, let animations run at speed
    for (const { animation, startTime } of this.animations) {
      const localTime = this.currentTime - startTime;
      if (localTime >= 0) {
        animation.playbackRate = this.speed;
        // Don't call play() — we're controlling time manually via syncAnimations
      }
    }

    this.updateUI();
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  updateUI() {
    const progress = (this.currentTime / this.duration) * 1000;
    this.timeline.value = progress;
    this.timeDisplay.textContent = `${(this.currentTime / 1000).toFixed(2)} / ${(this.duration / 1000).toFixed(2)}s`;
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.animations.forEach(a => a.animation.cancel());
    if (this.controlsEl) this.controlsEl.remove();
  }
}

window.ScenarioPlayer = ScenarioPlayer;
