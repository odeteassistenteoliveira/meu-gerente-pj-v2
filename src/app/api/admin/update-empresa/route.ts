import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "renankz@gmail.com";
const PLANOS_PAGOS = ["essencial", "profissional", "pro"];

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

  // Buscar plano atual para detectar churn
  const { data: atual } = await adminSupabase
    .from("empresas")
    .select("plano")
    .eq("id", empresa_id)
    .single();

  const updates: Record<string, unknown> = {};
  if (plano !== undefined) {
    updates.plano = plano;
    const planoAtual = atual?.plano ?? "starter";
    const eraPago = PLANOS_PAGOS.includes(planoAtual);
    const virandoStarter = plano === "starter";
    const virandoPago = PLANOS_PAGOS.includes(plano) && planoAtual === "starter";

    // Churn: era pago e voltando para starter
    if (eraPago && virandoStarter) {
      updates.churned_at = new Date().toISOString();
      updates.plano_anterior = planoAtual;
      updates.lead_status = "perdido";
    }

    // Reativação: era starter (churned) e voltando a pagar
    if (virandoPago && atual?.plano === "starter") {
      updates.churned_at = null;
    }
  }

  if (lead_status !== undefined) updates.lead_status = lead_status;
  if (observacoes !== undefined) updates.observacoes = observacoes;
  if (proximo_contato !== undefined) updates.proximo_contato = proximo_contato || null;
  if (reset_mensagens) updates.total_mensagens = 0;

  const { error } = await adminSupabase
    .from("empresas")
    .update(updates)
    .eq("id", empresa_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, churned: !!(updates.churned_at) });
}
