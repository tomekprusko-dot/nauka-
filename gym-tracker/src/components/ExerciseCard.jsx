import SetRow from "./SetRow";
import ExerciseName from "./ExerciseName";
import { formatNumber, parseNumber } from "../utils/numbers";
import { getTargetLabel } from "../utils/training";
import { BODYWEIGHT_PROGRESSIONS } from "../data/plan";

function formatRest(seconds) {
  return seconds >= 120 && seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`;
}

// "Ostatnio: 30 kg × 10, 10, 9"
function describePrevious(sets, exercise) {
  const weights = [...new Set(sets.map((set) => parseNumber(set.weight)).filter((w) => !Number.isNaN(w)))];
  const reps = sets.map((set) => set.reps || "?").join(", ");
  if (exercise.bodyweight && weights.every((w) => w === 0)) return `${reps} powt.`;
  return `${weights.map(formatNumber).join(" / ")} kg × ${reps}`;
}

function ExerciseCard({
  number,
  exercise,
  week,
  sets,
  previousSets,
  hint,
  onChange,
  onRename,
  onRemove,
  removeLabel,
  onStartTimer,
}) {
  const doneCount = sets.filter((set) => set.done).length;
  const complete = doneCount === sets.length;

  function updateSet(index, changes) {
    onChange(sets.map((set, i) => (i === index ? { ...set, ...changes } : set)));
  }

  function toggleDone(index) {
    const set = sets[index];
    const nowDone = !set.done;
    const changes = { done: nowDone };
    // Jeśli nie wpisałeś powtórzeń, przyjmujemy dolną granicę zakresu z planu.
    if (nowDone && set.reps === "") changes.reps = String(exercise.repsMin);
    updateSet(index, changes);
    // Po ostatniej serii nie ma sensu odpalać przerwy.
    const isLastOpenSet = sets.filter((s, i) => i !== index && !s.done).length === 0;
    if (nowDone && !isLastOpenSet) onStartTimer(exercise.rest, exercise.name);
  }

  // Ten sam ciężar we wszystkich seriach naraz - wygodne przy zmianie hantli.
  function applyWeightToAll(weight) {
    onChange(sets.map((set) => (set.done ? set : { ...set, weight })));
  }

  return (
    <article className={`exercise-card ${complete ? "complete" : ""} ${exercise.main ? "main" : ""}`}>
      <header className="exercise-header">
        <span className="exercise-number">{complete ? "✓" : number}</span>
        <div className="exercise-title">
          <ExerciseName exercise={exercise} onRename={onRename} />
          {exercise.custom && <span className="tag custom-tag">dodane przez Ciebie</span>}
          <p className="muted small">
            <strong>{getTargetLabel(exercise, week)}</strong> · przerwa {formatRest(exercise.rest)}
          </p>
        </div>
      </header>

      {previousSets && <p className="small muted">Ostatnio: {describePrevious(previousSets, exercise)}</p>}
      {hint && <p className="hint">↑ {hint.text}</p>}
      {hint && !exercise.increment && exercise.id.startsWith("pushup") && (
        <p className="small muted">Pomysły: {BODYWEIGHT_PROGRESSIONS.join("; ")}.</p>
      )}

      {exercise.note && (
        <details className="exercise-note">
          <summary>Wskazówki</summary>
          <p>{exercise.note}</p>
        </details>
      )}

      <div className="sets">
        <div className="set-row set-head" aria-hidden="true">
          <span>Seria</span>
          <span>{exercise.weightLabel ?? "kg"}</span>
          <span>Powt.</span>
          <span />
        </div>
        {sets.map((set, index) => (
          <SetRow
            key={index}
            index={index}
            set={set}
            repsPlaceholder={exercise.repsMin === exercise.repsMax ? String(exercise.repsMin) : `${exercise.repsMin}–${exercise.repsMax}`}
            onChange={(changes) => updateSet(index, changes)}
            onToggle={() => toggleDone(index)}
            onApplyWeightToAll={index === 0 && sets.length > 1 ? () => applyWeightToAll(set.weight) : null}
          />
        ))}
      </div>
      {onRemove && (
        <button type="button" className="link-button remove-exercise" onClick={onRemove}>
          {removeLabel}
        </button>
      )}
    </article>
  );
}

export default ExerciseCard;
