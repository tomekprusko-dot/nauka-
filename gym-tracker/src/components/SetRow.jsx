// Jeden wiersz serii: ciężar, powtórzenia i przycisk "zrobione".
// inputMode="decimal" otwiera na telefonie klawiaturę numeryczną z przecinkiem.
function SetRow({ index, set, repsPlaceholder, onChange, onToggle, onApplyWeightToAll }) {
  return (
    <div className={`set-row ${set.done ? "done" : ""}`}>
      <span className="set-index">{index + 1}</span>
      <span className="set-weight">
        <input
          type="text"
          inputMode="decimal"
          aria-label={`Ciężar, seria ${index + 1}`}
          value={set.weight}
          placeholder="kg"
          onChange={(event) => onChange({ weight: event.target.value })}
        />
        {onApplyWeightToAll && (
          <button
            type="button"
            className="link-button"
            title="Ustaw ten ciężar we wszystkich seriach"
            onClick={onApplyWeightToAll}
          >
            wszystkie
          </button>
        )}
      </span>
      <input
        type="text"
        inputMode="numeric"
        aria-label={`Powtórzenia, seria ${index + 1}`}
        value={set.reps}
        placeholder={repsPlaceholder}
        onChange={(event) => onChange({ reps: event.target.value })}
      />
      <button
        type="button"
        className={`check-button ${set.done ? "checked" : ""}`}
        aria-pressed={set.done}
        aria-label={set.done ? `Cofnij serię ${index + 1}` : `Zrobione: seria ${index + 1}`}
        onClick={onToggle}
      >
        ✓
      </button>
    </div>
  );
}

export default SetRow;
