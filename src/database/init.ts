import dotenv from 'dotenv';
import { getDatabase, closeDatabase } from './connection';
import { createTables } from './schema';

// Load environment variables
dotenv.config();

function initializeDatabase() {
  console.log('Initializing database...');
  console.log('WARNING: This will drop all existing tables!');
  
  try {
    const db = getDatabase();
    
    // Drop existing tables to ensure clean schema
    console.log('Dropping existing tables...');
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('DROP TABLE IF EXISTS session_answers');
    db.exec('DROP TABLE IF EXISTS sessions');
    db.exec('DROP TABLE IF EXISTS user_word_progress');
    db.exec('DROP TABLE IF EXISTS example_sentences');
    db.exec('DROP TABLE IF EXISTS words');
    db.exec('DROP TABLE IF EXISTS levels');
    db.exec('DROP TABLE IF EXISTS users');
    db.exec('PRAGMA foreign_keys = ON');
    
    createTables(db);
    console.log('Database initialized successfully!');
    console.log('Run "npm run seed" to populate with sample data.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };

