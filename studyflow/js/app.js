/* =============================================
   APP.JS — Main application controller
   ============================================= */

/* =============================================
   NAVIGATION
   ============================================= */
const Nav = (() => {
  let currentPage = 'dashboard';

  function navigate(page) {
    if (!page) return;

    // Deactivate all pages & nav items
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.classList.add('hidden');
    });
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Activate target
    const pageEl = document.getElementById(`page-${page}`);
    if (!pageEl) return;
    pageEl.classList.remove('hidden');
    pageEl.classList.add('active');

    // Highlight nav
    document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(n => n.classList.add('active'));

    currentPage = page;

    // Trigger page-specific render
    switch (page) {
      case 'dashboard':  Dashboard.refresh(); break;
      case 'tasks':      Tasks.render();      break;
      case 'schedule':   Schedule.render();   break;
      case 'focus':      /* timer stays as-is */ break;
      case 'statistics': Statistics.render(); break;
      case 'settings':   Settings.load();     break;
    }

    // Close mobile sidebar
    closeMobileSidebar();
  }

  function setupListeners() {
    // Sidebar nav buttons
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.page));
    });

    // Inline data-page buttons (e.g., "View All", "Start Focus")
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (btn && !btn.classList.contains('nav-item')) {
        navigate(btn.dataset.page);
      }
    });
  }

  function closeMobileSidebar() {
    document.getElementById('sidebar')?.classList.remove('translate-x-0');
    document.getElementById('sidebar')?.classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay')?.classList.add('hidden');
  }

  return { navigate, setupListeners };
})();

/* =============================================
   DASHBOARD
   ============================================= */
const Dashboard = {
  refresh() {
    this.renderStats();
    Tasks.renderDashboardUpcoming();
    Schedule.renderDashboardToday();
    this.renderGreeting();
  },

  renderGreeting() {
    const settings = Storage.getSettings();
    const name = settings.username || 'Student';
    const hour = new Date().getHours();
    let greet = 'Good Morning';
    if (hour >= 12 && hour < 17) greet = 'Good Afternoon';
    else if (hour >= 17) greet = 'Good Evening';

    const greetEl = document.getElementById('greetingText');
    const subEl   = document.getElementById('greetingSub');
    if (greetEl) greetEl.textContent = `${greet}, ${name}!`;
    if (subEl)   subEl.textContent   = 'Ready to be productive today?';

    const dateEl = document.getElementById('dateBadge');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
    }
  },

  renderStats() {
    const container = document.getElementById('dashboardStats');
    if (!container) return;
    const ts = Tasks.getStats();
    const ss = Storage.getSessions();
    const totalMin   = ss.totalMinutes || 0;
    const hours      = Math.floor(totalMin / 60);
    const mins       = totalMin % 60;
    const studyLabel = hours > 0 ? `${hours}h ${mins}m` : `${totalMin}m`;

    container.innerHTML = `
      ${statCard('📋', ts.total,               'Total Tasks',    '#4f6ef7')}
      ${statCard('✅', ts.completed,           'Completed',      '#22c55e')}
      ${statCard('⏳', ts.pending,             'Pending',        '#f59e0b')}
      ${statCard('🎯', ss.totalSessions || 0, 'Focus Sessions', '#7c5cd8')}
      ${progressCard(ts.progress, studyLabel)}
    `;
  },
};

function statCard(icon, value, label, color) {
  return `
    <div class="sf-card hover:shadow-md transition-shadow cursor-default">
      <div class="text-3xl mb-2">${icon}</div>
      <div class="text-3xl font-bold leading-none mb-1" style="color:${color}">${value}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">${label}</div>
    </div>`;
}

function progressCard(pct, studyTime) {
  return `
    <div class="sf-card hover:shadow-md transition-shadow cursor-default">
      <div class="text-3xl mb-2">📈</div>
      <div class="text-3xl font-bold leading-none mb-1 text-[#4f6ef7]">${pct}%</div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Progress</div>
      <div class="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div class="h-full rounded-full bg-[#4f6ef7] transition-all duration-700" style="width:${pct}%"></div>
      </div>
      <div class="text-xs text-gray-400 mt-2">Study: ${studyTime}</div>
    </div>`;
}

/* =============================================
   SETTINGS
   ============================================= */
