import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ctq: {
          blue: '#2B6CA3',
          'blue-dark': '#295380',
          'blue-light': '#3D9BE9',
          red: '#A32B2B',
        },
        tesla: {
          red: '#A32B2B',
          'red-dark': '#7a1f1f',
          'red-light': '#c43535',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
