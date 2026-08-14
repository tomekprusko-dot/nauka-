import { useState } from "react";

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function NotesSection({ notes, onAdd, onDelete }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <section className="detail-section">
      <h3>Notatki</h3>

      <form className="inline-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Dodaj notatkę..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
        />
        <button type="submit" className="btn-secondary">Dodaj notatkę</button>
      </form>

      {notes.length === 0 ? (
        <p className="empty-state">Brak notatek.</p>
      ) : (
        <ul className="notes-list">
          {notes
            .slice()
            .reverse()
            .map((note) => (
              <li key={note.id} className="note-item">
                <div className="note-text">{note.text}</div>
                <div className="note-meta">
                  <span>{formatDate(note.createdAt)}</span>
                  <button type="button" onClick={() => onDelete(note.id)}>
                    Usuń
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

export default NotesSection;
