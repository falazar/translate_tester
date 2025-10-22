export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  current_level: number;
  created_at: string;
}

export interface Level {
  id: number;
  level_number: number;
  name: string;
  description: string;
  required_pass_rate: number;
  total_words: number;
}

export interface Word {
  id: number;
  french: string;
  english: string;
  word_type: string;
  level_id: number;
  gender: string | null;
}

export interface ExampleSentence {
  id: number;
  word_id: number;
  french_sentence: string;
  english_translation: string;
  word_to_replace: string | null;
  difficulty: string;
}

export interface UserWordProgress {
  id: number;
  user_id: number;
  word_id: number;
  correct_count: number;
  incorrect_count: number;
  mastery_level: number;
  last_reviewed: string | null;
}

export interface UserLevel {
  id: number;
  user_id: number;
  level_id: number;
  mastery: number;
  attempts: number;
  unlocked_at: string | null;
  mastery_hit: string | null;
  days_to_beat: number | null;
  last_practiced: string | null;
}

export interface Session {
  id: number;
  user_id: number;
  level_id: number;
  score: number;
  total_questions: number;
  passed: number;
  created_at: string;
}

export interface SessionAnswer {
  id: number;
  session_id: number;
  word_id: number;
  question_type: string;
  user_answer: string | null;
  correct_answer: string;
  correct: number;
}

export interface Question {
  id: number;
  word: Word;
  type: 'fr_to_en' | 'en_to_fr' | 'fill_blank' | 'multiple_choice';
  question: string;
  correct_answer: string;
  options?: string[];
  sentence_context?: string;
}

export interface SessionResult {
  session_id: number;
  score: number;
  total_questions: number;
  passed: boolean;
  percentage: number;
  newlyHitMastery?: boolean;
  incorrect_words: Array<{
    word: Word;
    user_answer: string | null;
    correct_answer: string;
    examples: ExampleSentence[];
  }>;
}

