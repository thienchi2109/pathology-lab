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
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shake": "shake 0.5s ease-in-out",
        "gradient": "gradient 15s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundSize: {
        "gradient": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
