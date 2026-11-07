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
import { emptyData, loadData, saveData } from "./utils/storage";
import { unlockAudio } from "./utils/sound";
import { fetchAllLogs, isSupabaseConfigured, subscribeToChanges, supabase, writeLog } from "./sync/supabase";
import { clearDirty, createSyncQueue } from "./sync/syncQueue";
import { findNextSession, getSession, sessionKey } from "./utils/training";
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
  const [selected, setSelected] = useState(() => findNextSession(data.logs));
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
    for (const key of queue.dirtyKeys()) queue.schedule(key, dataRef.current.logs[key] ?? null);

    async function pull() {
      try {
        const remoteLogs = await fetchAllLogs();
        if (cancelled) return;

        // Pierwsze logowanie na tym telefonie: treningi wpisane wcześniej
        // lokalnie (a których nie ma w chmurze) wysyłamy, zamiast je zgubić.
        if (isFirstPull && readStorage(SYNCED_USER_KEY) !== userId) {
          for (const [key, log] of Object.entries(dataRef.current.logs)) {
            if (!(key in remoteLogs)) queue.schedule(key, log);
          }
          writeStorage(SYNCED_USER_KEY, userId);
        }

        setData((prev) => {
          const logs = { ...remoteLogs };
          // Treningi z niewysłanymi zmianami zostają w wersji z ekranu.
          for (const key of Object.keys(prev.logs)) {
            if (queue.isBusy(key)) logs[key] = prev.logs[key];
          }
          return { ...prev, logs };
        });

        if (isFirstPull) {
          isFirstPull = false;
          if (!userNavigatedRef.current) setSelected(findNextSession(remoteLogs));
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
    await supabase.auth.signOut();
    // Po wylogowaniu czyścimy telefon, żeby kolejna osoba nie zobaczyła Twoich treningów.
    clearDirty();
    writeStorage(SYNCED_USER_KEY, null);
    setSyncStatus("connecting");
    replaceAllData(emptyData());
    setSelected(findNextSession({}));
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
            <WeekPicker logs={data.logs} week={selected.week} onChange={(week) => select({ week })} />
            <SessionTabs
              logs={data.logs}
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
              onUpdateLog={(updater) => updateSessionLog(selected.week, selected.sessionId, updater)}
              onStartTimer={startTimer}
            />
          </>
        )}
        {tab === "progress" && <ProgressView logs={data.logs} onOpenSession={openSession} />}
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
