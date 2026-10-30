// ============================================================
// Picture-in-Picture Floating Screen Overlay for Focus Timer
// Runs on top of ALL tabs and software using the HTML5 Video PiP API.
// ============================================================

class PiPOverlayManager {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.isActive = false;
    this.lastState = null;
    this.onPipCloseCallback = null;
  }

  init() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = 440;
    this.canvas.height = 240;
    this.ctx = this.canvas.getContext('2d');

    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.autoplay = true;

    // Listen for user closing the PiP window directly
    this.video.addEventListener('leavepictureinpicture', () => {
      this.isActive = false;
      if (this.onPipCloseCallback) this.onPipCloseCallback();
    });
  }

  isSupported() {
    return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
  }

  renderFrame(state) {
    if (!this.ctx || !this.canvas) return;
    this.lastState = state;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const minutes = Math.floor(state.remainingSec / 60);
    const seconds = (state.remainingSec % 60).toString().padStart(2, '0');
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds}`;

    const isFocus = state.mode === 'focus';
    const isShortBreak = state.mode === 'shortBreak';
    const modeLabel = isFocus ? 'FOCUS SESSION' : isShortBreak ? 'SHORT BREAK' : 'LONG BREAK';
    const catLabel = (state.category || 'GATE').toUpperCase();

    // 1. Background (Dark Gradient)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    if (isFocus) {
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#1e1b4b');
    } else {
      bgGrad.addColorStop(0, '#022c22');
      bgGrad.addColorStop(1, '#064e3b');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Top Banner Pill
    ctx.fillStyle = isFocus ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = isFocus ? 'rgba(129, 140, 248, 0.6)' : 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1.5;

    const pillX = 24;
    const pillY = 20;
    const pillW = 160;
    const pillH = 28;
    const pillR = 14;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
    ctx.fill();
    ctx.stroke();

    // Mode text
    ctx.fillStyle = isFocus ? '#c7d2fe' : '#a7f3d0';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${catLabel} · ${modeLabel}`, pillX + 14, pillY + 18);

    // Running / Paused Status
    ctx.fillStyle = state.isRunning ? '#34d399' : '#f87171';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(state.isRunning ? '● RUNNING' : '❚❚ PAUSED', w - 110, pillY + 18);

    // 3. Central Big Timer Digits
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px "JetBrains Mono", Consolas, "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, w / 2, 130);

    // 4. Progress Bar
    const progress = state.durationSec > 0
      ? Math.max(0, Math.min(1, (state.durationSec - state.remainingSec) / state.durationSec))
      : 0;

    const barX = 36;
    const barY = 162;
    const barW = w - 72;
    const barH = 10;
    const barR = 5;

    // Track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, barR);
    ctx.fill();

    // Filled bar
    if (progress > 0) {
      const fillW = Math.max(barR * 2, barW * progress);
      const progGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      if (isFocus) {
        progGrad.addColorStop(0, '#6366f1');
        progGrad.addColorStop(1, '#a855f7');
      } else {
        progGrad.addColorStop(0, '#10b981');
        progGrad.addColorStop(1, '#34d399');
      }
      ctx.fillStyle = progGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, barR);
      ctx.fill();
    }

    // 5. Subtitle / Notes
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const subtext = state.sessionNotes
      ? `Task: "${state.sessionNotes.slice(0, 35)}"`
      : `Cycle ${state.currentCycle || 1} of ${state.cyclesBeforeLongBreak || 4} · OmniPrep Overlay`;
    ctx.fillText(subtext, w / 2, 204);

    // Reset textAlign for next frame
    ctx.textAlign = 'left';
  }

  async start(state, onClose) {
    if (!this.isSupported()) {
      throw new Error('Picture-in-Picture is not supported in this browser.');
    }

    this.init();
    this.onPipCloseCallback = onClose;

    // Initial frame render
    this.renderFrame(state);

    if (!this.stream) {
      this.stream = this.canvas.captureStream(30);
      this.video.srcObject = this.stream;
      await this.video.play();
    }

    if (document.pictureInPictureElement !== this.video) {
      await this.video.requestPictureInPicture();
    }

    this.isActive = true;
  }

  update(state) {
    if (!this.isActive) return;
    this.renderFrame(state);
  }

  async stop() {
    this.isActive = false;
    if (document.pictureInPictureElement && document.pictureInPictureElement === this.video) {
      try {
        await document.exitPictureInPicture();
      } catch (e) {
        console.warn('Exit PiP error:', e);
      }
    }
  }
}

export const pipOverlay = new PiPOverlayManager();
