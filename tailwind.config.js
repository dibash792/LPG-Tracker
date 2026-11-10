/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#091821',
          900: '#0c222e',
          800: '#102B3A', // Primary Navy
          700: '#183c50',
          600: '#22516c',
          500: '#2e6b8e',
          100: '#e5eef3',
          50: '#f0f5f8',
        },
        teal: {
          900: '#0b4739',
          800: '#106450',
          700: '#158369',
          600: '#1aa383',
          500: '#20B894', // Fresh Teal
          400: '#3fcaa8',
          100: '#d7f7ef',
          50: '#eefbf7',
        },
        amber: {
          900: '#68400c',
          800: '#8e5610',
          700: '#b87015',
          600: '#dc871e',
          500: '#F2A94A', // Warm Amber
          400: '#f5bd6e',
          100: '#feeedb',
          50: '#fff7ed',
        },
        surface: {
          canvas: '#F1F4F7',
          card: '#FFFFFF',
          subtle: '#F8FAFC',
          border: '#E2E8F0',
          borderSubtle: '#EDF2F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 43, 58, 0.05), 0 1px 2px -1px rgba(16, 43, 58, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(16, 43, 58, 0.08), 0 2px 4px -2px rgba(16, 43, 58, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(16, 43, 58, 0.12), 0 8px 10px -6px rgba(16, 43, 58, 0.08)',
        'modal': '0 20px 40px -10px rgba(16, 43, 58, 0.25)',
      }
    },
  },
  plugins: [],
}

