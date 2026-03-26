import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// -- Mapa de acesso: quais modulos cada plano libera
const MODULOS_POR_PLANO: Record<string, string[]> = {
  starter:      ["/dashboard", "/calculadora", "/bancario"],
  pro:          ["/dashboard", "/calculadora", "/bancario", "/credito", "/taxas"],
  essencial:    ["/dashboard", "/calculadora", "/bancario", "/credito", "/taxas", "/investimentos"],
  profissional: ["/dashboard", "/calculadora", "/bancario", "/credito", "/taxas", "/investimentos"],
};

// Grace period: dias apos vencimento antes do corte
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

  // Refresh da sessao
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas que requerem login
  const rotasProtegidas = ["/dashboard", "/calculadora", "/taxas", "/credito", "/bancario", "/investimentos"];
  const rotasLivres = ["/login", "/cadastro", "/completar-perfil", "/upgrade", "/perfil", "/plano-expirado"];
  const estaEmRotaProtegida = rotasProtegidas.some((r) => pathname.startsWith(r));
  const estaEmRotaLivre = rotasLivres.some((r) => pathname.startsWith(r));

  // 1. Redireciona para login se nao autenticado
  if (estaEmRotaProtegida && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Se ja logado e tentando acessar login/cadastro, redireciona para dashboard
  if ((pathname === "/login" || pathname === "/cadastro") && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Verificar perfil completo + plano para rotas protegidas
  if (user && estaEmRotaProtegida) {
    const { data: empresa } = await supabase
      .from("empresas")
      .select("perfil_completo, plano, plano_status, plano_validade")
      .eq("user_id", user.id)
      .single();

    // 3a. Perfil incompleto
    if (empresa && empresa.perfil_completo === false) {
      const completarPerfilUrl = request.nextUrl.clone();
      completarPerfilUrl.pathname = "/completar-perfil";
      return NextResponse.redirect(completarPerfilUrl);
    }

    if (empresa) {
      const plano = empresa.plano ?? "starter";
      const planoStatus = empresa.plano_status ?? "ativo";

      // 3b. Plano inadimplente - checar grace period
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

      // 3c. Plano cancelado tentando acessar modulo pago
      if (planoStatus === "cancelado" && plano !== "starter") {
        if (pathname !== "/dashboard") {
          const expiradoUrl = request.nextUrl.clone();
          expiradoUrl.pathname = "/plano-expirado";
          return NextResponse.redirect(expiradoUrl);
        }
      }

      // 3d. Gate de features por plano
      if (planoStatus === "ativo" || planoStatus === "pendente") {
        const modulosLiberados = MODULOS_POR_PLANO[plano] ?? MODULOS_POR_PLANO.starter;
        const tentandoAcessar = rotasProtegidas.find((r) => pathname.startsWith(r));

        if (tentandoAcessar && !modulosLiberados.includes(tentandoAcessar)) {
          const upgradeUrl = request.nextUrl.clone();
          upgradeUrl.pathname = "/upgrade";
          upgradeUrl.searchParams.set("modulo", tentandoAcessar.replace("/", ""));
          return NextResponse.redirect(upgradeUrl);
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
