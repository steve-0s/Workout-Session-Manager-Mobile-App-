import { db } from './database';

export const SplitRepo = {

  async create(name: string, description: string) {
    const result = await db.runAsync(
      `INSERT INTO splits (name, description, created_at) VALUES (?,?,?)`,
      [name, description, new Date().toISOString()]
    );
    return result.lastInsertRowId;
  },

  async getAll() {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM splits`);
  }

};
