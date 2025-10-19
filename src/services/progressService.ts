import { getDatabase } from '../database/connection';
import { UserWordProgress } from '../types';

export class ProgressService {
  static getOrCreateProgress(
    userId: number, 
    wordId: number
  ): UserWordProgress {
    const db = getDatabase();
    
    // Try to get existing
    let progress = db.prepare(`
      SELECT * FROM user_word_progress 
      WHERE user_id = ? AND word_id = ?
    `).get(userId, wordId) as UserWordProgress | undefined;

    if (!progress) {
      // Create new
      const result = db.prepare(`
        INSERT INTO user_word_progress 
        (user_id, word_id, correct_count, incorrect_count, 
         mastery_level)
        VALUES (?, ?, 0, 0, 0)
      `).run(userId, wordId);

      progress = db.prepare(`
        SELECT * FROM user_word_progress WHERE id = ?
      `).get(result.lastInsertRowid) as UserWordProgress;
    }

    return progress;
  }

  static updateProgress(
    userId: number, 
    wordId: number, 
    correct: boolean
  ): void {
    const db = getDatabase();
    const progress = this.getOrCreateProgress(userId, wordId);

    const newCorrect = progress.correct_count + (correct ? 1 : 0);
    const newIncorrect = progress.incorrect_count + (correct ? 0 : 1);
    const total = newCorrect + newIncorrect;
    const mastery = Math.round((newCorrect / total) * 100);

    db.prepare(`
      UPDATE user_word_progress
      SET correct_count = ?,
          incorrect_count = ?,
          mastery_level = ?,
          last_reviewed = CURRENT_TIMESTAMP
      WHERE user_id = ? AND word_id = ?
    `).run(newCorrect, newIncorrect, mastery, userId, wordId);
  }

  static getUserProgress(userId: number): UserWordProgress[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM user_word_progress WHERE user_id = ?
    `).all(userId) as UserWordProgress[];
  }

  static getWordMastery(
    userId: number, 
    wordId: number
  ): number {
    const progress = this.getOrCreateProgress(userId, wordId);
    return progress.mastery_level;
  }
}

