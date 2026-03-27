import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "renankz@gmail.com";

const adminSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  // Verificar admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user_id, empresa_id } = await req.json();
  if (!user_id || !empresa_id) {
    return NextResponse.json({ error: "user_id e empresa_id são obrigatórios" }, { status: 400 });
  }

  // 1. Deletar registro de empresa
  const { error: errEmpresa } = await adminSupabase
    .from("empresas")
    .delete()
    .eq("id", empresa_id);

  if (errEmpresa) {
    return NextResponse.json({ error: errEmpresa.message }, { status: 500 });
  }

  // 2. Deletar usuário do auth
  const { error: errAuth } = await adminSupabase.auth.admin.deleteUser(user_id);

  if (errAuth) {
    // empresa já foi deletada, mas loga o erro de auth
    console.error("Erro ao deletar auth user:", errAuth.message);
    return NextResponse.json({ ok: true, warning: "Empresa deletada, mas erro ao remover auth: " + errAuth.message });
  }

  return NextResponse.json({ ok: true });
}
