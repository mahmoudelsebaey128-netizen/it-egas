const translations = {
    ar: {
        subHeader: "شركة إيجاس - IT",
        navBoard: "Dashboard",
        navReports: "التقارير والإحصائيات",
        navCategories: "إدارة التصنيفات",
        navTeam: "إدارة الفريق",
        leaderRole: "قائد الفريق (Admin)",
        titleBoard: "Dashboard",
        titleReports: "تقارير الأداء ومتابعة تسليمات الموظفين",
        titleCategories: "إدارة وتعديل التصنيفات (Categories)",
        titleTeam: "إدارة أعضاء فريق تكنولوجيا المعلومات",
        addTaskBtn: "إضافة مهمة جديدة",
        colTodo: "قيد الانتظار (To Do)",
        colInProgress: "قيد التنفيذ (In Progress)",
        colReview: "للمراجعة (Review)",
        colDone: "مكتملة (Done)",
        statTotal: "إجمالي المهام",
        statDone: "المهام المكتملة",
        statPending: "المهام المتبقية",
        statRate: "نسبة الانجاز الكلية",
        chartStatusTitle: "توزيع حالات المهام",
        chartMemberTitle: "إنجاز المهام لكل موظف",
        tableTitle: "تقرير أداء أعضاء تيم IT - شركة EGAS",
        thMember: "الموظف",
        thRole: "المسمى الوظيفي",
        thTotal: "المهام المسندة",
        thDone: "تم التسليم",
        thProgress: "قيد التنفيذ",
        thRate: "نسبة الإنجاز",
        catTitle: "إدارة التصنيفات (Categories)",
        catSub: "إضافة وتعديل مجالات العمل في القسم.",
        btnAdd: "إضافة",
        teamTitle: "إدارة أعضاء الفريق (EGAS IT Members)",
        btnAddMember: "إضافة موظف",
        modalAddTaskTitle: "إضافة مهمة جديدة",
        lblTaskTitle: "عنوان المهمة",
        lblCat: "التصنيف",
        lblAssignee: "الموظف المسؤول",
        lblDate: "تاريخ الاستحقاق",
        btnCreateTask: "إنشاء المهمة",
        notifTitle: "التنبيهات والمهام المطلوبة"
    },
    en: {
        subHeader: "EGAS Holding Company",
        navBoard: "Dashboard",
        navReports: "Reports & Analytics",
        navCategories: "Manage Categories",
        navTeam: "Team Management",
        leaderRole: "Team Leader & Admin",
        titleBoard: "Dashboard",
        titleReports: "Employee Performance & Delivery Reports",
        titleCategories: "Manage Category Domains",
        titleTeam: "IT Team Members Management",
        addTaskBtn: "Add New Task",
        colTodo: "To Do",
        colInProgress: "In Progress",
        colReview: "Under Review",
        colDone: "Done",
        statTotal: "Total Tasks",
        statDone: "Completed Tasks",
        statPending: "Pending Tasks",
        statRate: "Overall Success Rate",
        chartStatusTitle: "Task Status Distribution",
        chartMemberTitle: "Completed Tasks per Member",
        tableTitle: "EGAS IT Team Performance Report",
        thMember: "Employee",
        thRole: "Role Title",
        thTotal: "Assigned Tasks",
        thDone: "Delivered",
        thProgress: "In Progress",
        thRate: "Completion Rate",
        catTitle: "Category Management",
        catSub: "Add/Remove department work categories.",
        btnAdd: "Add Category",
        teamTitle: "EGAS IT Team Management",
        btnAddMember: "Add Employee",
        modalAddTaskTitle: "Create New Issue",
        lblTaskTitle: "Task Title",
        lblCat: "Category",
        lblAssignee: "Assignee",
        lblDate: "Due Date",
        btnCreateTask: "Create Task",
        notifTitle: "Notifications & Action Items"
    }
};

const defaultTeam = ["Islam Elkady (Leader)", "Mohamed", "Marwa", "Sherief", "Sohila", "Maghraby", "Mamdouh"];
const defaultCategories = ["AI", "Training", "Communication", "Cyber Security"];

let state = {
    tasks: JSON.parse(localStorage.getItem('egas_tasks')) || [
        { id: 1, title: "تطوير نموذج الذكاء الاصطناعي لتحليل بيانات الغاز", category: "AI", assignee: "Mohamed", status: "in_progress", date: "2026-08-25" },
        { id: 2, title: "فحص الاختراق الدوري لشبكة EGAS", category: "Cyber Security", assignee: "Sherief", status: "todo", date: "2026-08-30" },
        { id: 3, title: "دورة تدريبية للعاملين على الأمن السيبراني", category: "Training", assignee: "Marwa", status: "review", date: "2026-08-22" },
        { id: 4, title: "ترقية أجهزة السويتشات بسنترال الشركة", category: "Communication", assignee: "Maghraby", status: "done", date: "2026-08-15" },
        { id: 5, title: "تعديل إعدادات Firewall الرئيسي", category: "Cyber Security", assignee: "Sohila", status: "in_progress", date: "2026-08-28" },
        { id: 6, title: "متابعة أجهزة الحسابات الجديدة", category: "Communication", assignee: "Mamdouh", status: "todo", date: "2026-08-29" }
    ],
    unreadNotifs: JSON.parse(localStorage.getItem('egas_notifs')) || [1, 2, 3, 5, 6],
    categories: JSON.parse(localStorage.getItem('egas_cats')) || defaultCategories,
    team: JSON.parse(localStorage.getItem('egas_team')) || defaultTeam,
    lang: localStorage.getItem('egas_lang') || 'ar',
    theme: localStorage.getItem('egas_theme') || 'light'
};

