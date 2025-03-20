// 当前选中的日期
let currentDate = new Date();
// 当前查看的月份（用于日历视图）
let currentViewMonth = new Date();
// 存储用户数据的对象
let userData = {};

// DOM 元素
const datePicker = document.getElementById('date-picker');
const todayBtn = document.getElementById('today-btn');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.checklist-view, .calendar-view, .export-view');
const sectionHeaders = document.querySelectorAll('.section-header');
const workChecklistContainer = document.getElementById('work-checklist');
const lifeChecklistContainer = document.getElementById('life-checklist');
const careerChecklistContainer = document.getElementById('career-checklist');
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const themeToggle = document.querySelector('.theme-toggle');
const generateExportBtn = document.getElementById('generate-export');
const downloadMdBtn = document.getElementById('download-md');
const exportPreview = document.getElementById('export-preview');

// 初始化日期选择器为今天
const today = new Date();
const formattedDate = formatDate(today);
datePicker.value = formattedDate;

// 初始化函数
function init() {
    // 加载用户数据
    loadUserData();
    
    // 检查URL参数中是否有日期
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    if (dateParam) {
        try {
            const paramDate = parseDate(dateParam);
            if (!isNaN(paramDate.getTime())) {
                currentDate = paramDate;
                datePicker.value = formatDate(currentDate);
            }
        } catch (e) {
            console.error('Invalid date parameter:', e);
        }
    }
    
    // 渲染检视清单
    renderChecklists();
    
    // 渲染日历
    renderCalendar();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 检查是否有深色模式设置
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '切换亮色主题';
    } else {
        themeToggle.textContent = '切换暗色主题';
    }
    
    // 设置自动保存功能（每5分钟自动保存一次）
    setInterval(function() {
        saveUserData();
        console.log('数据已自动保存 - ' + new Date().toLocaleTimeString());
    }, 5 * 60 * 1000);
    
    // 页面关闭前自动保存
    window.addEventListener('beforeunload', function() {
        saveUserData();
    });
}

// 更新URL参数
function updateUrlWithDate(date) {
    const dateStr = formatDate(date);
    const url = new URL(window.location.href);
    url.searchParams.set('date', dateStr);
    window.history.replaceState({}, '', url);
}

