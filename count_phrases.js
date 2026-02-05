const fs = require('fs');

const text = fs.readFileSync('data/book_text.txt', 'utf8');

// Remove punctuation and split into words
const words = text
  .replace(/[^\w\s]/g, '')
  .split(/\s+/)
  .filter((word) => word.length > 0);

const phrases = new Map();

for (let i = 0; i < words.length - 2; i++) {
  const phrase = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
  phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
}

const repeated = Array.from(phrases.entries())
  .filter(([phrase, count]) => count > 1)
  .sort((a, b) => b[1] - a[1]);

console.log('Repeated 3-word phrases:');
repeated.forEach(([phrase, count]) => {
  console.log(`${phrase}: ${count}`);
});
