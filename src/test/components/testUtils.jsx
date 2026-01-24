import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { GAME_PHASE } from '../../context/GameContext';

// Mock the GameContext module
const mockDispatch = vi.fn();
const mockContextValue = {};

vi.mock('../../context/GameContext', async () => {
  const actual = await vi.importActual('../../context/GameContext');
  return {
    ...actual,
    useGame: () => mockContextValue,
  };
});

// Create a mock player state
export const createMockPlayer = (overrides = {}) => ({
  maxHp: 80,
  currentHp: 60,
  block: 0,
  energy: 3,
  maxEnergy: 3,
  gold: 99,
  strength: 0,
  dexterity: 0,
  vulnerable: 0,
  weak: 0,
  frail: 0,
  artifact: 0,
  intangible: 0,
  thorns: 0,
  metallicize: 0,
  barricade: false,
  cardsPlayedThisTurn: 0,
  attacksPlayedThisTurn: 0,
  skillsPlayedThisTurn: 0,
  powersPlayedThisTurn: 0,
  ...overrides
});

// Create a mock card
export const createMockCard = (overrides = {}) => ({
  id: 'strike',
  name: 'Strike',
  type: 'attack',
  cost: 1,
  damage: 6,
  description: 'Deal 6 damage.',
  rarity: 'basic',
  instanceId: `strike_${Date.now()}_${Math.random()}`,
  ...overrides
});

// Create a mock enemy
export const createMockEnemy = (overrides = {}) => ({
  id: 'jaw_worm',
  name: 'Jaw Worm',
  currentHp: 44,
  maxHp: 44,
  block: 0,
  emoji: '🐛',
  instanceId: `jaw_worm_${Date.now()}_${Math.random()}`,
  intentData: { type: 'attack', damage: 11 },
  moveIndex: 0,
  vulnerable: 0,
  weak: 0,
  strength: 0,
  ...overrides
});

// Create a mock relic
export const createMockRelic = (overrides = {}) => ({
  id: 'burning_blood',
  name: 'Burning Blood',
  description: 'At the end of combat, heal 6 HP.',
  rarity: 'starter',
  trigger: 'onCombatEnd',
  effect: { type: 'heal', amount: 6 },
  ...overrides
});

// Create mock game state for different scenarios
export const createMockState = (phase = GAME_PHASE.MAIN_MENU, overrides = {}) => ({
  phase,
  player: createMockPlayer(overrides.player),
  deck: overrides.deck || [createMockCard()],
  drawPile: overrides.drawPile || [],
  hand: overrides.hand || [],
  discardPile: overrides.discardPile || [],
  exhaustPile: overrides.exhaustPile || [],
  relics: overrides.relics || [],
  potions: overrides.potions || [null, null, null],
  enemies: overrides.enemies || [],
  currentFloor: overrides.currentFloor || 0,
  act: overrides.act || 1,
  map: overrides.map || null,
  currentNode: overrides.currentNode || null,
  selectedCard: overrides.selectedCard || null,
  targetingMode: overrides.targetingMode || false,
  turn: overrides.turn || 0,
  combatRewards: overrides.combatRewards || null,
  cardRewards: overrides.cardRewards || null,
  animation: overrides.animation || null,
  message: overrides.message || null,
  combatLog: overrides.combatLog || [],
  cardSelection: overrides.cardSelection || null,
  pendingCardPlay: overrides.pendingCardPlay || null,
});

// Create mock context functions
export const createMockActions = () => ({
  startGame: vi.fn(),
  selectNode: vi.fn(),
  selectCard: vi.fn(),
  playCard: vi.fn(),
  cancelTarget: vi.fn(),
  endTurn: vi.fn(),
  collectGold: vi.fn(),
  collectRelic: vi.fn(),
  openCardRewards: vi.fn(),
  selectCardReward: vi.fn(),
  skipCardReward: vi.fn(),
  proceedToMap: vi.fn(),
  leaveShop: vi.fn(),
  rest: vi.fn(),
  upgradeCard: vi.fn(),
  skipEvent: vi.fn(),
  returnToMenu: vi.fn(),
  openDataEditor: vi.fn(),
  selectCardFromPile: vi.fn(),
  cancelCardSelection: vi.fn(),
  spawnEnemies: vi.fn(),
  liftGirya: vi.fn(),
  saveGameState: vi.fn(),
  loadGameState: vi.fn(),
  deleteSaveState: vi.fn(),
});

// Setup the mock context with state and actions
export const setupMockContext = (state, actions = {}) => {
  const mockActions = createMockActions();
  Object.assign(mockContextValue, {
    state,
    ...mockActions,
    ...actions,
  });
  return mockActions;
};

// Render a component with mock context already set up
export const renderWithContext = (ui, { state, actions } = {}) => {
  const mockState = state || createMockState();
  const mockActions = setupMockContext(mockState, actions);
  const result = render(ui);
  return { ...result, mockActions, mockState };
};

export { GAME_PHASE };
