import * as SQLite from 'expo-sqlite';

const database = SQLite.openDatabaseAsync('workout.db');

export const db = {
  execAsync: async (sql: string) => {
    const db = await database;
    await db.execAsync(sql);
  },

  runAsync: async (sql: string, params: any[] = []) => {
    const db = await database;
    const result = await db.runAsync(sql, params);
    return { lastInsertRowId: result.lastInsertRowId };
  },

  getAsync: async (sql: string, params: any[] = []) => {
    const db = await database;
    const result = await db.getFirstAsync(sql, params);
    return result;
  },

  getAllAsync: async (sql: string, params: any[] = []) => {
    const db = await database;
    const result = await db.getAllAsync(sql, params);
    return result;
  },
};
