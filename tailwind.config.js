/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f8f8',
          100: '#efefef',
          200: '#dcdcdc',
          300: '#bdbdbd',
          400: '#989898',
          500: '#7c7c7c',
          600: '#656565',
          700: '#525252',
          800: '#464646',
          900: '#3d3d3d',
          950: '#292929',
        },
        gold: {
          50: '#fdfce9',
          100: '#fbf8c4',
          200: '#f8f18c',
          300: '#f3e449',
          400: '#edcf18',
          500: '#d7b00e',
          600: '#ba870a',
          700: '#94610c',
          800: '#7a4d11',
          900: '#684014',
          950: '#3d2107',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
