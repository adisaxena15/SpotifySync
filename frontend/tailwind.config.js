/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'noir': ['Noir','sans-serif'],
      },
      boxShadow:{
        'custom-red': '2px 4px 15px 1px rgba(255, 0, 0, 0.7)',
        'custom-green':'2px 4px 15px 1px #1DB954'
      },
    },
  },
  plugins: [],
}

