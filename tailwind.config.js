/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tuf: {
          yellow: '#FFB800',
          orange: '#FF8A00',
          dark: '#0B0D11',
          panel: '#13171F',
          card: '#1A1F2B',
          border: '#2A3244',
          gray: '#8C9BAE',
          accent: '#00E5FF'
        }
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace', 'Courier New']
      },
      boxShadow: {
        'tuf-glow': '0 0 25px rgba(255, 184, 0, 0.25)',
        'tuf-border': '0 0 10px rgba(255, 184, 0, 0.15)'
      }
    },
  },
  plugins: [],
}
