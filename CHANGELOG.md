# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-09-03

### Added
- Initial release.
- Three hand-authored cases: *The Last Letter* (easy), *The Lighthouse
  Keeper's Diary* (medium), *The Studio Interview* (hard). Each ships
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
  *disclosure threshold* constraint, judges accusations against the
  *fair-play score*, and generates fresh cases from a theme prompt.
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
