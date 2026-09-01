/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1F3A5F',
        accent: '#F2A93B',
        brick: '#C15F3C',
        paper: '#F7F3EC',
        ink: '#26241F',
        stone: '#DDD5C7',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
