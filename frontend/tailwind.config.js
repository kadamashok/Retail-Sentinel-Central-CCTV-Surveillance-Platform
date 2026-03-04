/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        enterprise: {
          50: "#f5f7fa",
          100: "#e7edf5",
          200: "#cdd9e8",
          500: "#00a3ff",
          700: "#1f3a5f",
          900: "#14263e",
        },
        brand: {
          50: "#f5f7fa",
          100: "#e7edf5",
          500: "#00a3ff",
          700: "#1f3a5f",
          900: "#14263e",
        },
        accent: "#00a3ff",
        status: {
          healthy: "#16a34a",
          warning: "#f59e0b",
          offline: "#dc2626",
        },
      }
    }
  },
  plugins: []
};
