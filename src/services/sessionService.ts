import { getDatabase } from '../database/connection';
import { 
  Word, 
  Question, 
  Session, 
  SessionResult, 
  ExampleSentence 
} from '../types';
import { ProgressService } from './progressService';
import { LevelService } from './levelService';
import { UserLevelService } from './userLevelService';

export class SessionService {
  private static QUESTIONS_PER_SESSION = 20;

  static createSession(userId: number, levelId: number): Session {
    const db = getDatabase();
    
    const result = db.prepare(`
      INSERT INTO sessions 
      (user_id, level_id, score, total_questions, passed)
      VALUES (?, ?, 0, ${this.QUESTIONS_PER_SESSION}, 0)
    `).run(userId, levelId);

    return db.prepare(
      'SELECT * FROM sessions WHERE id = ?'
    ).get(result.lastInsertRowid) as Session;
  }

  static generateQuestions(
    userId: number, 
    currentLevelId: number
  ): Question[] {
    const db = getDatabase();
    const questions: Question[] = [];

    // Get words for the session (current level + max 3 from previous levels)
    const allWords = this.getWordsForSession(userId, currentLevelId);

    // Weight words by struggle (lower mastery = higher weight)
    const weightedWords: Word[] = [];
    for (const word of allWords) {
      // Inverse weighting: 0% mastery = 10x, 50% = 5x, 
      // 90% = 1x, 100% = 1x
      const weight = Math.max(1, Math.round(10 - (word.mastery / 10)));
      
      for (let i = 0; i < weight; i++) {
        weightedWords.push(word);
      }
    }

    // Randomly select 20 words (can have duplicates for variety)
    const selectedWords: Word[] = [];
    for (let i = 0; i < this.QUESTIONS_PER_SESSION; i++) {
      const randomIndex = Math.floor(Math.random() * 
                                      weightedWords.length);
      selectedWords.push(weightedWords[randomIndex]);
    }

    // Generate questions of different types
    const questionTypes: Question['type'][] = [
      'fr_to_en', 
      'en_to_fr', 
      'fill_blank', 
      'multiple_choice'
    ];

    // Pick 20 words randomly and generate questions for them.
    for (let i = 0; i < selectedWords.length; i++) {
      const word = selectedWords[i];
      
      // Give verbs 50% higher chance of fill-in-the-blank exercises
      let type: Question['type'];
      if (word.word_type === 'verb') {
        // For verbs: 50% chance for fill_blank, 16.67% each for others
        const random = Math.random();
        if (random < 0.5) {
          type = 'fill_blank';
        } else if (random < 0.6667) {
          type = 'fr_to_en';
        } else if (random < 0.8333) {
          type = 'en_to_fr';
        } else {
          type = 'multiple_choice';
        }
      } else {
        // For non-verbs: equal 25% chance for each type
        const typeIndex = Math.floor(Math.random() * questionTypes.length);
        type = questionTypes[typeIndex];
      }

      questions.push(this.createQuestion(word, type, allWords));
    }

    return questions;
  }

  /**
   * Get words for a session: all current level words + max 3 from previous levels
   * Previous level words are selected based on lowest mastery
   * Returns words with mastery already calculated
   */
  private static getWordsForSession(
    userId: number, 
    currentLevelId: number
  ): (Word & { mastery: number })[] {
    const db = getDatabase();
    
    // Get current level info
    const currentLevel = LevelService.getLevelById(currentLevelId);
    if (!currentLevel) throw new Error('Level not found');

    // Get current level words with mastery
    const currentLevelWords = this.getWordsWithMastery(userId, [currentLevelId]);

    if (currentLevelWords.length === 0) {
      throw new Error(
        `No words found for level ${currentLevel.level_number}. ` +
        `Please run 'npm run seed' to populate the database.`
      );
    }

    // STEP 2: Get previous level words with mastery (limited to 3)
    const previousLevels = db.prepare(`
      SELECT id FROM levels WHERE level_number < ?
    `).all(currentLevel.level_number) as { id: number }[];
    
    let previousLevelWords: (Word & { mastery: number })[] = [];
    if (previousLevels.length > 0) {
      const previousLevelIds = previousLevels.map(l => l.id);
      
      // Get previous level words with mastery (limited to 3 lowest mastery)
      previousLevelWords = this.getWordsWithMastery(userId, previousLevelIds, 3);
    }

    // Combine current level words with limited previous level words
    return [...currentLevelWords, ...previousLevelWords];
  }

