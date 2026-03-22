/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 - PharmaSerene Color System
        "on-surface-variant": "#3d4a43",
        "surface-variant": "#e0e3e5",
        "tertiary": "#556158",
        "on-secondary-fixed-variant": "#004883",
        "surface-dim": "#d8dadc",
        "tertiary-container": "#89958b",
        "surface-tint": "#006c51",
        "on-primary-fixed-variant": "#00513c",
        "primary-fixed": "#7af9cc",
        "tertiary-fixed": "#d9e6da",
        "surface": "#f7f9fb",
        "on-error": "#ffffff",
        "on-secondary-container": "#003e73",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#002116",
        "primary-container": "#00a67e",
        "surface-container-low": "#f2f4f6",
        "tertiary-fixed-dim": "#bdcabe",
        "on-tertiary-fixed": "#131e17",
        "inverse-on-surface": "#eff1f3",
        "surface-bright": "#f7f9fb",
        "inverse-primary": "#5bdcb0",
        "secondary": "#0060ac",
        "on-primary": "#ffffff",
        "on-surface": "#191c1e",
        "secondary-fixed-dim": "#a4c9ff",
        "on-tertiary-fixed-variant": "#3e4a41",
        "error-container": "#ffdad6",
        "primary-fixed-dim": "#5bdcb0",
        "on-tertiary-container": "#222d26",
        "on-primary-container": "#003224",
        "on-secondary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "secondary-container": "#68abff",
        "secondary-fixed": "#d4e3ff",
        "primary": "#006c51",
        "outline": "#6d7a73",
        "inverse-surface": "#2d3133",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "on-secondary-fixed": "#001c39",
        "background": "#f7f9fb",
        "on-background": "#191c1e",
        "outline-variant": "#bccac2",
        "error": "#ba1a1a",
        "surface-container-highest": "#e0e3e5",
        "on-error-container": "#93000a"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      }
    },
  },
  plugins: [],
}
