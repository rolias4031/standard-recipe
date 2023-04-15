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
        smoke: 'rgb(237, 237, 237)',
        dust: 'rgb(247, 247, 247)',
      },
    },
  },
  plugins: [],
};
