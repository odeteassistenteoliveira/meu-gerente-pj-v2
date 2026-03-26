import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Meu Gerente PJ — Consultor Financeiro com IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #1e3060 50%, #0f1d36 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "100px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#93c5fd", fontSize: "14px", fontWeight: 600 }}>
            IA com 20+ anos de experiência · CEA & CFP · MBA Finanças
          </span>
        </div>

        {/* Logo box */}
        <div
          style={{
            width: "72px",
            height: "72px",
            background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: 900,
            color: "white",
            marginBottom: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          GP
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "60px",
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          Meu Gerente PJ
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "26px",
            color: "#93c5fd",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "48px",
          }}
        >
          Consultor financeiro com IA para pequenas empresas
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["Simule crédito", "Compare taxas", "Invista o caixa"].map((f) => (
            <div
              key={f}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "100px",
                padding: "10px 24px",
                color: "white",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "rgba(147,197,253,0.5)",
            fontSize: "16px",
          }}
        >
          meu-gerente-pj.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