// 格式化日期为 YYYY-MM-DD 格式
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 解析日期字符串为 Date 对象
function parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// 加载用户数据
function loadUserData() {
    const savedData = localStorage.getItem('dailyReviewData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

// 保存用户数据
function saveUserData() {
    localStorage.setItem('dailyReviewData', JSON.stringify(userData));
}

// 获取当前日期的数据
function getCurrentDateData() {
    const dateKey = formatDate(currentDate);
    if (!userData[dateKey]) {
        userData[dateKey] = {
            work: {},
            life: {},
            career: {}
        };
    }
    return userData[dateKey];
}

// 渲染检视清单
function renderChecklists() {
    const dateData = getCurrentDateData();
    
    // 渲染工作检视清单
    workChecklistContainer.innerHTML = '';
    workChecklistData.forEach(item => {
        const itemData = dateData.work[item.id] || { completed: false, notes: '' };
        workChecklistContainer.appendChild(createChecklistItem(item, itemData, 'work'));
    });
    
    // 渲染生活检视清单
    lifeChecklistContainer.innerHTML = '';
    lifeChecklistData.forEach(item => {
        const itemData = dateData.life[item.id] || { completed: false, notes: '' };
        lifeChecklistContainer.appendChild(createChecklistItem(item, itemData, 'life'));
    });
    
    // 渲染职业规划检视清单
    careerChecklistContainer.innerHTML = '';
    careerChecklistData.forEach(item => {
        const itemData = dateData.career[item.id] || { completed: false, notes: '' };
        careerChecklistContainer.appendChild(createChecklistItem(item, itemData, 'career'));
    });
}

// 创建检视清单项
function createChecklistItem(item, itemData, category) {
    const itemElement = document.createElement('div');
    itemElement.className = 'checklist-item';
    itemElement.dataset.id = item.id;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = itemData.completed;
    checkbox.addEventListener('change', function() {
        const dateData = getCurrentDateData();
        if (!dateData[category][item.id]) {
            dateData[category][item.id] = { completed: false, notes: '' };
        }
        dateData[category][item.id].completed = this.checked;
        saveUserData();
    });
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'item-content';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'item-title';
    titleDiv.textContent = item.title;
    
    const descDiv = document.createElement('div');
    descDiv.className = 'item-description';
    descDiv.textContent = item.description;
    
    const notesDiv = document.createElement('div');
    notesDiv.className = 'item-notes';
    
    const notesTextarea = document.createElement('textarea');
    notesTextarea.placeholder = '添加笔记...';
    notesTextarea.value = itemData.notes || '';
    notesTextarea.addEventListener('input', function() {
        const dateData = getCurrentDateData();
        if (!dateData[category][item.id]) {
            dateData[category][item.id] = { completed: false, notes: '' };
        }
        dateData[category][item.id].notes = this.value;
        saveUserData();
    });
    
    notesDiv.appendChild(notesTextarea);
    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(descDiv);
    contentDiv.appendChild(notesDiv);
    
    itemElement.appendChild(checkbox);
    itemElement.appendChild(contentDiv);
    
    return itemElement;
}

// 渲染日历
function renderCalendar() {
    const year = currentViewMonth.getFullYear();
    const month = currentViewMonth.getMonth();
    
    // 更新月份显示
    currentMonthDisplay.textContent = `${year}年${month + 1}月`;
    
    // 清空日历网格
    calendarGrid.innerHTML = '';
    
    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day weekday';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay();
    
    // 获取上个月的最后几天
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const day = prevMonthLastDate - firstDay + i + 1;
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    }
    
    // 获取当月天数
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    // 添加当月的天数
    for (let i = 1; i <= lastDate; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        // 检查是否是今天
        const currentDateStr = formatDate(new Date());
        const thisDayStr = formatDate(new Date(year, month, i));
        if (currentDateStr === thisDayStr) {
            dayElement.classList.add('today');
        }
        
        // 检查是否有数据
        if (userData[thisDayStr]) {
            dayElement.classList.add('has-data');
        }
        
        // 添加点击事件
        dayElement.addEventListener('click', function() {
            currentDate = new Date(year, month, i);
            datePicker.value = formatDate(currentDate);
            
            // 切换到检视清单视图
            navItems.forEach(item => item.classList.remove('active'));
            const checklistNavItem = document.querySelector('.nav-item[data-view="checklist"]');
            if (checklistNavItem) {
                checklistNavItem.classList.add('active');
            }
            
            document.querySelectorAll('.checklist-view, .calendar-view, .export-view').forEach(view => {
                view.classList.remove('active');
            });
            document.querySelector('.checklist-view').classList.add('active');
            
            // 更新URL参数并渲染检视清单
            updateUrlWithDate(currentDate);
            renderChecklists();
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    // 计算需要添加的下个月天数
    const remainingCells = 42 - (firstDay + lastDate); // 6行7列 = 42个单元格
    
    // 添加下个月的前几天
    for (let i = 1; i <= remainingCells; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = i;
        calendarGrid.appendChild(dayElement);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 日期选择器变化事件
    datePicker.addEventListener('change', function() {
        currentDate = parseDate(this.value);
        renderChecklists();
        // 更新URL参数
        updateUrlWithDate(currentDate);
    });
    
    // 今天按钮点击事件
    todayBtn.addEventListener('click', function() {
        currentDate = new Date();
        datePicker.value = formatDate(currentDate);
        renderChecklists();
        // 更新URL参数
        updateUrlWithDate(currentDate);
    });
    
    // 保存按钮点击事件
    saveBtn.addEventListener('click', function() {
        saveUserData();
        // 使用更友好的提示方式
        const saveMessage = document.createElement('div');
        saveMessage.textContent = '数据已保存！';
        saveMessage.style.position = 'fixed';
        saveMessage.style.top = '20px';
        saveMessage.style.left = '50%';
        saveMessage.style.transform = 'translateX(-50%)';
        saveMessage.style.padding = '10px 20px';
        saveMessage.style.backgroundColor = 'var(--primary-color)';
        saveMessage.style.color = 'white';
        saveMessage.style.borderRadius = '4px';
        saveMessage.style.zIndex = '1000';
        document.body.appendChild(saveMessage);
        
        // 2秒后移除提示
        setTimeout(() => {
            document.body.removeChild(saveMessage);
        }, 2000);
    });
    
    // 导出按钮点击事件
    exportBtn.addEventListener('click', function() {
        // 切换到导出视图
        navItems.forEach(item => item.classList.remove('active'));
        // 找到data-view为export的导航项并添加active类
        const exportNavItem = document.querySelector('.nav-item[data-view="export"]');
        if (exportNavItem) {
            exportNavItem.classList.add('active');
        }
        
        // 隐藏所有视图
        views.forEach(view => view.classList.remove('active'));
        
        // 显示导出视图
        document.querySelector('.export-view').classList.add('active');
        
        // 生成导出预览
        generateExport();
    });
    
    // 导航项点击事件
    navItems.forEach((item) => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const viewType = this.dataset.view;
            const viewClass = `.${viewType}-view`;
            
            document.querySelectorAll('.checklist-view, .calendar-view, .export-view').forEach(view => {
                view.classList.remove('active');
            });
            document.querySelector(viewClass).classList.add('active');
        
            if(viewType === 'calendar') {
                currentViewMonth = new Date(currentDate);
                renderCalendar();
            } else if(viewType === 'export') {
                generateExport();
            }
        });
    });
    
    // 部分标题点击事件（折叠/展开）
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content && content.classList.contains('section-content')) {
                const isActive = content.classList.contains('active');
                content.classList.toggle('active');
                content.style.display = isActive ? 'none' : 'block';
                const icon = this.querySelector('.toggle-icon');
                if (icon) {
                    icon.textContent = isActive ? '▶' : '▼';
                }
            }
        });
    });
    
    // 上个月按钮点击事件
    prevMonthBtn.addEventListener('click', function() {
        currentViewMonth.setMonth(currentViewMonth.getMonth() - 1);
        renderCalendar();
    });
    
    // 下个月按钮点击事件
    nextMonthBtn.addEventListener('click', function() {
        currentViewMonth.setMonth(currentViewMonth.getMonth() + 1);
        renderCalendar();
    });
    
    // 主题切换按钮点击事件
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        themeToggle.textContent = isDarkMode ? '切换亮色主题' : '切换暗色主题';
        
        // 添加主题切换动画效果
        document.body.style.transition = 'background-color 0.3s, color 0.3s';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });
    
    // 生成导出按钮点击事件
    generateExportBtn.addEventListener('click', function() {
        generateExport();
    });
    
    // 下载 Markdown 按钮点击事件
    downloadMdBtn.addEventListener('click', function() {
        downloadMarkdown();
    });
}

