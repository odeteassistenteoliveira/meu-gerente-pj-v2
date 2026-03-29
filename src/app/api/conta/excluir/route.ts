import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
  formatZodError,
  auditLog,
} from "@/lib/security";

const excluirSchema = z.object({
  motivo: z.string().max(500).optional().default(""),
});

// ── POST: Solicitar exclusão de conta (LGPD — 15 dias) ─
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`delete-account:${ip}`, RATE_LIMITS.checkout);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas requisições." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const rawBody = await req.json();
    const parsed = excluirSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    // Verificar se já existe solicitação pendente
    const { data: existente } = await supabase
      .from("exclusao_conta")
      .select("id, excluir_em")
      .eq("user_id", user.id)
      .eq("status", "pendente")
      .single();

    if (existente) {
      return NextResponse.json({
        error: "Já existe uma solicitação de exclusão pendente.",
        excluir_em: existente.excluir_em,
      }, { status: 409 });
    }

    // Criar solicitação — exclusão em 15 dias
    const excluirEm = new Date();
    excluirEm.setDate(excluirEm.getDate() + 15);

    const { error } = await supabase.from("exclusao_conta").insert({
      user_id: user.id,
      excluir_em: excluirEm.toISOString(),
      motivo: parsed.data.motivo || null,
    });

    if (error) {
      console.error("[excluir conta] DB error:", error);
      return NextResponse.json({ error: "Erro ao solicitar exclusão." }, { status: 500 });
    }

    // Audit log
    auditLog({
      user_id: user.id,
      acao: "solicitar_exclusao_conta",
      detalhes: { excluir_em: excluirEm.toISOString(), motivo: parsed.data.motivo || null },
      ip_address: ip,
      user_agent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      message: "Solicitação registrada. Seus dados serão excluídos em até 15 dias.",
      excluir_em: excluirEm.toISOString(),
    }, { status: 201 });
  } catch (err) {
    console.error("[excluir conta]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ── DELETE: Cancelar solicitação de exclusão ────────────
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { error } = await supabase
      .from("exclusao_conta")
      .update({ status: "cancelado" })
      .eq("user_id", user.id)
      .eq("status", "pendente");

    if (error) {
      console.error("[cancelar exclusão] DB error:", error);
      return NextResponse.json({ error: "Erro ao cancelar." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Solicitação de exclusão cancelada." });
  } catch (err) {
    console.error("[cancelar exclusão]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
