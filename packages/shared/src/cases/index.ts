import type { Case } from '../types.js';
import { theLastLetter } from './the-last-letter.js';
import { theLighthouseKeeper } from './the-lighthouse-keeper.js';
import { theStudioInterview } from './the-studio-interview.js';

/**
 * The case library shipped with the game. Hand-authored so that players
 * always have at least three playable mysteries regardless of whether
 * the LLM backend is available.
 *
 * Each case here has been tested through the validator: every clue is
 * findable in the surface text; every red herring is plausible but
 * ultimately a dead end; the ghost's voice is consistent throughout.
 */
export const SHIPPED_CASES: readonly Case[] = [
  theLastLetter,
  theLighthouseKeeper,
  theStudioInterview,
];

export { theLastLetter, theLighthouseKeeper, theStudioInterview };
