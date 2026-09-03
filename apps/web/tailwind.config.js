/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          'Source Serif 4',
          'EB Garamond',
          'Cormorant Garamond',
          'Spectral',
          'Georgia',
          'serif',
        ],
        display: ['Fraunces', 'Cormorant Garamond', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        parchment: {
          50: '#fdfaf3',
          100: '#f7eed8',
          200: '#ecd9a8',
          300: '#dcb878',
          400: '#c69755',
        },
        ink: {
          50: '#f5f1e8',
          900: '#1c1814',
          950: '#0d0a08',
        },
        ember: {
          400: '#c43d3d',
          600: '#7c1f1f',
          800: '#4a0e0e',
        },
      },
      animation: {
        'ink-drip': 'ink-drip 0.6s ease-out forwards',
        'page-turn': 'page-turn 0.8s ease-in-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'reveal-up': 'reveal-up 0.5s ease-out forwards',
        'typewriter': 'typewriter 1.2s steps(40) forwards',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        'ink-drip': {
          '0%': { transform: 'translateY(-100%) scaleY(0)', opacity: '0' },
          '60%': { transform: 'translateY(0) scaleY(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(0) scaleY(1)', opacity: '1' },
        },
        'page-turn': {
          '0%': { transform: 'rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
