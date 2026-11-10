/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand - Deep Royal Navy
        brand: {
          950: '#071320',
          900: '#0D1E33',
          850: '#10243D',
          800: '#142C4B',
          700: '#1C3B63',
          600: '#254E83',
          500: '#3164A4',
          400: '#4A7FBF',
          300: '#7BA4D5',
          200: '#ADC8E8',
          100: '#DCE8F7',
          50: '#EFF5FB',
        },
        // Controlled Brand Accent - Refined Natural Flame (Orange / Ember / Coral)
        flame: {
          950: '#431407',
          900: '#7C2D12',
          800: '#9A3412',
          700: '#C2410C', // Deep Ember
          600: '#EA580C', // Vibrant Natural Flame
          500: '#F97316', // Radiant Warm Orange
          400: '#FB923C', // Warm Amber/Coral glow
          300: '#FDBA74',
          200: '#FED7AA',
          100: '#FFEDD5',
          50: '#FFF7ED',
        },
        // Semantic: Success (strictly for verified / matched states)
        statusSuccess: {
          bg: '#F0FDF4',
          border: '#BBF7D0',
          text: '#15803D',
          dot: '#16A34A',
          darkBg: '#052E16',
          darkBorder: '#14532D',
          darkText: '#86EFAC',
        },
        // Semantic: Warning (strictly for pending review / legitimate variance)
        statusWarning: {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          dot: '#D97706',
          darkBg: '#451A03',
          darkBorder: '#78350F',
          darkText: '#FDE68A',
        },
        // Semantic: Error (strictly for critical shortages / diversion / fraud)
        statusError: {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
          dot: '#DC2626',
          darkBg: '#450A0A',
          darkBorder: '#7F1D1D',
          darkText: '#FCA5A5',
        },
        // Semantic: Info / Transit
        statusInfo: {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
          dot: '#2563EB',
          darkBg: '#172554',
          darkBorder: '#1E3A8A',
          darkText: '#93C5FD',
        },
        // Layered Neutral Canvas & Card Surfaces (Light & Dark)
        canvas: {
          light: '#EDF1F6',
          dark: '#09121E',
        },
        surface: {
          cardLight: '#F8FAFC',
          cardDark: '#14253D',
          elevatedLight: '#FFFFFF',
          elevatedDark: '#1B304E',
          subtleLight: '#E8EEF5',
          subtleDark: '#0E1B2D',
          borderLight: '#D6DFE8',
          borderDark: '#223C5F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(13, 30, 51, 0.06), 0 1px 2px -1px rgba(13, 30, 51, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(13, 30, 51, 0.1), 0 2px 4px -2px rgba(13, 30, 51, 0.06)',
        'dropdown': '0 10px 25px -5px rgba(13, 30, 51, 0.18), 0 8px 10px -6px rgba(13, 30, 51, 0.12)',
        'modal': '0 25px 50px -12px rgba(7, 19, 32, 0.35)',
        'dark-card': '0 1px 3px 0 rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
