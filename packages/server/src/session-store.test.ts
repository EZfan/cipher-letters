import { describe, it, expect } from 'vitest';
import { SessionStore } from './session-store.js';
import { theLastLetter } from '@cipher/shared';

describe('SessionStore', () => {
  it('creates a session with playing status', () => {
    const store = new SessionStore();
    const session = store.create({
      caseId: theLastLetter.id,
      caseData: theLastLetter,
      surfaceText: 'Some text',
    });
    expect(session.status).toBe('playing');
    expect(session.conversation).toHaveLength(0);
    expect(session.citedClueIds).toHaveLength(0);
    expect(session.surfaceText).toBe('Some text');
  });

  it('appends turns in order', () => {
    const store = new SessionStore();
    const session = store.create({
      caseId: theLastLetter.id,
      caseData: theLastLetter,
      surfaceText: '',
    });
    store.appendTurn(session.id, { role: 'player', text: 'hello', timestamp: 1 });
    store.appendTurn(session.id, {
      role: 'ghost',
      text: '…',
      disclosureLevel: 0,
      hintedClueIds: [],
      timestamp: 2,
    });
    const updated = store.get(session.id);
    expect(updated?.conversation).toHaveLength(2);
    expect(updated?.conversation[0]?.role).toBe('player');
    expect(updated?.conversation[1]?.role).toBe('ghost');
  });

  it('marks progress and dedupes clue ids', () => {
    const store = new SessionStore();
    const session = store.create({
      caseId: theLastLetter.id,
      caseData: theLastLetter,
      surfaceText: '',
    });
    store.markProgress(session.id, ['C1', 'C2']);
    store.markProgress(session.id, ['C2', 'C3']);
    const updated = store.get(session.id);
    expect(updated?.citedClueIds.sort()).toEqual(['C1', 'C2', 'C3']);
  });

  it('tracks hint usage', () => {
    const store = new SessionStore();
    const session = store.create({
      caseId: theLastLetter.id,
      caseData: theLastLetter,
      surfaceText: '',
    });
    store.recordHint(session.id);
    store.recordHint(session.id);
    expect(store.get(session.id)?.hintsUsed).toBe(2);
  });

  it('transitions status to solved and abandoned', () => {
    const store = new SessionStore();
    const session = store.create({
      caseId: theLastLetter.id,
      caseData: theLastLetter,
      surfaceText: '',
    });
    store.markStatus(session.id, 'solved');
    expect(store.get(session.id)?.status).toBe('solved');
    store.markStatus(session.id, 'abandoned');
    expect(store.get(session.id)?.status).toBe('abandoned');
  });

  it('throws on unknown session', () => {
    const store = new SessionStore();
    expect(() => store.appendTurn('nope', { role: 'player', text: 'x', timestamp: 0 })).toThrow(
      /Session not found/,
    );
  });
});
