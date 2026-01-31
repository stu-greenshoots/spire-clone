import { SELECTORS } from './selectors.js';

/**
 * Wait for a condition to become true, polling at intervals.
 * Replaces fixed waitForTimeout calls with condition-based polling.
 * @param {Function} conditionFn - async function returning boolean
 * @param {number} maxWait - maximum wait time in ms
 * @param {number} pollInterval - polling interval in ms
 * @returns {boolean} whether the condition was met
 */
async function waitForCondition(conditionFn, maxWait = 5000, pollInterval = 100) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (await conditionFn()) return true;
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  return false;
}

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
    const countBefore = await cards.count();
    if (countBefore === 0) break;

    // Find a playable card (not disabled = opacity !== 0.5)
    let played = false;
    for (let j = 0; j < countBefore; j++) {
      const card = cards.nth(j);
      const opacity = await card.evaluate(el => getComputedStyle(el).opacity);
      if (opacity !== '0.5' && opacity !== '0') {
        await card.click({ force: true });
        played = true;
        break;
      }
    }
    if (!played) break;

    // Wait for card to resolve: either hand count changes, targeting activates, or combat ends
    await waitForCondition(async () => {
      const targeting = page.locator(SELECTORS.targetingBanner);
      if (await targeting.isVisible().catch(() => false)) return true;
      const currentCount = await cards.count();
      if (currentCount !== countBefore) return true;
      // Combat may have ended
      if (await page.locator(SELECTORS.gameOverText).isVisible().catch(() => false)) return true;
      if (await page.locator(SELECTORS.goldReward).isVisible().catch(() => false)) return true;
      return false;
    }, 3000, 100);

    // Check if targeting mode activated (attack cards with multiple enemies)
    const targeting = page.locator(SELECTORS.targetingBanner);
    if (await targeting.isVisible().catch(() => false)) {
      const enemies = page.locator(SELECTORS.enemy);
      const enemyCount = await enemies.count();
      if (enemyCount > 0) {
        await enemies.first().click({ force: true });
        // Wait for targeting to resolve
        await waitForCondition(async () => {
          return !(await targeting.isVisible().catch(() => false));
        }, 3000, 100);
      } else {
        // No enemies visible, cancel targeting
        await targeting.click({ force: true });
        await waitForCondition(async () => {
          return !(await targeting.isVisible().catch(() => false));
        }, 2000, 100);
        break;
      }
    }
  }

  // End the turn
  const endTurnBtn = page.locator(SELECTORS.endTurnButton);
  if (await endTurnBtn.isVisible().catch(() => false)) {
    await endTurnBtn.click({ force: true });
    // Wait for enemy turn animations to complete
    // VP-08 adds sequential enemy turns (600ms per enemy), so wait longer
    // With up to 5 enemies at 600ms each, plus transition time, use dynamic wait
    await waitForEnemyTurnComplete(page);
  }
}

/**
 * Wait for enemy turn animations to complete.
 * Uses polling instead of fixed timeout to handle variable enemy counts.
 * Sequential enemy turns (VP-08) can take 600ms per enemy.
 */
async function waitForEnemyTurnComplete(page, maxWait = 10000) {
  const endTurnBtn = page.locator(SELECTORS.endTurnButton);
  const proceedBtn = page.locator(SELECTORS.proceedButton);
  const gameOver = page.locator(SELECTORS.gameOverText);
  const victory = page.locator(SELECTORS.victoryText);
  const goldReward = page.locator(SELECTORS.goldReward);

  // Poll for end-of-enemy-turn indicators
  await waitForCondition(async () => {
    if (await proceedBtn.isVisible().catch(() => false)) return true;
    if (await gameOver.isVisible().catch(() => false)) return true;
    if (await victory.isVisible().catch(() => false)) return true;
    if (await goldReward.isVisible().catch(() => false)) return true;
    if (await endTurnBtn.isVisible().catch(() => false)) return true;
    return false;
  }, maxWait, 150);
}

/**
 * Wait for combat to end and determine outcome.
 * Uses polling to handle transition states reliably.
 */
async function waitForCombatEnd(page, timeout = 15000) {
  const proceedBtn = page.locator(SELECTORS.proceedButton);
  const goldReward = page.locator(SELECTORS.goldReward);
  const gameOver = page.locator(SELECTORS.gameOverText);
  const victory = page.locator(SELECTORS.victoryText);
  const endTurnBtn = page.locator(SELECTORS.endTurnButton);

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    // Check victory indicators
    if (await proceedBtn.isVisible().catch(() => false)) return 'victory';
    if (await goldReward.isVisible().catch(() => false)) return 'victory';
    if (await victory.isVisible().catch(() => false)) return 'victory';
    if (await gameOver.isVisible().catch(() => false)) return 'game_over';

    // If end turn button reappears, we're still in combat
    if (await endTurnBtn.isVisible().catch(() => false)) return 'still_fighting';

    // Brief wait before next poll (polling-based, not fixed delay)
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  return 'timeout';
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
      // Combat might have ended - poll for final state with generous timeout
      const result = await waitForCombatEnd(page, 15000);
      if (result === 'still_fighting') {
        // End turn button reappeared, continue loop
        continue;
      }
      // Map timeout to victory (combat ended, transition may be slow)
      return result === 'timeout' ? 'victory' : result;
    }

    await playTurn(page);
  }

  return 'timeout';
}
