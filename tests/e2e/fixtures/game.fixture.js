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
        // Skip starting bonus to go straight to map
        const skipBtn = page.locator('[data-testid="bonus-skip"]');
        await skipBtn.waitFor({ timeout: 3000 }).catch(() => {});
        if (await skipBtn.isVisible().catch(() => false)) {
          await skipBtn.click();
        }
        // Wait for map nodes to appear (condition-based, not fixed timeout)
        const mapNodes = page.locator('[data-testid^="map-node-"]');
        await mapNodes.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      },

      selectFirstNode: async () => {
        // Find accessible map nodes (opacity === 1 indicates clickable)
        // Use force:true because SVG nodes have continuous animations
        const nodes = page.locator('[data-testid^="map-node-"]');
        await nodes.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => false);
        const count = await nodes.count();

        for (let i = 0; i < count; i++) {
          const node = nodes.nth(i);
          // Accessible nodes have opacity 1, others have lower opacity
          const opacity = await node.evaluate(el => el.getAttribute('opacity'));
          if (opacity === '1') {
            await node.click({ force: true });
            // Wait for combat or event screen to appear
            const endTurnBtn = page.locator(SELECTORS.endTurnButton);
            const proceedBtn = page.locator(SELECTORS.proceedButton);
            await Promise.race([
              endTurnBtn.waitFor({ state: 'visible', timeout: 10000 }),
              proceedBtn.waitFor({ state: 'visible', timeout: 10000 }),
            ]).catch(() => {});
            return true;
          }
        }
        return false;
      },

      playTurn: () => playTurn(page),
      fightCombat: () => fightCombat(page),

      collectRewards: async () => {
        // Wait for reward screen to stabilize
        const goldBtn = page.locator(SELECTORS.goldReward);
        const proceedBtn = page.locator(SELECTORS.proceedButton);
        await Promise.race([
          goldBtn.waitFor({ state: 'visible', timeout: 5000 }),
          proceedBtn.waitFor({ state: 'visible', timeout: 5000 }),
        ]).catch(() => {});

        // Collect gold if available
        if (await goldBtn.isVisible().catch(() => false)) {
          await goldBtn.click();
          // Wait for gold to be collected (button may disappear or change)
          await goldBtn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
        }

        // Open card rewards if available
        const cardBtn = page.locator(SELECTORS.cardReward);
        if (await cardBtn.isVisible().catch(() => false)) {
          await cardBtn.click();

          // Wait for card selection to appear
          const firstCard = page.locator(SELECTORS.rewardCard(0));
          const skipBtn = page.locator(SELECTORS.skipRewardButton);
          await Promise.race([
            firstCard.waitFor({ state: 'visible', timeout: 3000 }),
            skipBtn.waitFor({ state: 'visible', timeout: 3000 }),
          ]).catch(() => {});

          // Pick first card or skip
          if (await firstCard.isVisible().catch(() => false)) {
            await firstCard.click();
          } else if (await skipBtn.isVisible().catch(() => false)) {
            await skipBtn.click();
          }
        }
      },

      proceedToMap: async () => {
        const btn = page.locator(SELECTORS.proceedButton);
        await btn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          // Wait for map to appear
          const mapNodes = page.locator('[data-testid^="map-node-"]');
          await mapNodes.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        }
      },

      screenshot: (name, opts) => takeScreenshot(page, name, opts),
      namedScreenshot: (name, opts) => takeNamedScreenshot(page, name, opts),
    };

    await use(actions);
  },
});

export { expect };
