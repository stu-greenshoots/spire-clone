import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouchGesture } from './useTouchGesture';

describe('useTouchGesture', () => {
  let callbacks;
  let mockCard;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = {
      onTap: vi.fn(),
      onLongPress: vi.fn(),
      onDragStart: vi.fn(),
      onDragMove: vi.fn(),
      onDragEnd: vi.fn(),
    };
    mockCard = { id: 'test-card', name: 'Test Card' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * Create mock touch event
   */
  function createTouchEvent(type, x, y) {
    return {
      type,
      touches: [{ clientX: x, clientY: y }],
      preventDefault: vi.fn(),
    };
  }

  describe('Tap gesture', () => {
    it('should detect tap when touch duration < 200ms and no movement', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      // Touch start at (100, 100)
      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Advance time by 100ms (less than tap threshold)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Touch end at same position
      act(() => {
        result.current.handleTouchEnd(createTouchEvent('touchend', 100, 100));
      });

      expect(callbacks.onTap).toHaveBeenCalledWith(mockCard, expect.any(Object));
      expect(callbacks.onLongPress).not.toHaveBeenCalled();
      expect(callbacks.onDragEnd).not.toHaveBeenCalled();
    });

    it('should NOT detect tap when touch duration > 200ms', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Advance time by 300ms (more than tap threshold)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.handleTouchEnd(createTouchEvent('touchend', 100, 100));
      });

      expect(callbacks.onTap).not.toHaveBeenCalled();
    });

    it('should NOT detect tap when movement > 10px', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Move 20px away
      act(() => {
        result.current.handleTouchMove(createTouchEvent('touchmove', 120, 100));
      });

      act(() => {
        result.current.handleTouchEnd(createTouchEvent('touchend', 120, 100));
      });

      expect(callbacks.onTap).not.toHaveBeenCalled();
      expect(callbacks.onDragEnd).toHaveBeenCalled();
    });
  });

  describe('Long-press gesture', () => {
    it('should detect long-press after 500ms with no movement', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Advance time by 500ms (long-press threshold)
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callbacks.onLongPress).toHaveBeenCalledWith(mockCard);
    });

    it('should NOT detect long-press if movement > 10px', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Move 20px away before 500ms
      act(() => {
        vi.advanceTimersByTime(200);
        result.current.handleTouchMove(createTouchEvent('touchmove', 120, 100));
      });

      // Continue to 500ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(callbacks.onLongPress).not.toHaveBeenCalled();
    });

    it('should cancel long-press timer on touch end before 500ms', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // End touch after 300ms (before long-press)
      act(() => {
        vi.advanceTimersByTime(300);
        result.current.handleTouchEnd(createTouchEvent('touchend', 100, 100));
      });

      // Continue to 500ms - long-press should not fire
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(callbacks.onLongPress).not.toHaveBeenCalled();
    });
  });

  describe('Drag gesture', () => {
    it('should detect drag when movement > 10px', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Move 15px to the right
      act(() => {
        result.current.handleTouchMove(createTouchEvent('touchmove', 115, 100));
      });

      expect(callbacks.onDragMove).toHaveBeenCalled();
      expect(result.current.isDragging()).toBe(true);
    });

    it('should call onDragEnd on touch end after drag', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      act(() => {
        result.current.handleTouchMove(createTouchEvent('touchmove', 120, 100));
      });

      act(() => {
        result.current.handleTouchEnd(createTouchEvent('touchend', 120, 100));
      });

      expect(callbacks.onDragEnd).toHaveBeenCalled();
      expect(result.current.isDragging()).toBe(false);
    });

    it('should NOT trigger drag for small movements (< 10px)', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Move 5px (below threshold)
      act(() => {
        result.current.handleTouchMove(createTouchEvent('touchmove', 105, 100));
      });

      expect(callbacks.onDragMove).not.toHaveBeenCalled();
      expect(result.current.isDragging()).toBe(false);
    });

    it('should calculate diagonal movement correctly', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Move 8px right and 8px down (total distance ~11.3px, exceeds 10px threshold)
      act(() => {
        result.current.handleTouchMove(createTouchEvent('touchmove', 108, 108));
      });

      expect(callbacks.onDragMove).toHaveBeenCalled();
      expect(result.current.isDragging()).toBe(true);
    });
  });

  describe('onDragStart callback', () => {
    it('should call onDragStart only when movement exceeds threshold', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      const startEvent = createTouchEvent('touchstart', 100, 100);

      act(() => {
        result.current.handleTouchStart(startEvent, mockCard);
      });

      // onDragStart should NOT be called on touch start
      expect(callbacks.onDragStart).not.toHaveBeenCalled();

      // Move 15px - now onDragStart should be called
      const moveEvent = createTouchEvent('touchmove', 115, 100);
      act(() => {
        result.current.handleTouchMove(moveEvent);
      });

      expect(callbacks.onDragStart).toHaveBeenCalledWith(mockCard, moveEvent);
    });

    it('should only call onDragStart once per gesture', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Multiple moves
      act(() => {
        result.current.handleTouchMove(createTouchEvent('touchmove', 115, 100));
        result.current.handleTouchMove(createTouchEvent('touchmove', 130, 100));
        result.current.handleTouchMove(createTouchEvent('touchmove', 145, 100));
      });

      // onDragStart should only be called once (on first move)
      expect(callbacks.onDragStart).toHaveBeenCalledTimes(1);
    });

    it('should work when onDragStart is undefined', () => {
      const { result } = renderHook(() => useTouchGesture({ onTap: vi.fn() }));

      expect(() => {
        act(() => {
          result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
          result.current.handleTouchMove(createTouchEvent('touchmove', 120, 100));
        });
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing callbacks gracefully', () => {
      const { result } = renderHook(() => useTouchGesture({}));

      expect(() => {
        act(() => {
          result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
          result.current.handleTouchMove(createTouchEvent('touchmove', 120, 100));
          result.current.handleTouchEnd(createTouchEvent('touchend', 120, 100));
        });
      }).not.toThrow();
    });

    it('should clear timer on new touch start', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      // First touch
      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
      });

      // Advance time partway to long-press
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Second touch (should cancel first timer)
      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 200, 200), mockCard);
      });

      // Complete time to 500ms from second touch
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should only fire once (for second touch)
      expect(callbacks.onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should reset state correctly after gesture completes', () => {
      const { result } = renderHook(() => useTouchGesture(callbacks));

      // First gesture - tap
      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 100, 100), mockCard);
        vi.advanceTimersByTime(100);
        result.current.handleTouchEnd(createTouchEvent('touchend', 100, 100));
      });

      expect(callbacks.onTap).toHaveBeenCalledTimes(1);

      // Second gesture - should work independently
      act(() => {
        result.current.handleTouchStart(createTouchEvent('touchstart', 200, 200), mockCard);
        vi.advanceTimersByTime(100);
        result.current.handleTouchEnd(createTouchEvent('touchend', 200, 200));
      });

      expect(callbacks.onTap).toHaveBeenCalledTimes(2);
    });
  });
});
