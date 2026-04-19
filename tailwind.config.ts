import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { 50: "#FDF8F0", 100: "#F9EDDB", 200: "#F0DDB8" },
        terra: { 50: "#FDF3EE", 100: "#F9DDD0", 200: "#F0B99E", 300: "#E4956D", 400: "#D4784A", 500: "#C2703E", 600: "#A85A30", 700: "#8B4728", 800: "#6E3720", 900: "#522B19" },
        sage: { 50: "#F3F6F1", 100: "#DFE8DA", 200: "#BFD0B6", 300: "#98B38C", 400: "#7A9A6E", 500: "#5E7D54", 600: "#496342", 700: "#3B4F36", 800: "#2F3F2B", 900: "#263224" },
        bark: { 50: "#F7F3EE", 100: "#EBE2D6", 200: "#D4C4AD", 300: "#B89F7E", 400: "#A18460", 500: "#8A6D4A", 600: "#6E553A", 700: "#574330", 800: "#46362A", 900: "#2C2418" },
        sand: { 50: "#F9F7F3", 100: "#F0ECE4", 200: "#E0D7C8", 300: "#CBBFA8", 400: "#B5A689" },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;