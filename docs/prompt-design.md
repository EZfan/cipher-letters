# Prompt design

This document explains how the prompt templates in
[`packages/shared/src/prompts.ts`](../packages/shared/src/prompts.ts)
are structured and why. It is intended for maintainers who want to
extend the orchestrator or author new templates in the same spirit.

## The five jobs

The orchestrator calls the LLM for five distinct jobs:

1. **Writing the surface text** — `SURFACE_TEXT_PROMPT`.
   Given a case outline (genre, setting, tone, characters, hidden
   truth, list of clues, list of red herrings), produce a 600–900
   word literary text in the appropriate voice.
2. **Speaking as the ghost** — `GHOST_SYSTEM_PROMPT`.
   Given the ghost's character, voice, and the boundary between
   `refusesToSay` and `willAdmit`, plus the current disclosure
   threshold, produce a 2–4 sentence reply to the player's question.
3. **Judging the accusation** — `ACCUSATION_JUDGE_PROMPT`.
   Given the case's surface narrative, the hidden truth, and the
   player's accusation, produce a verdict (`SOLVED` / `PARTIAL` /
   `WRONG`) plus a brief, non-spoiling message.
4. **Writing the Afterword** — `META_REFLECTION_PROMPT`.
   Given the surface text, the player's truth, and the case's
   pre-authored meta-insight, produce a 150–250 word literary
   reflection shown only after the case is solved.
5. **Designing a fresh case** — `NEW_CASE_OUTLINE_PROMPT`.
   Given a theme, produce a complete `Case` outline as strict JSON.

Each prompt has its own constraints and its own failure modes. We
treat them as small essays, not as SQL queries.

## Shared principles

### Negative instructions > positive instructions

We tell the LLM what *not* to do at least as often as what to do.
This is empirically more reliable than positive framing for
voice-and-tone tasks: "do not use modern internet slang" gives
sharper results than "use period-appropriate diction."

### Surface / truth split

The surface-text prompt is given both the hidden truth
(`{{hiddenTruth}}`) and the public story (`{{surfaceTruth}}`). It is
the LLM's job to *hide* the truth behind the surface. This is
deliberate. The alternative — asking the LLM to invent a hidden
truth on its own — produces surface texts that leak too easily,
because the LLM cannot help but reveal what it is hiding.

### No chain-of-thought in production prompts

We considered asking the LLM to "think step by step" before producing
the final reply, and decided against it. Three reasons:

1. It roughly doubles token usage.
2. The intermediate reasoning tends to leak into the final answer in
   small models (Qwen 2.5 7B).
3. We have no way to *hide* the reasoning from the player — it ends
   up in the ghost's response, and the ghost suddenly sounds like an
   analyst rather than a person.

If we ever add reasoning, it must be in a separate `analysis` channel
that we strip before sending to the client. (This is what Claude's
`thinking` mode does internally.)

### Temperature is not a knob to be set by feel

Every prompt has a recommended `temperature`:

- `0.3` for the accusation judge (we want consistency, not creativity)
- `0.7` for the Afterword (we want voice, but stable meaning)
- `0.85` for the ghost reply (we want voice variation across turns)
- `0.95` for the surface text (we want maximum literary texture)
- `1.0` for case generation (we want maximum creative divergence)

If you change a temperature, change it in `orchestrator.ts`, not in
the prompt. Prompts are for *content*; temperatures are for *quality
of the response*.

## The ghost prompt in detail

The ghost prompt is the hardest to get right, because it is asked to
do two contradictory things: **answer in character** and **not reveal
the truth**. We resolve this through three constraints:

1. **The ghost is told only what it would know.** It receives the
   surface narrative as part of its character history, but not the
   hidden truth as a piece of advice. It knows "what really
   happened" only in the same way the writer did — imperfectly,
   emotionally, with its own evasions.
2. **The ghost is told what it will not say.** The `{{refusesToSay}}`
   and `{{willAdmit}}` placeholders give the orchestrator explicit
   hooks for the closure of the case. Even if the disclosure
   threshold goes to 1, the ghost will only admit the *closest*
   version of the truth it can.
