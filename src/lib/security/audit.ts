// ─────────────────────────────────────────────
// AUDIT LOGGING — Registra ações sensíveis
// ─────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

// Service role client para bypassar RLS ao inserir logs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuditEntry {
  user_id: string | null;
  acao: string;
  recurso?: string;
  recurso_id?: string;
  detalhes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Registra uma entrada no audit log.
 * Fire-and-forget — não bloqueia o fluxo principal.
 */
export async function auditLog(entry: AuditEntry): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      user_id: entry.user_id,
      acao: entry.acao,
      recurso: entry.recurso ?? null,
      recurso_id: entry.recurso_id ?? null,
      detalhes: entry.detalhes ?? null,
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ?? null,
    });
  } catch (err) {
    // Nunca falhar silenciosamente, mas também nunca bloquear a operação
    console.error("[audit_log] Erro ao registrar:", err);
  }
}
