/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '-0.01em',
        wide: '0.02em',
        wider: '0.05em',
      },
      colors: {
        'ive-blue-1': '#007aff',
        'ive-blue-2': '#5ac8fa',
        'ive-green-1': '#34c759',
        'ive-green-2': '#a4e8b3',
        'ive-indigo-1': '#5856d6',
        'ive-indigo-2': '#aabbee',
        'ive-orange-1': '#ff9500',
        'ive-orange-2': '#ffcc80',
        'ive-pink-1': '#ff2d55',
        'ive-pink-2': '#ffadbc',
        'ive-purple-1': '#af52de',
        'ive-purple-2': '#d9a8f5',
        'ive-red-1': '#ff3b30',
        'ive-red-2': '#ffb2aa',
        'ive-teal-1': '#5ac8fa',
        'ive-teal-2': '#a7e5f8',
        'ive-yellow-1': '#ffcc00',
        'ive-yellow-2': '#ffe580',
        'muted-dark-canvas': '#2C3E50', // Added new color
      },
      fontSize: {
        'quote-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        'quote-md': ['2.0rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        'quote-sm': ['1.6rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'attrib-lg': ['1.1rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'attrib-md': ['1.0rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'attrib-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}
