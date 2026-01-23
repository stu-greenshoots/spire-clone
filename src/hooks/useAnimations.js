import { useState, useCallback, useRef } from 'react';

// Hook for managing animations
export const useAnimations = () => {
  const [animations, setAnimations] = useState([]);
  const animationIdRef = useRef(0);

  const addAnimation = useCallback((type, value, x, y, options = {}) => {
    const id = ++animationIdRef.current;
    const animation = {
      id,
      type,
      value,
      x,
      y,
      duration: options.duration || 800,
      color: options.color,
      label: options.label
    };

    setAnimations(prev => [...prev, animation]);
    return id;
  }, []);

  const removeAnimation = useCallback((id) => {
    setAnimations(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAnimations = useCallback(() => {
    setAnimations([]);
  }, []);

  return {
    animations,
    addAnimation,
    removeAnimation,
    clearAnimations
  };
};
