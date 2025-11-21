import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/gcss-icon-maskable-192.png",
        "icons/gcss-icon-maskable-512.png",
        "icons/gcss-icon-192.png",
        "icons/gcss-icon-512.png"
      ],
      manifest: {
        name: "GCSS Technician",
        short_name: "GCSS Tech",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#111827",
        background_color: "#111827",
        icons: [
          {
            src: "/icons/gcss-icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/gcss-icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/gcss-icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/gcss-icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
});
