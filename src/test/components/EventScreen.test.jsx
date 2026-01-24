import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSkipEvent = vi.fn();
let mockState;

vi.mock('../../context/GameContext', () => ({
  useGame: () => ({
    state: mockState,
    skipEvent: mockSkipEvent,
    dispatch: vi.fn()
  }),
  GAME_PHASE: {
    EVENT: 'event',
    MAP: 'map'
  }
}));

vi.mock('../../data/cards', () => ({
  getRandomCard: () => ({ id: 'test_card', name: 'Test Card', type: 'attack', cost: 1 }),
  RARITY: { COMMON: 'common', UNCOMMON: 'uncommon', RARE: 'rare' },
  ALL_CARDS: [],
  CARD_TYPES: { ATTACK: 'attack', SKILL: 'skill', POWER: 'power' }
}));

vi.mock('../../data/relics', () => ({
  getRandomRelic: () => ({ id: 'test_relic', name: 'Test Relic' })
}));

import EventScreen from '../../components/EventScreen';

describe('EventScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      phase: 'event',
      player: { currentHp: 60, maxHp: 80, gold: 100, energy: 3, maxEnergy: 3 },
      deck: [],
      relics: [],
      currentNode: { type: 'event' }
    };
  });

  it('renders without crashing', () => {
    render(<EventScreen />);
    // Should show some event content
    const container = document.querySelector('[style]');
    expect(container).toBeInTheDocument();
  });

  it('displays an event title', () => {
    render(<EventScreen />);
    // Events have titles - find any heading-like text
    const headings = document.querySelectorAll('[style*="font-size"]');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('shows event options/choices', () => {
    render(<EventScreen />);
    // Events should have clickable options
    const clickableElements = document.querySelectorAll('[style*="cursor: pointer"]');
    expect(clickableElements.length).toBeGreaterThan(0);
  });

  it('renders event description text', () => {
    render(<EventScreen />);
    // Should have some descriptive text
    const textContent = document.body.textContent;
    expect(textContent.length).toBeGreaterThan(10);
  });
});
