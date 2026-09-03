import { describe, it, expect } from 'vitest';
import { theLastLetter } from './cases/the-last-letter.js';
import {
  fairPlayScore,
  extractCitedClues,
  disclosureThreshold,
  hintLevel,
} from './clue-validator.js';

describe('fairPlayScore', () => {
  it('returns a high score when the accusation cites known clues', () => {
    const accusation =
      'I accuse the husband Erich of being dead. Marlene is writing letters to a dead man. The blue envelope is the letter itself, never sent. The twenty-ninth is the date of his death, not their anniversary.';
    const score = fairPlayScore(accusation, theLastLetter);
    expect(score).toBeGreaterThan(0.4);
  });

  it('returns a low score for accusations unrelated to the case', () => {
    const accusation = 'It was the butler with the candlestick in the conservatory.';
    const score = fairPlayScore(accusation, theLastLetter);
    expect(score).toBeLessThan(0.2);
  });

  it('returns 0 when the case has no clues', () => {
    const empty = { ...theLastLetter, clues: [] };
    const score = fairPlayScore('anything', empty);
    expect(score).toBe(0);
  });
});

describe('extractCitedClues', () => {
  it('extracts clues whose surface words appear in the accusation', () => {
    const result = extractCitedClues(
      'the envelope mentioned was never sent. the drawer holds it',
      theLastLetter,
    );
    expect(result.map((c) => c.id)).toContain('C4');
  });
});

describe('disclosureThreshold', () => {
  it('rises with both evidence and time', () => {
    expect(disclosureThreshold(0, 0, 6)).toBe(0);
    expect(disclosureThreshold(12, 6, 6)).toBeGreaterThan(0.7);
    expect(disclosureThreshold(2, 1, 6)).toBeLessThan(0.3);
  });

  it('is bounded at 1.0', () => {
    expect(disclosureThreshold(100, 100, 6)).toBe(1);
  });
});

describe('hintLevel', () => {
  it('returns 0 when there is no progress', () => {
    expect(hintLevel(0, 0, 6)).toBe(0);
  });

  it('returns 3 when the player has cited most clues', () => {
    expect(hintLevel(1, 5, 6)).toBe(3);
  });

  it('returns 2 when the player has cited roughly half the clues', () => {
    expect(hintLevel(1, 3, 6)).toBe(2);
  });
});
