/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '.dark'],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--mf-color-primary-rgb) / <alpha-value>)',
        default: 'rgb(var(--mf-text-default-rgb) / <alpha-value>)',
        'mf-page': 'rgb(var(--mf-page-bg-rgb) / <alpha-value>)',
      },
      textColor: {
        primary: 'rgb(var(--mf-color-primary-rgb) / <alpha-value>)',
        default: 'rgb(var(--mf-text-default-rgb) / <alpha-value>)',
      }
    },
  },
  plugins: [],
  prefix: 'tw-',
  important: '.mf-hl-tailwind-scope', // Encapsulate Tailwind CSS into this selector, to avoid conflicts with host or other micro-frontends
}
