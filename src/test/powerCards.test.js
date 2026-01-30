import { describe, it, expect } from 'vitest';
import { handlePlayCard } from '../context/reducers/combat/playCardAction';
import { CARD_TYPES } from '../data/cards';
import { createEnemyInstance, getEnemyById } from '../data/enemies';

// Minimal state factory for testing handlePlayCard
const makeState = (overrides = {}) => ({
  player: {
    currentHp: 50,
    maxHp: 80,
    block: 0,
    energy: 3,
    strength: 0,
    dexterity: 0,
    weak: 0,
    vulnerable: 0,
    frail: 0,
    cardsPlayedThisTurn: 0,
    attacksPlayedThisTurn: 0,
    skillsPlayedThisTurn: 0,
    powersPlayedThisTurn: 0,
    corruption: false,
    darkEmbrace: false,
    feelNoPain: 0,
    rage: 0,
    juggernaut: 0,
    doubleTap: 0,
    penNibActive: false,
    noDrawThisTurn: false,
    hex: 0,
    rupture: 0,
    ...overrides.player
  },
  enemies: overrides.enemies || [createEnemyInstance(getEnemyById('jawWorm'))],
  hand: overrides.hand || [],
  drawPile: overrides.drawPile || [],
  discardPile: overrides.discardPile || [],
  exhaustPile: overrides.exhaustPile || [],
  combatLog: [],
  relics: overrides.relics || [],
  selectedCard: null,
  targetingMode: false,
  deck: overrides.deck || [],
  runStats: { cardsPlayed: 0, cardsPlayedById: {}, damageDealt: 0, enemiesKilled: 0, defeatedEnemies: [], goldEarned: 0 },
  currentFloor: 0,
  turn: 1,
  currentNode: { type: 'normal' },
  ...overrides
});

const makePowerCard = (overrides = {}) => ({
  id: 'inflame',
  name: 'Inflame',
  type: CARD_TYPES.POWER,
  cost: 1,
  effects: [{ self: true, type: 'strength', amount: 2 }],
  instanceId: 'inflame_test_1',
  ...overrides
});

const makeSkillCard = (overrides = {}) => ({
  id: 'defend',
  name: 'Defend',
  type: CARD_TYPES.SKILL,
  cost: 1,
  block: 5,
  instanceId: 'defend_test_1',
  ...overrides
});

const makeAttackCard = (overrides = {}) => ({
  id: 'strike',
  name: 'Strike',
  type: CARD_TYPES.ATTACK,
  cost: 1,
  damage: 6,
  instanceId: 'strike_test_1',
  ...overrides
});

describe('Power Card Behavior', () => {
  it('should NOT add power card to discard pile after play', () => {
    const power = makePowerCard();
    const state = makeState({ hand: [power] });
    const result = handlePlayCard(state, { payload: { card: power } });

    expect(result.discardPile).toHaveLength(0);
    expect(result.exhaustPile).toHaveLength(0);
    expect(result.hand.find(c => c.instanceId === power.instanceId)).toBeUndefined();
  });

  it('should still add skill cards to discard pile after play', () => {
    const skill = makeSkillCard();
    const state = makeState({ hand: [skill] });
    const result = handlePlayCard(state, { payload: { card: skill } });

    expect(result.discardPile).toHaveLength(1);
    expect(result.discardPile[0].instanceId).toBe(skill.instanceId);
  });

  it('should still add attack cards to discard pile after play', () => {
    const attack = makeAttackCard();
    const state = makeState({ hand: [attack] });
    const result = handlePlayCard(state, { payload: { card: attack } });

    expect(result.discardPile).toHaveLength(1);
    expect(result.discardPile[0].instanceId).toBe(attack.instanceId);
  });

  it('power card effects should persist (strength gained)', () => {
    const power = makePowerCard();
    const state = makeState({ hand: [power] });
    const result = handlePlayCard(state, { payload: { card: power } });

    expect(result.player.strength).toBe(2);
  });

  it('corruption should exhaust skills but NOT powers', () => {
    const power = makePowerCard();
    const skill = makeSkillCard();
    const state = makeState({
      hand: [power, skill],
      player: { corruption: true }
    });

    // Play the power
    const afterPower = handlePlayCard(state, { payload: { card: power } });
    expect(afterPower.discardPile).toHaveLength(0);
    expect(afterPower.exhaustPile).toHaveLength(0);

    // Play the skill with corruption active
    const afterSkill = handlePlayCard(afterPower, { payload: { card: skill } });
    expect(afterSkill.exhaustPile).toHaveLength(1);
    expect(afterSkill.exhaustPile[0].instanceId).toBe(skill.instanceId);
  });

  it('Dead Branch should NOT trigger when a power is played (not exhausted)', () => {
    const power = makePowerCard();
    const state = makeState({
      hand: [power],
      relics: [{ id: 'dead_branch', name: 'Dead Branch' }]
    });
    const result = handlePlayCard(state, { payload: { card: power } });

    // Power is not exhausted, so Dead Branch should not add a card
    // Hand should be empty (power removed, no Dead Branch card added)
    expect(result.hand).toHaveLength(0);
    expect(result.discardPile).toHaveLength(0);
    expect(result.exhaustPile).toHaveLength(0);
  });

  it('power card with exhaust flag should go to exhaust pile (edge case)', () => {
    const power = makePowerCard({ exhaust: true });
    const state = makeState({ hand: [power] });
    const result = handlePlayCard(state, { payload: { card: power } });

    // Exhaust takes precedence - card goes to exhaust pile
    expect(result.exhaustPile).toHaveLength(1);
    expect(result.discardPile).toHaveLength(0);
  });
});
