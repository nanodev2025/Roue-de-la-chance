/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'game': ['Fredoka One', 'Baloo 2', 'Comic Neue', 'sans-serif'],
        'body': ['Nunito', 'sans-serif'],
      },
      colors: {
        'game': {
          'pink': '#FF6B9D',
          'orange': '#FF9F43',
          'yellow': '#FECA57',
          'green': '#5CD85A',
          'teal': '#48DBFB',
          'blue': '#54A0FF',
          'purple': '#A29BFE',
          'red': '#FF6B6B',
        },
        'bg': {
          'primary': '#2D1B69',
          'secondary': '#462B9C',
          'card': '#3D2585',
        }
      },
      boxShadow: {
        'hard': '4px 4px 0px rgba(0, 0, 0, 0.3)',
        'hard-lg': '6px 6px 0px rgba(0, 0, 0, 0.3)',
        'hard-xl': '8px 8px 0px rgba(0, 0, 0, 0.4)',
        'inner-hard': 'inset 3px 3px 0px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
