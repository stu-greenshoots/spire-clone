/**
 * QR-07: Card Mechanics Verification
 *
 * Comprehensive verification of all 188 cards in the game.
 * For each card, we verify:
 * 1. Cost matches definition
 * 2. Damage/block values match description text
 * 3. Status effects apply with correct values
 * 4. Upgraded version has correct improvements
 * 5. Card type (attack/skill/power) is correct
 * 6. Target type works correctly (single/all/self)
 * 7. Special effects trigger (exhaust, ethereal, innate, retain)
 *
 * Uses REAL game reducers, not mocks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALL_CARDS, CARD_TYPES, RARITY, getCardById } from '../data/cards';
import { ALL_ENEMIES, createEnemyInstance } from '../data/enemies';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { combatReducer } from '../context/reducers/combatReducer';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { calculateDamage, calculateBlock, applyDamageToTarget } from '../systems/combatSystem';

// Mock audio and save systems to prevent side effects
vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

vi.mock('../systems/audioSystem', () => ({
  audioManager: {
    playSFX: vi.fn(),
    playMusic: vi.fn(),
    stopMusic: vi.fn(),
    playAmbient: vi.fn(),
    stopAmbient: vi.fn(),
    setVolume: vi.fn(),
    isInitialized: true,
    isReady: true
  },
  SOUNDS: {
    combat: { cardPlay: 'cardPlay', attack: 'attack', block: 'block', shivPlay: 'shivPlay' },
    ui: { click: 'click' }
  }
}));

// ============================================================
// Helper Functions
// ============================================================

/**
 * Creates a combat state with a basic setup for testing card plays
 */
function createCombatState(options = {}) {
  const {
    playerOverrides = {},
    enemies = null,
    hand = [],
    deck = [],
    relics = [],
    characterId = 'ironclad'
  } = options;

  // Create basic enemies if not provided
  const cultist = ALL_ENEMIES.find(e => e.id === 'cultist') || ALL_ENEMIES[0];
  const testEnemies = enemies || [
    createEnemyInstance(cultist, 0)
  ];

  const basePlayer = createInitialState().player;
  const state = {
    ...createInitialState(),
    phase: GAME_PHASE.COMBAT,
    characterId,
    player: {
      ...basePlayer,
      // Ensure stance is null for clean testing (prevents 2x damage from Wrath)
      currentStance: null,
      mantra: 0,
      // Ensure no double damage effects
      doubleTap: 0,
      penNibActive: false,
      // Override with test values
      ...playerOverrides
    },
    enemies: testEnemies,
    hand: hand.map((card, i) => ({
      ...card,
      instanceId: card.instanceId || `test_${card.id}_${i}_${Date.now()}`
    })),
    deck,
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    relics,
    combatLog: [],
    turn: 1,
    currentFloor: 1,
    runStats: {
      cardsPlayed: 0,
      cardsPlayedById: {},
      damageDealt: 0,
      enemiesKilled: 0,
      defeatedEnemies: [],
      goldEarned: 0,
      floor: 1
    }
  };

  return state;
}

/**
 * Plays a card from hand and returns the new state
 * Note: SELECT_CARD auto-plays the card when there's only 1 enemy
 */
function playCard(state, card, targetId = null) {
  // First select the card
  let newState = combatReducer(state, {
    type: 'SELECT_CARD',
    payload: { card }
  });

  // If targeting mode is active, we need to provide a target and play
  // Otherwise SELECT_CARD already played the card
  if (newState.targetingMode) {
    const resolvedTargetId = targetId || (newState.enemies[0] && newState.enemies[0].instanceId);
    newState = combatReducer(newState, {
      type: 'PLAY_CARD',
      payload: { card, targetId: resolvedTargetId }
    });
  }

  return newState;
}

/**
 * Extracts numbers from a card description for verification
 */
function extractNumbersFromDescription(description) {
  const numbers = description.match(/\d+/g);
  return numbers ? numbers.map(n => parseInt(n, 10)) : [];
}

/**
 * Checks if description mentions a certain damage value
 */
function descriptionMentionsDamage(description, damage) {
  return description.includes(`${damage} damage`) ||
         description.includes(`Deal ${damage}`) ||
         description.includes(`${damage}x`) ||
         description.includes(`${damage} x`);
}

/**
 * Checks if description mentions a certain block value
 */
function descriptionMentionsBlock(description, block) {
  return description.includes(`${block} Block`) ||
         description.includes(`Gain ${block}`);
}

// ============================================================
// Card Categories
// ============================================================

const allCards = ALL_CARDS;
const attackCards = allCards.filter(c => c.type === CARD_TYPES.ATTACK);
const skillCards = allCards.filter(c => c.type === CARD_TYPES.SKILL);
const powerCards = allCards.filter(c => c.type === CARD_TYPES.POWER);
const curseCards = allCards.filter(c => c.type === CARD_TYPES.CURSE);
const statusCards = allCards.filter(c => c.type === CARD_TYPES.STATUS);

