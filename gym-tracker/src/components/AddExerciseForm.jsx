import { useState } from "react";
import { getSessionExerciseIds } from "../utils/training";

const REST_OPTIONS = [30, 45, 60, 90, 120, 180];

function formatRestOption(seconds) {
  return seconds >= 120 ? `${seconds / 60} min` : `${seconds} s`;
}

// Unikalne id, np. "custom-lx2k9f-a8c1". Pod nim zapisują się serie i historia,
// więc późniejsza zmiana nazwy niczego nie psuje.
function createExerciseId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// Formularz "+ Dodaj ćwiczenie" na dole treningu.
function AddExerciseForm({ session, week, settings, onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("3");
  const [repsMin, setRepsMin] = useState("12");
  const [repsMax, setRepsMax] = useState("15");
  const [rest, setRest] = useState("60");
  const [bodyweight, setBodyweight] = useState(false);
  const [scope, setScope] = useState("always"); // "always" | "once"
  const [error, setError] = useState("");

  // Ćwiczenia dodane wcześniej (np. w innym dniu), których tu jeszcze nie ma.
  const inSession = getSessionExerciseIds(session, settings, null);
  const reusable = Object.values(settings.customExercises ?? {}).filter((exercise) => !inSession.includes(exercise.id));

  function handleSubmit(event) {
    event.preventDefault();
    const min = parseInt(repsMin, 10);
    const max = parseInt(repsMax || repsMin, 10);
    const setCount = parseInt(sets, 10);
    if (!name.trim()) return setError("Wpisz nazwę ćwiczenia.");
    if (!(setCount >= 1 && setCount <= 10)) return setError("Liczba serii: od 1 do 10.");
    if (!(min >= 1) || !(max >= min)) return setError("Powtórzenia: „od” musi być mniejsze lub równe „do”.");

    onAdd(
      {
        id: createExerciseId(),
        name: name.trim(),
        sets: setCount,
        repsMin: min,
        repsMax: max,
        rest: parseInt(rest, 10),
        custom: true,
        // Dopisane ćwiczenia nie wliczają się do "Odhaczone serie: x / y",
        // żeby dodanie np. brzucha nie robiło skończonych tygodni nieskończonymi.
        optional: true,
        ...(bodyweight
          ? { bodyweight: true, startWeight: 0, weightLabel: "kg dodatk." }
          : { increment: 2.5 }),
      },
      scope
    );
  }

  return (
    <form className="exercise-card add-exercise-form" onSubmit={handleSubmit}>
      <h3>Nowe ćwiczenie</h3>

      {reusable.length > 0 && (
        <div className="reuse">
          <span className="small muted">Dodane wcześniej:</span>
          <div className="reuse-chips">
            {reusable.map((exercise) => (
              <button key={exercise.id} type="button" className="chip" onClick={() => onAdd(exercise, scope)}>
                + {exercise.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="field">
        <span>Nazwa</span>
        <input
          id="add-exercise-name"
          type="text"
          maxLength={60}
          placeholder="Np. Brzuch: spięcia na wyciągu"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Serie</span>
          <input
            id="add-exercise-sets"
            type="text"
            inputMode="numeric"
            value={sets}
            onChange={(event) => setSets(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Powt. od</span>
          <input
            id="add-exercise-reps-min"
            type="text"
            inputMode="numeric"
            value={repsMin}
            onChange={(event) => setRepsMin(event.target.value)}
          />
        </label>
        <label className="field">
          <span>do</span>
          <input
            id="add-exercise-reps-max"
            type="text"
            inputMode="numeric"
            value={repsMax}
            onChange={(event) => setRepsMax(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Przerwa</span>
          <select id="add-exercise-rest" value={rest} onChange={(event) => setRest(event.target.value)}>
            {REST_OPTIONS.map((seconds) => (
              <option key={seconds} value={seconds}>
                {formatRestOption(seconds)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="choice">
        <legend>Rodzaj</legend>
        <label>
          <input type="radio" name="add-exercise-kind" checked={!bodyweight} onChange={() => setBodyweight(false)} />
          Z ciężarem
        </label>
        <label>
          <input type="radio" name="add-exercise-kind" checked={bodyweight} onChange={() => setBodyweight(true)} />
          Masa ciała (kg = obciążenie dodatkowe)
        </label>
      </fieldset>

      <fieldset className="choice">
        <legend>Gdzie dodać</legend>
        <label>
          <input type="radio" name="add-exercise-scope" checked={scope === "always"} onChange={() => setScope("always")} />
          W każdym tygodniu, dzień {session.tab}
        </label>
        <label>
          <input type="radio" name="add-exercise-scope" checked={scope === "once"} onChange={() => setScope("once")} />
          Tylko w tym treningu (T{week} · {session.tab})
        </label>
      </fieldset>

      {error && <p className="form-error">{error}</p>}

      <div className="button-row">
        <button type="submit" className="primary">
          Dodaj
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
}

export default AddExerciseForm;
