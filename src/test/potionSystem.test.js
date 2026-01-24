import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ALL_POTIONS,
  POTION_RARITY,
  POTION_TYPE,
  POTION_TARGET,
  getPotionById,
  getPotionsByRarity
} from '../data/potions';
import {
  getRandomPotion,
  canUsePotion,
  applyPotionEffect,
  addPotion,
  removePotion,
  getPotionRewards,
  MAX_POTION_SLOTS
} from '../systems/potionSystem';

// Game phase constants matching those defined in GameContext
const GAME_PHASE = {
  MAIN_MENU: 'main_menu',
  MAP: 'map',
  COMBAT: 'combat',
  COMBAT_REWARD: 'combat_reward',
  REST_SITE: 'rest_site',
  SHOP: 'shop',
  EVENT: 'event',
  GAME_OVER: 'game_over'
};

// Helper to create a base game state for testing
const createTestState = (overrides = {}) => ({
  phase: GAME_PHASE.COMBAT,
  player: {
    maxHp: 80,
    currentHp: 60,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    strength: 0,
    dexterity: 0,
    vulnerable: 0,
    weak: 0,
    metallicize: 0,
    platedArmor: 0,
    doubleTap: 0,
    pendingDraw: 0,
    ...overrides.player
  },
  potions: [null, null, null],
  enemies: [
    { id: 'enemy_1', name: 'Test Enemy', currentHp: 50, maxHp: 50, block: 0, vulnerable: 0, weak: 0 },
    { id: 'enemy_2', name: 'Test Enemy 2', currentHp: 30, maxHp: 30, block: 0, vulnerable: 0, weak: 0 }
  ],
  ...overrides
});

