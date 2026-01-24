import { useMemo } from 'react';

/**
 * Memoized damage calculation for card preview
 */
export const useCalculatedDamage = (card, player, target) => {
  return useMemo(() => {
    if (!card || !card.damage || !player) return null;
    let damage = typeof card.damage === 'number' ? card.damage : 0;
    if (player.strength) damage += player.strength * (card.strengthMultiplier || 1);
    if (player.weak > 0) damage = Math.floor(damage * 0.75);
    if (target && target.vulnerable > 0) damage = Math.floor(damage * 1.5);
    return Math.max(0, damage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.damage, card?.strengthMultiplier, player?.strength, player?.weak, target?.vulnerable]);
};

/**
 * Memoized block calculation for card preview
 */
export const useCalculatedBlock = (card, player) => {
  return useMemo(() => {
    if (!card || !card.block || !player) return null;
    let block = card.block;
    if (player.dexterity) block += player.dexterity;
    if (player.frail > 0) block = Math.floor(block * 0.75);
    return Math.max(0, block);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.block, player?.dexterity, player?.frail]);
};

/**
 * Shallow comparison for memo
 */
export const shallowEqual = (prev, next) => {
  const keys = Object.keys(prev);
  if (keys.length !== Object.keys(next).length) return false;
  return keys.every(key => prev[key] === next[key]);
};
