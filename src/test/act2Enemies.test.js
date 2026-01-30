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
