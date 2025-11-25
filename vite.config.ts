import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Vite config for GCSS Inventory PWA
export default defineConfig({
  plugins: [react()],
  // Your GitHub Pages URL is /inventory-pwa/
  base: "./",
  build: {
    // Build directly into /docs so GitHub Pages can serve it
    outDir: "docs",
    // Clear docs/ before each build so old junk doesn't hang around
    emptyOutDir: true,
  },
});
