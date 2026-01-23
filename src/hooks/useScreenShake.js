import { useState, useCallback } from 'react';

export function useScreenShake() {
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback((intensity = 'medium') => {
    setShake(intensity);
    setTimeout(() => setShake(false), 200);
  }, []);

  return { shake, triggerShake };
}
