// ─────────────────────────────────────────────
// RATE LIMITER — In-Memory (Sliding Window)
// Migrar para Upstash Redis quando tráfego crescer
// ─────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas a cada 60 segundos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);
}

export interface RateLimitConfig {
  /** Número máximo de requisições na janela */
  maxRequests: number;
  /** Janela em segundos */
  windowSeconds: number;
}

/** Configurações padrão por tipo de endpoint */
export const RATE_LIMITS = {
  /** Endpoints de autenticação (login, cadastro) */
  auth: { maxRequests: 10, windowSeconds: 60 } as RateLimitConfig,
  /** API de chat (consumo de IA — mais restritivo) */
  chat: { maxRequests: 20, windowSeconds: 60 } as RateLimitConfig,
  /** Endpoints de pagamento */
  checkout: { maxRequests: 5, windowSeconds: 60 } as RateLimitConfig,
  /** Webhooks externos */
  webhook: { maxRequests: 100, windowSeconds: 60 } as RateLimitConfig,
  /** Admin endpoints */
  admin: { maxRequests: 30, windowSeconds: 60 } as RateLimitConfig,
  /** Endpoints gerais */
  general: { maxRequests: 60, windowSeconds: 60 } as RateLimitConfig,
  /** Email endpoints */
  email: { maxRequests: 5, windowSeconds: 60 } as RateLimitConfig,
} as const;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Verifica rate limit para uma chave (ex: IP ou userId).
 * Retorna headers padrão para incluir na resposta.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Nova janela
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  entry.count += 1;

  if (entry.count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extrai o IP do request para usar como chave de rate limit.
 * Em produção (Vercel), usa x-forwarded-for.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Headers de rate limit para incluir na resposta HTTP.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.success ? {} : { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  };
}
