import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
  encrypt,
  decrypt,
  formatZodError,
} from "@/lib/security";

// ── Campos sensíveis que devem ser criptografados ──────
const SENSITIVE_FIELDS = ["cnpj", "cpf_socio"] as const;

// ── Schema de validação (campos básicos — completar-perfil) ──
const perfilBasicSchema = z.object({
  nome_fantasia: z.string().min(1, "Nome da empresa é obrigatório").max(200),
  cnpj: z.string().max(14).optional().nullable(),
  cpf_socio: z.string().max(11).optional().nullable(),
});

// ── Schema de criação (cadastro — insert) ──
const perfilCreateSchema = z.object({
  nome_fantasia: z.string().min(1).max(200),
  cnpj: z.string().max(14).optional().nullable(),
  cpf_socio: z.string().max(11).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  site_url: z.string().max(200).optional().nullable(),
  instagram: z.string().max(100).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().max(2).optional().nullable(),
  setor: z.string().max(50).optional().nullable(),
  faturamento_anual: z.number().optional().nullable(),
  regime_tributario: z.string().max(50).optional().nullable(),
  num_funcionarios: z.string().max(20).optional().nullable(),
  tem_contador: z.boolean().optional(),
  principais_desafios: z.array(z.string()).optional().nullable(),
  como_conheceu: z.string().max(100).optional().nullable(),
  plano: z.string().max(20).optional().default("starter"),
});

// ── Schema completo (perfil dashboard — todos os campos) ──
const perfilFullSchema = z.object({
  nome_fantasia: z.string().max(200).optional().nullable(),
  cnpj: z.string().max(14).optional().nullable(),
  cpf_socio: z.string().max(11).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().max(2).optional().nullable(),
  site_url: z.string().max(200).optional().nullable(),
  instagram: z.string().max(100).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  setor: z.string().max(50).optional().nullable(),
  faturamento: z.union([z.string(), z.number()]).optional().nullable(),
  regime: z.string().max(50).optional().nullable(),
  num_funcionarios: z.string().max(20).optional().nullable(),
  tem_contador: z.boolean().optional(),
  principais_desafios: z.array(z.string()).optional().nullable(),
});

// ── GET: Ler perfil (descriptografar campos sensíveis) ─
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`perfil:${ip}`, RATE_LIMITS.general);
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

    const { data: empresa, error } = await supabase
      .from("empresas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !empresa) {
      return NextResponse.json({ data: null });
    }

    // Descriptografar campos sensíveis (decrypt() trata texto puro transparentemente)
    const decrypted = { ...empresa };
    for (const field of SENSITIVE_FIELDS) {
      if (decrypted[field]) {
        decrypted[field] = decrypt(decrypted[field]);
      }
    }

    return NextResponse.json({ data: decrypted });
  } catch (err) {
    console.error("[perfil GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ── PUT: Atualizar perfil (criptografar campos sensíveis) ─
export async function PUT(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`perfil:${ip}`, RATE_LIMITS.general);
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

    // Validar input — tenta full schema primeiro, depois basic
    const rawBody = await req.json();
    const fullParsed = perfilFullSchema.safeParse(rawBody);
    const basicParsed = perfilBasicSchema.safeParse(rawBody);

    if (!fullParsed.success && !basicParsed.success) {
      return NextResponse.json(
        { error: formatZodError(basicParsed.error!) },
        { status: 400 }
      );
    }

    const data = fullParsed.success ? fullParsed.data : basicParsed.data!;

    // Montar objeto de update, criptografando campos sensíveis
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (SENSITIVE_FIELDS.includes(key as typeof SENSITIVE_FIELDS[number])) {
        updateData[key] = value ? encrypt(String(value)) : null;
      } else {
        updateData[key] = value;
      }
    }

    const { error } = await supabase
      .from("empresas")
      .update(updateData)
      .eq("user_id", user.id);

    if (error) {
      console.error("[perfil PUT] DB error:", error);
      return NextResponse.json({ error: "Erro ao salvar perfil." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error("[perfil PUT]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ── POST: Criar empresa (cadastro inicial — criptografar campos sensíveis) ─
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`perfil-create:${ip}`, RATE_LIMITS.general);
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

    // Validar input
    const rawBody = await req.json();
    const parsed = perfilCreateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    // Montar dados com criptografia para campos sensíveis
    const insertData: Record<string, unknown> = { user_id: user.id };
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;
      if (SENSITIVE_FIELDS.includes(key as typeof SENSITIVE_FIELDS[number])) {
        insertData[key] = value ? encrypt(String(value)) : null;
      } else {
        insertData[key] = value;
      }
    }

    const { error } = await supabase
      .from("empresas")
      .insert(insertData);

    if (error) {
      console.error("[perfil POST] DB error:", error);
      return NextResponse.json({ error: "Erro ao criar empresa." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201, headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error("[perfil POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
