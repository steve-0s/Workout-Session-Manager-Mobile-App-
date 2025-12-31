import { db } from './database';

export async function runMigrations() {
  console.log('runMigrations called');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      split_id INTEGER,
      session_id INTEGER,
      name TEXT,
      sets INTEGER,
      reps TEXT,
      rest_time INTEGER,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      split_id INTEGER,
      notes TEXT,
      rest_time INTEGER,
      start_time TEXT,
      end_time TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      exercise_id INTEGER,
      weight REAL,
      reps INTEGER,
      completed INTEGER,
      created_at TEXT
    );
  `);
  console.log('Migrations completed');
}
