import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
  formatZodError,
} from "@/lib/security";

// ── Schema ─────────────────────────────────────────────
const consentimentoSchema = z.object({
  tipo: z.string().min(1, "Tipo de consentimento obrigatório").max(100),
  versao: z.string().min(1, "Versão do termo obrigatória").max(20),
  aceito: z.boolean(),
});

// ── POST: Registrar consentimento LGPD ─────────────────
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`consent:${ip}`, RATE_LIMITS.general);
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
    const parsed = consentimentoSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { tipo, versao, aceito } = parsed.data;

    const { error } = await supabase.from("consentimentos").insert({
      user_id: user.id,
      tipo,
      versao_termo: versao,
      aceito,
      ip_address: ip,
      user_agent: req.headers.get("user-agent") ?? null,
    });

    if (error) {
      console.error("[consentimento] DB error:", error);
      return NextResponse.json({ error: "Erro ao registrar consentimento." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[consentimento]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ── GET: Listar consentimentos do usuário ──────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("consentimentos")
      .select("tipo, versao_termo, aceito, ip_address, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar consentimentos." }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[consentimento GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
