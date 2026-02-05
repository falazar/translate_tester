import { getDatabase } from '../database/connection';
import { ExampleSentence, Question, Session, SessionResult, Word } from '../types';
import { LevelService } from './levelService';
import { ProgressService } from './progressService';
import { UserLevelService } from './userLevelService';

export class SessionService {
  private static QUESTIONS_PER_SESSION = 20;

  static createSession(userId: number, levelId: number): Session {
    const db = getDatabase();

    const result = db
      .prepare(
        `
      INSERT INTO sessions 
      (user_id, level_id, score, total_questions, passed)
      VALUES (?, ?, 0, ${this.QUESTIONS_PER_SESSION}, 0)
    `
      )
      .run(userId, levelId);

    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid) as Session;
  }

  /**
   * Generate questions for a session
   * @param userId - User ID
   * @param currentLevelId - Current level ID
   * @returns Array of questions
   */
  static generateQuestions(userId: number, currentLevelId: number): Question[] {
    const questions: Question[] = [];

    // Get words for the session (current level + max 3 from previous levels)
    const allWords = this.getWordsForSession(userId, currentLevelId);

    // Get weighted word selection (struggling words appear more frequently)
    const selectedWords = this.selectWeightedWords(allWords, this.QUESTIONS_PER_SESSION);

    // Generate questions of different types
    const questionTypes: Question['type'][] = [
      'fr_to_en',
      'en_to_fr',
      'fill_blank',
      'multiple_choice',
    ];

    // Generate questions for selected words.
    let previousWordId: number | null = null;

    // Get level mastery for hints
    const levelMastery = UserLevelService.getOrCreateUserLevel(userId, currentLevelId).mastery;

    for (let i = 0; i < selectedWords.length; i++) {
      let word = selectedWords[i];
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure we don't use the same word twice in a row
      while (word.id === previousWordId && attempts < maxAttempts) {
        // Pick a random different word from the selected words
        const randomIndex = Math.floor(Math.random() * selectedWords.length);
        word = selectedWords[randomIndex];
        attempts++;
      }

      previousWordId = word.id;

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

      const question = this.createQuestion(word, type, allWords, levelMastery);
      questions.push(question);
    }

    return questions;
  }

  /**
   * Get words for a session: all current level words + max 3 from previous levels
   * Previous level words are selected based on lowest attempts, then lowest mastery
   * Returns words with mastery and attempt counts already calculated
   */
  private static getWordsForSession(
    userId: number,
    currentLevelId: number
  ): (Word & { mastery: number; attempts: number })[] {
    const db = getDatabase();

    // Get current level info
    const currentLevel = LevelService.getLevelById(currentLevelId);
    if (!currentLevel) throw new Error('Level not found');

    // Get current level words with mastery and attempts
    const currentLevelWords = this.getWordsWithMastery(userId, [currentLevelId]);

    if (currentLevelWords.length === 0) {
      throw new Error(
        `No words found for level ${currentLevel.level_number}. ` +
          `Please run 'npm run seed' to populate the database.`
      );
    }

    // STEP 2: Get previous level words with mastery and attempts (limited to 3)
    const previousLevels = db
      .prepare(
        `
      SELECT id FROM levels WHERE level_number < ?
    `
      )
      .all(currentLevel.level_number) as { id: number }[];

    let previousLevelWords: (Word & { mastery: number; attempts: number })[] = [];
    if (previousLevels.length > 0) {
      const previousLevelIds = previousLevels.map((l) => l.id);

      // Get previous level words with attempts and mastery (limited to 3 lowest attempts)
      previousLevelWords = this.getWordsWithMastery(userId, previousLevelIds, 3);
    }

    // Combine current level words with limited previous level words
    return [...currentLevelWords, ...previousLevelWords];
  }

  /**
   * Gets words with mastery levels and attempt counts for specified level IDs
   * @param userId - User ID to get mastery for
   * @param levelIds - Array of level IDs to fetch words from
   * @param limit - Optional limit for results (sorts by attempts ASC, then mastery ASC)
   * @returns Words with mastery levels and attempt counts
   */
  private static getWordsWithMastery(
    userId: number,
    levelIds: number[],
    limit?: number
  ): (Word & { mastery: number; attempts: number })[] {
    const db = getDatabase();

    if (levelIds.length === 0) return [];

    const placeholders = levelIds.map(() => '?').join(',');
    let query = `
      SELECT w.*,
             COALESCE(uwp.mastery_level, 0) as mastery,
             COALESCE(attempts.total, 0) as attempts
      FROM words w
      LEFT JOIN user_word_progress uwp ON w.id = uwp.word_id AND uwp.user_id = ?
      LEFT JOIN (
        SELECT sa.word_id, COUNT(*) as total
        FROM session_answers sa
        JOIN sessions s ON sa.session_id = s.id
        WHERE s.user_id = ?
        GROUP BY sa.word_id
      ) attempts ON w.id = attempts.word_id
      WHERE w.level_id IN (${placeholders})
    `;

    if (limit) {
      query += ` ORDER BY attempts ASC, mastery ASC LIMIT ${limit}`;
    }

    return db.prepare(query).all(userId, userId, ...levelIds) as (Word & {
      mastery: number;
      attempts: number;
    })[];
  }

  private static createQuestion(
    word: Word,
    type: Question['type'],
    allWords: Word[],
    levelMastery: number
  ): Question {
    switch (type) {
      case 'fr_to_en':
        return {
          id: word.id,
          word,
          type,
          question: `Translate to English: "${word.french}"`,
          correct_answer: word.english,
        };

      case 'en_to_fr':
        return {
          id: word.id,
          word,
          type,
          question: `Translate to French: "${word.english}"`,
          correct_answer: word.french,
        };

      case 'fill_blank':
        return this.createFillBlankQuestion(word, levelMastery);

      case 'multiple_choice':
        const options = this.generateMultipleChoiceOptions(word, allWords);
        return {
          id: word.id,
          word,
          type,
          question: `What does "${word.french}" mean?`,
          correct_answer: word.english,
          options,
        };

      default:
        throw new Error('Unknown question type');
    }
  }

  // Create a fill-in-the-blank question for a word.
  private static createFillBlankQuestion(word: Word, levelMastery: number): Question {
    const db = getDatabase();

    // Get example sentences for this word
    // TEMP DEBUGS
    const examples = db
      .prepare(
        `
      SELECT * FROM example_sentences 
      WHERE word_id = ? 
      ORDER BY id
    `
      )
      .all(word.id) as ExampleSentence[];

    let sentence: string;
    let correctAnswer: string;
    let english_translation: string = '';

    if (examples.length > 0) {
      // Use a random example sentence
      const example = examples[Math.floor(Math.random() * examples.length)];

      // Use word_to_replace if available, otherwise use the word
      const wordToBlank = example.word_to_replace || word.french.replace(/^(le|la|l') /, '');

      // Escape special regex characters
      const escapedWord = wordToBlank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create regex (handles accents, apostrophes)
      const wordPattern = new RegExp(
        `(?<=\\s|^|'|[-])${escapedWord}(?=\\s|\\.|,|!|\\?|'|[-]|$)`,
        'gi'
      );

      // Replace the word with blank
      sentence = example.french_sentence.replace(wordPattern, '___');
      correctAnswer = wordToBlank;
      english_translation = example.english_translation || '';
    } else {
      // Fallback to simple sentence
      const article = word.gender || '';
      sentence = `${article} ___ ${word.word_type === 'verb' ? 'est important' : 'est beau'}`;
      correctAnswer = word.french.replace(/^(le|la|l') /, '');
    }

    // Add root verb hint for verbs when level mastery is low
    let questionText = `Fill in the blank with "${word.english}":<br>"${sentence}"`;
    if (word.word_type === 'verb' && levelMastery < 60) {
      questionText = `Fill in the blank with "${word.english}" (${word.french}):<br>"${sentence}"`;
    }

    // a full question response.
    return {
      id: word.id,
      word,
      type: 'fill_blank',
      question: questionText,
      correct_answer: correctAnswer,
      sentence_context: sentence,
      english_translation: english_translation,
    };
  }

  // Generate multiple choice options: correct answer + 3 wrong answers
  private static generateMultipleChoiceOptions(correctWord: Word, allWords: Word[]): string[] {
    const options: string[] = [correctWord.english];

    // First try to find words of the same type
    let sameType = allWords.filter(
      (w) => w.word_type === correctWord.word_type && w.id !== correctWord.id
    );

    // If not enough same-type words, expand to all words
    if (sameType.length < 3) {
      sameType = allWords.filter((w) => w.id !== correctWord.id);
    }

    // Add 3 random wrong answers
    while (options.length < 4 && sameType.length > 0) {
      const randomIndex = Math.floor(Math.random() * sameType.length);
      const wrongAnswer = sameType[randomIndex].english;

      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }

      sameType.splice(randomIndex, 1);
    }

    // If still not enough options, add generic options
    if (options.length < 4) {
      const genericOptions = ['house', 'car', 'book', 'water', 'food', 'time', 'place', 'thing'];
      for (const option of genericOptions) {
        if (!options.includes(option) && options.length < 4) {
          options.push(option);
        }
      }
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  // Record user's answer and update progress.
  static recordAnswer(
    sessionId: number,
    userId: number,
    wordId: number,
    questionType: string,
    questionText: string,
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
    db.prepare(
      `
      INSERT INTO session_answers 
      (session_id, word_id, question_type, question_text, user_answer, 
       correct_answer, correct)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      sessionId,
      wordId,
      questionType,
      questionText,
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

  static getSessionResult(sessionId: number, userId: number): SessionResult {
    const db = getDatabase();

    // Get session
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session;

    // Get all answers
    const answers = db
      .prepare(
        `
      SELECT * FROM session_answers WHERE session_id = ?
    `
      )
      .all(sessionId) as any[];

    // Calculate score
    const correctCount = answers.filter((a) => a.correct === 1).length;
    const percentage = Math.round((correctCount / session.total_questions) * 100);
    const passed = percentage >= 80;

    // Update session
    db.prepare(
      `
      UPDATE sessions 
      SET score = ?, passed = ?
      WHERE id = ?
    `
    ).run(correctCount, passed ? 1 : 0, sessionId);

    // Increment attempt count for this level when session is completed
    UserLevelService.incrementAttempts(userId, session.level_id);

    // Update mastery for all levels and check if session level newly hit 80%
    const { newlyHitMastery } = UserLevelService.updateAllLevelMastery(userId, session.level_id);

    // Get incorrect words with examples and Google search links
    const incorrectWords = answers
      .filter((a) => a.correct === 0)
      .map((answer) => {
        const word = db.prepare('SELECT * FROM words WHERE id = ?').get(answer.word_id) as Word;

        const examples = db
          .prepare(
            `
          SELECT * FROM example_sentences 
          WHERE word_id = ? 
          ORDER BY id
        `
          )
          .all(answer.word_id) as ExampleSentence[];

        // Generate Google search links for feedback.
        const dictQuery = encodeURIComponent(`define french word ${word.french}`);
        const dictLink = `<a href="https://www.google.com/search?udm=50&q=${dictQuery}" target="_blank">Dictionary</a>`;
        const vocabQuery = encodeURIComponent(`Where does french word ${word.french} come from?`);
        const vocabLink = ` | <a href="https://www.google.com/search?udm=50&q=${vocabQuery}" target="_blank">French Roots</a>`;
        let conjugationLink = '';
        if (word.word_type === 'verb') {
          const conjQuery = encodeURIComponent(`How do we conjugate french word ${word.french}?`);
          conjugationLink = ` | <a href="https://www.google.com/search?udm=50&q=${conjQuery}" target="_blank">Conjugations</a>`;
        }
        const google_links = dictLink + vocabLink + conjugationLink;

        return {
          word,
          user_answer: answer.user_answer,
          correct_answer: answer.correct_answer,
          question_type: answer.question_type,
          question_text: answer.question_text,
          examples,
          google_links,
        };
      });

    return {
      session_id: sessionId,
      score: correctCount,
      total_questions: session.total_questions,
      passed,
      percentage,
      newlyHitMastery,
      incorrect_words: incorrectWords,
    };
  }

  /**
   * Select words with weighted probability based on both mastery level and attempt count.
   * Words with lower mastery get higher priority, then attempt count is considered.
   * This ensures struggling words appear more frequently than well-mastered ones.
   */
  private static selectWeightedWords(
    words: (Word & { mastery: number; attempts: number })[],
    count: number
  ): Word[] {
    if (words.length === 0) {
      return [];
    }

    // Create weighted list factoring both attempts and mastery
    const weightedWords: Word[] = [];
    for (const word of words) {
      // Base weight from mastery: lower mastery = higher weight (max 10x for 0% mastery)
      // 0% mastery = 10x, 50% = 5x, 90%+ = 1x
      const masteryWeight = Math.max(1, Math.round(10 - word.mastery / 10));

      // Additional weight from attempts: fewer attempts = higher weight (max 9x)
      // Words with 0 attempts get 9x weight, words with 8+ attempts get 1x weight
      const attemptWeight = Math.max(1, Math.round(9 - word.attempts));

      // Combine weights: mastery weight has more influence
      const totalWeight = masteryWeight * attemptWeight;

      for (let i = 0; i < totalWeight; i++) {
        weightedWords.push(word);
      }
    }

    // Randomly select words from weighted pool
    const selectedWords: Word[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * weightedWords.length);
      selectedWords.push(weightedWords[randomIndex]);
    }

    return selectedWords;
  }

  static getUserSessions(userId: number): Session[] {
    const db = getDatabase();
    return db
      .prepare(
        `
      SELECT s.*, l.name as level_name 
      FROM sessions s
      JOIN levels l ON s.level_id = l.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `
      )
      .all(userId) as Session[];
  }
}
