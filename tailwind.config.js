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
        'muted-dark-canvas': '#2C3E50',
      },
      fontSize: {
        'quote-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'quote-md': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'quote-sm': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'attrib-lg': ['1.1rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'attrib-md': ['1rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'attrib-sm': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 20px 40px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
