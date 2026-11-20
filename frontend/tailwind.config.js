/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentiment: {
          positive: "#10B981", // Emerald green
          "positive-light": "#ECFDF5",
          neutral: "#64748B",  // Slate blue-grey
          "neutral-light": "#F1F5F9",
          negative: "#EF4444", // Coral red
          "negative-light": "#FEF2F2"
        },
        navy: {
          800: "#1E293B",
          900: "#0F172A",
          950: "#090D16"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
