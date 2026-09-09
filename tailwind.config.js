/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#1F1712',
        charcoal: '#2C241D',
        cocoa: '#57493B',
        taupe: '#8A7A66',
        parchment: '#F3EBDD',
        cream: '#FAF5EA',
        sand: '#EBDFC9',
        line: '#E3D6BF',
        clay: '#D9A982',
        claylight: '#F0DAC6',
        terracotta: {
          DEFAULT: '#BF5B2D',
          dark: '#A34A22',
        },
        ember: '#C2471B',
        leaf: '#3E7A4E',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 70px -24px rgba(31,23,18,.35)',
        card: '0 10px 40px -14px rgba(31,23,18,.22)',
        pop: '0 6px 18px -6px rgba(31,23,18,.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      letterSpacing: {
        mega: '0.22em',
      },
      spacing: {
        '4.5': '1.125rem',
        '9.5': '2.375rem',
        '13': '3.25rem',
      },
    },
  },
  plugins: [],
}
