/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clb: {
          primary: '#0D47A1',
          primaryDeep: '#003178',
          navy: '#072252',
          orange: '#F36F21',
          orangeBright: '#FF7020',
          orangeDeep: '#E05D0E',
          surface: '#F7F9FC',
          ink: '#191C1E',
          muted: '#64748B',
          outlineC: '#CBD5E1',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          blueLight: '#D9E2FF',
          orangeLight: '#FFDBCC',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        card: '0 4px 16px -2px rgba(7, 34, 82, 0.06)',
      },
    },
  },
  plugins: [],
}
