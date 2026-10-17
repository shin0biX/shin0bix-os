import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps the build portable — it works from any static host,
// any subdirectory, GitHub Pages included.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5175 },
  preview: { port: 4175 },
});
