import { getVocab, setVocab } from '../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const vocab = await getVocab();
  const before = vocab.length;
  const remaining = vocab.filter((v) => v.id !== req.query.id);
  await setVocab(remaining);
  res.status(200).json({ deleted: before - remaining.length });
}
