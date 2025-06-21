/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {

        oswald: ['Oswald', 'sans-serif'],

        bebas: ['"Bebas Neue"', "cursive"],
        roboto: ["Roboto", "sans-serif"],

      },
    },
  },
  plugins: [],
}
