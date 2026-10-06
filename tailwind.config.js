/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 500: '#dc2626', 600: '#b91c1c', 700: '#991b1b' }
      },
      boxShadow: {
        soft: '0 12px 35px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
