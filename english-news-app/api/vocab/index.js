import { randomUUID } from 'node:crypto';
import { getVocab, setVocab } from '../_lib/store.js';
import { initialBox } from '../_lib/leitner.js';
import { DEFAULT_LEVEL } from '../_lib/config.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const vocab = await getVocab();
    return res.status(200).json({ vocab });
  }

  if (req.method === 'POST') {
    const { word, translation, definition, articleId, level } = req.body || {};
    if (!word) return res.status(400).json({ error: 'word is required' });

    const vocab = await getVocab();
    const existing = vocab.find((v) => v.word.toLowerCase() === word.toLowerCase());
    if (existing) return res.status(200).json({ vocab: existing, alreadyExists: true });

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
    vocab.push(entry);
    await setVocab(vocab);
    return res.status(201).json({ vocab: entry });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
