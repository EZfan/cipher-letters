/**
 * HTTP routes for The Cipher Letters.
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/llm/status
 *   GET  /api/cases                       — list shipped cases
 *   GET  /api/cases/:id                   — fetch a shipped case
 *   POST /api/cases/generate              — generate a fresh case via LLM
 *   POST /api/sessions                    — start a new session
 *   GET  /api/sessions/:id                — read session state
 *   POST /api/sessions/:id/turn           — player sends a message to the ghost
 *   POST /api/sessions/:id/accuse         — player submits accusation
 *   POST /api/sessions/:id/hint           — player asks for a hint
 *   POST /api/sessions/:id/abandon        — player abandons session
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { SHIPPED_CASES, type Case } from '@cipher/shared';
import { type Orchestrator } from './orchestrator.js';
import { type SessionStore } from './session-store.js';
import { type LLMClient } from './llm-client.js';
import { extractCitedClues } from '@cipher/shared';

export interface RouteDeps {
  readonly orchestrator: Orchestrator;
  readonly sessions: SessionStore;
  readonly llm: LLMClient;
}

/**
 * The "shipped" surface text lives next to each case file as a separate
 * artefact so that the LLM-free experience is identical every time.
 * If the file is missing, we fall back to the synopsis as a minimal surface.
 */
async function tryFetchShippedSurface(caseData: Case): Promise<string> {
  try {
    const filePath = path.join(
      process.cwd(),
      'packages',
      'shared',
      'src',
      'cases',
      'text',
      `${caseData.id}.md`,
    );
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return caseData.synopsis;
  }
}

/**
 * Strip the hidden truth from a case before sending it to the client.
 * The client receives the surface narrative + the meta-reflection only
 * after the case is solved; the hidden truth is server-side until then.
 */
function publicCase(c: Case) {
  return {
    id: c.id,
    title: c.title,
    author: c.author,
    genre: c.genre,
    year: c.year,
    setting: c.setting,
    tone: c.tone,
    synopsis: c.synopsis,
    characters: c.characters,
    ghost: {
      id: c.ghost.id,
      name: c.ghost.name,
      state: c.ghost.state,
      voice: c.ghost.voice,
    },
    difficulty: c.difficulty,
    estimatedPlayMinutes: c.estimatedPlayMinutes,
    tags: c.tags,
  };
}

