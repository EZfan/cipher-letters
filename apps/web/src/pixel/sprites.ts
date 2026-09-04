/**
 * Pixel-art sprite data for the PIXEL theme.
 *
 * Everything is generated in code — a 16×16 (or smaller) character grid
 * plus a shared palette. No binary art assets. Character sprites are
 * drawn with small geometry helpers so row lengths can never drift;
 * sprites.test.ts guards every sprite anyway.
 */

export interface Sprite {
  readonly size: number;
  readonly rows: readonly string[];
}

/** Shared palette. '.' (and any unmapped char) renders as transparent. */
export const PALETTE: Readonly<Record<string, string>> = {
  k: '#1b1b2a', // near-black outline / dark hair
  s: '#e8c39e', // skin
  S: '#c99b72', // skin shade
  h: '#5a3a22', // brown hair
  e: '#241f2e', // eye
  w: '#f0ead8', // white (beard, paper)
  g: '#9a9aae', // grey / white-gold trim
  G: '#3f3f57', // dark grey (cap, rock)
  r: '#c43d3d', // red (wax, lips, stripes)
  b: '#35415f', // navy coat
  c: '#5c2430', // dark rose dress
  o: '#e6d3a3', // aged paper
  d: '#b09a6a', // fold / detail
  z: '#a8a8b8', // metal
  y: '#e8b046', // candlelight gold
  n: '#8a6a3a', // brown (diary cover, kettle)
};

type Grid = string[][];

function empty(size = 16): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => '.'));
}

function put(g: Grid, x: number, y: number, ch: string): void {
  if (y >= 0 && y < g.length && x >= 0 && x < (g[0]?.length ?? 0)) {
    g[y]?.splice(x, 1, ch);
  }
}

function rect(g: Grid, x: number, y: number, w: number, h: number, ch: string): void {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) put(g, col, row, ch);
  }
}

function hline(g: Grid, x1: number, x2: number, y: number, ch: string): void {
  for (let x = x1; x <= x2; x++) put(g, x, y, ch);
}

function toSprite(g: Grid): Sprite {
  return { size: g.length, rows: g.map((row) => row.join('')) };
}

// ---------------------------------------------------------------------------
// Ghost portraits — one per shipped case, with an open/closed-eye frame.
// ---------------------------------------------------------------------------

/** Marlene Brandt (The Last Letter): 1920s, dark updo, high-collared dress. */
function drawMarlene(eyes: 'open' | 'closed'): Sprite {
  const g = empty();
  rect(g, 4, 0, 8, 1, 'h');
  rect(g, 3, 1, 10, 1, 'h');
  rect(g, 2, 2, 12, 1, 'h');
  for (let y = 3; y <= 6; y++) {
    put(g, 2, y, 'h');
    put(g, 3, y, 'h');
    put(g, 12, y, 'h');
    put(g, 13, y, 'h');
  }
  rect(g, 4, 3, 8, 1, 's'); // forehead
  rect(g, 3, 4, 10, 2, 's'); // eyes region
  rect(g, 4, 6, 8, 1, 's'); // cheeks
  put(g, 5, 5, eyes === 'open' ? 'e' : 'S');
  put(g, 10, 5, eyes === 'open' ? 'e' : 'S');
  put(g, 7, 7, 'S'); // mouth
  put(g, 8, 7, 'S');
  rect(g, 6, 8, 4, 1, 's'); // neck
  rect(g, 5, 9, 6, 1, 'c'); // high collar
  rect(g, 3, 10, 10, 1, 'c'); // shoulders
  rect(g, 2, 11, 12, 2, 'c');
  rect(g, 1, 13, 14, 2, 'c');
  return toSprite(g);
}

