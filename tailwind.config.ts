import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#22c55e", dark: "#15803d" } },
    },
  },
  plugins: [],
};
export default config;
