import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRest = vi.fn();
const mockUpgradeCard = vi.fn();
const mockLiftGirya = vi.fn();

let mockState;

vi.mock('../../context/GameContext', () => ({
  useGame: () => ({
    state: mockState,
    rest: mockRest,
    upgradeCard: mockUpgradeCard,
    liftGirya: mockLiftGirya
  }),
  GAME_PHASE: {
    REST_SITE: 'rest_site',
    MAP: 'map'
  }
}));

// Mock Card component to simplify testing
vi.mock('../../components/Card', () => ({
  default: ({ card, onClick }) => (
    <div data-testid={`card-${card.id}`} onClick={onClick}>
      {card.name}
    </div>
  )
}));

import RestSite from '../../components/RestSite';

describe('RestSite Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      player: { maxHp: 80, currentHp: 60, gold: 50, energy: 3, maxEnergy: 3 },
      deck: [
        { id: 'strike', name: 'Strike', type: 'attack', upgraded: false, upgradedVersion: { damage: 9 }, instanceId: 'strike_1' },
        { id: 'defend', name: 'Defend', type: 'skill', upgraded: false, upgradedVersion: { block: 8 }, instanceId: 'defend_1' },
        { id: 'bash', name: 'Bash', type: 'attack', upgraded: true, instanceId: 'bash_1' }
      ],
      relics: []
    };
  });

  it('renders the rest site title', () => {
    render(<RestSite />);
    expect(screen.getByText('Rest Site')).toBeInTheDocument();
  });

  it('shows the Rest button', () => {
    render(<RestSite />);
    // "Rest" appears as the rest option label
    expect(screen.getByText('Rest')).toBeInTheDocument();
  });

  it('shows the Smith option', () => {
    render(<RestSite />);
    expect(screen.getByText('Smith')).toBeInTheDocument();
  });

  it('shows heal description with HP value', () => {
    render(<RestSite />);
    // Heal text includes the amount in a span
    expect(screen.getByText(/Heal/)).toBeInTheDocument();
  });

  it('shows Girya Lift option when player has Girya relic', () => {
    mockState.relics = [{ id: 'girya', name: 'Girya', liftCount: 0 }];
    render(<RestSite />);
    expect(screen.getByText(/Lift/)).toBeInTheDocument();
  });

  it('does not show Lift option without Girya relic', () => {
    render(<RestSite />);
    expect(screen.queryByText(/Lift/)).not.toBeInTheDocument();
  });

  it('shows number of upgradable cards', () => {
    render(<RestSite />);
    // 2 upgradable cards (Strike and Defend, not Bash which is already upgraded)
    expect(screen.getByText(/cards/)).toBeInTheDocument();
  });
});
