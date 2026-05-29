/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D55FF',
          light: '#E8ECFF',
          dark: '#1E3FCC',
        },
        // Alias used in legacy page components
        brand: {
          DEFAULT: '#2D55FF',
          light: '#E8ECFF',
          dark: '#1E3FCC',
        },
        dark: '#1A1A2E',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(45,85,255,0.10), 0 1px 3px 0 rgba(0,0,0,0.06)',
        modal: '0 20px 60px -10px rgba(0,0,0,0.18)',
        dropdown: '0 8px 24px -4px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.15s ease-out',
      },
    },
  },
  plugins: [],
};
