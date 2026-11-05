import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#F8F4EC",
          50: "#FCFAF6",
          100: "#F8F4EC",
          200: "#F1E9DB",
          300: "#E8DCBE",
        },
        sand: {
          DEFAULT: "#E9DCCB",
          light: "#F4EDE3",
          dark: "#D7C3AA",
          muted: "#C5AE92",
        },
        terracotta: {
          DEFAULT: "#B97968",
          light: "#CE9788",
          dark: "#995C4D",
          hover: "#A66757",
        },
        sage: {
          DEFAULT: "#A3AA8C",
          light: "#C0C6AC",
          dark: "#848C6B",
          muted: "#6B7354",
        },
        espresso: {
          DEFAULT: "#453C35",
          light: "#635850",
          muted: "#8A7D73",
          border: "#D6CCC2",
          dark: "#2A231E",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(69, 60, 53, 0.05), 0 2px 6px -1px rgba(69, 60, 53, 0.03)",
        "warm-lg": "0 10px 30px -4px rgba(69, 60, 53, 0.08), 0 4px 12px -2px rgba(69, 60, 53, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;

