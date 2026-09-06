/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#120F0D',
        panel: '#1B1613',
        ash: '#C9C2B8',
        'ash-dim': '#8A8378',
        ember: '#C81E3A',
        'ember-dim': '#7A1425',
        rust: '#D97A34',
        signal: '#3FB8AF',
        gold: '#E8B23D',
        legend: '#9A3A9F',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
