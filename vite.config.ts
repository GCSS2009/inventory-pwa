import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "/inventory-pwa/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
