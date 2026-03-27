import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "renankz@gmail.com";

const adminSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Verificar se é o admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Buscar empresas com email via SQL
  const { data: empresas, error } = await adminSupabase
    .from("empresas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Buscar emails de auth.users
  const { data: usersData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  if (usersData?.users) {
    usersData.users.forEach((u) => { emailMap[u.id] = u.email ?? ""; });
  }

  const result = (empresas ?? []).map((e: Record<string, unknown>) => ({
    ...e,
    user_email: emailMap[e.user_id as string] ?? "",
  }));

  // Buscar contagem de visitantes (page_views)
  const { count: visitantes } = await adminSupabase
    .from("page_views")
    .select("*", { count: "exact", head: true });

  // Contagem por período
  const hoje = new Date().toISOString().slice(0, 10);
  const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const mesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { count: novosHoje } = await adminSupabase
    .from("empresas").select("*", { count: "exact", head: true })
    .gte("created_at", `${hoje}T00:00:00Z`);

  const { count: novosSemana } = await adminSupabase
    .from("empresas").select("*", { count: "exact", head: true })
    .gte("created_at", semanaAtras);

  const { count: novosMes } = await adminSupabase
    .from("empresas").select("*", { count: "exact", head: true })
    .gte("created_at", mesAtras);

  return NextResponse.json({
    empresas: result,
    stats: {
      visitantes: visitantes ?? 0,
      novosHoje: novosHoje ?? 0,
      novosSemana: novosSemana ?? 0,
      novosMes: novosMes ?? 0,
    },
  });
}
