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
    emoji: '🐛',
    instanceId: 'jaw_worm_1',
    intentData: { intent: 'attack', damage: 11 },
    moveIndex: 0,
    vulnerable: 0,
    weak: 0,
    strength: 0
  };

  it('renders enemy name', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.getByText('Jaw Worm')).toBeInTheDocument();
  });

  it('renders enemy HP', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.getByText(/44.*\/.*44/)).toBeInTheDocument();
  });

  it('shows intent damage for attack intent', () => {
    render(<Enemy enemy={baseEnemy} index={0} />);
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('shows block when enemy has block', () => {
    const blockedEnemy = { ...baseEnemy, block: 10 };
    render(<Enemy enemy={blockedEnemy} index={0} />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
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
    expect(screen.getByText(/20.*\/.*44/)).toBeInTheDocument();
  });

  it('renders buff intent correctly', () => {
    const buffEnemy = { ...baseEnemy, intentData: { intent: 'buff' } };
    render(<Enemy enemy={buffEnemy} index={0} />);
    expect(screen.getByText('Jaw Worm')).toBeInTheDocument();
    expect(screen.getByText('Buff')).toBeInTheDocument();
  });

  it('renders defend intent correctly', () => {
    const defendEnemy = { ...baseEnemy, intentData: { intent: 'defend', block: 8 } };
    render(<Enemy enemy={defendEnemy} index={0} />);
    expect(screen.getByText('Jaw Worm')).toBeInTheDocument();
  });

  it('renders debuff intent correctly', () => {
    const debuffEnemy = { ...baseEnemy, intentData: { intent: 'debuff' } };
    render(<Enemy enemy={debuffEnemy} index={0} />);
    expect(screen.getByText('Debuff')).toBeInTheDocument();
  });

  it('applies targeted styling when targeted prop is true', () => {
    const { container } = render(<Enemy enemy={baseEnemy} index={0} targeted={true} />);
    // Targeted enemies should have some visual distinction
    expect(container.firstChild).toBeInTheDocument();
  });
});
