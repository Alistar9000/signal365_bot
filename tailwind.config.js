/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e9faf5",
          100: "#c9f3e5",
          200: "#98e8cd",
          300: "#60d9b3",
          400: "#2cc79b",
          500: "#00b894",
          600: "#009d7f",
          700: "#008269",
          800: "#076451",
          900: "#0a4e40",
        },
        ink: "#0f172a",
        muted: "#64748b",
        canvas: "#f4f7f9",
      },
      fontFamily: {
        sans: ["vazirmatn", "shabnam", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px -4px rgba(15,23,42,.12)",
        float: "0 18px 40px -18px rgba(15,23,42,.35)",
        brand: "0 10px 24px -10px rgba(0,184,148,.55)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s ease-out both",
        "fade-in": "fade-in .3s ease-out both",
        "slide-up": "slide-up .35s cubic-bezier(.22,1,.36,1) both",
        pop: "pop .25s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