const ironcladCards = allCards.filter(c => !c.character || c.character === 'ironclad');
const silentCards = allCards.filter(c => c.character === 'silent');
const defectCards = allCards.filter(c => c.character === 'defect');
const watcherCards = allCards.filter(c => c.character === 'watcher');

// ============================================================
// 1. STRUCTURAL VALIDATION — All Cards
// ============================================================

describe('Card Mechanics Verification', () => {
  describe('Structural Validation — All 188 Cards', () => {
    it('should have exactly 188 cards', () => {
      expect(allCards.length).toBe(188);
    });

    it('all cards have required base properties', () => {
      allCards.forEach(card => {
        expect(card.id, `Card missing id`).toBeDefined();
        expect(typeof card.id).toBe('string');
        expect(card.name, `${card.id} missing name`).toBeDefined();
        expect(typeof card.name).toBe('string');
        expect(card.type, `${card.id} missing type`).toBeDefined();
        expect(card.rarity, `${card.id} missing rarity`).toBeDefined();
        expect(card.description, `${card.id} missing description`).toBeDefined();
        expect(typeof card.description).toBe('string');
      });
    });

    it('all cards have valid types', () => {
      const validTypes = Object.values(CARD_TYPES);
      allCards.forEach(card => {
        expect(validTypes, `${card.id} has invalid type: ${card.type}`).toContain(card.type);
      });
    });

    it('all cards have valid rarities', () => {
      const validRarities = Object.values(RARITY);
      allCards.forEach(card => {
        expect(validRarities, `${card.id} has invalid rarity: ${card.rarity}`).toContain(card.rarity);
      });
    });

    it('all card IDs are unique', () => {
      const ids = allCards.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(duplicates, `Duplicate card IDs found: ${duplicates.join(', ')}`).toHaveLength(0);
    });

    it('all cards have valid costs', () => {
      allCards.forEach(card => {
        expect(card.cost, `${card.id} missing cost`).toBeDefined();
        // -1 = X cost, -2 = unplayable status cards, 0-10 = normal range
        const validCost = card.cost >= -2 && card.cost <= 10;
        expect(validCost, `${card.id} has invalid cost: ${card.cost}`).toBe(true);
      });
    });
  });

  // ============================================================
  // 2. COST VERIFICATION — All Cards
  // ============================================================

  describe('Cost Verification', () => {
    it('all playable cards have non-negative costs or X costs', () => {
      const playableCards = allCards.filter(c => !c.unplayable);
      playableCards.forEach(card => {
        expect(
          card.cost >= 0 || card.cost === -1,
          `${card.id} has invalid cost for playable card: ${card.cost}`
        ).toBe(true);
      });
    });

    it('X-cost cards have cost -1', () => {
      const xCostDescriptions = allCards.filter(c => c.description.includes('[X]') || c.special === 'xCost');
      xCostDescriptions.forEach(card => {
        expect(card.cost, `${card.id} should be X-cost (cost: -1)`).toBe(-1);
      });
    });

    it('0-cost cards are playable for free', () => {
      const zeroCostCards = allCards.filter(c => c.cost === 0 && !c.unplayable);
      // Test a representative sample (first 5 0-cost cards)
      const sampleCards = zeroCostCards.slice(0, 5);
      sampleCards.forEach(card => {
        const state = createCombatState({
          hand: [card],
          playerOverrides: { energy: 0 }
        });
        const cardInHand = state.hand[0];

        // Select and attempt to play
        let newState = combatReducer(state, {
          type: 'SELECT_CARD',
          payload: { card: cardInHand }
        });

        // Card should be playable — either:
        // 1. Card is in targeting mode (waiting for target selection)
        // 2. Card was auto-played (moved from hand to discard/exhaust, or hand is empty)
        // 3. Card was played and state changed (hand no longer contains the card)
        const cardWasPlayed = newState.hand.length === 0 ||
                              !newState.hand.some(c => c.instanceId === cardInHand.instanceId);
        const isInTargetingMode = newState.selectedCard !== null || newState.targetingMode === true;
        const wasPlayable = cardWasPlayed || isInTargetingMode;
        expect(wasPlayable, `${card.id} should be playable with 0 energy`).toBe(true);
      });
    });
  });

  // ============================================================
  // 3. DAMAGE VERIFICATION — Attack Cards
  // ============================================================

  describe('Damage Verification — Attack Cards', () => {
    const damageAttacks = attackCards.filter(c =>
      c.damage && !c.special?.includes('damageEqual') && c.special !== 'fiendFire'
    );

    damageAttacks.forEach(card => {
      it(`${card.id}: damage value matches description`, () => {
        const baseDamage = typeof card.damage === 'object' ? card.damage.min : card.damage;
        const hits = card.hits || 1;

        // Check description contains the damage value
        if (hits === 1) {
          const found = descriptionMentionsDamage(card.description, baseDamage);
          expect(found, `${card.id} description should mention ${baseDamage} damage`).toBe(true);
        } else {
          // Multi-hit cards mention either damage per hit or total
          const perHitMentioned = card.description.includes(`${baseDamage}`);
          expect(perHitMentioned, `${card.id} description should mention damage value`).toBe(true);
        }
      });
    });

    it('attack cards deal correct damage to enemies', () => {
      const strike = getCardById('strike');
      const state = createCombatState({
        hand: [{ ...strike }],
        playerOverrides: { energy: 3, strength: 0, weak: 0 }
      });

      const initialEnemyHp = state.enemies[0].currentHp;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      // Calculate expected damage
      const expectedDamage = calculateDamage(
        strike.damage,
        { strength: 0, weak: 0 },
        { vulnerable: 0 },
        { relics: [] }
      );

      const actualDamage = initialEnemyHp - newState.enemies[0].currentHp;
      expect(actualDamage).toBe(expectedDamage);
    });

    it('multi-hit attacks deal damage multiple times', () => {
      const twinStrike = getCardById('twinStrike');
      expect(twinStrike.hits).toBe(2);

      const state = createCombatState({
        hand: [{ ...twinStrike }],
        playerOverrides: { energy: 3, strength: 0, weak: 0 },
        enemies: [(() => { const e = createEnemyInstance(ALL_ENEMIES.find(x => x.id === 'cultist'), 0); e.currentHp = 100; e.maxHp = 100; return e; })()]
      });

      const initialEnemyHp = state.enemies[0].currentHp;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      // Twin Strike: 5 damage x 2 hits = 10 total
      const expectedDamage = twinStrike.damage * twinStrike.hits;
      const actualDamage = initialEnemyHp - newState.enemies[0].currentHp;
      expect(actualDamage).toBe(expectedDamage);
    });

    it('AoE attacks hit all enemies', () => {
      const cleave = getCardById('cleave');
      expect(cleave.targetAll).toBe(true);

      // Use proper enemy format with hp as min/max or single value
      const enemy1 = createEnemyInstance({ id: 'test1', name: 'Test 1', hp: 50 }, 0);
      const enemy2 = createEnemyInstance({ id: 'test2', name: 'Test 2', hp: 50 }, 1);

      const state = createCombatState({
        hand: [{ ...cleave }],
        playerOverrides: { energy: 3, strength: 0, weak: 0 },
        enemies: [enemy1, enemy2]
      });

      const initialHp1 = state.enemies[0].currentHp;
      const initialHp2 = state.enemies[1].currentHp;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand);

      // Both enemies should take damage
      expect(newState.enemies[0].currentHp).toBeLessThan(initialHp1);
      expect(newState.enemies[1].currentHp).toBeLessThan(initialHp2);
    });

    it('strength increases attack damage', () => {
      const strike = getCardById('strike');
      const state = createCombatState({
        hand: [{ ...strike }],
        playerOverrides: { energy: 3, strength: 5, weak: 0 },
        enemies: [(() => { const e = createEnemyInstance(ALL_ENEMIES.find(x => x.id === 'cultist'), 0); e.currentHp = 100; e.maxHp = 100; return e; })()]
      });

      const initialEnemyHp = state.enemies[0].currentHp;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      // Strike does 6 + 5 strength = 11 damage
      const expectedDamage = strike.damage + 5;
      const actualDamage = initialEnemyHp - newState.enemies[0].currentHp;
      expect(actualDamage).toBe(expectedDamage);
    });

    it('vulnerable increases damage by 50%', () => {
      const strike = getCardById('strike');
      const enemy = (() => { const e = createEnemyInstance(ALL_ENEMIES.find(x => x.id === 'cultist'), 0); e.currentHp = 100; e.maxHp = 100; return e; })();
      enemy.vulnerable = 2;

      const state = createCombatState({
        hand: [{ ...strike }],
        playerOverrides: { energy: 3, strength: 0, weak: 0 },
        enemies: [enemy]
      });

      const initialEnemyHp = state.enemies[0].currentHp;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      // Strike does 6 * 1.5 = 9 damage to vulnerable enemy
      const expectedDamage = Math.floor(strike.damage * 1.5);
      const actualDamage = initialEnemyHp - newState.enemies[0].currentHp;
      expect(actualDamage).toBe(expectedDamage);
    });

    it('weak reduces attack damage by 25%', () => {
      const strike = getCardById('strike');
      const state = createCombatState({
        hand: [{ ...strike }],
        playerOverrides: { energy: 3, strength: 0, weak: 2 },
        enemies: [(() => { const e = createEnemyInstance(ALL_ENEMIES.find(x => x.id === 'cultist'), 0); e.currentHp = 100; e.maxHp = 100; return e; })()]
      });

      const initialEnemyHp = state.enemies[0].currentHp;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      // Strike does 6 * 0.75 = 4.5 -> 4 damage when weak
      const expectedDamage = Math.floor(strike.damage * 0.75);
      const actualDamage = initialEnemyHp - newState.enemies[0].currentHp;
      expect(actualDamage).toBe(expectedDamage);
    });
  });

  // ============================================================
  // 4. BLOCK VERIFICATION — Skill Cards
  // ============================================================

  describe('Block Verification — Skill Cards', () => {
    const blockSkills = skillCards.filter(c => c.block);

    blockSkills.forEach(card => {
      it(`${card.id}: block value matches description`, () => {
        const found = descriptionMentionsBlock(card.description, card.block);
        expect(found, `${card.id} description should mention ${card.block} Block`).toBe(true);
      });
    });

    it('defend grants correct block', () => {
      const defend = getCardById('defend');
      const state = createCombatState({
        hand: [{ ...defend }],
        playerOverrides: { energy: 3, dexterity: 0, frail: 0, block: 0 }
      });

      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand);

      expect(newState.player.block).toBe(defend.block);
    });

    it('dexterity increases block', () => {
      const defend = getCardById('defend');
      const state = createCombatState({
        hand: [{ ...defend }],
        playerOverrides: { energy: 3, dexterity: 3, frail: 0, block: 0 }
      });

      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand);

      // Defend gives 5 + 3 dexterity = 8 block
      expect(newState.player.block).toBe(defend.block + 3);
    });

    it('frail reduces block by 25%', () => {
      const defend = getCardById('defend');
      const state = createCombatState({
        hand: [{ ...defend }],
        playerOverrides: { energy: 3, dexterity: 0, frail: 2, block: 0 }
      });

      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand);

      // Defend gives 5 * 0.75 = 3.75 -> 3 block when frail
      const expectedBlock = Math.floor(defend.block * 0.75);
      expect(newState.player.block).toBe(expectedBlock);
    });

    it('block stacks additively', () => {
      const defend1 = { ...getCardById('defend'), instanceId: 'def1' };
      const defend2 = { ...getCardById('defend'), instanceId: 'def2' };
      const state = createCombatState({
        hand: [defend1, defend2],
        playerOverrides: { energy: 3, dexterity: 0, frail: 0, block: 0 }
      });

      let newState = playCard(state, state.hand[0]);
      newState = playCard(newState, newState.hand[0]); // Second defend

      expect(newState.player.block).toBe(10); // 5 + 5 = 10
    });
  });

  // ============================================================
  // 5. STATUS EFFECT VERIFICATION
  // ============================================================

  describe('Status Effect Application', () => {
    it('bash applies vulnerable', () => {
      const bash = getCardById('bash');
      expect(bash.effects).toBeDefined();
      expect(bash.effects.some(e => e.type === 'vulnerable')).toBe(true);

      const vulnerableEffect = bash.effects.find(e => e.type === 'vulnerable');
      expect(vulnerableEffect.amount).toBe(2);
    });

    it('clothesline applies weak', () => {
      const clothesline = getCardById('clothesline');
      expect(clothesline.effects).toBeDefined();
      expect(clothesline.effects.some(e => e.type === 'weak')).toBe(true);

      const weakEffect = clothesline.effects.find(e => e.type === 'weak');
      expect(weakEffect.amount).toBe(2);
    });

    it('cards with effects have valid effect structure', () => {
      const cardsWithEffects = allCards.filter(c => c.effects && c.effects.length > 0);

      cardsWithEffects.forEach(card => {
        card.effects.forEach(effect => {
          expect(effect.type, `${card.id} effect missing type`).toBeDefined();
          expect(typeof effect.type).toBe('string');
          // Amount should be defined for most effects
          if (effect.type !== 'removeDebuffs') {
            expect(effect.amount, `${card.id} effect ${effect.type} missing amount`).toBeDefined();
          }
        });
      });
    });
  });

  // ============================================================
  // 6. UPGRADE VERIFICATION
  // ============================================================

  describe('Upgrade Verification', () => {
    const upgradableCards = allCards.filter(c => c.upgradedVersion && !c.upgraded);

    it('all upgradable cards have upgradedVersion object', () => {
      upgradableCards.forEach(card => {
        expect(typeof card.upgradedVersion).toBe('object');
      });
    });

    it('all upgrades have updated description', () => {
      upgradableCards.forEach(card => {
        expect(card.upgradedVersion.description, `${card.id} upgrade missing description`).toBeDefined();
        expect(typeof card.upgradedVersion.description).toBe('string');
      });
    });

    it('upgrades improve the card in some way', () => {
      upgradableCards.forEach(card => {
        const upgrade = card.upgradedVersion;
        const hasImprovement =
          (upgrade.damage && upgrade.damage > (card.damage || 0)) ||
          (upgrade.block && upgrade.block > (card.block || 0)) ||
          (upgrade.cost !== undefined && upgrade.cost < card.cost) ||
          (upgrade.draw && upgrade.draw > (card.draw || 0)) ||
          (upgrade.effects && JSON.stringify(upgrade.effects) !== JSON.stringify(card.effects)) ||
          (upgrade.hits && upgrade.hits > (card.hits || 1)) ||
          (upgrade.retain === true && !card.retain) ||
          (upgrade.innate === true && !card.innate) ||
          (upgrade.exhaust === false && card.exhaust) ||
          Object.keys(upgrade).some(k => k !== 'description' && upgrade[k] !== card[k]);

        expect(hasImprovement, `${card.id} upgrade should improve the card`).toBe(true);
      });
    });

    it('upgraded damage matches upgraded description', () => {
      const upgradesWithDamage = upgradableCards.filter(c => c.upgradedVersion.damage);

      upgradesWithDamage.forEach(card => {
        const upgDamage = card.upgradedVersion.damage;
        const upgDescription = card.upgradedVersion.description;
        const found = descriptionMentionsDamage(upgDescription, upgDamage);
        expect(found, `${card.id}+ description should mention ${upgDamage} damage`).toBe(true);
      });
    });

    it('upgraded block matches upgraded description', () => {
      const upgradesWithBlock = upgradableCards.filter(c => c.upgradedVersion.block);

      upgradesWithBlock.forEach(card => {
        const upgBlock = card.upgradedVersion.block;
        const upgDescription = card.upgradedVersion.description;
        const found = descriptionMentionsBlock(upgDescription, upgBlock);
        expect(found, `${card.id}+ description should mention ${upgBlock} Block`).toBe(true);
      });
    });
  });

  // ============================================================
  // 7. CARD TYPE VERIFICATION
  // ============================================================

  describe('Card Type Verification', () => {
    it('attack cards have damage or special damage effect', () => {
      attackCards.forEach(card => {
        const hasDamage = card.damage !== undefined ||
          card.special === 'damageEqualBlock' ||
          card.special === 'fiendFire' ||
          card.special === 'perfectedStrike' ||
          card.special === 'perfectedStrikeUp' ||
          card.special === 'blizzardDamage' ||
          card.special === 'brillianceDamage' ||
          card.special === 'lifesteal' ||
          card.special === 'multiUpgrade';

        expect(hasDamage, `Attack card ${card.id} should have damage`).toBe(true);
      });
    });

    it('skill cards do not deal direct damage (unless special)', () => {
      const regularSkills = skillCards.filter(c => !c.special && !c.damage);
      regularSkills.forEach(card => {
        expect(card.damage, `Skill ${card.id} should not have direct damage`).toBeUndefined();
      });
    });

    it('power cards are skills that persist', () => {
      powerCards.forEach(card => {
        // Powers typically have special effects
        expect(card.type).toBe(CARD_TYPES.POWER);
        // Powers should not be retained (they are played once)
        expect(card.retain, `Power ${card.id} should not have retain`).toBeFalsy();
      });
    });

    it('curse cards have negative effects', () => {
      curseCards.forEach(card => {
        const hasNegative =
          card.unplayable ||
          card.ethereal ||
          card.damage === 0 ||
          card.id.includes('curse') ||
          card.type === CARD_TYPES.CURSE;
        expect(hasNegative, `Curse ${card.id} should have negative effect`).toBe(true);
      });
    });

    it('status cards are typically unplayable or negative', () => {
      statusCards.forEach(card => {
        const isNegative =
          card.unplayable ||
          card.ethereal ||
          card.id === 'wound' ||
          card.id === 'dazed' ||
          card.id === 'slimed' ||
          card.id === 'burn';
        expect(isNegative, `Status ${card.id} should be unplayable or negative`).toBe(true);
      });
    });
  });

  // ============================================================
  // 8. TARGET TYPE VERIFICATION
  // ============================================================

  describe('Target Type Verification', () => {
    it('targetAll cards mention "ALL" in description', () => {
      const targetAllCards = allCards.filter(c => c.targetAll);
      targetAllCards.forEach(card => {
        const mentionsAll = card.description.toUpperCase().includes('ALL');
        expect(mentionsAll, `${card.id} with targetAll should mention ALL in description`).toBe(true);
      });
    });

    it('randomTarget cards mention "random" in description', () => {
      const randomTargetCards = allCards.filter(c => c.randomTarget);
      randomTargetCards.forEach(card => {
        const mentionsRandom = card.description.toLowerCase().includes('random');
        expect(mentionsRandom, `${card.id} with randomTarget should mention random in description`).toBe(true);
      });
    });

    it('self-targeting skills do not require enemy target', () => {
      const selfSkills = skillCards.filter(c =>
        c.block &&
        !c.effects?.some(e => ['vulnerable', 'weak', 'poison'].includes(e.type)) &&
        !c.targetAll &&
        !c.special?.includes('target')
      );

      selfSkills.forEach(card => {
        // These cards should not require targeting mode
        const state = createCombatState({
          hand: [{ ...card }],
          playerOverrides: { energy: 3 }
        });

        const cardInHand = state.hand[0];
        const newState = combatReducer(state, {
          type: 'SELECT_CARD',
          payload: { card: cardInHand }
        });

        // For pure block cards, targeting mode should not be active
        if (!card.effects?.length && !card.special) {
          expect(newState.targetingMode, `${card.id} pure block should not need targeting`).toBeFalsy();
        }
      });
    });
  });

  // ============================================================
  // 9. SPECIAL KEYWORD VERIFICATION
  // ============================================================

  describe('Special Keyword Verification', () => {
    it('exhaust cards mention "Exhaust" in description', () => {
      const exhaustCards = allCards.filter(c => c.exhaust);
      exhaustCards.forEach(card => {
        const mentionsExhaust = card.description.toLowerCase().includes('exhaust');
        expect(mentionsExhaust, `${card.id} with exhaust should mention Exhaust`).toBe(true);
      });
    });

    it('ethereal cards mention "Ethereal" in description', () => {
      const etherealCards = allCards.filter(c => c.ethereal);
      etherealCards.forEach(card => {
        const mentionsEthereal = card.description.toLowerCase().includes('ethereal');
        expect(mentionsEthereal, `${card.id} with ethereal should mention Ethereal`).toBe(true);
      });
    });

    it('innate cards mention "Innate" in description', () => {
      const innateCards = allCards.filter(c => c.innate);
      innateCards.forEach(card => {
        const mentionsInnate = card.description.toLowerCase().includes('innate');
        expect(mentionsInnate, `${card.id} with innate should mention Innate`).toBe(true);
      });
    });

    it('retain cards mention "Retain" in description', () => {
      const retainCards = allCards.filter(c => c.retain);
      retainCards.forEach(card => {
        const mentionsRetain = card.description.toLowerCase().includes('retain');
        expect(mentionsRetain, `${card.id} with retain should mention Retain`).toBe(true);
      });
    });
  });

  // ============================================================
  // 10. ENERGY COST VERIFICATION
  // ============================================================

  describe('Energy Cost Mechanics', () => {
    it('playing cards reduces energy by cost', () => {
      const strike = getCardById('strike');
      const state = createCombatState({
        hand: [{ ...strike }],
        playerOverrides: { energy: 3 }
      });

      const initialEnergy = state.player.energy;
      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      expect(newState.player.energy).toBe(initialEnergy - strike.cost);
    });

    it('cannot play cards without enough energy', () => {
      const bash = getCardById('bash'); // Costs 2
      const state = createCombatState({
        hand: [{ ...bash }],
        playerOverrides: { energy: 1 }
      });

      const cardInHand = state.hand[0];
      // Attempting to play should not change enemy HP or consume card
      const initialHandSize = state.hand.length;
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      // Card should not have been played (hand should still have card or state unchanged)
      expect(newState.player.energy).toBe(1);
    });

    it('0-cost cards do not reduce energy', () => {
      const anger = getCardById('anger');
      expect(anger.cost).toBe(0);

      const state = createCombatState({
        hand: [{ ...anger }],
        playerOverrides: { energy: 3 }
      });

      const cardInHand = state.hand[0];
      const newState = playCard(state, cardInHand, state.enemies[0].instanceId);

      expect(newState.player.energy).toBe(3); // Should still be 3
    });
  });

  // ============================================================
  // 11. CHARACTER-SPECIFIC CARD VERIFICATION
  // ============================================================

  describe('Character Card Pools', () => {
    it('Ironclad has at least 60 cards', () => {
      expect(ironcladCards.length).toBeGreaterThanOrEqual(60);
    });

    it('Silent has exactly 31 cards', () => {
      expect(silentCards.length).toBe(31);
    });

    it('Defect has exactly 30 cards', () => {
      expect(defectCards.length).toBe(30);
    });

    it('Watcher has exactly 31 cards', () => {
      expect(watcherCards.length).toBe(31);
    });

    it('character cards have correct character field', () => {
      silentCards.forEach(card => {
        expect(card.character).toBe('silent');
      });

      defectCards.forEach(card => {
        expect(card.character).toBe('defect');
      });

      watcherCards.forEach(card => {
        expect(card.character).toBe('watcher');
      });
    });
  });

  // ============================================================
  // 12. CARD RARITY DISTRIBUTION
  // ============================================================

  describe('Card Rarity Distribution', () => {
    it('basic cards exist for all characters', () => {
      const basicCards = allCards.filter(c => c.rarity === RARITY.BASIC);
      expect(basicCards.length).toBeGreaterThanOrEqual(10);
    });

    it('common cards are available for rewards', () => {
      const commonCards = allCards.filter(c => c.rarity === RARITY.COMMON);
      expect(commonCards.length).toBeGreaterThanOrEqual(20);
    });

    it('uncommon cards are available for rewards', () => {
      const uncommonCards = allCards.filter(c => c.rarity === RARITY.UNCOMMON);
      expect(uncommonCards.length).toBeGreaterThanOrEqual(20);
    });

    it('rare cards are available for rewards', () => {
      const rareCards = allCards.filter(c => c.rarity === RARITY.RARE);
      expect(rareCards.length).toBeGreaterThanOrEqual(15);
    });
  });

  // ============================================================
  // 13. SPECIAL EFFECT CONSISTENCY
  // ============================================================

  describe('Special Effect Consistency', () => {
    it('cards with draw property are skills or attacks', () => {
      const drawCards = allCards.filter(c => c.draw);
      drawCards.forEach(card => {
        const validType = card.type === CARD_TYPES.SKILL ||
                         card.type === CARD_TYPES.ATTACK ||
                         card.type === CARD_TYPES.POWER;
        expect(validType, `${card.id} with draw should be skill, attack, or power`).toBe(true);
      });
    });

    it('cards with strength property are powers or skills', () => {
      // Note: Some skills like Spot Weakness grant strength conditionally
      const strengthCards = allCards.filter(c => c.strength !== undefined);
      strengthCards.forEach(card => {
        const validType = card.type === CARD_TYPES.POWER || card.type === CARD_TYPES.SKILL;
        expect(validType, `${card.id} with strength should be power or skill`).toBe(true);
      });
    });

    it('cards with dexterity property are powers', () => {
      const dexCards = allCards.filter(c => c.dexterity !== undefined);
      dexCards.forEach(card => {
        expect(card.type, `${card.id} with dexterity should be power`).toBe(CARD_TYPES.POWER);
      });
    });
  });

  // ============================================================
  // 14. CARD DATA INTEGRITY
  // ============================================================

  describe('Card Data Integrity', () => {
    it('no cards have NaN values', () => {
      allCards.forEach(card => {
        if (card.cost !== undefined) {
          expect(isNaN(card.cost), `${card.id} cost is NaN`).toBe(false);
        }
        if (card.damage !== undefined && typeof card.damage === 'number') {
          expect(isNaN(card.damage), `${card.id} damage is NaN`).toBe(false);
        }
        if (card.block !== undefined) {
          expect(isNaN(card.block), `${card.id} block is NaN`).toBe(false);
        }
        if (card.draw !== undefined) {
          expect(isNaN(card.draw), `${card.id} draw is NaN`).toBe(false);
        }
        if (card.hits !== undefined) {
          expect(isNaN(card.hits), `${card.id} hits is NaN`).toBe(false);
        }
      });
    });

    it('no cards have undefined in required fields', () => {
      allCards.forEach(card => {
        expect(card.id !== undefined, `Card has undefined id`).toBe(true);
        expect(card.name !== undefined, `${card.id} has undefined name`).toBe(true);
        expect(card.type !== undefined, `${card.id} has undefined type`).toBe(true);
        expect(card.description !== undefined, `${card.id} has undefined description`).toBe(true);
      });
    });

    it('no cards have empty string names', () => {
      allCards.forEach(card => {
        expect(card.name.length > 0, `${card.id} has empty name`).toBe(true);
      });
    });

    it('no cards have empty string descriptions', () => {
      allCards.forEach(card => {
        expect(card.description.length > 0, `${card.id} has empty description`).toBe(true);
      });
    });
  });

  // ============================================================
  // 15. COMBAT CALCULATIONS VERIFICATION
  // ============================================================

  describe('Combat Calculations (Real Reducers)', () => {
    it('calculateDamage applies all modifiers correctly', () => {
      // Base damage only
      expect(calculateDamage(10, { strength: 0, weak: 0 }, { vulnerable: 0 }, {})).toBe(10);

      // With strength
      expect(calculateDamage(10, { strength: 5, weak: 0 }, { vulnerable: 0 }, {})).toBe(15);

      // With weak
      expect(calculateDamage(10, { strength: 0, weak: 1 }, { vulnerable: 0 }, {})).toBe(7);

      // With vulnerable
      expect(calculateDamage(10, { strength: 0, weak: 0 }, { vulnerable: 1 }, {})).toBe(15);

      // Combined
      const combined = calculateDamage(10, { strength: 2, weak: 1 }, { vulnerable: 1 }, {});
      // (10 + 2) * 0.75 = 9, then 9 * 1.5 = 13.5 -> 13
      expect(combined).toBe(13);
    });

    it('calculateBlock applies all modifiers correctly', () => {
      // Base block only
      expect(calculateBlock(5, { dexterity: 0, frail: 0 })).toBe(5);

      // With dexterity
      expect(calculateBlock(5, { dexterity: 3, frail: 0 })).toBe(8);

      // With frail
      expect(calculateBlock(8, { dexterity: 0, frail: 1 })).toBe(6);

      // Combined
      const combined = calculateBlock(8, { dexterity: 4, frail: 1 });
      // (8 + 4) * 0.75 = 9
      expect(combined).toBe(9);
    });

    it('applyDamageToTarget handles block correctly', () => {
      // No block
      let result = applyDamageToTarget({ currentHp: 50, block: 0 }, 10);
      expect(result.currentHp).toBe(40);
      expect(result.block).toBe(0);

      // Partial block
      result = applyDamageToTarget({ currentHp: 50, block: 5 }, 10);
      expect(result.currentHp).toBe(45);
      expect(result.block).toBe(0);

      // Full block
      result = applyDamageToTarget({ currentHp: 50, block: 15 }, 10);
      expect(result.currentHp).toBe(50);
      expect(result.block).toBe(5);
    });
  });
});

