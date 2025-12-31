import { db } from './database';

export const SessionRepo = {
  async create(splitId: number, notes: string, restTime: number) {
    const database = await db;
    const result = await database.runAsync(
      `INSERT INTO sessions (split_id, notes, rest_time, start_time, created_at) VALUES (?,?,?,?,?)`,
      [splitId, notes, restTime, new Date().toISOString(), new Date().toISOString()]
    );
    return result.lastInsertRowId;
  },

  async getAll() {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM sessions ORDER BY created_at DESC`);
  },

  async getBySplitId(splitId: number) {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM sessions WHERE split_id = ? ORDER BY created_at DESC`, [splitId]);
  },

  async update(id: number, notes: string, endTime: string) {
    const database = await db;
    await database.runAsync(
      `UPDATE sessions SET notes = ?, end_time = ? WHERE id = ?`,
      [notes, endTime, id]
    );
  },

  async delete(id: number) {
    const database = await db;
    await database.runAsync(`DELETE FROM sessions WHERE id = ?`, [id]);
  }
};
