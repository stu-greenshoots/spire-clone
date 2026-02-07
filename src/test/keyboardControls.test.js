import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardControls, KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardControls';

describe('useKeyboardControls', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      hand: [
        { instanceId: 'card1', name: 'Strike', type: 'attack', cost: 1 },
        { instanceId: 'card2', name: 'Defend', type: 'skill', cost: 1 },
        { instanceId: 'card3', name: 'Bash', type: 'attack', cost: 2 },
      ],
      enemies: [
        { instanceId: 'enemy1', name: 'Jaw Worm' },
        { instanceId: 'enemy2', name: 'Cultist' },
      ],
      selectedCard: null,
      targetingMode: false,
      canPlayCard: vi.fn(() => true),
      selectCard: vi.fn(),
      playCard: vi.fn(),
      cancelTarget: vi.fn(),
      endTurn: vi.fn(),
      onUsePotion: vi.fn(),
      potions: [{ id: 'fire_potion' }, null, null],
      onToggleDeckViewer: vi.fn(),
      onToggleEnemyInfo: vi.fn(),
      enabled: true,
    };
  });

  it('initializes with no keyboard selection', () => {
    const { result } = renderHook(() => useKeyboardControls(mockProps));
    expect(result.current.keyboardSelectedCardIndex).toBeNull();
    expect(result.current.keyboardTargetedEnemyIndex).toBe(0);
    expect(result.current.showHelp).toBe(false);
  });

  it('selects card by number key 1-9', () => {
    const { result } = renderHook(() => useKeyboardControls(mockProps));

    // Simulate pressing '1'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(result.current.keyboardSelectedCardIndex).toBe(0);

    // Simulate pressing '3'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    });

    expect(result.current.keyboardSelectedCardIndex).toBe(2);
  });

  it('does not select card beyond hand length', () => {
    const { result } = renderHook(() => useKeyboardControls(mockProps));

    // Hand has 3 cards, pressing 5 should not select
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    });

    expect(result.current.keyboardSelectedCardIndex).toBeNull();
  });

  it('cycles enemy targets with Tab', () => {
    const { result } = renderHook(() => useKeyboardControls(mockProps));

    // Initial target is 0
    expect(result.current.keyboardTargetedEnemyIndex).toBe(0);

    // Tab to next enemy
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    });
    expect(result.current.keyboardTargetedEnemyIndex).toBe(1);

    // Tab wraps around
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    });
    expect(result.current.keyboardTargetedEnemyIndex).toBe(0);
  });

  it('cycles backwards with Shift+Tab', () => {
    const { result } = renderHook(() => useKeyboardControls(mockProps));

    // Shift+Tab from 0 wraps to last enemy
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    });
    expect(result.current.keyboardTargetedEnemyIndex).toBe(1);
  });

  it('ends turn with E key', () => {
    renderHook(() => useKeyboardControls(mockProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    });

    expect(mockProps.endTurn).toHaveBeenCalled();
  });

  it('cancels with Escape key', () => {
    const props = { ...mockProps, targetingMode: true };
    const { result } = renderHook(() => useKeyboardControls(props));

    // First select a card
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });
    expect(result.current.keyboardSelectedCardIndex).toBe(0);

    // Escape cancels
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.keyboardSelectedCardIndex).toBeNull();
    expect(mockProps.cancelTarget).toHaveBeenCalled();
  });

  it('toggles help with ? key', () => {
    const { result } = renderHook(() => useKeyboardControls(mockProps));

    expect(result.current.showHelp).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    });

    expect(result.current.showHelp).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    });

    expect(result.current.showHelp).toBe(false);
  });

  it('toggles deck viewer with D key', () => {
    renderHook(() => useKeyboardControls(mockProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    });

    expect(mockProps.onToggleDeckViewer).toHaveBeenCalled();
  });

  it('toggles enemy info with I key', () => {
    renderHook(() => useKeyboardControls(mockProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
    });

    expect(mockProps.onToggleEnemyInfo).toHaveBeenCalled();
  });

  it('does not respond when disabled', () => {
    const props = { ...mockProps, enabled: false };
    const { result } = renderHook(() => useKeyboardControls(props));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(result.current.keyboardSelectedCardIndex).toBeNull();
  });

  it('does not select unplayable cards', () => {
    const props = { ...mockProps, canPlayCard: vi.fn(() => false) };
    const { result } = renderHook(() => useKeyboardControls(props));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(result.current.keyboardSelectedCardIndex).toBeNull();
  });

  it('resets card selection when hand shrinks', () => {
    const { result, rerender } = renderHook(
      (props) => useKeyboardControls(props),
      { initialProps: mockProps }
    );

    // Select card at index 2
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    });
    expect(result.current.keyboardSelectedCardIndex).toBe(2);

    // Hand shrinks to 2 cards
    rerender({ ...mockProps, hand: mockProps.hand.slice(0, 2) });

    // Selection should adjust to new length - 1
    expect(result.current.keyboardSelectedCardIndex).toBe(1);
  });
});

describe('KEYBOARD_SHORTCUTS', () => {
  it('contains all expected shortcuts', () => {
    expect(KEYBOARD_SHORTCUTS.length).toBe(9);

    const shortcuts = KEYBOARD_SHORTCUTS.map(s => s.key);
    expect(shortcuts).toContain('1-9');
    expect(shortcuts).toContain('Tab / Shift+Tab');
    expect(shortcuts).toContain('Enter / Space');
    expect(shortcuts).toContain('E');
    expect(shortcuts).toContain('Escape');
    expect(shortcuts).toContain('Q');
    expect(shortcuts).toContain('D');
    expect(shortcuts).toContain('I');
    expect(shortcuts).toContain('?');
  });
});
