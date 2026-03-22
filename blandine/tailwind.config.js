/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PharmaSerene Dark Mode Color System
        
        // Base - Dark Mode
        "background": "#0D0F14",
        "on-background": "#FFFFFF",
        "surface": "#161820",
        "surface-secondary": "#1F2430",
        
        // Text Colors
        "on-surface": "#FFFFFF",
        "on-surface-variant": "#B3B9C4",
        "on-surface-tertiary": "#7D8491",
        
        // Primary - Green
        "primary": "#00D68F",
        "on-primary": "#000000",
        "primary-container": "#00A568",
        "on-primary-container": "#FFFFFF",
        
        // Secondary - Blue
        "secondary": "#4FACFE",
        "on-secondary": "#000000",
        "secondary-container": "#0060AC",
        "on-secondary-container": "#FFFFFF",
        
        // Accent Colors
        "accent-warning": "#FFB800",
        "accent-error": "#FF4D6D",
        "accent-user": "#4FACFE",
        
        // Error State
        "error": "#FF4D6D",
        "on-error": "#FFFFFF",
        "error-container": "#FFB5C1",
        "on-error-container": "#550015",
        
        // Tertiary (Guard/Service)
        "tertiary": "#FFB800",
        "on-tertiary": "#000000",
        "tertiary-container": "#FFE082",
        "on-tertiary-container": "#000000",
        
        // Outline & Borders
        "outline": "rgba(179, 185, 196, 0.24)",
        "outline-variant": "rgba(179, 185, 196, 0.12)",
        
        // Inverse
        "inverse-surface": "#FFFFFF",
        "inverse-on-surface": "#0D0F14",
        "inverse-primary": "#00D68F"
      },
      fontFamily: {
        "headline": ["Clash Display", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      backgroundColor: {
        "dark": "#0D0F14",
        "dark-surface": "#161820"
      }
    },
  },
  plugins: [],
  darkMode: "class"
}
