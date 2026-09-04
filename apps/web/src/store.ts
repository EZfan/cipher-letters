/**
 * Game state store. A thin zustand wrapper around the API client.
 *
 * The store does not own the "truth" of the case — that lives on the
 * server. It mirrors the SessionState returned by the API.
 */

import { create } from 'zustand';
import { api, type SessionState, type AccusationVerdict, type HintResponse } from './api';

interface GameState {
  phase: 'lobby' | 'reading' | 'conversation' | 'accusation' | 'reveal';
  cases: {
    id: string;
    title: string;
    genre: string;
    difficulty: string;
    synopsis: string;
    estimatedPlayMinutes: number;
    tags: readonly string[];
  }[];
  llmAvailable: boolean | null;
  session: SessionState | null;
  ghostBusy: boolean;
  verdict: AccusationVerdict | null;
  hint: HintResponse | null;
  error: string | null;

  loadCases: () => Promise<void>;
  checkLlm: () => Promise<void>;
  startCase: (caseId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  submitAccusation: (text: string) => Promise<void>;
  requestHint: () => Promise<void>;
  returnToLobby: () => void;
  setError: (message: string | null) => void;
  setPhase: (phase: GameState['phase']) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'lobby',
  cases: [],
  llmAvailable: null,
  session: null,
  ghostBusy: false,
  verdict: null,
  hint: null,
  error: null,

  async loadCases() {
    try {
      const res = await api.listCases();
      set({ cases: res.cases });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load cases' });
    }
  },

  async checkLlm() {
    try {
      const res = await api.llmStatus();
      set({ llmAvailable: res.ok });
    } catch {
      set({ llmAvailable: false });
    }
  },

  async startCase(caseId: string) {
    set({ error: null, verdict: null, hint: null, ghostBusy: true });
    try {
      const session = await api.startSession(caseId);
      set({ session, phase: 'reading' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to start session' });
    } finally {
      set({ ghostBusy: false });
    }
  },

  async sendMessage(message: string) {
    const session = get().session;
    if (!session) return;
    set({ ghostBusy: true, error: null });
    try {
      const updated = await api.sendTurn(session.id, message);
      set({ session: updated });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to send message' });
    } finally {
      set({ ghostBusy: false });
    }
  },

  async submitAccusation(text: string) {
    const session = get().session;
    if (!session) return;
    set({ ghostBusy: true, error: null });
    try {
      const verdict = await api.accuse(session.id, text);
      set({ verdict, phase: 'reveal' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to submit accusation' });
    } finally {
      set({ ghostBusy: false });
    }
  },

  async requestHint() {
    const session = get().session;
    if (!session) return;
    try {
      const hint = await api.hint(session.id);
      set({ hint });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to get hint' });
    }
  },

  returnToLobby() {
    set({
      phase: 'lobby',
      session: null,
      verdict: null,
      hint: null,
      error: null,
    });
  },

  setError(message) {
    set({ error: message });
  },

  setPhase(phase) {
    set({ phase });
  },
}));
