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

    // Get all words from current and previous levels
    const currentLevel = LevelService.getLevelById(currentLevelId);
    if (!currentLevel) throw new Error('Level not found');

    const availableLevels = db.prepare(`
      SELECT id FROM levels WHERE level_number <= ?
    `).all(currentLevel.level_number) as { id: number }[];

    const levelIds = availableLevels.map(l => l.id);

    // Get all words from these levels
    const placeholders = levelIds.map(() => '?').join(',');
    const allWords = db.prepare(`
      SELECT * FROM words WHERE level_id IN (${placeholders})
    `).all(...levelIds) as Word[];

    if (allWords.length === 0) {
      throw new Error(
        `No words found for level ${currentLevel.level_number}. ` +
        `Please run 'npm run seed' to populate the database.`
      );
    }

    // Weight words by struggle (lower mastery = higher weight)
    const weightedWords: Word[] = [];
    for (const word of allWords) {
      const mastery = ProgressService.getWordMastery(userId, word.id);
      // Inverse weighting: 0% mastery = 10x, 50% = 5x, 
      // 90% = 1x, 100% = 1x
      const weight = Math.max(1, Math.round(10 - (mastery / 10)));
      
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

    for (let i = 0; i < selectedWords.length; i++) {
      const word = selectedWords[i];
      const typeIndex = Math.floor(Math.random() * 
                                    questionTypes.length);
      const type = questionTypes[typeIndex];

      questions.push(this.createQuestion(word, type, allWords));
    }

    return questions;
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
    
    // Normalize answers for comparison
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
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

    // If passed, update user level
    if (passed) {
      const level = LevelService.getLevelById(session.level_id);
      if (level) {
        const user = db.prepare(
          'SELECT current_level FROM users WHERE id = ?'
        ).get(userId) as { current_level: number };

        if (level.level_number >= user.current_level) {
          db.prepare(`
            UPDATE users SET current_level = ? WHERE id = ?
          `).run(level.level_number + 1, userId);
        }
      }
    }

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

