import { usingMemoryFallback } from './_lib/store.js';
import { ANTHROPIC_API_KEY } from './_lib/config.js';

export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    storage: usingMemoryFallback ? 'in-memory (no KV connected — not persistent)' : 'kv',
    anthropicConfigured: Boolean(ANTHROPIC_API_KEY),
  });
}
