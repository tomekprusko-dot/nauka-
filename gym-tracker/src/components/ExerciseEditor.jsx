import { useState } from "react";
import { toInputValue } from "../utils/numbers";

const REST_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180, 240];
const MAX_NAME = 60;

function formatRest(seconds) {
  return seconds >= 120 && seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`;
}

// Nazwa ćwiczenia z ołówkiem. Ołówek otwiera pełną edycję: nazwa, serie,
// powtórzenia, przerwa (i ciężar przy ćwiczeniu ze stałym ciężarem),
// kolejność w dniu i usuwanie.
function ExerciseEditor({ exercise, sessionTab, canMoveUp, canMoveDown, onSave, onReset, onMove, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const id = exercise.id;
  const hasFixedWeight = exercise.fixedWeight !== undefined;

  function startEditing() {
    setForm({
      name: exercise.name,
      sets: String(exercise.sets ?? ""),
      repsMin: String(exercise.repsMin ?? ""),
      repsMax: String(exercise.repsMax ?? ""),
      rest: String(exercise.rest),
      fixedWeight: hasFixedWeight ? toInputValue(exercise.fixedWeight) : "",
    });
    setError("");
    setConfirmRemove(false);
    setEditing(true);
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function save(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return setError("Wpisz nazwę ćwiczenia.");
    if (exercise.main) {
      onSave({ name });
      setEditing(false);
      return;
    }
    const sets = parseInt(form.sets, 10);
    const repsMin = parseInt(form.repsMin, 10);
    const repsMax = parseInt(form.repsMax || form.repsMin, 10);
    const rest = parseInt(form.rest, 10);
    if (!(sets >= 1 && sets <= 10)) return setError("Liczba serii: od 1 do 10.");
    if (!(repsMin >= 1) || !(repsMax >= repsMin)) return setError("Powtórzenia: „od” musi być mniejsze lub równe „do”.");
    const values = { name, sets, repsMin, repsMax, rest };
    if (hasFixedWeight) {
      const weight = parseFloat(form.fixedWeight.replace(",", "."));
      if (!(weight >= 0)) return setError("Wpisz ciężar w kg.");
      values.fixedWeight = weight;
    }
    onSave(values);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="exercise-name">
        <h3>
          {exercise.name}
          {exercise.optional && !exercise.custom && <span className="tag">opcjonalne</span>}
          {exercise.edited && <span className="tag">zmienione</span>}
        </h3>
        <button type="button" className="icon-button" aria-label={`Edytuj ćwiczenie: ${exercise.name}`} onClick={startEditing}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {exercise.originalName && <p className="small muted original-name">W planie: {exercise.originalName}</p>}
      </div>
    );
  }

  // Wartość przerwy spoza listy (np. 75 s z planu) też musi dać się wybrać.
  const restOptions = REST_OPTIONS.includes(Number(form.rest)) ? REST_OPTIONS : [...REST_OPTIONS, Number(form.rest)].sort((a, b) => a - b);

  return (
    <form className="exercise-editor" onSubmit={save}>
      <label className="field">
        <span>Nazwa</span>
        <input
          id={`edit-${id}-name`}
          type="text"
          maxLength={MAX_NAME}
          autoFocus
          enterKeyHint="done"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false);
          }}
        />
      </label>

      {exercise.main ? (
        <p className="small muted">
          Serie i ciężary głównego wyciskania wynikają z progresji do 120 kg, więc tu zmienisz tylko nazwę.
        </p>
      ) : (
        <div className={`field-row ${hasFixedWeight ? "with-weight" : ""}`}>
          <label className="field">
            <span>Serie</span>
            <input id={`edit-${id}-sets`} type="text" inputMode="numeric" value={form.sets} onChange={(event) => update("sets", event.target.value)} />
          </label>
          <label className="field">
            <span>Powt. od</span>
            <input id={`edit-${id}-reps-min`} type="text" inputMode="numeric" value={form.repsMin} onChange={(event) => update("repsMin", event.target.value)} />
          </label>
          <label className="field">
            <span>do</span>
            <input id={`edit-${id}-reps-max`} type="text" inputMode="numeric" value={form.repsMax} onChange={(event) => update("repsMax", event.target.value)} />
          </label>
          <label className="field">
            <span>Przerwa</span>
            <select id={`edit-${id}-rest`} value={form.rest} onChange={(event) => update("rest", event.target.value)}>
              {restOptions.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {formatRest(seconds)}
                </option>
              ))}
            </select>
          </label>
          {hasFixedWeight && (
            <label className="field">
              <span>Ciężar (kg)</span>
              <input id={`edit-${id}-weight`} type="text" inputMode="decimal" value={form.fixedWeight} onChange={(event) => update("fixedWeight", event.target.value)} />
            </label>
          )}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="button-row">
        <button type="submit" className="primary small-button">
          Zapisz
        </button>
        <button type="button" className="secondary small-button" onClick={() => setEditing(false)}>
          Anuluj
        </button>
      </div>

      <div className="editor-tools">
        <span className="small muted">Kolejność:</span>
        <button type="button" className="secondary small-button" disabled={!canMoveUp} onClick={() => onMove(-1)}>
          ↑ Wyżej
        </button>
        <button type="button" className="secondary small-button" disabled={!canMoveDown} onClick={() => onMove(1)}>
          ↓ Niżej
        </button>
      </div>

      {(exercise.originalName || exercise.edited) && (
        <button
          type="button"
          className="link-button left"
          onClick={() => {
            onReset();
            setEditing(false);
          }}
        >
          Przywróć ustawienia z planu
        </button>
      )}

      {!exercise.main &&
        (confirmRemove ? (
          <div className="remove-box">
            <p className="small">Usunąć „{exercise.name}”? Odhaczone wcześniej serie zostaną w historii.</p>
            <div className="button-row">
              <button type="button" className="danger small-button" onClick={() => onRemove("once")}>
                Tylko z tego treningu
              </button>
              <button type="button" className="danger small-button" onClick={() => onRemove("always")}>
                Z dnia {sessionTab} (wszystkie tygodnie)
              </button>
              <button type="button" className="secondary small-button" onClick={() => setConfirmRemove(false)}>
                Nie usuwaj
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="link-button left danger-link" onClick={() => setConfirmRemove(true)}>
            Usuń ćwiczenie…
          </button>
        ))}

      <p className="small muted">Historia i podpowiedzi ciężarów zostają po każdej zmianie.</p>
    </form>
  );
}

export default ExerciseEditor;
