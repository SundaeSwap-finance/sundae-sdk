module.exports = {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  plugins: [
    require("tailwindcss-radix")(),
    require("tailwindcss-animation-delay"),
    require("@tailwindcss/forms"),
  ],
};