  /**
   * Gets words with mastery levels for specified level IDs
   * @param userId - User ID to get mastery for
   * @param levelIds - Array of level IDs to fetch words from
   * @param limit - Optional limit for results (sorts by mastery ASC)
   * @returns Words with mastery levels
   */
  private static getWordsWithMastery(
    userId: number, 
    levelIds: number[], 
    limit?: number
  ): (Word & { mastery: number })[] {
    const db = getDatabase();
    
    if (levelIds.length === 0) return [];
    
    const placeholders = levelIds.map(() => '?').join(',');
    let query = `
      SELECT w.*, 
             COALESCE(uwp.mastery_level, 0) as mastery
      FROM words w
      LEFT JOIN user_word_progress uwp ON w.id = uwp.word_id AND uwp.user_id = ?
      WHERE w.level_id IN (${placeholders})
    `;
    
    if (limit) {
      query += ` ORDER BY mastery ASC LIMIT ${limit}`;
    }
    
    return db.prepare(query).all(userId, ...levelIds) as (Word & { mastery: number })[];
  }

  private static createQuestion(
    word: Word, 
    type: Question['type'], 
    allWords: Word[]
  ): Question {
    switch (type) {
      case 'fr_to_en':
        return {
          id: word.id,
          word,
          type,
          question: `Translate to English: "${word.french}"`,
          correct_answer: word.english
        };

      case 'en_to_fr':
        return {
          id: word.id,
          word,
          type,
          question: `Translate to French: "${word.english}"`,
          correct_answer: word.french
        };

      case 'fill_blank':
        return this.createFillBlankQuestion(word);

      case 'multiple_choice':
        const options = this.generateMultipleChoiceOptions(
          word, 
          allWords
        );
        return {
          id: word.id,
          word,
          type,
          question: `What does "${word.french}" mean?`,
          correct_answer: word.english,
          options
        };

      default:
        throw new Error('Unknown question type');
    }
  }

