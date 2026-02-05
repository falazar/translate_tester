// check_words.js
// Usage:
//   node check_words.js [word1 word2 ...]
//
// 1. Fetch all French words from the DB and write to all_words.txt
// 2. If args are passed, check those for duplicates in all_words.txt
//    If no args, check all words in next_words.txt for duplicates

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'game.db');
const allWordsPath = path.join(__dirname, 'all_words.txt');
const nextWordsPath = path.join(__dirname, 'next_words.txt');

function stripNumberPrefix(word) {
  // Remove leading numbers like "1. ", "2. ", etc. and trim spaces
  return word.replace(/^\d+\.\s*/, '').trim();
}

function stripTrailingPunctuation(word) {
  // Remove trailing punctuation: . , ! ? ; : and trim
  return word.replace(/[.,!?;:]$/, '').trim();
}

function fetchAllFrenchWordsSync() {
  // Use a synchronous approach with a child process for sqlite3
  const { execSync } = require('child_process');
  try {
    // Get all french words from words table
    const resultWords = execSync(`sqlite3 "${dbPath}" "SELECT french FROM words;"`, {
      encoding: 'utf8',
    });
    // Get all french sentences from example_sentences table
    const resultExamples = execSync(
      `sqlite3 "${dbPath}" "SELECT word_to_replace FROM example_sentences;"`,
      { encoding: 'utf8' }
    );

    // Split, clean, and combine
    const words = resultWords
      .split(/\r?\n/)
      .map((w) => stripTrailingPunctuation(stripNumberPrefix(w)))
      .filter(Boolean);
    const exampleWords = resultExamples
      .split(/\r?\n/)
      .map((w) => stripTrailingPunctuation(stripNumberPrefix(w)))
      .filter(Boolean);

    // Combine and deduplicate
    const all = Array.from(
      new Set([...words, ...exampleWords].map((w) => w.trim()).filter(Boolean))
    );
    fs.writeFileSync(allWordsPath, all.join('\n'), 'utf8');
    return all;
  } catch (err) {
    console.error('Error fetching words from DB:', err.message);
    process.exit(1);
  }
}

function checkDuplicates(wordsToCheck, allWords) {
  console.log('Words tested:');
  wordsToCheck.forEach((w) => console.log('  ' + w));

  console.log(`\nTotal all_words count: ${allWords.length}\n`);
  const lowerAll = new Set(
    allWords.map((w) => stripTrailingPunctuation(stripNumberPrefix(w)).toLowerCase())
  );
  let found = false;
  const duplicates = [];
  for (const word of wordsToCheck) {
    const cleanWord = stripTrailingPunctuation(stripNumberPrefix(word));
    if (lowerAll.has(cleanWord.toLowerCase())) {
      console.log(`DUPLICATE: ${word}`);
      duplicates.push(word);
      found = true;
    }
  }
  if (!found) {
    console.log('No duplicates found.');
  }

  // Mark duplicates in next_words.txt
  if (duplicates.length > 0) {
    const fileContent = fs.readFileSync(nextWordsPath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    const markedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (duplicates.includes(trimmed)) {
        return line + ' *DUPLICATE*';
      }
      return line;
    });
    fs.writeFileSync(nextWordsPath, markedLines.join('\n'), 'utf8');
    console.log('\nDuplicates marked in next_words.txt');
  }
}

function main() {
  const args = process.argv.slice(2);
  const allWords = fetchAllFrenchWordsSync();

  let wordsToCheck = args;
  if (wordsToCheck.length === 0) {
    // Read from next_words.txt
    if (!fs.existsSync(nextWordsPath)) {
      console.error('next_words.txt not found.');
      process.exit(1);
    }
    wordsToCheck = fs
      .readFileSync(nextWordsPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.includes(' - ') && !line.startsWith('#'))
      .map((w) => stripTrailingPunctuation(stripNumberPrefix(w.split(' - ')[0].trim())))
      .filter(Boolean);
  }

  checkDuplicates(wordsToCheck, allWords);
}

main();
