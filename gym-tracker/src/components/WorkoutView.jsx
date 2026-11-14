import { useState } from "react";
import AddExerciseForm from "./AddExerciseForm";
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
  isWeekDoneOutside,
  sessionKey,
  weekHasEntries,
} from "../utils/training";

function WorkoutView({
  logs,
  settings,
  week,
  session,
  onUpdateLog,
  onToggleWeekOutside,
  onAddExercise,
  onEditExercise,
  onStartTimer,
}) {
  const [adding, setAdding] = useState(false);
  const doneOutside = isWeekDoneOutside(settings, week);
  const log = logs[sessionKey(week, session.id)];
  const benchPlan = getBenchPlan(week);
  const { done, total } = getSessionProgress(logs, week, session, settings);
  const exercises = getSessionExercises(session, settings, log);
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

      {doneOutside && (
        <div className="callout success week-outside">
          <p>Tydzień {week} oznaczony jako zrobiony poza appką. Appka startuje od kolejnego tygodnia.</p>
          <button type="button" className="link-button" onClick={() => onToggleWeekOutside(week)}>
            Cofnij
          </button>
        </div>
      )}

      {!doneOutside && !session.home && !weekHasEntries(logs, week) && (
        <button type="button" className="link-button week-outside-link" onClick={() => onToggleWeekOutside(week)}>
          Ten tydzień masz już za sobą? Oznacz jako zrobiony poza appką
        </button>
      )}

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
          {exercises.map((exercise, index) => {
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
                editor={{
                  sessionTab: session.tab,
                  canMoveUp: index > 0,
                  canMoveDown: index < exercises.length - 1,
                  onSave: (values) => onEditExercise.save(exercise.id, values),
                  onReset: () => onEditExercise.reset(exercise.id),
                  onMove: (direction) => onEditExercise.move(exercise.id, direction),
                  onRemove: (scope) => onEditExercise.remove(exercise.id, scope),
                }}
                onStartTimer={onStartTimer}
              />
            );
          })}

          {adding ? (
            <AddExerciseForm
              session={session}
              week={week}
              settings={settings}
              log={log}
              onAdd={(exercise, scope) => {
                onAddExercise(exercise, scope);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button type="button" className="add-exercise-button" onClick={() => setAdding(true)}>
              + Dodaj ćwiczenie
            </button>
          )}
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
