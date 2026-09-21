export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
export const DEFAULT_LEVEL = process.env.DEFAULT_LEVEL || 'B1';
export const LEVELS = ['A2', 'B1', 'B2', 'C1'];
export const ARTICLES_PER_FEED = Number(process.env.ARTICLES_PER_FEED || 8);
export const MAX_STORED_ARTICLES = Number(process.env.MAX_STORED_ARTICLES || 150);
// Keep small: serverless functions have a time limit, and each summary is one
// Claude API call. Raise it if you extend maxDuration in vercel.json.
export const SUMMARIZE_BATCH_SIZE = Number(process.env.SUMMARIZE_BATCH_SIZE || 4);
