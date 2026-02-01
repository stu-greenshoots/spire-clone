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

    // Wait for character selection or map to appear
    await page.waitForTimeout(2000);

    // Check that at least some images loaded with non-zero natural dimensions
    const images = page.locator('img');
    const count = await images.count();

    // There should be images on screen
    expect(count).toBeGreaterThan(0);

    // At least one image should have loaded successfully (naturalWidth > 0)
    let loadedCount = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const naturalWidth = await images.nth(i).evaluate(el => el.naturalWidth);
      if (naturalWidth > 0) loadedCount++;
    }
    expect(loadedCount).toBeGreaterThan(0);
  });

  test('audio files are accessible at deployed URL', async ({ page, baseURL }) => {
    // Check a sample of audio files are reachable (HTTP 200)
    const audioFiles = [
      'audio/sfx/sfx_attack_slash.mp3',
      'audio/sfx/sfx_block_gain.mp3',
      'audio/sfx/sfx_card_play.mp3',
      'audio/music/music_combat.mp3',
    ];

    for (const file of audioFiles) {
      const url = `${baseURL}${file}`;
      const response = await page.request.get(url);
      expect(response.status(), `${file} should be accessible`).toBe(200);
      expect(response.headers()['content-type']).toContain('audio');
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
