import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm earthy color palette inspired by Flowbite design
        primary: {
          50: "#FDF8F3",
          100: "#F9EDE3",
          200: "#F3DCC8",
          300: "#E8C9A8",
          400: "#D4A574",
          500: "#C08552", // Main warm brown
          600: "#A66D3F",
          700: "#8B5A34",
          800: "#6B4528",
          900: "#4A3020",
        },
        dark: {
          100: "#6B6B6B",
          200: "#555555",
          300: "#444444",
          400: "#363636",
          500: "#2C2C2C",
          600: "#242424",
          700: "#1C1C1C",
          800: "#151515",
          900: "#0A0A0A",
        },
        cream: {
          50: "#FFFCF8",
          100: "#FDF8F3",
          200: "#F9F1E8",
          300: "#F5E6D8",
          400: "#EDDCC9",
          500: "#E8D4C0",
        },
        sand: {
          50: "#FEFDFB",
          100: "#FCF9F4",
          200: "#F7F0E5",
          300: "#EFE4D4",
          400: "#E5D5C0",
          500: "#D9C5AA",
        },
        olive: {
          50: "#F8F9F3",
          100: "#EEF1E4",
          200: "#DEE3CD",
          300: "#C8D0AD",
          400: "#B0BC8B",
          500: "#8B9A6D",
        },
        accent: {
          peach: "#E8A87C",
          coral: "#D4856A",
          sage: "#9DB17C",
          dusty: "#C5A3A3",
          terracotta: "#C67B5C",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
