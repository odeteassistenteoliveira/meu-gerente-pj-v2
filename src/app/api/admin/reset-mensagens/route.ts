import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "renankz@gmail.com";

// Service role para bypassar RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Verifica que quem está chamando é o admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // 2. Lê o empresa_id do body
    const { empresa_id } = (await req.json()) as { empresa_id: string };

    if (!empresa_id) {
      return NextResponse.json({ error: "empresa_id obrigatório" }, { status: 400 });
    }

    // 3. Reseta o contador de mensagens
    const { error } = await supabaseAdmin
      .from("empresas")
      .update({ total_mensagens: 0 })
      .eq("id", empresa_id);

    if (error) {
      console.error("[reset-mensagens] DB error:", error);
      return NextResponse.json({ error: "Erro ao resetar contador" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-mensagens] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
