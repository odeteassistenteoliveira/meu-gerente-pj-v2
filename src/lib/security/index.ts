// ─────────────────────────────────────────────
// SECURITY — Barrel Export
// ─────────────────────────────────────────────

export {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
} from "./rate-limiter";

export {
  encrypt,
  decrypt,
  isEncrypted,
  encryptIfNeeded,
} from "./encryption";

export { auditLog, type AuditEntry } from "./audit";

export {
  checkoutSchema,
  chatSchema,
  adminResetSchema,
  webhookAsaasSchema,
  emailWelcomeSchema,
  formatZodError,
  type CheckoutInput,
  type ChatInput,
  type AdminResetInput,
  type WebhookAsaasInput,
  type EmailWelcomeInput,
} from "./validators";
