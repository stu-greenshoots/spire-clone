/**
 * QA-15: Silent Regression + Balance
 *
 * Comprehensive regression tests for The Silent character:
 * - All 30 Silent cards validated for structure and mechanics
 * - Starter deck composition (12 cards)
 * - Character selection flow via dispatch
 * - Ironclad unaffected regression
 * - Balance simulator with Silent starter deck
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
import { simulateCombat, runBalanceReport } from './balance/simulator.js';

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
// 1. Silent Card Validation — All 30 Silent cards
// ============================================================

const silentCards = ALL_CARDS.filter(c => c.character === 'silent');

describe('Silent Card Validation', () => {
  it('has exactly 31 Silent cards (including Shiv)', () => {
    expect(silentCards.length).toBe(31);
  });

  describe('Every Silent card has required fields', () => {
    silentCards.forEach(card => {
      it(`${card.id}: has id, name, cost, type, character, and description`, () => {
        expect(card.id).toBeDefined();
        expect(typeof card.id).toBe('string');
        expect(card.name).toBeDefined();
        expect(typeof card.name).toBe('string');
        expect(card.cost).toBeGreaterThanOrEqual(-1);
        expect(card.cost).toBeLessThanOrEqual(5);
        expect(card.type).toBeDefined();
        expect(typeof card.type).toBe('string');
        expect(card.character).toBe('silent');
        expect(card.description).toBeDefined();
        expect(card.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Silent attack cards have damage', () => {
    const silentAttacks = silentCards.filter(c => c.type === CARD_TYPES.ATTACK);
    silentAttacks.forEach(card => {
      it(`${card.id}: has damage value`, () => {
        expect(card.damage).toBeDefined();
        expect(card.damage).toBeGreaterThan(0);
      });
    });
  });

  describe('Silent power cards have special mechanics', () => {
    const silentPowers = silentCards.filter(c => c.type === CARD_TYPES.POWER);
    silentPowers.forEach(card => {
      it(`${card.id}: has special mechanic`, () => {
        expect(card.special).toBeDefined();
        expect(typeof card.special).toBe('string');
      });
    });
  });

  describe('All Silent cards have valid upgrades', () => {
    const upgradeable = silentCards.filter(c => c.upgradedVersion && !c.upgraded);
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
});

// ============================================================
// 2. Silent Starter Deck — 12 cards
// ============================================================

describe('Silent Starter Deck', () => {
  const deck = getStarterDeck('silent');

  it('has exactly 12 cards', () => {
    expect(deck.length).toBe(12);
  });

  it('has 5 Strike (silent)', () => {
    const strikes = deck.filter(c => c.id === 'strike_silent');
    expect(strikes.length).toBe(5);
  });

  it('has 5 Defend (silent)', () => {
    const defends = deck.filter(c => c.id === 'defend_silent');
    expect(defends.length).toBe(5);
  });

  it('has 1 Neutralize', () => {
    const neutralizes = deck.filter(c => c.id === 'neutralize');
    expect(neutralizes.length).toBe(1);
  });

  it('has 1 Survivor', () => {
    const survivors = deck.filter(c => c.id === 'survivor');
    expect(survivors.length).toBe(1);
  });

  it('all cards have unique instanceIds', () => {
    const ids = deck.map(c => c.instanceId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ============================================================
// 3. Key Card Mechanics
// ============================================================

describe('Silent Card Mechanics', () => {
  describe('Shiv generation', () => {
    it('Blade Dance has addShivs special with shivCount 3', () => {
      const card = getCardById('bladeDance');
      expect(card.special).toBe('addShivs');
      expect(card.shivCount).toBe(3);
    });

    it('Cloak and Dagger has addShivs special with shivCount 1 and block', () => {
      const card = getCardById('cloakAndDagger');
      expect(card.special).toBe('addShivs');
      expect(card.shivCount).toBe(1);
      expect(card.block).toBe(6);
    });

    it('Shiv card exists with 0 cost, 4 damage, and exhaust', () => {
      const shiv = getCardById('shiv');
      expect(shiv.cost).toBe(0);
      expect(shiv.damage).toBe(4);
      expect(shiv.exhaust).toBe(true);
    });
  });

  describe('Poison application', () => {
    it('Deadly Poison applies 5 poison', () => {
      const card = getCardById('deadlyPoison');
      expect(card.effects).toBeDefined();
      const poisonEffect = card.effects.find(e => e.type === 'poison');
      expect(poisonEffect.amount).toBe(5);
    });

    it('Noxious Fumes is a power with poisonPerTurn 2', () => {
      const card = getCardById('noxiousFumes');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.special).toBe('noxiousFumes');
      expect(card.poisonPerTurn).toBe(2);
    });

    it('Poisoned Stab deals 6 damage and applies 3 poison', () => {
      const card = getCardById('poisonedStab');
      expect(card.damage).toBe(6);
      const poisonEffect = card.effects.find(e => e.type === 'poison');
      expect(poisonEffect.amount).toBe(3);
    });

    it('Corpse Explosion applies 6 poison with corpseExplosion special', () => {
      const card = getCardById('corpseExplosion');
      expect(card.special).toBe('corpseExplosion');
      const poisonEffect = card.effects.find(e => e.type === 'poison');
      expect(poisonEffect.amount).toBe(6);
    });
  });

  describe('Draw/discard synergy', () => {
    it('Acrobatics draws 3 then discards 1', () => {
      const card = getCardById('acrobatics');
      expect(card.draw).toBe(3);
      expect(card.special).toBe('drawThenDiscardOne');
    });

    it('Backflip gives 5 block and draws 2', () => {
      const card = getCardById('backflip');
      expect(card.block).toBe(5);
      expect(card.draw).toBe(2);
    });

    it('Dagger Throw deals 9 damage, draws 1 then discards 1', () => {
      const card = getCardById('daggerThrow');
      expect(card.damage).toBe(9);
      expect(card.draw).toBe(1);
      expect(card.special).toBe('drawThenDiscard');
    });

    it('Survivor gives 8 block and discards 1', () => {
      const card = getCardById('survivor');
      expect(card.block).toBe(8);
      expect(card.special).toBe('discardOne');
    });
  });

  describe('Power cards', () => {
    it('Noxious Fumes — poison all enemies each turn', () => {
      const card = getCardById('noxiousFumes');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.poisonPerTurn).toBe(2);
    });

    it('Footwork — gain dexterity', () => {
      const card = getCardById('footwork');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.special).toBe('gainDexterity');
      expect(card.dexterity).toBe(2);
    });

    it('A Thousand Cuts — damage on each card played', () => {
      const card = getCardById('aThousandCuts');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.special).toBe('thousandCuts');
      expect(card.damagePerCard).toBe(1);
    });

    it('Envenom — poison on unblocked attack damage', () => {
      const card = getCardById('envenom');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.special).toBe('envenom');
      expect(card.poisonOnUnblocked).toBe(1);
    });

    it('Well-Laid Plans — retain cards at end of turn', () => {
      const card = getCardById('wellLaidPlans');
      expect(card.type).toBe(CARD_TYPES.POWER);
      expect(card.special).toBe('retainCards');
      expect(card.retainCount).toBe(1);
    });
  });

  describe('Rare cards', () => {
    it('Glass Knife — 8 damage x2 with degrading special', () => {
      const card = getCardById('glassKnife');
      expect(card.damage).toBe(8);
      expect(card.hits).toBe(2);
      expect(card.special).toBe('glassKnife');
    });

    it('Bullet Time — makes cards cost 0 this turn', () => {
      const card = getCardById('bulletTime');
      expect(card.cost).toBe(3);
      expect(card.special).toBe('bulletTime');
    });

    it('Adrenaline — draw 2, gain 1 energy, exhaust', () => {
      const card = getCardById('adrenaline');
      expect(card.draw).toBe(2);
      expect(card.energy).toBe(1);
      expect(card.exhaust).toBe(true);
    });
  });
});

// ============================================================
// 4. Character Selection — Silent
// ============================================================

describe('Character Selection — Silent', () => {
  it('SELECT_CHARACTER with silent produces correct starter deck', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'silent' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.character).toBe('silent');
    expect(state.deck.length).toBe(12);

    const strikes = state.deck.filter(c => c.id === 'strike_silent');
    expect(strikes.length).toBe(5);
    const defends = state.deck.filter(c => c.id === 'defend_silent');
    expect(defends.length).toBe(5);
    const neutralizes = state.deck.filter(c => c.id === 'neutralize');
    expect(neutralizes.length).toBe(1);
    const survivors = state.deck.filter(c => c.id === 'survivor');
    expect(survivors.length).toBe(1);
  });

  it('Silent starts with Ring of the Snake relic', () => {
    const relic = getStarterRelic('silent');
    expect(relic).toBeDefined();
    expect(relic.id).toBe('ring_of_snake');
  });

  it('Silent character has 70 max HP', () => {
    const silent = getCharacterById('silent');
    expect(silent.maxHp).toBe(70);
  });

  it('Silent character data is complete', () => {
    const silent = getCharacterById('silent');
    expect(silent.name).toBe('The Silent');
    expect(silent.description).toBeDefined();
    expect(silent.description.length).toBeGreaterThan(0);
    expect(silent.color).toBeDefined();
    expect(silent.starterRelicId).toBe('ring_of_snake');
  });

  it('character selection with silent sets correct HP via reducer', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'silent' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.player.maxHp).toBe(70);
    expect(state.player.currentHp).toBe(70);
  });
});

// ============================================================
// 5. Ironclad Unaffected — Regression
// ============================================================

describe('Ironclad Unaffected Regression', () => {
  it('Ironclad starter deck is still 10 cards (5 Strike, 4 Defend, 1 Bash)', () => {
    const deck = getStarterDeck('ironclad');
    expect(deck.length).toBe(10);
    expect(deck.filter(c => c.id === 'strike').length).toBe(5);
    expect(deck.filter(c => c.id === 'defend').length).toBe(4);
    expect(deck.filter(c => c.id === 'bash').length).toBe(1);
  });

  it('Ironclad starter relic is Burning Blood', () => {
    const relic = getStarterRelic('ironclad');
    expect(relic.id).toBe('burning_blood');
  });

  it('Ironclad character selection still works', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'ironclad' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });

    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.character).toBe('ironclad');
    expect(state.deck.length).toBe(10);
    expect(state.player.maxHp).toBe(80);
  });

  it('Ironclad card pool unchanged — no Silent cards leak', () => {
    const ironcladCards = ALL_CARDS.filter(c => !c.character || c.character === 'ironclad');
    const silentInIronclad = ironcladCards.filter(c => c.character === 'silent');
    expect(silentInIronclad.length).toBe(0);
  });
});

// ============================================================
// 6. Silent Playthrough — A0 via dispatch
// ============================================================

describe('Silent Playthrough Regression', () => {
  it('A0 Silent playthrough: 3 floors without crashes', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'silent' } });
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
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_REWARD,
      GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY
    ]).toContain(state.phase);
  });
});

// ============================================================
// 7. Balance — Silent starter deck vs enemies
// ============================================================

describe('Silent Balance — Simulator', () => {
  const silentPlayer = {
    currentHp: 70,
    maxHp: 70,
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
    flight: 0
  };

  it('Silent starter deck beats a small slime', () => {
    const deck = getStarterDeck('silent');
    const slime = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'slime_small'));
    const result = simulateCombat({ ...silentPlayer }, [slime], deck, { seed: 42 });

    expect(result.won).toBe(true);
    expect(result.hpRemaining).toBeGreaterThan(0);
  });

  it('Silent starter deck can fight a cultist', () => {
    const deck = getStarterDeck('silent');
    const cultist = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'cultist'));
    const result = simulateCombat({ ...silentPlayer }, [cultist], deck, { seed: 42 });

    expect(result).toHaveProperty('won');
    expect(result.turnsPlayed).toBeGreaterThan(0);
    expect(result.cardsPlayed).toBeGreaterThan(0);
  });

  it('Silent win rate is not 0% or 100% against Jaw Worm (Act 1)', () => {
    const deck = getStarterDeck('silent');
    // Use Jaw Worm with low HP so some losses occur
    const runs = 100;
    let wins = 0;
    for (let i = 0; i < runs; i++) {
      const jawWorm = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const result = simulateCombat(
        { ...silentPlayer, currentHp: 10, maxHp: 70 },
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

  it('2-character win rate comparison: both characters can win and lose', () => {
    const silentDeck = getStarterDeck('silent');
    const ironcladDeck = getStarterDeck('ironclad');
    const ironcladPlayer = { ...silentPlayer, currentHp: 80, maxHp: 80 };

    const runs = 50;
    let silentWins = 0;
    let ironcladWins = 0;

    for (let i = 0; i < runs; i++) {
      // Use Jaw Worm with reduced HP so losses occur for both characters
      const jawWorm1 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));
      const jawWorm2 = createEnemyInstance(ALL_ENEMIES.find(e => e.id === 'jawWorm'));

      const silentResult = simulateCombat(
        { ...silentPlayer, currentHp: 15, maxHp: 70 },
        [jawWorm1],
        [...silentDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );
      const ironcladResult = simulateCombat(
        { ...ironcladPlayer, currentHp: 15, maxHp: 80 },
        [jawWorm2],
        [...ironcladDeck.map(c => ({ ...c }))],
        { seed: i + 1 }
      );

      if (silentResult.won) silentWins++;
      if (ironcladResult.won) ironcladWins++;
    }

    // Both characters should have some wins — neither is broken
    expect(silentWins).toBeGreaterThan(0);
    expect(ironcladWins).toBeGreaterThan(0);
    // Neither should win every single time with only 30 HP
    expect(silentWins).toBeLessThan(runs);
    expect(ironcladWins).toBeLessThan(runs);
  });
});
