import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { DATA_FILE } from './config.js';

const defaultData = { articles: [], vocab: [], settings: { level: 'B1' } };

const adapter = new JSONFile(DATA_FILE);
export const db = new Low(adapter, defaultData);

export async function loadDb() {
  await db.read();
  db.data ||= defaultData;
  db.data.articles ||= [];
  db.data.vocab ||= [];
  db.data.settings ||= { level: 'B1' };
  return db;
}

export async function saveDb() {
  await db.write();
}
