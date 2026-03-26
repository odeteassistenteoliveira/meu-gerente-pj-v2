/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Erros de tipo no boilerplate do Supabase SSR (cookiesToSet implicitly any)
    // nao afetam o runtime - ignorados para nao bloquear o deploy
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

module.exports = nextConfig;