  private static createFillBlankQuestion(word: Word): Question {
    const db = getDatabase();
    
    // Get example sentences for this word
    const examples = db.prepare(`
      SELECT * FROM example_sentences 
      WHERE word_id = ? 
      LIMIT 3
    `).all(word.id) as ExampleSentence[];

    let sentence: string;
    let correctAnswer: string;
    
    if (examples.length > 0) {
      // Use a random example sentence
      const example = 
        examples[Math.floor(Math.random() * examples.length)];
      
      // Use word_to_replace if available, otherwise use the word
      const wordToBlank = example.word_to_replace || 
                          word.french.replace(/^(le|la|l') /, '');
      
      // Escape special regex characters
      const escapedWord = 
        wordToBlank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create regex (handles accents, apostrophes)
      const wordPattern = new RegExp(
        `(?<=\\s|^|')${escapedWord}(?=\\s|\\.|,|!|\\?|'|$)`, 
        'gi'
      );
      
      // Replace the word with blank
      sentence = example.french_sentence.replace(wordPattern, '___');
      correctAnswer = wordToBlank;
      
    } else {
      // Fallback to simple sentence
      const article = word.gender || '';
      sentence = 
        `${article} ___ ${word.word_type === 'verb' ? 
          'est important' : 'est beau'}`;
      correctAnswer = word.french.replace(/^(le|la|l') /, '');
    }
    
    return {
      id: word.id,
      word,
      type: 'fill_blank',
      question: 
        `Fill in the blank with "${word.english}":<br>"${sentence}"`,
      correct_answer: correctAnswer,
      sentence_context: sentence
    };
  }

  private static generateMultipleChoiceOptions(
    correctWord: Word, 
    allWords: Word[]
  ): string[] {
    const options: string[] = [correctWord.english];
    const sameType = allWords.filter(
      w => w.word_type === correctWord.word_type && 
           w.id !== correctWord.id
    );

    
    // Add 3 random wrong answers
    while (options.length < 4 && sameType.length > 0) {
      const randomIndex = Math.floor(Math.random() * sameType.length);
      const wrongAnswer = sameType[randomIndex].english;
      
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
      
      sameType.splice(randomIndex, 1);
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  static recordAnswer(
    sessionId: number,
    userId: number,
    wordId: number,
    questionType: string,
    userAnswer: string,
    correctAnswer: string
  ): boolean {
    const db = getDatabase();
    
    // Only strip parentheses for French→English questions
    const shouldStripParens = questionType === 'fr_to_en';
    const normalizedUser = this.normalizeAnswer(userAnswer, shouldStripParens);
    const normalizedCorrect = this.normalizeAnswer(correctAnswer, shouldStripParens);
    const correct = normalizedUser === normalizedCorrect;

    // Record answer
    db.prepare(`
      INSERT INTO session_answers 
      (session_id, word_id, question_type, user_answer, 
       correct_answer, correct)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, 
      wordId, 
      questionType, 
      userAnswer, 
      correctAnswer, 
      correct ? 1 : 0
    );

    // Update user progress
    ProgressService.updateProgress(userId, wordId, correct);

    return correct;
  }

  /**
   * Normalize answers for comparison
   * Only strip parentheses for French→English questions (where English has complex descriptions)
   */
  private static normalizeAnswer(answer: string, shouldStripParens: boolean = false): string {
    let normalized = answer.trim();
    
    // Convert œ to oe for easier typing (both "sœur" and "soeur" will be accepted)
    normalized = normalized.replace(/œ/g, 'oe');
    
    if (shouldStripParens) {
      normalized = normalized
        .replace(/\s*\([^)]*\)/g, '') // Remove (formal/plural) etc
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    }
    
    return normalized.toLowerCase();
  }

  static getSessionResult(
    sessionId: number, 
    userId: number
  ): SessionResult {
    const db = getDatabase();

    // Get session
    const session = db.prepare(
      'SELECT * FROM sessions WHERE id = ?'
    ).get(sessionId) as Session;

    // Get all answers
    const answers = db.prepare(`
      SELECT * FROM session_answers WHERE session_id = ?
    `).all(sessionId) as any[];

    // Calculate score
    const correctCount = answers.filter(a => a.correct === 1).length;
    const percentage = Math.round(
      (correctCount / session.total_questions) * 100
    );
    const passed = percentage >= 90;

    // Update session
    db.prepare(`
      UPDATE sessions 
      SET score = ?, passed = ?
      WHERE id = ?
    `).run(correctCount, passed ? 1 : 0, sessionId);

    // Update mastery for all levels and check if session level newly hit 80%
    const { newlyHitMastery } = UserLevelService.updateAllLevelMastery(
      userId, 
      session.level_id
    );

    // Get incorrect words with examples
    const incorrectWords = answers
      .filter(a => a.correct === 0)
      .map(answer => {
        const word = db.prepare(
          'SELECT * FROM words WHERE id = ?'
        ).get(answer.word_id) as Word;

        const examples = db.prepare(`
          SELECT * FROM example_sentences 
          WHERE word_id = ? LIMIT 3
        `).all(answer.word_id) as ExampleSentence[];

        return {
          word,
          user_answer: answer.user_answer,
          correct_answer: answer.correct_answer,
          examples
        };
      });

    return {
      session_id: sessionId,
      score: correctCount,
      total_questions: session.total_questions,
      passed,
      percentage,
      newlyHitMastery,
      incorrect_words: incorrectWords
    };
  }

  static getUserSessions(userId: number): Session[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT s.*, l.name as level_name 
      FROM sessions s
      JOIN levels l ON s.level_id = l.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `).all(userId) as Session[];
  }

}