/** Thomas Harker (The Lighthouse Keeper): peaked cap, white beard, navy coat. */
function drawThomas(eyes: 'open' | 'closed'): Sprite {
  const g = empty();
  rect(g, 4, 0, 8, 1, 'G'); // cap crown
  rect(g, 3, 1, 10, 1, 'G');
  rect(g, 2, 2, 12, 1, 'G'); // cap brim
  rect(g, 3, 3, 10, 4, 's'); // face rows 3–6
  put(g, 2, 3, 'g');
  put(g, 2, 4, 'g');
  put(g, 2, 5, 'g'); // white sideburns
  put(g, 13, 3, 'g');
  put(g, 13, 4, 'g');
  put(g, 13, 5, 'g');
  put(g, 5, 4, 'g');
  put(g, 6, 4, 'g'); // bushy white brows
  put(g, 9, 4, 'g');
  put(g, 10, 4, 'g');
  put(g, 5, 5, eyes === 'open' ? 'e' : 'g');
  put(g, 10, 5, eyes === 'open' ? 'e' : 'g');
  put(g, 7, 6, 'S'); // nose shade
  rect(g, 3, 7, 10, 2, 'w'); // full white beard
  rect(g, 4, 9, 8, 1, 'w');
  rect(g, 5, 10, 6, 1, 'w');
  rect(g, 3, 11, 10, 1, 'b'); // coat collar
  rect(g, 2, 12, 12, 2, 'b');
  rect(g, 1, 14, 14, 1, 'b');
  return toSprite(g);
}

/** Vivian Lassiter (The Studio Interview): dark bob, red lips, leather jacket. */
function drawVivian(eyes: 'open' | 'closed'): Sprite {
  const g = empty();
  rect(g, 4, 0, 8, 1, 'k');
  rect(g, 3, 1, 10, 1, 'k');
  rect(g, 2, 2, 12, 1, 'k');
  for (let y = 3; y <= 5; y++) {
    put(g, 2, y, 'k');
    put(g, 13, y, 'k');
  }
  rect(g, 3, 3, 10, 1, 's'); // forehead
  rect(g, 3, 4, 10, 3, 's'); // eyes + cheeks
  rect(g, 4, 7, 8, 1, 's'); // jaw
  put(g, 5, 5, eyes === 'open' ? 'e' : 'S');
  put(g, 10, 5, eyes === 'open' ? 'e' : 'S');
  put(g, 7, 7, 'r'); // red lips
  put(g, 8, 7, 'r');
  rect(g, 6, 8, 4, 1, 's'); // neck
  rect(g, 4, 9, 8, 1, 'k'); // jacket collar
  rect(g, 3, 10, 10, 1, 'k');
  rect(g, 2, 11, 12, 2, 'k');
  rect(g, 1, 13, 14, 2, 'k');
  for (let y = 9; y <= 14; y++) put(g, 7, y, 'z'); // zipper
  put(g, 8, 9, 'z');
  return toSprite(g);
}

export const GHOST_SPRITES: Readonly<Record<string, { open: Sprite; closed: Sprite }>> = {
  'the-last-letter': { open: drawMarlene('open'), closed: drawMarlene('closed') },
  'the-lighthouse-keeper': { open: drawThomas('open'), closed: drawThomas('closed') },
  'the-studio-interview': { open: drawVivian('open'), closed: drawVivian('closed') },
};

// ---------------------------------------------------------------------------
// Case evidence sprites — shown on the lobby cards.
// ---------------------------------------------------------------------------

/** Sealed letter with a red wax seal. */
function drawEnvelope(): Sprite {
  const g = empty();
  rect(g, 1, 1, 14, 14, 'o');
  for (let y = 1; y <= 14; y++) {
    put(g, 1, y, 'k');
    put(g, 14, y, 'k');
  }
  hline(g, 1, 14, 1, 'k');
  hline(g, 1, 14, 14, 'k');
  for (let i = 0; i <= 5; i++) {
    put(g, 2 + i, 2 + i, 'd'); // flap fold, left
    put(g, 13 - i, 2 + i, 'd'); // flap fold, right
  }
  rect(g, 7, 8, 2, 2, 'r'); // wax seal
  put(g, 7, 8, 'S');
  return toSprite(g);
}

/** The keeper's diary: brown cover, page edge, brass clasp. Kept as a
 * library sprite for future cases (the shipped lighthouse case wears the
 * lighthouse instead). */
export const DIARY: Sprite = (() => {
  const g = empty();
  rect(g, 1, 1, 14, 14, 'n');
  for (let y = 1; y <= 14; y++) {
    put(g, 1, y, 'k');
    put(g, 14, y, 'k');
  }
  hline(g, 1, 14, 1, 'k');
  hline(g, 1, 14, 14, 'k');
  rect(g, 12, 3, 2, 10, 'o'); // page edge
  hline(g, 2, 13, 7, 'S'); // strap
  rect(g, 6, 6, 3, 3, 'z'); // brass clasp
  put(g, 7, 7, 'n');
  return toSprite(g);
})();

