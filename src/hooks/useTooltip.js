import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useTooltip - Hook to manage tooltip visibility and positioning.
 * UX-06: Generic tooltip state management for cards, relics, potions, status effects.
 *
 * @param {Object} options
 * @param {number} options.showDelay - Delay in ms before showing tooltip (default: 180)
 * @param {number} options.hideDelay - Delay in ms before hiding tooltip (default: 0)
 * @returns {Object} - { visible, position, show, hide, triggerRef, updatePosition }
 */
export const useTooltip = (options = {}) => {
  const { showDelay = 180, hideDelay = 0 } = options;

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, placement: 'top' });

  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const triggerRef = useRef(null);

  // Calculate position relative to trigger element
  const updatePosition = useCallback((triggerElement, placement = 'top') => {
    if (!triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let x, y;

    switch (placement) {
      case 'bottom':
        x = rect.left + scrollX + rect.width / 2;
        y = rect.bottom + scrollY + 8;
        break;
      case 'left':
        x = rect.left + scrollX - 8;
        y = rect.top + scrollY + rect.height / 2;
        break;
      case 'right':
        x = rect.right + scrollX + 8;
        y = rect.top + scrollY + rect.height / 2;
        break;
      case 'top':
      default:
        x = rect.left + scrollX + rect.width / 2;
        y = rect.top + scrollY - 8;
        break;
    }

    setPosition({ x, y, placement });
  }, []);

  // Show tooltip after delay
  const show = useCallback((triggerElement, placement = 'top') => {
    // Clear any pending hide
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // Don't restart timer if already showing
    if (visible) {
      updatePosition(triggerElement, placement);
      return;
    }

    showTimerRef.current = setTimeout(() => {
      updatePosition(triggerElement, placement);
      setVisible(true);
    }, showDelay);
  }, [visible, showDelay, updatePosition]);

  // Hide tooltip after delay
  const hide = useCallback(() => {
    // Clear any pending show
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (hideDelay > 0) {
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, hideDelay);
    } else {
      setVisible(false);
    }
  }, [hideDelay]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return {
    visible,
    position,
    show,
    hide,
    triggerRef,
    updatePosition
  };
};

export default useTooltip;
