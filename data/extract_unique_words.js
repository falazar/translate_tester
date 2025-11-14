#!/usr/bin/env node
// Script to extract all unique French words from the SQLite database and write to all_words.txt

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Adjust the path to your SQLite DB file as needed
const dbPath = path.join(__dirname, 'game.db');
const outPath = path.join(__dirname, 'all_words.txt');

function main() {
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare('SELECT DISTINCT french FROM words ORDER BY french COLLATE NOCASE').all();
  const header = '# All unique French words extracted from the SQLite database\n';
  const words = rows.map(r => r.french).filter(Boolean);
  fs.writeFileSync(outPath, header + words.join('\n') + '\n', 'utf8');
  console.log(`Extracted ${words.length} unique words to all_words.txt`);
}

main();
