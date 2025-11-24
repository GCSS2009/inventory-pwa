import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/inventory-pwa/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "GCSS Inventory",
        short_name: "GCSS Inventory",
        start_url: "/inventory-pwa/",
        display: "standalone",
        background_color: "#111827",
        theme_color: "#111827",
        icons: [
          {
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
