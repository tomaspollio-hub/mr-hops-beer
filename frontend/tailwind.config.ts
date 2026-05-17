import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Mr. Hops Beer
        hops: {
          black:    '#0a0a0a',
          dark:     '#111111',
          card:     '#141414',
          border:   '#222222',
          green:    '#7EC825',
          'green-light': '#96d93a',
          'green-dark':  '#65a01e',
          gold:     '#F5C518',
          'gold-light':  '#f7d04a',
          'gold-dark':   '#c9a010',
          yellow:   '#FFD600',
          white:    '#f5f5f5',
          muted:    '#777777',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'Arial Narrow', 'Arial', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hops-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
