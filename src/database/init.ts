import dotenv from 'dotenv';
import { getDatabase, closeDatabase } from './connection';
import { createTables } from './schema';

// Load environment variables
dotenv.config();

function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    const db = getDatabase();
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

