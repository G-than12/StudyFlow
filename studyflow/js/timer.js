/* =============================================
   TIMER.JS — Pomodoro Timer
   ============================================= */

const Timer = (() => {
  const CIRCUMFERENCE = 2 * Math.PI * 100; // r=100

  let settings = { focus: 25, short: 5, long: 15 };
  let mode = 'focus';  // 'focus' | 'short' | 'long'
  let totalSeconds = 0;
  let remaining = 0;
  let running = false;
  let intervalId = null;
  let sessionCount = 0;
  let cycleCount = 0; // number of focus sessions in current cycle (for long break trigger)

  const LABELS = { focus: 'Focus Time', short: 'Short Break', long: 'Long Break' };

  /* ---- Init ---- */
  function init() {
    loadSettings();
    loadSessionStats();
    resetTimer(false);
    setupListeners();
    updateUI();
  }

  function loadSettings() {
    const s = Storage.getSettings();
    settings.focus = s.focusDuration || 25;
    settings.short = s.shortBreak    || 5;
    settings.long  = s.longBreak     || 15;

    const focusEl = document.getElementById('focusDuration');
    const shortEl = document.getElementById('shortBreakDuration');
    const longEl  = document.getElementById('longBreakDuration');
    if (focusEl) focusEl.value = settings.focus;
    if (shortEl) shortEl.value = settings.short;
    if (longEl)  longEl.value  = settings.long;
  }

  function loadSessionStats() {
    const data = Storage.getSessions();
    sessionCount = data.totalSessions || 0;
  }

  /* ---- Timer logic ---- */
  function getModeSeconds() {
    return { focus: settings.focus, short: settings.short, long: settings.long }[mode] * 60;
  }

  function resetTimer(updateDisplay = true) {
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    totalSeconds = getModeSeconds();
    remaining = totalSeconds;
    if (updateDisplay) {
      updateDisplay_();
      updateRing(1);
      setStartPauseLabel('Start');
    }
  }

  function start() {
    if (running) return;
    running = true;
    setStartPauseLabel('Pause');
    intervalId = setInterval(tick, 1000);
  }

  function pause() {
    if (!running) return;
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    setStartPauseLabel('Resume');
  }

  function tick() {
    if (remaining <= 0) {
      onSessionEnd();
      return;
    }
    remaining--;
    updateDisplay_();
    updateRing(remaining / totalSeconds);
  }

  function onSessionEnd() {
    clearInterval(intervalId);
    intervalId = null;
    running = false;

    if (mode === 'focus') {
      cycleCount++;
      sessionCount++;
      saveSession();
      showToast(`🎯 Focus session complete! Great work!`, 'success');
      notifyBrowser('Focus complete!', 'Time for a break.');
      updateSessionCounter();
    } else {
      showToast(`☕ Break over! Time to focus.`, 'info');
      notifyBrowser('Break over!', 'Ready to focus again?');
    }

    // Auto-advance to next mode
    if (mode === 'focus') {
      setMode(cycleCount % 4 === 0 ? 'long' : 'short');
    } else {
      setMode('focus');
    }
    setStartPauseLabel('Start');
    updateDisplay_();
    updateRing(1);
  }

  function skip() {
    clearInterval(intervalId); intervalId = null; running = false;
    onSessionEnd();
  }

  function saveSession() {
    const data = Storage.getSessions();
    data.totalSessions = sessionCount;
    data.totalMinutes  = (data.totalMinutes || 0) + settings.focus;

    // weekly tracking
    const today = new Date().toISOString().split('T')[0];
    if (!data.weekly) data.weekly = {};
    data.weekly[today] = (data.weekly[today] || 0) + 1;

    Storage.setSessions(data);
  }

  /* ---- Mode switching ---- */
  function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    resetTimer(true);
    updateModeColor();
    document.getElementById('timerLabel').textContent = LABELS[mode] || '';
  }

  function updateModeColor() {
    const ring = document.getElementById('timerRingProgress');
    if (!ring) return;
    const colors = { focus: 'var(--accent)', short: 'var(--success)', long: 'var(--secondary)' };
    ring.style.stroke = colors[mode] || 'var(--accent)';
  }

  /* ---- UI updates ---- */
  function updateDisplay_() {
    const el = document.getElementById('timerDisplay');
    if (!el) return;
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
  }

  function updateRing(fraction) {
    const el = document.getElementById('timerRingProgress');
    if (!el) return;
    const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction)));
    el.style.strokeDasharray  = CIRCUMFERENCE;
    el.style.strokeDashoffset = offset;
  }

  function updateUI() {
    updateDisplay_();
    updateRing(1);
    updateModeColor();
    updateSessionCounter();
    document.getElementById('timerLabel').textContent = LABELS[mode];
  }

  function updateSessionCounter() {
    const el = document.getElementById('sessionCountDisplay');
    if (el) el.textContent = `Session: ${sessionCount} completed`;
  }

  function setStartPauseLabel(label) {
    const btn = document.getElementById('timerStartPause');
    if (!btn) return;
    btn.textContent = label === 'Start' ? '▶ Start' : label === 'Pause' ? '⏸ Pause' : '▶ Resume';
  }

  function notifyBrowser(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification(title, { body });
      });
    }
  }

  /* ---- Settings save ---- */
  function saveTimerSettings() {
    const f = parseInt(document.getElementById('focusDuration')?.value) || 25;
    const s = parseInt(document.getElementById('shortBreakDuration')?.value) || 5;
    const l = parseInt(document.getElementById('longBreakDuration')?.value) || 15;

    settings.focus = Math.max(1, Math.min(60, f));
    settings.short = Math.max(1, Math.min(30, s));
    settings.long  = Math.max(1, Math.min(60, l));

    const current = Storage.getSettings();
    Storage.setSettings({ ...current, focusDuration: settings.focus, shortBreak: settings.short, longBreak: settings.long });

    resetTimer(true);
    showToast('Timer settings saved', 'success');
  }

  /* ---- Listeners ---- */
  function setupListeners() {
    document.getElementById('timerStartPause')?.addEventListener('click', () => {
      if (running) pause(); else start();
    });
    document.getElementById('timerReset')?.addEventListener('click', () => {
      pause();
      resetTimer(true);
      setStartPauseLabel('Start');
    });
    document.getElementById('timerSkip')?.addEventListener('click', skip);
    document.getElementById('saveTimerSettings')?.addEventListener('click', saveTimerSettings);

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (running) {
          showConfirm('Switch mode?', 'This will stop the current session.', () => {
            pause();
            setMode(btn.dataset.mode);
          });
        } else {
          setMode(btn.dataset.mode);
        }
      });
    });
  }

  function getStats() {
    return Storage.getSessions();
  }

  return { init, getStats };
})();
