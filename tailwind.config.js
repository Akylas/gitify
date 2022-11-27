const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          sidebar: '#24292e',
          dark: '#161b22',
          darker: '#090E15',
          darkest: '#000209',
        },
        primary: '#203354',
        success: '#2CC966',
        info: '#8BA9C6',
        warning: '#FCAA67',
        danger: '#B7524F',
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '&::-webkit-scrollbar': {
            display: 'none',
          }
        },
        '.top-84px': {
          top: '84px'
        },
        '.bottom-52px': {
          bottom: '52px'
        },
        '.blur-mini': {
          filter: 'blur(2px)'
        },
      })
    })
  ],
}
