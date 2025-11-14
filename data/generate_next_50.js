// Script to generate the next 50 high-frequency French words not in all_words.txt
const fs = require('fs');
const path = require('path');
const freqWords = require('./high_frequency_french_words');

const dedupPath = path.join(__dirname, 'all_words.txt');
const outPath = path.join(__dirname, 'next_50_candidates.txt');

function main() {
  const dedupList = fs.readFileSync(dedupPath, 'utf8')
    .split(/\r?\n/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w && !w.startsWith('#'));

  const candidates = [];
  for (const word of freqWords) {
    if (!dedupList.includes(word.toLowerCase()) && !candidates.includes(word)) {
      candidates.push(word);
      if (candidates.length === 50) break;
    }
  }

  fs.writeFileSync(outPath, candidates.join('\n') + '\n', 'utf8');
  console.log(`Next 50 high-frequency candidates written to next_50_candidates.txt`);
}

main();
