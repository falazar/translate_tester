#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to check for duplicate words in words_french.json
 * Usage: node scripts/check_duplicates.js word1 word2 word3...
 * Or: echo "word1 word2 word3" | node scripts/check_duplicates.js
 */

// Read the words JSON file
const jsonPath = path.join(__dirname, '..', 'data', 'words_french.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Get all existing French words
const existingWords = new Set();
data.levels.forEach(level => {
  level.words.forEach(word => {
    existingWords.add(word.french);
  });
});

console.log(`📚 Checking against ${existingWords.size} existing words in the database\n`);

// Get words to check from command line arguments or stdin
let wordsToCheck = [];

if (process.argv.length > 2) {
  // Words provided as command line arguments
  wordsToCheck = process.argv.slice(2);
} else {
  // Check if there's input from stdin
  const stdin = process.stdin;
  let inputData = '';

  stdin.setEncoding('utf8');
  stdin.on('data', chunk => {
    inputData += chunk;
  });

  stdin.on('end', () => {
    if (inputData.trim()) {
      wordsToCheck = inputData.trim().split(/\s+/);
      checkWords(wordsToCheck);
    } else {
      showUsage();
    }
  });

  // If no stdin data and no args, show usage
  setTimeout(() => {
    if (!inputData) {
      showUsage();
    }
  }, 100);

  return;
}

checkWords(wordsToCheck);

function checkWords(words) {
  console.log('🔍 Checking words:', words.join(', '));
  console.log('═'.repeat(50));

  const available = [];
  const duplicates = [];

  words.forEach(word => {
    if (existingWords.has(word)) {
      duplicates.push(word);
    } else {
      available.push(word);
    }
  });

  if (available.length > 0) {
    console.log('\n✅ AVAILABLE WORDS (' + available.length + '):');
    available.forEach(word => console.log('   ✓ ' + word));
  }

  if (duplicates.length > 0) {
    console.log('\n❌ DUPLICATE WORDS (' + duplicates.length + '):');
    duplicates.forEach(word => console.log('   ✗ ' + word));
  }

  if (available.length === 0 && duplicates.length === 0) {
    console.log('\n⚠️  No words provided to check.');
  }

  console.log('\n📊 SUMMARY:');
  console.log(`   Available: ${available.length}`);
  console.log(`   Duplicates: ${duplicates.length}`);
  console.log(`   Total checked: ${words.length}`);
}

function showUsage() {
  console.log('🔧 Word Duplicate Checker for French Learning App');
  console.log('');
  console.log('USAGE:');
  console.log('  node scripts/check_duplicates.js word1 word2 word3...');
  console.log('  echo "word1 word2 word3" | node scripts/check_duplicates.js');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  node scripts/check_duplicates.js restaurant menu café');
  console.log('  echo "bonjour au revoir merci" | node scripts/check_duplicates.js');
  console.log('');
  console.log('This script checks if the provided French words already exist in words_french.json');
  process.exit(1);
}
