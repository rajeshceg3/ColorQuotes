/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        'quote-lg': ['2.5rem', { lineHeight: '1.4' }],
        'quote-md': ['2.2rem', { lineHeight: '1.4' }],
        'quote-sm': ['1.8rem', { lineHeight: '1.4' }],
        'attrib-lg': ['1.2rem', { lineHeight: '1.4' }],
        'attrib-md': ['1.1rem', { lineHeight: '1.4' }],
        'attrib-sm': ['1.0rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}
