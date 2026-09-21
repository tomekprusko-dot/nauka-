import { loadDb, saveDb } from './db.js';
import { fetchAllFeeds } from './rssFetch.js';

export async function refreshFeeds() {
  const db = await loadDb();
  const fetched = await fetchAllFeeds();
  const existingIds = new Set(db.data.articles.map((a) => a.id));
  let added = 0;

  for (const item of fetched) {
    if (existingIds.has(item.id)) continue;
    db.data.articles.push({ ...item, read: false, summaries: {}, fetchedAt: new Date().toISOString() });
    existingIds.add(item.id);
    added += 1;
  }

  // Keep the store from growing forever: cap at the 300 most recent articles.
  db.data.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  db.data.articles = db.data.articles.slice(0, 300);

  await saveDb();
  return { fetched: fetched.length, added, total: db.data.articles.length };
}

// Allow `npm run refresh` to trigger a one-off fetch from the CLI.
if (import.meta.url === `file://${process.argv[1]}`) {
  refreshFeeds()
    .then((result) => {
      console.log('[refresh]', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[refresh] failed', err);
      process.exit(1);
    });
}
