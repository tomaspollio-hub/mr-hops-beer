import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hops: {
          black:         '#0C0C10',
          dark:          '#111118',
          card:          '#18181E',
          raised:        '#1E1E26',
          border:        '#32323E',
          'border-subtle': '#252530',
          green:         '#64B831',
          'green-light': '#78D23A',
          'green-dark':  '#4A8A22',
          gold:          '#D4900E',
          'gold-light':  '#E8A820',
          'gold-dark':   '#B87A0C',
          yellow:        '#F0B800',
          white:         '#EDEDF2',
          muted:         '#8A8A98',
          subtle:        '#56566A',
          error:         '#E5484D',
          success:       '#30BD71',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'Arial Narrow', 'Arial', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hops-gradient': 'linear-gradient(135deg, #0C0C10 0%, #18181E 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
