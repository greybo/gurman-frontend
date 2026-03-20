/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f1fe',
          100: '#e0e2fc',
          200: '#c1c4f9',
          300: '#a2a7f6',
          400: '#838af3',
          500: '#646cef',
          600: '#4f56e0',
          700: '#4349c7',
          800: '#383da2',
          900: '#2d3181',
        },
      },
    },
  },
  plugins: [],
}
