import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ArticleCard from './ArticleCard.jsx';

export default function ArticleStack({ level, onWordSaved }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { articles } = await api.getArticles(level, 10);
      setArticles(articles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      await api.refresh();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  function handleRead(id) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="stack">
      <div className="stack-toolbar">
        <span>{articles.length} artykuł(y) w stosie</span>
        <button className="secondary-btn" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Pobieram…' : '↻ Pobierz nowe wiadomości'}
        </button>
      </div>

      {error && <p className="error">Błąd: {error}</p>}
      {loading && <p>Ładowanie…</p>}

      {!loading && articles.length === 0 && (
        <p className="empty">
          Brak artykułów. Kliknij „Pobierz nowe wiadomości”, żeby ściągnąć świeże newsy z RSS
          (wymaga skonfigurowanego ANTHROPIC_API_KEY na backendzie do generowania streszczeń).
        </p>
      )}

      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onRead={handleRead} onWordSaved={onWordSaved} />
      ))}
    </div>
  );
}
