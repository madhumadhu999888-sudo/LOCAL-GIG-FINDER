/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",
          accent: "#f97316",
        },
      },
    },
  },
  plugins: [],
};
