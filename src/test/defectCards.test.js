import { describe, it, expect } from 'vitest';
import { ALL_CARDS, CARD_TYPES, RARITY } from '../data/cards';
import { CARD_FLAVOR } from '../data/flavorText';

describe('Defect Card Pool', () => {
  const defectCards = ALL_CARDS.filter(c => c.character === 'defect');

  it('has exactly 30 Defect cards', () => {
    expect(defectCards.length).toBe(30);
  });

  it('has 4 basic cards (strike, defend, zap, dualcast)', () => {
    const basics = defectCards.filter(c => c.rarity === RARITY.BASIC);
    expect(basics.length).toBe(4);
    expect(basics.map(c => c.id).sort()).toEqual([
      'defend_defect', 'dualcast', 'strike_defect', 'zap'
    ]);
  });

  it('has 10 common cards', () => {
    const commons = defectCards.filter(c => c.rarity === RARITY.COMMON);
    expect(commons.length).toBe(10);
  });

  it('has 10 uncommon cards', () => {
    const uncommons = defectCards.filter(c => c.rarity === RARITY.UNCOMMON);
    expect(uncommons.length).toBe(10);
  });

  it('has 6 rare cards', () => {
    const rares = defectCards.filter(c => c.rarity === RARITY.RARE);
    expect(rares.length).toBe(6);
  });

  it('all cards have required fields', () => {
    defectCards.forEach(card => {
      expect(card.id, `${card.id} missing id`).toBeDefined();
      expect(card.name, `${card.id} missing name`).toBeDefined();
      expect(card.type, `${card.id} missing type`).toBeDefined();
      expect(card.rarity, `${card.id} missing rarity`).toBeDefined();
      expect(card.description, `${card.id} missing description`).toBeDefined();
      expect(card.character, `${card.id} missing character`).toBe('defect');
      expect(typeof card.upgraded, `${card.id} missing upgraded`).toBe('boolean');
    });
  });

  it('all cards have valid types', () => {
    const validTypes = Object.values(CARD_TYPES);
    defectCards.forEach(card => {
      expect(validTypes, `${card.id} has invalid type: ${card.type}`).toContain(card.type);
    });
  });

  it('all non-status cards have a cost >= 0', () => {
    defectCards
      .filter(c => c.type !== CARD_TYPES.STATUS && c.type !== CARD_TYPES.CURSE)
      .forEach(card => {
        expect(card.cost, `${card.id} has no cost`).toBeGreaterThanOrEqual(0);
      });
  });

  it('attack cards have damage', () => {
    defectCards
      .filter(c => c.type === CARD_TYPES.ATTACK)
      .filter(c => !c.special || !['blizzardDamage', 'blockPerDiscard'].includes(c.special))
      .forEach(card => {
        expect(card.damage, `${card.id} attack has no damage`).toBeGreaterThan(0);
      });
  });

  it('all cards have upgrade information', () => {
    defectCards.forEach(card => {
      expect(
        card.upgradedVersion !== undefined,
        `${card.id} has no upgradedVersion`
      ).toBe(true);
    });
  });

  it('all Defect card IDs are unique', () => {
    const ids = defectCards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('Card type distribution', () => {
    it('has attacks, skills, and powers', () => {
      const attacks = defectCards.filter(c => c.type === CARD_TYPES.ATTACK);
      const skills = defectCards.filter(c => c.type === CARD_TYPES.SKILL);
      const powers = defectCards.filter(c => c.type === CARD_TYPES.POWER);
      expect(attacks.length).toBeGreaterThan(0);
      expect(skills.length).toBeGreaterThan(0);
      expect(powers.length).toBeGreaterThan(0);
    });
  });

  describe('Orb-related cards', () => {
    it('has cards that channel each orb type', () => {
      const channelers = defectCards.filter(c =>
        c.special && c.special.startsWith('channel')
      );
      const channelTypes = channelers.map(c => c.special);
      expect(channelTypes).toContain('channelLightning');
      expect(channelTypes).toContain('channelFrost');
      expect(channelTypes).toContain('channelDark');
      expect(channelTypes).toContain('channelPlasma');
    });

    it('has Focus-modifying cards', () => {
      const focusCards = defectCards.filter(c =>
        c.special === 'gainFocus' || c.special === 'loseFocus' || c.special === 'consume'
      );
      expect(focusCards.length).toBeGreaterThanOrEqual(2);
    });

    it('has orb slot modifying cards', () => {
      const slotCards = defectCards.filter(c => c.special === 'gainOrbSlot');
      expect(slotCards.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Flavor text', () => {
    it('all Defect cards have flavor text', () => {
      defectCards.forEach(card => {
        expect(
          CARD_FLAVOR[card.id],
          `${card.id} missing flavor text`
        ).toBeDefined();
      });
    });
  });
});
