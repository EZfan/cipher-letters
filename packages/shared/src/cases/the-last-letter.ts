import type { Case } from '../types.js';

/**
 * Case 1 — "The Last Letter"
 *
 *  Genre: letter
 *  Era: 1920s Vienna
 *  Theme: grief, the things we leave unsaid
 *
 *  Surface story: a woman writes a long, loving letter to her absent
 *  husband on the eve of their anniversary.
 *
 *  Hidden truth: the letter was never sent. The husband died three
 *  weeks before she wrote it. The "anniversary" she references is
 *  not their wedding but the date of his death. The "holiday he
 *  always wanted to take her on" was the funeral she cancelled
 *  because she could not face it.
 *
 *  Recurring image: the blue envelope. It appears as ornament
 *  throughout, but the "blue envelope" is in fact the letter itself —
 *  written but never sent, sealed and placed in a drawer.
 */
export const theLastLetter: Case = {
  id: 'the-last-letter',
  title: 'The Last Letter',
  author: 'Marlene Brandt',
  genre: 'letter',
  year: 1924,
  setting: 'A small apartment in Vienna, two weeks before All Souls\' Day',
  tone: 'Tender, unhurried, slightly over-formal — the prose of someone who writes the way other people pray',
  synopsis:
    'A wife writes to her traveling husband about the small happenings at home, the autumn weather, and the little rituals of their marriage.',
  characters: [
    {
      id: 'marlene',
      name: 'Marlene Brandt',
      role: 'The author of the letter',
      relationship: 'Wife',
    },
    {
      id: 'erich',
      name: 'Erich Brandt',
      role: 'The recipient of the letter',
      relationship: 'Husband',
    },
    {
      id: 'elisabeth',
      name: 'Elisabeth Heller',
      role: 'Marlene\'s sister',
      relationship: 'Sister — has been staying at the apartment',
    },
    {
      id: 'father-keller',
      name: 'Father Keller',
      role: 'The parish priest',
      relationship: 'Has called twice this month',
    },
  ],
  ghost: {
    id: 'marlene',
    name: 'Marlene Brandt',
    state: 'unreliable-narrator',
    voice:
      'Formal but increasingly fragile. Long pauses. She will speak about Erich in the present tense as if he might walk in.',
    knowsFullTruth: true,
    refusesToSay:
      'That Erich is dead. That the letter was written three weeks after his funeral. That the drawer is where she keeps the blue envelope.',
    willAdmit:
      '"I have not sent it yet. I keep finding reasons to walk past the post box and then walk past it again."',
  },
  surfaceNarrative:
    'A wife writes to her traveling husband about the small happenings at home, the autumn weather, and the little rituals of their marriage. The letter is loving, domestic, occasionally amused. The closing line is warm and forward-looking.',
  playerTruth:
    'Erich is dead. He died three weeks ago in an accident at the railway works. Marlene has not been able to accept it. She writes to him nightly as if he were still on the road. The "trip he has been on" never happened. The blue envelope mentioned in the letter is in fact this letter, sealed and placed in a drawer where she keeps his other things. The recurring rituals (the anniversary, the holiday, the dinner at Sacher\'s) are allusions to the funeral she refused to attend.',
  metaReflection:
    'Grief sometimes makes a person write letters to the dead — and sometimes makes them write letters that pretend the dead are still alive. Both are ways of refusing to let the line of correspondence end. Marlene\'s letter is not a confession; it is the last conversation she can still have with him, written in the only tense that does not break her.',
  clues: [
    {
      id: 'C1',
      surfaceMeaning: 'Erich has been traveling "for some weeks now"',
      hiddenMeaning: 'Erich is not traveling. He is dead.',
      appearsIn: 'Opening paragraph',
      ghostHints: [
        'You will notice I write "now" as if he had just left.',
        'Three weeks, you said. Yes. Three.',
      ],
    },
    {
      id: 'C2',
      surfaceMeaning: 'Elisabeth has been staying "to keep her company"',
      hiddenMeaning: 'Elisabeth came for the funeral and has not left because Marlene will not be alone.',
      appearsIn: 'Middle paragraph',
      ghostHints: ['Elisabeth sleeps in the small room.', 'She does not leave me alone.'],
    },
    {
      id: 'C3',
      surfaceMeaning: 'Father Keller has called twice "to discuss the arrangements"',
      hiddenMeaning: 'Father Keller has called twice to discuss the funeral arrangements — which Marlene has not finalized.',
      appearsIn: 'Middle paragraph',
      ghostHints: ['He wants to know about the hymns.', 'I told him I had not yet decided.'],
    },
    {
      id: 'C4',
      surfaceMeaning: 'The "blue envelope" mentioned in passing three times',
      hiddenMeaning: 'The blue envelope is this letter, sealed and placed in the drawer where Erich\'s things are kept.',
      appearsIn: 'Three mentions across the letter',
      ghostHints: [
        'I keep it in the drawer. With his.',
        'I have not yet had the strength to send it.',
      ],
    },
    {
      id: 'C5',
      surfaceMeaning: 'Marlene describes planning "the holiday he has always wanted"',
      hiddenMeaning: 'The holiday is the funeral trip to the Alps — Erich\'s last wish, which Marlene could not fulfill.',
      appearsIn: 'Near the end',
      ghostHints: ['He wanted to see the mountains one more time.', 'I could not.'],
    },
    {
      id: 'C6',
      surfaceMeaning: 'The closing line — "until we meet again on the twenty-ninth"',
      hiddenMeaning: 'The twenty-ninth is not their wedding anniversary but the date of Erich\'s death.',
      appearsIn: 'Final paragraph',
      ghostHints: ['The twenty-ninth. Yes.', 'I will be there.'],
    },
  ],
  redHerrings: [
    {
      id: 'R1',
      description: 'A reference to a neighbor\'s husband who has "taken up with another woman"',
      apparentConclusion: 'The letter hints at Erich\'s infidelity.',
      ghostDeflection:
        '"People talk. I do not listen. There are so many more interesting things in the house than gossip."',
    },
    {
      id: 'R2',
      description: 'Marlene\'s mention of a sum of money missing from the household account',
      apparentConclusion: 'Erich has been gambling or has debts.',
      ghostDeflection:
        '"Money. Yes. There was a sum. It is not important. The pension office has been kind."',
    },
  ],
  difficulty: 'easy',
  estimatedPlayMinutes: 20,
  tags: ['grief', 'epistolary', 'vienna', 'classic'],
};
