/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark purple + emerald night — the background never brightens.
        canvas: '#05060d',
        card: '#0d1122',
        ink: '#ECEBFF',
        subtle: '#C9C7EE',
        muted: '#9B98C8',
        faint: '#6A6796',
        line: '#20233f',
        // Accent palette: violet/plum + emerald/teal, plus status hues.
        accent: {
          violet: '#a78bfa',
          plum: '#7c3aed',
          indigo: '#818cf8',
          emerald: '#34d399',
          teal: '#2dd4bf',
          mint: '#5eead4',
          blue: '#60a5fa',
          amber: '#fbbf24',
          gold: '#fde08a',
          rose: '#fb7185',
          slate: '#94a3b8',
        },
      },
      fontFamily: {
        // Unbounded — the distinctive geometric display face for the wordmark,
        // section titles and the big stat numbers.
        display: ['Unbounded', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px -8px rgba(124,58,237,0.7)',
        card: '0 10px 40px -20px rgba(0,0,0,0.85)',
      },
    },
  },
  plugins: [],
}
