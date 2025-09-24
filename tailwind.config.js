/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      screens: {
        'xs': '400px',
      },
      fontFamily: {
        'sans': ['WorkSans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
        'heading': ['Inter-Bold', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
      },
    },
  },
  plugins: [],
};
