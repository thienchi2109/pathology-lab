import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel color palette
        primary: {
          DEFAULT: "#93C5FD", // Soft Blue (blue-300)
          foreground: "#1F2937",
        },
        secondary: {
          DEFAULT: "#C4B5FD", // Lavender (purple-300)
          foreground: "#1F2937",
        },
        success: {
          DEFAULT: "#86EFAC", // Mint Green (green-300)
          foreground: "#1F2937",
        },
        warning: {
          DEFAULT: "#FED7AA", // Peach (orange-300)
          foreground: "#1F2937",
        },
        error: {
          DEFAULT: "#FCA5A5", // Soft Rose (red-300)
          foreground: "#1F2937",
        },
        background: "#FAFAFA", // Off-white (gray-50)
        surface: "#FFFFFF",
        text: {
          primary: "#1F2937", // Charcoal (gray-800)
          secondary: "#6B7280", // Slate (gray-500)
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
