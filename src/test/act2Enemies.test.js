import { describe, it, expect } from 'vitest';
import { getEnemyById, createEnemyInstance } from '../data/enemies';

describe('Act 2 Enemies - Centurion, Mystic, Snecko (JR-03a)', () => {
  describe('Centurion', () => {
    const centurion = getEnemyById('centurion');

    it('should exist with correct base stats', () => {
      expect(centurion).toBeDefined();
      expect(centurion.name).toBe('Centurion');
      expect(centurion.hp).toEqual({ min: 76, max: 76 });
      expect(centurion.type).toBe('normal');
      expect(centurion.act).toBe(2);
    });

    it('should have pair set to mystic', () => {
      expect(centurion.pair).toBe('mystic');
    });

    it('should have fury property for ally-death strength gain', () => {
      expect(centurion.fury).toBeDefined();
      expect(centurion.fury.strengthGain).toBe(2);
    });

    it('should have 3 moves: slash, fury (multi-attack), shieldAlly', () => {
      expect(centurion.moveset).toHaveLength(3);
      expect(centurion.moveset[0].id).toBe('slash');
      expect(centurion.moveset[0].damage).toBe(12);
      expect(centurion.moveset[1].id).toBe('fury');
      expect(centurion.moveset[1].damage).toBe(6);
      expect(centurion.moveset[1].times).toBe(3);
      expect(centurion.moveset[2].id).toBe('shieldAlly');
      expect(centurion.moveset[2].block).toBe(15);
      expect(centurion.moveset[2].special).toBe('shieldAlly');
    });

    it('AI should open with slash on turn 0', () => {
      const instance = createEnemyInstance(centurion);
      const move = centurion.ai(instance, 0, null, 0, []);
      expect(move.id).toBe('slash');
    });

    it('AI should alternate between slash and fury', () => {
      const instance = createEnemyInstance(centurion);
      const slash = centurion.moveset[0];
      const fury = centurion.moveset[1];

      const move1 = centurion.ai(instance, 1, slash, 0, []);
      expect(move1.id).toBe('fury');

      const move2 = centurion.ai(instance, 2, fury, 0, []);
      expect(move2.id).toBe('slash');
    });

    it('AI should shield ally when mystic is below 50% HP', () => {
      const instance = createEnemyInstance(centurion);
      const mysticInstance = createEnemyInstance(getEnemyById('mystic'));
      mysticInstance.currentHp = 10; // Well below 50%

      const move = centurion.ai(instance, 1, null, 0, [instance, mysticInstance]);
      expect(move.id).toBe('shieldAlly');
    });
  });

  describe('Mystic', () => {
    const mystic = getEnemyById('mystic');

    it('should exist with correct base stats', () => {
      expect(mystic).toBeDefined();
      expect(mystic.name).toBe('Mystic');
      expect(mystic.hp).toEqual({ min: 56, max: 56 });
      expect(mystic.type).toBe('normal');
      expect(mystic.act).toBe(2);
    });

    it('should have pair set to centurion', () => {
      expect(mystic.pair).toBe('centurion');
    });

    it('should have 4 moves: heal, buffAlly, debuff, attack', () => {
      expect(mystic.moveset).toHaveLength(4);
      expect(mystic.moveset[0].id).toBe('heal');
      expect(mystic.moveset[0].healAmount).toBe(16);
      expect(mystic.moveset[1].id).toBe('buffAlly');
      expect(mystic.moveset[1].effects[0].type).toBe('strength');
      expect(mystic.moveset[2].id).toBe('debuff');
      expect(mystic.moveset[2].effects).toHaveLength(2);
      expect(mystic.moveset[3].id).toBe('attack');
      expect(mystic.moveset[3].damage).toBe(8);
    });

    it('AI should buff ally on turn 0 when centurion is present', () => {
      const instance = createEnemyInstance(mystic);
      const centurionInstance = createEnemyInstance(getEnemyById('centurion'));

      const move = mystic.ai(instance, 0, null, 0, [centurionInstance, instance]);
      expect(move.id).toBe('buffAlly');
    });

    it('AI should heal centurion when below 60% HP', () => {
      const instance = createEnemyInstance(mystic);
      const centurionInstance = createEnemyInstance(getEnemyById('centurion'));
      centurionInstance.currentHp = 20; // Well below 60%

      const move = mystic.ai(instance, 1, null, 0, [centurionInstance, instance]);
      expect(move.id).toBe('heal');
    });

    it('AI should attack when no centurion ally present', () => {
      const instance = createEnemyInstance(mystic);
      const move = mystic.ai(instance, 0, null, 0, [instance]);
      expect(move.id).toBe('attack');
    });

    it('AI should cycle buff -> debuff -> attack when centurion alive', () => {
      const instance = createEnemyInstance(mystic);
      const centurionInstance = createEnemyInstance(getEnemyById('centurion'));
      const allies = [centurionInstance, instance];

      const m0 = mystic.ai(instance, 0, null, 0, allies);
      expect(m0.id).toBe('buffAlly');

      const m1 = mystic.ai(instance, 1, m0, 0, allies);
      expect(m1.id).toBe('debuff');

      const m2 = mystic.ai(instance, 2, m1, 0, allies);
      expect(m2.id).toBe('attack');

      const m3 = mystic.ai(instance, 3, m2, 0, allies);
      expect(m3.id).toBe('buffAlly');
    });
  });

  describe('Snecko', () => {
    const snecko = getEnemyById('snecko');

    it('should exist with correct base stats', () => {
      expect(snecko).toBeDefined();
      expect(snecko.name).toBe('Snecko');
      expect(snecko.hp).toEqual({ min: 114, max: 120 });
      expect(snecko.type).toBe('normal');
      expect(snecko.act).toBe(2);
    });

    it('should have 3 moves: perplexingGlare, tailWhip, bite', () => {
      expect(snecko.moveset).toHaveLength(3);
      expect(snecko.moveset[0].id).toBe('perplexingGlare');
      expect(snecko.moveset[0].effects[0].type).toBe('confused');
      expect(snecko.moveset[1].id).toBe('tailWhip');
      expect(snecko.moveset[1].damage).toBe(18);
      expect(snecko.moveset[1].effects[0].type).toBe('weak');
      expect(snecko.moveset[2].id).toBe('bite');
      expect(snecko.moveset[2].damage).toBe(15);
    });

    it('AI should open with Perplexing Glare on turn 0', () => {
      const instance = createEnemyInstance(snecko);
      const move = snecko.ai(instance, 0, null);
      expect(move.id).toBe('perplexingGlare');
    });

    it('AI should alternate tail whip and bite after glare', () => {
      const instance = createEnemyInstance(snecko);
      const glare = snecko.moveset[0];
      const tailWhip = snecko.moveset[1];

      const m1 = snecko.ai(instance, 1, glare);
      expect(m1.id).toBe('tailWhip');

      const m2 = snecko.ai(instance, 2, tailWhip);
      expect(m2.id).toBe('bite');
    });

    it('should not have confuse property (uses effect in moveset instead)', () => {
      // Confused is now applied via Perplexing Glare effect, not a passive flag
      expect(snecko.confuse).toBeUndefined();
    });
  });

  describe('Chosen (JR-03b)', () => {
    const chosen = getEnemyById('chosen');

    it('should exist with correct base stats', () => {
      expect(chosen).toBeDefined();
      expect(chosen.name).toBe('Chosen');
      expect(chosen.hp).toEqual({ min: 95, max: 95 });
      expect(chosen.type).toBe('normal');
      expect(chosen.act).toBe(2);
    });

    it('should have artifact: 1', () => {
      expect(chosen.artifact).toBe(1);
    });

    it('should have 3 moves: hex, poke (5x2), drain (18 dmg + heal 7)', () => {
      expect(chosen.moveset).toHaveLength(3);
      expect(chosen.moveset[0].id).toBe('hex');
      expect(chosen.moveset[0].effects[0].type).toBe('vulnerable');
      expect(chosen.moveset[0].effects[0].amount).toBe(2);
      expect(chosen.moveset[1].id).toBe('poke');
      expect(chosen.moveset[1].damage).toBe(5);
      expect(chosen.moveset[1].times).toBe(2);
      expect(chosen.moveset[2].id).toBe('drain');
      expect(chosen.moveset[2].damage).toBe(18);
      expect(chosen.moveset[2].healAmount).toBe(7);
    });

    it('AI should open with Hex on turn 0', () => {
      const instance = createEnemyInstance(chosen);
      const move = chosen.ai(instance, 0, null);
      expect(move.id).toBe('hex');
    });

    it('AI should cycle poke -> drain -> poke', () => {
      const instance = createEnemyInstance(chosen);
      const hex = chosen.moveset[0];
      const poke = chosen.moveset[1];
      const drain = chosen.moveset[2];

      const m1 = chosen.ai(instance, 1, hex);
      expect(m1.id).toBe('poke');

      const m2 = chosen.ai(instance, 2, poke);
      expect(m2.id).toBe('drain');

      const m3 = chosen.ai(instance, 3, drain);
      expect(m3.id).toBe('poke');
    });

    it('createEnemyInstance should set artifact to 1', () => {
      const instance = createEnemyInstance(chosen);
      expect(instance.artifact).toBe(1);
    });
  });

  describe('Shelled Parasite (JR-03b)', () => {
    const parasite = getEnemyById('shelledParasite');

    it('should exist with correct base stats', () => {
      expect(parasite).toBeDefined();
      expect(parasite.name).toBe('Shelled Parasite');
      expect(parasite.hp).toEqual({ min: 71, max: 71 });
      expect(parasite.type).toBe('normal');
      expect(parasite.act).toBe(2);
    });

    it('should have platedArmor: 14', () => {
      expect(parasite.platedArmor).toBe(14);
    });

    it('should have 2 moves: suck (10 dmg + heal 3), fell (18 dmg + frail 2)', () => {
      expect(parasite.moveset).toHaveLength(2);
      expect(parasite.moveset[0].id).toBe('suck');
      expect(parasite.moveset[0].damage).toBe(10);
      expect(parasite.moveset[0].healAmount).toBe(3);
      expect(parasite.moveset[1].id).toBe('fell');
      expect(parasite.moveset[1].damage).toBe(18);
      expect(parasite.moveset[1].effects[0].type).toBe('frail');
      expect(parasite.moveset[1].effects[0].amount).toBe(2);
    });

    it('AI should alternate suck and fell', () => {
      const instance = createEnemyInstance(parasite);
      expect(parasite.ai(instance, 0, null).id).toBe('suck');
      expect(parasite.ai(instance, 1, null).id).toBe('fell');
      expect(parasite.ai(instance, 2, null).id).toBe('suck');
      expect(parasite.ai(instance, 3, null).id).toBe('fell');
    });

    it('createEnemyInstance should set platedArmor to 14', () => {
      const instance = createEnemyInstance(parasite);
      expect(instance.platedArmor).toBe(14);
    });
  });

  describe('Byrd (JR-03b)', () => {
    const byrd = getEnemyById('byrd');

    it('should exist with correct base stats', () => {
      expect(byrd).toBeDefined();
      expect(byrd.name).toBe('Byrd');
      expect(byrd.hp).toEqual({ min: 25, max: 25 });
      expect(byrd.type).toBe('normal');
      expect(byrd.act).toBe(2);
    });

    it('should have flying: true (flight: 3 via createEnemyInstance)', () => {
      expect(byrd.flying).toBe(true);
      const instance = createEnemyInstance(byrd);
      expect(instance.flight).toBe(3);
    });

    it('should have 3 moves: caw (+1 str), peck (1x5), swoop (14 dmg)', () => {
      expect(byrd.moveset).toHaveLength(3);
      expect(byrd.moveset[0].id).toBe('caw');
      expect(byrd.moveset[0].effects[0].type).toBe('strength');
      expect(byrd.moveset[0].effects[0].amount).toBe(1);
      expect(byrd.moveset[1].id).toBe('peck');
      expect(byrd.moveset[1].damage).toBe(1);
      expect(byrd.moveset[1].times).toBe(5);
      expect(byrd.moveset[2].id).toBe('swoop');
      expect(byrd.moveset[2].damage).toBe(14);
    });

    it('AI should open with Caw on turn 0', () => {
      const instance = createEnemyInstance(byrd);
      const move = byrd.ai(instance, 0, null);
      expect(move.id).toBe('caw');
    });

    it('AI should alternate peck and swoop after caw', () => {
      const instance = createEnemyInstance(byrd);
      const caw = byrd.moveset[0];
      const peck = byrd.moveset[1];

      const m1 = byrd.ai(instance, 1, caw);
      expect(m1.id).toBe('peck');

      const m2 = byrd.ai(instance, 2, peck);
      expect(m2.id).toBe('swoop');
    });
  });

  describe('Centurion + Mystic pair fight', () => {
    it('both should reference each other via pair property', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      expect(centurion.pair).toBe('mystic');
      expect(mystic.pair).toBe('centurion');
    });

    it('AI functions should handle 5 turns without error', () => {
      const centurion = getEnemyById('centurion');
      const mystic = getEnemyById('mystic');
      const cInst = createEnemyInstance(centurion);
      const mInst = createEnemyInstance(mystic);
      const allies = [cInst, mInst];

      let cLast = null;
      let mLast = null;
      for (let t = 0; t < 5; t++) {
        cLast = centurion.ai(cInst, t, cLast, 0, allies);
        mLast = mystic.ai(mInst, t, mLast, 1, allies);
        expect(cLast).toBeDefined();
        expect(mLast).toBeDefined();
        expect(cLast).toHaveProperty('id');
        expect(mLast).toHaveProperty('id');
      }
    });
  });
});
