/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          purple: '#8B5CF6',
          blue: '#60A5FA',
        },
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: {
          dark: '#1E293B',
          gray: '#64748B',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        'glass': '12px',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
};