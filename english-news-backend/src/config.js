import 'dotenv/config';

export const PORT = Number(process.env.PORT || 3001);
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
export const DATA_FILE = new URL('../data/db.json', import.meta.url).pathname;
export const DEFAULT_LEVEL = process.env.DEFAULT_LEVEL || 'B1';
export const LEVELS = ['A2', 'B1', 'B2', 'C1'];
export const REFRESH_CRON = process.env.REFRESH_CRON || '0 */3 * * *'; // every 3h
export const ARTICLES_PER_FEED = Number(process.env.ARTICLES_PER_FEED || 8);
export const SUMMARIZE_BATCH_SIZE = Number(process.env.SUMMARIZE_BATCH_SIZE || 6);
