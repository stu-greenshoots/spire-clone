import { useRef, useCallback } from 'react';

/**
 * Touch gesture state machine for mobile card interactions
 *
 * Detects three gesture types:
 * - Tap: < 200ms && < 10px movement → onTap
 * - Long-press: > 500ms && < 10px movement → onLongPress
 * - Drag: > 10px movement → onDrag
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onTap - Called on quick tap
 * @param {Function} callbacks.onLongPress - Called on 500ms hold
 * @param {Function} callbacks.onDragStart - Called when drag starts
 * @param {Function} callbacks.onDragMove - Called during drag movement
 * @param {Function} callbacks.onDragEnd - Called when drag ends
 * @returns {Object} Touch event handlers
 */
export function useTouchGesture({
  onTap,
  onLongPress,
  onDragStart,
  onDragMove,
  onDragEnd,
}) {
  // Gesture state
  const touchStartTime = useRef(null);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const longPressTimer = useRef(null);
  const isDragging = useRef(false);
  const currentCard = useRef(null);

  // Movement threshold (pixels)
  const DRAG_THRESHOLD = 10;
  // Long-press duration (ms)
  const LONG_PRESS_DURATION = 500;
  // Tap duration (ms)
  const TAP_DURATION = 200;

  /**
   * Clear long-press timer
   */
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e, card) => {
    const touch = e.touches[0];

    // Record start time, position, and card
    touchStartTime.current = Date.now();
    touchStartPosition.current = { x: touch.clientX, y: touch.clientY };
    currentCard.current = card;
    hasMoved.current = false;
    isDragging.current = false;

    // Start long-press timer
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      // Long-press detected
      if (!hasMoved.current && onLongPress) {
        onLongPress(card);
      }
      longPressTimer.current = null;
    }, LONG_PRESS_DURATION);

    // DO NOT call onDragStart here — defer until movement detected
    // This prevents initializing drag state on every tap, which causes slowness
  }, [onLongPress, clearLongPressTimer]);

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPosition.current.x;
    const dy = touch.clientY - touchStartPosition.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if movement exceeds threshold
    if (distance > DRAG_THRESHOLD) {
      // First time crossing threshold — initialize drag
      if (!isDragging.current && onDragStart) {
        onDragStart(currentCard.current, e);
      }

      hasMoved.current = true;
      isDragging.current = true;
      clearLongPressTimer();

      // Notify drag move
      if (onDragMove) {
        onDragMove(e);
      }
    }
  }, [onDragStart, onDragMove, clearLongPressTimer]);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback((e) => {
    const touchDuration = Date.now() - touchStartTime.current;
    const card = currentCard.current;

    // Clear timers
    clearLongPressTimer();

    // Determine gesture type
    if (!hasMoved.current) {
      // No movement - check if tap or long-press
      if (touchDuration < TAP_DURATION && onTap) {
        // Quick tap
        onTap(card, e);
      }
      // Long-press already handled in timer
    } else if (isDragging.current) {
      // Drag gesture
      if (onDragEnd) {
        onDragEnd(e);
      }
    }

    // Reset state
    touchStartTime.current = null;
    isDragging.current = false;
    currentCard.current = null;
  }, [onTap, onDragEnd, clearLongPressTimer]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging: () => isDragging.current,
  };
}
