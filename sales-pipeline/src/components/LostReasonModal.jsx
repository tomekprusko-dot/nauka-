import { useState } from "react";
import { LOST_REASONS } from "../data/lostReasons";

function LostReasonModal({ dealClient, onConfirm, onCancel }) {
  const [reason, setReason] = useState(LOST_REASONS[0]);

  function handleSubmit(event) {
    event.preventDefault();
    onConfirm(reason);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal-panel" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Dlaczego "{dealClient}" został przegrany?</h3>
        <p className="modal-subtitle">Pomoże Ci to później zobaczyć, co najczęściej blokuje sprzedaż.</p>

        <select value={reason} onChange={(event) => setReason(event.target.value)} autoFocus>
          {LOST_REASONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Oznacz jako przegrany</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Anuluj</button>
        </div>
      </form>
    </div>
  );
}

export default LostReasonModal;
