const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getArticles: (level, limit = 10) => request(`/api/articles?level=${level}&limit=${limit}`),
  markRead: (id) => request(`/api/articles/${id}/read`, { method: 'POST' }),
  refresh: () => request('/api/refresh', { method: 'POST' }),
  getVocab: () => request('/api/vocab'),
  getDueVocab: () => request('/api/vocab/due'),
  addVocab: (entry) => request('/api/vocab', { method: 'POST', body: JSON.stringify(entry) }),
  reviewVocab: (id, quality) =>
    request(`/api/vocab/${id}/review`, { method: 'POST', body: JSON.stringify({ quality }) }),
  deleteVocab: (id) => request(`/api/vocab/${id}`, { method: 'DELETE' }),
};

export const LEVELS = ['A2', 'B1', 'B2', 'C1'];
