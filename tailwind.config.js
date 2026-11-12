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
        // Primary Brand - Deep Industrial Blue Foundation
        brand: {
          950: '#0E1F2B',
          900: '#17364A', // Deep Industrial Blue
          850: '#23455C',
          800: '#34566D', // Steel Blue
          700: '#4B6C83',
          600: '#607D90', // Industrial Slate
          500: '#7894A7',
          400: '#94ABBD',
          300: '#B5C5D3',
          200: '#D2DDE6',
          100: '#E8EEF3',
          50: '#F4F7F9',
        },
        // Controlled Brand Accent - Refined Natural Flame & Amber
        flame: {
          950: '#3D1606',
          900: '#6E280C',
          800: '#A84A22', // Burnt Orange
          700: '#C8572A',
          600: '#E56B35', // Natural Flame Orange
          500: '#F3A34A', // Natural Amber
          400: '#F7BC72',
          300: '#FBD59E',
          200: '#FDE7C7',
          100: '#FEF3E3',
          50: '#FFFBF5',
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
        // Layered Neutral Canvas & Card Surfaces (Government Light & Slate Dark)
        canvas: {
          light: '#F3F1EC', // Soft natural canvas (no pure-white glare)
          dark: '#192630',  // Layered slate-navy
        },
        surface: {
          cardLight: '#FBFAF7',
          cardDark: '#223440',
          elevatedLight: '#FFFFFF',
          elevatedDark: '#2B3F4C',
          subtleLight: '#EBE8E1',
          subtleDark: '#1D2D38',
          borderLight: '#E7E8E5',
          borderDark: '#3B4F5C',
          textPrimaryLight: '#344454',
          textMutedLight: '#71808C',
          textPrimaryDark: '#EDF1F3',
          textMutedDark: '#B3C0C9',
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
