import { refreshFeeds } from './_lib/refreshFeeds.js';

// Called by the daily Vercel Cron job (GET, see vercel.json) and by the
// "Pobierz nowe wiadomości" button in the UI (POST) — same action either way.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = await refreshFeeds();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
