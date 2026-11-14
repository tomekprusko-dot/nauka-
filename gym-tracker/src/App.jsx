import { useEffect, useRef, useState } from "react";
import WeekPicker from "./components/WeekPicker";
import SessionTabs from "./components/SessionTabs";
import WorkoutView from "./components/WorkoutView";
import ProgressView from "./components/ProgressView";
import MoreView from "./components/MoreView";
import RestTimer from "./components/RestTimer";
import SyncBadge from "./components/SyncBadge";
import LoginView from "./components/LoginView";
import InstallHint from "./components/InstallHint";
import Logo from "./components/Logo";
import { emptyData, loadData, saveData, SETTINGS_KEY } from "./utils/storage";
import { unlockAudio } from "./utils/sound";
import { fetchAllLogs, isSupabaseConfigured, subscribeToChanges, supabase, writeLog } from "./sync/supabase";
import { clearDirty, createSyncQueue } from "./sync/syncQueue";
import { EDITABLE_FIELDS, findNextSession, getSession, getSessionExerciseIds, sessionKey } from "./utils/training";
import { EXERCISES } from "./data/plan";
import "./App.css";

const TABS = [
  { id: "workout", label: "Trening" },
  { id: "progress", label: "Postęp" },
  { id: "more", label: "Więcej" },
];

const LOCAL_MODE_KEY = "gym-tracker-local-mode";
// Id osoby, której dane już raz zsynchronizowano na tym telefonie.
const SYNCED_USER_KEY = "gym-tracker-synced-user";

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // brak dostępu do pamięci - appka działa dalej
  }
}

