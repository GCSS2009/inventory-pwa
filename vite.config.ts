import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Vite config for GCSS Inventory PWA
export default defineConfig({
  plugins: [react()],
  // Important for GitHub Pages:
  // repo is gcss2009.github.io/inventory-pwa
  base: "/inventory-pwa/",
  build: {
    // Build directly into /docs so GitHub Pages can serve it
    outDir: "docs",
    // Clear docs/ before each build so old junk doesn't hang around
    emptyOutDir: true,
  },
});
