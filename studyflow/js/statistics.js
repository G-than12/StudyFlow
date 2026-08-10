/* =============================================
   STATISTICS.JS — Statistics page rendering
   ============================================= */

const Statistics = (() => {

  function render() {
    const container = document.getElementById('statisticsContent');
    if (!container) return;

    const taskStats = Tasks.getStats();
    const sessions  = Storage.getSessions();

    const totalMinutes   = sessions.totalMinutes  || 0;
    const totalSessions  = sessions.totalSessions || 0;
    const hours          = Math.floor(totalMinutes / 60);
    const minutes        = totalMinutes % 60;
    const studyTimeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    const weeklyData     = getWeeklyData(sessions.weekly || {});
    const completionRate = taskStats.total > 0 ? taskStats.progress : 0;

    container.innerHTML = `
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        ${overviewCard('Total Study Time', studyTimeLabel, '#4f6ef7', '⏱️')}
        ${overviewCard('Focus Sessions',   totalSessions,  '#7c5cd8', '🎯')}
        ${overviewCard('Tasks Completed',  taskStats.completed, '#22c55e', '✅')}
        ${overviewCard('Completion Rate',  completionRate + '%', '#f59e0b', '📈')}
      </div>

      <!-- Weekly Chart -->
      <div class="sf-card mb-6">
        <div class="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">📊 Weekly Focus Sessions</div>
        ${renderBarChart(weeklyData)}
        ${weeklyData.every(d => d.value === 0)
          ? `<div class="text-center py-4 text-sm text-gray-400">No sessions this week. Start your first focus session!</div>`
          : ''}
      </div>

      <!-- Two column breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="sf-card">
          <div class="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">📋 Task Breakdown</div>
          ${renderTaskBreakdown(taskStats)}
        </div>
        <div class="sf-card">
          <div class="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">🏷️ Priority Distribution</div>
          ${renderPriorityBreakdown()}
        </div>
      </div>
    `;
  }

  function overviewCard(label, value, color, icon) {
    return `
      <div class="sf-card hover:shadow-md transition-shadow">
        <div class="text-2xl mb-2">${icon}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">${label}</div>
        <div class="text-2xl font-bold" style="color:${color}">${value}</div>
      </div>`;
  }

  function getWeeklyData(weekly) {
    const days    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayNums = [1, 2, 3, 4, 5, 6, 0];
    const today   = new Date();
    return days.map((label, i) => {
      const d    = new Date(today);
      const diff = dayNums[i] - today.getDay();
      d.setDate(today.getDate() + diff - (diff > 0 ? 7 : 0));
      const key  = d.toISOString().split('T')[0];
      return { label, value: weekly[key] || 0 };
    });
  }

  function renderBarChart(data) {
    const MAX_H = 120;
    const max   = Math.max(...data.map(d => d.value), 1);
    return `
      <div class="flex items-end gap-2 h-[160px] px-1">
        ${data.map(d => {
          const h = Math.max(Math.round((d.value / max) * MAX_H), 3);
          return `
            <div class="flex flex-col items-center gap-1 flex-1">
              <span class="text-[10px] text-gray-400">${d.value > 0 ? d.value : ''}</span>
              <div class="w-full rounded-t-md bg-[#4f6ef7] hover:bg-[#3b5be0] transition-colors"
                   style="height:${h}px" title="${d.value} session(s)"></div>
              <span class="text-[10px] text-gray-500 dark:text-gray-400">${d.label}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  function renderTaskBreakdown(stats) {
    const total = stats.total || 1;
    const rows = [
      { label: 'Completed',   count: stats.completed,                      color: '#22c55e', pct: Math.round((stats.completed / total) * 100) },
      { label: 'In Progress', count: stats.inProgress,                     color: '#4f6ef7', pct: Math.round((stats.inProgress / total) * 100) },
      { label: 'Todo',        count: stats.pending - stats.inProgress,     color: '#9ca3af', pct: Math.round(((stats.pending - stats.inProgress) / total) * 100) },
    ];
    return breakdownRows(rows);
  }

  function renderPriorityBreakdown() {
    const allTasks = Tasks.getAll();
    const total = allTasks.length || 1;
    const high   = allTasks.filter(t => t.priority === 'high').length;
    const medium = allTasks.filter(t => t.priority === 'medium').length;
    const low    = allTasks.filter(t => t.priority === 'low').length;
    const rows = [
      { label: 'High',   count: high,   color: '#ef4444', pct: Math.round((high   / total) * 100) },
      { label: 'Medium', count: medium, color: '#f59e0b', pct: Math.round((medium / total) * 100) },
      { label: 'Low',    count: low,    color: '#22c55e', pct: Math.round((low    / total) * 100) },
    ];
    return breakdownRows(rows);
  }

  function breakdownRows(rows) {
    return `
      <div class="flex flex-col gap-3">
        ${rows.map(r => `
          <div class="flex items-center gap-3">
            <span class="text-sm min-w-[80px] text-gray-700 dark:text-gray-300">${r.label}</span>
            <div class="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   style="width:${r.pct}%; background:${r.color}"></div>
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400 min-w-[24px] text-right">${r.count}</span>
          </div>`).join('')}
      </div>`;
  }

  return { render };
})();
