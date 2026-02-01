import { describe, it, expect } from 'vitest';
import { getEnemyById, createEnemyInstance } from '../data/enemies.js';

describe('Corrupt Heart Boss — JR-10', () => {
  const getHeart = () => getEnemyById('corruptHeart');
  const getHeartInstance = () => createEnemyInstance(getHeart());

  describe('Base Stats', () => {
    it('has 750 HP', () => {
      const heart = getHeart();
      expect(heart.hp.min).toBe(750);
      expect(heart.hp.max).toBe(750);
    });

    it('is Act 4 boss', () => {
      const heart = getHeart();
      expect(heart.type).toBe('boss');
      expect(heart.act).toBe(4);
    });

    it('has 200 invincible shield', () => {
      const heart = getHeart();
      expect(heart.invincible).toBe(200);
    });

    it('has Beat of Death flag', () => {
      const heart = getHeart();
      expect(heart.beatOfDeath).toBe(true);
    });

    it('instance initializes with correct stats', () => {
      const instance = getHeartInstance();
      expect(instance.currentHp).toBe(750);
      expect(instance.maxHp).toBe(750);
      expect(instance.invincible).toBe(200);
      expect(instance.beatOfDeath).toBe(true);
    });
  });

  describe('Moveset', () => {
    it('has 4 moves: debilitate, bloodShots, echo, buff', () => {
      const heart = getHeart();
      expect(heart.moveset).toHaveLength(4);
      expect(heart.moveset[0].id).toBe('debilitate');
      expect(heart.moveset[1].id).toBe('bloodShots');
      expect(heart.moveset[2].id).toBe('echo');
      expect(heart.moveset[3].id).toBe('buff');
    });

    it('debilitate applies vulnerable, weak, and frail', () => {
      const heart = getHeart();
      const debilitate = heart.moveset[0];
      const effects = debilitate.effects;
      expect(effects.find(e => e.type === 'vulnerable').amount).toBe(2);
      expect(effects.find(e => e.type === 'weak').amount).toBe(2);
      expect(effects.find(e => e.type === 'frail').amount).toBe(2);
    });

    it('Blood Shots is multi-hit (2 damage × 15)', () => {
      const heart = getHeart();
      const bloodShots = heart.moveset[1];
      expect(bloodShots.damage).toBe(2);
      expect(bloodShots.times).toBe(15);
    });

    it('Blood Shots has escalation special', () => {
      const heart = getHeart();
      const bloodShots = heart.moveset[1];
      expect(bloodShots.special).toBe('bloodShotsEscalate');
    });

    it('Echo deals 40 damage and adds status cards', () => {
      const heart = getHeart();
      const echo = heart.moveset[2];
      expect(echo.damage).toBe(40);
      expect(echo.special).toBe('addStatus');
    });

    it('Buff grants strength and artifact and enables Beat of Death', () => {
      const heart = getHeart();
      const buff = heart.moveset[3];
      expect(buff.effects.find(e => e.type === 'strength').amount).toBe(2);
      expect(buff.effects.find(e => e.type === 'artifact').amount).toBe(2);
      expect(buff.special).toBe('beatOfDeath');
    });
  });

  describe('AI Pattern', () => {
    it('turn 0: always Debilitate', () => {
      const heart = getHeart();
      const instance = getHeartInstance();
      const move = heart.ai(instance, 0, null);
      expect(move.id).toBe('debilitate');
    });

    it('turn 1: Blood Shots', () => {
      const heart = getHeart();
      const instance = getHeartInstance();
      const move = heart.ai(instance, 1, null);
      expect(move.id).toBe('bloodShots');
    });

    it('turn 2: Echo', () => {
      const heart = getHeart();
      const instance = getHeartInstance();
      const move = heart.ai(instance, 2, null);
      expect(move.id).toBe('echo');
    });

    it('turn 3: Buff', () => {
      const heart = getHeart();
      const instance = getHeartInstance();
      const move = heart.ai(instance, 3, null);
      expect(move.id).toBe('buff');
    });

    it('cycle repeats: turn 4 = Blood Shots, turn 5 = Echo, turn 6 = Buff', () => {
      const heart = getHeart();
      const instance = getHeartInstance();
      expect(heart.ai(instance, 4, null).id).toBe('bloodShots');
      expect(heart.ai(instance, 5, null).id).toBe('echo');
      expect(heart.ai(instance, 6, null).id).toBe('buff');
    });
  });

  describe('Blood Shots Escalation', () => {
    it('bloodShotsBonus starts at 0 (undefined)', () => {
      const instance = getHeartInstance();
      expect(instance.bloodShotsBonus).toBeUndefined();
    });
  });
});
