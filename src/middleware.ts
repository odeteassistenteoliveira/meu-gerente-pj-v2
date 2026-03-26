import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Todos os planos têm acesso a todos os módulos.
// O controle de uso (limite de mensagens) é feito na API /api/registrar-mensagem.

// Grace period: dias após vencimento antes do corte
const GRACE_PERIOD_DAYS = 7;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const rotasProtegidas = ["/dashboard", "/calculadora", "/taxas", "/credito", "/bancario", "/investimentos"];
  const rotasLivres = ["/login", "/cadastro", "/completar-perfil", "/upgrade", "/perfil", "/plano-expirado"];
  const estaEmRotaProtegida = rotasProtegidas.some((r) => pathname.startsWith(r));
  const estaEmRotaLivre = rotasLivres.some((r) => pathname.startsWith(r));

  if (estaEmRotaProtegida && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/cadastro") && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && estaEmRotaProtegida) {
    const { data: empresa } = await supabase
      .from("empresas")
      .select("perfil_completo, plano, plano_status, plano_validade")
      .eq("user_id", user.id)
      .single();

    if (empresa && empresa.perfil_completo === false) {
      const completarPerfilUrl = request.nextUrl.clone();
      completarPerfilUrl.pathname = "/completar-perfil";
      return NextResponse.redirect(completarPerfilUrl);
    }

    if (empresa) {
      const plano = empresa.plano ?? "starter";
      const planoStatus = empresa.plano_status ?? "ativo";

      if (planoStatus === "inadimplente" && plano !== "starter") {
        const validade = empresa.plano_validade ? new Date(empresa.plano_validade) : null;
        const agora = new Date();

        if (validade) {
          const limiteGrace = new Date(validade);
          limiteGrace.setDate(limiteGrace.getDate() + GRACE_PERIOD_DAYS);

          if (agora > limiteGrace && pathname !== "/dashboard") {
            const expiradoUrl = request.nextUrl.clone();
            expiradoUrl.pathname = "/plano-expirado";
            return NextResponse.redirect(expiradoUrl);
          }
        }
      }

      if (planoStatus === "cancelado" && plano !== "starter") {
        if (pathname !== "/dashboard") {
          const expiradoUrl = request.nextUrl.clone();
          expiradoUrl.pathname = "/plano-expirado";
          return NextResponse.redirect(expiradoUrl);
        }
      }

    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|public/).*)",
  ],
};
