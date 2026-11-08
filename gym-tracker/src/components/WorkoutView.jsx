import ExerciseCard from "./ExerciseCard";
import MaxTestView from "./MaxTestView";
import {
  findPreviousSets,
  getBenchPlan,
  getBenchResult,
  getExerciseSets,
  getProgressionHint,
  getSessionExercises,
  getSessionProgress,
  isMaxTestSession,
  sessionKey,
} from "../utils/training";

function WorkoutView({ logs, week, session, exerciseNames, onUpdateLog, onRenameExercise, onStartTimer }) {
  const log = logs[sessionKey(week, session.id)];
  const benchPlan = getBenchPlan(week);
  const { done, total } = getSessionProgress(logs, week, session);
  const percent = total ? Math.round((done / total) * 100) : 0;

  // Zasada z planu: nieudany tydzień wyciskania powtarzamy, zamiast iść dalej.
  const previousBench = week > 1 ? getBenchResult(logs, week - 1) : null;
  const showRepeatWarning = session.id === "A" && previousBench?.started && !previousBench.allHit;

  function updateSets(exerciseId, sets) {
    onUpdateLog((prev) => ({
      ...prev,
      exercises: { ...prev.exercises, [exerciseId]: { sets } },
    }));
  }

  return (
    <section className="workout">
      <div className="workout-header">
        <h2>{session.title}</h2>
        <p className="muted">
          Tydzień {week}
          {benchPlan.note && !session.home ? ` · ${benchPlan.note}` : ""}
        </p>
        <div className="progress-bar" aria-label={`Postęp: ${percent}%`}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="muted small">
          {isMaxTestSession(week, session.id)
            ? done ? "Test zakończony" : "Test maksa w toku"
            : `Odhaczone serie: ${done} / ${total}`}
        </p>
      </div>

      {showRepeatWarning && (
        <div className="callout warning">
          W tygodniu {week - 1} nie weszły wszystkie powtórzenia wyciskania. Plan mówi: powtórz tamten
          tydzień ({String(previousBench.plan.weight).replace(".", ",")} kg, {previousBench.plan.sets} ×{" "}
          {previousBench.plan.reps}) zamiast iść dalej.
        </div>
      )}

      {session.info && <p className="callout">{session.info}</p>}

      {isMaxTestSession(week, session.id) ? (
        <MaxTestView log={log} onUpdateLog={onUpdateLog} onStartTimer={onStartTimer} />
      ) : (
        <>
          {session.warmup && <p className="callout subtle">{session.warmup}</p>}
          {getSessionExercises(session, exerciseNames).map((exercise, index) => {
            const previous = findPreviousSets(logs, exercise.id, week, session.id);
            return (
              <ExerciseCard
                key={exercise.id}
                number={index + 1}
                exercise={exercise}
                week={week}
                sets={getExerciseSets(logs, exercise, week, session.id)}
                previousSets={previous}
                hint={getProgressionHint(exercise, previous)}
                onChange={(sets) => updateSets(exercise.id, sets)}
                onRename={(name) => onRenameExercise(exercise.id, name)}
                onStartTimer={onStartTimer}
              />
            );
          })}
        </>
      )}

      <label className="note-field">
        <span>Notatka do treningu</span>
        <textarea
          rows={3}
          placeholder="Np. jak się czułeś, co bolało, ile spałeś…"
          value={log?.note ?? ""}
          onChange={(event) => onUpdateLog((prev) => ({ ...prev, note: event.target.value }))}
        />
      </label>
    </section>
  );
}

export default WorkoutView;
