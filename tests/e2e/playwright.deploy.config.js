import { defineConfig } from '@playwright/test';

/**
 * Playwright config for deploy smoke tests against the live GitHub Pages URL.
 * No webServer — tests run against the already-deployed site.
 *
 * Usage:
 *   DEPLOY_URL=https://stuarthaigh.github.io/spire-clone/ npm run test:deploy-smoke
 *   npm run test:deploy-smoke  (uses default URL)
 */
export default defineConfig({
  testDir: './specs',
  testMatch: 'deploy-smoke.spec.js',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.DEPLOY_URL || 'https://stuarthaigh.github.io/spire-clone/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // No webServer — we're testing the live deployment
});