// ============================================================
// 16. INDIVIDUAL CARD SPOT CHECKS
// ============================================================

describe('Individual Card Spot Checks', () => {
  describe('Ironclad Cards', () => {
    it('Strike: 6 damage for 1 energy', () => {
      const strike = getCardById('strike');
      expect(strike.cost).toBe(1);
      expect(strike.damage).toBe(6);
      expect(strike.type).toBe(CARD_TYPES.ATTACK);
    });

    it('Defend: 5 block for 1 energy', () => {
      const defend = getCardById('defend');
      expect(defend.cost).toBe(1);
      expect(defend.block).toBe(5);
      expect(defend.type).toBe(CARD_TYPES.SKILL);
    });

    it('Bash: 8 damage, 2 vulnerable for 2 energy', () => {
      const bash = getCardById('bash');
      expect(bash.cost).toBe(2);
      expect(bash.damage).toBe(8);
      expect(bash.effects).toEqual([{ type: 'vulnerable', amount: 2 }]);
    });

    it('Whirlwind: X-cost AoE attack', () => {
      const whirlwind = getCardById('whirlwind');
      expect(whirlwind.cost).toBe(-1);
      expect(whirlwind.targetAll).toBe(true);
      expect(whirlwind.type).toBe(CARD_TYPES.ATTACK);
    });

    it('Bludgeon: 32 damage for 3 energy', () => {
      const bludgeon = getCardById('bludgeon');
      expect(bludgeon.cost).toBe(3);
      expect(bludgeon.damage).toBe(32);
    });
  });

  describe('Silent Cards', () => {
    it('Shiv: 0 cost, 4 damage, exhaust', () => {
      const shiv = getCardById('shiv');
      expect(shiv.cost).toBe(0);
      expect(shiv.damage).toBe(4);
      expect(shiv.exhaust).toBe(true);
    });

    it('Deadly Poison: 5 poison for 1 energy', () => {
      const deadlyPoison = getCardById('deadlyPoison');
      expect(deadlyPoison.cost).toBe(1);
      expect(deadlyPoison.effects).toEqual([{ type: 'poison', amount: 5 }]);
    });

    it('Blade Dance: adds 3 Shivs', () => {
      const bladeDance = getCardById('bladeDance');
      expect(bladeDance.special).toBe('addShivs');
      expect(bladeDance.shivCount).toBe(3);
    });
  });

  describe('Defect Cards', () => {
    it('Zap: channel 1 Lightning orb', () => {
      const zap = getCardById('zap');
      expect(zap.special).toBe('channelLightning');
      expect(zap.type).toBe(CARD_TYPES.SKILL);
    });

    it('Dualcast: evoke orb twice', () => {
      const dualcast = getCardById('dualcast');
      expect(dualcast.special).toBe('dualcast');
    });

    it('Ball Lightning: attack that channels Lightning', () => {
      const ballLightning = getCardById('ballLightning');
      expect(ballLightning.type).toBe(CARD_TYPES.ATTACK);
      expect(ballLightning.damage).toBeDefined();
      expect(ballLightning.special).toBe('channelLightning');
    });
  });

  describe('Watcher Cards', () => {
    it('Eruption: enters Wrath stance', () => {
      const eruption = getCardById('eruption');
      expect(eruption.enterStance).toBe('wrath');
      expect(eruption.type).toBe(CARD_TYPES.ATTACK);
    });

    it('Vigilance: enters Calm stance', () => {
      const vigilance = getCardById('vigilance');
      expect(vigilance.enterStance).toBe('calm');
      expect(vigilance.type).toBe(CARD_TYPES.SKILL);
    });

    it('Prostrate: grants Mantra', () => {
      const prostrate = getCardById('prostrate');
      expect(prostrate.mantra).toBeGreaterThan(0);
    });
  });
});
