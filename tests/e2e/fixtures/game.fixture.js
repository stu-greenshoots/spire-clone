import { test as base, expect } from '@playwright/test';
import { takeScreenshot, takeNamedScreenshot } from '../helpers/screenshots.js';
import { playTurn, fightCombat } from '../helpers/combat.js';
import { SELECTORS } from '../helpers/selectors.js';

export const test = base.extend({
  gamePage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForSelector(SELECTORS.mainMenuTitle, { timeout: 15000 });
    await use(page);
  },

  gameActions: async ({ page }, use) => {
    const actions = {
      startNewGame: async () => {
        await page.click(SELECTORS.newGameButton);
        // Wait for map to render (The Spire header appears)
        await page.waitForTimeout(500);
      },

      selectFirstNode: async () => {
        // Find accessible map nodes (cursor: pointer indicates clickable)
        // Use force:true because SVG nodes have continuous animations
        const nodes = page.locator('[data-testid^="map-node-"]');
        const count = await nodes.count();

        for (let i = 0; i < count; i++) {
          const node = nodes.nth(i);
          const cursor = await node.evaluate(el => el.style.cursor);
          if (cursor === 'pointer') {
            await node.click({ force: true });
            await page.waitForTimeout(500);
            return true;
          }
        }
        return false;
      },

      playTurn: () => playTurn(page),
      fightCombat: () => fightCombat(page),

      collectRewards: async () => {
        await page.waitForTimeout(300);

        // Collect gold if available
        const goldBtn = page.locator(SELECTORS.goldReward);
        if (await goldBtn.isVisible().catch(() => false)) {
          await goldBtn.click();
          await page.waitForTimeout(300);
        }

        // Open card rewards if available
        const cardBtn = page.locator(SELECTORS.cardReward);
        if (await cardBtn.isVisible().catch(() => false)) {
          await cardBtn.click();
          await page.waitForTimeout(300);

          // Pick first card or skip
          const firstCard = page.locator(SELECTORS.rewardCard(0));
          if (await firstCard.isVisible().catch(() => false)) {
            await firstCard.click();
            await page.waitForTimeout(300);
          } else {
            const skipBtn = page.locator(SELECTORS.skipRewardButton);
            if (await skipBtn.isVisible().catch(() => false)) {
              await skipBtn.click();
              await page.waitForTimeout(300);
            }
          }
        }
      },

      proceedToMap: async () => {
        const btn = page.locator(SELECTORS.proceedButton);
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(500);
        }
      },

      screenshot: (name, opts) => takeScreenshot(page, name, opts),
      namedScreenshot: (name, opts) => takeNamedScreenshot(page, name, opts),
    };

    await use(actions);
  },
});

export { expect };
