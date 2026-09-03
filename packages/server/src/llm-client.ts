/**
 * LLM client — talks to any OpenAI-compatible endpoint.
 *
 * The Cipher Letters supports three backends out of the box:
 *   - Local Ollama (recommended; zero cost, fully offline)
 *   - llama.cpp server
 *   - Any OpenAI-compatible hosted API (DeepSeek, OpenAI, etc.)
 *
 * The client is intentionally small. All complexity lives in the prompt
 * templates and the orchestrator.
 */

import OpenAI from 'openai';

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionResult {
  content: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export class LLMClient {
  private readonly client: OpenAI;
  private readonly config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      maxTokens: 1200,
      temperature: 0.8,
      ...config,
    };
    this.client = new OpenAI({
      baseURL: config.baseUrl,
      apiKey: config.apiKey,
    });
  }

  async complete(
    messages: readonly LLMMessage[],
    options: { json?: boolean; temperature?: number; maxTokens?: number } = {},
  ): Promise<LLMCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? this.config.temperature,
      max_tokens: options.maxTokens ?? this.config.maxTokens,
      ...(options.json ? { response_format: { type: 'json_object' as const } } : {}),
      stream: false,
    });

    const choice = response.choices[0];
    if (!choice) {
      throw new Error('LLM returned no choices');
    }

    return {
      content: choice.message.content ?? '',
      model: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    };
  }

  /**
   * Check whether the configured endpoint is reachable.
   * Used by the health endpoint and by the CLI setup wizard.
   */
  async ping(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await this.complete(
        [{ role: 'user', content: 'Reply with the single word: ready' }],
        { maxTokens: 8, temperature: 0 },
      );
      return { ok: true, latencyMs: Date.now() - start };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
