import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// `npm run dev:https` runs with --mode https, which turns on a self-signed cert
// so phones on the same Wi-Fi can use the camera (browsers require HTTPS for it).
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode === 'https' && basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg'],
      manifest: {
        name: 'JMU LEAP',
        short_name: 'LEAP',
        description: 'Break out of your comfort zone during FROG Week.',
        theme_color: '#2e8b3e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ].filter(Boolean),
  // React + Supabase + router is ~590 kB minified; fine for a hackathon PWA.
  build: { chunkSizeWarningLimit: 700 },
}));