// 生成导出预览
function generateExport() {
    const dateStr = formatDate(currentDate);
    const dateData = getCurrentDateData();
    
    const includeWork = document.getElementById('export-work').checked;
    const includeLife = document.getElementById('export-life').checked;
    const includeCareer = document.getElementById('export-career').checked;
    const completedOnly = document.getElementById('export-completed-only').checked;
    const withNotes = document.getElementById('export-with-notes').checked;
    
    let markdown = `# ${dateStr} 每日检视记录\n\n`;
    
    // 添加工作检视清单
    if (includeWork) {
        markdown += '## 工作检视清单\n\n';
        workChecklistData.forEach(item => {
            const itemData = dateData.work[item.id] || { completed: false, notes: '' };
            if (!completedOnly || itemData.completed) {
                markdown += `- [${itemData.completed ? 'x' : ' '}] ${item.title}\n`;
                if (withNotes && itemData.notes) {
                    markdown += `  - 笔记: ${itemData.notes}\n`;
                }
            }
        });
        markdown += '\n';
    }
    
    // 添加生活检视清单
    if (includeLife) {
        markdown += '## 生活检视清单\n\n';
        lifeChecklistData.forEach(item => {
            const itemData = dateData.life[item.id] || { completed: false, notes: '' };
            if (!completedOnly || itemData.completed) {
                markdown += `- [${itemData.completed ? 'x' : ' '}] ${item.title}\n`;
                if (withNotes && itemData.notes) {
                    markdown += `  - 笔记: ${itemData.notes}\n`;
                }
            }
        });
        markdown += '\n';
    }
    
    // 添加职业规划检视清单
    if (includeCareer) {
        markdown += '## 职业规划检视清单\n\n';
        careerChecklistData.forEach(item => {
            const itemData = dateData.career[item.id] || { completed: false, notes: '' };
            if (!completedOnly || itemData.completed) {
                markdown += `- [${itemData.completed ? 'x' : ' '}] ${item.title}\n`;
                if (withNotes && itemData.notes) {
                    markdown += `  - 笔记: ${itemData.notes}\n`;
                }
            }
        });
        markdown += '\n';
    }
    
    exportPreview.textContent = markdown;
}

// 下载 Markdown 文件
function downloadMarkdown() {
    const dateStr = formatDate(currentDate);
    const markdown = exportPreview.textContent;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dateStr}-每日检视记录.md`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    // 添加下载成功提示
    const downloadMessage = document.createElement('div');
    downloadMessage.textContent = 'Markdown文件已下载！';
    downloadMessage.style.position = 'fixed';
    downloadMessage.style.top = '20px';
    downloadMessage.style.left = '50%';
    downloadMessage.style.transform = 'translateX(-50%)';
    downloadMessage.style.padding = '10px 20px';
    downloadMessage.style.backgroundColor = 'var(--primary-color)';
    downloadMessage.style.color = 'white';
    downloadMessage.style.borderRadius = '4px';
    downloadMessage.style.zIndex = '1000';
    document.body.appendChild(downloadMessage);
    
    // 2秒后移除提示
    setTimeout(() => {
        document.body.removeChild(downloadMessage);
    }, 2000);
}

// 初始化应用
init(); 