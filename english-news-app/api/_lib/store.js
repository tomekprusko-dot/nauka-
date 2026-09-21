import { Redis } from '@upstash/redis';

const ARTICLES_KEY = 'english-news:articles';
const VOCAB_KEY = 'english-news:vocab';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Falls back to an in-memory store when no KV database is connected yet, so
// `vercel dev` works out of the box for UI work. On real Vercel deployments
// without a KV database this fallback resets on every cold start — connect
// a database (see README) before relying on data surviving between visits.
let memory = { articles: [], vocab: [] };
const redis = url && token ? new Redis({ url, token }) : null;

export const usingMemoryFallback = !redis;

export async function getArticles() {
  if (!redis) return memory.articles;
  return (await redis.get(ARTICLES_KEY)) || [];
}

export async function setArticles(articles) {
  if (!redis) {
    memory.articles = articles;
    return;
  }
  await redis.set(ARTICLES_KEY, articles);
}

export async function getVocab() {
  if (!redis) return memory.vocab;
  return (await redis.get(VOCAB_KEY)) || [];
}

export async function setVocab(vocab) {
  if (!redis) {
    memory.vocab = vocab;
    return;
  }
  await redis.set(VOCAB_KEY, vocab);
}
