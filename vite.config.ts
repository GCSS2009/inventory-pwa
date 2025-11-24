import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isNative = process.env.BUILD_TARGET === 'native';

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: /inventory-pwa/
  // For Capacitor APK: ./ so assets resolve under file://
  base: isNative ? './' : '/inventory-pwa/',
  build: {
    outDir: isNative ? 'dist' : 'docs',
  },
});