/** Studio microphone: mesh head, stand, base. */
function drawMicrophone(): Sprite {
  const g = empty();
  rect(g, 4, 1, 8, 7, 'z'); // head
  for (let y = 1; y <= 14; y++) {
    put(g, 4, y, 'k');
    put(g, 11, y, 'k');
  }
  hline(g, 4, 11, 1, 'k');
  hline(g, 4, 11, 7, 'k');
  for (let y = 2; y <= 6; y += 2) hline(g, 5, 10, y, 'G'); // mesh
  for (let x = 6; x <= 9; x++) put(g, x, 4, 'G');
  rect(g, 7, 8, 2, 5, 'G'); // stem
  hline(g, 4, 11, 13, 'k'); // base
  hline(g, 5, 10, 14, 'k');
  put(g, 7, 8, 'r');
  put(g, 8, 8, 'r');
  return toSprite(g);
}

/** The Western Light: striped tower, lamp room, light beam over the sea. */
function drawLighthouse(): Sprite {
  const g = empty();
  // beam
  put(g, 12, 2, 'y');
  put(g, 13, 1, 'y');
  put(g, 11, 3, 'y');
  // lamp room
  rect(g, 6, 2, 4, 1, 'k'); // roof
  rect(g, 6, 3, 4, 2, 'y'); // the light
  put(g, 6, 3, 'k');
  put(g, 9, 3, 'k');
  hline(g, 5, 10, 5, 'k'); // gallery
  // tower, slightly tapered
  rect(g, 5, 6, 6, 7, 'w');
  hline(g, 5, 10, 8, 'r');
  hline(g, 5, 10, 11, 'r');
  for (let y = 6; y <= 12; y++) {
    put(g, 5, y, 'k');
    put(g, 10, y, 'k');
  }
  // rock base
  rect(g, 2, 13, 12, 2, 'G');
  hline(g, 2, 13, 13, 'k');
  put(g, 3, 12, 'G');
  put(g, 12, 12, 'G');
  // sea
  hline(g, 0, 15, 15, 'b');
  return toSprite(g);
}

export const CASE_SPRITES: Readonly<Record<string, Sprite>> = {
  'the-last-letter': drawEnvelope(),
  'the-lighthouse-keeper': drawLighthouse(),
  'the-studio-interview': drawMicrophone(),
};

// ---------------------------------------------------------------------------
// Decorations.
// ---------------------------------------------------------------------------

/** Two-frame candle flame for the title screen. */
export const CANDLE_FRAMES: readonly Sprite[] = [
  (() => {
    const g = empty(8);
    put(g, 3, 0, 'y');
    rect(g, 3, 1, 2, 1, 'y');
    put(g, 4, 2, 'o');
    rect(g, 3, 3, 2, 9, 'w');
    put(g, 3, 5, 'd'); // wax drip
    rect(g, 2, 12, 4, 1, 'z');
    rect(g, 1, 13, 6, 2, 'G');
    return toSprite(g);
  })(),
  (() => {
    const g = empty(8);
    put(g, 4, 0, 'y');
    rect(g, 3, 1, 2, 1, 'y');
    put(g, 3, 2, 'o');
    rect(g, 3, 3, 2, 9, 'w');
    put(g, 3, 6, 'd');
    rect(g, 2, 12, 4, 1, 'z');
    rect(g, 1, 13, 6, 2, 'G');
    return toSprite(g);
  })(),
];

/** 5×5 twinkle star for the lobby sky. */
export const STAR: Sprite = (() => {
  const g = empty(5);
  put(g, 2, 0, 'y');
  put(g, 2, 4, 'y');
  put(g, 0, 2, 'y');
  put(g, 4, 2, 'y');
  put(g, 2, 2, 'w');
  return toSprite(g);
})();

/** Magnifying glass — used beside the hint action. */
export const MAGNIFIER: Sprite = (() => {
  const g = empty(10);
  for (const [x, y] of [
    [3, 1],
    [4, 1],
    [5, 1],
    [2, 2],
    [6, 2],
    [2, 3],
    [6, 3],
    [2, 4],
    [6, 4],
    [3, 5],
    [4, 5],
    [5, 5],
  ] as const) {
    put(g, x, y, 'z');
  }
  rect(g, 3, 2, 3, 3, 'b'); // lens glass
  put(g, 6, 6, 'n');
  put(g, 7, 7, 'n');
  put(g, 8, 8, 'n');
  return toSprite(g);
})();
