import { useState } from 'react';
import { LEVELS } from './api.js';
import ArticleStack from './components/ArticleStack.jsx';
import VocabReview from './components/VocabReview.jsx';

export default function App() {
  const [tab, setTab] = useState('stack');
  const [level, setLevel] = useState(() => localStorage.getItem('level') || 'B1');
  const [vocabRefreshKey, setVocabRefreshKey] = useState(0);

  function handleLevelChange(newLevel) {
    setLevel(newLevel);
    localStorage.setItem('level', newLevel);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>English News Stack</h1>
        <div className="header-controls">
          <label>
            Poziom:{' '}
            <select value={level} onChange={(e) => handleLevelChange(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <nav className="tabs">
            <button className={tab === 'stack' ? 'active' : ''} onClick={() => setTab('stack')}>
              Stos wiadomości
            </button>
            <button className={tab === 'vocab' ? 'active' : ''} onClick={() => setTab('vocab')}>
              Słówka
            </button>
          </nav>
        </div>
      </header>

      <main>
        {tab === 'stack' && (
          <ArticleStack level={level} onWordSaved={() => setVocabRefreshKey((k) => k + 1)} />
        )}
        {tab === 'vocab' && <VocabReview refreshKey={vocabRefreshKey} />}
      </main>
    </div>
  );
}
