/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f1fb',
          100: '#b5d4f4',
          200: '#85b7eb',
          300: '#559ae2',
          400: '#2e82d9',
          500: '#185fa5',
          600: '#124d88',
          700: '#0d3a6b',
          800: '#08284e',
          900: '#031530',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
