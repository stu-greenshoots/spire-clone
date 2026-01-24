import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Card from '../../components/Card';

// Mock the art modules
vi.mock('../../assets/art/art-config', () => ({
  getCardArtInfo: () => ({ hasImage: false, imageUrl: null })
}));


describe('Card Component', () => {
  const baseCard = {
    id: 'strike',
    name: 'Strike',
    type: 'attack',
    cost: 1,
    damage: 6,
    description: 'Deal 6 damage.',
    rarity: 'basic',
    instanceId: 'strike_1'
  };

  it('renders card name', () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText('Strike')).toBeInTheDocument();
  });

  it('renders card description', () => {
    render(<Card card={baseCard} />);
    // Description text may be split across keyword-highlighted spans
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Deal 6 damage.' || content === 'Deal 6 damage.';
    })).toBeInTheDocument();
  });

  it('renders energy cost', () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders card type', () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText('attack')).toBeInTheDocument();
  });

  it('does not render cost orb for variable cost cards (cost -1)', () => {
    const xCard = { ...baseCard, cost: -1 };
    const { container } = render(<Card card={xCard} />);
    // Cost orb is only shown when cost >= 0
    expect(screen.queryByText('X')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked and not disabled', () => {
    const onClick = vi.fn();
    render(<Card card={baseCard} onClick={onClick} />);
    fireEvent.click(screen.getByText('Strike').closest('div'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Card card={baseCard} onClick={onClick} disabled={true} />);
    // Click on the outermost div
    const cardEl = screen.getByText('Strike').closest('div').parentElement.parentElement;
    fireEvent.click(cardEl);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows upgrade indicator when card is upgraded', () => {
    const upgradedCard = { ...baseCard, name: 'Strike+', upgraded: true };
    render(<Card card={upgradedCard} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('renders skill type card correctly', () => {
    const skillCard = { ...baseCard, id: 'defend', name: 'Defend', type: 'skill', description: 'Gain 5 Block.', block: 5 };
    const { container } = render(<Card card={skillCard} />);
    expect(screen.getByText('Defend')).toBeInTheDocument();
    expect(screen.getByText('skill')).toBeInTheDocument();
    // Block is a keyword so may be in a highlighted span
    expect(container.textContent).toContain('Gain 5');
    expect(container.textContent).toContain('Block');
  });

  it('renders power type card correctly', () => {
    const powerCard = { ...baseCard, id: 'inflame', name: 'Inflame', type: 'power', description: 'Gain 2 Strength.' };
    const { container } = render(<Card card={powerCard} />);
    expect(screen.getByText('Inflame')).toBeInTheDocument();
    expect(screen.getByText('power')).toBeInTheDocument();
    // Strength is a keyword so may be in a highlighted span
    expect(container.textContent).toContain('Gain 2');
    expect(container.textContent).toContain('Strength');
  });

  it('adjusts damage display when player has strength', () => {
    const player = { strength: 2, weak: 0, dexterity: 0, frail: 0 };
    const { container } = render(<Card card={baseCard} player={player} />);
    // Damage should be 6 + 2 = 8
    // Text may be split across keyword-highlighted spans
    expect(container.textContent).toContain('Deal 8 damage.');
  });

  it('adjusts damage display when player is weak', () => {
    const player = { strength: 0, weak: 1, dexterity: 0, frail: 0 };
    const { container } = render(<Card card={baseCard} player={player} />);
    // Damage should be floor(6 * 0.75) = 4
    expect(container.textContent).toContain('Deal 4 damage.');
  });

  it('adjusts block display when player has dexterity', () => {
    const defendCard = { ...baseCard, id: 'defend', name: 'Defend', type: 'skill', damage: undefined, block: 5, description: 'Gain 5 Block.' };
    const player = { strength: 0, weak: 0, dexterity: 2, frail: 0 };
    const { container } = render(<Card card={defendCard} player={player} />);
    // Text may be split across keyword-highlighted spans (Block is a keyword)
    expect(container.textContent).toContain('Gain 7');
    expect(container.textContent).toContain('Block');
  });

  it('renders in small mode with reduced size', () => {
    const { container } = render(<Card card={baseCard} small={true} />);
    const cardEl = container.firstChild;
    expect(cardEl.style.width).toBe('75px');
    expect(cardEl.style.height).toBe('110px');
  });

  it('renders in normal mode with full size', () => {
    const { container } = render(<Card card={baseCard} small={false} />);
    const cardEl = container.firstChild;
    expect(cardEl.style.width).toBe('100px');
    expect(cardEl.style.height).toBe('145px');
  });
});
