# Architecture

This document explains the runtime architecture of The Cipher Letters.
For the design philosophy behind the architecture, see the
[README](../README.md). For the prompt templates themselves, see
[`packages/shared/src/prompts.ts`](../packages/shared/src/prompts.ts)
and [prompt-design.md](./prompt-design.md).

## High-level diagram

```
                  ┌──────────────────┐
                  │   apps/web       │
                  │   (React + Vite) │
                  └────────▲─────────┘
                           │ fetch /api/*
                           ▼
                  ┌──────────────────┐
                  │  packages/server │
                  │  (Fastify)       │
                  └────────▲─────────┘
                           │ imports types, prompts, cases
                           │ from @cipher/shared
                           ▼
                  ┌──────────────────┐
                  │ packages/shared  │
                  │ (no runtime deps │
                  │  except zod)     │
                  └──────────────────┘

                  ┌──────────────────┐
                  │   LLM backend    │
                  │  (Ollama, llama  │
                  │   .cpp, OpenAI…) │
                  └──────────────────┘
                           ▲
                           │ OpenAI-compatible HTTP
                           │
                  packages/server (Orchestrator)
```

## Packages

### `@cipher/shared`

The domain layer. Holds:

- **Type definitions** for the game (Case, Clue, Ghost, RedHerring,
  Character, Genre, TruthLayer).
- **Prompt templates** for the four LLM-driven jobs (surface text,
  ghost voice, accusation judge, meta reflection, new case outline).
  These are exported as string constants with `{{mustache}}` placeholders.
- **Clue validator** (`fairPlayScore`, `disclosureThreshold`,
  `hintLevel`).
- **Shipped cases** — three hand-authored complete cases, including
  the full Markdown surface narratives under
  `packages/shared/src/cases/text/`.
- **Vitest tests** for the validator.

The package has zero runtime dependencies on any other package in the
monorepo, which keeps it portable and lets it be reused from a CLI,
a Tauri wrapper, or a future mobile app.

### `@cipher/server`

The HTTP layer. Built on Fastify. Holds:

- **`llm-client.ts`** — a small OpenAI-compatible client. Speaks to
  Ollama, llama.cpp server, LM Studio, vLLM, OpenAI, DeepSeek, etc.
  No custom protocol.
- **`orchestrator.ts`** — the heart of the game. Five methods:
  - `ghostReply(input)` — runs one turn of the ghost conversation.
    Assembles the `GHOST_SYSTEM_PROMPT` from the case + player input,
    calls the LLM, returns the reply + computed disclosure level +
    hinted clue IDs.
  - `judgeAccusation(case, accusation)` — runs the accusation
    through the `ACCUSATION_JUDGE_PROMPT` and parses the verdict.
  - `generateMetaReflection(case)` — produces the literary Afterword
    shown after a case is solved.
  - `generateCase(input)` — produces a brand-new case outline (JSON)
    from a theme prompt. Validates the response against the
    `Case` type before returning.
  - `generateSurfaceText(case)` — produces the literary surface text
    for an existing case outline, embedding every clue in the
    Fair-Play contract.
- **`session-store.ts`** — an in-memory `Map<sessionId, SessionState>`.
  Sessions are not persisted; this is intentional, because re-playing
  the same case with a regenerated surface text is part of the design.
- **`routes.ts`** — the Fastify HTTP handlers, with zod validation
  on every body. Routes strip the hidden truth from the case before
  sending it to the client, and only reveal it after the accusation
  is judged SOLVED.
- **`index.ts`** — entry point. Wires the orchestrator to the routes,
  registers `@fastify/static` if the web bundle exists, and starts
  the server on `PORT` / `HOST` (default 4317 / 127.0.0.1).

### `@cipher/web`

The presentation layer. Built with React 18 + Vite + Tailwind CSS +
Motion. Holds:

- **`api.ts`** — typed wrapper around the server's REST API.
- **`store.ts`** — zustand store mirroring the game state machine.
  Five phases: `lobby → reading → conversation → accusation → reveal`.
- **`views/`** — the five screens. Each is a top-level React
  component that subscribes to the relevant slices of the store.
