// /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* 🎨 Colors */
      colors: {
        primary: "#2563eb",
        "primary-hover": "#1d4ed8",

        bg: {
          body: "#f8fafc",
          card: "#ffffff",
        },

        text: {
          main: "#1e293b",
          muted: "#64748b",
        },

        border: "#e2e8f0",
      },

      /* 🔤 Font */
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      /* 📏 Container */
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1200px",
        },
      },

      /* 🔲 Border Radius */
      borderRadius: {
        lg: "24px",
        md: "12px",
      },

      /* 🌑 Shadows */
      boxShadow: {
        sm: "0 4px 6px rgba(0,0,0,0.05)",
        lg: "0 10px 25px rgba(0,0,0,0.05)",
      },

      /* 🎞 Animations */
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [],
};