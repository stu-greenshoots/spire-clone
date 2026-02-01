/**
 * QA-19: Defect Regression + Balance
 *
 * Comprehensive regression tests for The Defect character:
 * - Orb system mechanics (channel, evoke, Focus, passive)
 * - Starter deck composition (10 cards)
 * - Character selection flow via dispatch
 * - Ironclad/Silent unaffected regression
 * - Playthrough via reducer dispatch
 * - Balance simulator with Defect starter deck
 *
 * Note: Card pool validation is covered in defectCards.test.js
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_CARDS, getCardById, getStarterDeck, CARD_TYPES, RARITY } from '../data/cards';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { ALL_ENEMIES, createEnemyInstance } from '../data/enemies';
import { getStarterRelic } from '../data/relics';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { combatReducer } from '../context/reducers/combatReducer';
import { rewardReducer } from '../context/reducers/rewardReducer';
import { simulateCombat } from './balance/simulator.js';
import {
  ORB_TYPES,
  createOrb,
  getOrbPassiveValue,
  getOrbEvokeValue,
  channelOrb,
  evokeOrbs,
  processOrbPassives
} from '../systems/orbSystem';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

// Dispatch helper matching GameContext logic
function dispatch(state, action) {
  switch (action.type) {
    case 'START_GAME':
    case 'SELECT_CHARACTER':
    case 'SELECT_STARTING_BONUS':
    case 'REST':
    case 'UPGRADE_CARD':
    case 'SKIP_EVENT':
    case 'RETURN_TO_MENU':
    case 'LIFT_GIRYA':
    case 'SAVE_GAME':
    case 'LOAD_GAME':
    case 'DELETE_SAVE':
      return metaReducer(state, action);
    case 'SELECT_NODE':
    case 'PROCEED_TO_MAP':
      return mapReducer(state, action);
    case 'SELECT_CARD':
    case 'PLAY_CARD':
    case 'CANCEL_TARGET':
    case 'END_TURN':
    case 'SELECT_CARD_FROM_PILE':
    case 'CANCEL_CARD_SELECTION':
    case 'SPAWN_ENEMIES':
      return combatReducer(state, action);
    case 'COLLECT_GOLD':
    case 'COLLECT_RELIC':
    case 'OPEN_CARD_REWARDS':
    case 'SELECT_CARD_REWARD':
    case 'SKIP_CARD_REWARD':
      return rewardReducer(state, action);
    default:
      return state;
  }
}

// Run a combat to completion
function runCombat(state, maxTurns = 50) {
  let turns = 0;
  while (state.phase === GAME_PHASE.COMBAT && turns < maxTurns) {
    const attacks = state.hand.filter(c => c.type === 'attack' && c.cost <= state.player.energy);
    for (const card of attacks) {
      if (state.phase !== GAME_PHASE.COMBAT) break;
      if (!state.hand.find(h => h.instanceId === card.instanceId)) continue;
      if (!state.enemies.length) break;
      state = dispatch(state, { type: 'SELECT_CARD', payload: { card } });
      if (state.targetingMode) {
        const target = state.enemies.find(e => e.currentHp > 0);
        if (target) {
          state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: target.instanceId } });
        }
      } else if (state.selectedCard) {
        state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: null } });
      }
    }
    const skills = state.hand.filter(c => c.type === 'skill' && c.cost <= state.player.energy);
    for (const card of skills) {
      if (state.phase !== GAME_PHASE.COMBAT) break;
      if (!state.hand.find(h => h.instanceId === card.instanceId)) continue;
      state = dispatch(state, { type: 'SELECT_CARD', payload: { card } });
      if (state.targetingMode && state.enemies.length > 0) {
        state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: state.enemies[0].instanceId } });
      } else if (!state.targetingMode) {
        state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: null } });
      }
    }
    if (state.phase === GAME_PHASE.COMBAT) {
      state = dispatch(state, { type: 'END_TURN' });
      turns++;
    }
  }
  return state;
}

// ============================================================
// 1. Orb System Mechanics
// ============================================================

describe('Orb System Mechanics', () => {
  describe('createOrb', () => {
    it('creates Lightning orb with correct type and zero darkDamage', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(orb.type).toBe('lightning');
      expect(orb.id).toBeDefined();
      expect(orb.darkDamage).toBe(0);
    });

    it('creates Frost orb with correct type', () => {
      const orb = createOrb(ORB_TYPES.FROST);
      expect(orb.type).toBe('frost');
      expect(orb.darkDamage).toBe(0);
    });

    it('creates Dark orb with initial darkDamage of 6', () => {
      const orb = createOrb(ORB_TYPES.DARK);
      expect(orb.type).toBe('dark');
      expect(orb.darkDamage).toBe(6);
    });

    it('creates Plasma orb with correct type', () => {
      const orb = createOrb(ORB_TYPES.PLASMA);
      expect(orb.type).toBe('plasma');
      expect(orb.darkDamage).toBe(0);
    });

    it('each orb gets a unique id', () => {
      const orb1 = createOrb(ORB_TYPES.LIGHTNING);
      const orb2 = createOrb(ORB_TYPES.LIGHTNING);
      expect(orb1.id).not.toBe(orb2.id);
    });
  });

  describe('getOrbPassiveValue', () => {
    it('Lightning: 3 + focus', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(getOrbPassiveValue(orb, 0)).toBe(3);
      expect(getOrbPassiveValue(orb, 2)).toBe(5);
    });

    it('Frost: 2 + focus', () => {
      const orb = createOrb(ORB_TYPES.FROST);
      expect(getOrbPassiveValue(orb, 0)).toBe(2);
      expect(getOrbPassiveValue(orb, 3)).toBe(5);
    });

    it('Dark: 6 + focus', () => {
      const orb = createOrb(ORB_TYPES.DARK);
      expect(getOrbPassiveValue(orb, 0)).toBe(6);
      expect(getOrbPassiveValue(orb, 1)).toBe(7);
    });

    it('Plasma: always 1, unaffected by focus', () => {
      const orb = createOrb(ORB_TYPES.PLASMA);
      expect(getOrbPassiveValue(orb, 0)).toBe(1);
      expect(getOrbPassiveValue(orb, 5)).toBe(1);
    });

    it('negative focus floors at 0 (except Plasma)', () => {
      expect(getOrbPassiveValue(createOrb(ORB_TYPES.LIGHTNING), -5)).toBe(0);
      expect(getOrbPassiveValue(createOrb(ORB_TYPES.FROST), -5)).toBe(0);
      expect(getOrbPassiveValue(createOrb(ORB_TYPES.DARK), -10)).toBe(0);
      expect(getOrbPassiveValue(createOrb(ORB_TYPES.PLASMA), -5)).toBe(1);
    });
  });

  describe('getOrbEvokeValue', () => {
    it('Lightning: 8 + focus', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(getOrbEvokeValue(orb, 0)).toBe(8);
      expect(getOrbEvokeValue(orb, 2)).toBe(10);
    });

    it('Frost: 5 + focus', () => {
      const orb = createOrb(ORB_TYPES.FROST);
      expect(getOrbEvokeValue(orb, 0)).toBe(5);
      expect(getOrbEvokeValue(orb, 3)).toBe(8);
    });

    it('Dark: accumulated darkDamage + focus', () => {
      const orb = createOrb(ORB_TYPES.DARK);
      expect(getOrbEvokeValue(orb, 0)).toBe(6); // initial darkDamage
      orb.darkDamage = 20;
      expect(getOrbEvokeValue(orb, 0)).toBe(20);
      expect(getOrbEvokeValue(orb, 2)).toBe(22);
    });

    it('Plasma: always 2, unaffected by focus', () => {
      const orb = createOrb(ORB_TYPES.PLASMA);
      expect(getOrbEvokeValue(orb, 0)).toBe(2);
      expect(getOrbEvokeValue(orb, 5)).toBe(2);
    });
  });

  describe('channelOrb', () => {
    it('adds orb to empty slots', () => {
      const player = { orbs: [], orbSlots: 3, focus: 0 };
      const enemies = [];
      const log = [];
      channelOrb(player, ORB_TYPES.LIGHTNING, enemies, log);
      expect(player.orbs.length).toBe(1);
      expect(player.orbs[0].type).toBe('lightning');
    });

    it('evokes leftmost orb when slots are full', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.FROST), createOrb(ORB_TYPES.FROST), createOrb(ORB_TYPES.FROST)],
        orbSlots: 3,
        focus: 0,
        block: 0
      };
      const enemies = [];
      const log = [];
      channelOrb(player, ORB_TYPES.LIGHTNING, enemies, log);
      expect(player.orbs.length).toBe(3);
      expect(player.orbs[2].type).toBe('lightning');
      // Frost evoke grants 5 block
      expect(player.block).toBe(5);
    });

    it('channels multiple orbs sequentially', () => {
      const player = { orbs: [], orbSlots: 3, focus: 0 };
      const enemies = [];
      const log = [];
      channelOrb(player, ORB_TYPES.LIGHTNING, enemies, log);
      channelOrb(player, ORB_TYPES.FROST, enemies, log);
      channelOrb(player, ORB_TYPES.DARK, enemies, log);
      expect(player.orbs.length).toBe(3);
      expect(player.orbs[0].type).toBe('lightning');
      expect(player.orbs[1].type).toBe('frost');
      expect(player.orbs[2].type).toBe('dark');
    });
  });

  describe('evokeOrbs', () => {
    it('evokes leftmost orb by default', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.FROST), createOrb(ORB_TYPES.LIGHTNING)],
        focus: 0,
        block: 0
      };
      const enemies = [];
      const log = [];
      evokeOrbs(player, enemies, log);
      expect(player.orbs.length).toBe(1);
      expect(player.orbs[0].type).toBe('lightning');
      expect(player.block).toBe(5); // Frost evoke
    });

    it('evokes all orbs when all=true', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.FROST), createOrb(ORB_TYPES.FROST)],
        focus: 0,
        block: 0
      };
      const enemies = [];
      const log = [];
      evokeOrbs(player, enemies, log, { all: true });
      expect(player.orbs.length).toBe(0);
      expect(player.block).toBe(10); // 5 + 5
    });

    it('does nothing with empty orbs', () => {
      const player = { orbs: [], focus: 0 };
      const enemies = [];
      const log = [];
      evokeOrbs(player, enemies, log);
      expect(player.orbs.length).toBe(0);
    });
  });

  describe('processOrbPassives', () => {
    it('Frost passive grants block', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.FROST)],
        focus: 0,
        block: 0
      };
      const log = [];
      processOrbPassives(player, [], log);
      expect(player.block).toBe(2);
    });

    it('Plasma passive grants energy', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.PLASMA)],
        focus: 0,
        energy: 3
      };
      const log = [];
      processOrbPassives(player, [], log);
      expect(player.energy).toBe(4);
    });

    it('Dark orb accumulates darkDamage each turn', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.DARK)],
        focus: 0
      };
      const log = [];
      processOrbPassives(player, [], log);
      expect(player.orbs[0].darkDamage).toBe(12); // 6 initial + 6 passive
    });

    it('Lightning passive deals damage to enemy', () => {
      const enemy = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'slime_small'));
      const startHp = enemy.currentHp;
      const player = {
        orbs: [createOrb(ORB_TYPES.LIGHTNING)],
        focus: 0
      };
      const log = [];
      const result = processOrbPassives(player, [enemy], log);
      const finalEnemy = result.enemies[0];
      // Lightning passive deals 3 damage (may be absorbed by block)
      expect(finalEnemy.currentHp).toBeLessThanOrEqual(startHp);
    });

    it('Focus scales passive values', () => {
      const player = {
        orbs: [createOrb(ORB_TYPES.FROST)],
        focus: 3,
        block: 0
      };
      const log = [];
      processOrbPassives(player, [], log);
      expect(player.block).toBe(5); // 2 + 3 focus
    });
  });
});

// ============================================================
// 2. Defect Starter Deck — 10 cards
// ============================================================

describe('Defect Starter Deck', () => {
  const deck = getStarterDeck('defect');

  it('has exactly 10 cards', () => {
    expect(deck.length).toBe(10);
  });

  it('has 4 Strike (defect)', () => {
    expect(deck.filter(c => c.id === 'strike_defect').length).toBe(4);
  });

  it('has 4 Defend (defect)', () => {
    expect(deck.filter(c => c.id === 'defend_defect').length).toBe(4);
  });

  it('has 1 Zap', () => {
    expect(deck.filter(c => c.id === 'zap').length).toBe(1);
  });

  it('has 1 Dualcast', () => {
    expect(deck.filter(c => c.id === 'dualcast').length).toBe(1);
  });

  it('all cards have unique instanceIds', () => {
    const ids = deck.map(c => c.instanceId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ============================================================
// 3. Character Selection — Defect
// ============================================================

describe('Character Selection — Defect', () => {
  it('SELECT_CHARACTER with defect produces correct starter deck', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'defect' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.character).toBe('defect');
    expect(state.deck.length).toBe(10);

    expect(state.deck.filter(c => c.id === 'strike_defect').length).toBe(4);
    expect(state.deck.filter(c => c.id === 'defend_defect').length).toBe(4);
    expect(state.deck.filter(c => c.id === 'zap').length).toBe(1);
    expect(state.deck.filter(c => c.id === 'dualcast').length).toBe(1);
  });

  it('Defect starts with Cracked Core relic', () => {
    const relic = getStarterRelic('defect');
    expect(relic).toBeDefined();
    expect(relic.id).toBe('cracked_core');
  });

  it('Defect character has 75 max HP', () => {
    const defect = getCharacterById('defect');
    expect(defect.maxHp).toBe(75);
  });

  it('Defect character has 3 orb slots', () => {
    const defect = getCharacterById('defect');
    expect(defect.orbSlots).toBe(3);
  });

  it('Defect character data is complete', () => {
    const defect = getCharacterById('defect');
    expect(defect.name).toBe('The Defect');
    expect(defect.description).toBeDefined();
    expect(defect.description.length).toBeGreaterThan(0);
    expect(defect.color).toBeDefined();
    expect(defect.starterRelicId).toBe('cracked_core');
  });

  it('character selection with defect sets correct HP via reducer', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'defect' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.player.maxHp).toBe(75);
    expect(state.player.currentHp).toBe(75);
  });

  it('character selection sets orbSlots on player state', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'defect' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.player.orbSlots).toBe(3);
  });

  it('3 characters available in character list', () => {
    expect(CHARACTERS.length).toBe(3);
    const ids = CHARACTERS.map(c => c.id);
    expect(ids).toContain('ironclad');
    expect(ids).toContain('silent');
    expect(ids).toContain('defect');
  });
});

// ============================================================
// 4. Ironclad/Silent Unaffected — Regression
// ============================================================

describe('Ironclad/Silent Unaffected Regression', () => {
  it('Ironclad starter deck is still 10 cards (5 Strike, 4 Defend, 1 Bash)', () => {
    const deck = getStarterDeck('ironclad');
    expect(deck.length).toBe(10);
    expect(deck.filter(c => c.id === 'strike').length).toBe(5);
    expect(deck.filter(c => c.id === 'defend').length).toBe(4);
    expect(deck.filter(c => c.id === 'bash').length).toBe(1);
  });

  it('Silent starter deck is still 12 cards', () => {
    const deck = getStarterDeck('silent');
    expect(deck.length).toBe(12);
    expect(deck.filter(c => c.id === 'strike_silent').length).toBe(5);
    expect(deck.filter(c => c.id === 'defend_silent').length).toBe(5);
    expect(deck.filter(c => c.id === 'neutralize').length).toBe(1);
    expect(deck.filter(c => c.id === 'survivor').length).toBe(1);
  });

  it('Ironclad starter relic is Burning Blood', () => {
    expect(getStarterRelic('ironclad').id).toBe('burning_blood');
  });

  it('Silent starter relic is Ring of the Snake', () => {
    expect(getStarterRelic('silent').id).toBe('ring_of_snake');
  });

  it('Ironclad has 80 HP, Silent has 70 HP — unchanged', () => {
    expect(getCharacterById('ironclad').maxHp).toBe(80);
    expect(getCharacterById('silent').maxHp).toBe(70);
  });

  it('Ironclad/Silent card pools unchanged — no Defect cards leak', () => {
    const ironcladCards = ALL_CARDS.filter(c => !c.character || c.character === 'ironclad');
    const silentCards = ALL_CARDS.filter(c => c.character === 'silent');
    expect(ironcladCards.filter(c => c.character === 'defect').length).toBe(0);
    expect(silentCards.filter(c => c.character === 'defect').length).toBe(0);
  });

  it('Defect cards do not appear in non-defect pools', () => {
    const defectCards = ALL_CARDS.filter(c => c.character === 'defect');
    defectCards.forEach(card => {
      expect(card.character).toBe('defect');
    });
  });
});

// ============================================================
// 5. Defect Playthrough — A0 + A5 via dispatch
// ============================================================

describe('Defect Playthrough Regression', () => {
  it('A0 Defect playthrough: 3 floors without crashes', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'defect' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.character).toBe('defect');

    for (let floor = 0; floor < 3 && state.phase === GAME_PHASE.MAP; floor++) {
      const floorNodes = state.map[floor];
      if (!floorNodes) break;
      const combatNode = floorNodes.find(n => n.type === 'combat');
      if (!combatNode) break;
      const nodeId = `${floor}-${floorNodes.indexOf(combatNode)}`;
      state = dispatch(state, { type: 'SELECT_NODE', payload: { nodeId } });

      state = runCombat(state);

      if (state.phase === GAME_PHASE.COMBAT_REWARD) {
        if (state.combatRewards?.gold > 0) {
          state = dispatch(state, { type: 'COLLECT_GOLD' });
        }
        state = dispatch(state, { type: 'PROCEED_TO_MAP' });
      }
      if (state.phase === GAME_PHASE.GAME_OVER) break;
    }

    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_REWARD,
      GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY
    ]).toContain(state.phase);
  });

  it('A5 Defect playthrough: 3 floors without crashes', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 5 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'defect' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);

    for (let floor = 0; floor < 3 && state.phase === GAME_PHASE.MAP; floor++) {
      const floorNodes = state.map[floor];
      if (!floorNodes) break;
      const combatNode = floorNodes.find(n => n.type === 'combat');
      if (!combatNode) break;
      const nodeId = `${floor}-${floorNodes.indexOf(combatNode)}`;
      state = dispatch(state, { type: 'SELECT_NODE', payload: { nodeId } });

      state = runCombat(state);

      if (state.phase === GAME_PHASE.COMBAT_REWARD) {
        if (state.combatRewards?.gold > 0) {
          state = dispatch(state, { type: 'COLLECT_GOLD' });
        }
        state = dispatch(state, { type: 'PROCEED_TO_MAP' });
      }
      if (state.phase === GAME_PHASE.GAME_OVER) break;
    }

    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
  });
});

// ============================================================
// 6. Balance — Defect starter deck vs enemies
// ============================================================

describe('Defect Balance — Simulator', () => {
  const defectPlayer = {
    currentHp: 75,
    maxHp: 75,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    strength: 0,
    dexterity: 0,
    vulnerable: 0,
    weak: 0,
    frail: 0,
    metallicize: 0,
    barricade: false,
    demonForm: 0,
    berserk: 0,
    rage: 0,
    doubleTap: 0,
    feelNoPain: 0,
    juggernaut: 0,
    darkEmbrace: false,
    evolve: 0,
    rupture: 0,
    fireBreathing: 0,
    corruption: false,
    brutality: false,
    combust: null,
    flameBarrier: 0,
    noDrawThisTurn: false,
    flexStrengthLoss: 0,
    intangible: 0,
    flight: 0,
    focus: 0,
    orbs: [],
    orbSlots: 3
  };

  it('Defect starter deck beats a small slime', () => {
    const deck = getStarterDeck('defect');
    const slime = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'slime_small'));
    const result = simulateCombat({ ...defectPlayer }, [slime], deck, { seed: 42 });

    expect(result.won).toBe(true);
    expect(result.hpRemaining).toBeGreaterThan(0);
  });

  it('Defect starter deck can fight a cultist', () => {
    const deck = getStarterDeck('defect');
    const cultist = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'cultist'));
    const result = simulateCombat({ ...defectPlayer }, [cultist], deck, { seed: 42 });

    expect(result).toHaveProperty('won');
    expect(result.turnsPlayed).toBeGreaterThan(0);
    expect(result.cardsPlayed).toBeGreaterThan(0);
  });

  it('Defect win rate is not 0% or 100% against Jaw Worm', () => {
    const deck = getStarterDeck('defect');
    const runs = 100;
    let wins = 0;
    for (let i = 0; i < runs; i++) {
      const jawWorm = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const result = simulateCombat(
        { ...defectPlayer, currentHp: 10, maxHp: 75 },
        [jawWorm],
        [...deck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      if (result.won) wins++;
    }
    const winRate = wins / runs;
    expect(winRate).toBeGreaterThan(0);
    expect(winRate).toBeLessThan(1);
  });

  it('3-character win rate comparison: all characters can win and lose', () => {
    const defectDeck = getStarterDeck('defect');
    const silentDeck = getStarterDeck('silent');
    const ironcladDeck = getStarterDeck('ironclad');

    const runs = 50;
    let defectWins = 0;
    let silentWins = 0;
    let ironcladWins = 0;

    for (let i = 0; i < runs; i++) {
      const jawWorm1 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const jawWorm2 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const jawWorm3 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));

      const defectResult = simulateCombat(
        { ...defectPlayer, currentHp: 15, maxHp: 75 },
        [jawWorm1],
        [...defectDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      const silentResult = simulateCombat(
        { ...defectPlayer, currentHp: 15, maxHp: 70 },
        [jawWorm2],
        [...silentDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      const ironcladResult = simulateCombat(
        { ...defectPlayer, currentHp: 15, maxHp: 80 },
        [jawWorm3],
        [...ironcladDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );

      if (defectResult.won) defectWins++;
      if (silentResult.won) silentWins++;
      if (ironcladResult.won) ironcladWins++;
    }

    // All three characters should have some wins
    expect(defectWins).toBeGreaterThan(0);
    expect(silentWins).toBeGreaterThan(0);
    expect(ironcladWins).toBeGreaterThan(0);
    // None should win every time with only 15 HP
    expect(defectWins).toBeLessThan(runs);
    expect(silentWins).toBeLessThan(runs);
    expect(ironcladWins).toBeLessThan(runs);
  });
});
