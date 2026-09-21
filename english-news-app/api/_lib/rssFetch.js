import Parser from 'rss-parser';
import { createHash } from 'node:crypto';
import { FEEDS } from './feeds.js';
import { ARTICLES_PER_FEED } from './config.js';

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EnglishNewsLearner/1.0)' },
  timeout: 15000,
});

function idFor(link) {
  return createHash('sha1').update(link).digest('hex').slice(0, 16);
}

export async function fetchAllFeeds() {
  const results = [];
  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, ARTICLES_PER_FEED).map((item) => ({
        id: idFor(item.link),
        title: item.title?.trim() || '(untitled)',
        link: item.link,
        source: feed.name,
        sourceId: feed.id,
        category: feed.category,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        excerpt: (item.contentSnippet || item.content || '').slice(0, 2000),
      }));
      results.push(...items);
    } catch (err) {
      console.error(`[rss] failed to fetch ${feed.name} (${feed.url}): ${err.message}`);
    }
  }
  return results;
}
