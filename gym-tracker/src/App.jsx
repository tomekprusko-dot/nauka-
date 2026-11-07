import { useEffect, useState } from "react";
import WeekPicker from "./components/WeekPicker";
import SessionTabs from "./components/SessionTabs";
import WorkoutView from "./components/WorkoutView";
import ProgressView from "./components/ProgressView";
import MoreView from "./components/MoreView";
import RestTimer from "./components/RestTimer";
import { loadData, saveData } from "./utils/storage";
import { findNextSession, getSession, sessionKey } from "./utils/training";
import "./App.css";

const TABS = [
  { id: "workout", label: "Trening" },
  { id: "progress", label: "Postęp" },
  { id: "more", label: "Więcej" },
];

function App() {
  // Funkcja w useState() uruchamia się tylko raz - przy pierwszym renderze.
  const [data, setData] = useState(() => loadData());
  // Po otwarciu appki od razu pokazujemy pierwszy nieskończony trening.
  const [selected, setSelected] = useState(() => findNextSession(data.logs));
  const [tab, setTab] = useState("workout");
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Wspólna funkcja do zmiany zapisu jednego treningu. "updater" dostaje
  // stary zapis i zwraca nowy - nigdy nie zmieniamy obiektów w miejscu.
  function updateSessionLog(week, sessionId, updater) {
    const key = sessionKey(week, sessionId);
    setData((prev) => ({
      ...prev,
      logs: { ...prev.logs, [key]: updater(prev.logs[key] ?? { exercises: {} }) },
    }));
  }

  function startTimer(seconds, label) {
    setTimer({ endsAt: Date.now() + seconds * 1000, total: seconds, label });
  }

  function openSession(week, sessionId) {
    setSelected({ week, sessionId });
    setTab("workout");
    window.scrollTo(0, 0);
  }

  const session = getSession(selected.sessionId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Wyciskanie 120 kg</h1>
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
            <WeekPicker
              logs={data.logs}
              week={selected.week}
              onChange={(week) => setSelected((prev) => ({ ...prev, week }))}
            />
            <SessionTabs
              logs={data.logs}
              week={selected.week}
              sessionId={selected.sessionId}
              onChange={(sessionId) => setSelected((prev) => ({ ...prev, sessionId }))}
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
        {tab === "more" && <MoreView data={data} onReplaceData={setData} />}
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
