import { getArticles, setArticles } from '../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const articles = await getArticles();
  const article = articles.find((a) => a.id === req.query.id);
  if (!article) return res.status(404).json({ error: 'not found' });

  article.read = true;
  await setArticles(articles);
  res.status(200).json({ ok: true });
}
