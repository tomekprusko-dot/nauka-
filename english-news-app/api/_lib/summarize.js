import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL } from './config.js';

const client = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

const LEVEL_HINTS = {
  A2: 'very short sentences, only the ~1000 most common English words, present/past simple only',
  B1: 'short, clear sentences, everyday vocabulary, minimal subordinate clauses',
  B2: 'natural sentence length, some idioms allowed but explained, varied tenses',
  C1: 'near-native complexity, keep nuance and tone of the original',
};

function buildPrompt(article, level) {
  const hint = LEVEL_HINTS[level] || LEVEL_HINTS.B1;
  return `You help a Polish adult learn English by reading real news. \
Adapt the article below for CEFR level ${level} (${hint}).

Title: ${article.title}
Source: ${article.source}
Original excerpt: ${article.excerpt}

Return ONLY a JSON object, no markdown fences, no commentary, with this exact shape:
{
  "digest": ["3 short bullet points in English summarizing the article at the target level"],
  "simplified": "a ${level}-level rewrite of the article, 100-180 words, in English",
  "vocab": [
    {"word": "english word or phrase from the text", "translation": "Polish translation", "definition": "short English definition suitable for a ${level} learner"}
  ]
}
Pick 6 to 10 vocab items that are useful/challenging for a ${level} learner. Keep JSON valid.`;
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in model response');
  return JSON.parse(text.slice(start, end + 1));
}

export async function summarizeArticle(article, level) {
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY is not set — cannot summarize articles.');
  }
  const message = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: buildPrompt(article, level) }],
  });
  const text = message.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
  const parsed = extractJson(text);
  return {
    digest: Array.isArray(parsed.digest) ? parsed.digest : [],
    simplified: parsed.simplified || '',
    vocab: Array.isArray(parsed.vocab) ? parsed.vocab : [],
    generatedAt: new Date().toISOString(),
  };
}
