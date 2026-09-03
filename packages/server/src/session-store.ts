/**
 * In-memory session store for active games.
 *
 * Each session holds the case the player is currently playing, the
 * conversation history, the player's running evidence tally, and the
 * player's own notes.
 *
 * The store is intentionally simple. For a single-player offline game,
 * a Map is plenty. Sessions do not survive a server restart — and that
 * is by design, because the surface text is generated freshly each time
 * the player starts a case (so re-reading the same case twice gives a
 * different experience).
 */

import { randomUUID } from 'node:crypto';
import type { Case } from '@cipher/shared';

export interface GhostTurn {
  role: 'ghost';
  text: string;
  disclosureLevel: number;
  hintedClueIds: readonly string[];
  timestamp: number;
}

export interface PlayerTurn {
  role: 'player';
  text: string;
  timestamp: number;
}

export type ConversationTurn = GhostTurn | PlayerTurn;

export interface SessionState {
  readonly id: string;
  caseId: string;
  surfaceText: string;
  conversation: ConversationTurn[];
  citedClueIds: string[];
  turnsSinceProgress: number;
  hintsUsed: number;
  startedAt: number;
  status: 'playing' | 'solved' | 'abandoned';
}

export class SessionStore {
  private readonly sessions = new Map<string, SessionState>();

  create(args: {
    caseId: string;
    caseData: Case;
    surfaceText: string;
  }): SessionState {
    const id = randomUUID();
    const session: SessionState = {
      id,
      caseId: args.caseId,
      surfaceText: args.surfaceText,
      conversation: [],
      citedClueIds: [],
      turnsSinceProgress: 0,
      hintsUsed: 0,
      startedAt: Date.now(),
      status: 'playing',
    };
    this.sessions.set(id, session);
    return session;
  }

  get(id: string): SessionState | undefined {
    return this.sessions.get(id);
  }

  appendTurn(sessionId: string, turn: ConversationTurn): SessionState {
    const session = this.require(sessionId);
    session.conversation.push(turn);
    return session;
  }

  markProgress(sessionId: string, newClueIds: readonly string[]): SessionState {
    const session = this.require(sessionId);
    const before = new Set(session.citedClueIds);
    session.citedClueIds = Array.from(new Set([...session.citedClueIds, ...newClueIds]));
    if (newClueIds.length > 0) session.turnsSinceProgress = 0;
    else session.turnsSinceProgress += 1;
    return { ...session };
  }

  recordHint(sessionId: string): SessionState {
    const session = this.require(sessionId);
    session.hintsUsed += 1;
    return { ...session };
  }

  markStatus(sessionId: string, status: SessionState['status']): SessionState {
    const session = this.require(sessionId);
    session.status = status;
    return { ...session };
  }

  list(): SessionState[] {
    return Array.from(this.sessions.values());
  }

  private require(id: string): SessionState {
    const s = this.sessions.get(id);
    if (!s) throw new Error(`Session not found: ${id}`);
    return s;
  }
}
