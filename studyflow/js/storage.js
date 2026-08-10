/* =============================================
   STORAGE.JS — localStorage management
   ============================================= */

const KEYS = {
  TASKS:    'studyflow_tasks',
  SCHEDULE: 'studyflow_schedule',
  SETTINGS: 'studyflow_settings',
  SESSIONS: 'studyflow_sessions',
};

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Storage.get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage.set error:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /* ---- Tasks ---- */
  getTasks() { return this.get(KEYS.TASKS) || []; },
  setTasks(tasks) { this.set(KEYS.TASKS, tasks); },

  /* ---- Schedule ---- */
  getSchedule() { return this.get(KEYS.SCHEDULE) || []; },
  setSchedule(items) { this.set(KEYS.SCHEDULE, items); },

  /* ---- Settings ---- */
  getSettings() {
    return this.get(KEYS.SETTINGS) || {
      username: 'Student',
      darkMode: false,
      focusDuration: 25,
      shortBreak: 5,
      longBreak: 15,
    };
  },
  setSettings(settings) { this.set(KEYS.SETTINGS, settings); },

  /* ---- Sessions ---- */
  getSessions() { return this.get(KEYS.SESSIONS) || { totalSessions: 0, totalMinutes: 0, weekly: {} }; },
  setSessions(data) { this.set(KEYS.SESSIONS, data); },

  /* ---- Reset ---- */
  resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};
