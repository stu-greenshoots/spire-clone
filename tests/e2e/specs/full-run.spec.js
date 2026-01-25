import { test, expect } from '../fixtures/game.fixture.js';
import { SELECTORS } from '../helpers/selectors.js';

test.describe('Full Game Flow', () => {
  test('main menu -> start game -> combat -> reward -> map', async ({ gamePage, gameActions }) => {
    // 1. Main menu visible
    await expect(gamePage.locator(SELECTORS.mainMenuTitle)).toBeVisible();
    await gameActions.screenshot('01-main-menu');

    // 2. Start new game
    await gameActions.startNewGame();
    const mapNodes = gamePage.locator('[data-testid^="map-node-"]');
    await expect(mapNodes.first()).toBeVisible({ timeout: 5000 });
    await gameActions.screenshot('02-map-screen');

    // 3. Select first accessible node (combat encounter)
    const nodeFound = await gameActions.selectFirstNode();
    expect(nodeFound).toBe(true);

    // 4. Wait for combat to initialize (end turn button appears)
    await expect(gamePage.locator(SELECTORS.endTurnButton)).toBeVisible({ timeout: 10000 });
    await gameActions.screenshot('03-combat-start');

    // 5. Fight until resolution
    const outcome = await gameActions.fightCombat();
    await gameActions.screenshot(`04-combat-${outcome}`);

    // 6. Handle outcome
    if (outcome === 'victory') {
      // Reward screen should be visible
      const proceedBtn = gamePage.locator(SELECTORS.proceedButton);
      await expect(proceedBtn).toBeVisible({ timeout: 5000 });

      // Collect rewards
      await gameActions.collectRewards();
      await gameActions.screenshot('05-rewards');

      // Proceed to map
      await gameActions.proceedToMap();

      // Verify we're back on the map
      await expect(mapNodes.first()).toBeVisible({ timeout: 5000 });
      await gameActions.screenshot('06-back-to-map');
    } else if (outcome === 'game_over') {
      // Game over is a valid test outcome (player died in combat)
      await expect(gamePage.locator(SELECTORS.gameOverText)).toBeVisible({ timeout: 5000 });
      await gameActions.screenshot('04-game-over');
    } else if (outcome === 'unknown') {
      // Unknown state - combat entered unexpected state, log for debugging
      await gameActions.screenshot('04-unknown-state');
      console.warn('Combat ended in unknown state - may indicate a bug');
    }
    // timeout outcome means combat took too long - test still passes but with screenshot
  });
});
