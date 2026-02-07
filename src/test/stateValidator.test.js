/**
 * QR-13: Runtime State Validation Tests
 * Tests for state validation system that catches impossible states.
 */
import { describe, it, expect } from 'vitest';
import {
  validateState,
  applyCorrections,
  validateCritical,
  validators
} from '../systems/stateValidator';
import { createInitialState } from '../context/GameContext';

describe('State Validator', () => {
  describe('validateState', () => {
    it('validates a fresh initial state as valid', () => {
      const state = createInitialState();
      const result = validateState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns error for null state', () => {
      const result = validateState(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Game state is null or undefined');
    });

    it('returns error for undefined state', () => {
      const result = validateState(undefined);
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePlayer', () => {
    const { validatePlayer } = validators;

    it('validates a healthy player', () => {
      const player = {
        currentHp: 80,
        maxHp: 80,
        energy: 3,
        maxEnergy: 3,
        block: 0,
        gold: 99,
        strength: 0,
        dexterity: 0,
        vulnerable: 0,
        weak: 0,
        frail: 0
      };
      const result = validatePlayer(player);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns error for null player', () => {
      const result = validatePlayer(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Player object is null or undefined');
    });

    it('detects negative HP', () => {
      const player = { currentHp: -5, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0 };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('negative'))).toBe(true);
      expect(result.corrections).toHaveProperty('currentHp', 0);
    });

    it('detects HP exceeding maxHp', () => {
      const player = { currentHp: 100, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0 };
      const result = validatePlayer(player);
      expect(result.warnings.some(w => w.includes('exceeds maxHp'))).toBe(true);
      expect(result.corrections).toHaveProperty('currentHp', 80);
    });

    it('detects negative energy', () => {
      const player = { currentHp: 80, maxHp: 80, energy: -1, maxEnergy: 3, block: 0, gold: 0 };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('energy is negative'))).toBe(true);
    });

    it('detects negative block', () => {
      const player = { currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: -5, gold: 0 };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('block is negative'))).toBe(true);
    });

    it('detects negative gold', () => {
      const player = { currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: -10 };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('gold is negative'))).toBe(true);
    });

    it('detects NaN in HP', () => {
      const player = { currentHp: NaN, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0 };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('currentHp is invalid'))).toBe(true);
    });

    it('detects NaN in status effects', () => {
      const player = {
        currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0,
        strength: NaN
      };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('strength') && e.includes('NaN'))).toBe(true);
    });

    it('detects maxHp less than 1', () => {
      const player = { currentHp: 0, maxHp: 0, energy: 3, maxEnergy: 3, block: 0, gold: 0 };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('maxHp is less than 1'))).toBe(true);
    });

    it('detects negative orb slots', () => {
      const player = {
        currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0,
        orbSlots: -1, orbs: []
      };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('orbSlots is negative'))).toBe(true);
    });

    it('detects orbs array larger than slots', () => {
      const player = {
        currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0,
        orbSlots: 2, orbs: [{}, {}, {}]
      };
      const result = validatePlayer(player);
      expect(result.warnings.some(w => w.includes('3 orbs but only 2 slots'))).toBe(true);
    });

    it('detects invalid stance', () => {
      const player = {
        currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0,
        currentStance: 'invalid_stance'
      };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('stance is invalid'))).toBe(true);
    });

    it('accepts valid stances', () => {
      for (const stance of ['calm', 'wrath', 'divinity', null]) {
        const player = {
          currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0,
          currentStance: stance
        };
        const result = validatePlayer(player);
        expect(result.errors.filter(e => e.includes('stance'))).toHaveLength(0);
      }
    });

    it('detects negative mantra', () => {
      const player = {
        currentHp: 80, maxHp: 80, energy: 3, maxEnergy: 3, block: 0, gold: 0,
        mantra: -5
      };
      const result = validatePlayer(player);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('mantra is negative'))).toBe(true);
    });
  });

  describe('validateEnemy', () => {
    const { validateEnemy } = validators;

    it('validates a healthy enemy', () => {
      const enemy = {
        name: 'Cultist',
        currentHp: 50,
        maxHp: 50,
        block: 0,
        instanceId: 1
      };
      const result = validateEnemy(enemy, 0);
      expect(result.valid).toBe(true);
    });

    it('returns error for null enemy', () => {
      const result = validateEnemy(null, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('null or undefined'))).toBe(true);
    });

    it('warns on negative HP', () => {
      const enemy = { name: 'Cultist', currentHp: -10, maxHp: 50, block: 0, instanceId: 1 };
      const result = validateEnemy(enemy, 0);
      // Negative HP is a warning, not an error, because enemies can briefly have negative HP
      expect(result.warnings.some(w => w.includes('negative HP'))).toBe(true);
    });

    it('detects HP exceeding maxHp', () => {
      const enemy = { name: 'Cultist', currentHp: 60, maxHp: 50, block: 0, instanceId: 1 };
      const result = validateEnemy(enemy, 0);
      expect(result.warnings.some(w => w.includes('exceeds maxHp'))).toBe(true);
    });

    it('detects maxHp less than 1', () => {
      const enemy = { name: 'Cultist', currentHp: 0, maxHp: 0, block: 0, instanceId: 1 };
      const result = validateEnemy(enemy, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('maxHp is less than 1'))).toBe(true);
    });

    it('detects NaN in HP', () => {
      const enemy = { name: 'Cultist', currentHp: NaN, maxHp: 50, block: 0, instanceId: 1 };
      const result = validateEnemy(enemy, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('currentHp is invalid'))).toBe(true);
    });

    it('detects negative block', () => {
      const enemy = { name: 'Cultist', currentHp: 50, maxHp: 50, block: -5, instanceId: 1 };
      const result = validateEnemy(enemy, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('block is negative'))).toBe(true);
    });

    it('warns on missing instanceId', () => {
      const enemy = { name: 'Cultist', currentHp: 50, maxHp: 50, block: 0 };
      const result = validateEnemy(enemy, 0);
      expect(result.warnings.some(w => w.includes('no instanceId'))).toBe(true);
    });

    it('detects NaN in status effects', () => {
      const enemy = { name: 'Cultist', currentHp: 50, maxHp: 50, block: 0, instanceId: 1, vulnerable: NaN };
      const result = validateEnemy(enemy, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('vulnerable') && e.includes('NaN'))).toBe(true);
    });
  });

  describe('validateEnemies', () => {
    const { validateEnemies } = validators;

    it('validates empty enemies array', () => {
      const result = validateEnemies([]);
      expect(result.valid).toBe(true);
    });

    it('validates null enemies', () => {
      const result = validateEnemies(null);
      expect(result.valid).toBe(true);
    });

    it('detects non-array enemies', () => {
      const result = validateEnemies('not an array');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not an array'))).toBe(true);
    });

    it('detects duplicate instanceIds', () => {
      const enemies = [
        { name: 'Cultist', currentHp: 50, maxHp: 50, block: 0, instanceId: 1 },
        { name: 'Jaw Worm', currentHp: 40, maxHp: 40, block: 0, instanceId: 1 }
      ];
      const result = validateEnemies(enemies);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate enemy instanceIds'))).toBe(true);
    });

    it('validates multiple unique enemies', () => {
      const enemies = [
        { name: 'Cultist', currentHp: 50, maxHp: 50, block: 0, instanceId: 1 },
        { name: 'Jaw Worm', currentHp: 40, maxHp: 40, block: 0, instanceId: 2 }
      ];
      const result = validateEnemies(enemies);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCard', () => {
    const { validateCard } = validators;

    it('validates a valid card', () => {
      const card = { id: 'strike', name: 'Strike', cost: 1, damage: 6, instanceId: 100 };
      const result = validateCard(card, 'hand', 0);
      expect(result.valid).toBe(true);
    });

    it('returns error for null card', () => {
      const result = validateCard(null, 'hand', 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('null or undefined'))).toBe(true);
    });

    it('detects card without id', () => {
      const card = { name: 'Strike', cost: 1 };
      const result = validateCard(card, 'hand', 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('has no id'))).toBe(true);
    });

    it('detects NaN cost', () => {
      const card = { id: 'strike', name: 'Strike', cost: NaN, instanceId: 100 };
      const result = validateCard(card, 'hand', 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('NaN cost'))).toBe(true);
    });

    it('warns on negative cost', () => {
      const card = { id: 'strike', name: 'Strike', cost: -1, instanceId: 100 };
      const result = validateCard(card, 'hand', 0);
      expect(result.warnings.some(w => w.includes('negative cost'))).toBe(true);
    });

    it('accepts X cost cards', () => {
      const card = { id: 'whirlwind', name: 'Whirlwind', cost: 'X', instanceId: 100 };
      const result = validateCard(card, 'hand', 0);
      expect(result.errors.filter(e => e.includes('cost'))).toHaveLength(0);
    });

    it('detects NaN damage', () => {
      const card = { id: 'strike', name: 'Strike', cost: 1, damage: NaN, instanceId: 100 };
      const result = validateCard(card, 'hand', 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('NaN damage'))).toBe(true);
    });

    it('detects NaN block', () => {
      const card = { id: 'defend', name: 'Defend', cost: 1, block: NaN, instanceId: 100 };
      const result = validateCard(card, 'hand', 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('NaN block'))).toBe(true);
    });

    it('warns on missing instanceId', () => {
      const card = { id: 'strike', name: 'Strike', cost: 1 };
      const result = validateCard(card, 'hand', 0);
      expect(result.warnings.some(w => w.includes('no instanceId'))).toBe(true);
    });
  });

  describe('validateCardPiles', () => {
    const { validateCardPiles } = validators;

    it('validates empty piles', () => {
      const state = { hand: [], drawPile: [], discardPile: [], exhaustPile: [] };
      const result = validateCardPiles(state);
      expect(result.valid).toBe(true);
    });

    it('detects non-array pile', () => {
      const state = { hand: 'not array', drawPile: [], discardPile: [], exhaustPile: [] };
      const result = validateCardPiles(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('hand is not an array'))).toBe(true);
    });

    it('detects duplicate instanceIds across piles', () => {
      const state = {
        hand: [{ id: 'strike', name: 'Strike', cost: 1, instanceId: 100 }],
        drawPile: [{ id: 'defend', name: 'Defend', cost: 1, instanceId: 100 }],
        discardPile: [],
        exhaustPile: []
      };
      const result = validateCardPiles(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate card instanceIds'))).toBe(true);
    });

    it('validates cards in all piles', () => {
      const state = {
        hand: [{ id: 'strike', cost: 1, instanceId: 1 }],
        drawPile: [{ id: 'defend', cost: 1, instanceId: 2 }],
        discardPile: [{ id: 'bash', cost: 2, instanceId: 3 }],
        exhaustPile: [{ id: 'anger', cost: 0, instanceId: 4 }]
      };
      const result = validateCardPiles(state);
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePhase', () => {
    const { validatePhase } = validators;

    it('validates all known phases', () => {
      const validPhases = [
        'main_menu', 'map', 'combat', 'combat_reward', 'card_reward',
        'rest_site', 'shop', 'event', 'game_over', 'victory',
        'character_select', 'starting_bonus', 'data_editor',
        'card_select_hand', 'card_select_discard', 'card_select_exhaust',
        'card_select_draw', 'endless_transition'
      ];

      for (const phase of validPhases) {
        const result = validatePhase(phase);
        expect(result.valid).toBe(true);
      }
    });

    it('detects null phase', () => {
      const result = validatePhase(null);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('null or undefined'))).toBe(true);
    });

    it('detects invalid phase', () => {
      const result = validatePhase('invalid_phase');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid game phase'))).toBe(true);
    });
  });

  describe('validateProgression', () => {
    const { validateProgression } = validators;

    it('validates normal progression', () => {
      const state = { phase: 'map', currentFloor: 5, act: 1, turn: 0, ascension: 0 };
      const result = validateProgression(state);
      expect(result.valid).toBe(true);
    });

    it('detects negative floor', () => {
      const state = { phase: 'map', currentFloor: -1, act: 1, turn: 0, ascension: 0 };
      const result = validateProgression(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('currentFloor is negative'))).toBe(true);
    });

    it('warns on act outside expected range', () => {
      const state = { phase: 'map', currentFloor: 5, act: 5, turn: 0, ascension: 0 };
      const result = validateProgression(state);
      expect(result.warnings.some(w => w.includes('act is outside expected range'))).toBe(true);
    });

    it('detects NaN turn during combat', () => {
      const state = { phase: 'combat', currentFloor: 5, act: 1, turn: NaN, ascension: 0 };
      const result = validateProgression(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('turn is invalid during combat'))).toBe(true);
    });

    it('warns on ascension outside range', () => {
      const state = { phase: 'map', currentFloor: 5, act: 1, turn: 0, ascension: 25 };
      const result = validateProgression(state);
      expect(result.warnings.some(w => w.includes('ascension is outside expected range'))).toBe(true);
    });
  });

  describe('validatePotions', () => {
    const { validatePotions } = validators;

    it('validates normal potion slots', () => {
      const potions = [null, { id: 'firePotion' }, null];
      const result = validatePotions(potions);
      expect(result.valid).toBe(true);
    });

    it('validates null potions', () => {
      const result = validatePotions(null);
      expect(result.valid).toBe(true);
    });

    it('detects non-array potions', () => {
      const result = validatePotions('not array');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not an array'))).toBe(true);
    });

    it('warns on wrong number of slots', () => {
      const potions = [null, null];
      const result = validatePotions(potions);
      expect(result.warnings.some(w => w.includes('2 slots, expected 3'))).toBe(true);
    });

    it('detects potion without id', () => {
      const potions = [{ name: 'Fire Potion' }, null, null];
      const result = validatePotions(potions);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('has no id'))).toBe(true);
    });
  });

  describe('validateRelics', () => {
    const { validateRelics } = validators;

    it('validates normal relics array', () => {
      const relics = [{ id: 'burningBlood' }, { id: 'bagOfMarbles' }];
      const result = validateRelics(relics);
      expect(result.valid).toBe(true);
    });

    it('validates null relics', () => {
      const result = validateRelics(null);
      expect(result.valid).toBe(true);
    });

    it('validates empty relics', () => {
      const result = validateRelics([]);
      expect(result.valid).toBe(true);
    });

    it('detects non-array relics', () => {
      const result = validateRelics('not array');
      expect(result.valid).toBe(false);
    });

    it('detects relic without id', () => {
      const relics = [{ name: 'Burning Blood' }];
      const result = validateRelics(relics);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('has no id'))).toBe(true);
    });

    it('warns on duplicate relics', () => {
      const relics = [{ id: 'burningBlood' }, { id: 'burningBlood' }];
      const result = validateRelics(relics);
      expect(result.warnings.some(w => w.includes('Duplicate relic'))).toBe(true);
    });
  });

  describe('applyCorrections', () => {
    it('returns state unchanged when no corrections', () => {
      const state = { player: { currentHp: 80 } };
      const result = applyCorrections(state, null);
      expect(result).toBe(state);
    });

    it('applies player corrections', () => {
      const state = { player: { currentHp: 100, maxHp: 80 } };
      const corrections = { player: { currentHp: 80 } };
      const result = applyCorrections(state, corrections);
      expect(result.player.currentHp).toBe(80);
    });

    it('does not mutate original state', () => {
      const state = { player: { currentHp: -5, maxHp: 80 } };
      const corrections = { player: { currentHp: 0 } };
      const result = applyCorrections(state, corrections);
      expect(state.player.currentHp).toBe(-5);
      expect(result.player.currentHp).toBe(0);
    });
  });

  describe('validateCritical', () => {
    it('returns true for valid state', () => {
      const state = { player: { currentHp: 80, energy: 3 }, phase: 'combat' };
      expect(validateCritical(state)).toBe(true);
    });

    it('returns false for null state', () => {
      expect(validateCritical(null)).toBe(false);
    });

    it('returns false for missing player', () => {
      expect(validateCritical({ phase: 'combat' })).toBe(false);
    });

    it('returns false for negative HP', () => {
      const state = { player: { currentHp: -5, energy: 3 }, phase: 'combat' };
      expect(validateCritical(state)).toBe(false);
    });

    it('returns false for negative energy', () => {
      const state = { player: { currentHp: 80, energy: -1 }, phase: 'combat' };
      expect(validateCritical(state)).toBe(false);
    });

    it('returns false for non-string phase', () => {
      const state = { player: { currentHp: 80, energy: 3 }, phase: null };
      expect(validateCritical(state)).toBe(false);
    });
  });

  describe('Full State Integration', () => {
    it('validates a complete game state from initial', () => {
      const state = createInitialState();
      const result = validateState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates a game state in combat', () => {
      const state = createInitialState();
      state.phase = 'combat';
      state.player.currentHp = 70;
      state.player.energy = 3;
      state.turn = 1;
      state.enemies = [
        { name: 'Cultist', currentHp: 50, maxHp: 50, block: 0, instanceId: 1 }
      ];
      state.hand = [
        { id: 'strike', name: 'Strike', cost: 1, damage: 6, instanceId: 100 }
      ];

      const result = validateState(state);
      expect(result.valid).toBe(true);
    });

    it('catches multiple errors in corrupt state', () => {
      const state = createInitialState();
      state.phase = 'invalid';
      state.player.currentHp = -10;
      state.player.energy = NaN;
      state.currentFloor = -5;

      const result = validateState(state);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
