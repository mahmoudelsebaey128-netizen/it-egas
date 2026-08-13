// GasTrack / Jira Clone Application Engine

class GasTrackApp {
  constructor() {
    this.team = JSON.parse(localStorage.getItem('gt_team')) || INITIAL_TEAM;
    this.tasks = JSON.parse(localStorage.getItem('gt_tasks')) || INITIAL_TASKS;
    this.achievements = JSON.parse(localStorage.getItem('gt_achievements')) || INITIAL_ACHIEVEMENTS;
    this.activeTab = 'dashboard';
    this.activeFilters = {
      assignee: 'all',
      category: 'all',
      priority: 'all',
      search: ''
    };
    this.pendingCompletionTaskId = null;
    this.categoryChart = null;
    this.init();
  }

  init() {
    this.saveState();
    this.bindEvents();
    this.render();
    this.initLucideIcons();
  }

  saveState() {
    localStorage.setItem('gt_team', JSON.stringify(this.team));
    localStorage.setItem('gt_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('gt_achievements', JSON.stringify(this.achievements));
  }

  initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        this.setActiveTab(targetTab);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeBtn.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
          themeBtn.innerHTML = `<i data-lucide="moon" class="w-4 h-4 text-slate-700"></i><span class="text-xs text-slate-700">Dark</span>`;
        } else {
          themeBtn.innerHTML = `<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i><span class="text-xs text-slate-300">Light</span>`;
        }
        this.initLucideIcons();
      });
    }

    // Modal Triggers
    const createTaskBtn = document.getElementById('openCreateTaskModalBtn');
    if (createTaskBtn) {
      createTaskBtn.addEventListener('click', () => this.openCreateModal());
    }

    const closeCreateModalBtn = document.getElementById('closeCreateTaskModalBtn');
    if (closeCreateModalBtn) {
      closeCreateModalBtn.addEventListener('click', () => this.closeCreateModal());
    }

    const createTaskForm = document.getElementById('createTaskForm');
    if (createTaskForm) {
      createTaskForm.addEventListener('submit', (e) => this.handleCreateTask(e));
    }

    // Rating Modal
    const closeRatingModalBtn = document.getElementById('closeRatingModalBtn');
    if (closeRatingModalBtn) {
      closeRatingModalBtn.addEventListener('click', () => this.closeRatingModal());
    }

    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
      ratingForm.addEventListener('submit', (e) => this.handleRatingSubmit(e));
    }

    // Filter Listeners
    const searchInput = document.getElementById('filterSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.activeFilters.search = e.target.value.toLowerCase();
        this.renderActiveTab();
      });
    }

    const assigneeFilter = document.getElementById('filterAssigneeSelect');
    if (assigneeFilter) {
      assigneeFilter.addEventListener('change', (e) => {
        this.activeFilters.assignee = e.target.value;
        this.renderActiveTab();
      });
    }

    const categoryFilter = document.getElementById('filterCategorySelect');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.activeFilters.category = e.target.value;
        this.renderActiveTab();
      });
    }

    const priorityFilter = document.getElementById('filterPrioritySelect');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.activeFilters.priority = e.target.value;
        this.renderActiveTab();
      });
    }

    // Clear Filters
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.activeFilters = { assignee: 'all', category: 'all', priority: 'all', search: '' };
        if (searchInput) searchInput.value = '';
        if (assigneeFilter) assigneeFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        this.renderActiveTab();
      });
    }

    // Reset Data Button (Helper to re-seed)
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset application state to initial Jira dummy data?')) {
          localStorage.clear();
          this.team = INITIAL_TEAM;
          this.tasks = INITIAL_TASKS;
          this.achievements = INITIAL_ACHIEVEMENTS;
          this.init();
        }
      });
    }
  }

  setActiveTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('bg-blue-600/20', 'text-blue-400', 'border-l-4', 'border-blue-500');
        tab.classList.remove('text-slate-400', 'hover:bg-slate-800/50');
      } else {
        tab.classList.remove('bg-blue-600/20', 'text-blue-400', 'border-l-4', 'border-blue-500');
        tab.classList.add('text-slate-400', 'hover:bg-slate-800/50');
      }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
      activeContent.classList.remove('hidden');
      activeContent.classList.add('animate-fade-in');
    }

    this.renderActiveTab();
  }

  getFilteredTasks() {
    return this.tasks.filter(task => {
      const matchSearch = !this.activeFilters.search || 
        task.title.toLowerCase().includes(this.activeFilters.search) ||
        task.description.toLowerCase().includes(this.activeFilters.search) ||
        task.id.toLowerCase().includes(this.activeFilters.search);
      
      const matchAssignee = this.activeFilters.assignee === 'all' || task.assignee === this.activeFilters.assignee;
      const matchCategory = this.activeFilters.category === 'all' || task.category === this.activeFilters.category;
      const matchPriority = this.activeFilters.priority === 'all' || task.priority === this.activeFilters.priority;

      return matchSearch && matchAssignee && matchCategory && matchPriority;
    });
  }

  calculateMemberMetrics(memberName) {
    const memberTasks = this.tasks.filter(t => t.assignee === memberName);
    const totalAssigned = memberTasks.length;
    const completedTasks = memberTasks.filter(t => t.status === 'Done');
    const totalCompleted = completedTasks.length;
    
    const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
    
    // Average quality rating out of 10
    const ratedTasks = completedTasks.filter(t => t.rating !== null);
    const avgRating = ratedTasks.length > 0 
      ? ratedTasks.reduce((acc, t) => acc + (t.rating || 0), 0) / ratedTasks.length 
      : 0;

    // Efficiency Score formula: 50% completion rate + 50% quality score
    const qualityScorePercent = (avgRating / 10) * 100;
    const efficiencyScore = totalAssigned > 0 
      ? Math.round((completionRate * 0.5) + (qualityScorePercent * 0.5))
      : 0;

    // Category breakdown
    const categoryCounts = {
      'Cyber Security': 0,
      'AI': 0,
      'Training Communication': 0,
      'Software': 0
    };

    completedTasks.forEach(t => {
      if (categoryCounts[t.category] !== undefined) {
        categoryCounts[t.category]++;
      }
    });

    return {
      totalAssigned,
      totalCompleted,
      completionRate: Math.round(completionRate),
      avgRating: avgRating.toFixed(1),
      efficiencyScore,
      categoryCounts
    };
  }

  calculateOverallStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'In Progress').length;
    const inReviewTasks = this.tasks.filter(t => t.status === 'In Review').length;
    
    // Aggregate efficiency
    let totalEfficiencySum = 0;
    this.team.forEach(m => {
      const metrics = this.calculateMemberMetrics(m.name);
      totalEfficiencySum += metrics.efficiencyScore;
    });

    const overallEfficiency = this.team.length > 0 
      ? Math.round(totalEfficiencySum / this.team.length)
      : 0;

    // Category Distribution
    const catCounts = {
      'Cyber Security': 0,
      'AI': 0,
      'Training Communication': 0,
      'Software': 0
    };

    this.tasks.forEach(t => {
      if (catCounts[t.category] !== undefined) {
        catCounts[t.category]++;
      }
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      inReviewTasks,
      overallEfficiency,
      catCounts
    };
  }

  render() {
    this.populateFilterDropdowns();
    this.renderActiveTab();
  }

  populateFilterDropdowns() {
    const assigneeSelect = document.getElementById('filterAssigneeSelect');
    if (assigneeSelect && assigneeSelect.options.length <= 1) {
      this.team.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        assigneeSelect.appendChild(opt);
      });
    }

    const taskAssigneeSelect = document.getElementById('taskAssigneeSelect');
    if (taskAssigneeSelect && taskAssigneeSelect.options.length <= 1) {
      this.team.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = `${m.name} (${m.role})`;
        taskAssigneeSelect.appendChild(opt);
      });
    }
  }

  renderActiveTab() {
    if (this.activeTab === 'dashboard') {
      this.renderDashboard();
    } else if (this.activeTab === 'kanban') {
      this.renderKanbanBoard();
    } else if (this.activeTab === 'team') {
      this.renderTeamPerformance();
    } else if (this.activeTab === 'achievements') {
      this.renderAchievements();
    }
    this.initLucideIcons();
  }

  /* --- 1. EXECUTIVE DASHBOARD TAB --- */
  renderDashboard() {
    const stats = this.calculateOverallStats();
    
    document.getElementById('dashOverallEfficiency').textContent = `${stats.overallEfficiency}%`;
    document.getElementById('dashTotalTasks').textContent = stats.totalTasks;
    document.getElementById('dashCompletedTasks').textContent = stats.completedTasks;
    document.getElementById('dashInProgressTasks').textContent = stats.inProgressTasks + stats.inReviewTasks;

    // Render Category Distribution Progress Bars
    const catContainer = document.getElementById('dashCategoryProgressContainer');
    if (catContainer) {
      catContainer.innerHTML = '';
      Object.keys(CATEGORIES).forEach(catKey => {
        const catObj = CATEGORIES[catKey];
        const count = stats.catCounts[catKey] || 0;
        const pct = stats.totalTasks > 0 ? Math.round((count / stats.totalTasks) * 100) : 0;

        catContainer.innerHTML += `
          <div class="space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="font-medium text-slate-300 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${catObj.color}"></span>
                ${catKey}
              </span>
              <span class="font-semibold text-slate-400">${count} tasks (${pct}%)</span>
            </div>
            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${catObj.color}"></div>
            </div>
          </div>
        `;
      });
    }

    // Top Performers Leaderboard
    const leaderboardContainer = document.getElementById('dashLeaderboardContainer');
    if (leaderboardContainer) {
      leaderboardContainer.innerHTML = '';
      
      const memberStats = this.team.map(m => ({
        ...m,
        metrics: this.calculateMemberMetrics(m.name)
      })).sort((a, b) => b.metrics.efficiencyScore - a.metrics.efficiencyScore);

      memberStats.forEach((m, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        leaderboardContainer.innerHTML += `
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 transition">
            <div class="flex items-center gap-3">
              <span class="font-bold text-sm text-slate-400 w-6 text-center">${medal}</span>
              <img src="${m.avatar}" class="w-9 h-9 rounded-full object-cover border border-slate-700" alt="${m.name}">
              <div>
                <h4 class="font-semibold text-sm text-slate-200">${m.name}</h4>
                <p class="text-xs text-slate-400">${m.role}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-blue-400">${m.metrics.efficiencyScore}% Efficiency</div>
              <div class="text-xs text-slate-500">${m.metrics.totalCompleted}/${m.metrics.totalAssigned} Tasks (${m.metrics.avgRating}/10 Quality)</div>
            </div>
          </div>
        `;
      });
    }

    // Chart.js Category Breakdown Donut Chart
    this.renderCategoryChart(stats.catCounts);

    // Mini Activity Feed
    const feedContainer = document.getElementById('dashMiniAchievementFeed');
    if (feedContainer) {
      feedContainer.innerHTML = '';
      const recent = this.achievements.slice(0, 5);
      if (recent.length === 0) {
        feedContainer.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-4">No completed task achievements logged yet.</p>`;
      } else {
        recent.forEach(ach => {
          const catObj = CATEGORIES[ach.category] || { badgeBg: 'bg-slate-700 text-slate-300' };
          feedContainer.innerHTML += `
            <div class="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs">
              <div class="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 shrink-0"></div>
              <div class="space-y-0.5 flex-1">
                <p class="text-slate-300 font-medium">
                  <strong class="text-blue-400">${ach.assignee}</strong> completed 
                  <span class="text-slate-100 font-semibold">"${ach.taskTitle}"</span>
                </p>
                <div class="flex items-center gap-2 pt-1">
                  <span class="jira-badge ${catObj.badgeBg}">${ach.category}</span>
                  <span class="text-emerald-400 font-bold">★ ${ach.rating}/10 Score</span>
                  <span class="text-slate-500 ml-auto">${ach.timestamp}</span>
                </div>
              </div>
            </div>
          `;
        });
      }
    }
  }

  renderCategoryChart(catCounts) {
    const canvas = document.getElementById('categoryDistributionChart');
    if (!canvas) return;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const labels = Object.keys(catCounts);
    const dataValues = Object.values(catCounts);
    const bgColors = labels.map(l => CATEGORIES[l]?.color || '#94A3B8');

    this.categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: bgColors,
          borderColor: '#0F172A',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94A3B8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              padding: 14
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  /* --- 2. KANBAN BOARD TAB --- */
  renderKanbanBoard() {
    const filteredTasks = this.getFilteredTasks();
    const columns = {
      'To Do': document.getElementById('col-todo'),
      'In Progress': document.getElementById('col-in-progress'),
      'In Review': document.getElementById('col-in-review'),
      'Done': document.getElementById('col-done')
    };

    // Column Counters
    const counts = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0 };

    Object.keys(columns).forEach(colName => {
      if (columns[colName]) {
        columns[colName].innerHTML = '';
      }
    });

    filteredTasks.forEach(task => {
      const colKey = task.status === 'Backlog / To Do' ? 'To Do' : task.status;
      const targetCol = columns[colKey] || columns['To Do'];
      if (counts[colKey] !== undefined) counts[colKey]++;

      const memberObj = this.team.find(m => m.name === task.assignee) || { avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' };
      const catObj = CATEGORIES[task.category] || { badgeBg: 'bg-slate-700 text-slate-200' };

      const priorityClass = task.priority === 'High' ? 'priority-high' : task.priority === 'Medium' ? 'priority-medium' : 'priority-low';

      const taskCard = document.createElement('div');
      taskCard.className = 'task-card glass-card p-3.5 rounded-xl border border-slate-700/80 mb-3 text-xs space-y-2.5 animate-fade-in';
      taskCard.setAttribute('draggable', 'true');
      taskCard.dataset.taskId = task.id;

      taskCard.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="jira-badge ${catObj.badgeBg}">${task.category}</span>
          <span class="jira-badge ${priorityClass}">${task.priority}</span>
        </div>
        <div>
          <h4 class="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">${task.title}</h4>
          <p class="text-slate-400 mt-1 line-clamp-2">${task.description}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div class="flex items-center gap-2">
            <img src="${memberObj.avatar}" class="w-6 h-6 rounded-full object-cover border border-slate-600" title="${task.assignee}" alt="${task.assignee}">
            <span class="font-medium text-slate-300 text-xs">${task.assignee}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>Weight: <strong class="text-amber-400">${task.qualityWeight}/10</strong></span>
          </div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>${task.id}</span>
          <span>Due: ${task.dueDate}</span>
        </div>
        <div class="pt-1 flex justify-end gap-1.5">
          <select class="quick-status-select bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[11px] outline-none" data-task-id="${task.id}">
            <option value="To Do" ${task.status === 'To Do' || task.status === 'Backlog / To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="In Review" ${task.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
          </select>
        </div>
      `;

      // Drag and Drop events
      taskCard.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        taskCard.classList.add('dragging');
      });

      taskCard.addEventListener('dragend', () => {
        taskCard.classList.remove('dragging');
      });

      if (targetCol) {
        targetCol.appendChild(taskCard);
      }
    });

    // Update Headers Counter Badges
    document.getElementById('count-todo').textContent = counts['To Do'];
    document.getElementById('count-in-progress').textContent = counts['In Progress'];
    document.getElementById('count-in-review').textContent = counts['In Review'];
    document.getElementById('count-done').textContent = counts['Done'];

    // Column Drag and Drop Handlers
    document.querySelectorAll('.kanban-column-body').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.parentElement.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.parentElement.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.parentElement.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = col.dataset.status;
        this.updateTaskStatus(taskId, newStatus);
      });
    });

    // Quick Select Listener
    document.querySelectorAll('.quick-status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const taskId = e.target.dataset.taskId;
        const newStatus = e.target.value;
        this.updateTaskStatus(taskId, newStatus);
      });
    });
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (newStatus === 'Done' && task.status !== 'Done') {
      // Trigger Manager Quality Evaluation Modal before setting Done
      this.openRatingModal(task);
      return;
    }

    task.status = newStatus;
    this.saveState();
    this.renderActiveTab();
  }

  /* --- 3. TEAM MEMBERS & EFFICIENCY TAB --- */
  renderTeamPerformance() {
    const container = document.getElementById('teamCardsGrid');
    if (!container) return;

    container.innerHTML = '';

    this.team.forEach(member => {
      const metrics = this.calculateMemberMetrics(member.name);
      
      let effColor = 'text-emerald-400';
      if (metrics.efficiencyScore < 60) effColor = 'text-rose-400';
      else if (metrics.efficiencyScore < 80) effColor = 'text-amber-400';

      container.innerHTML += `
        <div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-blue-500/50 transition">
          <div class="flex items-center gap-3.5">
            <img src="${member.avatar}" class="w-12 h-12 rounded-full object-cover border-2 border-blue-500/40" alt="${member.name}">
            <div>
              <h3 class="font-bold text-base text-slate-100">${member.name}</h3>
              <p class="text-xs text-slate-400">${member.role}</p>
              <p class="text-[11px] text-slate-500">${member.email}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span class="text-[11px] text-slate-400 block">Efficiency Rating</span>
              <span class="text-xl font-extrabold ${effColor}">${metrics.efficiencyScore}%</span>
            </div>
            <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span class="text-[11px] text-slate-400 block">Quality Avg</span>
              <span class="text-xl font-extrabold text-amber-400">${metrics.avgRating}/10</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Task Completion</span>
              <span class="font-semibold text-slate-200">${metrics.totalCompleted} / ${metrics.totalAssigned} (${metrics.completionRate}%)</span>
            </div>
            <div class="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full bg-blue-500 rounded-full" style="width: ${metrics.completionRate}%"></div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/80 space-y-2">
            <span class="text-[11px] font-semibold text-slate-400 block">Completed Work by Category:</span>
            <div class="grid grid-cols-2 gap-1.5 text-[11px]">
              <div class="flex items-center justify-between px-2 py-1 rounded bg-rose-500/10 text-rose-300">
                <span>Cyber</span>
                <span class="font-bold">${metrics.categoryCounts['Cyber Security']}</span>
              </div>
              <div class="flex items-center justify-between px-2 py-1 rounded bg-purple-500/10 text-purple-300">
                <span>AI</span>
                <span class="font-bold">${metrics.categoryCounts['AI']}</span>
              </div>
              <div class="flex items-center justify-between px-2 py-1 rounded bg-amber-500/10 text-amber-300">
                <span>Training</span>
                <span class="font-bold">${metrics.categoryCounts['Training Communication']}</span>
              </div>
              <div class="flex items-center justify-between px-2 py-1 rounded bg-blue-500/10 text-blue-300">
                <span>Software</span>
                <span class="font-bold">${metrics.categoryCounts['Software']}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  /* --- 4. ACHIEVEMENT HISTORY LOG TAB --- */
  renderAchievements() {
    const listContainer = document.getElementById('achievementHistoryList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (this.achievements.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-slate-500">
          <i data-lucide="award" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p>No task completion achievements logged yet.</p>
        </div>
      `;
      return;
    }

    this.achievements.forEach(ach => {
      const catObj = CATEGORIES[ach.category] || { badgeBg: 'bg-slate-700 text-slate-200' };

      listContainer.innerHTML += `
        <div class="glass-card p-4 rounded-xl border border-slate-800 flex items-start gap-4 hover:border-emerald-500/40 transition">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
          </div>
          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <span class="jira-badge ${catObj.badgeBg}">${ach.category}</span>
              <span class="text-xs text-slate-500 font-mono">${ach.timestamp}</span>
            </div>
            <h4 class="font-semibold text-sm text-slate-100">
              <strong class="text-blue-400 font-bold">${ach.assignee}</strong> completed task 
              <span class="text-slate-200 font-semibold">"${ach.taskTitle}"</span> (${ach.taskId})
            </h4>
            <div class="flex items-center gap-4 pt-1 text-xs text-slate-400">
              <span>Manager Quality Score: <strong class="text-amber-400 font-bold">${ach.rating}/10</strong></span>
              <span>Expected Weight: <strong class="text-slate-300 font-medium">${ach.qualityWeight}/10</strong></span>
            </div>
          </div>
        </div>
      `;
    });
  }

  /* --- MANAGER MODALS & FORM LOGIC --- */
  openCreateModal() {
    const modal = document.getElementById('createTaskModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeCreateModal() {
    const modal = document.getElementById('createTaskModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  handleCreateTask(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitleInput').value.trim();
    const description = document.getElementById('taskDescInput').value.trim();
    const category = document.getElementById('taskCategorySelect').value;
    const assignee = document.getElementById('taskAssigneeSelect').value;
    const priority = document.getElementById('taskPrioritySelect').value;
    const dueDate = document.getElementById('taskDueDateInput').value;
    const qualityWeight = parseInt(document.getElementById('taskWeightInput').value) || 5;

    if (!title || !category || !assignee || !dueDate) {
      alert('Please fill out all required fields.');
      return;
    }

    const nextIdNumber = this.tasks.length + 101;
    const newTask = {
      id: `GT-${nextIdNumber}`,
      title,
      description,
      category,
      assignee,
      priority,
      dueDate,
      qualityWeight,
      status: 'To Do',
      rating: null,
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: null
    };

    this.tasks.unshift(newTask);
    this.saveState();
    this.closeCreateModal();
    document.getElementById('createTaskForm').reset();
    this.renderActiveTab();
  }

  openRatingModal(task) {
    this.pendingCompletionTaskId = task.id;
    document.getElementById('ratingTaskTitle').textContent = `"${task.title}" (${task.id})`;
    document.getElementById('ratingAssignee').textContent = task.assignee;
    document.getElementById('ratingWeight').textContent = `${task.qualityWeight}/10`;

    const modal = document.getElementById('ratingModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeRatingModal() {
    this.pendingCompletionTaskId = null;
    const modal = document.getElementById('ratingModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  handleRatingSubmit(e) {
    e.preventDefault();
    if (!this.pendingCompletionTaskId) return;

    const task = this.tasks.find(t => t.id === this.pendingCompletionTaskId);
    if (!task) return;

    const rating = parseInt(document.getElementById('qualityRatingInput').value) || 10;
    
    task.status = 'Done';
    task.rating = rating;
    task.completedAt = new Date().toISOString().split('T')[0];

    // Log Achievement
    const newAchievement = {
      id: `ach-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      assignee: task.assignee,
      category: task.category,
      rating: rating,
      qualityWeight: task.qualityWeight,
      timestamp: new Date().toLocaleString()
    };

    this.achievements.unshift(newAchievement);
    this.saveState();
    this.closeRatingModal();

    // Trigger Confetti Cheer Animation
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    this.renderActiveTab();
  }
}

// Global App Instance Initializer
document.addEventListener('DOMContentLoaded', () => {
  window.app = new GasTrackApp();
});
