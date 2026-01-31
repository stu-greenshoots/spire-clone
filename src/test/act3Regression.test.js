/**
 * QA-13: Act 3 Regression Tests
 *
 * Covers: Act 3 enemy AI, encounter pools, map generation,
 * Awakened One two-phase transition, 3-act playthroughs,
 * daily challenge integration, Act 3 event validation,
 * and balance simulator 3-act support.
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_ENEMIES, getEnemyById, createEnemyInstance, getEncounter, getBossEncounter } from '../data/enemies';
import events from '../data/events';
import { generateMap } from '../utils/mapGenerator';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { combatReducer } from '../context/reducers/combatReducer';
import { rewardReducer } from '../context/reducers/rewardReducer';
import { applyPotionEffect, canUsePotion, removePotion } from '../systems/potionSystem';
import {
  getDailyChallenge,
  getModifierDetails,
  applyDailyChallengeModifiers,
  getDailyChallengeModifiers,
  calculateChallengeScore,
  DAILY_MODIFIERS
} from '../systems/dailyChallengeSystem';
import { SeededRNG, dateSeed } from '../utils/seededRandom';
import { simulateRun } from './balance/simulator';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

// Helper: run AI for turns 0-N
const runAI = (enemy, instance, turns, allies = []) => {
  const moves = [];
  let lastMove = null;
  for (let t = 0; t <= turns; t++) {
    const move = enemy.ai(instance, t, lastMove, 0, allies);
    moves.push(move);
    lastMove = move;
  }
  return moves;
};

// Dispatch helper matching GameContext logic
function dispatch(state, action) {
  switch (action.type) {
    case 'START_GAME':
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
// 1. Act 3 Enemy AI Regression - All enemies turns 0-10
// ============================================================

const act3NormalIds = ['writhing_mass', 'orbWalker', 'spiker', 'transient', 'spireGrowth', 'maw'];
const act3EliteIds = ['giant_head', 'nemesis'];
const act3BossIds = ['awakened_one', 'timeEater'];
const act4BossIds = ['corruptHeart'];
const allAct3EnemyIds = [...act3NormalIds, ...act3EliteIds, ...act3BossIds, ...act4BossIds];

describe('QA-13: Act 3 Enemy AI Regression - All Turns 0-10', () => {

  describe('All Act 3+ enemies produce valid moves on every turn (0-10)', () => {
    allAct3EnemyIds.forEach((enemyId) => {
      it(`${enemyId}: AI returns a move with 'id' for turns 0-10`, () => {
        const enemy = getEnemyById(enemyId);
        expect(enemy).toBeDefined();
        const instance = createEnemyInstance(enemy);
        let lastMove = null;
        for (let turn = 0; turn <= 10; turn++) {
          const move = enemy.ai(instance, turn, lastMove, 0, [instance]);
          expect(move, `${enemyId} turn ${turn} returned undefined`).toBeDefined();
          expect(move.id, `${enemyId} turn ${turn} move missing 'id'`).toBeDefined();
          expect(typeof move.id).toBe('string');
          lastMove = move;
        }
      });
    });
  });

  describe('createEnemyInstance field propagation for Act 3+ enemies', () => {
    allAct3EnemyIds.forEach((enemyId) => {
      it(`${enemyId}: instance has required combat fields`, () => {
        const enemy = getEnemyById(enemyId);
        const inst = createEnemyInstance(enemy);
        expect(inst.currentHp, `${enemyId} currentHp`).toBeGreaterThan(0);
        expect(inst.maxHp, `${enemyId} maxHp`).toBeGreaterThan(0);
        expect(inst.block, `${enemyId} block`).toBe(0);
        expect(typeof inst.strength).toBe('number');
        expect(typeof inst.vulnerable).toBe('number');
        expect(typeof inst.weak).toBe('number');
        expect(typeof inst.artifact).toBe('number');
        expect(typeof inst.platedArmor).toBe('number');
        expect(inst.instanceId, `${enemyId} instanceId`).toBeDefined();
      });
    });
  });
});

// ============================================================
// 2. Act 3 Enemy-Specific Mechanics
// ============================================================

describe('Act 3 Enemy-Specific Mechanics', () => {

  describe('Writhing Mass - reactive random AI', () => {
    it('has reactive flag', () => {
      expect(getEnemyById('writhing_mass').reactive).toBe(true);
    });

    it('has 4 moves in moveset', () => {
      expect(getEnemyById('writhing_mass').moveset.length).toBe(4);
    });

    it('multiStrike is 7 dmg x3', () => {
      const ms = getEnemyById('writhing_mass').moveset.find(m => m.id === 'multiStrike');
      expect(ms.damage).toBe(7);
      expect(ms.times).toBe(3);
    });
  });

  describe('Giant Head - slow countdown mechanic', () => {
    it('has slow flag and slowCountMax of 4', () => {
      const gh = getEnemyById('giant_head');
      expect(gh.slow).toBe(true);
      expect(gh.slowCountMax).toBe(4);
    });

    it('alternates count and glare, then darkEcho after slowCount >= 4', () => {
      const gh = getEnemyById('giant_head');
      const inst = createEnemyInstance(gh);
      // Simulate count reaching 4
      inst.slowCount = 0;
      const m0 = gh.ai(inst, 0, null); // even turn -> count
      expect(m0.id).toBe('count');
      const m1 = gh.ai(inst, 1, m0); // odd turn -> glare
      expect(m1.id).toBe('glare');
      // Set slowCount to trigger dark echo
      inst.slowCount = 4;
      const mDark = gh.ai(inst, 4, null);
      expect(mDark.id).toBe('darkEcho');
      expect(mDark.damage).toBe(45);
    });
  });

  describe('Nemesis - intangible alternation', () => {
    it('has nemesisIntangible flag', () => {
      expect(getEnemyById('nemesis').nemesisIntangible).toBe(true);
    });

    it('uses debilitate on even turns, attacks on odd turns', () => {
      const nem = getEnemyById('nemesis');
      const inst = createEnemyInstance(nem);
      const moves = runAI(nem, inst, 5);
      // Turn 0 (even) -> debilitate, Turn 1 (odd) -> scythe (lastMove=debilitate, not scythe)
      // Turn 2 (even) -> debilitate, Turn 3 (odd) -> scythe (lastMove=debilitate again)
      expect(moves[0].id).toBe('debilitate');
      expect(moves[1].id).toBe('scythe');
      expect(moves[2].id).toBe('debilitate');
      expect(moves[3].id).toBe('scythe'); // lastMove is debilitate, not scythe
      expect(moves[4].id).toBe('debilitate');
    });

    it('scythe deals 45 damage with addBurn', () => {
      const scythe = getEnemyById('nemesis').moveset.find(m => m.id === 'scythe');
      expect(scythe.damage).toBe(45);
      expect(scythe.special).toBe('addBurn');
    });

    it('attackBurn is 6 dmg x3', () => {
      const ab = getEnemyById('nemesis').moveset.find(m => m.id === 'attackBurn');
      expect(ab.damage).toBe(6);
      expect(ab.times).toBe(3);
    });
  });

  describe('Transient - fade timer', () => {
    it('has 999 HP and fadeTimer of 5', () => {
      const t = getEnemyById('transient');
      expect(t.hp.min).toBe(999);
      expect(t.fadeTimer).toBe(5);
    });

    it('escalates: attack -> attack -> heavyAttack -> heavyAttack -> fade', () => {
      const t = getEnemyById('transient');
      const inst = createEnemyInstance(t);
      const moves = runAI(t, inst, 5);
      expect(moves[0].id).toBe('attack');
      expect(moves[0].damage).toBe(30);
      expect(moves[1].id).toBe('attack');
      expect(moves[2].id).toBe('heavyAttack');
      expect(moves[2].damage).toBe(40);
      expect(moves[3].id).toBe('heavyAttack');
      expect(moves[4].id).toBe('fade');
      expect(moves[5].id).toBe('fade');
    });
  });

  describe('Spire Growth - constrict mechanic', () => {
    it('has constrict: 6', () => {
      expect(getEnemyById('spireGrowth').constrict).toBe(6);
    });

    it('opens with constrict, then alternates grow and smash', () => {
      const sg = getEnemyById('spireGrowth');
      const inst = createEnemyInstance(sg);
      const moves = runAI(sg, inst, 5);
      expect(moves[0].id).toBe('constrict');
      expect(moves[1].id).toBe('grow');
      expect(moves[2].id).toBe('smash');
      expect(moves[3].id).toBe('grow');
      expect(moves[4].id).toBe('smash');
    });

    it('smash deals 22 damage', () => {
      const smash = getEnemyById('spireGrowth').moveset.find(m => m.id === 'smash');
      expect(smash.damage).toBe(22);
    });
  });

  describe('Maw - drool/slam/roar/nom cycle', () => {
    it('has 300 HP', () => {
      expect(getEnemyById('maw').hp.min).toBe(300);
    });

    it('follows drool -> slam -> roar -> nomNom -> drool cycle', () => {
      const maw = getEnemyById('maw');
      const inst = createEnemyInstance(maw);
      const moves = runAI(maw, inst, 7);
      expect(moves[0].id).toBe('drool');
      expect(moves[1].id).toBe('slam');
      expect(moves[2].id).toBe('roar');
      expect(moves[3].id).toBe('nomNom');
      expect(moves[4].id).toBe('drool');
      expect(moves[5].id).toBe('slam');
      expect(moves[6].id).toBe('roar');
      expect(moves[7].id).toBe('nomNom');
    });

    it('nomNom is 5 dmg x3 with healSelf 10', () => {
      const nom = getEnemyById('maw').moveset.find(m => m.id === 'nomNom');
      expect(nom.damage).toBe(5);
      expect(nom.times).toBe(3);
      expect(nom.healAmount).toBe(10);
    });
  });

  describe('Orb Walker - random attack selection', () => {
    it('has 3 attack moves', () => {
      const ow = getEnemyById('orbWalker');
      expect(ow.moveset.length).toBe(3);
      ow.moveset.forEach(m => {
        expect(m.damage).toBeGreaterThan(0);
      });
    });

    it('burnStrike has addBurn special', () => {
      const bs = getEnemyById('orbWalker').moveset.find(m => m.id === 'burnStrike');
      expect(bs.special).toBe('addBurn');
      expect(bs.damage).toBe(11);
    });
  });

  describe('Spiker - thorns mechanic', () => {
    it('has thorns: 3', () => {
      expect(getEnemyById('spiker').thorns).toBe(3);
    });

    it('spikes every 3rd turn, cuts otherwise', () => {
      const sp = getEnemyById('spiker');
      const inst = createEnemyInstance(sp);
      const moves = runAI(sp, inst, 8);
      expect(moves[0].id).toBe('spike'); // turn 0: 0%3===0
      expect(moves[1].id).toBe('cut');   // turn 1
      expect(moves[2].id).toBe('cut');   // turn 2
      expect(moves[3].id).toBe('spike'); // turn 3: 3%3===0
      expect(moves[4].id).toBe('cut');
      expect(moves[5].id).toBe('cut');
      expect(moves[6].id).toBe('spike'); // turn 6
    });

    it('instance has thorns: 3 from createEnemyInstance', () => {
      const inst = createEnemyInstance(getEnemyById('spiker'));
      expect(inst.thorns).toBe(3);
    });
  });
});

// ============================================================
// 3. Awakened One Two-Phase Transition
// ============================================================

describe('Awakened One Two-Phase Transition', () => {
  it('has canRebirth flag', () => {
    expect(getEnemyById('awakened_one').canRebirth).toBe(true);
  });

  it('has curious flag (reacts to power cards)', () => {
    expect(getEnemyById('awakened_one').curious).toBe(true);
  });

  it('uses rebirth when HP <= 0 and not yet reborn', () => {
    const aw = getEnemyById('awakened_one');
    const inst = createEnemyInstance(aw);
    inst.currentHp = 0;
    inst.reborn = false;
    const move = aw.ai(inst, 5, null, 0, [inst]);
    expect(move.id).toBe('rebirth');
    expect(move.special).toBe('rebirth');
  });

  it('does NOT rebirth if already reborn', () => {
    const aw = getEnemyById('awakened_one');
    const inst = createEnemyInstance(aw);
    inst.currentHp = 0;
    inst.reborn = true;
    const move = aw.ai(inst, 5, null, 0, [inst]);
    // Reborn phase: slash or soulStrike
    expect(['slash', 'soulStrike']).toContain(move.id);
  });

  it('phase 2 (reborn) uses only slash and soulStrike', () => {
    const aw = getEnemyById('awakened_one');
    const inst = createEnemyInstance(aw);
    inst.reborn = true;
    inst.currentHp = 150;
    for (let t = 0; t <= 20; t++) {
      const move = aw.ai(inst, t, null, 0, [inst]);
      expect(['slash', 'soulStrike']).toContain(move.id);
    }
  });

  it('onPowerPlayed increases strength by 2', () => {
    const aw = getEnemyById('awakened_one');
    const inst = createEnemyInstance(aw);
    expect(inst.strength).toBe(0);
    aw.onPowerPlayed(inst);
    expect(inst.strength).toBe(2);
    aw.onPowerPlayed(inst);
    expect(inst.strength).toBe(4);
  });

  it('soulStrike is 6 dmg x4', () => {
    const ss = getEnemyById('awakened_one').moveset.find(m => m.id === 'soulStrike');
    expect(ss.damage).toBe(6);
    expect(ss.times).toBe(4);
  });

  it('darkEcho deals 40 damage', () => {
    const de = getEnemyById('awakened_one').moveset.find(m => m.id === 'darkEcho');
    expect(de.damage).toBe(40);
  });
});

// ============================================================
// 4. Time Eater Mechanics
// ============================================================

describe('Time Eater Mechanics', () => {
  it('has 456 HP', () => {
    expect(getEnemyById('timeEater').hp.min).toBe(456);
  });

  it('has cardCounter and onCardPlayed', () => {
    const te = getEnemyById('timeEater');
    expect(te.cardCounter).toBe(0);
    expect(typeof te.onCardPlayed).toBe('function');
  });

  it('onCardPlayed increments counter, returns endTurn at 12', () => {
    const te = getEnemyById('timeEater');
    const inst = createEnemyInstance(te);
    inst.cardCounter = 0;
    for (let i = 0; i < 11; i++) {
      const result = te.onCardPlayed(inst);
      expect(result).toBeNull();
    }
    const result = te.onCardPlayed(inst);
    expect(result).toEqual({ endTurn: true, heal: 2 });
    expect(inst.cardCounter).toBe(0); // resets after trigger
  });

  it('uses haste at half HP when not yet hasted', () => {
    const te = getEnemyById('timeEater');
    const inst = createEnemyInstance(te);
    inst.currentHp = 200; // below half of 456
    inst.hasted = false;
    const move = te.ai(inst, 5, null, 0, [inst]);
    expect(move.id).toBe('haste');
  });
});

// ============================================================
// 5. Corrupt Heart (Act 4 Boss)
// ============================================================

describe('Corrupt Heart Mechanics', () => {
  it('has 800 HP and invincible: 300', () => {
    const ch = getEnemyById('corruptHeart');
    expect(ch.hp.min).toBe(800);
    expect(ch.invincible).toBe(300);
  });

  it('opens with debilitate, then cycles blood/echo/buff', () => {
    const ch = getEnemyById('corruptHeart');
    const inst = createEnemyInstance(ch);
    const moves = runAI(ch, inst, 6);
    expect(moves[0].id).toBe('debilitate');
    expect(moves[1].id).toBe('bloodShots');
    expect(moves[2].id).toBe('echo');
    expect(moves[3].id).toBe('buff');
    expect(moves[4].id).toBe('bloodShots');
    expect(moves[5].id).toBe('echo');
    expect(moves[6].id).toBe('buff');
  });

  it('bloodShots is 2 dmg x15', () => {
    const bs = getEnemyById('corruptHeart').moveset.find(m => m.id === 'bloodShots');
    expect(bs.damage).toBe(2);
    expect(bs.times).toBe(15);
  });

  it('has beatOfDeath flag', () => {
    expect(getEnemyById('corruptHeart').beatOfDeath).toBe(true);
  });
});

// ============================================================
// 6. Act 3 Encounter Pools and Map Generation
// ============================================================

describe('Act 3 Encounter Pools', () => {
  it('Act 3 normal encounters return valid enemy instances', () => {
    for (let i = 0; i < 20; i++) {
      const encounter = getEncounter(3, i + 1, 0.1, false);
      expect(encounter.length).toBeGreaterThan(0);
      encounter.forEach(e => {
        expect(e.currentHp).toBeGreaterThan(0);
        expect(e.instanceId).toBeDefined();
      });
    }
  });

  it('Act 3 elite encounters return valid elites', () => {
    for (let i = 0; i < 10; i++) {
      const encounter = getEncounter(3, 5, 0.1, true);
      expect(encounter.length).toBeGreaterThan(0);
      encounter.forEach(e => {
        expect(e.currentHp).toBeGreaterThan(0);
      });
    }
  });

  it('Act 3 boss encounters return awakened_one or timeEater', () => {
    const seenBosses = new Set();
    for (let i = 0; i < 50; i++) {
      const encounter = getBossEncounter(3);
      expect(encounter.length).toBeGreaterThanOrEqual(1);
      seenBosses.add(encounter[0].id);
    }
    expect(seenBosses.has('awakened_one') || seenBosses.has('timeEater')).toBe(true);
  });

  it('ALL_ENEMIES contains expected Act 3 normals', () => {
    const act3Normals = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'normal');
    expect(act3Normals.length).toBeGreaterThanOrEqual(6);
    const ids = act3Normals.map(e => e.id);
    expect(ids).toContain('writhing_mass');
    expect(ids).toContain('transient');
    expect(ids).toContain('spireGrowth');
    expect(ids).toContain('maw');
    expect(ids).toContain('orbWalker');
    expect(ids).toContain('spiker');
  });

  it('ALL_ENEMIES contains expected Act 3 elites', () => {
    const act3Elites = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'elite');
    expect(act3Elites.length).toBeGreaterThanOrEqual(2);
    const ids = act3Elites.map(e => e.id);
    expect(ids).toContain('giant_head');
    expect(ids).toContain('nemesis');
  });

  it('ALL_ENEMIES contains expected Act 3 bosses', () => {
    const act3Bosses = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'boss');
    expect(act3Bosses.length).toBeGreaterThanOrEqual(2);
    const ids = act3Bosses.map(e => e.id);
    expect(ids).toContain('awakened_one');
    expect(ids).toContain('timeEater');
  });
});

describe('Act 3 Map Generation', () => {
  it('generates a valid 15-floor map for Act 3', () => {
    const map = generateMap(3);
    expect(map.length).toBe(15);
  });

  it('floor 0 is always combat', () => {
    for (let i = 0; i < 10; i++) {
      const map = generateMap(3);
      map[0].forEach(node => {
        expect(node.type).toBe('combat');
      });
    }
  });

  it('floor 14 is always boss', () => {
    const map = generateMap(3);
    expect(map[14].length).toBe(1);
    expect(map[14][0].type).toBe('boss');
  });

  it('floor 7 (middle) is always rest', () => {
    for (let i = 0; i < 10; i++) {
      const map = generateMap(3);
      map[7].forEach(node => {
        expect(node.type).toBe('rest');
      });
    }
  });

  it('floor 13 (pre-boss) is always rest', () => {
    for (let i = 0; i < 10; i++) {
      const map = generateMap(3);
      map[13].forEach(node => {
        expect(node.type).toBe('rest');
      });
    }
  });

  it('all nodes have connections (except boss)', () => {
    const map = generateMap(3);
    for (let i = 0; i < 14; i++) {
      map[i].forEach(node => {
        expect(node.connections.length).toBeGreaterThan(0);
      });
    }
  });

  it('Act 3 distribution has more elites (22%) than Act 1 (15%)', () => {
    // Generate many maps and count elite nodes
    let act1Elites = 0, act1Total = 0;
    let act3Elites = 0, act3Total = 0;
    for (let i = 0; i < 100; i++) {
      const map1 = generateMap(1);
      const map3 = generateMap(3);
      for (let f = 2; f <= 12; f++) {
        if (f === 7) continue; // skip rest floor
        map1[f].forEach(n => { act1Total++; if (n.type === 'elite') act1Elites++; });
        map3[f].forEach(n => { act3Total++; if (n.type === 'elite') act3Elites++; });
      }
    }
    const act1Rate = act1Elites / act1Total;
    const act3Rate = act3Elites / act3Total;
    // Act 3 should have higher elite rate than Act 1
    expect(act3Rate).toBeGreaterThan(act1Rate);
  });
});

// ============================================================
// 7. 3-Act Playthrough via Reducer Dispatch (A0 + A5)
// ============================================================

describe('3-Act Playthrough Regression', () => {
  const runPlaythrough = (ascensionLevel, maxFloors = 3) => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });
    expect(state.phase).toBe(GAME_PHASE.MAP);

    for (let floor = 0; floor < maxFloors && state.phase === GAME_PHASE.MAP; floor++) {
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
    return state;
  };

  it('A0 playthrough: 3 floors without crashes', () => {
    const state = runPlaythrough(0);
    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_REWARD,
      GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY
    ]).toContain(state.phase);
  });

  it('A5 playthrough: 3 floors without crashes', () => {
    const state = runPlaythrough(5);
    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
  });

  it('game state tracks act number', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 0 } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });
    expect(state.act).toBeDefined();
    expect(state.act).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 8. Balance Simulator 3-Act Support
// ============================================================

describe('Balance Simulator 3-Act Runs', () => {
  it('simulateRun accepts acts=3 without crashing', () => {
    const result = simulateRun({ acts: 3, seed: 42, hp: 300, maxHp: 300 });
    expect(result).toBeDefined();
    expect(result.floorsCleared).toBeGreaterThanOrEqual(0);
    expect(typeof result.survived).toBe('boolean');
    expect(result.ascension).toBe(0);
  });

  it('3-act run has more floors than 1-act run', () => {
    // With high HP to increase survival
    const r1 = simulateRun({ acts: 1, seed: 100, hp: 500, maxHp: 500 });
    const r3 = simulateRun({ acts: 3, seed: 100, hp: 500, maxHp: 500 });
    expect(r3.floorsCleared).toBeGreaterThanOrEqual(r1.floorsCleared);
  });

  it('3-act run tracks actsCompleted', () => {
    const result = simulateRun({ acts: 3, seed: 42, hp: 500, maxHp: 500 });
    expect(result.actsCompleted).toBeDefined();
    expect(result.actsCompleted).toBeGreaterThanOrEqual(0);
    expect(result.actsCompleted).toBeLessThanOrEqual(3);
  });

  it('combatStats include act information', () => {
    const result = simulateRun({ acts: 2, seed: 55, hp: 500, maxHp: 500 });
    result.combatStats.forEach(cs => {
      expect(cs.act).toBeDefined();
      expect(cs.act).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================
// 9. Daily Challenge System Integration
// ============================================================

describe('Daily Challenge System Integration', () => {

  it('all 6 modifiers have required fields', () => {
    const modIds = Object.keys(DAILY_MODIFIERS);
    expect(modIds.length).toBe(6);
    modIds.forEach(id => {
      const mod = DAILY_MODIFIERS[id];
      expect(mod.id).toBe(id);
      expect(typeof mod.name).toBe('string');
      expect(typeof mod.description).toBe('string');
      expect(typeof mod.scoreMultiplier).toBe('number');
    });
  });

  it('getDailyChallenge is deterministic for a given date', () => {
    const c1 = getDailyChallenge('2026-06-15');
    const c2 = getDailyChallenge('2026-06-15');
    expect(c1.seed).toBe(c2.seed);
    expect(c1.modifierIds).toEqual(c2.modifierIds);
  });

  it('different dates produce different challenges', () => {
    const dates = ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01'];
    const seeds = dates.map(d => getDailyChallenge(d).seed);
    const unique = new Set(seeds);
    expect(unique.size).toBe(5);
  });

  it('applyDailyChallengeModifiers + getDailyChallengeModifiers work together', () => {
    const state = {
      player: { maxHp: 80, currentHp: 80, maxEnergy: 3, energy: 3, gold: 99 },
      deck: [], relics: []
    };
    const modIds = ['less_energy', 'fragile'];
    const newState = applyDailyChallengeModifiers(state, modIds);
    expect(newState.player.maxEnergy).toBe(2);
    expect(newState.player.maxHp).toBe(64);

    const combatMods = getDailyChallengeModifiers(modIds);
    // less_energy and fragile don't have combat modifiers
    expect(Object.keys(combatMods).length).toBe(0);
  });

  it('enemy_hp_up + elite_hunter produce correct combat modifiers', () => {
    const mods = getDailyChallengeModifiers(['enemy_hp_up', 'elite_hunter']);
    expect(mods.enemyHpMultiplier).toBe(1.25);
    expect(mods.eliteHpMultiplier).toBe(1.5);
  });

  it('score calculation with modifiers', () => {
    const stats = { floor: 15, enemiesKilled: 30, damageDealt: 1000, goldEarned: 200 };
    const player = { currentHp: 60, gold: 120 };
    const score = calculateChallengeScore(stats, player, ['enemy_hp_up', 'less_energy']);
    // (15*10 + 30*5 + 60 + 120 + 100) * 1.3 * 1.5
    // = (150 + 150 + 60 + 120 + 100) * 1.95 = 580 * 1.95 = 1131
    expect(score).toBe(1131);
  });
});

// ============================================================
// 10. Act 3 Event Data Validation (5 Reality Fracture Events)
// ============================================================

describe('Act 3 Reality Fracture Events', () => {
  const realityFractureIds = ['reality_seam', 'dissolving_pattern', 'core_echo', 'identity_fork', 'war_memory'];

  it('all 5 reality fracture events exist', () => {
    realityFractureIds.forEach(id => {
      const ev = events.find(e => e.id === id);
      expect(ev, `Missing event: ${id}`).toBeDefined();
    });
  });

  it('total events count is 25', () => {
    expect(events.length).toBe(25);
  });

  describe('Each reality fracture event has valid structure', () => {
    const validEffectKeys = [
      'heal', 'damage', 'gainGold', 'loseGold', 'loseHp', 'loseHpPercent',
      'gainRelic', 'addCardToDiscard', 'removeCard', 'upgradeRandomCard',
      'gainMaxHp', 'loseMaxHp'
    ];

    realityFractureIds.forEach(id => {
      describe(`Event: ${id}`, () => {
        it('has title, description, and choices', () => {
          const ev = events.find(e => e.id === id);
          expect(typeof ev.title).toBe('string');
          expect(ev.title.length).toBeGreaterThan(0);
          expect(typeof ev.description).toBe('string');
          expect(ev.description.length).toBeGreaterThan(20);
          expect(ev.choices.length).toBeGreaterThanOrEqual(2);
        });

        it('all choices have valid effects and result text', () => {
          const ev = events.find(e => e.id === id);
          ev.choices.forEach((choice, idx) => {
            expect(typeof choice.text).toBe('string');
            expect(typeof choice.result).toBe('string');
            expect(choice.result.length).toBeGreaterThan(10);
            const keys = Object.keys(choice.effect);
            expect(keys.length).toBeGreaterThan(0);
            keys.forEach(key => {
              const isValid = validEffectKeys.some(vk => key.startsWith(vk));
              expect(isValid, `Event ${id} choice ${idx}: unknown effect key '${key}'`).toBe(true);
            });
          });
        });
      });
    });
  });

  it('reality_seam offers tungsten_rod relic', () => {
    const ev = events.find(e => e.id === 'reality_seam');
    const relicChoice = ev.choices.find(c => c.effect.gainRelic === 'tungsten_rod');
    expect(relicChoice).toBeDefined();
  });

  it('dissolving_pattern offers dead_branch relic', () => {
    const ev = events.find(e => e.id === 'dissolving_pattern');
    const relicChoice = ev.choices.find(c => c.effect.gainRelic === 'dead_branch');
    expect(relicChoice).toBeDefined();
  });

  it('core_echo offers incense_burner relic', () => {
    const ev = events.find(e => e.id === 'core_echo');
    const relicChoice = ev.choices.find(c => c.effect.gainRelic === 'incense_burner');
    expect(relicChoice).toBeDefined();
  });

  it('identity_fork offers girya or torii relics', () => {
    const ev = events.find(e => e.id === 'identity_fork');
    const relics = ev.choices.map(c => c.effect.gainRelic).filter(Boolean);
    expect(relics).toContain('girya');
    expect(relics).toContain('torii');
  });

  it('war_memory offers calipers relic', () => {
    const ev = events.find(e => e.id === 'war_memory');
    const relicChoice = ev.choices.find(c => c.effect.gainRelic === 'calipers');
    expect(relicChoice).toBeDefined();
  });
});
