import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * VITE CONFIGURATION (Senior Tier)
 * --------------------------------
 * Optimized for performance and full PWA support (Apple Home Screen compatible).
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/*.png'],
      manifest: {
        name: 'Toptan Ambalajcım',
        short_name: 'Toptan Ambalaj',
        description: 'Ambalajda Güvenilir Çözüm Ortağınız',
        theme_color: '#ffffff',
        background_color: '#f7f5f2',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
