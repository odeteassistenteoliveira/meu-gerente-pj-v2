import Anthropic from "@anthropic-ai/sdk";

// Cliente singleton para reuso
let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

// Modelos disponíveis
export const MODELOS = {
  /** Análises complexas, simulações, consultoria — melhor qualidade */
  SONNET: "claude-sonnet-4-6",
  /** Tarefas simples: classificação, extração, resumo — 90% mais barato */
  HAIKU: "claude-haiku-4-5-20251001",
} as const;

export type ModeloIA = (typeof MODELOS)[keyof typeof MODELOS];
