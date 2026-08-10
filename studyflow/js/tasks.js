/* =============================================
   TASKS.JS — Task CRUD + rendering
   ============================================= */

const Tasks = (() => {
  let tasks = [];
  let editingId = null;

  /* ---- Helpers ---- */
  function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }
  function priorityOrder(p) { return { high: 0, medium: 1, low: 2 }[p] ?? 1; }
  function isOverdue(deadline) {
    if (!deadline) return false;
    return new Date(deadline) < new Date(new Date().toDateString());
  }

  /* ---- Load / Save ---- */
  function load() { tasks = Storage.getTasks(); }
  function save()  { Storage.setTasks(tasks); }

  /* ---- Demo data (seed hanya jika localStorage kosong) ---- */
  function seedDemo() {
    const today  = new Date();
    const fmt    = (d) => d.toISOString().split('T')[0];
    const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

    tasks = [
      {
        id: generateId(), title: 'Belajar JavaScript',
        description: 'Pelajari konsep async/await, fetch, dan DOM manipulation.',
        category: 'Web Programming', deadline: addDays(3), priority: 'high', status: 'in-progress',
        created: new Date().toISOString(),
      },
      {
        id: generateId(), title: 'Membuat laporan AI',
        description: 'Tulis laporan tentang penerapan AI di bidang pendidikan.',
        category: 'Artificial Intelligence', deadline: addDays(7), priority: 'medium', status: 'todo',
        created: new Date().toISOString(),
      },
      {
        id: generateId(), title: 'Membaca materi database',
        description: 'Baca bab 5-7 tentang normalisasi database.',
        category: 'Database', deadline: addDays(-1), priority: 'low', status: 'completed',
        created: new Date().toISOString(),
      },
      {
        id: generateId(), title: 'Praktikum Jaringan Komputer',
        description: 'Konfigurasi routing statis di Cisco Packet Tracer.',
        category: 'Computer Networks', deadline: addDays(5), priority: 'high', status: 'todo',
        created: new Date().toISOString(),
      },
      {
        id: generateId(), title: 'Kuis Aljabar Linear',
        description: 'Persiapkan materi kuis bab 3 tentang transformasi linier.',
        category: 'Mathematics', deadline: addDays(2), priority: 'medium', status: 'todo',
        created: new Date().toISOString(),
      },
    ];
    save();
  }

  /* ---- Init ---- */
  function init() {
    load();
    // Seed hanya jika BENAR-BENAR kosong (user bisa tambah data baru bebas)
    if (tasks.length === 0) seedDemo();
  }

  /* ---- CRUD ---- */
  function add(data) {
    const task = { id: generateId(), ...data, created: new Date().toISOString() };
    tasks.push(task);
    save();
    return task;
  }

  function update(id, data) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...data };
    save();
    return tasks[idx];
  }

  function remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => t.status !== 'completed');
    save();
  }

  /* ---- Queries ---- */
  function getAll() { return [...tasks]; }

  function getFiltered({ search = '', status = '', priority = '', sort = 'deadline' } = {}) {
    let result = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }
    if (status)   result = result.filter(t => t.status === status);
    if (priority) result = result.filter(t => t.priority === priority);
    result.sort((a, b) => {
      if (sort === 'deadline') {
        if (!a.deadline) return 1; if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sort === 'priority') return priorityOrder(a.priority) - priorityOrder(b.priority);
      if (sort === 'created')  return new Date(b.created) - new Date(a.created);
      return 0;
    });
    return result;
  }

  function getStats() {
    const total      = tasks.length;
    const completed  = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending    = tasks.filter(t => t.status !== 'completed').length;
    const progress   = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, progress };
  }

  function getUpcoming(limit = 5) {
    const today = new Date(new Date().toDateString());
    return tasks
      .filter(t => t.status !== 'completed' && t.deadline && new Date(t.deadline) >= today)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, limit);
  }

  /* ---- Rendering ---- */
  function render() {
    const container = document.getElementById('taskList');
    if (!container) return;
    const search   = document.getElementById('taskSearch')?.value    || '';
    const status   = document.getElementById('filterStatus')?.value  || '';
    const priority = document.getElementById('filterPriority')?.value || '';
    const sort     = document.getElementById('sortTasks')?.value     || 'deadline';
    const list     = getFiltered({ search, status, priority, sort });

    if (list.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-gray-400">
          <div class="text-5xl mb-4 opacity-50">📝</div>
          <div class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No tasks found</div>
          <div class="text-sm mb-5">Create your first task and start studying.</div>
          <button class="sf-btn-primary" onclick="Tasks.openAddModal()">+ Add Task</button>
        </div>`;
      return;
    }
    container.innerHTML = `<div class="flex flex-col gap-3">${list.map(taskCard).join('')}</div>`;
  }

  function taskCard(t) {
    const overdue    = isOverdue(t.deadline) && t.status !== 'completed';
    const deadlineLabel = t.deadline
      ? `${overdue ? '⚠️ ' : '📅 '}${formatDate(t.deadline)}`
      : 'No deadline';
    const isCompleted = t.status === 'completed';

    // Priority badge styles
    const priStyle = {
      high:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      low:    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    }[t.priority] || '';

    // Status badge styles
    const statusStyle = {
      'todo':        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      'in-progress': 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      'completed':   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    }[t.status] || '';

    return `
      <div class="sf-card flex items-start gap-3.5 hover:shadow-md transition-shadow
                  ${isCompleted ? 'opacity-60' : ''}" data-id="${t.id}">
        <!-- Checkmark -->
        <button
          class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all
                 ${isCompleted
                   ? 'bg-green-500 border-green-500 text-white'
                   : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}"
          onclick="Tasks.toggleComplete('${t.id}')"
          aria-label="${isCompleted ? 'Mark as todo' : 'Mark as completed'}">
          ${isCompleted ? '✓' : ''}
        </button>

        <!-- Body -->
        <div class="flex-1 min-w-0">
          <div class="text-[15px] font-semibold mb-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}">
            ${escapeHtml(t.title)}
          </div>
          ${t.description ? `<div class="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">${escapeHtml(t.description)}</div>` : ''}
          <div class="flex flex-wrap gap-2 items-center">
            <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${priStyle}">${capitalize(t.priority)}</span>
            <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyle}">${statusLabel(t.status)}</span>
            ${t.category ? `<span class="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">${escapeHtml(t.category)}</span>` : ''}
            <span class="text-[12px] ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}">${deadlineLabel}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-1.5 flex-shrink-0">
          <button
            class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-400
                   hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300
                   dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400
                   flex items-center justify-center text-sm transition-all"
            onclick="Tasks.openEditModal('${t.id}')" aria-label="Edit task">✏️</button>
          <button
            class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-400
                   hover:bg-red-50 hover:text-red-500 hover:border-red-300
                   dark:hover:bg-red-900/30 dark:hover:text-red-400
                   flex items-center justify-center text-sm transition-all"
            onclick="Tasks.confirmDelete('${t.id}')" aria-label="Delete task">🗑️</button>
        </div>
      </div>`;
  }

  function renderDashboardUpcoming() {
    const container = document.getElementById('upcomingTasks');
    if (!container) return;
    const items = getUpcoming(5);
    if (items.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-sm text-gray-400">No upcoming tasks</div>`;
      return;
    }
    const dotColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    container.innerHTML = items.map(t => `
      <div class="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${dotColor[t.priority] || '#d1d5db'}"></span>
        <span class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">${escapeHtml(t.title)}</span>
        <span class="text-xs text-gray-400 whitespace-nowrap">${formatDate(t.deadline)}</span>
      </div>`).join('');
  }

  /* ---- Modal ---- */
  function openAddModal() {
    editingId = null;
    document.getElementById('taskModalTitle').textContent = 'Add Task';
    document.getElementById('taskForm').reset();
    clearFormErrors();
    openModal('taskModal');
  }

  function openEditModal(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    editingId = id;
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('taskTitle').value    = t.title       || '';
    document.getElementById('taskDesc').value     = t.description || '';
    document.getElementById('taskCategory').value = t.category    || '';
    document.getElementById('taskDeadline').value = t.deadline    || '';
    document.getElementById('taskPriority').value = t.priority    || 'medium';
    document.getElementById('taskStatus').value   = t.status      || 'todo';
    clearFormErrors();
    openModal('taskModal');
  }

  function closeModal() { closeModalById('taskModal'); editingId = null; }

  function handleFormSubmit(e) {
    e.preventDefault();
    const title    = document.getElementById('taskTitle').value.trim();
    const deadline = document.getElementById('taskDeadline').value;
    let valid = true;
    clearFormErrors();

    if (!title) {
      document.getElementById('taskTitleError').textContent = 'Title is required.';
      document.getElementById('taskTitle').classList.add('error');
      valid = false;
    }
    if (!deadline) {
      document.getElementById('taskDeadlineError').textContent = 'Deadline is required.';
      document.getElementById('taskDeadline').classList.add('error');
      valid = false;
    }
    if (!valid) return;

    const data = {
      title,
      description: document.getElementById('taskDesc').value.trim(),
      category:    document.getElementById('taskCategory').value.trim(),
      deadline,
      priority:    document.getElementById('taskPriority').value,
      status:      document.getElementById('taskStatus').value,
    };

    if (editingId) {
      update(editingId, data);
      showToast('Task updated successfully', 'success');
    } else {
      add(data);
      showToast('Task added successfully ✨', 'success');
    }

    closeModal();
    render();
    renderDashboardUpcoming();
    Dashboard.refresh();
  }

  function toggleComplete(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const newStatus = t.status === 'completed' ? 'todo' : 'completed';
    update(id, { status: newStatus });
    if (newStatus === 'completed') showToast('Task completed! 🎉', 'success');
    render();
    renderDashboardUpcoming();
    Dashboard.refresh();
  }

  function confirmDelete(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    showConfirm(`Delete "${t.title}"?`, 'This action cannot be undone.', () => {
      remove(id);
      showToast('Task deleted', 'info');
      render();
      renderDashboardUpcoming();
      Dashboard.refresh();
    });
  }

  function clearFormErrors() {
    ['taskTitleError', 'taskDeadlineError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    ['taskTitle', 'taskDeadline'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
  }

  /* ---- Setup event listeners ---- */
  function setupListeners() {
    document.getElementById('addTaskBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeTaskModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelTaskBtn')?.addEventListener('click', closeModal);
    document.getElementById('taskForm')?.addEventListener('submit', handleFormSubmit);
    ['taskSearch', 'filterStatus', 'filterPriority', 'sortTasks'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', render);
      document.getElementById(id)?.addEventListener('change', render);
    });
    document.getElementById('taskModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'taskModal') closeModal();
    });
  }

  return {
    init, render, renderDashboardUpcoming,
    openAddModal, openEditModal, toggleComplete, confirmDelete,
    getStats, getAll, clearCompleted, setupListeners,
  };
})();

/* ---- Utility helpers (shared globals) ---- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function statusLabel(s) {
  return { todo: 'Todo', 'in-progress': 'In Progress', completed: 'Completed' }[s] || s;
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
