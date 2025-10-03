/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soonish Brand Colors
        'twilight': {
          50: '#f4f1fb',
          100: '#e9e2f6',
          200: '#d7c9ee',
          300: '#c0a6e2',
          400: '#a47dd3',
          500: '#6C4AB6', // Primary brand color
          600: '#5d3e9c',
          700: '#4f3382',
          800: '#422c6b',
          900: '#372658',
        },
        'sky': {
          50: '#f0f8ff',
          100: '#e0f1ff',
          200: '#bae5ff',
          300: '#7dd4ff',
          400: '#4DA6FF', // Secondary color
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'coral': {
          50: '#fff5f4',
          100: '#ffe9e7',
          200: '#ffd7d3',
          300: '#ffb8b1',
          400: '#ff8a7f',
          500: '#FF6F61', // Accent color
          600: '#f04438',
          700: '#d92d20',
          800: '#b42318',
          900: '#912018',
        },
        'mint': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#A8E6CF', // Supportive color
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'lunar': {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e7e7e7',
          300: '#D9D9D9', // Neutral background/support
          400: '#c1c1c1',
          500: '#a8a8a8',
          600: '#8f8f8f',
          700: '#767676',
          800: '#5d5d5d',
          900: '#444444',
        },
        // Keep existing color mappings for compatibility
        primary: {
          50: '#f4f1fb',
          100: '#e9e2f6',
          200: '#d7c9ee',
          300: '#c0a6e2',
          400: '#a47dd3',
          500: '#6C4AB6',
          600: '#5d3e9c',
          700: '#4f3382',
          800: '#422c6b',
          900: '#372658',
        },
        secondary: {
          50: '#f0f8ff',
          100: '#e0f1ff',
          200: '#bae5ff',
          300: '#7dd4ff',
          400: '#4DA6FF',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fff5f4',
          100: '#ffe9e7',
          200: '#ffd7d3',
          300: '#ffb8b1',
          400: '#ff8a7f',
          500: '#FF6F61',
          600: '#f04438',
          700: '#d92d20',
          800: '#b42318',
          900: '#912018',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}
