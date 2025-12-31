import { db } from './database';

export const ExerciseRepo = {
  async create(splitId: number, name: string, sets: number, reps: string, restTime: number) {
    const database = await db;
    const result = await database.runAsync(
      `INSERT INTO exercises (split_id, name, sets, reps, rest_time, created_at) VALUES (?,?,?,?,?,?)`,
      [splitId, name, sets, reps, restTime, new Date().toISOString()]
    );
    return result.lastInsertRowId;
  },

  async getBySplitId(splitId: number) {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM exercises WHERE split_id = ?`, [splitId]);
  },

  async getBySessionId(sessionId: number) {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM exercises WHERE session_id = ?`, [sessionId]);
  },

  async update(id: number, name: string, sets: number, reps: string, restTime: number) {
    const database = await db;
    await database.runAsync(
      `UPDATE exercises SET name = ?, sets = ?, reps = ?, rest_time = ? WHERE id = ?`,
      [name, sets, reps, restTime, id]
    );
  },

  async getAll() {
    const database = await db;
    return await database.getAllAsync(`SELECT * FROM exercises ORDER BY created_at DESC`);
  },

  async delete(id: number) {
    const database = await db;
    await database.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
  }
};
