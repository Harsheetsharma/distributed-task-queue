/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "../../packages/**/*.{js,ts,jsx,tsx}", // optional: if you use shared UI code
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