function App() {
  // Dane z localStorage pokazują się od razu (także bez internetu),
  // a dane z chmury dochodzą chwilę później.
  const [data, setData] = useState(() => loadData());
  const [selected, setSelected] = useState(() => findNextSession(data.logs, data.settings));
  const [tab, setTab] = useState("workout");
  const [timer, setTimer] = useState(null);
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? "connecting" : "local");
  // undefined = jeszcze sprawdzamy, null = niezalogowany, obiekt = zalogowany
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [localMode, setLocalMode] = useState(
    () => !isSupabaseConfigured || readStorage(LOCAL_MODE_KEY) === "1"
  );

  // useRef trzyma wartość między renderami, ale jej zmiana NIE odświeża ekranu.
  const dataRef = useRef(data);
  const queueRef = useRef(null);
  const userNavigatedRef = useRef(false);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    dataRef.current = data;
    saveData(data);
  }, [data]);

  // Kto jest zalogowany? Supabase pamięta sesję, więc działa to też offline.
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data: result }) => setSession(result.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Synchronizacja z chmurą - startuje po zalogowaniu, kończy po wylogowaniu.
  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;
    let pullTimer = null;
    let isFirstPull = true;
    const queue = createSyncQueue((key, value) => writeLog(userId, key, value), setSyncStatus);
    queueRef.current = queue;

    // Najpierw wyślij to, czego nie udało się wysłać ostatnio (np. brak zasięgu).
    for (const key of queue.dirtyKeys()) {
      const local = dataRef.current;
      queue.schedule(key, key === SETTINGS_KEY ? local.settings : (local.logs[key] ?? null));
    }

    async function pull() {
      try {
        const remoteLogs = await fetchAllLogs();
        if (cancelled) return;
        // Ustawienia siedzą w tej samej tabeli co treningi, pod kluczem "settings".
        const remoteSettings = remoteLogs[SETTINGS_KEY] ?? null;
        delete remoteLogs[SETTINGS_KEY];

        // Pierwsze logowanie na tym telefonie: treningi wpisane wcześniej
        // lokalnie (a których nie ma w chmurze) wysyłamy, zamiast je zgubić.
        if (isFirstPull && readStorage(SYNCED_USER_KEY) !== userId) {
          for (const [key, log] of Object.entries(dataRef.current.logs)) {
            if (!(key in remoteLogs)) queue.schedule(key, log);
          }
          const localSettings = dataRef.current.settings;
          if (!remoteSettings && Object.keys(localSettings).length > 0) {
            queue.schedule(SETTINGS_KEY, localSettings);
          }
          writeStorage(SYNCED_USER_KEY, userId);
        }

        setData((prev) => {
          const logs = { ...remoteLogs };
          // Treningi z niewysłanymi zmianami zostają w wersji z ekranu.
          for (const key of Object.keys(prev.logs)) {
            if (queue.isBusy(key)) logs[key] = prev.logs[key];
          }
          const settings = queue.isBusy(SETTINGS_KEY) ? prev.settings : (remoteSettings ?? {});
          return { ...prev, logs, settings };
        });

        if (isFirstPull) {
          isFirstPull = false;
          if (!userNavigatedRef.current) {
            const settings = queue.isBusy(SETTINGS_KEY) ? dataRef.current.settings : (remoteSettings ?? {});
            setSelected(findNextSession(remoteLogs, settings));
          }
        }
        setSyncStatus((status) => (status === "connecting" || status === "offline" ? "saved" : status));
      } catch {
        if (!cancelled) setSyncStatus(navigator.onLine ? "error" : "offline");
      }
    }

    function schedulePull() {
      clearTimeout(pullTimer);
      pullTimer = setTimeout(pull, 400);
    }

    // Po powrocie do appki albo odzyskaniu zasięgu: doślij zaległe i pobierz nowe.
    function refresh() {
      if (document.visibilityState !== "visible") return;
      queue.retryAll();
      schedulePull();
    }

    pull();
    const unsubscribe = subscribeToChanges(userId, schedulePull);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);

    return () => {
      cancelled = true;
      clearTimeout(pullTimer);
      queue.stop();
      queueRef.current = null;
      unsubscribe();
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [userId]);

  // Wspólna funkcja do zmiany zapisu jednego treningu. "updater" dostaje
  // stary zapis i zwraca nowy - nigdy nie zmieniamy obiektów w miejscu.
  function updateSessionLog(week, sessionId, updater) {
    const key = sessionKey(week, sessionId);
    const nextLog = updater(dataRef.current.logs[key] ?? { exercises: {} });
    const nextData = { ...dataRef.current, logs: { ...dataRef.current.logs, [key]: nextLog } };
    dataRef.current = nextData;
    setData(nextData);
    queueRef.current?.schedule(key, nextLog);
  }

  // Wspólna funkcja do zmiany ustawień (nazwy ćwiczeń, tygodnie poza appką).
  function updateSettings(updater) {
    const settings = updater(dataRef.current.settings);
    const nextData = { ...dataRef.current, settings };
    dataRef.current = nextData;
    setData(nextData);
    queueRef.current?.schedule(SETTINGS_KEY, settings);
    return settings;
  }

  // ---------- Edycja ćwiczeń ----------
  // Ćwiczenia z planu nie są zmieniane w miejscu: Twoje zmiany zapisują się
  // obok, w ustawieniach (nazwa w exerciseNames, reszta w exerciseOverrides),
  // więc zawsze można wrócić do wersji z planu.

  function saveExercise(exerciseId, values) {
    const custom = dataRef.current.settings.customExercises?.[exerciseId];
    if (custom) {
      updateSettings((settings) => ({
        ...settings,
        customExercises: { ...settings.customExercises, [exerciseId]: { ...custom, ...values } },
      }));
      return;
    }
    const plan = EXERCISES[exerciseId];
    updateSettings((settings) => {
      const names = { ...(settings.exerciseNames ?? {}) };
      if (values.name === plan.name) delete names[exerciseId];
      else names[exerciseId] = values.name;
      // Zapisujemy tylko to, co różni się od planu.
      const changed = {};
      for (const field of EDITABLE_FIELDS) {
        if (values[field] !== undefined && values[field] !== plan[field]) changed[field] = values[field];
      }
      const overrides = { ...(settings.exerciseOverrides ?? {}) };
      if (Object.keys(changed).length > 0) overrides[exerciseId] = changed;
      else delete overrides[exerciseId];
      return { ...settings, exerciseNames: names, exerciseOverrides: overrides };
    });
  }

  function resetExercise(exerciseId) {
    updateSettings((settings) => {
      const names = { ...(settings.exerciseNames ?? {}) };
      const overrides = { ...(settings.exerciseOverrides ?? {}) };
      delete names[exerciseId];
      delete overrides[exerciseId];
      return { ...settings, exerciseNames: names, exerciseOverrides: overrides };
    });
  }

  // Przesunięcie ćwiczenia w górę (-1) lub w dół (+1). Zapisujemy całą
  // kolejność dnia, więc obowiązuje we wszystkich tygodniach.
  function moveExercise(week, sessionId, exerciseId, direction) {
    const session = getSession(sessionId);
    const log = dataRef.current.logs[sessionKey(week, sessionId)];
    const ids = getSessionExerciseIds(session, dataRef.current.settings, log);
    const from = ids.indexOf(exerciseId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    updateSettings((settings) => ({ ...settings, sessionOrder: { ...settings.sessionOrder, [sessionId]: ids } }));
  }

  // Usunięcie ćwiczenia: "once" = tylko z tego treningu, "always" = z dnia
  // we wszystkich tygodniach. Odhaczone wcześniej serie zostają w historii.
  function removeExercise(week, sessionId, exerciseId, scope) {
    const session = getSession(sessionId);
    if (scope === "always") {
      updateSettings((settings) => {
        const next = { ...settings };
        const extras = settings.sessionExtras?.[sessionId] ?? [];
        if (extras.includes(exerciseId)) {
          next.sessionExtras = { ...settings.sessionExtras, [sessionId]: extras.filter((id) => id !== exerciseId) };
        }
        if (session.exerciseIds.includes(exerciseId)) {
          const removed = settings.sessionRemoved?.[sessionId] ?? [];
          next.sessionRemoved = { ...settings.sessionRemoved, [sessionId]: [...new Set([...removed, exerciseId])] };
        }
        return next;
      });
    }
    // W obu przypadkach ćwiczenie znika też z bieżącego treningu.
    updateSessionLog(week, sessionId, (log) => ({
      ...log,
      extraExerciseIds: (log.extraExerciseIds ?? []).filter((id) => id !== exerciseId),
      removedExerciseIds: [...new Set([...(log.removedExerciseIds ?? []), exerciseId])],
    }));
  }

  // Dodanie ćwiczenia: nowego, z planu (np. usuniętego albo z innego dnia)
  // lub dodanego wcześniej. "always" = w każdym tygodniu, "once" = tylko tu.
  function addExercise(week, sessionId, exercise, scope) {
    const session = getSession(sessionId);
    updateSettings((settings) => {
      const next = { ...settings };
      if (exercise.custom) next.customExercises = { ...settings.customExercises, [exercise.id]: exercise };
      if (scope === "always") {
        const removed = settings.sessionRemoved?.[sessionId] ?? [];
        if (removed.includes(exercise.id)) {
          next.sessionRemoved = { ...settings.sessionRemoved, [sessionId]: removed.filter((id) => id !== exercise.id) };
        } else if (!session.exerciseIds.includes(exercise.id)) {
          const extras = settings.sessionExtras?.[sessionId] ?? [];
          next.sessionExtras = { ...settings.sessionExtras, [sessionId]: [...new Set([...extras, exercise.id])] };
        }
      }
      return next;
    });
    updateSessionLog(week, sessionId, (log) => ({
      ...log,
      removedExerciseIds: (log.removedExerciseIds ?? []).filter((id) => id !== exercise.id),
      extraExerciseIds:
        scope === "once" ? [...new Set([...(log.extraExerciseIds ?? []), exercise.id])] : (log.extraExerciseIds ?? []),
    }));
  }

  // Oznacz / odznacz tydzień jako zrobiony poza appką. Po oznaczeniu
  // przechodzimy od razu do pierwszego nieskończonego treningu.
  function toggleWeekOutside(week) {
    const settings = updateSettings((current) => {
      const weeks = new Set(current.doneOutsideWeeks ?? []);
      if (weeks.has(week)) weeks.delete(week);
      else weeks.add(week);
      return { ...current, doneOutsideWeeks: [...weeks].sort((a, b) => a - b) };
    });
    if (settings.doneOutsideWeeks.includes(week)) {
      setSelected(findNextSession(dataRef.current.logs, settings));
      window.scrollTo(0, 0);
    }
  }

  // Wczytanie kopii albo wyczyszczenie - podmienia wszystkie treningi naraz.
  function replaceAllData(newData) {
    const oldLogs = dataRef.current.logs;
    dataRef.current = newData;
    setData(newData);
    const queue = queueRef.current;
    if (!queue) return;
    for (const key of Object.keys(oldLogs)) {
      if (!(key in newData.logs)) queue.schedule(key, null);
    }
    for (const [key, log] of Object.entries(newData.logs)) queue.schedule(key, log);
    queue.schedule(SETTINGS_KEY, newData.settings);
  }

  function enableLocalMode() {
    writeStorage(LOCAL_MODE_KEY, "1");
    setLocalMode(true);
  }

  function goToLogin() {
    writeStorage(LOCAL_MODE_KEY, null);
    setLocalMode(false);
  }

  async function signOut() {
    // Najpierw odłączamy kolejkę zapisów. Czyszczenie telefonu poniżej NIE może
    // trafić do chmury - inaczej wylogowanie skasowałoby Twoje treningi z bazy.
    queueRef.current?.stop();
    queueRef.current = null;
    await supabase.auth.signOut();
    // Po wylogowaniu czyścimy telefon, żeby kolejna osoba nie zobaczyła Twoich treningów.
    clearDirty();
    writeStorage(SYNCED_USER_KEY, null);
    setSyncStatus("connecting");
    const empty = emptyData();
    dataRef.current = empty;
    setData(empty);
    setSelected(findNextSession({}, {}));
  }

  function startTimer(seconds, label) {
    unlockAudio();
    setTimer({ endsAt: Date.now() + seconds * 1000, total: seconds, label });
  }

  function select(changes) {
    userNavigatedRef.current = true;
    setSelected((prev) => ({ ...prev, ...changes }));
  }

  function openSession(week, sessionId) {
    select({ week, sessionId });
    setTab("workout");
    window.scrollTo(0, 0);
  }

  if (!localMode && session === undefined) {
    return (
      <div className="splash">
        <Logo size={96} />
      </div>
    );
  }

  if (!localMode && session === null) {
    return <LoginView onUseLocal={enableLocalMode} />;
  }

  const activeSession = getSession(selected.sessionId);
  // Bez zalogowania nie ma czego synchronizować - etykietę wyliczamy w renderze.
  const effectiveStatus = userId ? syncStatus : "local";

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-row">
          <div className="app-brand">
            <Logo size={30} />
            <h1>Ławka 120</h1>
          </div>
          <SyncBadge status={effectiveStatus} />
        </div>
        <nav className="tabs" aria-label="Widoki">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "tab active" : "tab"}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={timer ? "with-timer" : ""}>
        <InstallHint />
        {tab === "workout" && (
          <>
            <WeekPicker logs={data.logs} settings={data.settings} week={selected.week} onChange={(week) => select({ week })} />
            <SessionTabs
              logs={data.logs}
              settings={data.settings}
              week={selected.week}
              sessionId={selected.sessionId}
              onChange={(sessionId) => select({ sessionId })}
            />
            <WorkoutView
              // key wymusza "świeży" komponent przy zmianie treningu
              key={sessionKey(selected.week, selected.sessionId)}
              logs={data.logs}
              week={selected.week}
              session={activeSession}
              settings={data.settings}
              onUpdateLog={(updater) => updateSessionLog(selected.week, selected.sessionId, updater)}
              onAddExercise={(exercise, scope) => addExercise(selected.week, selected.sessionId, exercise, scope)}
              onEditExercise={{
                save: saveExercise,
                reset: resetExercise,
                move: (exerciseId, direction) => moveExercise(selected.week, selected.sessionId, exerciseId, direction),
                remove: (exerciseId, scope) => removeExercise(selected.week, selected.sessionId, exerciseId, scope),
              }}
              onToggleWeekOutside={toggleWeekOutside}
              onStartTimer={startTimer}
            />
          </>
        )}
        {tab === "progress" && (
          <ProgressView logs={data.logs} settings={data.settings} onOpenSession={openSession} />
        )}
        {tab === "more" && (
          <MoreView
            data={data}
            account={{
              available: isSupabaseConfigured,
              email: session?.user?.email ?? null,
              hasUnsent: () => queueRef.current?.hasUnsent() ?? false,
              onSignIn: goToLogin,
              onSignOut: signOut,
            }}
            onReplaceData={replaceAllData}
          />
        )}
      </main>

      {timer && (
        <RestTimer
          timer={timer}
          onAdd={(seconds) => setTimer((prev) => ({ ...prev, endsAt: prev.endsAt + seconds * 1000 }))}
          onClose={() => setTimer(null)}
        />
      )}
    </div>
  );
}

export default App;
