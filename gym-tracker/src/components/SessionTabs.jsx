import { SESSIONS } from "../data/plan";
import { getSessionProgress } from "../utils/training";

// Wybór treningu w tygodniu: A, B i sesje pompek w domu.
function SessionTabs({ logs, week, sessionId, onChange }) {
  return (
    <div className="session-tabs">
      {SESSIONS.map((session) => {
        const { done, total } = getSessionProgress(logs, week, session);
        const complete = total > 0 && done >= total;
        return (
          <button
            key={session.id}
            type="button"
            className={`session-tab ${session.id === sessionId ? "active" : ""} ${complete ? "complete" : ""}`}
            onClick={() => onChange(session.id)}
          >
            <span className="session-tab-name">
              {complete ? "✓ " : ""}
              {session.tab}
            </span>
            <span className="session-tab-when">{session.when}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SessionTabs;
