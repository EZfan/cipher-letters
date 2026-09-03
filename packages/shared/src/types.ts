/**
 * Core type definitions for The Cipher Letters.
 *
 * A case is a complete mystery: a piece of AI-generated literature that hides
 * a "deep truth" beneath its surface narrative. The player reads the text,
 * interrogates the ghost of a person from the story, and submits an accusation
 * describing what they think really happened.
 */

/**
 * The literary genre of the surface text. Each genre implies a different
 * narrative voice and a different set of conventions the ghost inhabits.
 */
export type Genre = 'diary' | 'letter' | 'interview' | 'obituary' | 'police-report';

/**
 * The three "layers of truth" a case reveals.
 *
 *  - SURFACE: what the literary text *says* happened. The cover story.
 *  - PLAYER_TRUTH: what the player must reconstruct through reading +
 *    interrogation. The "real" mystery the case is built around.
 *  - META: the reflective layer revealed after the player solves the case.
 *    This is the philosophical / structural insight the case wants the
 *    player to take away — often a comment on narrative, memory, or grief.
 */
export type TruthLayer = 'surface' | 'player-truth' | 'meta';

/**
 * A single clue the player can discover. Each clue has:
 *  - A surface meaning (what it literally says in the text)
 *  - A hidden meaning (what it points toward in the deep truth)
 *  - The chapter or section where it appears
 *  - A list of "ghostly hints": things the ghost might say if the player
 *    asks the right question. We never hard-force these — the ghost uses
 *    them only when its disclosure threshold allows.
 */
export interface Clue {
  readonly id: string;
  readonly surfaceMeaning: string;
  readonly hiddenMeaning: string;
  readonly appearsIn: string;
  readonly ghostHints: readonly string[];
}

/**
 * A red herring. The text mentions it on purpose to mislead the player.
 * The ghost may even double down on it if pressed in the wrong direction.
 */
export interface RedHerring {
  readonly id: string;
  readonly description: string;
  readonly apparentConclusion: string;
  readonly ghostDeflection: string;
}

/**
 * A character in the case. The "ghost" is the only character the player
 * can directly converse with — the others are referenced in the text.
 */
export interface Character {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly relationship: string;
}

/**
 * The ghost. The ghost is the central NPC: a person from the story who
 * exists in a liminal state (dead, missing, or otherwise beyond reach)
 * and can talk to the player. They know the truth but will not say it
 * outright; their disclosure is gated by the player's progress.
 */
export interface Ghost {
  readonly id: string;
  readonly name: string;
  readonly state: 'deceased' | 'missing' | 'unreliable-narrator' | 'beyond-the-fourth-wall';
  readonly voice: string;
  readonly knowsFullTruth: boolean;
  readonly refusesToSay: string;
  readonly willAdmit: string;
}

/**
 * A complete mystery case.
 */
export interface Case {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly genre: Genre;
  readonly year: number;
  readonly setting: string;
  readonly tone: string;
  readonly synopsis: string;
  readonly characters: readonly Character[];
  readonly ghost: Ghost;
  readonly surfaceNarrative: string;
  readonly playerTruth: string;
  readonly metaReflection: string;
  readonly clues: readonly Clue[];
  readonly redHerrings: readonly RedHerring[];
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly estimatedPlayMinutes: number;
  readonly tags: readonly string[];
}
