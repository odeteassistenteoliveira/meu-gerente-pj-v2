import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIP, rateLimitHeaders, RATE_LIMITS } from "@/lib/security";

const LIMITE_STARTER = 10;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rl = checkRateLimit(`registrar-mensagem:${ip}`, RATE_LIMITS.general);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }

    const { data: empresa, error } = await supabase
      .from("empresas")
      .select("plano, total_mensagens")
      .eq("user_id", user.id)
      .single();

    if (error || !empresa) {
      return NextResponse.json({ error: "empresa não encontrada" }, { status: 404 });
    }

    const plano = empresa.plano ?? "starter";

    // Planos pagos: ilimitado
    if (plano !== "starter") {
      return NextResponse.json({ ok: true, remaining: -1 });
    }

    // Starter: verificar limite
    const total = empresa.total_mensagens ?? 0;

    if (total >= LIMITE_STARTER) {
      return NextResponse.json(
        { ok: false, error: "limite_atingido", remaining: 0 },
        { status: 403 }
      );
    }

    // Incrementar contador
    const { error: updateError } = await supabase
      .from("empresas")
      .update({ total_mensagens: total + 1 })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "erro ao atualizar contador" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, remaining: LIMITE_STARTER - (total + 1) });
  } catch (err) {
    console.error("[registrar-mensagem]", err);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
