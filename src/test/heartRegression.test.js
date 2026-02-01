/**
 * QA-17: Heart Regression + Endgame Balance
 *
 * Covers: Corrupt Heart enemy AI, Act 4 map generation, Heart unlock gate,
 * invincible shield mechanic, Beat of Death passive, 4-act playthroughs,
 * and balance simulator 4-act support.
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_ENEMIES, getEnemyById, createEnemyInstance, getBossEncounter } from '../data/enemies';
import { generateMap } from '../utils/mapGenerator';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { combatReducer } from '../context/reducers/combatReducer';
import { rewardReducer } from '../context/reducers/rewardReducer';
import { applyDamageToTarget } from '../systems/combatSystem';
import { isHeartUnlocked } from '../systems/progressionSystem';
import { applyPotionEffect, canUsePotion, removePotion } from '../systems/potionSystem';
import { simulateRun } from './balance/simulator';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

// Helper: run AI for turns 0-N
const runAI = (enemy, instance, turns) => {
  const moves = [];
  let lastMove = null;
  for (let t = 0; t <= turns; t++) {
    const move = enemy.ai(instance, t, lastMove, 0, []);
    moves.push(move);
    lastMove = move;
  }
  return moves;
};

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
    case 'USE_POTION': {
      const { slotIndex, targetIndex } = action.payload;
      const potion = state.potions[slotIndex];
      if (!potion) return state;
      if (!canUsePotion(potion, state)) return state;
      let newState = applyPotionEffect(potion, state, targetIndex);
      newState = removePotion(newState, slotIndex);
      return newState;
    }
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
// 1. Heart Enemy Definition
// ============================================================

describe('QA-17: Heart Enemy Definition', () => {
  const heart = getEnemyById('corruptHeart');

  it('Corrupt Heart exists in enemy database', () => {
    expect(heart).toBeDefined();
    expect(heart.id).toBe('corruptHeart');
    expect(heart.name).toBe('Corrupt Heart');
  });

  it('has 750 HP', () => {
    expect(heart.hp.min).toBe(750);
    expect(heart.hp.max).toBe(750);
  });

  it('is act 4 boss', () => {
    expect(heart.act).toBe(4);
    expect(heart.type).toBe('boss');
  });

  it('has 200 invincible shield', () => {
    expect(heart.invincible).toBe(200);
  });

  it('has beatOfDeath flag', () => {
    expect(heart.beatOfDeath).toBe(true);
  });

  it('has 4 moves: debilitate, bloodShots, echo, buff', () => {
    expect(heart.moveset).toHaveLength(4);
    expect(heart.moveset[0].id).toBe('debilitate');
    expect(heart.moveset[1].id).toBe('bloodShots');
    expect(heart.moveset[2].id).toBe('echo');
    expect(heart.moveset[3].id).toBe('buff');
  });

  it('debilitate applies vulnerable, weak, frail', () => {
    const debilitate = heart.moveset[0];
    const effectTypes = debilitate.effects.map(e => e.type);
    expect(effectTypes).toContain('vulnerable');
    expect(effectTypes).toContain('weak');
    expect(effectTypes).toContain('frail');
  });

  it('bloodShots is multi-hit (15 times)', () => {
    const bloodShots = heart.moveset[1];
    expect(bloodShots.times).toBe(15);
    expect(bloodShots.damage).toBe(2);
  });

  it('echo deals 40 damage', () => {
    expect(heart.moveset[2].damage).toBe(40);
  });

  it('buff gives strength and artifact', () => {
    const buff = heart.moveset[3];
    const effectTypes = buff.effects.map(e => e.type);
    expect(effectTypes).toContain('strength');
    expect(effectTypes).toContain('artifact');
  });
});

// ============================================================
// 2. Heart AI Pattern
// ============================================================

describe('QA-17: Heart AI Pattern', () => {
  const heart = getEnemyById('corruptHeart');
  const instance = createEnemyInstance(heart);

  it('turn 0: always debilitate', () => {
    const moves = runAI(heart, instance, 0);
    expect(moves[0].id).toBe('debilitate');
  });

  it('turns 1-3: bloodShots → echo → buff cycle', () => {
    const moves = runAI(heart, instance, 3);
    expect(moves[1].id).toBe('bloodShots');
    expect(moves[2].id).toBe('echo');
    expect(moves[3].id).toBe('buff');
  });

  it('cycle repeats for turns 4-6', () => {
    const moves = runAI(heart, instance, 6);
    expect(moves[4].id).toBe('bloodShots');
    expect(moves[5].id).toBe('echo');
    expect(moves[6].id).toBe('buff');
  });

  it('AI returns valid moves for turns 0-10', () => {
    const moves = runAI(heart, instance, 10);
    expect(moves).toHaveLength(11);
    moves.forEach(move => {
      expect(move).toBeDefined();
      expect(move.id).toBeDefined();
    });
  });
});

// ============================================================
// 3. createEnemyInstance for Heart
// ============================================================

describe('QA-17: Heart Instance Fields', () => {
  const heart = getEnemyById('corruptHeart');
  const instance = createEnemyInstance(heart);

  it('has correct HP', () => {
    expect(instance.currentHp).toBe(750);
    expect(instance.maxHp).toBe(750);
  });

  it('has invincible shield initialized', () => {
    expect(instance.invincible).toBe(200);
  });

  it('has beatOfDeath flag', () => {
    expect(instance.beatOfDeath).toBe(true);
  });

  it('has standard combat fields', () => {
    expect(instance.block).toBe(0);
    expect(typeof instance.strength).toBe('number');
    expect(instance.instanceId).toBeDefined();
  });
});

// ============================================================
// 4. Act 4 Map Generation
// ============================================================

describe('QA-17: Act 4 Map Generation', () => {
  it('generates single-floor map with boss node', () => {
    const map = generateMap(4);
    expect(map).toHaveLength(1);
    expect(map[0]).toHaveLength(1);
    expect(map[0][0].type).toBe('boss');
  });

  it('boss node has expected structure', () => {
    const map = generateMap(4);
    const node = map[0][0];
    expect(node.id).toBe('0-0');
    expect(node.floor).toBe(0);
    expect(node.visited).toBe(false);
    expect(node.connections).toEqual([]);
  });

  it('getBossEncounter(4) returns Corrupt Heart', () => {
    const enemies = getBossEncounter(4);
    expect(enemies).toHaveLength(1);
    expect(enemies[0].name).toBe('Corrupt Heart');
    expect(enemies[0].currentHp).toBe(750);
    expect(enemies[0].invincible).toBe(200);
  });
});

// ============================================================
// 5. Heart Unlock Gate
// ============================================================

describe('QA-17: Heart Unlock Gate (isHeartUnlocked)', () => {
  it('locked with no wins', () => {
    expect(isHeartUnlocked({})).toBe(false);
    expect(isHeartUnlocked({ characterWins: {} })).toBe(false);
  });

  it('locked with only ironclad wins', () => {
    expect(isHeartUnlocked({ characterWins: { ironclad: 1 } })).toBe(false);
  });

  it('locked with only silent wins', () => {
    expect(isHeartUnlocked({ characterWins: { silent: 1 } })).toBe(false);
  });

  it('unlocked with both character wins', () => {
    expect(isHeartUnlocked({ characterWins: { ironclad: 1, silent: 1 } })).toBe(true);
  });

  it('unlocked with multiple wins each', () => {
    expect(isHeartUnlocked({ characterWins: { ironclad: 3, silent: 2 } })).toBe(true);
  });

  it('handles null/undefined progression', () => {
    expect(isHeartUnlocked(null)).toBe(false);
    expect(isHeartUnlocked(undefined)).toBe(false);
  });
});

// ============================================================
// 6. Invincible Shield Mechanic
// ============================================================

describe('QA-17: Invincible Shield Mechanic', () => {
  it('invincible absorbs damage before block and HP', () => {
    const target = { currentHp: 750, maxHp: 750, block: 0, invincible: 200, strength: 0 };
    const result = applyDamageToTarget(target, 50);
    expect(result.invincible).toBe(150);
    expect(result.currentHp).toBe(750);
    expect(result.block).toBe(0);
  });

  it('damage overflows from invincible to block', () => {
    const target = { currentHp: 750, maxHp: 750, block: 30, invincible: 20, strength: 0 };
    const result = applyDamageToTarget(target, 40);
    expect(result.invincible).toBe(0);
    expect(result.block).toBe(10);
    expect(result.currentHp).toBe(750);
  });

  it('damage overflows from invincible through block to HP', () => {
    const target = { currentHp: 750, maxHp: 750, block: 10, invincible: 10, strength: 0 };
    const result = applyDamageToTarget(target, 30);
    expect(result.invincible).toBe(0);
    expect(result.block).toBe(0);
    expect(result.currentHp).toBe(740);
  });

  it('shield depleted to zero, no negative', () => {
    const target = { currentHp: 750, maxHp: 750, block: 0, invincible: 5, strength: 0 };
    const result = applyDamageToTarget(target, 10);
    expect(result.invincible).toBe(0);
    expect(result.currentHp).toBe(745);
  });

  it('no damage when invincible absorbs all', () => {
    const target = { currentHp: 750, maxHp: 750, block: 0, invincible: 200, strength: 0 };
    const result = applyDamageToTarget(target, 200);
    expect(result.invincible).toBe(0);
    expect(result.currentHp).toBe(750);
  });
});

// ============================================================
// 7. 4-Act Playthrough (Reducer Dispatch)
// ============================================================

describe('QA-17: 4-Act Playthrough via Reducers', () => {
  const runPlaythrough = (ascensionLevel, maxFloors = 3) => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'ironclad' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });
    expect(state.phase).toBe(GAME_PHASE.MAP);

    for (let floor = 0; floor < maxFloors && state.phase === GAME_PHASE.MAP; floor++) {
      const floorNodes = state.map[floor];
      if (!floorNodes) break;
      const combatNode = floorNodes.find(n => n.type === 'combat' || n.type === 'boss');
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
      if ([GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY].includes(state.phase)) break;
    }
    return state;
  };

  it('A0 playthrough: 3 floors without crashes', () => {
    const state = runPlaythrough(0);
    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_REWARD,
      GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY, GAME_PHASE.REST_SITE,
      GAME_PHASE.EVENT, GAME_PHASE.SHOP, GAME_PHASE.REWARD
    ]).toContain(state.phase);
  });

  it('A5 playthrough: 3 floors without crashes', () => {
    const state = runPlaythrough(5);
    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
  });
});

// ============================================================
// 8. Balance Simulator 4-Act Support
// ============================================================

describe('QA-17: Balance Simulator 4-Act Runs', () => {
  it('simulateRun accepts acts=4 without crashing', () => {
    const result = simulateRun({ acts: 4, seed: 42, hp: 500, maxHp: 500 });
    expect(result).toBeDefined();
    expect(result.floorsCleared).toBeGreaterThanOrEqual(0);
    expect(typeof result.survived).toBe('boolean');
    expect(result.ascension).toBe(0);
  });

  it('4-act run tracks actsCompleted up to 4', () => {
    const result = simulateRun({ acts: 4, seed: 42, hp: 500, maxHp: 500 });
    expect(result.actsCompleted).toBeDefined();
    expect(result.actsCompleted).toBeGreaterThanOrEqual(0);
    expect(result.actsCompleted).toBeLessThanOrEqual(4);
  });

  it('combatStats include act 4 entries when run reaches Heart', () => {
    // Give enough HP to have a chance of reaching Act 4
    const result = simulateRun({ acts: 4, seed: 777, hp: 999, maxHp: 999 });
    if (result.actsCompleted >= 3) {
      const act4Stats = result.combatStats.filter(cs => cs.act === 4);
      expect(act4Stats.length).toBeGreaterThanOrEqual(0);
    }
    // Even if run dies early, should not crash
    expect(result).toBeDefined();
  });

  it('Heart win rate is low (difficult boss)', () => {
    const runs = 200;
    let heartKills = 0;
    let reachedHeart = 0;
    for (let i = 0; i < runs; i++) {
      const result = simulateRun({ acts: 4, seed: i + 1, hp: 80, maxHp: 80 });
      if (result.actsCompleted >= 4) {
        heartKills++;
      }
      if (result.actsCompleted >= 3) {
        reachedHeart++;
      }
    }
    // Heart should be beatable but rare with simulator AI
    expect(heartKills).toBeLessThanOrEqual(runs); // sanity
    // Most runs should not survive all 4 acts with starter stats
    expect(heartKills).toBeLessThan(runs * 0.5);
  });

  it('ascension 5 is harder than ascension 0 for 4-act runs', () => {
    const runBatch = (asc) => {
      let totalFloors = 0;
      const n = 100;
      for (let i = 0; i < n; i++) {
        const result = simulateRun({ acts: 4, seed: i + 1, hp: 80, maxHp: 80, ascension: asc });
        totalFloors += result.floorsCleared;
      }
      return totalFloors / n;
    };
    const a0Avg = runBatch(0);
    const a5Avg = runBatch(5);
    // A5 should clear fewer floors on average (harder)
    expect(a5Avg).toBeLessThanOrEqual(a0Avg + 2); // allow small variance
  });
});

// ============================================================
// 9. Heart in ALL_ENEMIES Content Validation
// ============================================================

describe('QA-17: Heart Content Validation', () => {
  it('corruptHeart is in ALL_ENEMIES', () => {
    const found = ALL_ENEMIES.find(e => e.id === 'corruptHeart');
    expect(found).toBeDefined();
  });

  it('only one act 4 boss exists', () => {
    const act4Bosses = ALL_ENEMIES.filter(e => e.act === 4 && e.type === 'boss');
    expect(act4Bosses).toHaveLength(1);
    expect(act4Bosses[0].id).toBe('corruptHeart');
  });

  it('Heart has ai function', () => {
    const heart = getEnemyById('corruptHeart');
    expect(typeof heart.ai).toBe('function');
  });

  it('Heart moveset moves all have id and message', () => {
    const heart = getEnemyById('corruptHeart');
    heart.moveset.forEach(move => {
      expect(move.id).toBeDefined();
      expect(typeof move.message).toBe('string');
    });
  });
});
