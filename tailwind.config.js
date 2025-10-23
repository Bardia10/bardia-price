/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    // "./فرانت.tsx"  // ❌ only include if this file really exists
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "ui-sans-serif", "system-ui"],
      },
      screens: {
        'xs': '400px', // Custom breakpoint for smaller mobile devices
        // sm: '640px' (default)
        // md: '768px' (default)
        // lg: '1024px' (default)
      },
    },
  },
  plugins: [],
};
