import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2563EB", // EduConnect Blue
          hover: "#1D4ED8",
          light: "#EFF6FF",
          foreground: "#FFFFFF",
        },
        navy: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        teacher: {
          DEFAULT: "#6366F1",
          light: "#EEF2FF",
          foreground: "#FFFFFF",
        },
        student: {
          DEFAULT: "#10B981",
          light: "#ECFDF5",
          foreground: "#FFFFFF",
        },
        parent: {
          DEFAULT: "#F59E0B",
          light: "#FFFBEB",
          foreground: "#FFFFFF",
        },
        admin: {
          DEFAULT: "#EF4444",
          light: "#FEF2F2",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "1.25rem",
        md: "0.875rem",
        sm: "0.625rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "4xl": "3rem",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(3deg)" },
        },
        "orb-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        "path-flow": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "orb-spin": "orb-spin 25s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "path-flow": "path-flow 3s linear infinite",
      },
      boxShadow: {
        "glass": "0 20px 50px rgba(0, 0, 0, 0.06), 0 10px 20px rgba(37, 99, 235, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
        "glass-hover": "0 30px 60px rgba(37, 99, 235, 0.15), 0 12px 24px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)",
        "liquid-button": "0 10px 25px -5px rgba(37, 99, 235, 0.35), 0 4px 10px -2px rgba(0, 0, 0, 0.05)",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "60px",
      },
    },
  },
  plugins: [],
};

export default config;
