// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {}, // Tailwind v4 साठी हे नाव वापरणे अनिवार्य आहे
    autoprefixer: {},           // वेगवेगळ्या ब्राउझरमध्ये CSS नीट चालण्यासाठी
  },
}