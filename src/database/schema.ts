import Database from 'better-sqlite3';

export function createTables(db: Database.Database): void {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      current_level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Levels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_number INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      required_pass_rate INTEGER DEFAULT 90,
      total_words INTEGER DEFAULT 20
    );
  `);

  // Words table
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      french TEXT NOT NULL,
      english TEXT NOT NULL,
      word_type TEXT NOT NULL,
      level_id INTEGER NOT NULL,
      gender TEXT,
      UNIQUE(french, level_id),
      FOREIGN KEY (level_id) REFERENCES levels(id)
    );
  `);

  // Example sentences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS example_sentences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      french_sentence TEXT NOT NULL,
      english_translation TEXT NOT NULL,
      word_to_replace TEXT,
      difficulty TEXT DEFAULT 'simple',
      UNIQUE(word_id, french_sentence),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );
  `);

  // User word progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_word_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      mastery_level INTEGER DEFAULT 0,
      last_reviewed DATETIME,
      UNIQUE(user_id, word_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );
  `);

  // User levels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      mastery INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      unlocked_at DATETIME,
      mastery_hit DATETIME,
      last_practiced DATETIME,
      UNIQUE(user_id, level_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (level_id) REFERENCES levels(id)
    );
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER DEFAULT 20,
      passed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (level_id) REFERENCES levels(id)
    );
  `);

  // Session answers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      question_type TEXT NOT NULL,
      question_text TEXT NOT NULL,
      user_answer TEXT,
      correct_answer TEXT NOT NULL,
      correct INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_words_level 
    ON words(level_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_progress 
    ON user_word_progress(user_id, word_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user 
    ON sessions(user_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_levels 
    ON user_levels(user_id, level_id);
  `);

  console.log('Database tables created successfully');
}
