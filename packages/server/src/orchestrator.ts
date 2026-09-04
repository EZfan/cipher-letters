/**
 * Orchestrator — the heart of the game engine.
 *
 * Three jobs:
 *  1. Run a conversation between the player and the ghost, mediated by the LLM
 *     under the constraints of the disclosure threshold.
 *  2. Generate new cases on demand (when the player wants a fresh mystery).
 *  3. Judge the player's accusation fairly.
 *
 * Everything that the LLM sees is rendered through templates in @cipher/shared.
 * The orchestrator never sends the hidden truth to the ghost's prompt — it only
 * sends the ghost's character, voice, and the refusal boundary.
 */

import {
  type Case,
  type Ghost,
  GHOST_SYSTEM_PROMPT,
  ACCUSATION_JUDGE_PROMPT,
  META_REFLECTION_PROMPT,
  SURFACE_TEXT_PROMPT,
  NEW_CASE_OUTLINE_PROMPT,
  fairPlayScore,
  disclosureThreshold,
  extractCitedClues,
} from '@cipher/shared';
import { LLMClient, type LLMMessage } from './llm-client.js';

export interface GhostTurnInput {
  readonly caseData: Case;
  readonly conversation: readonly { role: 'ghost' | 'player'; text: string }[];
  readonly playerInput: string;
  readonly turnsSoFar: number;
  readonly citedClueCount: number;
}

export interface GhostTurnResult {
  readonly reply: string;
  readonly disclosureLevel: number;
  readonly hintedClueIds: readonly string[];
}

export interface AccusationVerdict {
  readonly verdict: 'solved' | 'partial' | 'wrong';
  readonly message: string;
  readonly fairPlayScore: number;
}

export interface GenerationInput {
  readonly theme: string;
  readonly genre?: 'diary' | 'letter' | 'interview' | 'obituary' | 'police-report';
  readonly difficulty?: 'easy' | 'medium' | 'hard';
}

export class Orchestrator {
  constructor(private readonly llm: LLMClient) {}

  /**
   * Produce the ghost's reply. The ghost's system prompt is built fresh
   * each turn so that the disclosure threshold can be updated without
   * leaking state to the player.
   */
  async ghostReply(input: GhostTurnInput): Promise<GhostTurnResult> {
    const systemPrompt = GHOST_SYSTEM_PROMPT.replace('{{ghostName}}', input.caseData.ghost.name)
      .replace('{{ghostStateDescription}}', this.describeGhostState(input.caseData.ghost))
      .replace('{{genre}}', input.caseData.genre)
      .replace('{{year}}', String(input.caseData.year))
      .replace('{{setting}}', input.caseData.setting)
      .replace('{{ghostRelationship}}', input.caseData.synopsis)
      .replace('{{hiddenTruth}}', input.caseData.playerTruth)
      .replace('{{refusesToSay}}', input.caseData.ghost.refusesToSay)
      .replace('{{willAdmit}}', input.caseData.ghost.willAdmit)
      .replace('{{ghostVoice}}', input.caseData.ghost.voice)
      .replace('{{ghostHints}}', this.formatHints(input));

    const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];
    for (const turn of input.conversation) {
      messages.push({
        role: turn.role === 'player' ? 'user' : 'assistant',
        content: turn.text,
      });
    }
    messages.push({ role: 'user', content: input.playerInput });

    const result = await this.llm.complete(messages, {
      temperature: 0.85,
      maxTokens: 320,
    });

    const level = disclosureThreshold(
      input.turnsSoFar,
      input.citedClueCount,
      input.caseData.clues.length,
    );

    const hintedClues = this.extractHintedClueIds(result.content, input.caseData);

