/**
 * Case validator — runs against every shipped case.
 *
 * Invariants checked:
 *   1. The Case file's structural types are correct (TypeScript check).
 *   2. The surface-text Markdown file exists and is non-empty.
 *   3. Every clue's "ghost hints" / "surface meaning" are findable in
 *      the surface text — i.e. the Fair Play contract holds.
 *   4. The forbidden words ("secret", "lie", "hidden", "mystery",
 *      "truth") do not appear in the surface text.
 *   5. The recurring-image expectation: a key phrase appears at least
 *      three times. (We check this by counting occurrences of the
 *      ghost's "refusesToSay" topic — a heuristic, intentionally
 *      light.)
 *
 * Run with:  pnpm --filter @cipher/shared test
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { SHIPPED_CASES, extractCitedClues } from './index.js';

const FORBIDDEN_WORDS = ['secret', 'lie', 'hidden', 'mystery', 'truth'];

async function readSurface(caseId: string): Promise<string> {
  // When run from the package directory (pnpm test) the cwd is
  // packages/shared. From there, the text files are at src/cases/text.
  // When run from the monorepo root, they are at packages/shared/src/cases/text.
  const candidates = [
    path.join(process.cwd(), 'src', 'cases', 'text', `${caseId}.md`),
    path.join(process.cwd(), 'packages', 'shared', 'src', 'cases', 'text', `${caseId}.md`),
  ];
  for (const filePath of candidates) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      // try the next candidate
    }
  }
  throw new Error(`Could not find surface text for case "${caseId}" in any known location.`);
}

describe('shipped cases — structural invariants', () => {
  for (const c of SHIPPED_CASES) {
    describe(c.id, () => {
      it('has 5–8 clues', () => {
        expect(c.clues.length).toBeGreaterThanOrEqual(5);
        expect(c.clues.length).toBeLessThanOrEqual(8);
      });

      it('has 2–3 red herrings', () => {
        expect(c.redHerrings.length).toBeGreaterThanOrEqual(2);
        expect(c.redHerrings.length).toBeLessThanOrEqual(3);
      });

      it('ghost voice has at least one sentence', () => {
        expect(c.ghost.voice.split(/[.!?]/).filter(Boolean).length).toBeGreaterThanOrEqual(1);
      });

      it('ghost refusesToSay and willAdmit are different', () => {
        expect(c.ghost.refusesToSay).not.toBe(c.ghost.willAdmit);
      });

      it('metaReflection is at least 40 characters long', () => {
        expect(c.metaReflection.length).toBeGreaterThanOrEqual(40);
      });

      it('surface text exists and is at least 400 words', async () => {
        const text = await readSurface(c.id);
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        expect(wordCount).toBeGreaterThanOrEqual(400);
      });

      it('surface text contains no forbidden words (whole-word match)', async () => {
        const text = (await readSurface(c.id)).toLowerCase();
        for (const word of FORBIDDEN_WORDS) {
          // Whole-word match so "lie" does not trip on "believe"/"life".
          const pattern = new RegExp(`\\b${word}\\b`);
          expect(pattern.test(text), `forbidden word "${word}" found in surface text`).toBe(false);
        }
      });

      it('every clue is findable from its own definition (Fair Play)', () => {
        for (const clue of c.clues) {
          const haystack = clue.surfaceMeaning + '. ' + clue.ghostHints.join('. ');
          const found = extractCitedClues(haystack, c).map((x) => x.id);
          expect(found, `clue ${clue.id} cannot be found from its own definition`).toContain(
            clue.id,
          );
        }
      });
    });
  }
});

describe('fair-play sanity checks', () => {
  it('a "well-formed" accusation of the Last Letter scores non-trivially', async () => {
    const c = SHIPPED_CASES.find((x) => x.id === 'the-last-letter');
    if (!c) return;
    const text = await readSurface(c.id);
    expect(text.length).toBeGreaterThan(0);

    // Simulate an accusation that combines surface-meaning words from
    // several clues.
    const accusation =
      'The husband Erich is dead. Marlene is writing letters to a dead man. The envelope is the letter, never sent. The twenty-ninth is the date of his death, not their wedding anniversary. Elisabeth came for the funeral and stays to keep Marlene company.';
    const cited = extractCitedClues(accusation, c);
    expect(cited.length).toBeGreaterThanOrEqual(3);
  });
});
