/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070d1a',
          900: '#0a1428',
          800: '#0f1d3a',
          700: '#16284f',
          600: '#1e3470',
          500: '#2a4590',
          400: '#3f5fb0',
          300: '#6b88d0',
          200: '#a3b6e3',
          100: '#d0dbf3',
          50: '#eef2fb',
        },
        amber: {
          600: '#c47817',
          500: '#e89020',
          400: '#f4a633',
          300: '#f8c06a',
          200: '#fcd79b',
          100: '#fde9c5',
          50: '#fef5e4',
        },
        ink: '#0a1428',
        paper: '#ffffff',
        slatey: '#5b6680',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(7,13,26,0.06), 0 8px 24px -12px rgba(7,13,26,0.18)',
        glow: '0 0 0 1px rgba(232,144,32,0.25), 0 8px 30px -8px rgba(232,144,32,0.35)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'route-dash': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'pulse-soft': 'pulse-soft 1.4s ease-in-out infinite',
        'route-dash': 'route-dash 1.2s linear infinite',
        'spin-slow': 'spin-slow 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
