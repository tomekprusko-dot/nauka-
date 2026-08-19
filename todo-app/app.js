(() => {
  'use strict';

  const STORAGE_KEY = 'zadania.tasks.v1';
  const DOW = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const DOW_LONG = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

  const el = {
    dayStrip: document.getElementById('dayStrip'),
    content: document.getElementById('content'),
    todayLabel: document.getElementById('todayLabel'),
    addBtn: document.getElementById('addBtn'),
    sheetOverlay: document.getElementById('sheetOverlay'),
    taskForm: document.getElementById('taskForm'),
    taskTitle: document.getElementById('taskTitle'),
    taskNote: document.getElementById('taskNote'),
    taskDate: document.getElementById('taskDate'),
    cancelBtn: document.getElementById('cancelBtn'),
  };

  function todayStr() {
    return toISODate(new Date());
  }

  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function addDays(dateStr, n) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + n);
    return toISODate(dt);
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  let tasks = loadTasks();
  let filter = 'all'; // 'all' | 'none' | 'YYYY-MM-DD'

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- Day strip ----------

  function buildDayList() {
    const today = todayStr();
    const days = [];
    for (let i = 0; i < 10; i++) days.push(addDays(today, i));
    return days;
  }

  function dayChipLabel(dateStr, today) {
    if (dateStr === today) return { dow: 'Dziś', num: dateStr.slice(8, 10) };
    if (dateStr === addDays(today, 1)) return { dow: 'Jutro', num: dateStr.slice(8, 10) };
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return { dow: DOW[dt.getDay()], num: String(d) };
  }

  function hasOpenTasks(dateStr) {
    return tasks.some(t => t.date === dateStr && !t.done);
  }

  function renderDayStrip() {
    const today = todayStr();
    const days = buildDayList();
    el.dayStrip.innerHTML = '';

    const allChip = makeChip('all', 'Wszystko', '', filter === 'all', tasks.some(t => !t.done));
    el.dayStrip.appendChild(allChip);

    days.forEach(dateStr => {
      const { dow, num } = dayChipLabel(dateStr, today);
      const chip = makeChip(dateStr, dow, num, filter === dateStr, hasOpenTasks(dateStr));
      el.dayStrip.appendChild(chip);
    });

    const noneChip = makeChip('none', 'Bez', 'daty', filter === 'none', tasks.some(t => !t.date && !t.done));
    el.dayStrip.appendChild(noneChip);
  }

  function makeChip(value, dow, num, active, showDot) {
    const btn = document.createElement('button');
    btn.className = 'day-chip' + (active ? ' active' : '');
    btn.innerHTML = `<span class="dow">${dow}</span><span class="num">${num}</span>` +
      (showDot ? '<span class="dot"></span>' : '');
    btn.addEventListener('click', () => {
      filter = value;
      render();
    });
    return btn;
  }

  // ---------- Content ----------

  function formatDateHeading(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DOW_LONG[dt.getDay()]}, ${d} ${MONTHS[m - 1]}`;
  }

  function sortTasks(list) {
    return [...list].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.createdAt - b.createdAt;
    });
  }

  function renderContent() {
    el.content.innerHTML = '';
    const today = todayStr();

    if (filter === 'none') {
      renderSection(null, tasks.filter(t => !t.date));
      return;
    }

    if (filter !== 'all') {
      renderSection(null, tasks.filter(t => t.date === filter));
      return;
    }

    // filter === 'all': grouped view
    const overdue = tasks.filter(t => t.date && t.date < today && !t.done);
    const withDate = tasks.filter(t => t.date && t.date >= today);
    const noDate = tasks.filter(t => !t.date);

    const byDate = {};
    withDate.forEach(t => {
      (byDate[t.date] = byDate[t.date] || []).push(t);
    });
    const sortedDates = Object.keys(byDate).sort();

    let renderedAny = false;

    if (overdue.length) {
      renderedAny = true;
      renderSection('Zaległe', overdue, true);
    }

    sortedDates.forEach(dateStr => {
      renderedAny = true;
      const heading = dateStr === today ? 'Dziś'
        : dateStr === addDays(today, 1) ? 'Jutro'
        : formatDateHeading(dateStr);
      renderSection(heading, byDate[dateStr]);
    });

    if (noDate.length) {
      renderedAny = true;
      renderSection('Bez daty', noDate);
    }

    if (!renderedAny) {
      el.content.innerHTML = '<div class="empty-state">Brak zadań. Dodaj pierwsze przyciskiem +</div>';
    }
  }

  function renderSection(title, items, overdueSection = false) {
    if (title) {
      const h = document.createElement('div');
      h.className = 'section-title' + (overdueSection ? ' overdue-title' : '');
      h.textContent = title;
      el.content.appendChild(h);
    }
    const list = document.createElement('div');
    list.className = 'task-list';
    const sorted = sortTasks(items);
    if (!sorted.length && title === null) {
      el.content.innerHTML = '<div class="empty-state">Brak zadań na ten dzień.</div>';
      return;
    }
    sorted.forEach(t => list.appendChild(renderTaskCard(t)));
    el.content.appendChild(list);
  }

  function renderTaskCard(t) {
    const today = todayStr();
    const card = document.createElement('div');
    card.className = 'task-card' + (t.done ? ' done' : '') +
      (t.date && t.date < today && !t.done ? ' overdue' : '');

    const check = document.createElement('button');
    check.className = 'task-check';
    check.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    check.addEventListener('click', () => {
      t.done = !t.done;
      saveTasks(tasks);
      render();
    });

    const body = document.createElement('div');
    body.className = 'task-body';
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = t.title;
    body.appendChild(title);

    if (t.note) {
      const note = document.createElement('div');
      note.className = 'task-note';
      note.textContent = t.note;
      body.appendChild(note);
    }

    const del = document.createElement('button');
    del.className = 'task-delete';
    del.setAttribute('aria-label', 'Usuń zadanie');
    del.textContent = '✕';
    del.addEventListener('click', () => {
      tasks = tasks.filter(x => x.id !== t.id);
      saveTasks(tasks);
      render();
    });

    card.appendChild(check);
    card.appendChild(body);
    card.appendChild(del);
    return card;
  }

  // ---------- Add task sheet ----------

  function openSheet() {
    el.taskTitle.value = '';
    el.taskNote.value = '';
    el.taskDate.value = (filter !== 'all' && filter !== 'none') ? filter : todayStr();
    el.sheetOverlay.classList.add('open');
    setTimeout(() => el.taskTitle.focus(), 200);
  }

  function closeSheet() {
    el.sheetOverlay.classList.remove('open');
  }

  el.addBtn.addEventListener('click', openSheet);
  el.cancelBtn.addEventListener('click', closeSheet);
  el.sheetOverlay.addEventListener('click', (e) => {
    if (e.target === el.sheetOverlay) closeSheet();
  });

  el.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = el.taskTitle.value.trim();
    if (!title) return;
    tasks.push({
      id: uid(),
      title,
      note: el.taskNote.value.trim(),
      date: el.taskDate.value || null,
      done: false,
      createdAt: Date.now(),
    });
    saveTasks(tasks);
    closeSheet();
    render();
  });

  // ---------- Header ----------

  function renderHeader() {
    const now = new Date();
    const label = `${DOW_LONG[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
    el.todayLabel.textContent = label.charAt(0).toUpperCase() + label.slice(1);
  }

  function render() {
    renderHeader();
    renderDayStrip();
    renderContent();
  }

  render();

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
