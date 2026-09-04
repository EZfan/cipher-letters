import type { Case } from '../types.js';

/**
 * Case 3 — "The Studio Interview"
 *
 *  Genre: interview (transcript)
 *  Era: 1998, a downtown recording studio
 *  Theme: identity, performance, the difference between confession and craft
 *
 *  Surface story: a journalist interviews a reclusive musician about
 *  her comeback album. The musician is charming, evasive, philosophical.
 *  The interview is published and well-received.
 *
 *  Hidden truth: the musician is not the person the journalist thinks
 *  they are talking to. The "comeback album" was recorded by her dead
 *  sister, whose voice the surviving twin has been performing live
 *  for fifteen years. The transcript has been carefully edited (by
 *  someone other than the journalist) to remove every direct reference
 *  to the sister. The "studio" is the sister's old rehearsal space.
 *
 *  Recurring image: the microphone. It appears in nearly every
 *  exchange. In the end it becomes clear that the microphone is the
 *  only place the dead sister can still be heard — and the interview
 *  itself was recorded on it.
 */
export const theStudioInterview: Case = {
  id: 'the-studio-interview',
  title: 'The Studio Interview',
  author: 'An anonymous journalist',
  genre: 'interview',
  year: 1998,
  setting: 'A small recording studio on West 23rd Street, Manhattan, October 1998',
  tone: 'Pristine magazine-feature voice on the surface; careful, artful silences underneath',
  synopsis:
    'A lengthy magazine interview with the reclusive musician Vivian Lassiter on the eve of her comeback album.',
  characters: [
    {
      id: 'vivian',
      name: 'Vivian Lassiter',
      role: 'The interviewee',
      relationship: 'Subject',
    },
    {
      id: 'journalist',
      name: 'The journalist (unnamed)',
      role: 'The interviewer',
      relationship: 'Interviewer',
    },
    {
      id: 'clara',
      name: 'Clara Lassiter',
      role: "Vivian's sister",
      relationship: 'Mentioned only obliquely, three times',
    },
    {
      id: 'engineer',
      name: 'The studio engineer (named only as "J.")',
      role: 'Operator of the recording booth',
      relationship: 'Witness — speaks once',
    },
  ],
  ghost: {
    id: 'vivian',
    name: 'Vivian Lassiter',
    state: 'unreliable-narrator',
    voice:
      'Polished, fluent, with a habit of answering the question she wishes she had been asked. She uses the third person about herself often.',
    knowsFullTruth: true,
    refusesToSay:
      "That the album is Clara's. That she has been performing Clara's voice live for fifteen years. That the interview is being recorded on Clara's microphone.",
    willAdmit: '"I am two people. The other one is not here. She is, however, in the room."',
  },
  surfaceNarrative:
    'A lengthy magazine interview with the reclusive musician Vivian Lassiter on the eve of her comeback album. The interview is charming and oblique. Vivian speaks of memory, of the years away, of finding her voice again. The journalist leaves with a tape.',
  playerTruth:
    "The album was recorded by Clara, Vivian's identical twin, who died fifteen years ago in a fire. Vivian has been performing Clara's voice live — and recording her own vocals onto Clara's unreleased tapes — for the entire time. The \"comeback\" is Clara's posthumous release. The transcript has been edited to remove every direct mention of Clara. The \"studio\" was Clara's rehearsal space. The microphone Vivian speaks into is the microphone Clara died beside.",
  metaReflection:
    'Performance is a place where the dead can speak through the living. Vivian\'s "comeback" is not a return of her own voice — it is the continuation of Clara\'s, performed by the only person whose vocal cords are identical. The interview is not really an interview. It is a séance conducted in public, with a tape recorder standing in for a medium.',
  clues: [
    {
      id: 'C1',
      surfaceMeaning: 'Vivian speaks of "the album" in the singular possessive',
      hiddenMeaning: "The album is Clara's, not hers. She cannot quite bring herself to say so.",
      appearsIn: 'Opening exchange',
      ghostHints: [
        'The album.',
        'You say "the album" as if there is only one. There is. It is not mine.',
      ],
    },
    {
      id: 'C2',
      surfaceMeaning: 'She says "I have not recorded in this studio before"',
      hiddenMeaning:
        'She has. Clara rehearsed here for years. Vivian is lying to maintain the fiction.',
      appearsIn: 'Early exchange',
      ghostHints: ['I have not.', 'I have. But not as myself.'],
    },
    {
      id: 'C3',
      surfaceMeaning: 'Three oblique mentions of "my sister" — never by name',
      hiddenMeaning: 'The sister is Clara. Vivian cannot say her name aloud in this room.',
      appearsIn: 'Three points',
      ghostHints: ['Her name.', 'I cannot say it here. The microphone hears.'],
    },
    {
      id: 'C4',
      surfaceMeaning: 'The engineer "J." interjects once, off-tape, to remind Vivian of the time',
      hiddenMeaning: 'J. knew Clara. The interjection is a gentle warning — "do not go further."',
      appearsIn: 'Midway',
      ghostHints: ['J. was her friend.', 'J. is kind to me. J. remembers her.'],
    },
    {
      id: 'C5',
      surfaceMeaning: 'Vivian refers to her voice in the third person: "it"',
      hiddenMeaning:
        'She does not experience "her" voice as her own. It is Clara\'s voice, on loan.',
      appearsIn: 'Several places',
      ghostHints: ['It is not mine.', 'It is on loan. It will go back.'],
    },
    {
      id: 'C6',
      surfaceMeaning:
        'The microphone is described three times as "the new one" or "the better one"',
      hiddenMeaning: "It is Clara's microphone. It is fifteen years old.",
      appearsIn: 'Three places',
      ghostHints: ['It is not new.', 'It is hers. I will not replace it.'],
    },
    {
      id: 'C7',
      surfaceMeaning: 'Vivian says "the fire" — then corrects herself: "the years"',
      hiddenMeaning:
        'There was a fire. The correction is a Freudian slip; the journalist did not catch it.',
      appearsIn: 'One moment of hesitation',
      ghostHints: ['The fire. The years. I — yes. The years.'],
    },
    {
      id: 'C8',
      surfaceMeaning: 'The interview ends abruptly — "we were cut off by the fire alarm"',
      hiddenMeaning:
        "The fire alarm is the only thing in this transcript that is not staged. Vivian triggered it to end the interview before she said Clara's name.",
      appearsIn: 'Final line',
      ghostHints: ['The alarm. Yes.', 'I will not say it.'],
    },
  ],
  redHerrings: [
    {
      id: 'R1',
      description:
        'Vivian\'s mention of a "difficult label executive" who wanted to change her image',
      apparentConclusion: 'There is industry pressure / a lawsuit narrative.',
      ghostDeflection:
        '"The label. They have always been kind. They want what I want. We want the same thing."',
    },
    {
      id: 'R2',
      description: 'The journalist\'s aside that "Vivian lit a cigarette — her first in years"',
      apparentConclusion: 'Health / addiction subplot.',
      ghostDeflection:
        '"She — I — yes. The smoke is in the booth. The microphone will remember it."',
    },
  ],
  difficulty: 'hard',
  estimatedPlayMinutes: 35,
  tags: ['identity', 'performance', 'modern', 'noir', 'meta'],
};
