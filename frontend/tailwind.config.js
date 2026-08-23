export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        theme: {
          50: 'rgb(var(--color-theme-50) / <alpha-value>)',
          100: 'rgb(var(--color-theme-100) / <alpha-value>)',
          200: 'rgb(var(--color-theme-200) / <alpha-value>)',
          300: 'rgb(var(--color-theme-300) / <alpha-value>)',
          400: 'rgb(var(--color-theme-400) / <alpha-value>)',
          500: 'rgb(var(--color-theme-500) / <alpha-value>)',
          600: 'rgb(var(--color-theme-600) / <alpha-value>)',
          700: 'rgb(var(--color-theme-700) / <alpha-value>)',
          800: 'rgb(var(--color-theme-800) / <alpha-value>)',
          900: 'rgb(var(--color-theme-900) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}
