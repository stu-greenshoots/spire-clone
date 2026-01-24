import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/spire-clone/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
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
