module.exports = {
  content: [
    "./node_modules/flowbite-react/lib/**/*.js",
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: { 
          100: '#d0d7de', 
          500: '#24292f', 
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
}
