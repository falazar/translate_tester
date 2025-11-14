import { describe, expect, it } from 'vitest';
import { TextService } from '../src/services/textService';

describe('TextService.cleanAndTokenizeText', () => {
  it('removes HTML tags and non-ASCII, preserves French accents, and tokenizes', () => {
    const input = "<p>Hello <b>world</b>! Ça va?</p>\n<p>l'amour, qu'il l'été, l'île</p>";
    const { textWithoutHtml, words } = TextService.cleanAndTokenizeText(input);
    // HTML removed, non-ASCII removed except French accents, line breaks removed, apostrophes normalized
    expect(textWithoutHtml).toBe("Hello world! Ça va? l'amour, qu'il l'été, l'île");
    // Tokenization: should split on French elisions and punctuation
    expect(words).toEqual([
      'Hello', 'world', 'Ça', 'va', 'amour', "qu'il", 'été', 'île'
    ]);
  });

  it('handles empty input', () => {
    const { textWithoutHtml, words } = TextService.cleanAndTokenizeText('');
    expect(textWithoutHtml).toBe('');
    expect(words).toEqual([]);
  });

  it('removes line breaks and normalizes apostrophes, preserves French accents', () => {
    const input = "Bonjour\nle monde! <span>l’été est là. L’île d’Oléron.";
    const { textWithoutHtml, words } = TextService.cleanAndTokenizeText(input);
    expect(textWithoutHtml).toBe("Bonjour le monde! l'été est là. L'île d'Oléron.");
    expect(words).toContain('Bonjour');
    expect(words).toContain('monde');
    // expect(words).toContain('L');
    expect(words).toContain('été');
    expect(words).toContain('île');
    expect(words).toContain('Oléron');
  });

  it('removes French elision forms (j\', l\', etc.)', () => {
    const input = "j'aime l'amour n'est d'accord m'appelle";
    // TODO should really have a .j'aime to test also.
    const { words } = TextService.cleanAndTokenizeText(input);
    // Should split elisions
    expect(words).toContain('aime');
    expect(words).toContain('amour');
    expect(words).toContain('est');
    expect(words).toContain('accord');
    expect(words).toContain('appelle');
  });

  it('handles French sentences with elisions and accents', () => {
    const input = "Quelque chose qu'il avait entendu avait dû lui faire comprendre que l'affaire de la semaine était sinistre.\nj’ai joué avec une analogie avec une pomme – jeter le déjeuner d’Alain hors du fort et";
    const { textWithoutHtml, words } = TextService.cleanAndTokenizeText(input);
    expect(textWithoutHtml).toBe("Quelque chose qu'il avait entendu avait dû lui faire comprendre que l'affaire de la semaine était sinistre. j'ai joué avec une analogie avec une pomme  jeter le déjeuner d'Alain hors du fort et");
    expect(words).toContain("qu'il");
    expect(words).toContain("avait");
    expect(words).toContain("dû");
    expect(words).toContain("affaire");
    expect(words).toContain("semaine");
    expect(words).toContain("était");
    expect(words).toContain("sinistre");
    expect(words).toContain("ai");
    expect(words).toContain("joué");
    expect(words).toContain("pomme");
    expect(words).toContain("déjeuner");
    expect(words).toContain("Alain");
  });
});
