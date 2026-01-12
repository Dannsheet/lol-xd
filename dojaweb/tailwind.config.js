/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'doja-bg': '#0B0F17',
        'doja-dark': '#121A26',
        'doja-cyan': '#8B5CF6',
        'doja-light-cyan': '#E9D5FF',
        'doja-white': '#fcfcfc',
      }
    },
  },
  plugins: [],
}
