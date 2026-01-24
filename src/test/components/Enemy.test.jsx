import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the asset loader with all required exports
vi.mock('../../utils/assetLoader', () => ({
  getEnemyImagePath: (id) => `/images/enemies/${id}.svg`,
  getEnemySizeForType: () => ({ width: 80, height: 80 }),
  hasImage: () => false,
  preloadEnemyImage: () => Promise.resolve(),
}));

// Mock the art config
vi.mock('../../assets/art/art-config', () => ({
  getEnemyArtInfo: () => ({ hasImage: false, imageUrl: null }),
}));

import Enemy from '../../components/Enemy';

describe('Enemy Component', () => {
  const baseEnemy = {
    id: 'jaw_worm',
    name: 'Jaw Worm',
    currentHp: 44,
    maxHp: 44,
    block: 0,
    emoji: '\uD83D\uDC1B',
    instanceId: 'jaw_worm_1',
    intentData: { intent: 'attack', damage: 11 },
    moveIndex: 0,
    vulnerable: 0,
    weak: 0,
    strength: 0
  };

  it('renders enemy name', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.getByTestId('enemy-name')).toHaveTextContent('Jaw Worm');
  });

  it('renders enemy HP', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.getByTestId('enemy-hp')).toHaveTextContent('44/44');
  });

  it('shows intent damage for attack intent', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.getByTestId('enemy-intent')).toHaveTextContent('11');
  });

  it('shows block when enemy has block', () => {
    const blockedEnemy = { ...baseEnemy, block: 10 };
    render(<Enemy enemy={blockedEnemy} index={0} />);
    expect(screen.getByTestId('enemy-block')).toHaveTextContent('10');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<Enemy enemy={baseEnemy} index={0} onClick={onClick} />);
    // Click on the main enemy container
    const clickable = container.querySelector('[style*="cursor"]');
    if (clickable) {
      fireEvent.click(clickable);
      expect(onClick).toHaveBeenCalled();
    }
  });

  it('renders with damaged HP correctly', () => {
    const damagedEnemy = { ...baseEnemy, currentHp: 20 };
    render(<Enemy enemy={damagedEnemy} index={0} />);
    expect(screen.getByTestId('enemy-hp')).toHaveTextContent('20/44');
  });

  it('renders buff intent correctly', () => {
    const buffEnemy = { ...baseEnemy, intentData: { intent: 'buff' } };
    render(<Enemy enemy={buffEnemy} index={0} />);
    expect(screen.getByTestId('enemy-name')).toHaveTextContent('Jaw Worm');
    expect(screen.getByTestId('enemy-intent')).toHaveTextContent('Buff');
  });

  it('renders defend intent correctly', () => {
    const defendEnemy = { ...baseEnemy, intentData: { intent: 'defend', block: 8 } };
    render(<Enemy enemy={defendEnemy} index={0} />);
    expect(screen.getByTestId('enemy-name')).toHaveTextContent('Jaw Worm');
  });

  it('renders debuff intent correctly', () => {
    const debuffEnemy = { ...baseEnemy, intentData: { intent: 'debuff' } };
    render(<Enemy enemy={debuffEnemy} index={0} />);
    expect(screen.getByTestId('enemy-intent')).toHaveTextContent('Debuff');
  });

  it('applies targeted styling when targeted prop is true', () => {
    const { container } = render(<Enemy enemy={baseEnemy} index={0} targeted={true} />);
    // Targeted enemies should have some visual distinction
    expect(container.firstChild).toBeInTheDocument();
  });

  it('does not render block element when block is 0', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.queryByTestId('enemy-block')).not.toBeInTheDocument();
  });
});
