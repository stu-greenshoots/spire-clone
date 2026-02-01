import { describe, it, expect } from 'vitest';
import { ALL_CARDS } from '../data/cards.js';

const getCard = (id) => ALL_CARDS.find(c => c.id === id);

describe('JR-13: Card balance pass — Defect orb card adjustments', () => {
  describe('Sunder — buffed from 24 to 28 base', () => {
    it('has 28 base damage', () => {
      expect(getCard('sunder').damage).toBe(28);
    });
    it('has 36 upgraded damage', () => {
      expect(getCard('sunder').upgradedVersion.damage).toBe(36);
    });
    it('still costs 3', () => {
      expect(getCard('sunder').cost).toBe(3);
    });
  });

  describe('Meteor Strike — buffed from 24 to 27 base', () => {
    it('has 27 base damage', () => {
      expect(getCard('meteorStrike').damage).toBe(27);
    });
    it('has 35 upgraded damage', () => {
      expect(getCard('meteorStrike').upgradedVersion.damage).toBe(35);
    });
    it('still costs 5 and channels 3 Plasma', () => {
      expect(getCard('meteorStrike').cost).toBe(5);
      expect(getCard('meteorStrike').orbCount).toBe(3);
    });
  });

  describe('Equilibrium — buffed from 13 to 15 block', () => {
    it('has 15 base block', () => {
      expect(getCard('equilibrium').block).toBe(15);
    });
    it('has 19 upgraded block', () => {
      expect(getCard('equilibrium').upgradedVersion.block).toBe(19);
    });
    it('still retains hand', () => {
      expect(getCard('equilibrium').special).toBe('retainCards');
    });
  });

  describe('FTL — buffed from 5 to 6 base damage', () => {
    it('has 6 base damage', () => {
      expect(getCard('ftl').damage).toBe(6);
    });
    it('has 9 upgraded damage', () => {
      expect(getCard('ftl').upgradedVersion.damage).toBe(9);
    });
    it('still costs 0 with draw condition', () => {
      expect(getCard('ftl').cost).toBe(0);
      expect(getCard('ftl').special).toBe('ftlDraw');
    });
  });

  describe('Unchanged cards — verify no regressions', () => {
    it('Defragment still gives 1 Focus base', () => {
      expect(getCard('defragment').focusAmount).toBe(1);
    });
    it('Glacier still gives 7 block + 2 Frost', () => {
      expect(getCard('glacier').block).toBe(7);
      expect(getCard('glacier').orbCount).toBe(2);
    });
    it('Hyperbeam still deals 26 damage', () => {
      expect(getCard('hyperbeam').damage).toBe(26);
    });
    it('Echo Form still costs 3 and is ethereal', () => {
      expect(getCard('echoForm').cost).toBe(3);
      expect(getCard('echoForm').ethereal).toBe(true);
    });
    it('Compile Driver still deals 7 damage', () => {
      expect(getCard('compileDrive').damage).toBe(7);
    });
  });
});
