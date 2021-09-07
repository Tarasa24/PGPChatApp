const colors = require('tailwindcss/colors')

const config = {
  mode: 'jit',
  purge: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
    },
    colors: {
      ...colors,

      // Light theme
      primaryLight: '#512da8',
      backgroundLight: '#ffffff',
      textLight: '#141414',
      borderLight: '#d9d9d9',

      // Dark theme
      primaryDark: '#b50000',
      backgroundDark: '#0e1111',
      textDark: '#ffffff',
      borderDark: '#3d3d3d',
    },
  },
  plugins: [],
}

module.exports = config
