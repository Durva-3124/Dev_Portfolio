/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#800020',
        accentTint: '#c2274f',
        accentSecondary: '#e0b878',
        backgroundDark: '#0d0709',
        backgroundLight: '#fbf6f4',
        surface: 'rgba(255,255,255,0.04)',
        textLight: '#1a0d10',
        textDark: '#f5efe9'
      },
      fontFamily: {
        heading: ['Sora', 'Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 20px rgba(194,39,79,0.25)',
        glowGold: '0 0 20px rgba(224,184,120,0.25)'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(194,39,79,0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(194,39,79,0.5)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite'
      },
      backdropBlur: {
        xs: '2px'
      },
      opacity: {
        '2': '0.02',
        '3': '0.03',
        '4': '0.04'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      }
    }
  },
  plugins: []
}
