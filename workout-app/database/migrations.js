import { db } from './database';

export function runMigrations() {
  db.transaction(tx => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      created_at TEXT
    )`);
  });
}