let statusChartObj = null;
let memberChartObj = null;

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        document.getElementById('user-display-name').innerText = currentUser;
        document.getElementById('user-avatar').innerText = currentUser.substring(0, 2).toUpperCase();
    }

    applyTheme(state.theme);
    applyLanguage(state.lang);
    renderAll();
});

function saveState() {
    localStorage.setItem('egas_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('egas_notifs', JSON.stringify(state.unreadNotifs));
    localStorage.setItem('egas_cats', JSON.stringify(state.categories));
    localStorage.setItem('egas_team', JSON.stringify(state.team));
    localStorage.setItem('egas_lang', state.lang);
    localStorage.setItem('egas_theme', state.theme);
}

function renderAll() {
    renderBoard();
    renderReports();
    renderCategories();
    renderTeam();
    updateSelects();
    updateNotifications();
    saveState();
}

function switchTab(tabId, element) {
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    element.classList.add('active');

    const keyMap = { board: 'titleBoard', reports: 'titleReports', categories: 'titleCategories', team: 'titleTeam' };
    const titleElem = document.getElementById('current-page-title');
    titleElem.setAttribute('data-key', keyMap[tabId]);
    titleElem.innerText = translations[state.lang][keyMap[tabId]];
}

function renderBoard() {
    const cols = { todo: [], in_progress: [], review: [], done: [] };
    state.tasks.forEach(task => { if (cols[task.status]) cols[task.status].push(task); });

    for (let key in cols) {
        const container = document.getElementById(`col-${key}`);
        document.getElementById(`count-${key}`).innerText = cols[key].length;
        container.innerHTML = '';

        cols[key].forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.draggable = true;
            card.ondragstart = (e) => e.dataTransfer.setData('text/plain', task.id);

            card.innerHTML = `
                <span class="task-tag">${task.category}</span>
                <div class="task-title">${task.title}</div>
                <div style="font-size: 12px; color: var(--text-sub); display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fa-regular fa-user"></i> ${task.assignee}</span>
                    <span><i class="fa-regular fa-clock"></i> ${task.date}</span>
                </div>
                <select class="status-select" onchange="changeTaskStatus(${task.id}, this.value)">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="review" ${task.status === 'review' ? 'selected' : ''}>Review</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                </select>
            `;
            container.appendChild(card);
        });
    }
}

function changeTaskStatus(id, newStatus) {
    const task = state.tasks.find(t => t.id == id);
    if (task) {
        task.status = newStatus;
        renderAll();
    }
}

function allowDrop(ev) { ev.preventDefault(); }
function drop(ev, newStatus) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData('text/plain');
    changeTaskStatus(taskId, newStatus);
}

function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('task-title-input').value;
    const category = document.getElementById('task-cat-select').value;
    const assignee = document.getElementById('task-assignee-select').value;
    const date = document.getElementById('task-date-input').value;

    const newId = Date.now();
    state.tasks.push({ id: newId, title, category, assignee, date, status: 'todo' });
    state.unreadNotifs.push(newId);

    closeModal('taskModal');
    document.getElementById('add-task-form').reset();
    renderAll();
}

function renderReports() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.status === 'done').length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-rate').innerText = `${rate}%`;

    const tbody = document.getElementById('team-report-body');
    tbody.innerHTML = '';

    state.team.forEach(member => {
        const memberTasks = state.tasks.filter(t => t.assignee === member);
        const memberDone = memberTasks.filter(t => t.status === 'done').length;
        const memberProgress = memberTasks.filter(t => t.status !== 'done').length;
        const memberRate = memberTasks.length > 0 ? Math.round((memberDone / memberTasks.length) * 100) : 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${member}</strong></td>
            <td>${member.includes('Leader') ? 'Team Leader' : 'IT Specialist'}</td>
            <td>${memberTasks.length}</td>
            <td style="color: #10b981; font-weight: bold;">${memberDone}</td>
            <td style="color: #f59e0b;">${memberProgress}</td>
            <td><strong>${memberRate}%</strong></td>
        `;
        tbody.appendChild(row);
    });

    renderCharts();
}

function renderCharts() {
    const statusCounts = {
        todo: state.tasks.filter(t => t.status === 'todo').length,
        in_progress: state.tasks.filter(t => t.status === 'in_progress').length,
        review: state.tasks.filter(t => t.status === 'review').length,
        done: state.tasks.filter(t => t.status === 'done').length
    };

    const memberLabels = state.team;
    const memberDoneData = state.team.map(m => state.tasks.filter(t => t.assignee === m && t.status === 'done').length);

    if (statusChartObj) statusChartObj.destroy();
    if (memberChartObj) memberChartObj.destroy();

    const ctx1 = document.getElementById('statusChart').getContext('2d');
    statusChartObj = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['To Do', 'In Progress', 'Review', 'Done'],
            datasets: [{
                data: [statusCounts.todo, statusCounts.in_progress, statusCounts.review, statusCounts.done],
                backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    const ctx2 = document.getElementById('memberChart').getContext('2d');
    memberChartObj = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: memberLabels,
            datasets: [{
                label: 'المهام المُنجزة (Done)',
                data: memberDoneData,
                backgroundColor: '#0284c7'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

function renderCategories() {
    const container = document.getElementById('categories-container-list');
    container.innerHTML = '';
    state.categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'item-row';
        li.innerHTML = `
            <span><i class="fa-solid fa-tag"></i> ${cat}</span>
            <button class="btn-delete" onclick="deleteCategory('${cat}')"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(li);
    });
}

