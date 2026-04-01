/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./src/app/components/**/*.{html,ts}",
    "./src/app/pages/**/*.{html,ts}",
  ],
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  theme: {
    extend: {},
  },
  plugins: [],
}
