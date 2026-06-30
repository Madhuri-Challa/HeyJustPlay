/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./apps/**/*.{ts,tsx}", "./games/**/*.{ts,tsx}", "./packages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0a0f1f",
        panel: "#121a2d",
        line: "#26324f",
        mint: "#36d399",
        coral: "#fb7185",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(54, 211, 153, 0.18)",
      },
    },
  },
  plugins: [],
};
