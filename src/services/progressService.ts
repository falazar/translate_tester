import { getDatabase } from '../database/connection';
import { UserWordProgress } from '../types';

export class ProgressService {
  static getOrCreateProgress(userId: number, wordId: number): UserWordProgress {
    const db = getDatabase();

    // Try to get existing
    let progress = db
      .prepare(
        `
      SELECT * FROM user_word_progress 
      WHERE user_id = ? AND word_id = ?
    `
      )
      .get(userId, wordId) as UserWordProgress | undefined;

    if (!progress) {
      // Create new
      const result = db
        .prepare(
          `
        INSERT INTO user_word_progress 
        (user_id, word_id, correct_count, incorrect_count, 
         mastery_level)
        VALUES (?, ?, 0, 0, 0)
      `
        )
        .run(userId, wordId);

      progress = db
        .prepare(
          `
        SELECT * FROM user_word_progress WHERE id = ?
      `
        )
        .get(result.lastInsertRowid) as UserWordProgress;
    }

    return progress;
  }

  static updateProgress(userId: number, wordId: number, correct: boolean): void {
    const db = getDatabase();
    const progress = this.getOrCreateProgress(userId, wordId);

    const newCorrect = progress.correct_count + (correct ? 1 : 0);
    const newIncorrect = progress.incorrect_count + (correct ? 0 : 1);

    // Calculate mastery using rolling window of last 30 attempts
    const mastery = this.calculateRollingMastery(userId, wordId, correct);

    db.prepare(
      `
      UPDATE user_word_progress
      SET correct_count = ?,
          incorrect_count = ?,
          mastery_level = ?,
          last_reviewed = CURRENT_TIMESTAMP
      WHERE user_id = ? AND word_id = ?
    `
    ).run(newCorrect, newIncorrect, mastery, userId, wordId);
  }

  /**
   * Calculate mastery using rolling window of last 30 attempts
   * This prevents early mistakes from permanently dragging down scores
   * and makes the system more responsive to recent performance
   */
  private static calculateRollingMastery(
    userId: number,
    wordId: number,
    latestCorrect: boolean
  ): number {
    const db = getDatabase();

    // Get last 30 attempts for this word (including the current one)
    const recentAnswers = db
      .prepare(
        `
      SELECT correct 
      FROM session_answers sa
      JOIN sessions s ON sa.session_id = s.id
      WHERE s.user_id = ? AND sa.word_id = ?
      ORDER BY s.created_at DESC, sa.id DESC
      LIMIT 30
    `
      )
      .all(userId, wordId) as { correct: number }[];

    // Add the current attempt to the list
    const allAttempts = [{ correct: latestCorrect ? 1 : 0 }, ...recentAnswers].slice(0, 30); // Keep only last 30

    if (allAttempts.length === 0) {
      return 0;
    }

    const correctCount = allAttempts.reduce((sum, attempt) => sum + attempt.correct, 0);
    const mastery = Math.round((correctCount / allAttempts.length) * 100);

    return mastery;
  }

  static getUserProgress(userId: number): UserWordProgress[] {
    const db = getDatabase();
    return db
      .prepare(
        `
      SELECT * FROM user_word_progress WHERE user_id = ?
    `
      )
      .all(userId) as UserWordProgress[];
  }

  static getWordMastery(userId: number, wordId: number): number {
    const progress = this.getOrCreateProgress(userId, wordId);
    return progress.mastery_level;
  }
}
