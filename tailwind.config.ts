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
        border: "#DCE5E4",
        input: "#DCE5E4",
        ring: "#0B4F4B",
        background: "#F5F7F8",
        cream: "#FBF7EE",
        surface: "#FFFFFF",
        foreground: "#102A2A",
        primary: {
          DEFAULT: "#0F5C5A", // Deep Teal (Main Brand)
          hover: "#083F3D",   // Dark Teal
          dark: "#083F3D",
          light: "#2A8C84",  // Secondary Teal
          soft: "#F2FAF8",
          foreground: "#FFFFFF",
        },
        home: {
          DEFAULT: "#0F5C5A",
          hover: "#083F3D",
          dark: "#083F3D",
          accent: "#2A8C84",
          light: "#F2FAF8",
          tint: "#E6F0EF",
          border: "#DCE5E4",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F2C14E", // Golden Yellow
          hover: "#E0B03C",
          light: "#FBF7EE",
          foreground: "#102A2A",
        },
        teal: {
          50: "#F0F7F6",
          100: "#DCE5E4",
          200: "#B8CBC9",
          300: "#8FAEA9",
          400: "#5D8C86",
          500: "#2A8C84",
          600: "#0F5C5A",
          700: "#0B4F4B",
          800: "#083F3D",
          900: "#052C2A",
          950: "#031B1A",
        },
        navy: {
          900: "#102A2A",
          800: "#183B3B",
          700: "#5D7373",
        },
        learner: {
          DEFAULT: "#3157D5",
          hover: "#243B9B",
          dark: "#243B9B",
          accent: "#667EEA",
          light: "#F3F6FF",
          tint: "#EFF6FF",
          border: "#BFDBFE",
          foreground: "#FFFFFF",
        },
        educator: {
          DEFAULT: "#16805B",
          hover: "#0D5C41",
          dark: "#0D5C41",
          accent: "#35A979",
          emerald: "#16805B",
          light: "#F0FAF5",
          tint: "#DCFCE7",
          border: "#A7F3D0",
          foreground: "#FFFFFF",
        },
        slate: {
          50: "#F5F7F8",
          100: "#EBF0F0",
          200: "#DCE5E4",
          300: "#B9C7C5",
          400: "#8FA3A1",
          500: "#5D7373",
          600: "#445959",
          700: "#2B4040",
          800: "#1A3030",
          900: "#102A2A",
          950: "#071B1B",
        },
        teacher: {
          DEFAULT: "#16805B",
          hover: "#0D5C41",
          dark: "#0D5C41",
          accent: "#35A979",
          light: "#F0FAF5",
          tint: "#DCFCE7",
          border: "#A7F3D0",
          foreground: "#FFFFFF",
        },
        student: {
          DEFAULT: "#3157D5",
          hover: "#243B9B",
          dark: "#243B9B",
          accent: "#667EEA",
          light: "#F3F6FF",
          tint: "#EFF6FF",
          border: "#BFDBFE",
          foreground: "#FFFFFF",
        },
        admin: {
          DEFAULT: "#073F3C",
          light: "#F0F7F6",
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
