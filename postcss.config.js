// PostCSS config — updated for Tailwind CSS v4
// Tailwind v4 moved its PostCSS integration to @tailwindcss/postcss
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // Tailwind v4 PostCSS plugin
    autoprefixer: {},           // Add vendor prefixes for browser compatibility
  },
};
