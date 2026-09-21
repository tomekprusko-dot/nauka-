import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function VocabReview({ refreshKey }) {
  const [due, setDue] = useState([]);
  const [all, setAll] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [dueRes, allRes] = await Promise.all([api.getDueVocab(), api.getVocab()]);
    setDue(dueRes.vocab);
    setAll(allRes.vocab);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const current = due[0];

  async function handleReview(quality) {
    if (!current) return;
    await api.reviewVocab(current.id, quality);
    setFlipped(false);
    setDue((prev) => prev.slice(1));
    load();
  }

  async function handleDelete(id) {
    await api.deleteVocab(id);
    load();
  }

  if (loading) return <p>Ładowanie…</p>;

  const boxCounts = [0, 0, 0, 0, 0];
  all.forEach((v) => {
    boxCounts[v.box] = (boxCounts[v.box] || 0) + 1;
  });

  return (
    <div className="vocab-review">
      <div className="box-summary">
        {boxCounts.map((count, i) => (
          <span key={i} className="box-pill">
            box {i}: {count}
          </span>
        ))}
      </div>

      {current ? (
        <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
          {!flipped ? (
            <span className="flashcard-front">{current.word}</span>
          ) : (
            <div className="flashcard-back">
              <strong>{current.translation}</strong>
              <p>{current.definition}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="empty">Brak słówek do powtórki. Zapisuj nowe klikając „+ do fiszek” przy artykułach.</p>
      )}

      {current && (
        <div className="flashcard-actions">
          <button className="danger-btn" onClick={() => handleReview('again')}>
            Nie znałem
          </button>
          <button className="secondary-btn" onClick={() => handleReview('good')}>
            Znałem
          </button>
          <button className="primary-btn" onClick={() => handleReview('easy')}>
            Łatwe
          </button>
        </div>
      )}

      <h3>Wszystkie słówka ({all.length})</h3>
      <ul className="vocab-list">
        {all.map((v) => (
          <li key={v.id}>
            <span>
              <strong>{v.word}</strong> — {v.translation}
            </span>
            <button className="link-btn" onClick={() => handleDelete(v.id)}>
              usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
