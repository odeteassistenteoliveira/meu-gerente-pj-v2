import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9eaff",
          200: "#bbdbff",
          300: "#8ec4ff",
          400: "#59a1ff",
          500: "#2e7aff",
          600: "#1a5ef5",
          700: "#1347e1",
          800: "#1B2A4A", // azul escuro principal
          900: "#1a2942",
          950: "#111827",
        },
        success: "#27AE60",
        warning: "#E67E22",
        danger:  "#E74C3C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
