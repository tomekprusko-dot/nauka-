import { useEffect, useRef, useState } from "react";
import WeekPicker from "./components/WeekPicker";
import SessionTabs from "./components/SessionTabs";
import WorkoutView from "./components/WorkoutView";
import ProgressView from "./components/ProgressView";
import MoreView from "./components/MoreView";
import RestTimer from "./components/RestTimer";
import SyncBadge from "./components/SyncBadge";
import { loadData, saveData } from "./utils/storage";
import { connectCloud, createCloudWriter, LOGS_COLLECTION } from "./utils/cloud";
import { findNextSession, getSession, sessionKey } from "./utils/training";
import "./App.css";

const TABS = [
  { id: "workout", label: "Trening" },
  { id: "progress", label: "Postęp" },
  { id: "more", label: "Więcej" },
];

function App() {
  // Funkcja w useState() uruchamia się tylko raz - przy pierwszym renderze.
  // localStorage służy tu jako szybka kopia: ekran pokazuje się od razu,
  // a dane z konta dochodzą chwilę później.
  const [data, setData] = useState(() => loadData());
  const [selected, setSelected] = useState(() => findNextSession(data.logs));
  const [tab, setTab] = useState("workout");
  const [timer, setTimer] = useState(null);
  // "connecting" -> "saved" / "saving" / "error", albo "local" (poza Claude)
  const [syncStatus, setSyncStatus] = useState("connecting");

  // useRef trzyma wartość między renderami, ale jej zmiana NIE odświeża ekranu.
  // dataRef pozwala odczytać najnowsze dane poza renderem (np. w obsłudze kliknięcia).
  const dataRef = useRef(data);
  const writerRef = useRef(null);
  const userNavigatedRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
    saveData(data);
  }, [data]);

  // Połączenie z bazą na koncie - raz, przy starcie appki.
  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    connectCloud().then((db) => {
      if (cancelled) return;
      if (!db) {
        setSyncStatus("local");
        return;
      }
      const writer = createCloudWriter(db, setSyncStatus);
      writerRef.current = writer;
      let firstSnapshot = true;

      // onSnapshot wywołuje się od razu z aktualnymi danymi, a potem przy
      // każdej zmianie - także z innego urządzenia (np. telefon i komputer).
      unsubscribe = db.collection(LOGS_COLLECTION).onSnapshot(
        (snapshot) => {
          const cloudLogs = {};
          snapshot.docs.forEach((doc) => {
            cloudLogs[doc.id] = doc.data();
          });
          setData((prev) => {
            const logs = { ...cloudLogs };
            // Treningi z niezapisanymi zmianami zostawiamy w wersji z ekranu.
            for (const key of Object.keys(prev.logs)) {
              if (writer.isBusy(key)) logs[key] = prev.logs[key];
            }
            return { ...prev, logs };
          });
          if (firstSnapshot) {
            firstSnapshot = false;
            setSyncStatus((status) => (status === "connecting" ? "saved" : status));
            if (!userNavigatedRef.current) setSelected(findNextSession(cloudLogs));
          }
        },
        () => setSyncStatus("error")
      );
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Wspólna funkcja do zmiany zapisu jednego treningu. "updater" dostaje
  // stary zapis i zwraca nowy - nigdy nie zmieniamy obiektów w miejscu.
  function updateSessionLog(week, sessionId, updater) {
    const key = sessionKey(week, sessionId);
    const nextLog = updater(dataRef.current.logs[key] ?? { exercises: {} });
    const nextData = { ...dataRef.current, logs: { ...dataRef.current.logs, [key]: nextLog } };
    dataRef.current = nextData;
    setData(nextData);
    writerRef.current?.schedule(key, nextLog);
  }

  // Wczytanie kopii albo wyczyszczenie - podmienia wszystkie treningi naraz.
  function replaceAllData(newData) {
    const oldLogs = dataRef.current.logs;
    dataRef.current = newData;
    setData(newData);
    const writer = writerRef.current;
    if (!writer) return;
    for (const key of Object.keys(oldLogs)) {
      if (!(key in newData.logs)) writer.schedule(key, null);
    }
    for (const [key, log] of Object.entries(newData.logs)) writer.schedule(key, log);
  }

  function startTimer(seconds, label) {
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

  const session = getSession(selected.sessionId);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-row">
          <h1>Wyciskanie 120 kg</h1>
          <SyncBadge status={syncStatus} />
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
              session={session}
              onUpdateLog={(updater) => updateSessionLog(selected.week, selected.sessionId, updater)}
              onStartTimer={startTimer}
            />
          </>
        )}
        {tab === "progress" && <ProgressView logs={data.logs} onOpenSession={openSession} />}
        {tab === "more" && <MoreView data={data} syncStatus={syncStatus} onReplaceData={replaceAllData} />}
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
