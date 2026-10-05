/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Bricolage carries the headlines and prices; Inter does the quiet work.
        display: ['"Bricolage Grotesque"', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'blob': 'blob 7s infinite',
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
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      colors: {
        // The logo is a blue lozenge with a green leaf, so blue leads and the
        // green is kept back for eco/safety claims only. Supporting hues are
        // sampled from the product photography itself.
        primary: {
          50: '#eff5ff',
          100: '#dbe8fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#6095fa',
          500: '#3b73f6',
          600: '#1757d1', // logo blue
          700: '#1a48b4',
          800: '#1b3f92',
          900: '#1c3a76',
          950: '#0a1b3d',
        },
        // Glass cleaner cyan
        secondary: {
          50: '#ecfbff',
          100: '#d4f4ff',
          200: '#b2ecff',
          300: '#7de2ff',
          400: '#3fcdfa',
          500: '#15b0e6',
          600: '#03a0d2',
          700: '#0a7ba6',
          800: '#116488',
          900: '#145371',
          950: '#053549',
        },
        // Dish wash / phenyl gold
        accent: {
          50: '#fffaeb',
          100: '#fff2c6',
          200: '#ffe388',
          300: '#ffcf4a',
          400: '#ffba20',
          500: '#f99c07',
          600: '#e09400',
          700: '#b86a04',
          800: '#95530b',
          900: '#7b450c',
          950: '#472301',
        },
        // The logo leaf. Reserved for eco, safety and in-stock signals.
        leaf: {
          50: '#f0fdf1',
          100: '#ddfbe0',
          200: '#bcf5c3',
          300: '#87ec96',
          400: '#4bda62',
          500: '#3dbe3d',
          600: '#189f2f',
          700: '#167d28',
          800: '#176325',
          900: '#155121',
          950: '#052e0f',
        },
        // Sweep cleaner clay
        clay: {
          50: '#fdf4f3',
          100: '#fce7e4',
          200: '#fbd3ce',
          300: '#f7b4ab',
          400: '#f08879',
          500: '#e4604e',
          600: '#c73f2d',
          700: '#b03a33',
          800: '#8e3229',
          900: '#772f27',
          950: '#401511',
        },
        ink: '#0a1b3d',
        surface: '#f4f7fb',
      },
    },
  },
  plugins: [typography],
};
