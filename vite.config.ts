import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Needed for GitHub Pages: repo is at /inventory-pwa/
  base: "/inventory-pwa/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "GCSS Technician",
        short_name: "GCSS Tech",
        // Start & scope under the repo path so PWA works from GitHub Pages
        start_url: "/inventory-pwa/",
        scope: "/inventory-pwa/",
        display: "standalone",
        background_color: "#111827",
        theme_color: "#111827",
        icons: [
          {
            // IMPORTANT: no leading slash, so this resolves to
            // /inventory-pwa/icons/... on GitHub Pages
            src: "icons/gcss-icon-light-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icons/gcss-icon-light-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
