import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
  decrypt,
} from "@/lib/security";

// Campos sensíveis que precisam ser descriptografados
const SENSITIVE_FIELDS = ["cnpj", "cpf_socio"];

// ── GET: Exportar todos os dados do usuário (LGPD — portabilidade) ─
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`export:${ip}`, RATE_LIMITS.checkout); // Restritivo como checkout
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar todos os dados do usuário em paralelo
    const [empresaRes, consentimentosRes, sessaoRes, mensagemRes] = await Promise.all([
      supabase.from("empresas").select("*").eq("user_id", user.id),
      supabase.from("consentimentos").select("*").eq("user_id", user.id),
      supabase.from("sessoes").select("*").eq("empresa_id", user.id).limit(100),
      // Mensagens via sessão (indiretamente ligadas ao user)
      supabase.from("mensagens").select("*").limit(500),
    ]);

    // Descriptografar campos sensíveis da empresa
    const empresas = (empresaRes.data ?? []).map((e: Record<string, unknown>) => {
      const decrypted = { ...e };
      for (const field of SENSITIVE_FIELDS) {
        if (decrypted[field] && typeof decrypted[field] === "string") {
          decrypted[field] = decrypt(decrypted[field] as string);
        }
      }
      return decrypted;
    });

    const exportData = {
      _meta: {
        exportado_em: new Date().toISOString(),
        formato: "JSON",
        versao: "1.0",
        descricao: "Exportação completa dos seus dados — Meu Gerente PJ (LGPD Art. 18)",
      },
      usuario: {
        id: user.id,
        email: user.email,
        criado_em: user.created_at,
      },
      empresas,
      consentimentos: consentimentosRes.data ?? [],
      sessoes: sessaoRes.data ?? [],
    };

    // Retornar como download JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="meus-dados-meugerentepj-${new Date().toISOString().split("T")[0]}.json"`,
        ...rateLimitHeaders(rl),
      },
    });
  } catch (err) {
    console.error("[exportar dados]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
