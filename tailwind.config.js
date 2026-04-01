/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kraft: {
          50:  '#fdf8f0',
          100: '#f9eed8',
          200: '#f2d9a8',
          300: '#e8be70',
          400: '#d9a04a',
          500: '#c4872e',
          600: '#a46b20',
          700: '#86521a',
          800: '#6b3f17',
          900: '#573414',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
