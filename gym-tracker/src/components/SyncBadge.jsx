// Mała etykieta w nagłówku: czy wpisy są już bezpieczne na koncie.
const LABELS = {
  connecting: "Łączenie…",
  saving: "Zapisywanie…",
  saved: "Zapisano na koncie",
  error: "Błąd zapisu",
  local: "Tylko to urządzenie",
};

function SyncBadge({ status }) {
  return (
    <span className={`sync-badge ${status}`} role="status">
      <span className="sync-dot" aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}

export default SyncBadge;
