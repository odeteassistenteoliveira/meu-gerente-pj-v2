import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://meu-gerente-pj.vercel.app";

export const metadata: Metadata = {
  title: "Meu Gerente PJ — Consultor Financeiro IA",
  description:
    "Consultoria financeira inteligente para pequenas e médias empresas. Simule crédito, compare taxas, tire dúvidas bancárias e muito mais.",
  keywords: ["consultoria financeira", "PME", "IA", "taxas", "crédito", "pequena empresa"],
  manifest: "/manifest.json",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "Meu Gerente PJ — Consultor Financeiro IA",
    description:
      "Simule crédito, compare taxas, tire dúvidas bancárias e descubra onde investir o caixa. Sem viés de banco, disponível 24h.",
    url: APP_URL,
    siteName: "Meu Gerente PJ",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Meu Gerente PJ — Consultor Financeiro com IA para PMEs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meu Gerente PJ — Consultor Financeiro IA",
    description: "Simule crédito, compare taxas e tire dúvidas financeiras. IA com 20+ anos de experiência · CEA & CFP.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gerente PJ",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
