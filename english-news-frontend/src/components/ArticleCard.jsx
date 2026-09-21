import { useState } from 'react';
import { api } from '../api.js';

export default function ArticleCard({ article, onRead, onWordSaved }) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(() => new Set());
  const [savedWords, setSavedWords] = useState(() => new Set());

  const summary = article.summary;

  function toggleReveal(word) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  async function saveWord(v) {
    await api.addVocab({
      word: v.word,
      translation: v.translation,
      definition: v.definition,
      articleId: article.id,
      level: article.level,
    });
    setSavedWords((prev) => new Set(prev).add(v.word));
    onWordSaved?.();
  }

  async function markRead() {
    await api.markRead(article.id);
    onRead?.(article.id);
  }

  return (
    <article className="card">
      <header className="card-header">
        <span className="card-source">{article.source}</span>
        <span className="card-date">{new Date(article.publishedAt).toLocaleDateString('pl-PL')}</span>
      </header>
      <h2 className="card-title">
        <a href={article.link} target="_blank" rel="noreferrer">
          {article.title}
        </a>
      </h2>

      {!summary && <p className="card-loading">Generowanie streszczenia…</p>}

      {summary && (
        <>
          <ul className="card-digest">
            {summary.digest.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          <button className="link-btn" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Zwiń pełny tekst' : `Pokaż pełny tekst (${article.level})`}
          </button>

          {expanded && <p className="card-simplified">{summary.simplified}</p>}

          {summary.vocab?.length > 0 && (
            <div className="vocab-chips">
              {summary.vocab.map((v) => (
                <button
                  key={v.word}
                  className={`chip ${revealed.has(v.word) ? 'chip-open' : ''}`}
                  onClick={() => toggleReveal(v.word)}
                >
                  <span className="chip-word">{v.word}</span>
                  {revealed.has(v.word) && (
                    <span className="chip-detail">
                      {v.translation} — {v.definition}
                      <span
                        className={`chip-save ${savedWords.has(v.word) ? 'chip-saved' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!savedWords.has(v.word)) saveWord(v);
                        }}
                      >
                        {savedWords.has(v.word) ? '✓ zapisano' : '+ do fiszek'}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <footer className="card-footer">
        <button className="primary-btn" onClick={markRead}>
          Przeczytane, następny ↓
        </button>
      </footer>
    </article>
  );
}
