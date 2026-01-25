import { SELECTORS } from './selectors.js';

/**
 * Play all available cards in hand, then end turn.
 * Handles randomness by playing whatever cards are dealt.
 * Uses force:true on clicks because game has many CSS animations.
 */
export async function playTurn(page) {
  const handArea = page.locator(SELECTORS.handArea);
  await handArea.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

  const maxCards = 10;
  for (let i = 0; i < maxCards; i++) {
    // Find cards in hand
    const cards = handArea.locator('.card-frame');
    const count = await cards.count();
    if (count === 0) break;

    // Find a playable card (not disabled = opacity !== 0.5)
    let played = false;
    for (let j = 0; j < count; j++) {
      const card = cards.nth(j);
      const opacity = await card.evaluate(el => getComputedStyle(el).opacity);
      if (opacity !== '0.5' && opacity !== '0') {
        await card.click({ force: true });
        played = true;
        break;
      }
    }
    if (!played) break;

    await page.waitForTimeout(300);

    // Check if targeting mode activated (attack cards with multiple enemies)
    const targeting = page.locator(SELECTORS.targetingBanner);
    if (await targeting.isVisible().catch(() => false)) {
      const enemies = page.locator(SELECTORS.enemy);
      const enemyCount = await enemies.count();
      if (enemyCount > 0) {
        await enemies.first().click({ force: true });
        await page.waitForTimeout(300);
      } else {
        // No enemies visible, cancel targeting
        await targeting.click({ force: true });
        await page.waitForTimeout(200);
        break;
      }
    }

    // Brief pause for card play animation
    await page.waitForTimeout(200);
  }

  // End the turn
  const endTurnBtn = page.locator(SELECTORS.endTurnButton);
  if (await endTurnBtn.isVisible().catch(() => false)) {
    await endTurnBtn.click({ force: true });
    // Wait for enemy turn animations to complete
    // VP-08 adds sequential enemy turns (600ms per enemy), so wait longer
    await page.waitForTimeout(4000);
  }
}

/**
 * Fight combat until it resolves (victory, game over, or max turns).
 * Returns: 'victory' | 'game_over' | 'timeout'
 */
export async function fightCombat(page, maxTurns = 30) {
  for (let turn = 0; turn < maxTurns; turn++) {
    // Check if combat ended (reward screen or game over)
    const proceedBtn = page.locator(SELECTORS.proceedButton);
    const goldReward = page.locator(SELECTORS.goldReward);
    const gameOver = page.locator(SELECTORS.gameOverText);
    const victory = page.locator(SELECTORS.victoryText);

    if (await proceedBtn.isVisible().catch(() => false)) return 'victory';
    if (await goldReward.isVisible().catch(() => false)) return 'victory';
    if (await gameOver.isVisible().catch(() => false)) return 'game_over';
    if (await victory.isVisible().catch(() => false)) return 'victory';

    // Check we're still in combat
    const endTurnBtn = page.locator(SELECTORS.endTurnButton);
    if (!await endTurnBtn.isVisible().catch(() => false)) {
      // Wait for victory overlay animation to appear
      await page.waitForTimeout(1500);
      // Re-check after wait for overlay animations
      if (await proceedBtn.isVisible().catch(() => false)) return 'victory';
      if (await goldReward.isVisible().catch(() => false)) return 'victory';
      if (await victory.isVisible().catch(() => false)) return 'victory';
      if (await gameOver.isVisible().catch(() => false)) return 'game_over';
      // One more wait in case overlay is still animating
      await page.waitForTimeout(1000);
      if (await proceedBtn.isVisible().catch(() => false)) return 'victory';
      if (await goldReward.isVisible().catch(() => false)) return 'victory';
      if (await victory.isVisible().catch(() => false)) return 'victory';
      if (await gameOver.isVisible().catch(() => false)) return 'game_over';
      return 'unknown';
    }

    await playTurn(page);
  }

  return 'timeout';
}
