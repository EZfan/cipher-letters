import { describe, it, expect } from 'vitest';
import {
  PALETTE,
  GHOST_SPRITES,
  CASE_SPRITES,
  CANDLE_FRAMES,
  STAR,
  MAGNIFIER,
  type Sprite,
} from './sprites';

function allSprites(): readonly [string, Sprite][] {
  return [
    ...Object.entries(GHOST_SPRITES).flatMap(([id, frames]): [string, Sprite][] => [
      [`${id}:open`, frames.open],
      [`${id}:closed`, frames.closed],
    ]),
    ...Object.entries(CASE_SPRITES),
    ...CANDLE_FRAMES.map((s, i): [string, Sprite] => [`candle:${i}`, s]),
    ['star', STAR],
    ['magnifier', MAGNIFIER],
  ];
}

describe('pixel sprites', () => {
  for (const [name, sprite] of allSprites()) {
    describe(name, () => {
      it('rows are square and consistent', () => {
        expect(sprite.rows.length).toBe(sprite.size);
        for (const row of sprite.rows) {
          expect(row.length).toBe(sprite.size);
        }
      });

      it('only uses palette characters', () => {
        for (const row of sprite.rows) {
          for (const ch of row) {
            expect(ch === '.' || ch in PALETTE, `unknown char "${ch}"`).toBe(true);
          }
        }
      });

      it('is not empty', () => {
        const filled = sprite.rows
          .join('')
          .split('')
          .filter((c) => c !== '.').length;
        // STAR is a 5×5 twinkle with only five lit pixels by design.
        expect(filled).toBeGreaterThan(sprite.size <= 5 ? 4 : 8);
      });
    });
  }

  it('every shipped case has a portrait and an evidence sprite', () => {
    expect(Object.keys(GHOST_SPRITES).sort()).toEqual(
      ['the-last-letter', 'the-lighthouse-keeper', 'the-studio-interview'].sort(),
    );
    expect(Object.keys(CASE_SPRITES).sort()).toEqual(
      ['the-last-letter', 'the-lighthouse-keeper', 'the-studio-interview'].sort(),
    );
  });

  it('closed-eye frames differ from open-eye frames', () => {
    for (const [, frames] of Object.entries(GHOST_SPRITES)) {
      expect(frames.closed.rows.join('')).not.toBe(frames.open.rows.join(''));
    }
  });
});
