# The Cipher Letters

> *Read the words the writer left behind.*
> *Hear the voice they did not mean to leave.*
> *Then decide what really happened.*

**The Cipher Letters** is an offline-first literary mystery game. You open a
piece of AI-generated or hand-authored fiction — a letter, a diary, an
interview — and discover that the writer is hiding something. You sit
across from the **ghost** of the writer (or of someone they loved) and
ask them questions. They will not tell you the truth directly. They
never do. But they will not quite lie, either.

When you are ready, you submit your **accusation** — your explanation of
what really happened beneath the surface text. The Keeper of the Case
will judge whether you found it.

Three cases ship with the game, hand-authored and tested through the
validator. If you have a local LLM (Ollama, llama.cpp, LM Studio) or an
OpenAI-compatible API key, the game can also **generate** fresh cases
on demand and run the ghost conversation live.

---

## What is the experience like?

You open the lobby and see three folders on a desk:

- **The Last Letter** — a 1924 letter from a Viennese wife to her
  traveling husband. Twenty minutes. Easy.
- **The Lighthouse Keeper's Diary** — the daily log of a man alone on
  a North Atlantic rock. Twenty-five minutes. Medium.
- **The Studio Interview** — a 1998 magazine feature with a
  reclusive musician. Thirty-five minutes. Hard.

You choose one. A page turns. You read. The text is in a literary
voice — sometimes over-formal, sometimes lyrical, sometimes barely
holding itself together. You notice that certain objects appear
again and again. You notice silences around certain topics. You notice
the writer using the present tense about someone who should be in
the past.

You click *sit across from the ghost*. A conversation opens. You ask
the ghost — whose name, state, and voice you now know — questions. They
answer in two or three sentences at a time. They tell you about the
weather, the postmaster, the kettle. They tell you what they will not
tell you about.

When you are ready, you click *I am ready to accuse*. You write what
you think really happened. The Keeper reads it. If you are right, the
truth unfolds — and after it, a literary Afterword on what the case
was *about*, beyond the surface mystery.

---

## Architecture

The Cipher Letters is a TypeScript monorepo with three packages.

```
cipher-letters/
├── packages/
│   ├── shared/      # Game types, prompts, validator, hand-authored cases
│   └── server/      # Fastify API, LLM client, orchestrator, session store
└── apps/
    └── web/         # React UI (parchment, serif, kinetic typography)
```

The three packages have a single direction of dependency:
`apps/web → packages/server → packages/shared`. The `shared` package
holds the entire domain — types, prompt templates, clue-validator logic,
and the three shipped cases (including their full surface narratives
as Markdown). It has no runtime dependencies beyond `zod`.

The `server` package wraps an OpenAI-compatible LLM endpoint. It
implements the **Orchestrator**: the prompt-assembly code that turns
the player’s input into a structured ghost reply, the **Judge** that
evaluates accusations, and the **Generator** that produces new cases
from a theme. The `SessionStore` is an in-memory `Map`; sessions do
not survive a restart.

The `web` package renders the literary interface: parchment backgrounds
(generated from inline SVG turbulence), serif typography (Fraunces +
Source Serif 4), drop-caps, ink-link underlining, scrollytelling
reveals. It is plain CSS — no UI library — to keep the bundle small
and the look bespoke.

---

## The Design Philosophy

Three principles, borrowed from the literary traditions this game
inhabits:

### 1. Fair Play

Every clue the player needs to solve the case is **findable in the
surface text**. We never hide the answer from the player in the
ghost's private knowledge. The validator (`fairPlayScore`) computes
how much of the case the player has reconstructed from cited evidence;
if the score is below threshold, the Keeper will not declare the case
solved. This is the *Ronald Knox* and *S.S. Van Dine* tradition,
translated into code.

### 2. Disclosure Threshold

The ghost will not say what they know until the player has earned
the right to hear it. The orchestrator computes a
`disclosureThreshold` value (0..1) on every turn, blending how much
evidence the player has cited (weight 0.7) with how long they have
been patient (weight 0.3). At low thresholds the ghost speaks only of
weather and atmosphere; at high thresholds they begin to admit what
they have been hiding. This is the *Todorov* tradition — narrative as
a movement between two equilibria — and the *Booth* tradition of the
unreliable narrator whose knowledge is doled out only at the right
emotional moment.

### 3. The Three Truths

Every case has three layers of truth:

- **The Surface.** The literary text as written. What it claims.
- **The Player Truth.** What really happened. What the player must
  reconstruct.
