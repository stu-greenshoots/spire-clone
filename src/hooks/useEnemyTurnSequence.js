import { useState, useCallback, useRef, useEffect } from 'react';
import { loadSettings, getAnimationDuration } from '../systems/settingsSystem';

/**
 * Hook for managing sequential enemy turn animations.
 * State changes happen instantly in the reducer - this hook only controls
 * the visual display of enemy actions one at a time with delays.
 */
export const useEnemyTurnSequence = () => {
  const [activeEnemyTurn, setActiveEnemyTurn] = useState(null); // { name, action, instanceId }
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);

  // Get base delay from settings
  const getDelay = useCallback(() => {
    const settings = loadSettings();
    return getAnimationDuration(settings, 600); // 600ms base delay per enemy
  }, []);

  // Process the next enemy in the queue
  const processNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      setActiveEnemyTurn(null);
      setIsProcessingQueue(false);
      return;
    }

    const next = queueRef.current.shift();
    setActiveEnemyTurn(next);

    const delay = getDelay();

    // If instant speed, skip directly to next
    if (delay === 0) {
      processNext();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      processNext();
    }, delay);
  }, [getDelay]);

  // Queue up enemy turns for sequential display
  const queueEnemyTurns = useCallback((enemies) => {
    // Clear any existing queue/timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Build queue from enemies with their intended actions
    const queue = enemies
      .filter(enemy => enemy.currentHp > 0 && enemy.intentData)
      .map(enemy => {
        const intent = enemy.intentData;
        let actionText = '';

        if (intent.damage) {
          const hits = intent.times || 1;
          if (hits > 1) {
            actionText = `attacking for ${intent.damage} x ${hits}`;
          } else {
            actionText = `attacking for ${intent.damage}`;
          }
        } else if (intent.block) {
          actionText = `defending for ${intent.block}`;
        } else if (intent.effects && intent.effects.length > 0) {
          const effect = intent.effects[0];
          if (effect.type === 'weak' || effect.type === 'vulnerable' || effect.type === 'frail') {
            actionText = `applying ${effect.type}`;
          } else if (effect.type === 'strength') {
            actionText = 'powering up';
          } else {
            actionText = 'taking action';
          }
        } else if (intent.special) {
          // Special actions have specific text
          switch (intent.special) {
            case 'addSlimed':
            case 'addBurn':
            case 'addDazed':
              actionText = 'adding status cards';
              break;
            case 'stealGold':
              actionText = 'stealing gold';
              break;
            case 'escape':
              actionText = 'escaping';
              break;
            case 'summonGremlins':
            case 'summonDaggers':
              actionText = 'summoning allies';
              break;
            case 'splitBoss':
            case 'splitMedium':
              actionText = 'splitting';
              break;
            case 'healSelf':
            case 'healAlly':
              actionText = 'healing';
              break;
            default:
              actionText = 'taking action';
          }
        } else {
          actionText = 'taking action';
        }

        return {
          instanceId: enemy.instanceId,
          name: enemy.name,
          action: actionText
        };
      });

    queueRef.current = queue;

    if (queue.length > 0) {
      setIsProcessingQueue(true);
      processNext();
    }
  }, [processNext]);

  // Skip to end of queue (for instant mode or skip button)
  const skipQueue = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    queueRef.current = [];
    setActiveEnemyTurn(null);
    setIsProcessingQueue(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    activeEnemyTurn,
    isProcessingQueue,
    queueEnemyTurns,
    skipQueue
  };
};
