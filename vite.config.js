import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/src/data/')) {
            return 'game-data';
          }
          if (id.includes('/src/systems/audioSystem')) {
            return 'audio';
          }
          if (id.includes('/src/systems/')) {
            return 'game-systems';
          }
          if (id.includes('/src/context/reducers/')) {
            return 'game-reducers';
          }
          if (id.includes('/src/context/')) {
            return 'game-context';
          }
          if (id.includes('/src/assets/art/')) {
            return 'art-assets';
          }
          if (id.includes('/src/hooks/')) {
            return 'game-hooks';
          }
          if (id.includes('/src/utils/')) {
            return 'game-utils';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,svg,mp3,ogg,wav}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      manifest: {
        name: 'Spire Ascent - Deck Building Roguelike',
        short_name: 'Spire Ascent',
        description: 'A dark fantasy deck-building roguelike',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    testTimeout: 30000,
    hookTimeout: 30000,
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        'src/assets/**',
        'scripts/**',
        '**/*.config.js',
      ],
      thresholds: {
        statements: 25,
        branches: 20,
        functions: 38,
        lines: 22,
      },
    },
  },
})
