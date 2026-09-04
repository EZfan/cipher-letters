# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-09-04)


### Features

* initial release of The Cipher Letters v0.1.0 ([355c1f9](https://github.com/EZfan/cipher-letters/commit/355c1f9fb10d45ffab7fd400b7662cdfdc3b6002))
* pixel-art game theme — title screen, ghost portraits, RPG dialog, 8-bit sound ([a0433d6](https://github.com/EZfan/cipher-letters/commit/a0433d6f5b2f4b8ee9e9e225354bad2341504949))
* README screenshots + fix accusation verdict shape (solved never displayed) ([eca9bd0](https://github.com/EZfan/cipher-letters/commit/eca9bd0807c536caad7d91e601f7d99478598b30))


### Bug Fixes

* accuracy audit — path resolution, offline judge, real lint, honest docs ([daf9813](https://github.com/EZfan/cipher-letters/commit/daf981334eafa4534c7ade5dd24a2d7fb657ec60))

## [Unreleased]

### Added

- Pixel-art game theme (PIXEL/PAPER toggle): title screen with candles
  and stars, 16×16 evidence sprites, breathing/blinking ghost portraits,
  typewriter RPG dialog, CRT scanlines, and an optional pure-WebAudio
  8-bit sound engine. All art and sound are generated in code; 41 new
  sprite-integrity tests (81 total).
- `scripts/screenshot.mjs` — captures the README screenshots by walking
  the real UI against a mocked API (`pnpm shots`).

### Fixed

- **Accusation verdicts never registered as SOLVED in the UI**: the
  server returned the verdict nested inside a `verdict` field while the
  client read a flat shape, so every solved case rendered as
  "UNSUPPORTED". The server now returns the flat shape the client
  expects (this bug was caught by the screenshot walk-through).
- The conversation log's bottom fade masked the newest message's last
  line; the fade now stays shallow and the log gained bottom padding.
- The server now resolves the web bundle and the shipped case texts
  relative to its own module location, so `pnpm start` serves the full
  game and complete surface narratives regardless of the working
  directory it was launched from (previously both silently fell back
  when started from `packages/server`).
- Submitting an accusation with no LLM backend reachable no longer
  fails: the judge degrades to the local Fair-Play validator, and each
  verdict response carries a `judgedBy` field (`llm` or `validator`)
  shown in the UI. Ghost _conversation_ still requires an LLM and now
  returns a clear 503 explaining why.
- `pnpm lint` is real: ESLint 9 (typescript-eslint flat config) added
  at the repo root, replacing per-package scripts that referenced a
  dependency nobody had installed. CI now runs lint and format check
  as separate steps.

## [0.1.0] - 2026-09-04

### Added

- Initial release.
- Three hand-authored cases: _The Last Letter_ (easy), _The Lighthouse
  Keeper's Diary_ (medium), _The Studio Interview_ (hard). Each ships
  with its full surface narrative as Markdown.
- Monorepo with `@cipher/shared`, `@cipher/server`, `@cipher/web`
  packages and a pnpm workspace.
- Fastify HTTP API with the following routes:
  - `GET /api/health`, `GET /api/llm/status`
  - `GET /api/cases`, `GET /api/cases/:id`, `POST /api/cases/generate`
  - `POST /api/sessions`, `GET /api/sessions/:id`
  - `POST /api/sessions/:id/turn`, `/accuse`, `/hint`, `/abandon`
- React UI with five views: Lobby, ReadingRoom, Interrogation,
  Accusation, Reveal. Parchment background, serif typography
  (Fraunces + Source Serif 4), drop-cap opening, scrollytelling
  transitions powered by Motion.
- Orchestrator that runs ghost conversations under a
  _disclosure threshold_ constraint, judges accusations against the
  _fair-play score_, and generates fresh cases from a theme prompt.
- In-memory session store. Sessions do not survive a server restart.
- Validator utilities (`fairPlayScore`, `disclosureThreshold`,
  `hintLevel`) tested through Vitest.
- Built web bundle is served by the server in production mode with
  SPA fallback.

### Notes

- No external LLM is required to play the shipped cases — every case
  has a fully pre-written surface text, and the hint system is local.
- Live ghost conversation requires an OpenAI-compatible endpoint
  (Ollama, llama.cpp, LM Studio, OpenAI, DeepSeek, etc.).
