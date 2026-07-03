/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind where to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      // ── TransitOps Brand Colors ──────────────────────────────
      colors: {
        primary:   "#1D9E75", // Main green
        secondary: "#0A1628", // Deep navy sidebar
        status: {
          active:  "#1D9E75", // Active routes/buses
          delayed: "#EF9F27", // Delayed indicator
          critical:"#D85A30", // Critical alerts
        },
        surface: {
          DEFAULT: "#0F1E35", // Dark card backgrounds
          light:   "#162438", // Slightly lighter surface
          border:  "#1E3048", // Subtle border tone
        },
      },

      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      // ── Sidebar width token ──────────────────────────────────
      width: {
        sidebar: "260px",
      },
    },
  },

  plugins: [],
};
