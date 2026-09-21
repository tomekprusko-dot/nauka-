import { getArticles, setArticles } from '../_lib/store.js';
import { summarizeArticle } from '../_lib/summarize.js';
import { DEFAULT_LEVEL, LEVELS, SUMMARIZE_BATCH_SIZE } from '../_lib/config.js';

function isValidLevel(level) {
  return LEVELS.includes(level);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const level = isValidLevel(req.query.level) ? req.query.level : DEFAULT_LEVEL;
  const limit = Math.min(Number(req.query.limit) || 10, 30);
  const unreadOnly = req.query.unreadOnly !== 'false';

  const all = await getArticles();
  let candidates = all.filter((a) => !unreadOnly || !a.read);
  candidates.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  candidates = candidates.slice(0, limit);

  const toSummarize = candidates.filter((a) => !a.summaries?.[level]).slice(0, SUMMARIZE_BATCH_SIZE);
  for (const article of toSummarize) {
    try {
      article.summaries = { ...article.summaries, [level]: await summarizeArticle(article, level) };
    } catch (err) {
      console.error(`[summarize] failed for "${article.title}":`, err.message);
    }
  }
  if (toSummarize.length) {
    const byId = new Map(candidates.map((a) => [a.id, a]));
    const updated = all.map((a) => byId.get(a.id) || a);
    await setArticles(updated);
  }

  const payload = candidates.map((a) => ({
    id: a.id,
    title: a.title,
    link: a.link,
    source: a.source,
    category: a.category,
    publishedAt: a.publishedAt,
    read: a.read,
    summary: a.summaries?.[level] || null,
    level,
  }));
  res.status(200).json({ level, articles: payload });
}