describe('Potions Data', () => {
  describe('ALL_POTIONS', () => {
    it('should have at least 10 potions', () => {
      expect(ALL_POTIONS.length).toBeGreaterThanOrEqual(10);
    });

    it('all potions should have required properties', () => {
      ALL_POTIONS.forEach(potion => {
        expect(potion).toHaveProperty('id');
        expect(potion).toHaveProperty('name');
        expect(potion).toHaveProperty('description');
        expect(potion).toHaveProperty('rarity');
        expect(potion).toHaveProperty('type');
        expect(potion).toHaveProperty('targetType');
        expect(potion).toHaveProperty('effect');
        expect(typeof potion.id).toBe('string');
        expect(typeof potion.name).toBe('string');
        expect(typeof potion.description).toBe('string');
      });
    });

    it('all potions should have valid rarities', () => {
      const validRarities = Object.values(POTION_RARITY);
      ALL_POTIONS.forEach(potion => {
        expect(validRarities).toContain(potion.rarity);
      });
    });

    it('all potions should have valid types', () => {
      const validTypes = Object.values(POTION_TYPE);
      ALL_POTIONS.forEach(potion => {
        expect(validTypes).toContain(potion.type);
      });
    });

    it('all potions should have valid target types', () => {
      const validTargets = Object.values(POTION_TARGET);
      ALL_POTIONS.forEach(potion => {
        expect(validTargets).toContain(potion.targetType);
      });
    });

    it('all potion IDs should be unique', () => {
      const ids = ALL_POTIONS.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('all potion names should be unique', () => {
      const names = ALL_POTIONS.map(p => p.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have potions of each rarity', () => {
      Object.values(POTION_RARITY).forEach(rarity => {
        const potionsOfRarity = ALL_POTIONS.filter(p => p.rarity === rarity);
        expect(potionsOfRarity.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPotionById', () => {
    it('should return correct potion by ID', () => {
      const potion = getPotionById('fire_potion');
      expect(potion).toBeDefined();
      expect(potion.name).toBe('Fire Potion');
    });

    it('should return undefined for invalid ID', () => {
      const potion = getPotionById('nonexistent');
      expect(potion).toBeUndefined();
    });
  });

  describe('getPotionsByRarity', () => {
    it('should return only common potions when filtering by common', () => {
      const potions = getPotionsByRarity(POTION_RARITY.COMMON);
      potions.forEach(p => {
        expect(p.rarity).toBe(POTION_RARITY.COMMON);
      });
      expect(potions.length).toBeGreaterThan(0);
    });

    it('should return only rare potions when filtering by rare', () => {
      const potions = getPotionsByRarity(POTION_RARITY.RARE);
      potions.forEach(p => {
        expect(p.rarity).toBe(POTION_RARITY.RARE);
      });
      expect(potions.length).toBeGreaterThan(0);
    });
  });
});

describe('Potion System', () => {
  describe('getRandomPotion', () => {
    it('should return a valid potion object', () => {
      const potion = getRandomPotion();
      expect(potion).toBeDefined();
      expect(potion).toHaveProperty('id');
      expect(potion).toHaveProperty('name');
      expect(potion).toHaveProperty('effect');
    });

    it('should return a potion of the specified rarity', () => {
      const potion = getRandomPotion(POTION_RARITY.RARE);
      expect(potion.rarity).toBe(POTION_RARITY.RARE);
    });

    it('should return a common potion when filtering by common', () => {
      const potion = getRandomPotion(POTION_RARITY.COMMON);
      expect(potion.rarity).toBe(POTION_RARITY.COMMON);
    });

    it('should return a potion from ALL_POTIONS', () => {
      const potion = getRandomPotion();
      expect(ALL_POTIONS.find(p => p.id === potion.id)).toBeDefined();
    });
  });

  describe('canUsePotion', () => {
    it('should return false for null potion', () => {
      const state = createTestState();
      expect(canUsePotion(null, state)).toBe(false);
    });

    it('should allow combat potions during combat', () => {
      const state = createTestState({ phase: GAME_PHASE.COMBAT });
      const potion = getPotionById('fire_potion');
      expect(canUsePotion(potion, state)).toBe(true);
    });

    it('should disallow combat potions outside combat', () => {
      const state = createTestState({ phase: GAME_PHASE.MAP });
      const potion = getPotionById('fire_potion');
      expect(canUsePotion(potion, state)).toBe(false);
    });

    it('should allow anytime potions during combat', () => {
      const state = createTestState({ phase: GAME_PHASE.COMBAT });
      const potion = getPotionById('health_potion');
      expect(canUsePotion(potion, state)).toBe(true);
    });

    it('should allow anytime potions outside combat', () => {
      const state = createTestState({ phase: GAME_PHASE.MAP });
      const potion = getPotionById('health_potion');
      expect(canUsePotion(potion, state)).toBe(true);
    });

    it('should disallow heal potion when at full HP', () => {
      const state = createTestState({
        phase: GAME_PHASE.MAP,
        player: { currentHp: 80, maxHp: 80 }
      });
      const potion = getPotionById('health_potion');
      expect(canUsePotion(potion, state)).toBe(false);
    });

    it('should allow heal potion when HP is not full', () => {
      const state = createTestState({
        phase: GAME_PHASE.MAP,
        player: { currentHp: 50, maxHp: 80 }
      });
      const potion = getPotionById('health_potion');
      expect(canUsePotion(potion, state)).toBe(true);
    });

    it('should disallow instant potions (they are automatic)', () => {
      const state = createTestState({ phase: GAME_PHASE.COMBAT });
      const potion = getPotionById('fairy_potion');
      expect(canUsePotion(potion, state)).toBe(false);
    });

    it('should disallow energy potion outside combat', () => {
      const state = createTestState({ phase: GAME_PHASE.REST_SITE });
      const potion = getPotionById('energy_potion');
      expect(canUsePotion(potion, state)).toBe(false);
    });

    it('should allow block potion during combat', () => {
      const state = createTestState({ phase: GAME_PHASE.COMBAT });
      const potion = getPotionById('block_potion');
      expect(canUsePotion(potion, state)).toBe(true);
    });
  });

  describe('applyPotionEffect - Damage', () => {
    it('should deal damage to target enemy (Fire Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('fire_potion');
      const newState = applyPotionEffect(potion, state, 0);
      expect(newState.enemies[0].currentHp).toBe(30); // 50 - 20
    });

    it('should deal damage to all enemies (Explosive Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('explosive_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.enemies[0].currentHp).toBe(40); // 50 - 10
      expect(newState.enemies[1].currentHp).toBe(20); // 30 - 10
    });

    it('should not reduce HP below 0', () => {
      const state = createTestState({
        enemies: [{ id: 'e1', name: 'Weak', currentHp: 5, maxHp: 5, block: 0 }]
      });
      const potion = getPotionById('fire_potion');
      const newState = applyPotionEffect(potion, state, 0);
      expect(newState.enemies[0].currentHp).toBe(0);
    });

    it('should reduce enemy block before HP on damage', () => {
      const state = createTestState({
        enemies: [{ id: 'e1', name: 'Blocked', currentHp: 50, maxHp: 50, block: 15 }]
      });
      const potion = getPotionById('fire_potion');
      const newState = applyPotionEffect(potion, state, 0);
      // 20 damage - 15 block = 5 HP damage
      expect(newState.enemies[0].block).toBe(0);
      expect(newState.enemies[0].currentHp).toBe(45);
    });

    it('should not deal damage with invalid target index', () => {
      const state = createTestState();
      const potion = getPotionById('fire_potion');
      const newState = applyPotionEffect(potion, state, 99);
      expect(newState.enemies[0].currentHp).toBe(50);
    });
  });

  describe('applyPotionEffect - Block', () => {
    it('should gain block (Block Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('block_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.block).toBe(12);
    });

    it('should stack with existing block', () => {
      const state = createTestState({ player: { block: 5 } });
      const potion = getPotionById('block_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.block).toBe(17); // 5 + 12
    });
  });

  describe('applyPotionEffect - Energy', () => {
    it('should gain energy (Energy Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('energy_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.energy).toBe(5); // 3 + 2
    });
  });

  describe('applyPotionEffect - Heal', () => {
    it('should heal HP (Health Potion)', () => {
      const state = createTestState({ player: { currentHp: 50, maxHp: 80 } });
      const potion = getPotionById('health_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.currentHp).toBe(70); // 50 + 20
    });

    it('should not heal above maxHp', () => {
      const state = createTestState({ player: { currentHp: 75, maxHp: 80 } });
      const potion = getPotionById('health_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.currentHp).toBe(80);
    });
  });

  describe('applyPotionEffect - Buffs', () => {
    it('should gain strength (Strength Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('strength_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.strength).toBe(2);
    });

    it('should gain dexterity (Dexterity Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('dexterity_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.dexterity).toBe(2);
    });

    it('should gain large strength (Cultist Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('cultist_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.strength).toBe(5);
    });

    it('should gain plated armor (Essence of Steel)', () => {
      const state = createTestState();
      const potion = getPotionById('essence_of_steel');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.platedArmor).toBe(4);
    });

    it('should gain metallicize (Heart of Iron)', () => {
      const state = createTestState();
      const potion = getPotionById('heart_of_iron');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.metallicize).toBe(6);
    });

    it('should stack buffs with existing values', () => {
      const state = createTestState({ player: { strength: 3 } });
      const potion = getPotionById('strength_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.strength).toBe(5); // 3 + 2
    });
  });

  describe('applyPotionEffect - Debuffs', () => {
    it('should apply vulnerable to all enemies (Fear Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('fear_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.enemies[0].vulnerable).toBe(3);
      expect(newState.enemies[1].vulnerable).toBe(3);
    });

    it('should apply weak to all enemies (Weak Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('weak_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.enemies[0].weak).toBe(3);
      expect(newState.enemies[1].weak).toBe(3);
    });

    it('should stack debuffs with existing values', () => {
      const state = createTestState({
        enemies: [
          { id: 'e1', name: 'E1', currentHp: 50, maxHp: 50, block: 0, vulnerable: 2, weak: 0 },
          { id: 'e2', name: 'E2', currentHp: 30, maxHp: 30, block: 0, vulnerable: 0, weak: 1 }
        ]
      });
      const potion = getPotionById('fear_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.enemies[0].vulnerable).toBe(5); // 2 + 3
      expect(newState.enemies[1].vulnerable).toBe(3);
    });
  });

  describe('applyPotionEffect - Draw', () => {
    it('should set pendingDraw for card draw (Speed Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('speed_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.pendingDraw).toBe(3);
    });
  });

  describe('applyPotionEffect - DoubleTap', () => {
    it('should set doubleTap (Duplication Potion)', () => {
      const state = createTestState();
      const potion = getPotionById('duplication_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.doubleTap).toBe(1);
    });

    it('should stack with existing doubleTap', () => {
      const state = createTestState({ player: { doubleTap: 1 } });
      const potion = getPotionById('duplication_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.doubleTap).toBe(2);
    });
  });

  describe('applyPotionEffect - Revive', () => {
    it('should heal to percentage of maxHp (Fairy in a Bottle)', () => {
      const state = createTestState({ player: { currentHp: 0, maxHp: 80 } });
      const potion = getPotionById('fairy_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.currentHp).toBe(24); // 80 * 0.3 = 24
    });

    it('should not reduce HP if already above threshold', () => {
      const state = createTestState({ player: { currentHp: 50, maxHp: 80 } });
      const potion = getPotionById('fairy_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.player.currentHp).toBe(50); // stays at 50 since 50 > 24
    });
  });

  describe('applyPotionEffect - Edge Cases', () => {
    it('should return unchanged state for null potion', () => {
      const state = createTestState();
      const newState = applyPotionEffect(null, state);
      expect(newState).toEqual(state);
    });

    it('should return unchanged state for potion without effect', () => {
      const state = createTestState();
      const newState = applyPotionEffect({ id: 'test', effect: null }, state);
      expect(newState).toEqual(state);
    });

    it('should handle empty enemies array for damageAll', () => {
      const state = createTestState({ enemies: [] });
      const potion = getPotionById('explosive_potion');
      const newState = applyPotionEffect(potion, state);
      expect(newState.enemies).toEqual([]);
    });
  });

  describe('addPotion', () => {
    it('should add potion to first empty slot', () => {
      const state = createTestState({ potions: [null, null, null] });
      const { newState, added } = addPotion(state, 'fire_potion');
      expect(added).toBe(true);
      expect(newState.potions[0]).toBeDefined();
      expect(newState.potions[0].id).toBe('fire_potion');
      expect(newState.potions[1]).toBeNull();
      expect(newState.potions[2]).toBeNull();
    });

    it('should add to second slot when first is occupied', () => {
      const existingPotion = getPotionById('block_potion');
      const state = createTestState({ potions: [existingPotion, null, null] });
      const { newState, added } = addPotion(state, 'fire_potion');
      expect(added).toBe(true);
      expect(newState.potions[0].id).toBe('block_potion');
      expect(newState.potions[1].id).toBe('fire_potion');
      expect(newState.potions[2]).toBeNull();
    });

    it('should add to third slot when first two are occupied', () => {
      const p1 = getPotionById('block_potion');
      const p2 = getPotionById('fire_potion');
      const state = createTestState({ potions: [p1, p2, null] });
      const { newState, added } = addPotion(state, 'energy_potion');
      expect(added).toBe(true);
      expect(newState.potions[2].id).toBe('energy_potion');
    });

    it('should not add potion when all slots are full', () => {
      const p1 = getPotionById('block_potion');
      const p2 = getPotionById('fire_potion');
      const p3 = getPotionById('energy_potion');
      const state = createTestState({ potions: [p1, p2, p3] });
      const { newState, added } = addPotion(state, 'health_potion');
      expect(added).toBe(false);
      expect(newState.potions[0].id).toBe('block_potion');
      expect(newState.potions[1].id).toBe('fire_potion');
      expect(newState.potions[2].id).toBe('energy_potion');
    });

    it('should return added=false for invalid potion ID', () => {
      const state = createTestState();
      const { newState, added } = addPotion(state, 'nonexistent_potion');
      expect(added).toBe(false);
      expect(newState).toEqual(state);
    });

    it('should not mutate the original state', () => {
      const state = createTestState({ potions: [null, null, null] });
      const originalPotions = [...state.potions];
      addPotion(state, 'fire_potion');
      expect(state.potions).toEqual(originalPotions);
    });
  });

  describe('removePotion', () => {
    it('should remove potion from specified slot', () => {
      const p1 = getPotionById('fire_potion');
      const p2 = getPotionById('block_potion');
      const state = createTestState({ potions: [p1, p2, null] });
      const newState = removePotion(state, 0);
      expect(newState.potions[0]).toBeNull();
      expect(newState.potions[1].id).toBe('block_potion');
    });

    it('should handle removing from already empty slot', () => {
      const state = createTestState({ potions: [null, null, null] });
      const newState = removePotion(state, 1);
      expect(newState.potions[1]).toBeNull();
    });

    it('should return unchanged state for invalid slot index (negative)', () => {
      const state = createTestState();
      const newState = removePotion(state, -1);
      expect(newState).toEqual(state);
    });

    it('should return unchanged state for invalid slot index (too large)', () => {
      const state = createTestState();
      const newState = removePotion(state, MAX_POTION_SLOTS);
      expect(newState).toEqual(state);
    });

    it('should not mutate the original state', () => {
      const p1 = getPotionById('fire_potion');
      const state = createTestState({ potions: [p1, null, null] });
      const originalPotions = [...state.potions];
      removePotion(state, 0);
      expect(state.potions).toEqual(originalPotions);
    });
  });

  describe('getPotionRewards', () => {
    it('should return the specified number of potions', () => {
      const rewards = getPotionRewards(2, 5);
      expect(rewards.length).toBe(2);
    });

    it('should return 1 potion by default', () => {
      const rewards = getPotionRewards();
      expect(rewards.length).toBe(1);
    });

    it('should return valid potion objects', () => {
      const rewards = getPotionRewards(3, 10);
      rewards.forEach(potion => {
        expect(potion).toHaveProperty('id');
        expect(potion).toHaveProperty('name');
        expect(potion).toHaveProperty('effect');
        expect(potion).toHaveProperty('rarity');
      });
    });

    it('should not return duplicate potions in same reward set', () => {
      // Run multiple times to catch duplicates probabilistically
      for (let attempt = 0; attempt < 10; attempt++) {
        const rewards = getPotionRewards(3, 5);
        const ids = rewards.map(p => p.id);
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).toBe(uniqueIds.length);
      }
    });

    it('should return potions with valid rarities', () => {
      const rewards = getPotionRewards(5, 0);
      const validRarities = Object.values(POTION_RARITY);
      rewards.forEach(potion => {
        expect(validRarities).toContain(potion.rarity);
      });
    });
  });

  describe('MAX_POTION_SLOTS', () => {
    it('should be 3', () => {
      expect(MAX_POTION_SLOTS).toBe(3);
    });
  });

  describe('Integration: Use and Remove Potion Flow', () => {
    it('should use a potion and then remove it from the slot', () => {
      const potion = getPotionById('fire_potion');
      const state = createTestState({ potions: [potion, null, null] });

      // Check that we can use it
      expect(canUsePotion(state.potions[0], state)).toBe(true);

      // Apply the effect
      let newState = applyPotionEffect(state.potions[0], state, 0);
      expect(newState.enemies[0].currentHp).toBe(30);

      // Remove from slot
      newState = removePotion(newState, 0);
      expect(newState.potions[0]).toBeNull();
    });

    it('should add a potion reward and use it later', () => {
      let state = createTestState();

      // Add a potion
      const { newState: stateWithPotion, added } = addPotion(state, 'strength_potion');
      expect(added).toBe(true);

      // Use it
      const potion = stateWithPotion.potions[0];
      expect(canUsePotion(potion, stateWithPotion)).toBe(true);
      const stateAfterUse = applyPotionEffect(potion, stateWithPotion);
      expect(stateAfterUse.player.strength).toBe(2);

      // Remove it
      const finalState = removePotion(stateAfterUse, 0);
      expect(finalState.potions[0]).toBeNull();
    });
  });
});
