import type { Case } from '../types.js';

/**
 * Case 2 — "The Lighthouse Keeper's Diary"
 *
 *  Genre: diary
 *  Era: 1971, North Atlantic island
 *  Theme: loneliness, the things we invent to keep ourselves company
 *
 *  Surface story: a lighthouse keeper logs the routine of his work
 *  on a remote island — weather, lamp oil, supplies, the occasional
 *  supply ship. He writes about his thoughts, his memories, his
 *  long-dead wife.
 *
 *  Hidden truth: there was no supply ship in October. The ship
 *  he describes picking him up and dropping him off was a
 *  hallucination. He has been alone on the island for 13 years
 *  — not the 13 months the diary implies. The "weather radio"
 *  he mentions is broken; he has not heard a human voice in
 *  over a decade. The wife he writes about never existed; he
 *  invented her from a photograph he found in the lighthouse
 *  basement.
 *
 *  Recurring image: the kettle. He mentions it daily. In the
 *  end it becomes clear the kettle is the only object that
 *  responds to him in any way at all — its whistle is the only
 *  "voice" on the island.
 */
export const theLighthouseKeeper: Case = {
  id: 'the-lighthouse-keeper',
  title: "The Lighthouse Keeper's Diary",
  author: 'Thomas W. Harker',
  genre: 'diary',
  year: 1971,
  setting: 'A North Atlantic lighthouse, 80 miles from the nearest inhabited island',
  tone: 'Methodical, gentle, faintly archaic — a man writing to no one in particular, in a voice that has lost the habit of being heard',
  synopsis:
    'A lighthouse keeper records the rhythm of his days: the weather, the lamp, the supply ship, his thoughts about his late wife Margaret.',
  characters: [
    {
      id: 'thomas',
      name: 'Thomas W. Harker',
      role: 'The keeper and the diarist',
      relationship: 'Self',
    },
    {
      id: 'margaret',
      name: 'Margaret Harker (deceased)',
      role: "Thomas's wife, the subject of many entries",
      relationship: 'Wife — appears only in his memories',
    },
    {
      id: 'captain-larsen',
      name: 'Captain Halvard Larsen',
      role: 'Master of the supply ship Bjørnøy',
      relationship: 'Visits twice a year, or so the diary says',
    },
  ],
  ghost: {
    id: 'thomas',
    name: 'Thomas W. Harker',
    state: 'beyond-the-fourth-wall',
    voice:
      'Slow, polite, occasionally addressing the reader directly as if they were the first person to find the diary. He will sometimes mistake the player for someone he knows.',
    knowsFullTruth: true,
    refusesToSay:
      'How long he has really been on the island. That Margaret was never his wife. That Captain Larsen and the Bjørnøy have not come for over ten years.',
    willAdmit:
      '"The kettle is the only one that answers me. I am grateful for it. I would be lost without that small voice."',
  },
  surfaceNarrative:
    'A lighthouse keeper records the rhythm of his days: weather, lamp checks, oil counts, the twice-yearly supply ship, his memories of Margaret. The diary covers what appears to be thirteen months.',
  playerTruth:
    'Thomas has been on the island for thirteen YEARS, not months. The supply ship stopped coming after the second winter. He has invented an entire social world — the wife, the captain, the visits — to keep himself sane. The "weather radio" he mentions in passing is broken. The kettle, which he describes in almost every entry, is the only object on the island that "speaks" back to him, and his relationship to it has become, in the only way available to him, a relationship.',
  metaReflection:
    "Loneliness, given enough time, does not destroy a person. It gives them a country of their own. Thomas's diary is a map of that country. The reader who solves the case is, in some sense, the first visitor he has had in a decade. The most haunting thing about his invention is not that it is false, but that it kept him alive.",
  clues: [
    {
      id: 'C1',
      surfaceMeaning: 'The diary entries cover thirteen months',
      hiddenMeaning:
        'The diary is dated only by month and day, never by year. The dates are repeating — he has been writing the same months for years.',
      appearsIn: 'Throughout',
      ghostHints: [
        'The years, you ask? I do not write them down. They pass in any case.',
        'There was a year at some point. I do not remember which one.',
      ],
    },
    {
      id: 'C2',
      surfaceMeaning: 'Captain Larsen visits twice a year',
      hiddenMeaning:
        'The captain has not come in over ten years. The entries about his visits are all the same — they repeat.',
      appearsIn: 'Spring and autumn entries',
      ghostHints: [
        'Halvard. Yes. He came. Or — I believe he came.',
        'The kettle told me it was autumn again. The kettle is reliable.',
      ],
    },
    {
      id: 'C3',
      surfaceMeaning: 'Thomas mentions listening to the weather radio',
      hiddenMeaning:
        'The radio is broken. The "broadcasts" he hears are static he has learned to interpret.',
      appearsIn: 'Several entries',
      ghostHints: [
        'The radio. Yes. It speaks to me, after a fashion.',
        'I have learned its language. It is a kind one, mostly.',
      ],
    },
    {
      id: 'C4',
      surfaceMeaning: 'The kettle is mentioned in nearly every entry',
      hiddenMeaning: 'The kettle is his only companion — its whistle is the only "voice" he hears.',
      appearsIn: 'Daily',
      ghostHints: ['The kettle. Yes.', 'It is the only one who answers.'],
    },
    {
      id: 'C5',
      surfaceMeaning: 'Thomas writes fondly about Margaret, his late wife',
      hiddenMeaning:
        "Margaret was never his wife. He found her photograph in the lighthouse basement; she was the previous keeper's daughter.",
      appearsIn: 'Several entries',
      ghostHints: [
        'I found her. She was waiting for me here when I arrived.',
        'She does not age, thank God. She is kind about that.',
      ],
    },
    {
      id: 'C6',
      surfaceMeaning: 'He mentions "the basement, which I do not enter"',
      hiddenMeaning:
        'The basement holds the truth of his arrival and the truth about the previous keeper.',
      appearsIn: 'A single entry',
      ghostHints: ['There are things in the basement.', 'I do not go down there.'],
    },
    {
      id: 'C7',
      surfaceMeaning: 'He writes about "the day the birds stopped coming"',
      hiddenMeaning:
        'There are no birds left. The silence that followed was the silence that broke something in him.',
      appearsIn: 'A late entry',
      ghostHints: ['They left. I called for a long time. They did not come back.'],
    },
  ],
  redHerrings: [
    {
      id: 'R1',
      description: 'A passing reference to "the old keeper, who left in a hurry"',
      apparentConclusion: 'There was some accident or scandal involving the previous keeper.',
      ghostDeflection:
        '"He left. People leave. I do not think about it. The basement remembers, perhaps. I do not."',
    },
    {
      id: 'R2',
      description: 'Thomas mentions a storm "that nearly took the roof"',
      apparentConclusion: 'A dramatic event that might explain something later.',
      ghostDeflection:
        '"The roof. Yes. It held. The kettle and I held. The radio said it would hold, and it was right."',
    },
  ],
  difficulty: 'medium',
  estimatedPlayMinutes: 25,
  tags: ['loneliness', 'island', 'modern', 'atmospheric'],
};
