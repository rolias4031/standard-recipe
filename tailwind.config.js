/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      height: {
        '90vh': '90vh',
      },
      colors: {
        abyss: '#262626',
        concrete: '#a3a3a3',
        smoke: 'rgb(240, 240, 240)',
        fern: '#047857',
        jungle: '#064e3b',
      },
      fontFamily: {
        mono: ['var(--font-roboto_mono)'],
      },
    },
  },
  plugins: [],
};
