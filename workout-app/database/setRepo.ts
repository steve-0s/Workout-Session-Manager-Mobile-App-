import { db } from './database';

export const SetRepo = {
  async create(sessionId: number, exerciseId: number, weight: number, reps: number, completed: boolean) {
    const database = await db;
    const result = await database.runAsync(
      `INSERT INTO sets (session_id, exercise_id, weight, reps, completed, created_at) VALUES (?,?,?,?,?,?)`,
      [sessionId, exerciseId, weight, reps, completed ? 1 : 0, new Date().toISOString()]
    );
    return result.lastInsertRowId;
  },

  async getBySessionId(sessionId: number) {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM sets WHERE session_id = ? ORDER BY created_at`, [sessionId]);
  },

  async update(id: number, weight: number, reps: number, completed: boolean) {
    const database = await db;
    await database.runAsync(
      `UPDATE sets SET weight = ?, reps = ?, completed = ? WHERE id = ?`,
      [weight, reps, completed ? 1 : 0, id]
    );
  },

  async delete(id: number) {
    const database = await db;
    await database.runAsync(`DELETE FROM sets WHERE id = ?`, [id]);
  }
};
