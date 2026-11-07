// Mała etykieta w nagłówku: czy wpisy są już bezpieczne w chmurze.
const LABELS = {
  connecting: "Łączenie…",
  saving: "Zapisywanie…",
  saved: "Zsynchronizowano",
  offline: "Offline, wyślę później",
  error: "Błąd zapisu",
  local: "Tylko ten telefon",
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
