// ─────────────────────────────────────────────
// VALIDADORES ZOD — Input Validation para todas as APIs
// ─────────────────────────────────────────────

import { z } from "zod";

// ── Checkout ─────────────────────────────────
export const checkoutSchema = z.object({
  plano: z.enum(["pro", "essencial", "profissional"], {
    errorMap: () => ({ message: "Plano inválido. Opções: pro, essencial, profissional" }),
  }),
  ciclo: z.enum(["mensal", "anual"], {
    errorMap: () => ({ message: "Ciclo inválido. Opções: mensal, anual" }),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Chat ─────────────────────────────────────
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Mensagem não pode ser vazia").max(10000, "Mensagem muito longa (máx 10.000 caracteres)"),
});

export const chatSchema = z.object({
  messages: z
    .array(messageSchema)
    .min(1, "Pelo menos uma mensagem é obrigatória")
    .max(50, "Máximo de 50 mensagens por requisição"),
  modulo: z
    .enum(["calculadora", "taxas", "credito", "bancario", "investimentos", "geral"])
    .optional()
    .default("geral"),
  empresa: z.record(z.unknown()).optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;

// ── Admin Reset Mensagens ────────────────────
export const adminResetSchema = z.object({
  empresa_id: z.string().uuid("empresa_id deve ser um UUID válido"),
});

export type AdminResetInput = z.infer<typeof adminResetSchema>;

// ── Webhook Asaas ────────────────────────────
export const webhookAsaasSchema = z.object({
  event: z.string().min(1, "Evento obrigatório"),
  payment: z
    .object({
      id: z.string().optional(),
      externalReference: z.string().optional(),
      status: z.string().optional(),
    })
    .passthrough()
    .optional()
    .default({}),
  subscription: z
    .object({
      id: z.string().optional(),
      externalReference: z.string().optional(),
    })
    .passthrough()
    .optional()
    .default({}),
}).passthrough();

export type WebhookAsaasInput = z.infer<typeof webhookAsaasSchema>;

// ── Email Welcome ────────────────────────────
export const emailWelcomeSchema = z.object({
  email: z.string().email("Email inválido"),
  nomeEmpresa: z.string().max(200, "Nome muito longo").optional().default(""),
});

export type EmailWelcomeInput = z.infer<typeof emailWelcomeSchema>;

// ── Helper para formatar erros Zod ───────────
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join("; ");
}
