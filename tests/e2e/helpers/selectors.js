export const SELECTORS = {
  // Main Menu
  newGameButton: '[data-testid="btn-new-game"]',
  continueButton: '[data-testid="btn-continue"]',
  mainMenuTitle: 'text=SPIRE ASCENT',

  // Map
  mapNode: (id) => `[data-testid="map-node-${id}"]`,
  accessibleNode: '[data-testid^="map-node-"][style*="pointer"]',
  mapTitle: 'text=The Spire',

  // Combat
  endTurnButton: '[data-testid="btn-end-turn"]',
  handArea: '[data-testid="hand-area"]',
  enemy: '[data-testid^="enemy-"]',
  targetingBanner: 'text=SELECT TARGET - Tap to Cancel',

  // Rewards
  goldReward: '[data-testid="reward-gold"]',
  cardReward: '[data-testid="reward-cards"]',
  proceedButton: '[data-testid="btn-proceed-map"]',
  skipRewardButton: '[data-testid="btn-skip-reward"]',
  rewardCard: (index) => `[data-testid="reward-card-${index}"]`,

  // Game Over / Victory
  victoryText: 'text=VICTORY',
  gameOverText: 'text=DEFEAT',
};
