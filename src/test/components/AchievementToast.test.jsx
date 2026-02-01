import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AchievementToast from '../../components/AchievementToast';

const mockDismissAchievementToast = vi.fn();
let mockState = {};

vi.mock('../../context/GameContext', () => ({
  useGame: () => ({
    state: mockState,
    dismissAchievementToast: mockDismissAchievementToast
  })
}));

vi.mock('../../systems/audioSystem', () => ({
  audioManager: { playSFX: vi.fn() },
  SOUNDS: { combat: { milestoneFanfare: 'milestone_fanfare' } }
}));

vi.mock('../../systems/settingsSystem', () => ({
  loadSettings: () => ({ animationSpeed: 'instant' }),
  getAnimationDuration: () => 0
}));

describe('AchievementToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockDismissAchievementToast.mockClear();
    mockState = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when no pending achievements', () => {
    mockState = { pendingAchievements: [] };
    const { container } = render(<AchievementToast />);
    expect(container.innerHTML).toBe('');
  });

  it('renders toast when achievement is pending', () => {
    mockState = {
      pendingAchievements: [{ id: 'first_blood', name: 'First Blood', description: 'Win your first run' }]
    };
    render(<AchievementToast />);
    expect(screen.getByText('First Blood')).toBeTruthy();
    expect(screen.getByText('Win your first run')).toBeTruthy();
    expect(screen.getByText('Achievement Unlocked')).toBeTruthy();
  });

  it('has data-testid for testing', () => {
    mockState = {
      pendingAchievements: [{ id: 'first_blood', name: 'First Blood', description: 'Win your first run' }]
    };
    render(<AchievementToast />);
    expect(screen.getByTestId('achievement-toast')).toBeTruthy();
  });

  it('auto-dismisses after timeout', () => {
    mockState = {
      pendingAchievements: [{ id: 'first_blood', name: 'First Blood', description: 'Win your first run' }]
    };
    render(<AchievementToast />);

    // Advance past show + display + slide-out timers (50 + 0 + 1500 + 0)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockDismissAchievementToast).toHaveBeenCalled();
  });

  it('plays milestone fanfare SFX', async () => {
    const { audioManager } = await import('../../systems/audioSystem');
    mockState = {
      pendingAchievements: [{ id: 'first_blood', name: 'First Blood', description: 'Win your first run' }]
    };
    render(<AchievementToast />);
    expect(audioManager.playSFX).toHaveBeenCalledWith('milestone_fanfare');
  });

  it('shows only the first achievement from queue', () => {
    mockState = {
      pendingAchievements: [
        { id: 'first_blood', name: 'First Blood', description: 'Win your first run' },
        { id: 'dedicated', name: 'Dedicated', description: 'Complete 10 runs' }
      ]
    };
    render(<AchievementToast />);
    expect(screen.getByText('First Blood')).toBeTruthy();
    expect(screen.queryByText('Dedicated')).toBeNull();
  });
});
