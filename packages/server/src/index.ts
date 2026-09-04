/**
 * Server entry point.
 *
 * Configuration is via environment variables. Sensible defaults are
 * provided so that a developer with `ollama serve` running locally can
 * start the server with `pnpm dev` and have everything just work.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LLMClient } from './llm-client.js';
import { Orchestrator } from './orchestrator.js';
import { SessionStore } from './session-store.js';
import { registerRoutes } from './routes.js';

/**
 * Candidate locations of the built web bundle, tried in order:
 *  1. relative to this file — `packages/server/{src,dist}` is one level
 *     below the package root, so `../../apps/web/dist` is correct for
 *     both `tsx src/index.ts` and `node dist/index.js`
 *  2. relative to the process working directory (monorepo-root runs)
 */
async function resolveWebDist(): Promise<string | null> {
  const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const candidates = [
    path.resolve(serverRoot, '..', '..', 'apps', 'web', 'dist'),
    path.resolve(process.cwd(), 'apps', 'web', 'dist'),
  ];
  for (const dir of candidates) {
    try {
      await fs.access(dir);
      return dir;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const PORT = Number(process.env.PORT ?? 4317);
const HOST = process.env.HOST ?? '127.0.0.1';

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? 'http://127.0.0.1:11434/v1';
const LLM_API_KEY = process.env.LLM_API_KEY ?? 'ollama';
const LLM_MODEL = process.env.LLM_MODEL ?? 'qwen2.5:7b';

async function main(): Promise<void> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
            }
          : undefined,
    },
  });

  await app.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? false : true,
  });

  const llm = new LLMClient({
    baseUrl: LLM_BASE_URL,
    apiKey: LLM_API_KEY,
    model: LLM_MODEL,
  });

  const sessions = new SessionStore();
  const orchestrator = new Orchestrator(llm);

  await registerRoutes(app, { orchestrator, sessions, llm });

  // Serve the built web app if it exists (production mode).
  const webDist = await resolveWebDist();
  let webUiServed = false;
  if (webDist) {
    await app.register(staticPlugin, { root: webDist, prefix: '/' });
    app.log.info(`Serving web UI from ${webDist}`);
    webUiServed = true;
    // SPA fallback: any non-API GET returns index.html
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) {
        return reply.code(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });
  } else {
    app.log.info('Web UI not built — run `pnpm --filter @cipher/web build` to enable.');
  }

  if (!webUiServed) {
    app.get('/', async () => ({
      service: 'cipher-letters',
      message: 'The Cipher Letters — server is running. Visit /api/cases to begin.',
    }));
  }

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`The Cipher Letters server listening on http://${HOST}:${PORT}`);
    app.log.info(`LLM backend: ${LLM_BASE_URL} (model: ${LLM_MODEL})`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});
