/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        drought: {
          normal: '#10b981',    // Green
          watch: '#fbbf24',     // Yellow
          warning: '#f97316',   // Orange
          emergency: '#ef4444', // Red
        },
      },
    },
  },
  plugins: [],
}

