/**
 * Validators that enforce the Fair Play contract on every case.
 *
 * The contract: any player accusation must be supportable by evidence
 * already present in the surface text. No author-cheating.
 */

import type { Case, Clue } from './types.js';

/**
 * Returns the list of clue IDs that the user has cited (in any form) in
 * their accusation. Matching is permissive — we look for the surface
 * meaning's first noun-phrase or any of its ghost hints.
 */
export function extractCitedClues(accusation: string, caseData: Case): Clue[] {
  const normalized = accusation.toLowerCase();
  return caseData.clues.filter((clue) => {
    const hintMatches = clue.ghostHints.some((hint) =>
      normalized.includes(hint.toLowerCase().slice(0, 8)),
    );
    const surfaceMatch = clue.surfaceMeaning
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .some((w) => normalized.includes(w));
    return hintMatches || surfaceMatch;
  });
}

/**
 * The Fair Play score. Returns 0..1 — the proportion of the hidden truth
 * that the player has cited evidence for.
 *
 * A score >= 0.6 means the accusation is supportable; the player can be
 * told their accusation is "on the right track". Below 0.3 means they are
 * guessing from outside the text.
 */
export function fairPlayScore(accusation: string, caseData: Case): number {
  const cited = extractCitedClues(accusation, caseData);
  if (caseData.clues.length === 0) return 0;
  return cited.length / caseData.clues.length;
}

/**
 * The Disclosure Threshold: how much the ghost is willing to reveal.
 * It rises with the player's evidence citation AND with the emotional
 * arc of the conversation.
 *
 * Returns 0..1.
 *   0   = the ghost will only speak in weather and atmosphere
 *   0.5 = the ghost will hint, deflect, and let silence speak
 *   1.0 = the ghost will admit what it has been hiding — almost
 */
export function disclosureThreshold(
  turnsSoFar: number,
  citedClueCount: number,
  totalClues: number,
): number {
  // Two factors: how long the player has been at it (patience),
  // and how much of the case they have reconstructed (evidence).
  const patience = Math.min(1, turnsSoFar / 12);
  const evidence = totalClues === 0 ? 0 : citedClueCount / totalClues;
  // A weighted blend — evidence matters more than time.
  return Math.min(1, evidence * 0.7 + patience * 0.3);
}

/**
 * Hint level: which tier of hint to give the player if they ask for help.
 */
export type HintLevel = 0 | 1 | 2 | 3;

export function hintLevel(
  turnsSinceProgress: number,
  citedClueCount: number,
  totalClues: number,
): HintLevel {
  if (turnsSinceProgress >= 6 || citedClueCount === 0) return 0;
  const ratio = citedClueCount / Math.max(1, totalClues);
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}
