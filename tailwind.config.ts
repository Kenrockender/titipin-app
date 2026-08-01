import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          600: "#2563EB",
          700: "#1D4ED8"
        },
        ink: "#1c1917",
        muted: "#57534e",
        faint: "#78716c",
        cream: "#faf9f7",
        // --- Luxury theme (onyx + gold) ---
        onyx: {
          DEFAULT: "#0A0A0A",
          2: "#141414",
          3: "#1F1F1F"
        },
        gold: {
          DEFAULT: "#D4AF37",
          2: "#BF953F",
          3: "#FCF6BA"
        },
        luxurytext: "#F5F5F0",
        luxurymuted: "#9A9A95"
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06), 0 8px 24px -12px rgba(0,0,0,.12)",
        goldglow: "0 0 30px -8px rgba(212,175,55,.45)"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        marquee: "marquee 32s linear infinite"
      }
    }
  },
  plugins: []
};
export default config;
