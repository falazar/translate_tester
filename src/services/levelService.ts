import { getDatabase } from '../database/connection';
import { Level, Word } from '../types';

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

  static getWordsWithExamples(levelId: number): any[] {
    const db = getDatabase();
    
    // Get all words for the level
    const words = db.prepare(
      'SELECT * FROM words WHERE level_id = ? ORDER BY word_type, french'
    ).all(levelId) as Word[];

    // For each word, get its example sentences
    const wordsWithExamples = words.map(word => {
      const examples = db.prepare(
        'SELECT * FROM example_sentences WHERE word_id = ?'
      ).all(word.id);

      return {
        ...word,
        examples
      };
    });

    return wordsWithExamples;
  }
}

