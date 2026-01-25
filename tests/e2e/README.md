# E2E Tests

Playwright-based end-to-end tests for Spire Ascent.

## Quick Start

```bash
npm run test:e2e              # Run headless
npm run test:e2e:headed       # Run with browser visible
npm run test:e2e:screenshots  # Generate screenshots for PR review
npm run test:e2e:debug        # Debug mode with inspector
```

## Structure

```
tests/e2e/
├── playwright.config.js     # Playwright config (webServer, timeouts, etc.)
├── fixtures/
│   └── game.fixture.js      # Custom test fixture with game actions
├── helpers/
│   ├── selectors.js         # Centralized data-testid selectors
│   ├── screenshots.js       # Screenshot utility functions
│   └── combat.js            # Combat loop helper (handles randomness)
└── specs/
    ├── smoke.spec.js        # Basic smoke tests
    └── full-run.spec.js     # Full game flow test
```

## Key Concepts

### Handling Game Randomness

Combat encounters have random enemies and card draws. The `combat.js` helper handles this by:
- Playing whatever cards are available (checks opacity to detect playable cards)
- Looping through play card → end turn → check victory until combat resolves
- Returning outcome: `'victory'` | `'game_over'` | `'timeout'`

### Force Clicks on Animated Elements

The game uses CSS animations extensively (pulsing buttons, floating cards, animated SVG nodes). Playwright considers continuously animated elements "unstable" and won't click them by default.

**Solution:** We use `{ force: true }` on clicks for animated elements. This is safe because:
1. We verify element visibility before clicking
2. We check element state (cursor, opacity) to confirm it's interactive
3. The animations are purely visual, not state-changing

Affected elements:
- Map nodes (SVG `<animate>` pulse rings)
- End Turn button (pulse animation when no cards playable)
- Cards in hand (draw animations)

### Screenshot Workflow

For PR reviews:
1. Run `npm run test:e2e:screenshots`
2. Screenshots save to `screenshots/` (gitignored)
3. Manually attach relevant screenshots to your PR

Two screenshot functions available:
- `takeScreenshot(page, name)` - Timestamped filename for debugging
- `takeNamedScreenshot(page, name)` - Clean filename for PR attachments

## Adding New Tests

1. Create a new spec file in `tests/e2e/specs/`
2. Import the fixture: `import { test, expect } from '../fixtures/game.fixture.js'`
3. Use `gameActions` for common operations (startNewGame, selectFirstNode, fightCombat, etc.)
4. Add any new selectors to `helpers/selectors.js`

Example:
```javascript
import { test, expect } from '../fixtures/game.fixture.js';

test('my new test', async ({ gamePage, gameActions }) => {
  await gameActions.startNewGame();
  // ... test logic
  await gameActions.screenshot('my-test-state');
});
```

## CI

E2E tests run in `.github/workflows/e2e.yml`:
- Triggers on push/PR to `sprint-*` branches
- Runs Chromium headless
- Uploads screenshots as artifacts (14-day retention)
- Uploads Playwright report on failure
