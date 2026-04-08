import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        mist: "#f4f7fb",
        accent: "#1f7ae0",
        accentSoft: "#dcecff",
        success: "#1c9d66",
        danger: "#d14343",
        warning: "#d68c19",
        sand: "#f8efe2"
      },
      boxShadow: {
        card: "0 10px 30px rgba(24,33,47,0.08)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
