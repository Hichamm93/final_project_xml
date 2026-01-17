/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 30px rgba(255,0,0,0.25)"
      }
    }
  },
  plugins: []
};
