import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock progressionSystem
vi.mock('../../systems/progressionSystem', () => ({
  loadProgression: vi.fn(() => ({
    relicsCollected: { burning_blood: true, anchor: true },
    potionsCollected: { fire_potion: true }
  }))
}));

import RelicPotionCompendium from '../../components/RelicPotionCompendium';
import { loadProgression } from '../../systems/progressionSystem';

describe('RelicPotionCompendium', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    loadProgression.mockReturnValue({
      relicsCollected: { burning_blood: true, anchor: true },
      potionsCollected: { fire_potion: true }
    });
  });

  it('renders the collection overlay', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    expect(screen.getByText('Collection')).toBeInTheDocument();
  });

  it('shows relic discovery count', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    expect(screen.getByText(/2 \//)).toBeInTheDocument();
    expect(screen.getByText(/relics discovered/)).toBeInTheDocument();
  });

  it('shows discovered relics with their names', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    expect(screen.getByText('Burning Blood')).toBeInTheDocument();
    expect(screen.getByText('Anchor')).toBeInTheDocument();
  });

  it('shows undiscovered relics as ???', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    const unknownItems = screen.getAllByText('???');
    expect(unknownItems.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button clicked', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('compendium-close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking backdrop', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('relic-potion-compendium-overlay'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('switches to potions tab', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Potions'));
    expect(screen.getByText(/1 \//)).toBeInTheDocument();
    expect(screen.getByText(/potions discovered/)).toBeInTheDocument();
    expect(screen.getByText('Fire Potion')).toBeInTheDocument();
  });

  it('filters relics by rarity', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Starter'));
    // Only starter relics should show
    expect(screen.getByText('Burning Blood')).toBeInTheDocument();
    expect(screen.queryByText('Anchor')).not.toBeInTheDocument();
  });

  it('sorts by name', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Name'));
    const relicItems = screen.getAllByTestId(/compendium-relic-/);
    expect(relicItems.length).toBeGreaterThan(0);
  });

  it('handles empty progression gracefully', () => {
    loadProgression.mockReturnValue({ relicsCollected: {}, potionsCollected: {} });
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    expect(screen.getByText(/0 \//)).toBeInTheDocument();
  });

  it('filters relics by character', () => {
    loadProgression.mockReturnValue({
      relicsCollected: { ring_of_snake: true, envenom_ring: true, burning_blood: true },
      potionsCollected: {}
    });
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Silent'));
    expect(screen.getByText('Ring of the Snake')).toBeInTheDocument();
    expect(screen.getByText('Envenom Ring')).toBeInTheDocument();
    expect(screen.queryByText('Burning Blood')).not.toBeInTheDocument();
  });

  it('shows rarity badge for discovered items', () => {
    render(<RelicPotionCompendium onClose={mockOnClose} />);
    // Burning Blood is a starter relic - check rarity is displayed
    const burningBloodCard = screen.getByTestId('compendium-relic-burning_blood');
    expect(burningBloodCard).toHaveTextContent('starter');
  });
});
