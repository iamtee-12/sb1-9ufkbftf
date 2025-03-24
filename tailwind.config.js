/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },
      colors: {
        'sage': {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cddccd',
          300: '#b4cab4',
          400: '#9bb89b',
          500: '#82a682',
          600: '#688568',
          700: '#4f644f',
          800: '#354335',
          900: '#1a221a',
        },
      },
    },
  },
  plugins: [],
};