/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', maxHeight: '0', marginBottom: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', maxHeight: '100px', marginBottom: '1.5rem', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', maxHeight: '100px', marginBottom: '1.5rem', transform: 'translateY(0)' },
          '100%': { opacity: '0', maxHeight: '0', marginBottom: '0', transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-out': 'fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
