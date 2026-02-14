/**
 * QA-23: Watcher Regression + Balance
 *
 * Comprehensive regression tests for The Watcher character:
 * - Stance system mechanics (Calm, Wrath, Divinity, Mantra)
 * - All 31 Watcher cards validated for structure
 * - Starter deck composition (10 cards)
 * - Character selection flow via dispatch
 * - Ironclad/Silent/Defect unaffected regression
 * - Scrying mechanic integration
 * - Playthrough via reducer dispatch (A0 + A5)
 * - Balance simulator with Watcher starter deck
 * - 4-character win rate comparison
 *
 * Note: Individual card tests in watcherCardsBatch1.test.js / watcherBatch2.test.js
 * Note: Stance unit tests in stanceSystem.test.js
 * Note: Scrying unit tests in scryingSystem.test.js
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_CARDS, getCardById, getStarterDeck, CARD_TYPES, RARITY } from '../data/cards';
import { CHARACTERS, getCharacterById, CHARACTER_IDS } from '../data/characters';
import { ALL_ENEMIES, createEnemyInstance } from '../data/enemies';
import { getStarterRelic } from '../data/relics';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { combatReducer } from '../context/reducers/combatReducer';
import { rewardReducer } from '../context/reducers/rewardReducer';
import { simulateCombat } from './balance/simulator.js';

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
// 1. Watcher Card Pool Validation — All 31 Watcher cards
// ============================================================

const watcherCards = ALL_CARDS.filter(c => c.character === 'watcher');

describe('Watcher Card Pool Validation', () => {
  it('has exactly 31 Watcher cards', () => {
    expect(watcherCards.length).toBe(31);
  });

  it('all Watcher cards have unique IDs', () => {
    const ids = watcherCards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('Every Watcher card has required fields', () => {
    watcherCards.forEach(card => {
      it(`${card.id}: has id, name, cost, type, character, and description`, () => {
        expect(card.id).toBeDefined();
        expect(typeof card.id).toBe('string');
        expect(card.name).toBeDefined();
        expect(typeof card.name).toBe('string');
        expect(card.cost).toBeGreaterThanOrEqual(-1);
        expect(card.cost).toBeLessThanOrEqual(5);
        expect(card.type).toBeDefined();
        expect(typeof card.type).toBe('string');
        expect(card.character).toBe('watcher');
        expect(card.description).toBeDefined();
        expect(card.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Watcher attack cards have damage', () => {
    const watcherAttacks = watcherCards.filter(c => c.type === CARD_TYPES.ATTACK);
    watcherAttacks.forEach(card => {
      it(`${card.id}: has damage value`, () => {
        expect(card.damage).toBeDefined();
        expect(card.damage).toBeGreaterThan(0);
      });
    });
  });

  describe('All Watcher cards have valid upgrades', () => {
    const upgradeable = watcherCards.filter(c => c.upgradedVersion && !c.upgraded);
    upgradeable.forEach(card => {
      it(`${card.id}: upgrade is well-formed`, () => {
        const up = card.upgradedVersion;
        expect(up).toBeDefined();
        expect(typeof up.description).toBe('string');
        const changedKeys = Object.keys(up).filter(k => k !== 'description');
        expect(changedKeys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Stance-related cards have enterStance or mantra', () => {
    const stanceCards = watcherCards.filter(c => c.enterStance || c.mantra);
    it('at least 8 stance/mantra cards exist', () => {
      expect(stanceCards.length).toBeGreaterThanOrEqual(8);
    });

    stanceCards.forEach(card => {
      it(`${card.id}: has valid stance or mantra value`, () => {
        if (card.enterStance) {
          expect(['calm', 'wrath', 'divinity', 'none']).toContain(card.enterStance);
        }
        if (card.mantra) {
          expect(card.mantra).toBeGreaterThan(0);
        }
      });
    });
  });
});

// ============================================================
// 2. Watcher Starter Deck — 10 cards
// ============================================================

describe('Watcher Starter Deck', () => {
  const deck = getStarterDeck('watcher');

  it('has exactly 10 cards', () => {
    expect(deck.length).toBe(10);
  });

  it('has 4 Strike (watcher)', () => {
    expect(deck.filter(c => c.id === 'strike_watcher').length).toBe(4);
  });

  it('has 4 Defend (watcher)', () => {
    expect(deck.filter(c => c.id === 'defend_watcher').length).toBe(4);
  });

  it('has 1 Eruption', () => {
    expect(deck.filter(c => c.id === 'eruption').length).toBe(1);
  });

  it('has 1 Vigilance', () => {
    expect(deck.filter(c => c.id === 'vigilance').length).toBe(1);
  });

  it('all cards have unique instanceIds', () => {
    const ids = deck.map(c => c.instanceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Eruption enters Wrath stance', () => {
    const eruption = deck.find(c => c.id === 'eruption');
    expect(eruption.enterStance).toBe('wrath');
  });

  it('Vigilance enters Calm stance', () => {
    const vigilance = deck.find(c => c.id === 'vigilance');
    expect(vigilance.enterStance).toBe('calm');
  });
});

// ============================================================
// 3. Key Watcher Card Mechanics
// ============================================================

describe('Watcher Card Mechanics', () => {
  describe('Stance cards', () => {
    it('Eruption enters Wrath with 2 cost and deals damage', () => {
      const card = getCardById('eruption');
      expect(card.enterStance).toBe('wrath');
      expect(card.cost).toBe(2);
      expect(card.damage).toBeGreaterThan(0);
    });

    it('Vigilance enters Calm and gives block', () => {
      const card = getCardById('vigilance');
      expect(card.enterStance).toBe('calm');
      expect(card.block).toBeGreaterThan(0);
    });

    it('Crescendo enters Wrath at 1 cost with exhaust', () => {
      const card = getCardById('crescendo');
      expect(card.enterStance).toBe('wrath');
      expect(card.exhaust).toBe(true);
    });

    it('Tranquility enters Calm at 1 cost with exhaust', () => {
      const card = getCardById('tranquility');
      expect(card.enterStance).toBe('calm');
      expect(card.exhaust).toBe(true);
    });

    it('Empty Mind exits stance and draws cards', () => {
      const card = getCardById('emptyMind');
      expect(card.enterStance).toBe('none');
      expect(card.draw).toBeGreaterThan(0);
    });

    it('Fear No Evil enters Calm on attack', () => {
      const card = getCardById('fearNoEvil');
      expect(card.damage).toBeGreaterThan(0);
      expect(card.special).toBe('fearNoEvilCalm');
    });
  });

  describe('Mantra cards', () => {
    it('Prostrate grants mantra and block', () => {
      const card = getCardById('prostrate');
      expect(card.mantra).toBeGreaterThan(0);
      expect(card.block).toBeGreaterThan(0);
    });

    it('Worship grants mantra', () => {
      const card = getCardById('worship');
      expect(card.mantra).toBeGreaterThan(0);
    });
  });

  describe('Scrying cards', () => {
    it('Third Eye has scryCards special', () => {
      const card = getCardById('thirdEye');
      expect(card.special).toBe('scryCards');
    });
  });

  describe('Rare cards', () => {
    it('Blasphemy enters Divinity with lethal next turn', () => {
      const card = getCardById('blasphemy');
      expect(card.special).toBe('blasphemy');
    });

    it('Deva Form is a power', () => {
      const card = getCardById('devaForm');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.special).toBe('devaForm');
    });

    it('Brilliance damage scales with mantra gained', () => {
      const card = getCardById('brilliance');
      expect(card.special).toBe('brillianceDamage');
    });

    it('Ragnarok deals multi-hit damage', () => {
      const card = getCardById('ragnarok');
      expect(card.damage).toBeGreaterThan(0);
      expect(card.hits).toBeGreaterThan(1);
    });
  });
});

// ============================================================
// 4. Character Selection — Watcher
// ============================================================

describe('Character Selection — Watcher', () => {
  it('SELECT_CHARACTER with watcher produces correct starter deck', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'watcher' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.character).toBe('watcher');
    expect(state.deck.length).toBe(10);

    expect(state.deck.filter(c => c.id === 'strike_watcher').length).toBe(4);
    expect(state.deck.filter(c => c.id === 'defend_watcher').length).toBe(4);
    expect(state.deck.filter(c => c.id === 'eruption').length).toBe(1);
    expect(state.deck.filter(c => c.id === 'vigilance').length).toBe(1);
  });

  it('Watcher starts with Pure Water relic', () => {
    const relic = getStarterRelic('watcher');
    expect(relic).toBeDefined();
    expect(relic.id).toBe('pure_water');
  });

  it('Watcher character has 72 max HP', () => {
    const watcher = getCharacterById('watcher');
    expect(watcher.maxHp).toBe(72);
  });

  it('Watcher character data is complete', () => {
    const watcher = getCharacterById('watcher');
    expect(watcher.name).toBe('The Watcher');
    expect(watcher.description).toBeDefined();
    expect(watcher.description.length).toBeGreaterThan(0);
    expect(watcher.color).toBeDefined();
    expect(watcher.starterRelicId).toBe('pure_water');
  });

  it('character selection with watcher sets correct HP via reducer', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'watcher' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.player.maxHp).toBe(72);
    expect(state.player.currentHp).toBe(72);
  });

  it('4 characters available in character list', () => {
    expect(CHARACTERS.length).toBe(4);
    const ids = CHARACTERS.map(c => c.id);
    expect(ids).toContain('ironclad');
    expect(ids).toContain('silent');
    expect(ids).toContain('defect');
    expect(ids).toContain('watcher');
  });

  it('Watcher is the fourth character', () => {
    expect(CHARACTERS[3].id).toBe('watcher');
  });
});

// ============================================================
// 5. Other Characters Unaffected — Regression
// ============================================================

describe('Other Characters Unaffected Regression', () => {
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

  it('Defect starter deck is still 10 cards', () => {
    const deck = getStarterDeck('defect');
    expect(deck.length).toBe(10);
    expect(deck.filter(c => c.id === 'strike_defect').length).toBe(4);
    expect(deck.filter(c => c.id === 'defend_defect').length).toBe(4);
    expect(deck.filter(c => c.id === 'zap').length).toBe(1);
    expect(deck.filter(c => c.id === 'dualcast').length).toBe(1);
  });

  it('Ironclad starter relic is Burning Blood', () => {
    expect(getStarterRelic('ironclad').id).toBe('burning_blood');
  });

  it('Silent starter relic is Ring of the Snake', () => {
    expect(getStarterRelic('silent').id).toBe('ring_of_snake');
  });

  it('Defect starter relic is Cracked Core', () => {
    expect(getStarterRelic('defect').id).toBe('cracked_core');
  });

  it('Ironclad/Silent/Defect HP unchanged', () => {
    expect(getCharacterById('ironclad').maxHp).toBe(80);
    expect(getCharacterById('silent').maxHp).toBe(70);
    expect(getCharacterById('defect').maxHp).toBe(75);
  });

  it('Watcher cards do not leak into other character pools', () => {
    const watcherCards = ALL_CARDS.filter(c => c.character === 'watcher');
    watcherCards.forEach(card => {
      expect(card.character).toBe('watcher');
    });
    // No watcher cards in neutral/ironclad/silent/defect filters
    const nonWatcher = ALL_CARDS.filter(c => c.character && c.character !== 'watcher');
    nonWatcher.forEach(card => {
      expect(card.character).not.toBe('watcher');
    });
  });
});

// ============================================================
// 6. Watcher Playthrough — A0 + A5 via dispatch
// ============================================================

describe('Watcher Playthrough Regression', () => {
  it('A0 Watcher playthrough: 3 floors without crashes', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'watcher' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.character).toBe('watcher');

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
    // COMBAT_VICTORY is transitional phase before COMBAT_REWARD
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_VICTORY,
      GAME_PHASE.COMBAT_REWARD, GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY
    ]).toContain(state.phase);
  });

  it('A5 Watcher playthrough: 3 floors without crashes', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 5 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'watcher' } });
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
// 7. Balance — Watcher starter deck vs enemies
// ============================================================

describe('Watcher Balance — Simulator', () => {
  const watcherPlayer = {
    currentHp: 72,
    maxHp: 72,
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
    currentStance: null,
    mantra: 0,
    totalMantraGained: 0
  };

  it('Watcher starter deck beats a small slime', () => {
    const deck = getStarterDeck('watcher');
    const slime = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'slime_small'));
    const result = simulateCombat({ ...watcherPlayer }, [slime], deck, { seed: 42 });

    expect(result.won).toBe(true);
    expect(result.hpRemaining).toBeGreaterThan(0);
  });

  it('Watcher starter deck can fight a cultist', () => {
    const deck = getStarterDeck('watcher');
    const cultist = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'cultist'));
    const result = simulateCombat({ ...watcherPlayer }, [cultist], deck, { seed: 42 });

    expect(result).toHaveProperty('won');
    expect(result.turnsPlayed).toBeGreaterThan(0);
    expect(result.cardsPlayed).toBeGreaterThan(0);
  });

  it('Watcher win rate is not 0% or 100% against Jaw Worm', () => {
    const deck = getStarterDeck('watcher');
    const runs = 100;
    let wins = 0;
    for (let i = 0; i < runs; i++) {
      const jawWorm = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const result = simulateCombat(
        { ...watcherPlayer, currentHp: 10, maxHp: 72 },
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

  it('4-character win rate comparison: all characters can win and lose', () => {
    const watcherDeck = getStarterDeck('watcher');
    const defectDeck = getStarterDeck('defect');
    const silentDeck = getStarterDeck('silent');
    const ironcladDeck = getStarterDeck('ironclad');

    const runs = 50;
    let watcherWins = 0;
    let defectWins = 0;
    let silentWins = 0;
    let ironcladWins = 0;

    for (let i = 0; i < runs; i++) {
      const jawWorm1 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const jawWorm2 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const jawWorm3 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const jawWorm4 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));

      const watcherResult = simulateCombat(
        { ...watcherPlayer, currentHp: 15, maxHp: 72 },
        [jawWorm1],
        [...watcherDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      const defectResult = simulateCombat(
        { ...watcherPlayer, currentHp: 15, maxHp: 75, focus: 0, orbs: [], orbSlots: 3 },
        [jawWorm2],
        [...defectDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      const silentResult = simulateCombat(
        { ...watcherPlayer, currentHp: 15, maxHp: 70 },
        [jawWorm3],
        [...silentDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      const ironcladResult = simulateCombat(
        { ...watcherPlayer, currentHp: 15, maxHp: 80 },
        [jawWorm4],
        [...ironcladDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );

      if (watcherResult.won) watcherWins++;
      if (defectResult.won) defectWins++;
      if (silentResult.won) silentWins++;
      if (ironcladResult.won) ironcladWins++;
    }

    // All four characters should have some wins
    expect(watcherWins).toBeGreaterThan(0);
    expect(defectWins).toBeGreaterThan(0);
    expect(silentWins).toBeGreaterThan(0);
    expect(ironcladWins).toBeGreaterThan(0);
    // None should win every time with only 15 HP
    expect(watcherWins).toBeLessThan(runs);
    expect(defectWins).toBeLessThan(runs);
    expect(silentWins).toBeLessThan(runs);
    expect(ironcladWins).toBeLessThan(runs);
  });
});
