// remove_italic_paragraphs.js
// Removes all <p style="font-style: italic;">...</p> blocks from book_text.txt

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'book_text.txt');

let text = fs.readFileSync(filePath, 'utf8');

// Regex to remove all <p style="font-style: italic;">...</p> (non-greedy)
text = text.replace(/<p style="font-style: italic;">[\s\S]*?<\/p>\s*/g, '');

// Remove all HTML tags
text = text.replace(/<[^>]+>/g, '');

fs.writeFileSync(filePath, text, 'utf8');

console.log('Removed all italic paragraphs and HTML tags from book_text.txt');
