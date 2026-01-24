/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/data/*.json",
  ],
  safelist: [
    // Directions
    'bg-gradient-to-t',
    'bg-gradient-to-tr',
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'bg-gradient-to-b',
    'bg-gradient-to-bl',
    'bg-gradient-to-l',
    'bg-gradient-to-tl',

    // Colors - From
    'from-ive-blue-1', 'from-ive-blue-2',
    'from-ive-green-1', 'from-ive-green-2',
    'from-ive-indigo-1', 'from-ive-indigo-2',
    'from-ive-orange-1', 'from-ive-orange-2',
    'from-ive-pink-1', 'from-ive-pink-2',
    'from-ive-purple-1', 'from-ive-purple-2',
    'from-ive-red-1', 'from-ive-red-2',
    'from-ive-teal-1', 'from-ive-teal-2',
    'from-ive-yellow-1', 'from-ive-yellow-2',

    // Colors - Via
    'via-ive-blue-1', 'via-ive-blue-2',
    'via-ive-green-1', 'via-ive-green-2',
    'via-ive-indigo-1', 'via-ive-indigo-2',
    'via-ive-orange-1', 'via-ive-orange-2',
    'via-ive-pink-1', 'via-ive-pink-2',
    'via-ive-purple-1', 'via-ive-purple-2',
    'via-ive-red-1', 'via-ive-red-2',
    'via-ive-teal-1', 'via-ive-teal-2',
    'via-ive-yellow-1', 'via-ive-yellow-2',

    // Colors - To
    'to-ive-blue-1', 'to-ive-blue-2',
    'to-ive-green-1', 'to-ive-green-2',
    'to-ive-indigo-1', 'to-ive-indigo-2',
    'to-ive-orange-1', 'to-ive-orange-2',
    'to-ive-pink-1', 'to-ive-pink-2',
    'to-ive-purple-1', 'to-ive-purple-2',
    'to-ive-red-1', 'to-ive-red-2',
    'to-ive-teal-1', 'to-ive-teal-2',
    'to-ive-yellow-1', 'to-ive-yellow-2',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
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
        'glass-border': 'rgba(255, 255, 255, 0.2)',
        'glass-surface': 'rgba(255, 255, 255, 0.1)',
      },
      fontSize: {
        'quote-hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'quote-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'quote-md': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'quote-sm': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'attrib-lg': ['1.1rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'attrib-md': ['1rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'attrib-sm': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      screens: {
        'xs': '480px',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 20px 40px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
        'glass-pro': '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'glow': '0 0 40px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
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
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
    },
  },
  plugins: [],
}
