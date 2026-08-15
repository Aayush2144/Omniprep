/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        surfaceHover: '#1e293b',
        surfaceBorder: '#1e293b',
        gate: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4338ca',
          glow: 'rgba(99, 102, 241, 0.25)'
        },
        academic: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#047857',
          glow: 'rgba(16, 185, 129, 0.25)'
        },
        job: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
          glow: 'rgba(245, 158, 11, 0.25)'
        },
        english: {
          light: '#fb7185',
          DEFAULT: '#f43f5e',
          dark: '#be123c',
          glow: 'rgba(244, 63, 94, 0.25)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-gate': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-academic': '0 0 25px rgba(16, 185, 129, 0.35)',
        'glow-job': '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-english': '0 0 25px rgba(244, 63, 94, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
