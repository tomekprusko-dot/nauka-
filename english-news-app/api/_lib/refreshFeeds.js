import { getArticles, setArticles } from './store.js';
import { fetchAllFeeds } from './rssFetch.js';
import { MAX_STORED_ARTICLES } from './config.js';

export async function refreshFeeds() {
  const existing = await getArticles();
  const fetched = await fetchAllFeeds();
  const existingIds = new Set(existing.map((a) => a.id));
  let added = 0;

  const merged = [...existing];
  for (const item of fetched) {
    if (existingIds.has(item.id)) continue;
    merged.push({ ...item, read: false, summaries: {}, fetchedAt: new Date().toISOString() });
    existingIds.add(item.id);
    added += 1;
  }

  merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const capped = merged.slice(0, MAX_STORED_ARTICLES);

  await setArticles(capped);
  return { fetched: fetched.length, added, total: capped.length };
}