const Settings = {
  load() {
    const s = Storage.getSettings();
    const usernameEl = document.getElementById('settingsUsername');
    const darkEl     = document.getElementById('darkModeToggle');
    if (usernameEl) usernameEl.value = s.username || '';
    if (darkEl) darkEl.checked = s.darkMode || false;
  },

  save() {
    const username = document.getElementById('settingsUsername')?.value.trim() || 'Student';
    const current  = Storage.getSettings();
    Storage.setSettings({ ...current, username });
    Dashboard.renderGreeting();
    showToast('Settings saved', 'success');
  },

  toggleDark(isDark) {
    const current = Storage.getSettings();
    Storage.setSettings({ ...current, darkMode: isDark });
    applyTheme(isDark);
    // Update icon/label
    const icon  = document.querySelector('.theme-icon');
    const label = document.querySelector('.theme-label');
    if (icon)  icon.textContent  = isDark ? '☀️' : '🌙';
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    const mobileBtn = document.getElementById('themeToggleMobile');
    if (mobileBtn) mobileBtn.textContent = isDark ? '☀️' : '🌙';
  },

  setupListeners() {
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => Settings.save());

    document.getElementById('darkModeToggle')?.addEventListener('change', (e) => {
      Settings.toggleDark(e.target.checked);
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const current = Storage.getSettings();
      const newDark = !current.darkMode;
      const darkEl = document.getElementById('darkModeToggle');
      if (darkEl) darkEl.checked = newDark;
      Settings.toggleDark(newDark);
    });

    document.getElementById('themeToggleMobile')?.addEventListener('click', () => {
      const current = Storage.getSettings();
      const newDark = !current.darkMode;
      const darkEl = document.getElementById('darkModeToggle');
      if (darkEl) darkEl.checked = newDark;
      Settings.toggleDark(newDark);
    });

    document.getElementById('clearCompletedBtn')?.addEventListener('click', () => {
      showConfirm('Clear Completed Tasks?', 'All completed tasks will be removed.', () => {
        Tasks.clearCompleted();
        showToast('Completed tasks cleared', 'info');
        Tasks.render();
        Dashboard.refresh();
      });
    });

    document.getElementById('resetDataBtn')?.addEventListener('click', () => {
      showConfirm('Reset All Data?', 'This will permanently delete ALL your data and cannot be undone.', () => {
        Storage.resetAll();
        location.reload();
      });
    });
  },
};

/* =============================================
   THEME — Tailwind uses .dark on <html>
   ============================================= */
function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/* =============================================
   MODAL HELPERS (global)
   ============================================= */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  // Focus first focusable element
  const focusable = el.querySelectorAll('input, select, textarea, button:not(.sf-modal-close)');
  setTimeout(() => { if (focusable.length) focusable[0].focus(); }, 50);
}

function closeModalById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['taskModal', 'scheduleModal'].forEach(id => closeModalById(id));
  }
});

/* =============================================
   CONFIRM DIALOG (global)
   ============================================= */
let _confirmCallback = null;

function showConfirm(title, message, onConfirm) {
  document.getElementById('confirmTitle').textContent   = title;
  document.getElementById('confirmMessage').textContent = message;
  _confirmCallback = onConfirm;
  openModal('confirmModal');
}

function setupConfirmListeners() {
  document.getElementById('confirmOk')?.addEventListener('click', () => {
    closeModalById('confirmModal');
    if (typeof _confirmCallback === 'function') { _confirmCallback(); _confirmCallback = null; }
  });
  document.getElementById('confirmCancel')?.addEventListener('click', () => {
    closeModalById('confirmModal');
    _confirmCallback = null;
  });
  document.getElementById('confirmModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'confirmModal') { closeModalById('confirmModal'); _confirmCallback = null; }
  });
}

/* =============================================
   TOAST (global)
   ============================================= */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `sf-toast sf-toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3200);
}

/* =============================================
   MOBILE SIDEBAR
   ============================================= */
function setupMobileSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  hamburger?.addEventListener('click', () => {
    const isOpen = !sidebar?.classList.contains('-translate-x-full');
    if (isOpen) {
      sidebar?.classList.add('-translate-x-full');
      sidebar?.classList.remove('translate-x-0');
      overlay?.classList.add('hidden');
    } else {
      sidebar?.classList.remove('-translate-x-full');
      sidebar?.classList.add('translate-x-0', 'shadow-2xl');
      overlay?.classList.remove('hidden');
    }
  });

  overlay?.addEventListener('click', () => {
    sidebar?.classList.add('-translate-x-full');
    sidebar?.classList.remove('translate-x-0');
    overlay?.classList.add('hidden');
  });
}

/* =============================================
   APP INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme first (prevents flash)
  const savedSettings = Storage.getSettings();
  applyTheme(savedSettings.darkMode || false);

  // Init icon states
  const isDark = savedSettings.darkMode || false;
  const themeIcon  = document.querySelector('.theme-icon');
  const themeLabel = document.querySelector('.theme-label');
  const mobileThemeBtn = document.getElementById('themeToggleMobile');
  if (themeIcon)  themeIcon.textContent  = isDark ? '☀️' : '🌙';
  if (themeLabel) themeLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  if (mobileThemeBtn) mobileThemeBtn.textContent = isDark ? '☀️' : '🌙';

  // Init modules
  Tasks.init();
  Schedule.init();
  Timer.init();

  // Setup all listeners
  Tasks.setupListeners();
  Schedule.setupListeners();
  Settings.setupListeners();
  setupConfirmListeners();
  setupMobileSidebar();
  Nav.setupListeners();

  // Initial page render
  Dashboard.refresh();
});
