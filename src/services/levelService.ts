import { getDatabase } from '../database/connection';
import { Level, Word } from '../types';
import { ProgressService } from './progressService';

export class LevelService {
  static getAllLevels(): Level[] {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM levels ORDER BY level_number'
    ).all() as Level[];
  }

  static getLevelById(levelId: number): Level | undefined {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM levels WHERE id = ?'
    ).get(levelId) as Level | undefined;
  }

  static getLevelByNumber(levelNumber: number): Level | undefined {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM levels WHERE level_number = ?'
    ).get(levelNumber) as Level | undefined;
  }

  static getWordsForLevel(levelId: number): Word[] {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM words WHERE level_id = ?'
    ).all(levelId) as Word[];
  }

  static getUserAvailableLevels(userLevel: number): Level[] {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM levels WHERE level_number <= ? ORDER BY level_number'
    ).all(userLevel) as Level[];
  }

  static getWordsWithExamples(
    levelId: number, 
    userId?: number
  ): any[] {
    const db = getDatabase();
    
    // Get all words for the level with progress
    let words;
    if (userId) {
      // Join with progress and order by mastery (lowest first)
      words = db.prepare(`
        SELECT w.*, 
               COALESCE(p.correct_count, 0) as correct_count,
               COALESCE(p.incorrect_count, 0) as incorrect_count,
               COALESCE(p.mastery_level, 0) as mastery_level
        FROM words w
        LEFT JOIN user_word_progress p 
          ON w.id = p.word_id AND p.user_id = ?
        WHERE w.level_id = ?
        ORDER BY COALESCE(p.mastery_level, 0) ASC, w.french
      `).all(userId, levelId);
    } else {
      // No user, just get words without progress
      words = db.prepare(`
        SELECT *, 0 as correct_count, 0 as incorrect_count, 
               0 as mastery_level
        FROM words 
        WHERE level_id = ? 
        ORDER BY french
      `).all(levelId);
    }

    // For each word, get its example sentences
    const wordsWithExamples = words.map((word: any) => {
      const examples = db.prepare(
        'SELECT * FROM example_sentences WHERE word_id = ?'
      ).all(word.id);

      // Extract progress data
      const progressData = {
        correct_count: word.correct_count || 0,
        incorrect_count: word.incorrect_count || 0,
        mastery_level: word.mastery_level || 0
      };

      // Clean word object (remove progress fields from root)
      const { correct_count, incorrect_count, mastery_level, ...cleanWord } = word;

      return {
        ...cleanWord,
        examples,
        progress: progressData
      };
    });

    return wordsWithExamples;
  }

  /**
   * Calculate the average mastery percentage for all words in a level
   */
  static getLevelMastery(levelId: number, userId: number): number {
    const db = getDatabase();
    
    // Get all words in this level
    const words = db.prepare(`
      SELECT id FROM words WHERE level_id = ?
    `).all(levelId) as { id: number }[];

    if (words.length === 0) {
      return 0; // No words = 0% mastery
    }

    // Calculate average mastery
    let totalMastery = 0;
    for (const word of words) {
      const mastery = ProgressService.getWordMastery(userId, word.id);
      totalMastery += mastery;
    }

    return Math.round(totalMastery / words.length);
  }
}

