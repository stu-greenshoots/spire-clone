import { describe, it, expect } from 'vitest';
import { getEnemyById, createEnemyInstance } from '../data/enemies';

// ============================================================
// QA-08a: Act 2 Enemy Regression Tests
// Covers: AI patterns, pair fights, new systems, boss cycles,
//         minion spawning, multi-attack escalation
// ============================================================

// Helper: run AI for turns 0-N, returning array of moves
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

describe('QA-08a: Act 2 Enemy AI Regression - All Turns 0-10', () => {
  // ---- 1. Every Act 2 enemy AI produces valid moves on turns 0-10 ----

  const act2EnemyIds = [
    'centurion', 'mystic', 'snecko', 'chosen', 'shelledParasite',
    'byrd', 'bookOfStabbing', 'gremlinLeader', 'reptomancer',
    'dagger', 'automaton', 'bronzeOrb', 'slaverBlue', 'snakePlant',
    'sphericGuardian', 'gremlinMinion'
  ];

  describe('All Act 2 enemies produce valid moves on every turn (0-10)', () => {
    act2EnemyIds.forEach((enemyId) => {
      it(`${enemyId}: AI returns a move with 'id' for turns 0-10`, () => {
        const enemy = getEnemyById(enemyId);
        expect(enemy).toBeDefined();
        const instance = createEnemyInstance(enemy);

        // Some AIs need allies array - provide self as minimum
        const allies = [instance];

        // For pair/minion enemies, provide appropriate allies
        if (enemyId === 'centurion') {
          const mysticInst = createEnemyInstance(getEnemyById('mystic'));
          allies.push(mysticInst);
        } else if (enemyId === 'mystic') {
          const centurionInst = createEnemyInstance(getEnemyById('centurion'));
          allies.unshift(centurionInst);
        } else if (enemyId === 'gremlinLeader') {
          const minion = createEnemyInstance(getEnemyById('gremlinMinion'));
          allies.push(minion);
        } else if (enemyId === 'reptomancer') {
          const dagger1 = createEnemyInstance(getEnemyById('dagger'), 0);
          const dagger2 = createEnemyInstance(getEnemyById('dagger'), 1);
          allies.push(dagger1, dagger2);
        }

        let lastMove = null;
        for (let turn = 0; turn <= 10; turn++) {
          const move = enemy.ai(instance, turn, lastMove, 0, allies);
          expect(move, `${enemyId} turn ${turn} returned undefined`).toBeDefined();
          expect(move.id, `${enemyId} turn ${turn} move missing 'id'`).toBeDefined();
          expect(typeof move.id).toBe('string');
          // Move must be from the enemy's moveset (or inline return)
          lastMove = move;
        }
      });
    });
  });

  // ---- 2. Pair fight mechanics: Centurion + Mystic ----

  describe('Centurion + Mystic pair fight mechanics', () => {
    it('Centurion shields Mystic when Mystic is below 50% HP', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      const cInst = createEnemyInstance(centurion);
      const mInst = createEnemyInstance(mystic);
      mInst.currentHp = Math.floor(mInst.maxHp * 0.3); // 30% HP

      const move = centurion.ai(cInst, 1, null, 0, [cInst, mInst]);
      expect(move.id).toBe('shieldAlly');
      expect(move.block).toBe(15);
    });

    it('Centurion does NOT shield when Mystic is above 50% HP', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      const cInst = createEnemyInstance(centurion);
      const mInst = createEnemyInstance(mystic);
      // mInst at full HP

      const moves = runAI(centurion, cInst, 3, [cInst, mInst]);
      const shieldMoves = moves.filter(m => m.id === 'shieldAlly');
      expect(shieldMoves.length).toBe(0);
    });

    it('Mystic heals Centurion when below 60% HP', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      const cInst = createEnemyInstance(centurion);
      const mInst = createEnemyInstance(mystic);
      cInst.currentHp = Math.floor(cInst.maxHp * 0.4); // 40% HP

      const move = mystic.ai(mInst, 1, null, 0, [cInst, mInst]);
      expect(move.id).toBe('heal');
      expect(move.healAmount).toBe(16);
    });

    it('Mystic attacks when Centurion is dead (alone)', () => {
      const mystic = getEnemyById('mystic');
      const mInst = createEnemyInstance(mystic);

      const move = mystic.ai(mInst, 0, null, 0, [mInst]);
      expect(move.id).toBe('attack');
    });

    it('Mystic cycles buffAlly -> debuff -> attack when Centurion alive at full HP', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      const cInst = createEnemyInstance(centurion);
      const mInst = createEnemyInstance(mystic);
      const allies = [cInst, mInst];

      const moves = runAI(mystic, mInst, 5, allies);
      expect(moves[0].id).toBe('buffAlly');
      expect(moves[1].id).toBe('debuff');
      expect(moves[2].id).toBe('attack');
      expect(moves[3].id).toBe('buffAlly');
      expect(moves[4].id).toBe('debuff');
      expect(moves[5].id).toBe('attack');
    });

    it('Centurion has fury property for ally-death strength gain', () => {
      const centurion = getEnemyById('centurion');
      expect(centurion.fury).toBeDefined();
      expect(centurion.fury.strengthGain).toBe(2);
    });

    it('Both enemies reference each other via pair property', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      expect(centurion.pair).toBe('mystic');
      expect(mystic.pair).toBe('centurion');
    });

    it('10-turn simulation with both alive produces no errors', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      const cInst = createEnemyInstance(centurion);
      const mInst = createEnemyInstance(mystic);
      const allies = [cInst, mInst];

      let cLast = null;
      let mLast = null;
      for (let t = 0; t <= 10; t++) {
        cLast = centurion.ai(cInst, t, cLast, 0, allies);
        mLast = mystic.ai(mInst, t, mLast, 1, allies);
        expect(cLast).toHaveProperty('id');
        expect(mLast).toHaveProperty('id');
      }
    });
  });

  // ---- 3. New systems integration ----

  describe('New systems: Confused, Plated Armor, Lifesteal, Artifact', () => {
    describe('Confused (via Snecko Perplexing Glare)', () => {
      it('Snecko applies confused effect on turn 0', () => {
        const snecko = getEnemyById('snecko');
        const instance = createEnemyInstance(snecko);
        const move = snecko.ai(instance, 0, null);
        expect(move.id).toBe('perplexingGlare');
        expect(move.effects).toBeDefined();
        expect(move.effects[0].type).toBe('confused');
        expect(move.effects[0].amount).toBe(1);
        expect(move.effects[0].target).toBe('player');
      });

      it('Confused effect is a debuff targeting the player', () => {
        const snecko = getEnemyById('snecko');
        const glare = snecko.moveset[0];
        expect(glare.effects[0].target).toBe('player');
      });
    });

    describe('Plated Armor (via Shelled Parasite)', () => {
      it('Shelled Parasite has platedArmor: 14 on definition', () => {
        const parasite = getEnemyById('shelledParasite');
        expect(parasite.platedArmor).toBe(14);
      });

      it('createEnemyInstance propagates platedArmor to instance', () => {
        const parasite = getEnemyById('shelledParasite');
        const instance = createEnemyInstance(parasite);
        expect(instance.platedArmor).toBe(14);
      });

      it('Enemies without platedArmor get 0 on instance', () => {
        const cultist = getEnemyById('cultist');
        const instance = createEnemyInstance(cultist);
        expect(instance.platedArmor).toBe(0);
      });
    });

    describe('Lifesteal (via Chosen drain and Shelled Parasite suck)', () => {
      it('Chosen drain has damage 18 and healAmount 7', () => {
        const chosen = getEnemyById('chosen');
        const drain = chosen.moveset.find(m => m.id === 'drain');
        expect(drain.damage).toBe(18);
        expect(drain.healAmount).toBe(7);
      });

      it('Shelled Parasite suck has damage 10 and healAmount 3', () => {
        const parasite = getEnemyById('shelledParasite');
        const suck = parasite.moveset.find(m => m.id === 'suck');
        expect(suck.damage).toBe(10);
        expect(suck.healAmount).toBe(3);
      });
    });

    describe('Artifact (via Chosen and Automaton)', () => {
      it('Chosen has artifact: 1 on definition', () => {
        expect(getEnemyById('chosen').artifact).toBe(1);
      });

      it('Automaton has artifact: 3 on definition', () => {
        expect(getEnemyById('automaton').artifact).toBe(3);
      });

      it('createEnemyInstance sets artifact correctly for Chosen', () => {
        const instance = createEnemyInstance(getEnemyById('chosen'));
        expect(instance.artifact).toBe(1);
      });

      it('createEnemyInstance sets artifact correctly for Automaton', () => {
        const instance = createEnemyInstance(getEnemyById('automaton'));
        expect(instance.artifact).toBe(3);
      });

      it('Enemies without artifact get 0 on instance', () => {
        const byrd = getEnemyById('byrd');
        const instance = createEnemyInstance(byrd);
        expect(instance.artifact).toBe(0);
      });
    });
  });

  // ---- 4. Boss Automaton pattern cycle ----

  describe('Bronze Automaton AI pattern', () => {
    it('follows fixed 3-turn cycle: boost -> dualStrike -> hyperBeam', () => {
      const auto = getEnemyById('automaton');
      const instance = createEnemyInstance(auto);

      const moves = runAI(auto, instance, 8);
      const pattern = ['boost', 'dualStrike', 'hyperBeam'];
      for (let i = 0; i <= 8; i++) {
        expect(moves[i].id).toBe(pattern[i % 3]);
      }
    });

    it('has phase2 flag and onDeath for spawning Bronze Orbs', () => {
      const auto = getEnemyById('automaton');
      expect(auto.phase2).toBe(true);
      expect(auto.onDeath).toBe('phase2Automaton');
      expect(auto.spawnMinions).toBe('bronzeOrb');
      expect(auto.minionCount).toEqual({ min: 2, max: 2 });
    });

    it('Bronze Orb alternates beam and supportBeam over 10 turns', () => {
      const orb = getEnemyById('bronzeOrb');
      const instance = createEnemyInstance(orb);
      const moves = runAI(orb, instance, 9);
      for (let i = 0; i <= 9; i++) {
        expect(moves[i].id).toBe(i % 2 === 0 ? 'beam' : 'supportBeam');
      }
    });
  });

  // ---- 5. Minion spawning: Gremlin Leader, Reptomancer ----

  describe('Minion spawning mechanics', () => {
    describe('Gremlin Leader', () => {
      it('has spawnMinions config for gremlinMinion', () => {
        const leader = getEnemyById('gremlinLeader');
        expect(leader.spawnMinions).toBe('gremlinMinion');
        expect(leader.minionCount).toEqual({ min: 3, max: 4 });
      });

      it('enrages when alone (no living minions)', () => {
        const leader = getEnemyById('gremlinLeader');
        const instance = createEnemyInstance(leader);
        const move = leader.ai(instance, 1, null, 0, [instance]);
        expect(move.id).toBe('enrage');
        expect(move.effects[0].type).toBe('strength');
        expect(move.effects[0].amount).toBe(9);
        expect(move.effects[1].type).toBe('metallicize');
        expect(move.effects[1].amount).toBe(9);
      });

      it('encourages on turn 0 with minions present', () => {
        const leader = getEnemyById('gremlinLeader');
        const instance = createEnemyInstance(leader);
        const minion = createEnemyInstance(getEnemyById('gremlinMinion'));
        const move = leader.ai(instance, 0, null, 0, [instance, minion]);
        expect(move.id).toBe('encourage');
      });

      it('alternates encourage/stab with minions over 10 turns', () => {
        const leader = getEnemyById('gremlinLeader');
        const instance = createEnemyInstance(leader);
        const minion = createEnemyInstance(getEnemyById('gremlinMinion'));
        const allies = [instance, minion];

        const moves = runAI(leader, instance, 9, allies);
        // Turn 0: encourage (even), Turn 1: stab (odd), Turn 2: encourage (even), etc.
        for (let i = 0; i <= 9; i++) {
          expect(moves[i].id).toBe(i % 2 === 0 ? 'encourage' : 'stab');
        }
      });

      it('Gremlin minion always scratches', () => {
        const minion = getEnemyById('gremlinMinion');
        for (let t = 0; t <= 10; t++) {
          const move = minion.ai();
          expect(move.id).toBe('scratch');
          expect(move.damage).toBe(5);
        }
      });
    });

    describe('Reptomancer', () => {
      it('has spawnMinions config for daggers', () => {
        const repto = getEnemyById('reptomancer');
        expect(repto.spawnMinions).toBe('dagger');
        expect(repto.minionCount).toEqual({ min: 2, max: 2 });
      });

      it('summons on turn 0', () => {
        const repto = getEnemyById('reptomancer');
        const instance = createEnemyInstance(repto);
        const move = repto.ai(instance, 0, null, 0, [instance]);
        expect(move.id).toBe('summon');
      });

      it('resummons when all daggers are dead', () => {
        const repto = getEnemyById('reptomancer');
        const instance = createEnemyInstance(repto);
        // Only self in allies = no living daggers
        const move = repto.ai(instance, 3, null, 0, [instance]);
        expect(move.id).toBe('summon');
      });

      it('alternates snakeStrike/bigBite with living daggers', () => {
        const repto = getEnemyById('reptomancer');
        const instance = createEnemyInstance(repto);
        const dagger = createEnemyInstance(getEnemyById('dagger'));
        const allies = [instance, dagger];

        // After turn 0 summon, odd turns = snakeStrike, even turns = bigBite
        const m1 = repto.ai(instance, 1, null, 0, allies);
        expect(m1.id).toBe('snakeStrike');
        const m2 = repto.ai(instance, 2, m1, 0, allies);
        expect(m2.id).toBe('bigBite');
        const m3 = repto.ai(instance, 3, m2, 0, allies);
        expect(m3.id).toBe('snakeStrike');
      });

      it('Dagger always stabs (9 dmg x2)', () => {
        const dagger = getEnemyById('dagger');
        for (let t = 0; t <= 10; t++) {
          const move = dagger.ai();
          expect(move.id).toBe('stab');
          expect(move.damage).toBe(9);
          expect(move.times).toBe(2);
        }
      });
    });
  });

  // ---- 6. Multi-attack values ----

  describe('Multi-attack values and escalation', () => {
    it('Book of Stabbing: multiStab starts at 6 dmg x2, escalation = 1', () => {
      const book = getEnemyById('bookOfStabbing');
      expect(book.multiStabCount).toBe(2);
      expect(book.stabEscalation).toBe(1);
      expect(book.moveset[0].damage).toBe(6);
      expect(book.moveset[0].times).toBe(2);
    });

    it('Book of Stabbing AI always returns multiStab for 10 turns', () => {
      const book = getEnemyById('bookOfStabbing');
      const instance = createEnemyInstance(book);
      const moves = runAI(book, instance, 10);
      moves.forEach((move, i) => {
        expect(move.id, `Turn ${i}`).toBe('multiStab');
      });
    });

    it('Byrd peck: 1 dmg x5', () => {
      const byrd = getEnemyById('byrd');
      const peck = byrd.moveset.find(m => m.id === 'peck');
      expect(peck.damage).toBe(1);
      expect(peck.times).toBe(5);
    });

    it('Byrd AI: caw -> peck -> swoop -> peck -> swoop...', () => {
      const byrd = getEnemyById('byrd');
      const instance = createEnemyInstance(byrd);
      const moves = runAI(byrd, instance, 6);
      expect(moves[0].id).toBe('caw');
      expect(moves[1].id).toBe('peck');
      expect(moves[2].id).toBe('swoop');
      expect(moves[3].id).toBe('peck');
      expect(moves[4].id).toBe('swoop');
      expect(moves[5].id).toBe('peck');
    });

    it('Centurion fury: 6 dmg x3', () => {
      const centurion = getEnemyById('centurion');
      const fury = centurion.moveset.find(m => m.id === 'fury');
      expect(fury.damage).toBe(6);
      expect(fury.times).toBe(3);
    });

    it('Chosen poke: 5 dmg x2', () => {
      const chosen = getEnemyById('chosen');
      const poke = chosen.moveset.find(m => m.id === 'poke');
      expect(poke.damage).toBe(5);
      expect(poke.times).toBe(2);
    });

    it('Automaton dualStrike: 5 dmg x2', () => {
      const auto = getEnemyById('automaton');
      const dual = auto.moveset.find(m => m.id === 'dualStrike');
      expect(dual.damage).toBe(5);
      expect(dual.times).toBe(2);
    });

    it('Dagger stab: 9 dmg x2', () => {
      const dagger = getEnemyById('dagger');
      const stab = dagger.moveset[0];
      expect(stab.damage).toBe(9);
      expect(stab.times).toBe(2);
    });

    it('Gremlin Leader stab: 6 dmg x3', () => {
      const leader = getEnemyById('gremlinLeader');
      const stab = leader.moveset.find(m => m.id === 'stab');
      expect(stab.damage).toBe(6);
      expect(stab.times).toBe(3);
    });
  });

  // ---- 7. createEnemyInstance field propagation ----

  describe('createEnemyInstance field propagation for Act 2 enemies', () => {
    it('Byrd: flying=true -> instance.flight=3', () => {
      const byrd = getEnemyById('byrd');
      const instance = createEnemyInstance(byrd);
      expect(instance.flight).toBe(3);
    });

    it('Shelled Parasite: platedArmor=14 on instance', () => {
      const instance = createEnemyInstance(getEnemyById('shelledParasite'));
      expect(instance.platedArmor).toBe(14);
    });

    it('Chosen: artifact=1 on instance', () => {
      const instance = createEnemyInstance(getEnemyById('chosen'));
      expect(instance.artifact).toBe(1);
    });

    it('Automaton: artifact=3 on instance', () => {
      const instance = createEnemyInstance(getEnemyById('automaton'));
      expect(instance.artifact).toBe(3);
    });

    it('All Act 2 instances have required combat fields', () => {
      act2EnemyIds.forEach((enemyId) => {
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
