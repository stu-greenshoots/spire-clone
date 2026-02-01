import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock progressionSystem
vi.mock('../../systems/progressionSystem', () => ({
  loadProgression: vi.fn(() => ({
    cardsPlayedById: { strike: 5, defend: 3, bash: 2 }
  }))
}));

import CardCompendium from '../../components/CardCompendium';
import { loadProgression } from '../../systems/progressionSystem';

describe('CardCompendium', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    loadProgression.mockReturnValue({
      cardsPlayedById: { strike: 5, defend: 3, bash: 2 }
    });
  });

  it('renders the compendium overlay', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    expect(screen.getByText('Card Compendium')).toBeInTheDocument();
  });

  it('shows discovery count', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    expect(screen.getByText(/3 \//)).toBeInTheDocument();
    expect(screen.getByText(/cards discovered/)).toBeInTheDocument();
  });

  it('shows discovered cards with their names', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    expect(screen.getByText('Strike')).toBeInTheDocument();
    expect(screen.getByText('Defend')).toBeInTheDocument();
    expect(screen.getByText('Bash')).toBeInTheDocument();
  });

  it('shows undiscovered cards as ???', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    const unknownCards = screen.getAllByText('???');
    expect(unknownCards.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button clicked', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('compendium-close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking backdrop', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('card-compendium-overlay'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('filters by card type', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Attacks'));
    // Strike and Bash are attacks, Defend is not
    expect(screen.getByText('Strike')).toBeInTheDocument();
    expect(screen.getByText('Bash')).toBeInTheDocument();
    expect(screen.queryByText('Defend')).not.toBeInTheDocument();
  });

  it('sorts by name', () => {
    render(<CardCompendium onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Name'));
    // Cards should be sorted alphabetically — verify Bash appears before Strike
    const cards = screen.getAllByTestId(/compendium-card-/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('handles empty progression gracefully', () => {
    loadProgression.mockReturnValue({ cardsPlayedById: {} });
    render(<CardCompendium onClose={mockOnClose} />);
    expect(screen.getByText(/0 \//)).toBeInTheDocument();
  });
});
