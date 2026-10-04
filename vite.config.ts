import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Updates the app automatically
      includeAssets: ['favicon.png', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        // Keep the admin panel off the offline shell: it should always load
        // fresh from the network rather than out of the PWA cache.
        navigateFallbackDenylist: [/^\/admin/],
      },
      manifest: {
        name: 'Onium Store',
        short_name: 'Onium',
        description: 'Premium eco-friendly cleaning solutions for a safer home.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Hides the browser URL bar
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // You need to create this
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png', // You need to create this
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});