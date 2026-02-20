/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 完全對齊 Web 版 color tokens
        primary: {
          DEFAULT: '#D97398',
          light: '#F5E6ED',
          dark: '#B85A7F',
        },
        background: {
          primary: '#faf5f0',
          secondary: '#FCF7F2',
          tertiary: '#F2F0EE',
        },
        text: {
          primary: '#2D2D2D',
          secondary: '#666666',
          tertiary: '#999999',
        },
        border: '#E5E5E5',
      },
    },
  },
  plugins: [],
}
