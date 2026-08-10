/* =============================================
   SCHEDULE.JS — Weekly schedule management
   ============================================= */

const Schedule = (() => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let items = [];
  let activeDay = getCurrentDay();
  let editingId = null;

  function generateId() {
    return 'sch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }
  function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  function load() { items = Storage.getSchedule(); }
  function save() { Storage.setSchedule(items); }

  function seedDemo() {
    items = [
      { id: generateId(), subject: 'Web Programming',    day: 'Monday',    start: '08:00', end: '10:00', note: 'Lab praktikum' },
      { id: generateId(), subject: 'Mathematics',        day: 'Monday',    start: '13:00', end: '15:00', note: 'Kelas reguler' },
      { id: generateId(), subject: 'Database Systems',   day: 'Tuesday',   start: '09:00', end: '11:00', note: 'Dr. Ahmad' },
      { id: generateId(), subject: 'Artificial Intelligence', day: 'Wednesday', start: '07:00', end: '09:00', note: '' },
      { id: generateId(), subject: 'Computer Networks',  day: 'Thursday',  start: '10:00', end: '12:00', note: 'Praktikum Cisco' },
      { id: generateId(), subject: 'Software Engineering', day: 'Friday',  start: '08:00', end: '10:00', note: '' },
    ];
    save();
  }

  function init() {
    load();
    // Seed hanya jika BENAR-BENAR kosong
    if (items.length === 0) seedDemo();
    activeDay = getCurrentDay();
  }

  /* ---- CRUD ---- */
  function add(data) {
    const item = { id: generateId(), ...data };
    items.push(item);
    save();
    return item;
  }
  function update(id, data) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data };
    save();
    return items[idx];
  }
  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
  }
  function getByDay(day) {
    return items
      .filter(i => i.day === day)
      .sort((a, b) => a.start.localeCompare(b.start));
  }
  function getTodayItems() { return getByDay(getCurrentDay()); }

  /* ---- Rendering ---- */
  function renderDayTabs() {
    const container = document.getElementById('dayTabs');
    if (!container) return;
    container.innerHTML = DAYS.map(d => `
      <button
        class="px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all
               ${d === activeDay
                 ? 'bg-[#4f6ef7] text-white border-[#4f6ef7]'
                 : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}"
        onclick="Schedule.setActiveDay('${d}')"
        role="tab" aria-selected="${d === activeDay}" aria-label="${d}">${d}</button>
    `).join('');
  }

  function renderScheduleList() {
    const container = document.getElementById('scheduleList');
    if (!container) return;
    const dayItems = getByDay(activeDay);

    if (dayItems.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-gray-400">
          <div class="text-5xl mb-4 opacity-50">📅</div>
          <div class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No schedule for ${activeDay}</div>
          <div class="text-sm mb-5">Add a study session for this day.</div>
          <button class="sf-btn-primary" onclick="Schedule.openAddModal()">+ Add Schedule</button>
        </div>`;
      return;
    }
    container.innerHTML = `<div class="flex flex-col gap-3">${dayItems.map(scheduleCard).join('')}</div>`;
  }

  function scheduleCard(item) {
    return `
      <div class="sf-card flex items-center gap-4 hover:shadow-md transition-shadow" data-id="${item.id}">
        <div class="bg-indigo-50 dark:bg-indigo-900/30 text-[#4f6ef7] dark:text-indigo-400
                    px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap min-w-[110px] text-center">
          ${item.start} – ${item.end}
        </div>
        <div class="flex-1">
          <div class="text-[15px] font-semibold text-gray-900 dark:text-white mb-0.5">${escapeHtml(item.subject)}</div>
          ${item.note ? `<div class="text-sm text-gray-500 dark:text-gray-400">${escapeHtml(item.note)}</div>` : ''}
        </div>
        <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full
                     bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">${item.day}</span>
        <div class="flex gap-1.5">
          <button
            class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-400
                   hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300
                   dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400
                   flex items-center justify-center text-sm transition-all"
            onclick="Schedule.openEditModal('${item.id}')" aria-label="Edit schedule">✏️</button>
          <button
            class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-400
                   hover:bg-red-50 hover:text-red-500 hover:border-red-300
                   dark:hover:bg-red-900/30 dark:hover:text-red-400
                   flex items-center justify-center text-sm transition-all"
            onclick="Schedule.confirmDelete('${item.id}')" aria-label="Delete schedule">🗑️</button>
        </div>
      </div>`;
  }

  function render() {
    renderDayTabs();
    renderScheduleList();
  }

  function renderDashboardToday() {
    const container = document.getElementById('todaySchedule');
    if (!container) return;
    const todayItems = getTodayItems();
    if (todayItems.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-sm text-gray-400">No schedule for today</div>`;
      return;
    }
    container.innerHTML = todayItems.slice(0, 5).map(item => `
      <div class="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span class="text-xs text-gray-400 min-w-[90px]">${item.start} – ${item.end}</span>
        <span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">${escapeHtml(item.subject)}</span>
      </div>`).join('');
  }

  /* ---- Modal ---- */
  function openAddModal() {
    editingId = null;
    document.getElementById('scheduleModalTitle').textContent = 'Add Schedule';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value  = '';
    document.getElementById('scheduleDay').value = activeDay;
    clearFormErrors();
    openModal('scheduleModal');
  }

  function openEditModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('scheduleModalTitle').textContent = 'Edit Schedule';
    document.getElementById('scheduleId').value      = item.id;
    document.getElementById('scheduleSubject').value = item.subject || '';
    document.getElementById('scheduleDay').value     = item.day     || 'Monday';
    document.getElementById('scheduleStart').value   = item.start   || '';
    document.getElementById('scheduleEnd').value     = item.end     || '';
    document.getElementById('scheduleNote').value    = item.note    || '';
    clearFormErrors();
    openModal('scheduleModal');
  }

  function closeModal() { closeModalById('scheduleModal'); editingId = null; }

  function handleFormSubmit(e) {
    e.preventDefault();
    const subject = document.getElementById('scheduleSubject').value.trim();
    const start   = document.getElementById('scheduleStart').value;
    const end     = document.getElementById('scheduleEnd').value;
    let valid = true;
    clearFormErrors();

    if (!subject) {
      document.getElementById('scheduleSubjectError').textContent = 'Subject is required.';
      document.getElementById('scheduleSubject').classList.add('error');
      valid = false;
    }
    if (!start) {
      document.getElementById('scheduleStartError').textContent = 'Start time is required.';
      document.getElementById('scheduleStart').classList.add('error');
      valid = false;
    }
    if (!end) {
      document.getElementById('scheduleEndError').textContent = 'End time is required.';
      document.getElementById('scheduleEnd').classList.add('error');
      valid = false;
    }
    if (start && end && start >= end) {
      document.getElementById('scheduleEndError').textContent = 'End time must be after start time.';
      document.getElementById('scheduleEnd').classList.add('error');
      valid = false;
    }
    if (!valid) return;

    const data = {
      subject,
      day:  document.getElementById('scheduleDay').value,
      start,
      end,
      note: document.getElementById('scheduleNote').value.trim(),
    };

    if (editingId) {
      update(editingId, data);
      showToast('Schedule updated successfully', 'success');
    } else {
      add(data);
      showToast('Schedule added successfully ✨', 'success');
    }
    closeModal();
    render();
    renderDashboardToday();
  }

  function confirmDelete(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    showConfirm(`Delete "${item.subject}"?`, 'This schedule will be removed.', () => {
      remove(id);
      showToast('Schedule deleted', 'info');
      render();
      renderDashboardToday();
    });
  }

  function setActiveDay(day) {
    activeDay = day;
    render();
  }

  function clearFormErrors() {
    ['scheduleSubjectError', 'scheduleStartError', 'scheduleEndError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    ['scheduleSubject', 'scheduleStart', 'scheduleEnd'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
  }

  function setupListeners() {
    document.getElementById('addScheduleBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeScheduleModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelScheduleBtn')?.addEventListener('click', closeModal);
    document.getElementById('scheduleForm')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('scheduleModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'scheduleModal') closeModal();
    });
  }

  return {
    init, render, renderDashboardToday,
    openAddModal, openEditModal, confirmDelete, setActiveDay,
    setupListeners, getTodayItems,
  };
})();
