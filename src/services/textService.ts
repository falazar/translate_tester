import { getDatabase } from '../database/connection';

export class TextService {
  /**
   * Process uploaded text by removing italic paragraphs and preserving other HTML formatting
   * @param text - The HTML text to process
   * @returns Processed HTML with italic paragraphs removed
   */
  static processText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Use regex to remove <p> tags with italic styling
    // This regex matches <p style="font-style: italic;" class="indent"> and </p> pairs
    const italicParagraphRegex = /<p[^>]*style\s*=\s*["'][^"']*font-style\s*:\s*italic[^"']*["'][^>]*>[\s\S]*?<\/p>/gi;

    // Remove italic paragraphs
    let processedText = text.replace(italicParagraphRegex, '');

    // Clean up any extra whitespace that might be left
    processedText = processedText.replace(/\n\s*\n/g, '\n').trim();

    return processedText;
  }

  /**
   * Analyze text to extract words with frequencies and level information
   * @param text - Text to analyze (after HTML processing)
   * @returns Object with word analysis including frequencies and levels
   */
  static analyzeText(text: string): {
    plainWordFrequencies: Array<{ word: string; count: number }>;
    wordFrequencies: Array<{ word: string; count: number; level: number | 'unknown' }>;
    totalWords: number;
    uniqueWords: number;
    uniqueKnownWords: number;
    unknownWords: number;
    percentageKnown: number;
    highlightedProcessedText: string;
  } {
    if (!text) {
      console.log('analyzeText: No text provided');
      return { plainWordFrequencies: [], wordFrequencies: [], totalWords: 0, uniqueWords: 0, uniqueKnownWords: 0, unknownWords: 0, percentageKnown: 0, highlightedProcessedText: '' };
    }

    // Step 1: Remove all HTML tags
    const textWithoutHtml = text.replace(/<[^>]*>/g, '');

    // Step 2: Break into words using regex that matches French characters and special chars
    let words = textWithoutHtml.match(/\b[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+\b/g) || [];

    if (words.length === 0) {
      // Try the more complex regex for compound words
      words = textWithoutHtml.match(/[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+(?:[''-][a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+)*/g) || [];
    }

    // Step 3: Count word frequencies
    const wordCountMap = new Map<string, number>();
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      wordCountMap.set(lowerWord, (wordCountMap.get(lowerWord) || 0) + 1);
    });

    // Step 4: Create plain word frequencies (sorted by frequency)
    const plainWordFrequencies = Array.from(wordCountMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count); // Sort by frequency descending

    console.log('Created plain word frequencies:', plainWordFrequencies.length, 'items');

    // Step 5: Load word levels data from database
    const wordLevels = this.loadWordLevels();

    // Step 6: Create frequency analysis with level information and aggregate by base word
    const baseWordCounts = new Map<string, { count: number; level: number | 'unknown' }>();

    // Process each word and aggregate by base word
    wordCountMap.forEach((count, word) => {
      const wordMapping = wordLevels.get(word);
      if (wordMapping) {
        // This word is known - aggregate under its base word
        const baseWord = wordMapping.baseWord;
        const existing = baseWordCounts.get(baseWord);
        if (existing) {
          existing.count += count;
        } else {
          baseWordCounts.set(baseWord, {
            count,
            level: wordMapping.level
          });
        }
      } else {
        // This word is unknown - keep it as-is
        baseWordCounts.set(word, {
          count,
          level: 'unknown'
        });
      }
    });

    // Step 7: Convert to array format for sorting
    const wordFrequencies = Array.from(baseWordCounts.entries()).map(([baseWord, data]) => ({
      word: baseWord,
      count: data.count,
      level: data.level as number | 'unknown'
    }));

    // Step 8: Sort by level (unknown last), then by frequency (descending)
    wordFrequencies.sort((a, b) => {
      // Sort by level first (numeric levels, then unknown)
      const levelA = a.level === 'unknown' ? 999 : (a.level as number);
      const levelB = b.level === 'unknown' ? 999 : (b.level as number);

      if (levelA !== levelB) {
        return levelA - levelB;
      }

      // Within same level, sort by frequency descending
      return b.count - a.count;
    });

    // Step 9: Count unknown words
    const unknownWords = wordFrequencies.filter(item => item.level === 'unknown').length;
    const uniqueKnownWords = wordCountMap.size - unknownWords;

    // Step 10: Calculate percentage of known words
    const totalWordCount = wordFrequencies.reduce((sum, item) => sum + item.count, 0);
    const knownWordCount = wordFrequencies
      .filter(item => item.level !== 'unknown')
      .reduce((sum, item) => sum + item.count, 0);
    const percentageKnown = totalWordCount > 0 ? Math.round((knownWordCount / totalWordCount) * 100) : 0;

    // Step 10: Highlight known words in the processed text
    const knownWords = Array.from(wordLevels.keys());
    const highlightedProcessedText = this.highlightKnownWords(textWithoutHtml, knownWords);

    return {
      plainWordFrequencies,
      wordFrequencies,
      totalWords: words.length,
      uniqueWords: wordCountMap.size,
      uniqueKnownWords,
      unknownWords,
      percentageKnown,
      highlightedProcessedText
    };
  }

  /**
   * Load word levels from the database
   * @returns Map of word to level number
   */
  private static loadWordLevels(): Map<string, { level: number; baseWord: string }> {
    try {
      const db = getDatabase();
      const wordLevels = new Map<string, { level: number; baseWord: string }>();

      // Step 1: Query all words with their level information
      const words = db.prepare(`
        SELECT w.french, l.level_number
        FROM words w
        JOIN levels l ON w.level_id = l.id
        ORDER BY l.level_number, w.french
      `).all() as Array<{ french: string; level_number: number }>;

      // Query all replace words from example_sentences with their base word
      const replaceWords = db.prepare(`
        SELECT s.word_to_replace, w.french as base_word, l.level_number
        FROM example_sentences s
        JOIN words w ON s.word_id = w.id
        JOIN levels l ON w.level_id = l.id
        WHERE s.word_to_replace IS NOT NULL AND s.word_to_replace != ''
        ORDER BY l.level_number, s.word_to_replace
      `).all() as Array<{ word_to_replace: string; base_word: string; level_number: number }>;

      // Process main words
      words.forEach(wordData => {
        const cleanWord = this.cleanWord(wordData.french);
        this.addWordMapping(wordLevels, cleanWord, wordData.level_number, cleanWord);
      });

      // Step 2: Process replace words from sentences - map them to their base word
      replaceWords.forEach(replaceData => {
        const cleanBaseWord = this.cleanWord(replaceData.base_word);
        this.addWordMapping(wordLevels, replaceData.word_to_replace.toLowerCase(), replaceData.level_number, cleanBaseWord);
      });

      return wordLevels;
    } catch (error) {
      console.error('Error loading word levels from database:', error);
      return new Map();
    }
  }

  /**
   * Clean a word by removing articles and converting to lowercase
   */
  private static cleanWord(word: string): string {
    let cleanWord = word.toLowerCase();
    if (cleanWord.startsWith('le ') || cleanWord.startsWith('la ') || cleanWord.startsWith("l'")) {
      cleanWord = cleanWord.replace(/^(le |la |l')/, '');
    }
    return cleanWord;
  }

  /**
   * Add word mapping to map
   */
  private static addWordMapping(wordLevels: Map<string, { level: number; baseWord: string }>, word: string, level: number, baseWord: string): void {
    wordLevels.set(word, { level, baseWord });
  }

  /**
   * Validate text input
   * @param text - Text to validate
   * @returns Error message or null if valid
   */
  static validateText(text: string): string | null {
    if (!text || typeof text !== 'string') {
      return 'Text is required and must be a string';
    }

    // Removed length limit to allow large text inputs
    return null;
  }

  /**
   * Highlight known words in text with pale light green background
   * @param text - The processed text to highlight
   * @param knownWords - Array of known words to highlight
   * @returns Text with known words wrapped in highlight spans
   */
  private static highlightKnownWords(text: string, knownWords: string[]): string {
    let highlightedText = text;
    if (knownWords.length > 0) {
      // Sort by length descending to avoid partial matches
      const sortedKnownWords = knownWords.sort((a, b) => b.length - a.length);

      // Process in chunks to avoid regex size limits (JavaScript regex can handle ~1000-2000 alternatives efficiently)
      const CHUNK_SIZE = 500;
      let result = text;

      for (let i = 0; i < sortedKnownWords.length; i += CHUNK_SIZE) {
        const chunk = sortedKnownWords.slice(i, i + CHUNK_SIZE);
        const escapedWords = chunk.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const wordRegex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

        result = result.replace(wordRegex, '<span class="highlighted-known">$1</span>');
      }

      highlightedText = result;
    }

    return highlightedText;
  }
}
