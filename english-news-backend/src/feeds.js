// Curated RSS sources. "world" = general world news, "poland" = English-language
// news about Poland (no translation needed, genuinely written in English).
// Edit freely to add/remove sources.
export const FEEDS = [
  {
    id: 'bbc-world',
    name: 'BBC News — World',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world',
  },
  {
    id: 'npr-world',
    name: 'NPR — World',
    url: 'https://feeds.npr.org/1004/rss.xml',
    category: 'world',
  },
  {
    id: 'aljazeera-all',
    name: 'Al Jazeera — All',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'world',
  },
  {
    id: 'notes-from-poland',
    name: 'Notes from Poland',
    url: 'https://notesfrompoland.com/feed/',
    category: 'poland',
  },
  {
    id: 'first-news-poland',
    name: 'The First News (Poland)',
    url: 'https://www.thefirstnews.com/rss',
    category: 'poland',
  },
];
