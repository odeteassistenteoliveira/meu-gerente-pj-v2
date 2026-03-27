import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "renankz@gmail.com";

const adminSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { empresa_id, plano, lead_status, observacoes, proximo_contato, reset_mensagens } = body;

  if (!empresa_id) return NextResponse.json({ error: "empresa_id required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (plano !== undefined) updates.plano = plano;
  if (lead_status !== undefined) updates.lead_status = lead_status;
  if (observacoes !== undefined) updates.observacoes = observacoes;
  if (proximo_contato !== undefined) updates.proximo_contato = proximo_contato || null;
  if (reset_mensagens) updates.total_mensagens = 0;

  const { error } = await adminSupabase
    .from("empresas")
    .update(updates)
    .eq("id", empresa_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
