(() => {
  'use strict';

  const STORAGE_KEY = 'zadania.tasks.v1';
  const STORAGE_KEY_NOTEBOOKS = 'zadania.notebooks.v1';
  const STORAGE_KEY_NOTEITEMS = 'zadania.noteitems.v1';
  const DOW = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
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
    viewTitle: document.getElementById('viewTitle'),
    backBtn: document.getElementById('backBtn'),
    tasksView: document.getElementById('tasksView'),
    notesListView: document.getElementById('notesListView'),
    notesDetailView: document.getElementById('notesDetailView'),
    notesListContent: document.getElementById('notesListContent'),
    notesDetailContent: document.getElementById('notesDetailContent'),
    tabTasksBtn: document.getElementById('tabTasksBtn'),
    tabNotesBtn: document.getElementById('tabNotesBtn'),
    notebookCount: document.getElementById('notebookCount'),
    simpleSheetOverlay: document.getElementById('simpleSheetOverlay'),
    simpleSheetTitle: document.getElementById('simpleSheetTitle'),
    simpleSheetLabel: document.getElementById('simpleSheetLabel'),
    simpleForm: document.getElementById('simpleForm'),
    simpleInput: document.getElementById('simpleInput'),
    simpleCancelBtn: document.getElementById('simpleCancelBtn'),
    simpleSaveBtn: document.getElementById('simpleSaveBtn'),
    simpleDeleteBtn: document.getElementById('simpleDeleteBtn'),
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

  function loadNotebooks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTEBOOKS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveNotebooks(notebooks) {
    localStorage.setItem(STORAGE_KEY_NOTEBOOKS, JSON.stringify(notebooks));
  }

  function loadNoteItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTEITEMS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveNoteItems(noteItems) {
    localStorage.setItem(STORAGE_KEY_NOTEITEMS, JSON.stringify(noteItems));
  }

  let tasks = loadTasks();
  let notebooks = loadNotebooks();
  let noteItems = loadNoteItems();
  let filter = 'all'; // 'all' | 'none' | 'overdue' | 'YYYY-MM-DD'
  let editingId = null;
  let tagFilter = 'all'; // 'all' | 'praca' | 'prywatne'
  let selectedTag = null; // null | 'praca' | 'prywatne' (in the add/edit sheet)
  let currentView = 'tasks'; // 'tasks' | 'notesList' | 'notesDetail'
  let currentNotebookId = null;
  let simpleMode = null; // 'notebook' | 'item'
  let simpleEditId = null;

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

    const nowTime = nowHHMM();
    const overdueChip = makeChip('overdue', 'Zaległe', '', filter === 'overdue', vTasks.some(t => isOverdue(t, today, nowTime)));
    overdueChip.classList.add('chip-overdue');
    el.dayStrip.appendChild(overdueChip);

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

  function shortDateLabel(dateStr) {
    const [, m, d] = dateStr.split('-').map(Number);
    return `${d} ${MONTHS_SHORT[m - 1]}`;
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

    if (filter === 'overdue') {
      renderSection(null, vTasks.filter(t => isOverdue(t, today, nowTime)), false, 'Brak zaległych zadań. Świetna robota!');
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
    const overdue = isOverdue(t, today, nowTime);
    const card = document.createElement('div');
    card.className = 'task-card' + (t.done ? ' done' : '') + (overdue ? ' overdue' : '');

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

    if (t.time || t.tag || t.repeatEveryDays || overdue) {
      const meta = document.createElement('div');
      meta.className = 'task-meta';
      if (overdue && t.date) {
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-overdue-date';
        dateSpan.textContent = shortDateLabel(t.date);
        meta.appendChild(dateSpan);
      }
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

  // ---------- Notes (Notatki) ----------

  function sortNoteItems(list) {
    return [...list].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.createdAt - b.createdAt;
    });
  }

  function deleteNotebookWithConfirm(id) {
    const nb = notebooks.find(n => n.id === id);
    if (!nb) return false;
    if (!confirm(`Usunąć listę „${nb.name}” wraz z jej pozycjami?`)) return false;
    notebooks = notebooks.filter(n => n.id !== id);
    noteItems = noteItems.filter(i => i.notebookId !== id);
    saveNotebooks(notebooks);
    saveNoteItems(noteItems);
    return true;
  }

  function renderNotesList() {
    el.notesListContent.innerHTML = '';
    if (!notebooks.length) {
      el.notesListContent.innerHTML = '<div class="empty-state">Brak list. Dodaj pierwszą przyciskiem +</div>';
      return;
    }
    const listEl = document.createElement('div');
    listEl.className = 'task-list';
    notebooks.forEach(nb => {
      const items = noteItems.filter(i => i.notebookId === nb.id);
      const done = items.filter(i => i.done).length;
      const total = items.length;
      const percent = total ? Math.round((done / total) * 100) : 0;

      const card = document.createElement('div');
      card.className = 'notebook-card';

      const body = document.createElement('div');
      body.className = 'notebook-body';
      body.addEventListener('click', () => {
        currentNotebookId = nb.id;
        switchView('notesDetail');
      });

      const name = document.createElement('div');
      name.className = 'notebook-name';
      name.textContent = nb.name;
      body.appendChild(name);

      const progress = document.createElement('div');
      progress.className = 'notebook-progress';
      progress.textContent = total ? `${done} z ${total} zaznaczone` : 'Brak pozycji';
      body.appendChild(progress);

      const bar = document.createElement('div');
      bar.className = 'notebook-progress-bar';
      const fill = document.createElement('div');
      fill.className = 'notebook-progress-fill';
      fill.style.width = `${percent}%`;
      bar.appendChild(fill);
      body.appendChild(bar);

      const editBtn = document.createElement('button');
      editBtn.className = 'notebook-edit';
      editBtn.setAttribute('aria-label', 'Edytuj nazwę listy');
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', () => openNotebookSheet(nb.id));

      const del = document.createElement('button');
      del.className = 'task-delete';
      del.setAttribute('aria-label', 'Usuń listę');
      del.textContent = '✕';
      del.addEventListener('click', () => {
        if (deleteNotebookWithConfirm(nb.id)) render();
      });

      card.appendChild(body);
      card.appendChild(editBtn);
      card.appendChild(del);
      listEl.appendChild(card);
    });
    el.notesListContent.appendChild(listEl);
  }

  function renderNotesDetail() {
    el.notesDetailContent.innerHTML = '';
    const items = noteItems.filter(i => i.notebookId === currentNotebookId);
    if (!items.length) {
      el.notesDetailContent.innerHTML = '<div class="empty-state">Brak pozycji na liście. Dodaj pierwszą przyciskiem +</div>';
      return;
    }
    const listEl = document.createElement('div');
    listEl.className = 'task-list';
    sortNoteItems(items).forEach(item => {
      const card = document.createElement('div');
      card.className = 'note-item-card' + (item.done ? ' done' : '');

      const check = document.createElement('button');
      check.className = 'task-check';
      check.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      check.addEventListener('click', () => {
        item.done = !item.done;
        saveNoteItems(noteItems);
        render();
      });

      const text = document.createElement('div');
      text.className = 'note-item-text';
      text.textContent = item.text;
      text.addEventListener('click', () => openItemSheet(item.id));

      const del = document.createElement('button');
      del.className = 'task-delete';
      del.setAttribute('aria-label', 'Usuń pozycję');
      del.textContent = '✕';
      del.addEventListener('click', () => {
        noteItems = noteItems.filter(i => i.id !== item.id);
        saveNoteItems(noteItems);
        render();
      });

      card.appendChild(check);
      card.appendChild(text);
      card.appendChild(del);
      listEl.appendChild(card);
    });
    el.notesDetailContent.appendChild(listEl);
  }

  function openNotebookSheet(editId = null) {
    simpleMode = 'notebook';
    simpleEditId = editId;
    const nb = editId ? notebooks.find(n => n.id === editId) : null;
    el.simpleSheetTitle.textContent = editId ? 'Edytuj listę' : 'Nowa lista';
    el.simpleSheetLabel.textContent = 'Nazwa listy';
    el.simpleInput.placeholder = 'np. Wakacje';
    el.simpleInput.value = nb ? nb.name : '';
    el.simpleSaveBtn.textContent = editId ? 'Zapisz zmiany' : 'Zapisz';
    el.simpleDeleteBtn.classList.toggle('hidden', !editId);
    el.simpleSheetOverlay.classList.add('open');
    setTimeout(() => el.simpleInput.focus(), 200);
  }

  function openItemSheet(editId = null) {
    simpleMode = 'item';
    simpleEditId = editId;
    const item = editId ? noteItems.find(i => i.id === editId) : null;
    el.simpleSheetTitle.textContent = editId ? 'Edytuj pozycję' : 'Nowa pozycja';
    el.simpleSheetLabel.textContent = 'Co dodać do listy?';
    el.simpleInput.placeholder = 'np. Ładowarka do telefonu';
    el.simpleInput.value = item ? item.text : '';
    el.simpleSaveBtn.textContent = editId ? 'Zapisz zmiany' : 'Zapisz';
    el.simpleDeleteBtn.classList.toggle('hidden', !editId);
    el.simpleSheetOverlay.classList.add('open');
    setTimeout(() => el.simpleInput.focus(), 200);
  }

  function closeSimpleSheet() {
    el.simpleSheetOverlay.classList.remove('open');
  }

  el.simpleCancelBtn.addEventListener('click', closeSimpleSheet);
  el.simpleSheetOverlay.addEventListener('click', (e) => {
    if (e.target === el.simpleSheetOverlay) closeSimpleSheet();
  });

  el.simpleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = el.simpleInput.value.trim();
    if (!value) return;
    if (simpleMode === 'notebook') {
      if (simpleEditId) {
        const nb = notebooks.find(n => n.id === simpleEditId);
        if (nb) nb.name = value;
      } else {
        notebooks.push({ id: uid(), name: value, createdAt: Date.now() });
      }
      saveNotebooks(notebooks);
    } else if (simpleMode === 'item') {
      if (simpleEditId) {
        const item = noteItems.find(i => i.id === simpleEditId);
        if (item) item.text = value;
      } else {
        noteItems.push({ id: uid(), notebookId: currentNotebookId, text: value, done: false, createdAt: Date.now() });
      }
      saveNoteItems(noteItems);
    }
    closeSimpleSheet();
    render();
  });

  el.simpleDeleteBtn.addEventListener('click', () => {
    if (!simpleEditId) return;
    if (simpleMode === 'notebook') {
      if (!deleteNotebookWithConfirm(simpleEditId)) return;
    } else if (simpleMode === 'item') {
      noteItems = noteItems.filter(i => i.id !== simpleEditId);
      saveNoteItems(noteItems);
    }
    closeSimpleSheet();
    render();
  });

  // ---------- Settings: export / import ----------

  function openSettings() {
    el.taskCount.textContent = tasks.length;
    el.notebookCount.textContent = notebooks.length;
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
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), tasks, notebooks, noteItems }, null, 2);
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
        const importedNotebooks = Array.isArray(parsed.notebooks) ? parsed.notebooks : [];
        const importedNoteItems = Array.isArray(parsed.noteItems) ? parsed.noteItems : [];

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

        const existingNotebookIds = new Set(notebooks.map(n => n.id));
        let addedNotebooks = 0;
        importedNotebooks.forEach(n => {
          if (n && n.id && n.name && !existingNotebookIds.has(n.id)) {
            notebooks.push(n);
            existingNotebookIds.add(n.id);
            addedNotebooks++;
          }
        });
        saveNotebooks(notebooks);

        const existingItemIds = new Set(noteItems.map(i => i.id));
        let addedItems = 0;
        importedNoteItems.forEach(i => {
          if (i && i.id && i.notebookId && !existingItemIds.has(i.id)) {
            noteItems.push(i);
            existingItemIds.add(i.id);
            addedItems++;
          }
        });
        saveNoteItems(noteItems);

        render();
        el.taskCount.textContent = tasks.length;
        el.notebookCount.textContent = notebooks.length;
        alert(`Zaimportowano ${added} zadań, ${addedNotebooks} list notatek i ${addedItems} pozycji.`);
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

  // ---------- View switching (Zadania / Notatki) ----------

  function switchView(view) {
    currentView = view;
    el.tasksView.classList.toggle('hidden', view !== 'tasks');
    el.notesListView.classList.toggle('hidden', view !== 'notesList');
    el.notesDetailView.classList.toggle('hidden', view !== 'notesDetail');
    el.tabTasksBtn.classList.toggle('active', view === 'tasks');
    el.tabNotesBtn.classList.toggle('active', view === 'notesList' || view === 'notesDetail');
    el.backBtn.classList.toggle('hidden', view !== 'notesDetail');
    el.addBtn.setAttribute('aria-label',
      view === 'tasks' ? 'Dodaj zadanie' : view === 'notesList' ? 'Dodaj listę' : 'Dodaj pozycję');
    render();
  }

  el.tabTasksBtn.addEventListener('click', () => switchView('tasks'));
  el.tabNotesBtn.addEventListener('click', () => switchView('notesList'));
  el.backBtn.addEventListener('click', () => switchView('notesList'));

  el.addBtn.addEventListener('click', () => {
    if (currentView === 'tasks') openSheet();
    else if (currentView === 'notesList') openNotebookSheet();
    else if (currentView === 'notesDetail') openItemSheet();
  });

  // ---------- Header ----------

  function renderHeader() {
    if (currentView === 'tasks') {
      const now = new Date();
      const label = `${DOW_LONG[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
      el.viewTitle.textContent = 'Zadania';
      el.todayLabel.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    } else if (currentView === 'notesList') {
      el.viewTitle.textContent = 'Notatki';
      el.todayLabel.textContent = notebooks.length ? `${notebooks.length} list` : 'Twoje listy i checklisty';
    } else if (currentView === 'notesDetail') {
      const nb = notebooks.find(n => n.id === currentNotebookId);
      const items = noteItems.filter(i => i.notebookId === currentNotebookId);
      const done = items.filter(i => i.done).length;
      el.viewTitle.textContent = nb ? nb.name : 'Lista';
      el.todayLabel.textContent = items.length ? `${done} z ${items.length} zaznaczone` : 'Brak pozycji';
    }
  }

  function render() {
    renderHeader();
    if (currentView === 'tasks') {
      renderDayStrip();
      renderContent();
    } else if (currentView === 'notesList') {
      renderNotesList();
    } else if (currentView === 'notesDetail') {
      renderNotesDetail();
    }
  }

  render();

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
