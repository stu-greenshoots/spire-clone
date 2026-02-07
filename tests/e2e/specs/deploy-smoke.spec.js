import { test, expect } from '@playwright/test';

/**
 * Deploy smoke tests — verify the live GitHub Pages build boots,
 * renders assets, and has accessible audio files.
 *
 * Run with: npm run test:deploy-smoke
 */
test.describe('Deploy Smoke Tests', () => {
  test('game boots and shows main menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=SPIRE ASCENT')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="btn-new-game"]')).toBeVisible();
  });

  test('character art loads (images render with non-zero dimensions)', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=SPIRE ASCENT').waitFor({ timeout: 15000 });

    // Start a new game to trigger asset loading
    await page.click('[data-testid="btn-new-game"]');

    // Wait for character selection or map nodes to appear
    // Character buttons use data-testid="btn-select-{character}" format
    const charSelect = page.locator('[data-testid^="btn-select-"]');
    const mapNodes = page.locator('[data-testid^="map-node-"]');
    await charSelect.first().or(mapNodes.first()).waitFor({ timeout: 15000 });

    // Check that images loaded with non-zero natural dimensions
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    // At least half the checked images should load successfully
    let loadedCount = 0;
    const checkCount = Math.min(count, 10);
    for (let i = 0; i < checkCount; i++) {
      const naturalWidth = await images.nth(i).evaluate(el => el.naturalWidth);
      if (naturalWidth > 0) loadedCount++;
    }
    expect(loadedCount).toBeGreaterThan(checkCount / 2);
  });

  test('audio files are accessible at deployed URL', async ({ page, baseURL }) => {
    // Check a sample of audio files are reachable (HTTP 200)
    // Audio files are in public/sounds/ directory
    const audioFiles = [
      'sounds/block_gain.mp3',
      'sounds/card_play.mp3',
      'sounds/music_combat.mp3',
      'sounds/enemy_attack.mp3',
    ];

    // Ensure baseURL ends with '/' for proper path joining
    const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

    for (const file of audioFiles) {
      const url = `${base}${file}`;
      const response = await page.request.get(url);
      expect(response.status(), `${file} should be accessible`).toBe(200);
      expect(response.headers()['content-type']).toContain('audio');

      const body = await response.body();
      expect(body.length, `${file} should be non-empty`).toBeGreaterThan(0);
    }
  });

  test('no console errors on boot', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.locator('text=SPIRE ASCENT').waitFor({ timeout: 15000 });

    // Filter out known benign errors (e.g. favicon, third-party)
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('third-party')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('static assets use correct base path', async ({ page, baseURL }) => {
    // Verify the index.html loads JS/CSS with correct base path
    const response = await page.goto('/');
    const html = await response.text();

    // Vite-built assets should reference /spire-clone/ base path
    const basePath = new URL(baseURL).pathname;
    if (basePath !== '/') {
      expect(html).toContain(basePath);
    }
  });
});
