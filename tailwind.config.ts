/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jost)", "sans-serif"],
      },
      colors: {
        // Custom color palette
        "primary-green": "#006341", // Pantone 3425 C
        "light-gray": "#E5E1E6", // Pantone 4505 C 70%
        "dark-green": "#18332F", // Pantone 5467 C
        gold: "#998542", // Pantone 4505 C
        "dark-brown": "#998542", // Pantone 448 C
        "accent-green": "#006341", // Pantone 3425 C (same as primary-green)

        // Material Design 3 colors
        surface: {
          DEFAULT: "rgb(var(--md-surface) / <alpha-value>)",
          "container-low": "rgb(var(--md-surface-container-low) / <alpha-value>)",
          "container-lowest": "rgb(var(--md-surface-container-lowest) / <alpha-value>)",
          "container": "rgb(var(--md-surface-container) / <alpha-value>)",
          "container-high": "rgb(var(--md-surface-container-high) / <alpha-value>)",
          "container-highest": "rgb(var(--md-surface-container-highest) / <alpha-value>)",
        },
        "on-surface": {
          DEFAULT: "rgb(var(--md-on-surface) / <alpha-value>)",
          variant: "rgb(var(--md-on-surface-variant) / <alpha-value>)",
        },
        "secondary-container": "rgb(var(--md-secondary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--md-on-secondary-container) / <alpha-value>)",
        outline: {
          DEFAULT: "rgb(var(--md-outline) / <alpha-value>)",
          variant: "rgb(var(--md-outline-variant) / <alpha-value>)",
        },

        // Theme colors mapping
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          primary: {
            DEFAULT: "hsl(var(--sidebar-primary))",
            foreground: "hsl(var(--sidebar-primary-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--sidebar-accent))",
            foreground: "hsl(var(--sidebar-accent-foreground))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "elevation-1": "var(--md-shadow-1)",
        "elevation-2": "var(--md-shadow-2)",
        "elevation-3": "var(--md-shadow-3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

