module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edubot: {
          dark: '#122144',
          orange: '#f17e22',
          green: '#0ea78b',
          soft: '#f39647',
          teal: '#1e605e',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