- **The Meta.** The philosophical / structural insight the case is
  about. (For *The Lighthouse Keeper*: loneliness, given enough time,
  does not destroy a person. It gives them a country of their own.)

The Meta is revealed only after the case is solved, as an Afterword.
This is the *Calvino* tradition — literature that is also a lesson in
how to read literature.

---

## Quick start

You will need [Node.js 20+](https://nodejs.org) and [pnpm](https://pnpm.io).

```bash
# 1. Clone
git clone https://github.com/EZfan/cipher-letters.git
cd cipher-letters

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Run the shipped cases immediately (no LLM needed)
pnpm start
```

Then open <http://127.0.0.1:4317>. The three hand-authored cases are
playable without any LLM at all — the surface text is shipped as
Markdown next to each case, and the game’s hint engine is fully local.

### Optional: a live ghost (with a local LLM)

If you want the ghost to *actually speak*, install
[Ollama](https://ollama.com), pull a model, and start the server with
custom env vars:

```bash
# One-time
ollama pull qwen2.5:7b

# Per session
LLM_BASE_URL=http://127.0.0.1:11434/v1 \
LLM_MODEL=qwen2.5:7b \
pnpm start
```

The Cipher Letters supports **any OpenAI-compatible endpoint** —
llama.cpp server, LM Studio, vLLM, OpenAI, DeepSeek, etc. Just point
`LLM_BASE_URL` and `LLM_MODEL` at it. See `.env.example` for the full
list of configuration variables.

### Optional: generate fresh cases

```bash
# Generates a brand new case outline and surface text, server-side.
curl -X POST http://127.0.0.1:4317/api/cases/generate \
  -H "Content-Type: application/json" \
  -d '{"theme":"a forester who maps an unnamed wood","genre":"diary"}'
```

The orchestrator calls the LLM with the `NEW_CASE_OUTLINE_PROMPT`
template, validates the JSON it returns, and (in a second call) asks
the LLM to write the surface text with the *Fair Play* contract:
every clue must appear, no clue may be added that isn’t in the outline.

---

## Configuration

All configuration is via environment variables. See `.env.example`.

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `4317` | HTTP port |
| `HOST` | `127.0.0.1` | HTTP host |
| `LLM_BASE_URL` | `http://127.0.0.1:11434/v1` | OpenAI-compatible endpoint |
| `LLM_API_KEY` | `ollama` | API key (any non-empty string for Ollama) |
| `LLM_MODEL` | `qwen2.5:7b` | Model name |
| `LOG_LEVEL` | `info` | Server log verbosity |
| `NODE_ENV` | (unset) | Set to `production` for prod logging |

---

## Development

```bash
pnpm dev          # start server + web in watch mode
pnpm test         # run all tests
pnpm typecheck    # type-check all packages
pnpm format       # format all files with Prettier
pnpm build        # build all packages
```

The web dev server (Vite, on port 5173) proxies `/api/*` to the
server (port 4317). In production, the server also serves the built
web bundle from `apps/web/dist`.

---

## Repository hygiene

- **License** — MIT. See [LICENSE](./LICENSE).
- **Changelog** — Keep a Changelog format. See [CHANGELOG.md](./CHANGELOG.md).
- **Contributing** — See [CONTRIBUTING.md](./CONTRIBUTING.md).
- **Code of Conduct** — Contributor Covenant v2.1. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
- **Security** — See [SECURITY.md](./SECURITY.md).
- **Architecture** — See [docs/architecture.md](./docs/architecture.md).
- **Prompt design** — See [docs/prompt-design.md](./docs/prompt-design.md).
- **Authoring a case** — See [docs/authoring-a-case.md](./docs/authoring-a-case.md).

---

## Acknowledgements

The Cipher Letters stands on the work of many. The narrative-theory
vocabulary (Todorov, Barthes, Genette, Booth, Eco, Culler) is laid out
in [docs/prompt-design.md](./docs/prompt-design.md). The interactive
fiction lineage includes *Her Story*, *Return of the Obra Dinn*,
*The Case of the Golden Idol*, *Disco Elysium*, *AI: The Somnium
Files*, and *Doki Doki Literature Club*. The literary lineage includes
Christie, Döblin, Borges, Calvino, and the Japanese *shin-honkaku*
tradition. The local-LLM lineage includes Ollama, llama.cpp, and the
generous work of the Qwen, Mistral, and Llama teams.

And — most of all — to the writers whose diaries, letters, and
interviews this game is a small homage to. The form you invented is
the form we are trying, gently, to honour.
