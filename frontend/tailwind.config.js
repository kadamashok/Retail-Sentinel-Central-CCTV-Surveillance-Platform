/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecf4f3",
          100: "#d9e8e6",
          500: "#1f6f78",
          700: "#14444a",
          900: "#0d2d31"
        },
        accent: "#e77f2f"
      }
    }
  },
  plugins: []
};