    return {
      reply: this.trimReply(result.content),
      disclosureLevel: level,
      hintedClueIds: hintedClues,
    };
  }

  /**
   * Judge the player's accusation. The judge sees the hidden truth and
   * the surface text; it does not reveal the hidden truth directly.
   */
  async judgeAccusation(caseData: Case, accusation: string): Promise<AccusationVerdict> {
    const systemPrompt = ACCUSATION_JUDGE_PROMPT.replace(
      '{{surfaceNarrative}}',
      caseData.surfaceNarrative,
    )
      .replace('{{playerTruth}}', caseData.playerTruth)
      .replace('{{playerAccusation}}', accusation);

    const result = await this.llm.complete([{ role: 'system', content: systemPrompt }], {
      temperature: 0.3,
      maxTokens: 200,
    });

    const normalized = result.content.trim().toUpperCase();
    let verdict: AccusationVerdict['verdict'] = 'wrong';
    if (normalized.includes('VERDICT: SOLVED')) verdict = 'solved';
    else if (normalized.includes('VERDICT: PARTIAL')) verdict = 'partial';

    const message = this.stripVerdictLine(result.content).trim();

    return {
      verdict,
      message,
      fairPlayScore: fairPlayScore(accusation, caseData),
    };
  }

  /**
   * Judge the player's accusation without any LLM — the offline fallback.
   *
   * Scores the accusation purely on cited evidence (the Fair Play
   * validator): how many of the case's clues the player has surfaced in
   * their own words. Thresholds are deliberately conservative so that a
   * SOLVED verdict without the LLM means the player genuinely assembled
   * the case from the text.
   */
  heuristicVerdict(caseData: Case, accusation: string): AccusationVerdict {
    const score = fairPlayScore(accusation, caseData);
    const uncited = caseData.clues.filter(
      (c) => !extractCitedClues(accusation, caseData).some((x) => x.id === c.id),
    );

    if (score >= 0.5) {
      return {
        verdict: 'solved',
        message:
          'You have assembled it. The threads you pulled — the repetitions, the silences, the object that would not stay in the background — were the ones the writer hid the truth inside.',
        fairPlayScore: score,
      };
    }

    if (score >= 0.25) {
      const next = uncited[0];
      const nudge = next
        ? ` You are circling it. Return to the text: ${next.appearsIn.toLowerCase()} holds something you have not yet turned over.`
        : ' You are circling it. Return to the text and read the repetitions against each other.';
      return {
        verdict: 'partial',
        message: `Part of what you say can be grounded in the text.${nudge}`,
        fairPlayScore: score,
      };
    }

    return {
      verdict: 'wrong',
      message:
        'The text does not yet support this. Read it once more — slowly — and note what repeats without ever being explained.',
      fairPlayScore: score,
    };
  }

  /**
   * Generate the META reflection shown after a case is solved.
   */
  async generateMetaReflection(caseData: Case): Promise<string> {
    const prompt = META_REFLECTION_PROMPT.replace('{{surfaceNarrative}}', caseData.surfaceNarrative)
      .replace('{{playerTruth}}', caseData.playerTruth)
      .replace('{{metaReflection}}', caseData.metaReflection)
      .replace('{{metaTheme}}', caseData.tags.join(', '));

    const result = await this.llm.complete([{ role: 'user', content: prompt }], {
      temperature: 0.7,
      maxTokens: 400,
    });
    return result.content.trim();
  }

  /**
   * Generate a fresh case from a theme prompt.
   */
  async generateCase(input: GenerationInput): Promise<Case> {
    const themePrompt = NEW_CASE_OUTLINE_PROMPT.replace('{{theme}}', input.theme);
    const result = await this.llm.complete([{ role: 'user', content: themePrompt }], {
      json: true,
      temperature: 1.0,
      maxTokens: 2500,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.content);
    } catch (err) {
      throw new Error(`Failed to parse generated case JSON: ${String(err)}`);
    }
    return this.validateAndNormalizeCase(parsed, input);
  }

  /**
   * Generate the surface narrative text for a case outline.
   * This is the literary prose the player will read.
   */
  async generateSurfaceText(caseData: Case): Promise<string> {
    const prompt = SURFACE_TEXT_PROMPT.replace('{{genre}}', caseData.genre)
      .replace('{{setting}}', caseData.setting)
      .replace('{{tone}}', caseData.tone)
      .replace('{{authorName}}', caseData.author)
      .replace('{{authorRole}}', caseData.characters[0]?.role ?? 'the writer')
      .replace('{{year}}', String(caseData.year))
      .replace('{{hiddenTruth}}', caseData.playerTruth)
      .replace('{{surfaceTruth}}', caseData.surfaceNarrative)
      .replace('{{clueList}}', this.formatClueList(caseData))
      .replace('{{redHerrings}}', this.formatRedHerringList(caseData));

    const result = await this.llm.complete([{ role: 'user', content: prompt }], {
      temperature: 0.95,
      maxTokens: 1400,
    });
    return result.content.trim();
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private describeGhostState(ghost: Ghost): string {
    switch (ghost.state) {
      case 'deceased':
        return 'you are dead. You speak from beyond — but you can still answer questions, slowly, as if remembering';
      case 'missing':
        return 'you have disappeared. You are not sure where you are. The player can hear you but you cannot see them';
      case 'unreliable-narrator':
        return 'you are alive but you lie to yourself. You do not know you are lying — that is what makes you unreliable';
      case 'beyond-the-fourth-wall':
        return 'you are aware, dimly, that you are being read. You do not know who is reading you. You address them gently';
    }
  }

  private formatHints(input: GhostTurnInput): string {
    const allHints = input.caseData.clues.flatMap((c) => c.ghostHints);
    return allHints.map((h) => `- ${h}`).join('\n');
  }

  private formatClueList(caseData: Case): string {
    return caseData.clues
      .map((c) => `- [${c.id}] appears in "${c.appearsIn}": ${c.surfaceMeaning}`)
      .join('\n');
  }

  private formatRedHerringList(caseData: Case): string {
    return caseData.redHerrings.map((r) => `- ${r.description}`).join('\n');
  }

  private trimReply(reply: string): string {
    const trimmed = reply.trim();
    return trimmed.length > 600 ? `${trimmed.slice(0, 597)}…` : trimmed;
  }

  private stripVerdictLine(content: string): string {
    return content.replace(/VERDICT:\s*\w+/i, '').trim();
  }

  private extractHintedClueIds(reply: string, caseData: Case): string[] {
    const normalized = reply.toLowerCase();
    return caseData.clues
      .filter((c) => c.ghostHints.some((h) => normalized.includes(h.toLowerCase().slice(0, 8))))
      .map((c) => c.id);
  }

  /**
   * Take the raw JSON returned by the LLM and ensure it conforms to
   * the Case type. Throws if it cannot — better to fail loudly than to
   * ship a broken case.
   */
  private validateAndNormalizeCase(parsed: unknown, input: GenerationInput): Case {
    const obj = parsed as Partial<Case>;
    if (!obj || typeof obj !== 'object') throw new Error('Invalid case object');

    const required: (keyof Case)[] = [
      'id',
      'title',
      'author',
      'genre',
      'year',
      'setting',
      'tone',
      'synopsis',
      'characters',
      'ghost',
      'surfaceNarrative',
      'playerTruth',
      'metaReflection',
      'clues',
      'redHerrings',
      'difficulty',
      'estimatedPlayMinutes',
      'tags',
    ];
    for (const field of required) {
      if (obj[field] === undefined) throw new Error(`Generated case missing field: ${field}`);
    }

    return {
      ...obj,
      genre: input.genre ?? (obj.genre as Case['genre']),
      difficulty: input.difficulty ?? (obj.difficulty as Case['difficulty']),
    } as Case;
  }
}
