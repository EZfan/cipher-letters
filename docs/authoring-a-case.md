# Authoring a case

The Cipher Letters ships with three hand-authored cases. They are the
easiest way to understand what a _good_ case looks like; they are
also the only way to play the game without an LLM. This document
explains how to add a new case to the library.

## Files

A case is two files:

1. `packages/shared/src/cases/<id>.ts` — the case outline (TypeScript).
2. `packages/shared/src/cases/text/<id>.md` — the surface narrative
   (Markdown).

The first is structured data; the second is the literary text the
player reads.

## The outline

```ts
import type { Case } from '../types.js';

export const myCase: Case = {
  id: 'a-short-id',
  title: 'A Short Title',
  author: 'The name of the writer',
  genre: 'diary' | 'letter' | 'interview' | 'obituary' | 'police-report',
  year: 1924,
  setting: 'One-line atmospheric description of where this happens.',
  tone: 'One-line tonal instruction for the writer.',

  synopsis: 'One-paragraph description of what the surface text appears to be about.',

  characters: [
    { id: '...', name: '...', role: '...', relationship: '...' },
    // ...
  ],

  ghost: {
    id: '...',
    name: '...',
    state: 'deceased' | 'missing' | 'unreliable-narrator' | 'beyond-the-fourth-wall',
    voice: 'Two-sentence description of how the ghost speaks.',
    knowsFullTruth: true,
    refusesToSay: 'The single thing the ghost will not admit.',
    willAdmit: 'The closest the ghost will ever come to admitting it.',
  },

  surfaceNarrative: '150-word summary of the cover story.',
  playerTruth: '150-word summary of what actually happened.',
  metaReflection: 'The philosophical / structural insight the case is about.',

  clues: [
    {
      id: 'C1',
      surfaceMeaning: '...',
      hiddenMeaning: '...',
      appearsIn: 'A chapter or section title (or "throughout")',
      ghostHints: ['Things the ghost might say if the player asks the right question.'],
    },
    // 5–8 clues is the sweet spot.
  ],

  redHerrings: [
    {
      id: 'R1',
      description: '...',
      apparentConclusion: '...',
      ghostDeflection: '...',
    },
    // 2–3 is enough.
  ],

  difficulty: 'easy' | 'medium' | 'hard',
  estimatedPlayMinutes: 15,
  tags: ['grief', 'epistolary', 'vienna'],
};
```

## The surface text

The surface text is a single Markdown file. It is what the player
reads. Constraints:

- 600–900 words.
- Written in the voice of the `author` of the case, in the `genre`,
  from `year`, in the `tone`.
- Every clue must appear at least once, naturally woven in.
- At least one red herring must appear, treated as if it mattered.
- A recurring image (a single object or phrase) must appear at
  least three times — the player's anchor for the hidden truth.
- Do **not** use the words "secret", "lie", "hidden", "mystery",
  "truth" anywhere in the surface text.
- Do **not** break the fourth wall.

The shipped cases are the best reference. _The Last Letter_ uses
the blue envelope; _The Lighthouse Keeper_ uses the kettle; _The
Studio Interview_ uses the microphone. Each image is ordinary on
the surface but acquires a second meaning in light of the hidden
truth.

## The Fair Play contract

The case is only playable if every clue in `clues[]` is findable in
the surface text. To check this, you can write a quick test:

```ts
import { extractCitedClues } from '@cipher/shared';

it('every clue is findable from the surface text', () => {
  for (const clue of myCase.clues) {
    // surface text must contain at least one of the ghost hints
    // or one of the clue's surface-meaning words
    const found = extractCitedClues(clue.surfaceMeaning + ' ' + clue.ghostHints.join(' '), myCase);
    expect(found.map((c) => c.id)).toContain(clue.id);
  }
});
```

If a clue is not findable from its own definition, the player cannot
find it in the surface text either. Adjust either the clue or the
text until they align.

## The three truths

Every case has three layers of truth:

1. **Surface** (`surfaceNarrative`) — what the text claims.
2. **Player truth** (`playerTruth`) — what the player must discover.
3. **Meta** (`metaReflection`) — what the case is _about_ beyond the
   mystery.

The meta is the hardest to write and the most important. A good meta
is a _real_ insight — about narrative, memory, grief, identity, or
time — not a generic platitude. Read the metas of the three shipped
cases for examples:

- _The Last Letter_: grief sometimes makes a person write letters
  to the dead, and sometimes makes them write letters that pretend
  the dead are still alive. Both are ways of refusing to let the
  line of correspondence end.
- _The Lighthouse Keeper_: loneliness, given enough time, does not
  destroy a person. It gives them a country of their own.
- _The Studio Interview_: performance is a place where the dead can
  speak through the living.

If you can write a sentence the player will carry with them after
they close the file, you have written a good meta.

## Difficulty

- **Easy** (15–20 min): the clues are concrete and few; the
  recurring image is the strongest single clue; the surface text
  has a clear "what's missing" silence.
- **Medium** (20–30 min): the clues are more subtle; the recurring
  image requires re-reading; the player must combine two or three
  clues to draw the right conclusion.
- **Hard** (30–45 min): the clues are buried under voice and
  deflections; the recurring image is metaphorical; the player
  must reconstruct the meta as well as the player truth.

## Testing

After writing the case, add it to `SHIPPED_CASES` in
`packages/shared/src/cases/index.ts`, then run:

```bash
pnpm --filter @cipher/shared test
```

You should write at least three tests:

1. Every clue is findable from the surface text (see above).
2. The fair-play score is non-zero for a "well-formed" accusation
   that cites the player truth.
3. The fair-play score is near zero for an unrelated accusation.

Then play-test by hand. Read the surface text aloud. Try to solve
the case without looking at the `playerTruth`. Time yourself. If it
takes more than `estimatedPlayMinutes + 5`, the case is too hard;
if less than `estimatedPlayMinutes - 5`, too easy.
