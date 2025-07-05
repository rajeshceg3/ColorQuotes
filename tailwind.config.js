/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-blue-1': '#E3F2FD',
        'pastel-blue-2': '#BBDEFB',
        'pastel-blue-3': '#90CAF9',
        'pastel-pink-1': '#FCE4EC',
        'pastel-pink-2': '#F8BBD9',
        'pastel-pink-3': '#F48FB1',
        'pastel-purple-1': '#F3E5F5',
        'pastel-purple-2': '#E1BEE7',
        'pastel-purple-3': '#CE93D8',
        'pastel-green-1': '#E8F5E8',
        'pastel-green-2': '#C8E6C9',
        'pastel-green-3': '#A5D6A7',
        'pastel-yellow-1': '#FFF8E1',
        'pastel-yellow-2': '#FFECB3',
        'pastel-yellow-3': '#FFE082',
      },
      fontSize: {
        'quote-sm': '1.8rem',
        'attrib-sm': '1rem',
        'quote-md': '2.2rem',
        'attrib-md': '1.1rem',
        'quote-lg': '2.5rem',
        'attrib-lg': '1.2rem'
      },
    },
  },
  plugins: [],
}
