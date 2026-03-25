import { GoogleGenerativeAI } from "@google/generative-ai";

// Cliente singleton para reuso
let _genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _genAI;
}

// Modelos disponíveis — Gemini 2.0 Flash (grátis, rápido, 1M tokens/dia)
export const MODELOS = {
  /** Análises complexas, consultoria — melhor qualidade gratuita */
  PRINCIPAL: "gemini-2.0-flash",
  /** Alias para compatibilidade com código existente */
  SONNET: "gemini-2.0-flash",
  HAIKU: "gemini-2.0-flash",
} as const;

export type ModeloIA = (typeof MODELOS)[keyof typeof MODELOS];

// Re-export para compatibilidade — código antigo importa getAnthropicClient
export const getAnthropicClient = getGeminiClient;
