import { useState } from "react";

const MAX_LENGTH = 60;

// Nazwa ćwiczenia z ołówkiem do edycji. Enter zapisuje, Escape anuluje.
function ExerciseName({ exercise, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(exercise.name);
  const inputId = `rename-${exercise.id}`;

  function startEditing() {
    setDraft(exercise.name);
    setEditing(true);
  }

  function save(event) {
    event.preventDefault();
    onRename(draft);
    setEditing(false);
  }

  function restore() {
    onRename("");
    setEditing(false);
  }

  if (editing) {
    return (
      <form className="rename-form" onSubmit={save}>
        <label htmlFor={inputId} className="visually-hidden">
          Nazwa ćwiczenia
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          maxLength={MAX_LENGTH}
          autoFocus
          enterKeyHint="done"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false);
          }}
        />
        <div className="rename-actions">
          <button type="submit" className="primary small-button">
            Zapisz
          </button>
          <button type="button" className="secondary small-button" onClick={() => setEditing(false)}>
            Anuluj
          </button>
          {exercise.originalName && (
            <button type="button" className="link-button" onClick={restore}>
              Przywróć nazwę z planu
            </button>
          )}
        </div>
        <p className="small muted">Historia i podpowiedzi ciężarów zostają, zmienia się tylko nazwa.</p>
      </form>
    );
  }

  return (
    <div className="exercise-name">
      <h3>
        {exercise.name}
        {exercise.optional && !exercise.custom && <span className="tag">opcjonalne</span>}
      </h3>
      <button type="button" className="icon-button" aria-label={`Zmień nazwę: ${exercise.name}`} onClick={startEditing}>
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

export default ExerciseName;
