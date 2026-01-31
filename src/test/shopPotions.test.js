import { describe, it, expect } from 'vitest';
import { getRandomPotion, POTION_RARITY, ALL_POTIONS } from '../data/potions';
import { shopReducer } from '../context/reducers/shopReducer';
import { GAME_PHASE } from '../context/GameContext';

describe('Shop Potions', () => {
  describe('getRandomPotion', () => {
    it('returns a potion from ALL_POTIONS', () => {
      const potion = getRandomPotion();
      expect(potion).toBeDefined();
      expect(ALL_POTIONS.some(p => p.id === potion.id)).toBe(true);
    });

    it('filters by rarity', () => {
      for (let i = 0; i < 20; i++) {
        const potion = getRandomPotion(POTION_RARITY.COMMON);
        expect(potion.rarity).toBe(POTION_RARITY.COMMON);
      }
    });

    it('excludes specified IDs', () => {
      const allCommonIds = ALL_POTIONS
        .filter(p => p.rarity === POTION_RARITY.COMMON)
        .map(p => p.id);
      // Exclude all but one
      const excludeAll = allCommonIds.slice(1);
      for (let i = 0; i < 10; i++) {
        const potion = getRandomPotion(POTION_RARITY.COMMON, excludeAll);
        expect(potion.id).toBe(allCommonIds[0]);
      }
    });

    it('returns undefined when all excluded', () => {
      const allIds = ALL_POTIONS.map(p => p.id);
      const potion = getRandomPotion(null, allIds);
      expect(potion).toBeUndefined();
    });
  });

  describe('shopReducer LEAVE_SHOP with potions', () => {
    const baseState = {
      player: { gold: 100, hp: 50, maxHp: 80 },
      deck: [{ id: 'strike', instanceId: 'strike_1' }],
      relics: [],
      potions: [null, null, null],
      phase: GAME_PHASE.SHOP
    };

    it('updates potions when provided in payload', () => {
      const newPotions = [{ id: 'fire_potion', name: 'Fire Potion' }, null, null];
      const result = shopReducer(baseState, {
        type: 'LEAVE_SHOP',
        payload: { gold: 50, deck: baseState.deck, relics: [], potions: newPotions }
      });
      expect(result.potions).toEqual(newPotions);
      expect(result.potions[0].id).toBe('fire_potion');
      expect(result.phase).toBe(GAME_PHASE.MAP);
    });

    it('preserves existing potions when not provided in payload', () => {
      const stateWithPotion = { ...baseState, potions: [{ id: 'health_potion' }, null, null] };
      const result = shopReducer(stateWithPotion, {
        type: 'LEAVE_SHOP',
        payload: { gold: 50, deck: baseState.deck, relics: [] }
      });
      expect(result.potions[0].id).toBe('health_potion');
    });
  });
});
