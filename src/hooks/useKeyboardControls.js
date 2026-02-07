import { useEffect, useState, useCallback } from 'react';

/**
 * Keyboard controls hook for combat
 *
 * Controls:
 * - 1-9: Select card by hand position (1 = leftmost)
 * - Tab / Shift+Tab: Cycle target between enemies
 * - Enter / Space: Confirm card play on selected target
 * - E: End turn
 * - Escape: Deselect card / cancel targeting
 * - Q: Use first available potion
 * - D: Open deck viewer
 * - I: Toggle enemy info display
 * - ?: Toggle help overlay
 */
export function useKeyboardControls({
  hand,
  enemies,
  selectedCard,
  targetingMode,
  canPlayCard,
  selectCard,
  playCard,
  cancelTarget,
  endTurn,
  onUsePotion,
  potions,
  onToggleDeckViewer,
  onToggleEnemyInfo,
  enabled = true,
}) {
  // Keyboard-selected card index (0-indexed, separate from mouse selection)
  const [keyboardSelectedCardIndex, setKeyboardSelectedCardIndex] = useState(null);
  // Keyboard-targeted enemy index
  const [keyboardTargetedEnemyIndex, setKeyboardTargetedEnemyIndex] = useState(0);
  // Help overlay visibility
  const [showHelp, setShowHelp] = useState(false);

  // Get the currently keyboard-selected card
  const keyboardSelectedCard = keyboardSelectedCardIndex !== null ? hand[keyboardSelectedCardIndex] : null;

  // Reset selection when hand changes
  useEffect(() => {
    if (keyboardSelectedCardIndex !== null && keyboardSelectedCardIndex >= hand.length) {
      setKeyboardSelectedCardIndex(hand.length > 0 ? hand.length - 1 : null);
    }
  }, [hand.length, keyboardSelectedCardIndex]);

  // Reset enemy targeting when enemies change
  useEffect(() => {
    if (keyboardTargetedEnemyIndex >= enemies.length) {
      setKeyboardTargetedEnemyIndex(enemies.length > 0 ? 0 : 0);
    }
  }, [enemies.length, keyboardTargetedEnemyIndex]);

  // Handle card selection by number key
  const handleSelectCardByIndex = useCallback((index) => {
    if (index < 0 || index >= hand.length) return;
    const card = hand[index];
    if (!canPlayCard(card)) return;
    setKeyboardSelectedCardIndex(index);
  }, [hand, canPlayCard]);

  // Handle playing the selected card
  const handlePlayCard = useCallback(() => {
    const cardToPlay = keyboardSelectedCard || selectedCard;
    if (!cardToPlay) return;

    // If targeting mode and attack card with multiple enemies, play on targeted enemy
    if (targetingMode || (cardToPlay.type === 'attack' && enemies.length > 1)) {
      if (enemies[keyboardTargetedEnemyIndex]) {
        playCard(cardToPlay, enemies[keyboardTargetedEnemyIndex].instanceId);
        setKeyboardSelectedCardIndex(null);
      }
    } else {
      // Non-attack or single enemy - just select (which auto-plays)
      selectCard(cardToPlay);
      setKeyboardSelectedCardIndex(null);
    }
  }, [keyboardSelectedCard, selectedCard, targetingMode, enemies, keyboardTargetedEnemyIndex, playCard, selectCard]);

  // Handle cycling through enemy targets
  const handleCycleTarget = useCallback((direction) => {
    if (enemies.length === 0) return;
    setKeyboardTargetedEnemyIndex(prev => {
      const newIndex = prev + direction;
      if (newIndex < 0) return enemies.length - 1;
      if (newIndex >= enemies.length) return 0;
      return newIndex;
    });
  }, [enemies.length]);

  // Handle using potion
  const handleUsePotion = useCallback(() => {
    if (!potions || !onUsePotion) return;
    // Find first available potion
    const potionIndex = potions.findIndex(p => p !== null);
    if (potionIndex !== -1) {
      onUsePotion(potionIndex);
    }
  }, [potions, onUsePotion]);

  // Handle cancel/escape
  const handleCancel = useCallback(() => {
    if (targetingMode) {
      cancelTarget();
    }
    setKeyboardSelectedCardIndex(null);
    setShowHelp(false);
  }, [targetingMode, cancelTarget]);

  // Main keyboard event handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Don't capture keys if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      // Number keys 1-9: select card
      if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        handleSelectCardByIndex(parseInt(key, 10) - 1);
        return;
      }

      switch (key) {
        case 'tab':
          e.preventDefault();
          handleCycleTarget(e.shiftKey ? -1 : 1);
          break;

        case 'enter':
        case ' ':
          e.preventDefault();
          handlePlayCard();
          break;

        case 'e':
          e.preventDefault();
          endTurn();
          break;

        case 'escape':
          e.preventDefault();
          handleCancel();
          break;

        case 'q':
          e.preventDefault();
          handleUsePotion();
          break;

        case 'd':
          e.preventDefault();
          if (onToggleDeckViewer) onToggleDeckViewer();
          break;

        case 'i':
          e.preventDefault();
          if (onToggleEnemyInfo) onToggleEnemyInfo();
          break;

        case '?':
          e.preventDefault();
          setShowHelp(prev => !prev);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    handleSelectCardByIndex,
    handleCycleTarget,
    handlePlayCard,
    endTurn,
    handleCancel,
    handleUsePotion,
    onToggleDeckViewer,
    onToggleEnemyInfo,
  ]);

  return {
    keyboardSelectedCardIndex,
    keyboardTargetedEnemyIndex,
    showHelp,
    setShowHelp,
    // Allow external control
    setKeyboardSelectedCardIndex,
    setKeyboardTargetedEnemyIndex,
  };
}

/**
 * Keyboard help data for display
 */
export const KEYBOARD_SHORTCUTS = [
  { key: '1-9', description: 'Select card by position' },
  { key: 'Tab / Shift+Tab', description: 'Cycle through enemy targets' },
  { key: 'Enter / Space', description: 'Play selected card' },
  { key: 'E', description: 'End turn' },
  { key: 'Escape', description: 'Cancel / deselect' },
  { key: 'Q', description: 'Use first potion' },
  { key: 'D', description: 'View draw pile' },
  { key: 'I', description: 'Toggle enemy info' },
  { key: '?', description: 'Toggle this help' },
];
