import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { randomUUID } from 'node:crypto';
import { loadDb, saveDb } from './db.js';
import { refreshFeeds } from './refresh.js';
import { summarizeArticle } from './summarize.js';
import { initialBox, nextSchedule } from './leitner.js';
import { PORT, DEFAULT_LEVEL, LEVELS, REFRESH_CRON, SUMMARIZE_BATCH_SIZE } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

function isValidLevel(level) {
  return LEVELS.includes(level);
}

// GET /api/articles?level=B1&limit=10&unreadOnly=true
app.get('/api/articles', async (req, res) => {
  const level = isValidLevel(req.query.level) ? req.query.level : DEFAULT_LEVEL;
  const limit = Math.min(Number(req.query.limit) || 10, 30);
  const unreadOnly = req.query.unreadOnly !== 'false';

  const db = await loadDb();
  let candidates = db.data.articles.filter((a) => !unreadOnly || !a.read);
  candidates.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  candidates = candidates.slice(0, limit);

  const toSummarize = candidates.filter((a) => !a.summaries[level]).slice(0, SUMMARIZE_BATCH_SIZE);
  for (const article of toSummarize) {
    try {
      article.summaries[level] = await summarizeArticle(article, level);
    } catch (err) {
      console.error(`[summarize] failed for "${article.title}":`, err.message);
    }
  }
  if (toSummarize.length) await saveDb();

  const payload = candidates.map((a) => ({
    id: a.id,
    title: a.title,
    link: a.link,
    source: a.source,
    category: a.category,
    publishedAt: a.publishedAt,
    read: a.read,
    summary: a.summaries[level] || null,
    level,
  }));
  res.json({ level, articles: payload });
});

app.post('/api/articles/:id/read', async (req, res) => {
  const db = await loadDb();
  const article = db.data.articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'not found' });
  article.read = true;
  await saveDb();
  res.json({ ok: true });
});

app.post('/api/refresh', async (req, res) => {
  try {
    const result = await refreshFeeds();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vocab', async (req, res) => {
  const db = await loadDb();
  res.json({ vocab: db.data.vocab });
});

app.get('/api/vocab/due', async (req, res) => {
  const db = await loadDb();
  const now = Date.now();
  const due = db.data.vocab.filter((v) => new Date(v.nextReviewAt).getTime() <= now);
  res.json({ vocab: due });
});

app.post('/api/vocab', async (req, res) => {
  const { word, translation, definition, articleId, level } = req.body || {};
  if (!word) return res.status(400).json({ error: 'word is required' });

  const db = await loadDb();
  const existing = db.data.vocab.find((v) => v.word.toLowerCase() === word.toLowerCase());
  if (existing) return res.json({ vocab: existing, alreadyExists: true });

  const entry = {
    id: randomUUID(),
    word,
    translation: translation || '',
    definition: definition || '',
    articleId: articleId || null,
    level: level || DEFAULT_LEVEL,
    addedAt: new Date().toISOString(),
    ...initialBox(),
  };
  db.data.vocab.push(entry);
  await saveDb();
  res.status(201).json({ vocab: entry });
});

app.post('/api/vocab/:id/review', async (req, res) => {
  const { quality } = req.body || {};
  if (!['again', 'good', 'easy'].includes(quality)) {
    return res.status(400).json({ error: 'quality must be again|good|easy' });
  }
  const db = await loadDb();
  const entry = db.data.vocab.find((v) => v.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const { box, nextReviewAt } = nextSchedule(entry.box, quality);
  entry.box = box;
  entry.nextReviewAt = nextReviewAt;
  entry.lastReviewedAt = new Date().toISOString();
  await saveDb();
  res.json({ vocab: entry });
});

app.delete('/api/vocab/:id', async (req, res) => {
  const db = await loadDb();
  const before = db.data.vocab.length;
  db.data.vocab = db.data.vocab.filter((v) => v.id !== req.params.id);
  await saveDb();
  res.json({ deleted: before - db.data.vocab.length });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

await loadDb();

app.listen(PORT, () => {
  console.log(`English news backend listening on http://localhost:${PORT}`);
});

// Periodic background refresh of RSS feeds.
cron.schedule(REFRESH_CRON, () => {
  console.log('[cron] refreshing feeds...');
  refreshFeeds()
    .then((r) => console.log('[cron] done', r))
    .catch((err) => console.error('[cron] failed', err));
});
