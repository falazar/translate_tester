import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { closeDatabase, getDatabase } from './connection';

dotenv.config();

// Load data from JSON file
const jsonPath = path.join(__dirname, '../../data/words_french.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Transform JSON levels data
const LEVELS_DATA = jsonData.levels.map((level: any) => ({
  level_number: level.level,
  name: level.title,
  description: level.description,
  total_words: level.words?.length || 20,
}));

// Transform JSON words data
const WORDS_DATA = jsonData.levels.flatMap((level: any) =>
  level.words.map((word: any) => ({
    french: word.french,
    english: word.english,
    word_type: word.word_type,
    level: level.level,
    gender: word.gender,
  }))
);

// Transform JSON sentences data - group by word
const SENTENCES_DATA = jsonData.levels.flatMap((level: any) =>
  level.words.map((word: any) => ({
    word: word.french,
    sentences: (word.sentences || []).map((sentence: any) => ({
      fr: sentence.fr,
      en: sentence.en,
      replace: sentence.replace,
    })),
  }))
);

function seedDatabase() {
  console.log('Seeding database...');

  try {
    const db = getDatabase();

    // UPSERT mode: updates existing, inserts new
    // This preserves word IDs so your progress stays intact!
    console.log('Upserting curriculum data...');

    // Upsert levels
    console.log('Upserting levels...');
    const upsertLevel = db.prepare(`
      INSERT INTO levels (level_number, name, description, 
                          required_pass_rate, total_words)
      VALUES (?, ?, ?, 90, ?)
      ON CONFLICT(level_number) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        total_words = excluded.total_words
    `);

    for (const level of LEVELS_DATA) {
      upsertLevel.run(level.level_number, level.name, level.description, level.total_words || 20);
    }

    // Upsert words
    console.log('Upserting words...');
    const upsertWord = db.prepare(`
      INSERT INTO words (french, english, word_type, level_id, gender)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(french, level_id) DO UPDATE SET
        english = excluded.english,
        word_type = excluded.word_type,
        gender = excluded.gender
    `);

    // Get level IDs for lookup
    const getLevelId = db.prepare('SELECT id FROM levels WHERE level_number = ?');

    for (const word of WORDS_DATA) {
      const levelRow = getLevelId.get(word.level) as { id: number } | undefined;
      if (!levelRow) {
        throw new Error(`Level ${word.level} not found`);
      }
      console.log(
        `Upserting word: ${word.french} - ${word.english} - ${word.word_type} - ${levelRow.id} - ${word.gender}`
      );

      upsertWord.run(
        word.french,
        word.english,
        word.word_type,
        levelRow.id, // Use actual level ID, not level number
        word.gender
      );
    }

    // Insert example sentences from JSON
    console.log('Inserting example sentences...');
    const exampleSentences = SENTENCES_DATA;

    // Upsert example sentences
    console.log('Upserting example sentences...');
    const upsertExample = db.prepare(`
      INSERT INTO example_sentences 
      (word_id, french_sentence, english_translation, 
       word_to_replace, difficulty)
      VALUES (?, ?, ?, ?, 'simple')
      ON CONFLICT(word_id, french_sentence) DO UPDATE SET
        english_translation = excluded.english_translation,
        word_to_replace = excluded.word_to_replace,
        difficulty = excluded.difficulty
    `);

    const getWordId = db.prepare('SELECT id FROM words WHERE french = ?');

    for (const item of exampleSentences) {
      const wordRow = getWordId.get(item.word) as { id: number } | undefined;
      if (wordRow) {
        for (const sentence of item.sentences) {
          upsertExample.run(wordRow.id, sentence.fr, sentence.en, sentence.replace);
        }
      }
    }

    console.log('Database seeded successfully!');
    console.log('- 10 levels created');
    console.log('- 200 words added (20 per level)');
    console.log('- Example sentences added for key words');
    console.log('\nYou can now run: npm run dev');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
