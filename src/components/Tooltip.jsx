import { createPortal } from 'react-dom';
import { memo, useState, useRef, useCallback, useEffect } from 'react';

/**
 * Tooltip - Generic Portal-based tooltip component.
 * UX-06: Renders to document.body to avoid z-index and overflow issues.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether tooltip is visible
 * @param {Object} props.position - { x, y, placement } from useTooltip
 * @param {React.ReactNode} props.children - Tooltip content
 * @param {string} props.className - Optional additional CSS class
 * @param {Object} props.style - Optional additional inline styles
 */
const Tooltip = memo(function Tooltip({
  visible,
  position,
  children,
  className = '',
  style = {}
}) {
  if (!visible) return null;

  const { x, y, placement } = position;

  // Calculate transform based on placement
  const getTransform = () => {
    switch (placement) {
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
      case 'top':
      default:
        return 'translate(-50%, -100%)';
    }
  };

  // Get arrow styles based on placement
  const getArrowStyles = () => {
    const baseArrow = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      background: '#14142a',
      transform: 'rotate(45deg)'
    };

    switch (placement) {
      case 'bottom':
        return {
          ...baseArrow,
          top: '-4px',
          left: '50%',
          marginLeft: '-4px',
          borderLeft: '1px solid #555',
          borderTop: '1px solid #555'
        };
      case 'left':
        return {
          ...baseArrow,
          right: '-4px',
          top: '50%',
          marginTop: '-4px',
          borderRight: '1px solid #555',
          borderTop: '1px solid #555'
        };
      case 'right':
        return {
          ...baseArrow,
          left: '-4px',
          top: '50%',
          marginTop: '-4px',
          borderLeft: '1px solid #555',
          borderBottom: '1px solid #555'
        };
      case 'top':
      default:
        return {
          ...baseArrow,
          bottom: '-4px',
          left: '50%',
          marginLeft: '-4px',
          borderRight: '1px solid #555',
          borderBottom: '1px solid #555'
        };
    }
  };

  const tooltipContent = (
    <div
      className={`tooltip-portal ${className}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: getTransform(),
        zIndex: 9999,
        pointerEvents: 'none',
        animation: 'tooltipFadeIn 0.15s ease-out',
        ...style
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1e1e30 0%, #14142a 100%)',
          border: '1px solid #555',
          borderRadius: '6px',
          padding: '8px 10px',
          minWidth: '120px',
          maxWidth: '280px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.7), 0 0 8px rgba(100, 100, 200, 0.15)',
          color: '#ddd',
          fontSize: '11px',
          lineHeight: '1.4',
          position: 'relative'
        }}
      >
        {children}
        <div style={getArrowStyles()} />
      </div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
});

/**
 * TooltipTrigger - Wrapper component that handles mouse events.
 * Use with useTooltip hook for full tooltip functionality.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to wrap
 * @param {Function} props.onShow - Called on mouseenter
 * @param {Function} props.onHide - Called on mouseleave
 * @param {string} props.placement - Tooltip placement (top, bottom, left, right)
 */
export const TooltipTrigger = memo(function TooltipTrigger({
  children,
  onShow,
  onHide,
  placement = 'top',
  style = {}
}) {
  const handleMouseEnter = (e) => {
    if (onShow) onShow(e.currentTarget, placement);
  };

  const handleMouseLeave = () => {
    if (onHide) onHide();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block', ...style }}
    >
      {children}
    </div>
  );
});

/**
 * SimpleTooltip - All-in-one tooltip component with built-in state.
 * For simple use cases where you just want a tooltip on hover.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to wrap
 * @param {React.ReactNode} props.content - Tooltip content
 * @param {string} props.placement - Tooltip placement (top, bottom, left, right)
 * @param {number} props.delay - Show delay in ms (default: 180)
 */
export const SimpleTooltip = memo(function SimpleTooltip({
  children,
  content,
  placement = 'top',
  delay = 180
}) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, placement });
  const timerRef = useRef(null);

  const handleMouseEnter = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
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

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [placement, delay]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  // Cleanup timer on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <Tooltip visible={visible} position={position}>
        {content}
      </Tooltip>
    </>
  );
});

export default Tooltip;
