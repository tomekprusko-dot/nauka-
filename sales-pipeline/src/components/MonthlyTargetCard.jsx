import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

const MONTH_NAMES = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];

function MonthlyTargetCard({ target, realization, onChangeTarget }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(target);

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const percent = target > 0 ? Math.min(100, (realization / target) * 100) : 0;

  function handleSubmit(event) {
    event.preventDefault();
    onChangeTarget(Number(draft) || 0);
    setIsEditing(false);
  }

  return (
    <div className="summary-card target-card">
      <span className="summary-label">Cel na {monthLabel}</span>

      {isEditing ? (
        <form className="target-edit-form" onSubmit={handleSubmit}>
          <input
            type="number"
            min="0"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-secondary">Zapisz</button>
        </form>
      ) : (
        <>
          <span className="summary-value">
            {formatCurrency(realization)}
            {target > 0 && <span className="target-of"> / {formatCurrency(target)}</span>}
          </span>

          {target > 0 ? (
            <div className="target-progress-track">
              <div className="target-progress-fill" style={{ width: `${percent}%` }} />
            </div>
          ) : (
            <p className="empty-state small">Nie ustawiono jeszcze celu.</p>
          )}

          <button type="button" className="target-edit-link" onClick={() => { setDraft(target); setIsEditing(true); }}>
            {target > 0 ? "Zmień cel" : "Ustaw cel"}
          </button>
        </>
      )}
    </div>
  );
}

export default MonthlyTargetCard;
