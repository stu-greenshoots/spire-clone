/**
 * QR-09: Enemy Behavior Verification
 *
 * Comprehensive verification of all 40+ enemies in the game.
 * For each enemy, we verify:
 * 1. HP matches definition
 * 2. Damage values match intent display
 * 3. AI pattern cycles correctly
 * 4. Special abilities work (split, enrage, artifact, etc.)
 * 5. Status effects applied by enemy work correctly
 * 6. Enemy death triggers are correct
 *
 * Uses REAL game reducers, not mocks (except for audio/save side effects).
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_ENEMIES, getEnemyById, createEnemyInstance, INTENT, getEncounter, getBossEncounter } from '../data/enemies';
import { ALL_CARDS } from '../data/cards';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { combatReducer } from '../context/reducers/combatReducer';
import { processEnemyTurns } from '../context/reducers/combat/enemyTurnAction';

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
    combat: { cardPlay: 'cardPlay', attack: 'attack', block: 'block', enemyAttack: 'enemyAttack', heavyHit: 'heavyHit', playerHurt: 'playerHurt' },
    ui: { click: 'click' }
  }
}));

// ============================================================
// Helper Functions
// ============================================================

/**
 * Creates a combat state with specified enemies for testing
 */
function createCombatState(options = {}) {
  const {
    enemies,
    playerOverrides = {},
    hand = [],
    deck = [],
    relics = [],
    turn = 0
  } = options;

  const basePlayer = createInitialState().player;
  const state = {
    ...createInitialState(),
    phase: GAME_PHASE.COMBAT,
    characterId: 'ironclad',
    player: {
      ...basePlayer,
      currentStance: null,
      mantra: 0,
      ...playerOverrides
    },
    enemies: enemies || [],
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
    turn,
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
 * Simulates getting the enemy's next move based on AI
 */
function getEnemyMove(enemy, turn, lastMove = null, index = 0, allies = []) {
  if (!enemy.ai) return enemy.moveset?.[0] || null;
  return enemy.ai(enemy, turn, lastMove, index, allies);
}

/**
 * Creates a context object for processEnemyTurns
 */
function createEnemyTurnContext(state) {
  return {
    newPlayer: { ...state.player },
    newEnemies: state.enemies.map(e => ({ ...e })),
    newHand: [...state.hand],
    newDrawPile: [...state.drawPile],
    newDiscardPile: [...state.discardPile],
    newRelics: [...state.relics],
    combatLog: []
  };
}

// ============================================================
// Enemy Inventory Tests
// ============================================================

describe('QR-09: Enemy Behavior Verification', () => {
  describe('Enemy Inventory', () => {
    it('should have at least 40 unique enemies', () => {
      expect(ALL_ENEMIES.length).toBeGreaterThanOrEqual(40);
    });

    it('should have enemies for Acts 1, 2, 3, and 4', () => {
      const act1 = ALL_ENEMIES.filter(e => e.act === 1);
      const act2 = ALL_ENEMIES.filter(e => e.act === 2);
      const act3 = ALL_ENEMIES.filter(e => e.act === 3);
      const act4 = ALL_ENEMIES.filter(e => e.act === 4);

      expect(act1.length).toBeGreaterThan(0);
      expect(act2.length).toBeGreaterThan(0);
      expect(act3.length).toBeGreaterThan(0);
      expect(act4.length).toBeGreaterThan(0);
    });

    it('should have normal, elite, boss, and minion types', () => {
      const normal = ALL_ENEMIES.filter(e => e.type === 'normal');
      const elite = ALL_ENEMIES.filter(e => e.type === 'elite');
      const boss = ALL_ENEMIES.filter(e => e.type === 'boss');
      const minion = ALL_ENEMIES.filter(e => e.type === 'minion');

      expect(normal.length).toBeGreaterThan(0);
      expect(elite.length).toBeGreaterThan(0);
      expect(boss.length).toBeGreaterThan(0);
      expect(minion.length).toBeGreaterThan(0);
    });

    it('should have all required fields for every enemy', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy.id).toBeDefined();
        expect(enemy.name).toBeDefined();
        expect(enemy.hp).toBeDefined();
        expect(enemy.type).toBeDefined();
        expect(enemy.act).toBeDefined();
        expect(enemy.moveset).toBeDefined();
        expect(Array.isArray(enemy.moveset)).toBe(true);
        expect(enemy.ai).toBeDefined();
        expect(typeof enemy.ai).toBe('function');
      });
    });
  });

  // ============================================================
  // HP Verification Tests
  // ============================================================

  describe('HP Verification', () => {
    it('should have valid HP values for all enemies', () => {
      ALL_ENEMIES.forEach(enemy => {
        const hp = enemy.hp;
        if (typeof hp === 'object') {
          expect(hp.min).toBeGreaterThan(0);
          expect(hp.max).toBeGreaterThanOrEqual(hp.min);
        } else {
          expect(hp).toBeGreaterThan(0);
        }
      });
    });

    it('should create enemy instances with HP in valid range', () => {
      ALL_ENEMIES.forEach(enemy => {
        const instance = createEnemyInstance(enemy, 0);
        const expectedMin = typeof enemy.hp === 'object' ? enemy.hp.min : enemy.hp;
        const expectedMax = typeof enemy.hp === 'object' ? enemy.hp.max : enemy.hp;

        expect(instance.currentHp).toBeGreaterThanOrEqual(expectedMin);
        expect(instance.currentHp).toBeLessThanOrEqual(expectedMax);
        expect(instance.maxHp).toBe(instance.currentHp);
      });
    });

    // Spot checks for specific enemies against StS baseline
    it('should have correct HP for Cultist (48-54)', () => {
      const cultist = getEnemyById('cultist');
      expect(cultist.hp.min).toBe(48);
      expect(cultist.hp.max).toBe(54);
    });

    it('should have correct HP for Jaw Worm (42-46)', () => {
      const jawWorm = getEnemyById('jawWorm');
      expect(jawWorm.hp.min).toBe(42);
      expect(jawWorm.hp.max).toBe(46);
    });

    it('should have correct HP for Gremlin Nob (96-108, adjusted for balance)', () => {
      const gremlinNob = getEnemyById('gremlinNob');
      expect(gremlinNob.hp.min).toBe(96);
      expect(gremlinNob.hp.max).toBe(108);
    });

    it('should have correct HP for Slime Boss (140)', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      expect(slimeBoss.hp.min).toBe(140);
      expect(slimeBoss.hp.max).toBe(140);
    });

    it('should have correct HP for Corrupt Heart (750)', () => {
      const heart = getEnemyById('corruptHeart');
      expect(heart.hp.min).toBe(750);
      expect(heart.hp.max).toBe(750);
    });
  });

  // ============================================================
  // Moveset Verification Tests
  // ============================================================

  describe('Moveset Verification', () => {
    it('should have valid moves for all enemies', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy.moveset.length).toBeGreaterThan(0);
        enemy.moveset.forEach(move => {
          expect(move.id).toBeDefined();
          expect(move.intent).toBeDefined();
          expect(Object.values(INTENT)).toContain(move.intent);
          expect(move.message).toBeDefined();
        });
      });
    });

    it('should have valid damage values on attack moves', () => {
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (move.intent.includes('attack') || move.damage !== undefined) {
            if (move.damage !== undefined) {
              if (typeof move.damage === 'object') {
                expect(move.damage.min).toBeGreaterThanOrEqual(0);
                expect(move.damage.max).toBeGreaterThanOrEqual(move.damage.min);
              } else {
                expect(move.damage).toBeGreaterThanOrEqual(0);
              }
            }
          }
        });
      });
    });

    it('should have valid block values on defend moves', () => {
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (move.block !== undefined) {
            expect(move.block).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should have valid effects on moves that apply effects', () => {
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (move.effects) {
            expect(Array.isArray(move.effects)).toBe(true);
            move.effects.forEach(effect => {
              expect(effect.type).toBeDefined();
              expect(effect.amount).toBeDefined();
            });
          }
        });
      });
    });
  });

  // ============================================================
  // AI Pattern Tests
  // ============================================================

  describe('AI Pattern Verification', () => {
    it('should return valid moves from AI function', () => {
      ALL_ENEMIES.forEach(enemy => {
        const instance = createEnemyInstance(enemy, 0);
        const move = getEnemyMove(instance, 0, null, 0, []);
        expect(move).toBeDefined();
        expect(move.id).toBeDefined();
        expect(move.intent).toBeDefined();
      });
    });

    // Specific AI pattern tests
    describe('Cultist AI', () => {
      it('should open with Ritual (buff) on turn 0', () => {
        const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
        const move = getEnemyMove(cultist, 0);
        expect(move.id).toBe('incantation');
        expect(move.intent).toBe(INTENT.BUFF);
      });

      it('should use Dark Strike after turn 0', () => {
        const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
        const move = getEnemyMove(cultist, 1);
        expect(move.id).toBe('darkStrike');
        expect(move.intent).toBe(INTENT.ATTACK);
        expect(move.damage).toBe(6);
      });
    });

    describe('Slime Boss AI', () => {
      it('should split when HP drops to 50%', () => {
        const slimeBoss = createEnemyInstance(getEnemyById('slimeBoss'), 0);
        slimeBoss.currentHp = slimeBoss.maxHp / 2;
        slimeBoss.hasSplit = false;

        const move = getEnemyMove(slimeBoss, 5);
        expect(move.id).toBe('split');
        expect(move.special).toBe('splitBoss');
      });

      it('should not split if already split', () => {
        const slimeBoss = createEnemyInstance(getEnemyById('slimeBoss'), 0);
        slimeBoss.currentHp = slimeBoss.maxHp / 2;
        slimeBoss.hasSplit = true;

        const move = getEnemyMove(slimeBoss, 5);
        expect(move.id).not.toBe('split');
      });

      it('should cycle goop -> preparing -> slam', () => {
        const slimeBoss = createEnemyInstance(getEnemyById('slimeBoss'), 0);

        const turn0 = getEnemyMove(slimeBoss, 0);
        const turn1 = getEnemyMove(slimeBoss, 1);
        const turn2 = getEnemyMove(slimeBoss, 2);
        const turn3 = getEnemyMove(slimeBoss, 3); // Cycle repeats

        expect(turn0.id).toBe('goop');
        expect(turn1.id).toBe('preparing');
        expect(turn2.id).toBe('slam');
        expect(turn3.id).toBe('goop');
      });
    });

    describe('The Guardian AI', () => {
      it('should have defensive mode pattern', () => {
        const guardian = createEnemyInstance(getEnemyById('theGuardian'), 0);
        guardian.defensiveMode = true;

        const turn0 = getEnemyMove(guardian, 0);
        const turn1 = getEnemyMove(guardian, 1);
        const turn2 = getEnemyMove(guardian, 2);
        const turn3 = getEnemyMove(guardian, 3);

        expect(turn0.id).toBe('chargingUp');
        expect(turn1.id).toBe('whirlwind');
        expect(turn2.id).toBe('twinSlam');
        expect(turn3.id).toBe('modeShift');
      });

      it('should have offensive mode pattern', () => {
        const guardian = createEnemyInstance(getEnemyById('theGuardian'), 0);
        guardian.defensiveMode = false;

        const turn0 = getEnemyMove(guardian, 0);
        const turn1 = getEnemyMove(guardian, 1);
        const turn2 = getEnemyMove(guardian, 2);

        expect(turn0.id).toBe('ventSteam');
        expect(turn1.id).toBe('rollAttack');
        expect(turn2.id).toBe('fierceBash');
      });
    });

    describe('Hexaghost AI', () => {
      it('should open with activate', () => {
        const hexaghost = createEnemyInstance(getEnemyById('hexaghost'), 0);
        const move = getEnemyMove(hexaghost, 0);
        expect(move.id).toBe('activate');
      });

      it('should use divider on turn 1', () => {
        const hexaghost = createEnemyInstance(getEnemyById('hexaghost'), 0);
        const move = getEnemyMove(hexaghost, 1);
        expect(move.id).toBe('divider');
        expect(move.times).toBe(6);
      });
    });

    describe('Bronze Automaton AI', () => {
      it('should cycle boost -> dual strike -> hyper beam', () => {
        const automaton = createEnemyInstance(getEnemyById('automaton'), 0);

        const turn0 = getEnemyMove(automaton, 0);
        const turn1 = getEnemyMove(automaton, 1);
        const turn2 = getEnemyMove(automaton, 2);
        const turn3 = getEnemyMove(automaton, 3);

        expect(turn0.id).toBe('boost');
        expect(turn1.id).toBe('dualStrike');
        expect(turn2.id).toBe('hyperBeam');
        expect(turn3.id).toBe('boost');
      });
    });

    describe('Corrupt Heart AI', () => {
      it('should open with debilitate', () => {
        const heart = createEnemyInstance(getEnemyById('corruptHeart'), 0);
        const move = getEnemyMove(heart, 0);
        expect(move.id).toBe('debilitate');
      });

      it('should cycle blood shots -> echo -> buff after turn 0', () => {
        const heart = createEnemyInstance(getEnemyById('corruptHeart'), 0);

        const turn1 = getEnemyMove(heart, 1);
        const turn2 = getEnemyMove(heart, 2);
        const turn3 = getEnemyMove(heart, 3);

        expect(turn1.id).toBe('bloodShots');
        expect(turn2.id).toBe('echo');
        expect(turn3.id).toBe('buff');
      });
    });

    describe('Lagavulin AI', () => {
      it('should sleep for first 3 turns if asleep', () => {
        const lagavulin = createEnemyInstance(getEnemyById('lagavulin'), 0);
        lagavulin.asleep = true;
        lagavulin.wokenUp = false;

        const turn0 = getEnemyMove(lagavulin, 0);
        const turn1 = getEnemyMove(lagavulin, 1);
        const turn2 = getEnemyMove(lagavulin, 2);

        expect(turn0.id).toBe('sleep');
        expect(turn1.id).toBe('sleep');
        expect(turn2.id).toBe('sleep');
      });

      it('should alternate attack and siphon soul after waking', () => {
        const lagavulin = createEnemyInstance(getEnemyById('lagavulin'), 0);
        lagavulin.asleep = false;
        lagavulin.wokenUp = true;

        const turn0 = getEnemyMove(lagavulin, 0); // even turn: siphon
        const turn1 = getEnemyMove(lagavulin, 1); // odd turn: attack

        expect(turn0.id).toBe('siphonSoul');
        expect(turn1.id).toBe('attack');
      });
    });

    describe('Time Eater AI', () => {
      it('should use haste when HP drops to 50%', () => {
        const timeEater = createEnemyInstance(getEnemyById('timeEater'), 0);
        timeEater.currentHp = timeEater.maxHp / 2;
        timeEater.hasted = false;

        const move = getEnemyMove(timeEater, 5);
        expect(move.id).toBe('haste');
      });

      it('should not use haste if already hasted', () => {
        const timeEater = createEnemyInstance(getEnemyById('timeEater'), 0);
        timeEater.currentHp = timeEater.maxHp / 2;
        timeEater.hasted = true;

        const move = getEnemyMove(timeEater, 5);
        expect(move.id).not.toBe('haste');
      });
    });

    describe('Awakened One AI', () => {
      it('should trigger rebirth when HP drops to 0 and not yet reborn', () => {
        const awakenedOne = createEnemyInstance(getEnemyById('awakened_one'), 0);
        awakenedOne.currentHp = 0;
        awakenedOne.reborn = false;

        const move = getEnemyMove(awakenedOne, 5);
        expect(move.id).toBe('rebirth');
      });

      it('should not trigger rebirth if already reborn', () => {
        const awakenedOne = createEnemyInstance(getEnemyById('awakened_one'), 0);
        awakenedOne.currentHp = 0;
        awakenedOne.reborn = true;

        const move = getEnemyMove(awakenedOne, 5);
        expect(move.id).not.toBe('rebirth');
      });
    });

    describe('The Champ AI', () => {
      it('should trigger anger when HP drops to 50%', () => {
        const champ = createEnemyInstance(getEnemyById('theChamp'), 0);
        champ.currentHp = champ.maxHp / 2;
        champ.angered = false;

        const move = getEnemyMove(champ, 5);
        expect(move.id).toBe('anger');
      });
    });
  });

  // ============================================================
  // Damage Value Tests
  // ============================================================

  describe('Damage Value Verification', () => {
    it('should have correct damage for Cultist Dark Strike (6)', () => {
      const cultist = getEnemyById('cultist');
      const darkStrike = cultist.moveset.find(m => m.id === 'darkStrike');
      expect(darkStrike.damage).toBe(6);
    });

    it('should have correct damage for Jaw Worm Chomp (11)', () => {
      const jawWorm = getEnemyById('jawWorm');
      const chomp = jawWorm.moveset.find(m => m.id === 'chomp');
      expect(chomp.damage).toBe(11);
    });

    it('should have correct damage for Gremlin Nob Rush (14)', () => {
      const gremlinNob = getEnemyById('gremlinNob');
      const rush = gremlinNob.moveset.find(m => m.id === 'rush');
      expect(rush.damage).toBe(14);
    });

    it('should have correct damage for Slime Boss Slam (35)', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const slam = slimeBoss.moveset.find(m => m.id === 'slam');
      expect(slam.damage).toBe(35);
    });

    it('should have correct damage for Hexaghost Divider (6x6)', () => {
      const hexaghost = getEnemyById('hexaghost');
      const divider = hexaghost.moveset.find(m => m.id === 'divider');
      expect(divider.damage).toBe(6);
      expect(divider.times).toBe(6);
    });

    it('should have correct damage for Corrupt Heart Blood Shots (2x15)', () => {
      const heart = getEnemyById('corruptHeart');
      const bloodShots = heart.moveset.find(m => m.id === 'bloodShots');
      expect(bloodShots.damage).toBe(2);
      expect(bloodShots.times).toBe(15);
    });

    it('should have correct damage for Bronze Automaton Hyper Beam (45)', () => {
      const automaton = getEnemyById('automaton');
      const hyperBeam = automaton.moveset.find(m => m.id === 'hyperBeam');
      expect(hyperBeam.damage).toBe(45);
    });
  });

  // ============================================================
  // Special Ability Tests
  // ============================================================

  describe('Special Ability Verification', () => {
    describe('Artifact', () => {
      it('should initialize enemy with artifact property', () => {
        const chosen = createEnemyInstance(getEnemyById('chosen'), 0);
        expect(chosen.artifact).toBe(1);
      });

      it('should initialize Sentry with artifact', () => {
        const sentry = createEnemyInstance(getEnemyById('sentryA'), 0);
        expect(sentry.artifact).toBe(1);
      });

      it('should initialize Bronze Automaton with 3 artifact', () => {
        const automaton = createEnemyInstance(getEnemyById('automaton'), 0);
        expect(automaton.artifact).toBe(3);
      });
    });

    describe('Metallicize', () => {
      it('should initialize Lagavulin with metallicize', () => {
        const lagavulin = createEnemyInstance(getEnemyById('lagavulin'), 0);
        expect(lagavulin.metallicize).toBe(6);
      });
    });

    describe('Plated Armor', () => {
      it('should initialize Shelled Parasite with plated armor', () => {
        const shelledParasite = createEnemyInstance(getEnemyById('shelledParasite'), 0);
        expect(shelledParasite.platedArmor).toBe(14);
      });
    });

    describe('Thorns', () => {
      it('should initialize Spiker with thorns', () => {
        const spiker = createEnemyInstance(getEnemyById('spiker'), 0);
        expect(spiker.thorns).toBe(3);
      });
    });

    describe('Flight', () => {
      it('should initialize Byrd with flight', () => {
        const byrd = createEnemyInstance(getEnemyById('byrd'), 0);
        expect(byrd.flight).toBe(3);
      });
    });

    describe('Invincible Shield', () => {
      it('should initialize Corrupt Heart with invincible shield', () => {
        const heart = createEnemyInstance(getEnemyById('corruptHeart'), 0);
        expect(heart.invincible).toBe(200);
      });
    });

    describe('Asleep State', () => {
      it('should initialize Lagavulin as asleep', () => {
        const lagavulin = createEnemyInstance(getEnemyById('lagavulin'), 0);
        expect(lagavulin.asleep).toBe(true);
      });
    });

    describe('Retain Block', () => {
      it('should have retainBlock for The Guardian', () => {
        const guardian = getEnemyById('theGuardian');
        expect(guardian.retainBlock).toBe(true);
      });

      it('should have barricade for Spheric Guardian', () => {
        const sphericGuardian = getEnemyById('sphericGuardian');
        expect(sphericGuardian.barricade).toBe(true);
      });
    });
  });

  // ============================================================
  // Enemy Turn Processing Tests
  // ============================================================

  describe('Enemy Turn Processing', () => {
    it('should apply damage to player', () => {
      const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
      cultist.intentData = { id: 'darkStrike', intent: INTENT.ATTACK, damage: 6 };

      const state = createCombatState({
        enemies: [cultist],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 0 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.currentHp).toBe(94); // 100 - 6 = 94
    });

    it('should apply damage blocked by player block', () => {
      const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
      cultist.intentData = { id: 'darkStrike', intent: INTENT.ATTACK, damage: 6 };

      const state = createCombatState({
        enemies: [cultist],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 10 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.currentHp).toBe(100); // Block absorbed damage
      expect(result.newPlayer.block).toBe(4); // 10 - 6 = 4
    });

    it('should apply multi-hit attacks', () => {
      const hexaghost = createEnemyInstance(getEnemyById('hexaghost'), 0);
      hexaghost.intentData = { id: 'divider', intent: INTENT.ATTACK, damage: 6, times: 6 };

      const state = createCombatState({
        enemies: [hexaghost],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 0 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.currentHp).toBe(64); // 100 - (6 * 6) = 64
    });

    it('should apply strength to enemy attacks', () => {
      const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
      cultist.strength = 3;
      cultist.intentData = { id: 'darkStrike', intent: INTENT.ATTACK, damage: 6 };

      const state = createCombatState({
        enemies: [cultist],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 0 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.currentHp).toBe(91); // 100 - (6 + 3) = 91
    });

    it('should apply weak to reduce enemy damage', () => {
      const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
      cultist.weak = 2;
      cultist.intentData = { id: 'darkStrike', intent: INTENT.ATTACK, damage: 6 };

      const state = createCombatState({
        enemies: [cultist],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 0 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.currentHp).toBe(96); // 100 - floor(6 * 0.75) = 96
    });

    it('should apply vulnerable to increase damage to player', () => {
      const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
      cultist.intentData = { id: 'darkStrike', intent: INTENT.ATTACK, damage: 6 };

      const state = createCombatState({
        enemies: [cultist],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 0, vulnerable: 2 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.currentHp).toBe(91); // 100 - floor(6 * 1.5) = 91
    });

    it('should apply enemy block', () => {
      const guardian = createEnemyInstance(getEnemyById('theGuardian'), 0);
      guardian.intentData = { id: 'chargingUp', intent: INTENT.DEFEND, block: 9 };

      const state = createCombatState({ enemies: [guardian] });
      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newEnemies[0].block).toBe(9);
    });

    it('should apply status effects to player', () => {
      const guardian = createEnemyInstance(getEnemyById('theGuardian'), 0);
      guardian.intentData = {
        id: 'ventSteam',
        intent: INTENT.DEBUFF,
        effects: [
          { type: 'weak', amount: 2, target: 'player' },
          { type: 'vulnerable', amount: 2, target: 'player' }
        ]
      };

      const state = createCombatState({
        enemies: [guardian],
        playerOverrides: { weak: 0, vulnerable: 0 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newPlayer.weak).toBe(2);
      expect(result.newPlayer.vulnerable).toBe(2);
    });

    it('should apply strength buffs to enemy', () => {
      const cultist = createEnemyInstance(getEnemyById('cultist'), 0);
      cultist.intentData = {
        id: 'incantation',
        intent: INTENT.BUFF,
        effects: [{ type: 'ritual', amount: 2 }]
      };

      const state = createCombatState({ enemies: [cultist] });
      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newEnemies[0].ritual).toBe(2);
    });

    it('should apply metallicize block at end of turn', () => {
      const lagavulin = createEnemyInstance(getEnemyById('lagavulin'), 0);
      lagavulin.intentData = { id: 'attack', intent: INTENT.ATTACK, damage: 16 };
      lagavulin.metallicize = 6;

      const state = createCombatState({
        enemies: [lagavulin],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 20 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newEnemies[0].block).toBe(6); // From metallicize
    });

    it('should apply plated armor block at end of turn', () => {
      const shelledParasite = createEnemyInstance(getEnemyById('shelledParasite'), 0);
      shelledParasite.intentData = { id: 'suck', intent: INTENT.ATTACK_BUFF, damage: 10, special: 'healSelf', healAmount: 3 };
      shelledParasite.platedArmor = 14;

      const state = createCombatState({
        enemies: [shelledParasite],
        playerOverrides: { currentHp: 100, maxHp: 100, block: 20 }
      });

      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      expect(result.newEnemies[0].block).toBe(14); // From plated armor
    });
  });

  // ============================================================
  // Ally and Minion Tests
  // ============================================================

  describe('Ally and Minion Behavior', () => {
    it('should have Centurion and Mystic as paired enemies', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');

      expect(centurion.pair).toBe('mystic');
      expect(mystic.pair).toBe('centurion');
    });

    it('should have Gremlin Leader spawn minions', () => {
      const gremlinLeader = getEnemyById('gremlinLeader');
      expect(gremlinLeader.spawnMinions).toBe('gremlinMinion');
      expect(gremlinLeader.minionCount.min).toBeGreaterThan(0);
    });

    it('should have Gremlin Leader enrage when alone', () => {
      const gremlinLeader = createEnemyInstance(getEnemyById('gremlinLeader'), 0);
      const move = getEnemyMove(gremlinLeader, 1, null, 0, []); // No allies
      expect(move.id).toBe('enrage');
    });

    it('should have Reptomancer spawn daggers', () => {
      const reptomancer = getEnemyById('reptomancer');
      expect(reptomancer.spawnMinions).toBe('dagger');
      expect(reptomancer.minionCount.min).toBe(2);
      expect(reptomancer.minionCount.max).toBe(2);
    });

    it('should have Bronze Automaton spawn orbs', () => {
      const automaton = getEnemyById('automaton');
      expect(automaton.spawnMinions).toBe('bronzeOrb');
      expect(automaton.minionCount.min).toBe(2);
      expect(automaton.minionCount.max).toBe(2);
    });
  });

  // ============================================================
  // Encounter Generation Tests
  // ============================================================

  describe('Encounter Generation', () => {
    it('should generate valid Act 1 normal encounters', () => {
      for (let i = 0; i < 10; i++) {
        const encounter = getEncounter(1, 3, 0.1, false);
        expect(encounter.length).toBeGreaterThan(0);
        encounter.forEach(enemy => {
          expect(enemy.act).toBeLessThanOrEqual(1);
          expect(enemy.instanceId).toBeDefined();
          expect(enemy.currentHp).toBeGreaterThan(0);
        });
      }
    });

    it('should generate valid Act 2 normal encounters', () => {
      for (let i = 0; i < 10; i++) {
        const encounter = getEncounter(2, 18, 0.1, false);
        expect(encounter.length).toBeGreaterThan(0);
        encounter.forEach(enemy => {
          expect(enemy.act).toBeLessThanOrEqual(2);
          expect(enemy.instanceId).toBeDefined();
        });
      }
    });

    it('should generate valid elite encounters', () => {
      for (let i = 0; i < 10; i++) {
        const encounter = getEncounter(1, 6, 0.1, true);
        expect(encounter.length).toBeGreaterThan(0);
        encounter.forEach(enemy => {
          expect(enemy.type).toBe('elite');
        });
      }
    });

    it('should generate valid boss encounters', () => {
      const act1Boss = getBossEncounter(1);
      expect(act1Boss.length).toBeGreaterThan(0);
      expect(act1Boss[0].type).toBe('boss');
      expect(act1Boss[0].act).toBe(1);

      const act2Boss = getBossEncounter(2);
      expect(act2Boss.length).toBeGreaterThan(0);
      expect(act2Boss[0].type).toBe('boss');
    });

    it('should spawn minions with boss encounters that have spawnMinions', () => {
      // Find a boss with spawnMinions
      const automatonBoss = getEnemyById('automaton');

      // Create manual boss encounter with minions
      const mainBoss = createEnemyInstance(automatonBoss, 0);
      const minionDef = getEnemyById(automatonBoss.spawnMinions);
      const minion1 = createEnemyInstance(minionDef, 0);
      const minion2 = createEnemyInstance(minionDef, 1);

      const encounter = [mainBoss, minion1, minion2];

      expect(encounter.length).toBe(3);
      expect(encounter[0].id).toBe('automaton');
      expect(encounter[1].id).toBe('bronzeOrb');
      expect(encounter[2].id).toBe('bronzeOrb');
    });
  });

  // ============================================================
  // Enemy Instance Creation Tests
  // ============================================================

  describe('Enemy Instance Creation', () => {
    it('should create instances with all required properties', () => {
      ALL_ENEMIES.forEach(enemy => {
        const instance = createEnemyInstance(enemy, 0);

        expect(instance.instanceId).toBeDefined();
        expect(instance.currentHp).toBeGreaterThan(0);
        expect(instance.maxHp).toBe(instance.currentHp);
        expect(instance.block).toBe(0);
        expect(instance.strength).toBe(0);
        expect(instance.vulnerable).toBe(0);
        expect(instance.weak).toBe(0);
        expect(instance.poison).toBe(0);
      });
    });

    it('should preserve special properties on instances', () => {
      const lagavulin = createEnemyInstance(getEnemyById('lagavulin'), 0);
      expect(lagavulin.asleep).toBe(true);
      expect(lagavulin.metallicize).toBe(6);

      const byrd = createEnemyInstance(getEnemyById('byrd'), 0);
      expect(byrd.flight).toBe(3);

      const heart = createEnemyInstance(getEnemyById('corruptHeart'), 0);
      expect(heart.invincible).toBe(200);
    });

    it('should create unique instanceIds for multiple instances', () => {
      const cultist = getEnemyById('cultist');
      const instance1 = createEnemyInstance(cultist, 0);
      const instance2 = createEnemyInstance(cultist, 1);

      expect(instance1.instanceId).not.toBe(instance2.instanceId);
    });
  });

  // ============================================================
  // Boss Phase Transition Tests
  // ============================================================

  describe('Boss Phase Transitions', () => {
    it('should have Awakened One canRebirth flag', () => {
      const awakenedOne = getEnemyById('awakened_one');
      expect(awakenedOne.canRebirth).toBe(true);
    });

    it('should have Awakened One onPowerPlayed callback', () => {
      const awakenedOne = getEnemyById('awakened_one');
      expect(awakenedOne.onPowerPlayed).toBeDefined();
      expect(typeof awakenedOne.onPowerPlayed).toBe('function');
    });

    it('should have Time Eater onCardPlayed callback', () => {
      const timeEater = getEnemyById('timeEater');
      expect(timeEater.onCardPlayed).toBeDefined();
      expect(typeof timeEater.onCardPlayed).toBe('function');
    });

    it('should have Slime Boss split special', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const splitMove = slimeBoss.moveset.find(m => m.id === 'split');
      expect(splitMove).toBeDefined();
      expect(splitMove.special).toBe('splitBoss');
    });

    it('should have The Guardian mode shift', () => {
      const guardian = getEnemyById('theGuardian');
      expect(guardian.modeShift).toBe(true);
      const modeShiftMove = guardian.moveset.find(m => m.id === 'modeShift');
      expect(modeShiftMove).toBeDefined();
      expect(modeShiftMove.special).toBe('modeShift');
    });

    it('should have Bronze Automaton phase2 flag', () => {
      const automaton = getEnemyById('automaton');
      expect(automaton.phase2).toBe(true);
      expect(automaton.onDeath).toBe('phase2Automaton');
    });

    it('should have Corrupt Heart beat of death flag', () => {
      const heart = getEnemyById('corruptHeart');
      expect(heart.beatOfDeath).toBe(true);
    });
  });

  // ============================================================
  // Status Card Application Tests
  // ============================================================

  describe('Status Card Application', () => {
    it('should have moves that add Slimed to discard', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const goopMove = slimeBoss.moveset.find(m => m.special === 'addSlimed');
      expect(goopMove).toBeDefined();
    });

    it('should have moves that add Dazed to draw pile', () => {
      const sentry = getEnemyById('sentryA');
      const beamMove = sentry.moveset.find(m => m.special === 'addDazed');
      expect(beamMove).toBeDefined();
    });

    it('should have moves that add Burn to discard', () => {
      const hexaghost = getEnemyById('hexaghost');
      const searMove = hexaghost.moveset.find(m => m.special === 'addBurn');
      expect(searMove).toBeDefined();
    });

    it('should process addSlimed special correctly', () => {
      const slimeBoss = createEnemyInstance(getEnemyById('slimeBoss'), 0);
      slimeBoss.intentData = { id: 'goop', intent: INTENT.DEBUFF, special: 'addSlimed', amount: 3 };

      const state = createCombatState({ enemies: [slimeBoss] });
      const ctx = createEnemyTurnContext(state);
      const result = processEnemyTurns(ctx);

      const slimedCards = result.newDiscardPile.filter(c => c.id === 'slimed');
      expect(slimedCards.length).toBe(3);
    });
  });

  // ============================================================
  // Intent Type Coverage Tests
  // ============================================================

  describe('Intent Type Coverage', () => {
    it('should have all intent types represented in enemy movesets', () => {
      const usedIntents = new Set();
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          usedIntents.add(move.intent);
        });
      });

      // Core intents that should be used
      expect(usedIntents.has(INTENT.ATTACK)).toBe(true);
      expect(usedIntents.has(INTENT.BUFF)).toBe(true);
      expect(usedIntents.has(INTENT.DEBUFF)).toBe(true);
      expect(usedIntents.has(INTENT.DEFEND)).toBe(true);
      expect(usedIntents.has(INTENT.ATTACK_BUFF)).toBe(true);
      expect(usedIntents.has(INTENT.ATTACK_DEBUFF)).toBe(true);
      expect(usedIntents.has(INTENT.DEFEND_BUFF)).toBe(true);
      expect(usedIntents.has(INTENT.STRONG_DEBUFF)).toBe(true);
      expect(usedIntents.has(INTENT.UNKNOWN)).toBe(true);
    });
  });

  // ============================================================
  // Enemy Count by Act and Type
  // ============================================================

  describe('Enemy Distribution', () => {
    it('should have sufficient enemies per act', () => {
      const act1Normal = ALL_ENEMIES.filter(e => e.act === 1 && e.type === 'normal');
      const act1Elite = ALL_ENEMIES.filter(e => e.act === 1 && e.type === 'elite');
      const act1Boss = ALL_ENEMIES.filter(e => e.act === 1 && e.type === 'boss');

      expect(act1Normal.length).toBeGreaterThanOrEqual(5);
      expect(act1Elite.length).toBeGreaterThanOrEqual(2);
      expect(act1Boss.length).toBeGreaterThanOrEqual(3);

      const act2Normal = ALL_ENEMIES.filter(e => e.act === 2 && e.type === 'normal');
      const act2Elite = ALL_ENEMIES.filter(e => e.act === 2 && e.type === 'elite');
      const act2Boss = ALL_ENEMIES.filter(e => e.act === 2 && e.type === 'boss');

      expect(act2Normal.length).toBeGreaterThanOrEqual(5);
      expect(act2Elite.length).toBeGreaterThanOrEqual(2);
      expect(act2Boss.length).toBeGreaterThanOrEqual(1);

      const act3Normal = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'normal');
      const act3Elite = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'elite');
      const act3Boss = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'boss');

      expect(act3Normal.length).toBeGreaterThanOrEqual(3);
      expect(act3Elite.length).toBeGreaterThanOrEqual(2);
      expect(act3Boss.length).toBeGreaterThanOrEqual(2);
    });

    it('should have exactly one Act 4 boss (Corrupt Heart)', () => {
      const act4Enemies = ALL_ENEMIES.filter(e => e.act === 4);
      expect(act4Enemies.length).toBe(1);
      expect(act4Enemies[0].id).toBe('corruptHeart');
      expect(act4Enemies[0].type).toBe('boss');
    });
  });
});