3. **The ghost is told to use silence, not lies.** A line in the
   prompt explicitly forbids denial of the truth when the player
   guesses it; the ghost's *reaction* is its answer. This is a
   surprisingly strong signal in playtesting — players read the
   silence much better than they read the words.

### Why the disclosure threshold is recomputed every turn

The disclosure threshold is a function of `(turnsSoFar, citedClueCount)`.
We recompute it on every turn and rebuild the system prompt with the
new value rather than threading it through the conversation history.
This means:

- The ghost cannot "remember" a more permissive threshold it once had.
- If the player walks back their evidence (e.g. contradicts
  themselves), the threshold drops, and the ghost becomes more
  guarded — which is the right narrative move.
- We do not have to maintain a separate `state` channel outside the
  prompt.

## The surface text prompt in detail

The surface text prompt is the *largest* prompt we have, and the
one most prone to drift. To keep it on-rails, we make five explicit
asks:

1. **Mention every clue at least once.** Verbatim. The clue list is
   enumerated at the end of the prompt so the model cannot abstract
   them away.
2. **Include at least one red herring.** The red herring list is
   enumerated separately so the model knows they are *not* part of
   the truth.
3. **Use a recurring image at least three times.** This is the
   "key object" of the case — the blue envelope, the kettle, the
   microphone. The LLM is told to make it ordinary on the surface
   but load-bearing in light of the truth.
4. **End closed.** The text should *feel* complete. The attentive
   reader will notice the silence around one specific thing; the
   casual reader will not.
5. **Do not announce that something is hidden.** No "secret",
   "lie", "hidden", "mystery", "truth" in the surface text. (We
   enforce this with a final negative-instruction list.)

If you author new cases, the surface text must satisfy these five
constraints. A useful test: take the generated text, remove every
proper noun and every character name, and ask yourself whether the
remaining text still feels like a piece of literature. If it does,
the surface text is doing its job.

## The judge prompt in detail

The judge prompt is the *shortest* and the most tightly constrained.
It does four things:

1. Reads the surface text (so it knows what the player has seen).
2. Reads the hidden truth (so it knows what the player should
   conclude).
3. Reads the accusation (so it can compare).
4. Returns a verdict (`SOLVED` / `PARTIAL` / `WRONG`) and a one-line
   message. The message must be non-spoiling. A partial verdict
   comes with a clarifying question; a wrong verdict comes with a
   gentle nudge back toward the text.

We deliberately do not use the fair-play score to *determine* the
verdict — only as an *advisory* input. Two reasons:

- The LLM can read the accusation semantically and tell whether the
  player has the right idea even if their phrasing is rough.
- We want verdicts to be readable to the player, not just to the
  validator.

If the LLM produces a malformed verdict (no `VERDICT:` line, for
instance), the orchestrator falls back to `WRONG` and uses the raw
output as the message. This is rare in practice — Qwen 2.5 7B and
Llama 3 8B both follow the format reliably after a single example.

## The Afterword prompt in detail

The Afterword is written *after* the player has solved the case. The
prompt has only one ask: connect the case to a wider truth.

```
DO NOT spoil the case for future players. This reflection is only
shown AFTER they solve it.
```

is the key constraint. We deliberately do not give the Afterword
author the player's exact accusation — only the truth they
discovered. This keeps the Afterword a *literary* reflection rather
than a *personal* one. If the project ever ships user-authored
cases, the Afterword is one place where the case author's voice is
allowed to come through clearly.

## The new-case prompt in detail

The new-case prompt asks the LLM for a `Case` as strict JSON. It
instructs the model to:

- Use 5–8 clues (the typical sweet spot).
- Provide 2–3 red herrings that look like real clues but lead nowhere.
- Differentiate the ghost's `refusesToSay` and `willAdmit` — they
  must be different formulations of the same hidden fact.
- Provide a meta-reflection that is a *real insight* (about
  narrative, memory, grief, identity, or time), not a platitude.

The orchestrator validates the JSON shape against the `Case` type
and throws if any required field is missing. This is intentional:
we would rather the player see a 502 with a clear error than play a
half-broken case.