export async function registerRoutes(app: FastifyInstance, deps: RouteDeps): Promise<void> {
  const { orchestrator, sessions, llm } = deps;

  // --------------------------------------------------------------------
  // Health & LLM status
  // --------------------------------------------------------------------

  app.get('/api/health', async () => ({
    ok: true,
    service: 'cipher-letters',
    version: '0.1.0',
    timestamp: Date.now(),
  }));

  app.get('/api/llm/status', async () => {
    const ping = await llm.ping();
    return { configured: true, ...ping };
  });

  // --------------------------------------------------------------------
  // Cases
  // --------------------------------------------------------------------

  app.get('/api/cases', async () => ({
    cases: SHIPPED_CASES.map((c) => ({
      id: c.id,
      title: c.title,
      genre: c.genre,
      difficulty: c.difficulty,
      estimatedPlayMinutes: c.estimatedPlayMinutes,
      tags: c.tags,
      synopsis: c.synopsis,
    })),
  }));

  app.get<{ Params: { id: string } }>('/api/cases/:id', async (req, reply) => {
    const found = SHIPPED_CASES.find((c) => c.id === req.params.id);
    if (!found) return reply.code(404).send({ error: 'Case not found' });
    return found;
  });

  const generateSchema = z.object({
    theme: z.string().min(3).max(200),
    genre: z.enum(['diary', 'letter', 'interview', 'obituary', 'police-report']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  });

  app.post('/api/cases/generate', async (req, reply) => {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', details: parsed.error.format() });
    }
    try {
      const generated = await orchestrator.generateCase(parsed.data);
      return generated;
    } catch (err) {
      return reply
        .code(502)
        .send({ error: 'LLM failed to generate a valid case', details: String(err) });
    }
  });

  // --------------------------------------------------------------------
  // Sessions
  // --------------------------------------------------------------------

  const startSchema = z.object({
    caseId: z.string(),
    regenerateSurfaceText: z.boolean().optional(),
  });

  app.post('/api/sessions', async (req, reply) => {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', details: parsed.error.format() });
    }
    const caseData = SHIPPED_CASES.find((c) => c.id === parsed.data.caseId);
    if (!caseData) return reply.code(404).send({ error: 'Case not found' });

    const surfaceText = parsed.data.regenerateSurfaceText
      ? await orchestrator.generateSurfaceText(caseData)
      : await tryFetchShippedSurface(caseData);

    const session = sessions.create({
      caseId: caseData.id,
      caseData,
      surfaceText,
    });
    return session;
  });

  app.get<{ Params: { id: string } }>('/api/sessions/:id', async (req, reply) => {
    const session = sessions.get(req.params.id);
    if (!session) return reply.code(404).send({ error: 'Session not found' });
    const caseData = SHIPPED_CASES.find((c) => c.id === session.caseId);
    return {
      ...session,
      case: caseData ? publicCase(caseData) : null,
    };
  });

  const turnSchema = z.object({
    message: z.string().min(1).max(1000),
  });

  app.post<{ Params: { id: string } }>('/api/sessions/:id/turn', async (req, reply) => {
    const session = sessions.get(req.params.id);
    if (!session) return reply.code(404).send({ error: 'Session not found' });
    if (session.status !== 'playing') {
      return reply.code(409).send({ error: `Session is ${session.status}` });
    }

    const parsed = turnSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', details: parsed.error.format() });
    }

    const caseData = SHIPPED_CASES.find((c) => c.id === session.caseId);
    if (!caseData) return reply.code(500).send({ error: 'Case missing for session' });

    const citedBefore = new Set(session.citedClueIds);
    const citedNow = extractCitedClues(parsed.data.message, caseData).map((c) => c.id);
    const newlyCited = citedNow.filter((id) => !citedBefore.has(id));

    sessions.appendTurn(session.id, {
      role: 'player',
      text: parsed.data.message,
      timestamp: Date.now(),
    });

    const result = await orchestrator.ghostReply({
      caseData,
      conversation: session.conversation,
      playerInput: parsed.data.message,
      turnsSoFar: session.conversation.length,
      citedClueCount: session.citedClueIds.length + newlyCited.length,
    });

    sessions.appendTurn(session.id, {
      role: 'ghost',
      text: result.reply,
      disclosureLevel: result.disclosureLevel,
      hintedClueIds: result.hintedClueIds,
      timestamp: Date.now(),
    });

    const allCited = Array.from(new Set([...session.citedClueIds, ...result.hintedClueIds]));
    sessions.markProgress(session.id, allCited);

    return sessions.get(session.id);
  });

  app.post<{ Params: { id: string } }>('/api/sessions/:id/accuse', async (req, reply) => {
    const session = sessions.get(req.params.id);
    if (!session) return reply.code(404).send({ error: 'Session not found' });

    const accuseSchema = z.object({ accusation: z.string().min(10).max(2000) });
    const parsed = accuseSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', details: parsed.error.format() });
    }

    const caseData = SHIPPED_CASES.find((c) => c.id === session.caseId);
    if (!caseData) return reply.code(500).send({ error: 'Case missing for session' });

    const verdict = await orchestrator.judgeAccusation(caseData, parsed.data.accusation);
    const metaReflection = verdict.verdict === 'solved'
      ? await orchestrator.generateMetaReflection(caseData)
      : null;

    sessions.markStatus(session.id, verdict.verdict === 'solved' ? 'solved' : 'playing');

    return {
      verdict,
      metaReflection,
      truthRevealed: verdict.verdict === 'solved',
      hiddenTruth: verdict.verdict === 'solved' ? caseData.playerTruth : null,
      meta: verdict.verdict === 'solved' ? caseData.metaReflection : null,
    };
  });

  app.post<{ Params: { id: string } }>('/api/sessions/:id/hint', async (req, reply) => {
    const session = sessions.get(req.params.id);
    if (!session) return reply.code(404).send({ error: 'Session not found' });

    const caseData = SHIPPED_CASES.find((c) => c.id === session.caseId);
    if (!caseData) return reply.code(500).send({ error: 'Case missing for session' });

    const uncited = caseData.clues.filter((c) => !session.citedClueIds.includes(c.id));
    const target = uncited[0];
    if (!target) {
      return {
        level: 3,
        message: 'You have found all the clues. The truth is yours to assemble.',
      };
    }

    sessions.recordHint(session.id);

    const levels = [
      'Look again at what the writer takes for granted.',
      `In the section "${target.appearsIn}", pay attention to what is repeated but not explained.`,
      `The surface meaning is "${target.surfaceMeaning}." The hidden meaning, which you have not yet cited, is something different.`,
      `The clue you are missing concerns: ${target.hiddenMeaning}.`,
    ];

    const citedRatio = session.citedClueIds.length / Math.max(1, caseData.clues.length);
    let level: 0 | 1 | 2 | 3 = 0;
    if (citedRatio >= 0.8) level = 3;
    else if (citedRatio >= 0.5) level = 2;
    else if (session.hintsUsed >= 1) level = 1;

    return { level, message: levels[level] };
  });

  app.post<{ Params: { id: string } }>('/api/sessions/:id/abandon', async (req, reply) => {
    const session = sessions.get(req.params.id);
    if (!session) return reply.code(404).send({ error: 'Session not found' });
    sessions.markStatus(session.id, 'abandoned');
    return { ok: true };
  });

  // --------------------------------------------------------------------
  // Helpers live at module top — see tryFetchShippedSurface / publicCase
  // --------------------------------------------------------------------
}
