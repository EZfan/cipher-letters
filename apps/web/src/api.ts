/**
 * API client. Talks to the Fastify server via the `/api/*` routes.
 *
 * All network failures are surfaced as `ApiError` so the UI can show
 * a graceful message rather than a stack trace.
 */

export interface CaseSummary {
  id: string;
  title: string;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedPlayMinutes: number;
  tags: readonly string[];
  synopsis: string;
}

export interface PublicCase {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  setting: string;
  tone: string;
  synopsis: string;
  characters: readonly { id: string; name: string; role: string; relationship: string }[];
  ghost: { id: string; name: string; state: string; voice: string };
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedPlayMinutes: number;
  tags: readonly string[];
}

export interface ConversationTurn {
  role: 'ghost' | 'player';
  text: string;
  disclosureLevel?: number;
  hintedClueIds?: readonly string[];
  timestamp: number;
}

export interface SessionState {
  id: string;
  caseId: string;
  surfaceText: string;
  conversation: ConversationTurn[];
  citedClueIds: readonly string[];
  turnsSinceProgress: number;
  hintsUsed: number;
  startedAt: number;
  status: 'playing' | 'solved' | 'abandoned';
  case?: PublicCase | null;
}

export interface AccusationVerdict {
  verdict: 'solved' | 'partial' | 'wrong';
  message: string;
  fairPlayScore: number;
  metaReflection: string | null;
  truthRevealed: boolean;
  hiddenTruth: string | null;
  meta: string | null;
}

export interface HintResponse {
  level: 0 | 1 | 2 | 3;
  message: string;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ?? '';
    } catch {
      // ignore
    }
    throw new ApiError(detail || `Request failed: ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCases: () => request<{ cases: CaseSummary[] }>('/api/cases'),
  getCase: (id: string) => request<PublicCase>(`/api/cases/${id}`),
  startSession: (caseId: string, regenerateSurfaceText = false) =>
    request<SessionState>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ caseId, regenerateSurfaceText }),
    }),
  getSession: (id: string) => request<SessionState>(`/api/sessions/${id}`),
  sendTurn: (id: string, message: string) =>
    request<SessionState>(`/api/sessions/${id}/turn`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  accuse: (id: string, accusation: string) =>
    request<AccusationVerdict>(`/api/sessions/${id}/accuse`, {
      method: 'POST',
      body: JSON.stringify({ accusation }),
    }),
  hint: (id: string) =>
    request<HintResponse>(`/api/sessions/${id}/hint`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  abandon: (id: string) =>
    request<{ ok: boolean }>(`/api/sessions/${id}/abandon`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  health: () => request<{ ok: boolean }>('/api/health'),
  llmStatus: () => request<{ ok: boolean; latencyMs: number; error?: string }>('/api/llm/status'),
};
