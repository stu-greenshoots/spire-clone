import { test, expect } from '../fixtures/game.fixture.js';
import { SELECTORS } from '../helpers/selectors.js';

test.describe('Smoke Tests', () => {
  test('loads the main menu', async ({ gamePage }) => {
    await expect(gamePage.locator(SELECTORS.mainMenuTitle)).toBeVisible();
    await expect(gamePage.locator(SELECTORS.newGameButton)).toBeVisible();
  });

  test('starts a new game and shows the map', async ({ gamePage, gameActions }) => {
    await gameActions.startNewGame();
    // Map should render with nodes
    const nodes = gamePage.locator('[data-testid^="map-node-"]');
    await expect(nodes.first()).toBeVisible({ timeout: 5000 });
  });
});
