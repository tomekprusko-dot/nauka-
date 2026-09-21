import { getVocab, setVocab } from '../../_lib/store.js';
import { nextSchedule } from '../../_lib/leitner.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { quality } = req.body || {};
  if (!['again', 'good', 'easy'].includes(quality)) {
    return res.status(400).json({ error: 'quality must be again|good|easy' });
  }

  const vocab = await getVocab();
  const entry = vocab.find((v) => v.id === req.query.id);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const { box, nextReviewAt } = nextSchedule(entry.box, quality);
  entry.box = box;
  entry.nextReviewAt = nextReviewAt;
  entry.lastReviewedAt = new Date().toISOString();
  await setVocab(vocab);
  res.status(200).json({ vocab: entry });
}
