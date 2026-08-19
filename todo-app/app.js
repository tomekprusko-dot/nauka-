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
    taskTime: document.getElementById('taskTime'),
    taskNoDate: document.getElementById('taskNoDate'),
    dateTimeRow: document.getElementById('dateTimeRow'),
    cancelBtn: document.getElementById('cancelBtn'),
    sheetTitle: document.getElementById('sheetTitle'),
    saveBtn: document.getElementById('saveBtn'),
    deleteInSheetBtn: document.getElementById('deleteInSheetBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsOverlay: document.getElementById('settingsOverlay'),
    settingsCloseBtn: document.getElementById('settingsCloseBtn'),
    taskCount: document.getElementById('taskCount'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    tagFilterStrip: document.getElementById('tagFilterStrip'),
    tagOptions: document.getElementById('tagOptions'),
    repeatRow: document.getElementById('repeatRow'),
    taskRepeat: document.getElementById('taskRepeat'),
    repeatIntervalRow: document.getElementById('repeatIntervalRow'),
    repeatDays: document.getElementById('repeatDays'),
  };

  const TAG_LABELS = { praca: '💼 Praca', prywatne: '🏠 Prywatne' };

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

  function nowHHMM() {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }

  function isOverdue(t, today, nowTime) {
    if (t.done || !t.date) return false;
    if (t.date < today) return true;
    if (t.date === today && t.time && t.time < nowTime) return true;
    return false;
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
  let editingId = null;
  let tagFilter = 'all'; // 'all' | 'praca' | 'prywatne'
  let selectedTag = null; // null | 'praca' | 'prywatne' (in the add/edit sheet)

  function visibleTasks() {
    if (tagFilter === 'all') return tasks;
    return tasks.filter(t => t.tag === tagFilter);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- Day strip ----------

  function buildDayList() {
    const today = todayStr();
    const days = [];
    for (let i = 0; i < 14; i++) days.push(addDays(today, i));
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
    return visibleTasks().some(t => t.date === dateStr && !t.done);
  }

  function renderDayStrip() {
    const today = todayStr();
    const days = buildDayList();
    el.dayStrip.innerHTML = '';
    const vTasks = visibleTasks();

    const allChip = makeChip('all', 'Wszystko', '', filter === 'all', vTasks.some(t => !t.done));
    el.dayStrip.appendChild(allChip);

    const noneChip = makeChip('none', 'Ogólne', '', filter === 'none', vTasks.some(t => !t.date && !t.done));
    el.dayStrip.appendChild(noneChip);

    days.forEach(dateStr => {
      const { dow, num } = dayChipLabel(dateStr, today);
      const chip = makeChip(dateStr, dow, num, filter === dateStr, hasOpenTasks(dateStr));
      el.dayStrip.appendChild(chip);
    });
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
      if (!!a.time !== !!b.time) return a.time ? -1 : 1;
      if (a.time && b.time && a.time !== b.time) return a.time < b.time ? -1 : 1;
      return a.createdAt - b.createdAt;
    });
  }

  function renderContent() {
    el.content.innerHTML = '';
    const today = todayStr();
    const nowTime = nowHHMM();
    const vTasks = visibleTasks();

    if (filter === 'none') {
      renderSection(null, vTasks.filter(t => !t.date), false, 'Brak zadań ogólnych. Dodaj pierwsze przyciskiem +');
      return;
    }

    if (filter !== 'all') {
      renderSection(null, vTasks.filter(t => t.date === filter), false, 'Brak zadań na ten dzień.');
      return;
    }

    // filter === 'all': grouped view
    const overdue = vTasks.filter(t => isOverdue(t, today, nowTime));
    const overdueIds = new Set(overdue.map(t => t.id));
    const withDate = vTasks.filter(t => t.date && t.date >= today && !overdueIds.has(t.id));
    const noDate = vTasks.filter(t => !t.date);

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
      renderSection('Ogólne', noDate);
    }

    if (!renderedAny) {
      el.content.innerHTML = '<div class="empty-state">Brak zadań. Dodaj pierwsze przyciskiem +</div>';
    }
  }

  function renderSection(title, items, overdueSection = false, emptyText = 'Brak zadań na ten dzień.') {
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
      el.content.innerHTML = `<div class="empty-state">${emptyText}</div>`;
      return;
    }
    sorted.forEach(t => list.appendChild(renderTaskCard(t)));
    el.content.appendChild(list);
  }

  function renderTaskCard(t) {
    const today = todayStr();
    const nowTime = nowHHMM();
    const card = document.createElement('div');
    card.className = 'task-card' + (t.done ? ' done' : '') +
      (isOverdue(t, today, nowTime) ? ' overdue' : '');

    const check = document.createElement('button');
    check.className = 'task-check';
    check.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    check.addEventListener('click', () => {
      const wasDone = t.done;
      t.done = !t.done;
      if (!wasDone && t.done && t.repeatEveryDays && t.date) {
        tasks.push({
          id: uid(),
          title: t.title,
          note: t.note,
          date: addDays(t.date, t.repeatEveryDays),
          time: t.time,
          tag: t.tag,
          repeatEveryDays: t.repeatEveryDays,
          done: false,
          createdAt: Date.now(),
        });
      }
      saveTasks(tasks);
      render();
    });

    const body = document.createElement('div');
    body.className = 'task-body';
    body.addEventListener('click', () => openEditSheet(t.id));
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

    if (t.time || t.tag || t.repeatEveryDays) {
      const meta = document.createElement('div');
      meta.className = 'task-meta';
      if (t.time) {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'task-time';
        timeSpan.textContent = `🕐 ${t.time}`;
        meta.appendChild(timeSpan);
      }
      if (t.tag) {
        const tagSpan = document.createElement('span');
        tagSpan.className = `task-tag tag-${t.tag}`;
        tagSpan.textContent = TAG_LABELS[t.tag] || t.tag;
        meta.appendChild(tagSpan);
      }
      if (t.repeatEveryDays) {
        const repeatSpan = document.createElement('span');
        repeatSpan.className = 'task-repeat-badge';
        repeatSpan.textContent = `🔁 co ${t.repeatEveryDays} dni`;
        meta.appendChild(repeatSpan);
      }
      body.appendChild(meta);
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

  // ---------- Add / edit task sheet ----------

  function applyNoDateToggle() {
    const noDate = el.taskNoDate.checked;
    el.dateTimeRow.classList.toggle('hidden', noDate);
    el.repeatRow.classList.toggle('hidden', noDate);
    if (noDate) {
      el.taskRepeat.checked = false;
      applyRepeatToggle();
    }
  }

  function applyRepeatToggle() {
    el.repeatIntervalRow.classList.toggle('hidden', !el.taskRepeat.checked);
  }

  function setTag(tag) {
    selectedTag = tag || null;
    el.tagOptions.querySelectorAll('.tag-chip').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.tag || null) === selectedTag);
    });
  }

  function openSheet() {
    editingId = null;
    el.sheetTitle.textContent = 'Nowe zadanie';
    el.saveBtn.textContent = 'Zapisz';
    el.deleteInSheetBtn.classList.add('hidden');
    el.taskTitle.value = '';
    el.taskNote.value = '';
    el.taskDate.value = (filter !== 'all' && filter !== 'none') ? filter : todayStr();
    el.taskTime.value = '';
    el.taskNoDate.checked = filter === 'none';
    el.taskRepeat.checked = false;
    el.repeatDays.value = 2;
    applyRepeatToggle();
    applyNoDateToggle();
    setTag(tagFilter !== 'all' ? tagFilter : null);
    el.sheetOverlay.classList.add('open');
    setTimeout(() => el.taskTitle.focus(), 200);
  }

  function openEditSheet(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    editingId = id;
    el.sheetTitle.textContent = 'Edytuj zadanie';
    el.saveBtn.textContent = 'Zapisz zmiany';
    el.deleteInSheetBtn.classList.remove('hidden');
    el.taskTitle.value = t.title;
    el.taskNote.value = t.note || '';
    el.taskDate.value = t.date || todayStr();
    el.taskTime.value = t.time || '';
    el.taskNoDate.checked = !t.date;
    el.taskRepeat.checked = !!t.repeatEveryDays;
    el.repeatDays.value = t.repeatEveryDays || 2;
    applyRepeatToggle();
    applyNoDateToggle();
    setTag(t.tag || null);
    el.sheetOverlay.classList.add('open');
  }

  function closeSheet() {
    el.sheetOverlay.classList.remove('open');
  }

  el.addBtn.addEventListener('click', openSheet);
  el.cancelBtn.addEventListener('click', closeSheet);
  el.taskNoDate.addEventListener('change', applyNoDateToggle);
  el.taskRepeat.addEventListener('change', applyRepeatToggle);
  el.tagOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-chip');
    if (!btn) return;
    setTag(btn.dataset.tag || null);
  });
  el.sheetOverlay.addEventListener('click', (e) => {
    if (e.target === el.sheetOverlay) closeSheet();
  });

  el.deleteInSheetBtn.addEventListener('click', () => {
    if (!editingId) return;
    tasks = tasks.filter(x => x.id !== editingId);
    saveTasks(tasks);
    closeSheet();
    render();
  });

  el.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = el.taskTitle.value.trim();
    if (!title) return;
    const noDate = el.taskNoDate.checked;
    const date = noDate ? null : (el.taskDate.value || null);
    const time = (!noDate && el.taskDate.value) ? (el.taskTime.value || null) : null;
    const note = el.taskNote.value.trim();
    let repeatEveryDays = null;
    if (!noDate && date && el.taskRepeat.checked) {
      const n = parseInt(el.repeatDays.value, 10);
      repeatEveryDays = Number.isFinite(n) ? Math.min(90, Math.max(1, n)) : 2;
    }

    if (editingId) {
      const existing = tasks.find(x => x.id === editingId);
      if (existing) {
        existing.title = title;
        existing.note = note;
        existing.date = date;
        existing.time = time;
        existing.tag = selectedTag;
        existing.repeatEveryDays = repeatEveryDays;
      }
    } else {
      tasks.push({
        id: uid(),
        title,
        note,
        date,
        time,
        tag: selectedTag,
        repeatEveryDays,
        done: false,
        createdAt: Date.now(),
      });
    }
    saveTasks(tasks);
    closeSheet();
    render();
  });

  // ---------- Settings: export / import ----------

  function openSettings() {
    el.taskCount.textContent = tasks.length;
    el.settingsOverlay.classList.add('open');
  }

  function closeSettings() {
    el.settingsOverlay.classList.remove('open');
  }

  el.settingsBtn.addEventListener('click', openSettings);
  el.settingsCloseBtn.addEventListener('click', closeSettings);
  el.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === el.settingsOverlay) closeSettings();
  });

  el.exportBtn.addEventListener('click', () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), tasks }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zadania-kopia-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  el.importBtn.addEventListener('click', () => el.importFile.click());

  el.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedTasks = Array.isArray(parsed) ? parsed : parsed.tasks;
        if (!Array.isArray(importedTasks)) throw new Error('invalid backup format');
        const existingIds = new Set(tasks.map(t => t.id));
        let added = 0;
        importedTasks.forEach(t => {
          if (t && t.id && t.title && !existingIds.has(t.id)) {
            tasks.push(t);
            existingIds.add(t.id);
            added++;
          }
        });
        saveTasks(tasks);
        render();
        el.taskCount.textContent = tasks.length;
        alert(`Zaimportowano ${added} zadań.`);
      } catch {
        alert('Nie udało się wczytać pliku kopii zapasowej.');
      } finally {
        el.importFile.value = '';
      }
    };
    reader.readAsText(file);
  });

  // ---------- Tag filter ----------

  el.tagFilterStrip.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-filter-chip');
    if (!btn) return;
    tagFilter = btn.dataset.tag;
    el.tagFilterStrip.querySelectorAll('.tag-filter-chip').forEach(b => {
      b.classList.toggle('active', b === btn);
    });
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