function addCategory() {
    const val = document.getElementById('new-cat-input').value.trim();
    if (val && !state.categories.includes(val)) {
        state.categories.push(val);
        document.getElementById('new-cat-input').value = '';
        renderAll();
    }
}

function deleteCategory(cat) {
    state.categories = state.categories.filter(c => c !== cat);
    renderAll();
}

function renderTeam() {
    const container = document.getElementById('team-members-container-list');
    container.innerHTML = '';
    state.team.forEach(member => {
        const li = document.createElement('li');
        li.className = 'item-row';
        li.innerHTML = `
            <span><i class="fa-solid fa-user"></i> ${member}</span>
            ${!member.includes('Leader') ? `<button class="btn-delete" onclick="deleteTeamMember('${member}')"><i class="fa-solid fa-trash"></i></button>` : '<span style="font-size:11px; color:#10b981;">Admin Leader</span>'}
        `;
        container.appendChild(li);
    });
}

function addTeamMember() {
    const val = document.getElementById('new-member-name').value.trim();
    if (val && !state.team.includes(val)) {
        state.team.push(val);
        document.getElementById('new-member-name').value = '';
        renderAll();
    }
}

function deleteTeamMember(member) {
    state.team = state.team.filter(m => m !== member);
    renderAll();
}

function updateSelects() {
    const catSelect = document.getElementById('task-cat-select');
    const memberSelect = document.getElementById('task-assignee-select');
    
    catSelect.innerHTML = state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    memberSelect.innerHTML = state.team.map(m => `<option value="${m}">${m}</option>`).join('');
}

function updateNotifications() {
    document.getElementById('notif-count').innerText = state.unreadNotifs.length;
    const list = document.getElementById('notif-list');
    list.innerHTML = '';

    if (state.unreadNotifs.length === 0) {
        list.innerHTML = '<p style="text-align:center; color: var(--text-sub);">لا توجد إشعارات غير مقروءة!</p>';
    } else {
        state.unreadNotifs.forEach(id => {
            const task = state.tasks.find(t => t.id == id);
            if (task) {
                const item = document.createElement('div');
                item.className = 'notif-item';
                item.onclick = () => readNotification(task.id);
                item.innerHTML = `
                    <strong>${task.title}</strong>
                    <div style="font-size:11px; color: var(--text-sub);">المسؤول: ${task.assignee} | الموعد: ${task.date}</div>
                    <span style="font-size:10px; color: #3b82f6;">(اضغط للتحديد كمعلم/مقروء)</span>
                `;
                list.appendChild(item);
            }
        });
    }
}

function readNotification(id) {
    state.unreadNotifs = state.unreadNotifs.filter(nId => nId != id);
    renderAll();
}

function toggleNotifications() { openModal('notifModal'); }

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    saveState();
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-icon').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function toggleLanguage() {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    applyLanguage(state.lang);
    saveState();
    renderAll();
}

function applyLanguage(lang) {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// تسجيل الخروج المباشر
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = './login.html';
}
// ==========================================
// كود تشغيل اللوج أوت والتابات المباشر على تصميمك القديم
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    
    // 1. تشغيل اللوج أوت
    document.addEventListener("click", function (e) {
        // بيبحث عن أي عنصر مكتوب عليه logout أو خروج أو محطوط عليه class/id اللوج أوت
        const target = e.target.closest("#logoutBtn, .logout-btn, [onclick*='logout'], a[href*='login']");
        
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            
            // مسح الكاش والبيانات
            localStorage.clear();
            sessionStorage.clear();
            
            alert("تم تسجيل الخروج بنجاح");
            
            // تحويل لصفحة اللوجن أو إعادة تحميل الصفحة
            window.location.href = "login.html";
        }
    });

    // 2. ضمان عمل التنقل بين التابات
    const navButtons = document.querySelectorAll("[data-tab], .sidebar li, .nav-link");
    navButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");
            if (tabId) {
                // إخفاء كل السكاشن وإظهار المحددة
                document.querySelectorAll(".tab-content, section, .page-view").forEach(el => el.classList.remove("active"));
                const targetSection = document.getElementById(tabId);
                if (targetSection) targetSection.classList.add("active");
            }
        });
    });
});
