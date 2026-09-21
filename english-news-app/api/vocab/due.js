import { getVocab } from '../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const vocab = await getVocab();
  const now = Date.now();
  const due = vocab.filter((v) => new Date(v.nextReviewAt).getTime() <= now);
  res.status(200).json({ vocab: due });
}
