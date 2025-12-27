/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Classic Dogecoin colors
        doge: {
          50: '#fffef7',
          100: '#fffceb',
          200: '#fff7d1',
          300: '#ffed9c',
          400: '#ffd700', // Classic Dogecoin gold
          500: '#ffb347', // Dogecoin orange
          600: '#ff8c00', // Darker orange
          700: '#ff6b35', // Vibrant orange
          800: '#e55a2b',
          900: '#c04423',
        },
        // Dogecoin accent colors
        shiba: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fbd7ac',
          300: '#f8ba77',
          400: '#f59440',
          500: '#ff6b35',
          600: '#e55a2b',
          700: '#c04423',
          800: '#9d3822',
          900: '#7f301f',
        },
        // Blockchain/tech colors
        chain: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Legacy support
        dogecoin: '#FFC107',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'doge-sparkle': 'dogeSparkle 2s ease-in-out infinite',
        'doge-glow': 'dogeGlow 3s ease-in-out infinite alternate',
        'much-wow': 'muchWow 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        dogeSparkle: {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)',
            filter: 'brightness(1)',
          },
          '50%': { 
            transform: 'scale(1.05) rotate(5deg)',
            filter: 'brightness(1.2)',
          },
        },
        dogeGlow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            filter: 'brightness(1)',
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
            filter: 'brightness(1.1)',
          },
        },
        muchWow: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1) rotate(2deg)' },
          '50%': { transform: 'scale(1.05) rotate(-1deg)' },
          '75%': { transform: 'scale(1.1) rotate(1deg)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};
