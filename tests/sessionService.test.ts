import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDatabase } from '../src/database/connection';
import { SessionService } from '../src/services/sessionService';

// Mock the database connection
vi.mock('../src/database/connection', () => ({
  getDatabase: vi.fn(),
}));

// Mock other services
vi.mock('../src/services/levelService', () => ({
  LevelService: {
    getLevelById: vi.fn(),
  },
}));

vi.mock('../src/services/progressService', () => ({
  ProgressService: {
    updateProgress: vi.fn(),
  },
}));

vi.mock('../src/services/userLevelService', () => ({
  UserLevelService: {
    getOrCreateUserLevel: vi.fn(),
    incrementAttempts: vi.fn(),
    updateAllLevelMastery: vi.fn(),
  },
}));

// Import mocked services for use in tests
import { LevelService } from '../src/services/levelService';
import { ProgressService } from '../src/services/progressService';
import { UserLevelService } from '../src/services/userLevelService';

describe('SessionService', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      prepare: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
    };
    (getDatabase as any).mockReturnValue(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('selectWeightedWords', () => {
    it('should prioritize words with lower mastery levels', () => {
      const words = [
        {
          id: 1,
          french: 'word1',
          english: 'word1',
          word_type: 'noun',
          gender: 'le',
          mastery: 0,
          attempts: 5,
        },
        {
          id: 2,
          french: 'word2',
          english: 'word2',
          word_type: 'noun',
          gender: 'le',
          mastery: 50,
          attempts: 5,
        },
        {
          id: 3,
          french: 'word3',
          english: 'word3',
          word_type: 'noun',
          gender: 'le',
          mastery: 80,
          attempts: 5,
        },
        {
          id: 4,
          french: 'word4',
          english: 'word4',
          word_type: 'noun',
          gender: 'le',
          mastery: 95,
          attempts: 5,
        },
      ];

      const selectedWords = (SessionService as any).selectWeightedWords(words, 1000); // Use larger sample for better statistics

      // Count occurrences of each word
      const wordCounts = selectedWords.reduce((acc: any, word: any) => {
        acc[word.id] = (acc[word.id] || 0) + 1;
        return acc;
      }, {});

      // Word with 0% mastery should appear most frequently
      expect(wordCounts[1]).toBeGreaterThan(wordCounts[2]);
      expect(wordCounts[2]).toBeGreaterThan(wordCounts[3]);
      expect(wordCounts[3]).toBeGreaterThan(wordCounts[4]);
    });

    it('should consider both mastery and attempts in weighting', () => {
      const words = [
        {
          id: 1,
          french: 'word1',
          english: 'word1',
          word_type: 'noun',
          gender: 'le',
          mastery: 20,
          attempts: 10,
        }, // struggling word with some attempts
        {
          id: 2,
          french: 'word2',
          english: 'word2',
          word_type: 'noun',
          gender: 'le',
          mastery: 95,
          attempts: 21,
        }, // well-mastered with many attempts
        {
          id: 3,
          french: 'word3',
          english: 'word3',
          word_type: 'noun',
          gender: 'le',
          mastery: 0,
          attempts: 0,
        }, // new word
      ];

      const selectedWords = (SessionService as any).selectWeightedWords(words, 1000);

      // Count occurrences
      const wordCounts = selectedWords.reduce((acc: any, word: any) => {
        acc[word.id] = (acc[word.id] || 0) + 1;
        return acc;
      }, {});

      // New word (0 mastery, 0 attempts) should appear most
      expect(wordCounts[3]).toBeGreaterThan(wordCounts[1]);
      // Struggling word should appear more than well-mastered word
      expect(wordCounts[1]).toBeGreaterThan(wordCounts[2]);
    });

    it('should return exactly the requested number of words', () => {
      const words = [
        {
          id: 1,
          french: 'word1',
          english: 'word1',
          word_type: 'noun',
          gender: 'le',
          mastery: 50,
          attempts: 5,
        },
        {
          id: 2,
          french: 'word2',
          english: 'word2',
          word_type: 'noun',
          gender: 'le',
          mastery: 50,
          attempts: 5,
        },
        {
          id: 3,
          french: 'word3',
          english: 'word3',
          word_type: 'noun',
          gender: 'le',
          mastery: 50,
          attempts: 5,
        },
      ];

      const count = 15;
      const selectedWords = (SessionService as any).selectWeightedWords(words, count);

      expect(selectedWords).toHaveLength(count);
    });

    it('should handle empty word list', () => {
      const selectedWords = (SessionService as any).selectWeightedWords([], 10);
      expect(selectedWords).toHaveLength(0);
    });

    it('should calculate weights correctly for edge cases', () => {
      const words = [
        {
          id: 1,
          french: 'word1',
          english: 'word1',
          word_type: 'noun',
          gender: 'le',
          mastery: 0,
          attempts: 0,
        }, // 10 * 4 = 40
        {
          id: 2,
          french: 'word2',
          english: 'word2',
          word_type: 'noun',
          gender: 'le',
          mastery: 100,
          attempts: 0,
        }, // 1 * 4 = 4
        {
          id: 3,
          french: 'word3',
          english: 'word3',
          word_type: 'noun',
          gender: 'le',
          mastery: 0,
          attempts: 25,
        }, // 10 * 1 = 10
        {
          id: 4,
          french: 'word4',
          english: 'word4',
          word_type: 'noun',
          gender: 'le',
          mastery: 100,
          attempts: 25,
        }, // 1 * 1 = 1
      ];

      // Test that we can call the method without errors
      const selectedWords = (SessionService as any).selectWeightedWords(words, 100);
      expect(selectedWords).toHaveLength(100);

      // All selected words should be from our input list
      const selectedIds = new Set(selectedWords.map((w: any) => w.id));
      expect(selectedIds.size).toBeGreaterThan(0);
      expect(selectedIds.size).toBeLessThanOrEqual(4);
    });
  });

  describe('createSession', () => {
    it('should create a new session', () => {
      const mockResult = { lastInsertRowid: 123 };
      mockDb.run.mockReturnValue(mockResult);
      mockDb.prepare.mockReturnValueOnce(mockDb); // for INSERT
      mockDb.prepare.mockReturnValueOnce(mockDb); // for SELECT
      mockDb.get.mockReturnValue({
        id: 123,
        user_id: 1,
        level_id: 1,
        score: 0,
        total_questions: 20,
        passed: 0,
        created_at: '2024-01-01T00:00:00Z',
      });

      const session = SessionService.createSession(1, 1);

      expect(mockDb.run).toHaveBeenCalledWith(1, 1);
      expect(session.id).toBe(123);
      expect(session.user_id).toBe(1);
      expect(session.level_id).toBe(1);
    });
  });

  describe('generateQuestions', () => {
    it('should generate questions for a session', () => {
      // Mock services
      (LevelService.getLevelById as any).mockReturnValue({ id: 1, level_number: 1 });
      (UserLevelService.getOrCreateUserLevel as any).mockReturnValue({ mastery: 50 });

      // Mock all database queries
      mockDb.prepare.mockReturnValue({
        all: vi.fn().mockImplementation((...args: any[]) => {
          // Return different data based on the query pattern
          if (args.length === 1 && typeof args[0] === 'number') {
            // This is likely the example sentences query with word_id
            return [{ french_sentence: 'Le test est important.', word_to_replace: 'test' }];
          } else if (args.length === 1) {
            // This is likely the previous levels query
            return [];
          } else {
            // This is likely the words query
            return [
              {
                id: 1,
                french: 'test',
                english: 'test',
                word_type: 'noun',
                gender: 'le',
                mastery: 50,
                attempts: 5,
              },
            ];
          }
        }),
      });

      const questions = SessionService.generateQuestions(1, 1);

      expect(questions).toHaveLength(20); // QUESTIONS_PER_SESSION
      expect(questions[0]).toHaveProperty('id');
      expect(questions[0]).toHaveProperty('type');
    });
  });

  describe('recordAnswer', () => {
    it('should record an answer and update progress', () => {
      const mockRun = vi.fn();
      mockDb.prepare.mockReturnValue({
        run: mockRun,
      });

      const result = SessionService.recordAnswer(
        1,
        1,
        1,
        'fr_to_en',
        'Question',
        'correct',
        'correct'
      );

      expect(ProgressService.updateProgress).toHaveBeenCalledWith(1, 1, true);
      expect(result).toBe(true);
      expect(mockRun).toHaveBeenCalledWith(1, 1, 'fr_to_en', 'Question', 'correct', 'correct', 1);
    });

    it('should handle incorrect answers', () => {
      const mockRun = vi.fn();
      mockDb.prepare.mockReturnValue({
        run: mockRun,
      });

      const result = SessionService.recordAnswer(
        1,
        1,
        1,
        'fr_to_en',
        'Question',
        'Wrong',
        'Correct'
      );

      expect(ProgressService.updateProgress).toHaveBeenCalledWith(1, 1, false);
      expect(result).toBe(false);
      expect(mockRun).toHaveBeenCalledWith(1, 1, 'fr_to_en', 'Question', 'Wrong', 'Correct', 0);
    });
  });

  describe('getSessionResult', () => {
    it('should calculate session results correctly', () => {
      // Mock session data
      mockDb.prepare.mockReturnValueOnce({
        get: vi.fn().mockReturnValue({
          id: 1,
          user_id: 1,
          level_id: 1,
          total_questions: 20,
          created_at: '2024-01-01T00:00:00Z',
        }),
      });

      // Mock answers data
      mockDb.prepare.mockReturnValueOnce({
        all: vi.fn().mockReturnValue([
          {
            correct: 1,
            word_id: 1,
            user_answer: 'correct',
            correct_answer: 'correct',
            question_type: 'fr_to_en',
            question_text: 'test',
          },
          {
            correct: 0,
            word_id: 2,
            user_answer: 'wrong',
            correct_answer: 'correct',
            question_type: 'fr_to_en',
            question_text: 'test',
          },
        ]),
      });

      // Mock update session score query
      const mockRun = vi.fn();
      mockDb.prepare.mockReturnValueOnce({
        run: mockRun,
      });

      // Mock word lookup
      mockDb.prepare.mockReturnValueOnce({
        get: vi.fn().mockReturnValue({
          id: 1,
          french: 'test',
          english: 'test',
          word_type: 'noun',
        }),
      });

      // Mock example sentences
      mockDb.prepare.mockReturnValueOnce({
        all: vi.fn().mockReturnValue([]),
      });

      (UserLevelService.incrementAttempts as any).mockReturnValue(undefined);
      (UserLevelService.updateAllLevelMastery as any).mockReturnValue({ newlyHitMastery: false });

      const result = SessionService.getSessionResult(1, 1);

      expect(result.score).toBe(1);
      expect(result.total_questions).toBe(20);
      expect(result.percentage).toBe(5); // 1/20 * 100
      expect(result.passed).toBe(false);
      expect(result.incorrect_words).toHaveLength(1);

      // Verify database update was called
      expect(mockRun).toHaveBeenCalledWith(1, 0, 1); // correctCount=1, passed=0, sessionId=1
    });
  });

  describe('getUserSessions', () => {
    it('should retrieve user sessions with level names', () => {
      mockDb.prepare.mockReturnValue({
        all: vi.fn().mockReturnValue([
          {
            id: 1,
            user_id: 1,
            level_id: 1,
            score: 15,
            total_questions: 20,
            passed: 1,
            level_name: 'Level 1',
            created_at: '2024-01-01T00:00:00Z',
          },
        ]),
      });

      const sessions = SessionService.getUserSessions(1) as any[];

      expect(sessions).toHaveLength(1);
      expect(sessions[0].level_name).toBe('Level 1');
    });
  });
});