- **`components/`** — `TopBar`, `ErrorBanner`, `SurfaceReader`
  (the manuscript-style reading pane).
- **`index.css`** — Tailwind + bespoke CSS for parchment backgrounds
  (inline SVG turbulence), drop-caps, ink-link underlining, scroll
  fade masks.
- **`App.tsx`** — wires everything together with `AnimatePresence`
  page transitions.

## Runtime flow

### Starting a session

```
POST /api/sessions  { caseId }
       │
       ▼
  SHIPPED_CASES.find(...)
       │
       ▼
  tryFetchShippedSurface(caseId)   ← reads .md from disk
       │                             (or falls back to synopsis)
       ▼
  sessions.create({...})
       │
       ▼
  returns SessionState to client
```

### A conversation turn

```
POST /api/sessions/:id/turn  { message }
       │
       ▼
  extractCitedClues(message, case)  ← fair-play check
       │
       ▼
  sessions.appendTurn(playerTurn)
       │
       ▼
  orchestrator.ghostReply({
       caseData,
       conversation,    ← all previous turns
       playerInput,
       turnsSoFar,
       citedClueCount,
  })
       │
       ▼
  LLM.complete(messages, { temperature: 0.85 })
       │
       ▼
  sessions.appendTurn(ghostTurn)
       │
       ▼
  sessions.markProgress(newlyCitedClues)
       │
       ▼
  returns updated SessionState
```

### An accusation

```
POST /api/sessions/:id/accuse  { accusation }
       │
       ▼
  orchestrator.judgeAccusation(case, accusation)
       │
       ▼
  LLM.complete(ACCUSATION_JUDGE_PROMPT, { temperature: 0.3 })
       │
       ▼
  parse verdict: SOLVED | PARTIAL | WRONG
       │
       ▼
  if SOLVED:
       orchestrator.generateMetaReflection(case)
       sessions.markStatus('solved')
       returns { verdict, metaReflection, hiddenTruth, meta }
  else:
       returns { verdict }
```

## Why an in-memory store?

Sessions do not survive a server restart, on purpose. The surface
text is generated freshly each time the player opens a case (or read
from the shipped Markdown), so re-playing the same case twice is
intentionally a different experience — and we do not want to expose
old generated text through a database query that the user did not
intend. A persistent store would also need careful thought about
which cases the user has played, whether to allow re-reading solved
cases, and so on; for v0.1 we keep the system stateless above the
process boundary.

The cost is that the player cannot pause and resume across server
restarts. If that becomes a real friction point, the right next step
is to write a `SessionStore` adapter to SQLite (good) or a small JSON
file per session (also fine). Both are straightforward.

## Failure modes

- **LLM unreachable** — every LLM-dependent route surfaces a 502 with
  a descriptive error. The UI shows a banner. The shipped cases still
  load and are readable; only the ghost conversation and the
  accusation judge are unavailable.
- **LLM returns malformed JSON** (for case generation) — the
  orchestrator throws and the route returns 502 with the parse error.
  The client displays it.
- **LLM hallucinating facts not in the case** — the orchestrator
  protects against this in two places:
  1. The ghost's system prompt is rebuilt every turn with the *current*
     disclosure threshold, so the LLM has no "memory" of an earlier
     (more permissive) prompt.
  2. The accusation judge is given only the case's
     `surfaceNarrative` + `playerTruth`, and is explicitly told not
     to reveal the truth directly.
- **Static file path traversal** — `@fastify/static` is configured
  with a fixed root and we never accept user-supplied paths in
  routes. The only file-reading we do is the case surface text,
  which is keyed on a server-controlled `caseId` from a closed set.

## Observability

- **Logs**: pino with `pino-pretty` in development. Every request is
  logged with method, URL, status code, and latency.
- **Metrics**: not yet. A future PR could add Prometheus middleware
  (`fastify-metrics`) tracking LLM call counts, p50/p95 latency, and
  token usage.
- **Tracing**: not yet. A future PR could add OpenLLMetry on the
  orchestrator to instrument the LLM call graph.
