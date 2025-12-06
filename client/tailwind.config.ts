import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eefaff",
          100: "#d7f2ff",
          200: "#b3e9ff",
          300: "#85ddff",
          400: "#58d0ff",
          500: "#2ac1ff",
          600: "#12a7e6",
          700: "#0b85b8",
          800: "#0f6b91",
          900: "#134f6a",
        },
        gradient: {
          start: "#A3D8FF",
          mid: "#80ED99",
          end: "#F7E987",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
