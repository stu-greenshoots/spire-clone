import { describe, it, expect } from 'vitest';
import { ALL_CARDS, CARD_TYPES, RARITY } from '../data/cards';

describe('Watcher Cards Batch 1', () => {
  const watcherCards = ALL_CARDS.filter(c => c.character === 'watcher');

  it('has at least 15 Watcher cards', () => {
    expect(watcherCards.length).toBeGreaterThanOrEqual(15);
  });

  describe('Basic Cards', () => {
    it('Strike (Watcher) exists with correct stats', () => {
      const card = ALL_CARDS.find(c => c.id === 'strike_watcher');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.rarity).toBe(RARITY.BASIC);
      expect(card.character).toBe('watcher');
      expect(card.cost).toBe(1);
      expect(card.damage).toBe(6);
      expect(card.upgradedVersion.damage).toBe(9);
    });

    it('Defend (Watcher) exists with correct stats', () => {
      const card = ALL_CARDS.find(c => c.id === 'defend_watcher');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.rarity).toBe(RARITY.BASIC);
      expect(card.character).toBe('watcher');
      expect(card.cost).toBe(1);
      expect(card.block).toBe(5);
      expect(card.upgradedVersion.block).toBe(8);
    });

    it('Eruption enters Wrath stance', () => {
      const card = ALL_CARDS.find(c => c.id === 'eruption');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.rarity).toBe(RARITY.BASIC);
      expect(card.character).toBe('watcher');
      expect(card.cost).toBe(2);
      expect(card.damage).toBe(9);
      expect(card.enterStance).toBe('wrath');
      expect(card.upgradedVersion.cost).toBe(1);
    });

    it('Vigilance enters Calm stance', () => {
      const card = ALL_CARDS.find(c => c.id === 'vigilance');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.rarity).toBe(RARITY.BASIC);
      expect(card.character).toBe('watcher');
      expect(card.cost).toBe(2);
      expect(card.block).toBe(8);
      expect(card.enterStance).toBe('calm');
      expect(card.upgradedVersion.block).toBe(12);
    });
  });

  describe('Common Attacks', () => {
    it('Bowling Bash hits all enemies', () => {
      const card = ALL_CARDS.find(c => c.id === 'bowlingBash');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.rarity).toBe(RARITY.COMMON);
      expect(card.character).toBe('watcher');
      expect(card.targetAll).toBe(true);
      expect(card.damage).toBe(7);
      expect(card.upgradedVersion.damage).toBe(10);
    });

    it('Crush Joints applies Vulnerable', () => {
      const card = ALL_CARDS.find(c => c.id === 'crushJoints');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.rarity).toBe(RARITY.COMMON);
      expect(card.damage).toBe(8);
      expect(card.effects[0].type).toBe('vulnerable');
      expect(card.effects[0].amount).toBe(1);
    });

    it('Flurry of Blows is a 0-cost attack', () => {
      const card = ALL_CARDS.find(c => c.id === 'flurryOfBlows');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.cost).toBe(0);
      expect(card.damage).toBe(4);
      expect(card.upgradedVersion.damage).toBe(6);
    });

    it('Follow-Up deals damage and draws', () => {
      const card = ALL_CARDS.find(c => c.id === 'followUp');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.damage).toBe(7);
      expect(card.draw).toBe(1);
      expect(card.upgradedVersion.damage).toBe(11);
    });
  });

  describe('Common Skills', () => {
    it('Halt gains extra block in Wrath', () => {
      const card = ALL_CARDS.find(c => c.id === 'halt');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.rarity).toBe(RARITY.COMMON);
      expect(card.cost).toBe(0);
      expect(card.block).toBe(3);
      expect(card.special).toBe('haltWrath');
    });

    it('Empty Mind draws cards and exits stance', () => {
      const card = ALL_CARDS.find(c => c.id === 'emptyMind');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.rarity).toBe(RARITY.COMMON);
      expect(card.draw).toBe(2);
      expect(card.enterStance).toBe('none');
      expect(card.upgradedVersion.draw).toBe(3);
    });

    it('Crescendo enters Wrath and exhausts', () => {
      const card = ALL_CARDS.find(c => c.id === 'crescendo');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.enterStance).toBe('wrath');
      expect(card.exhaust).toBe(true);
      expect(card.upgradedVersion.cost).toBe(0);
    });

    it('Tranquility enters Calm and exhausts', () => {
      const card = ALL_CARDS.find(c => c.id === 'tranquility');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.enterStance).toBe('calm');
      expect(card.exhaust).toBe(true);
      expect(card.upgradedVersion.cost).toBe(0);
    });

    it('Prostrate gains block and Mantra', () => {
      const card = ALL_CARDS.find(c => c.id === 'prostrate');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.cost).toBe(0);
      expect(card.block).toBe(4);
      expect(card.mantra).toBe(2);
      expect(card.upgradedVersion.mantra).toBe(3);
    });

    it('Protecting Light is a simple block card', () => {
      const card = ALL_CARDS.find(c => c.id === 'protectingLight');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.SKILL);
      expect(card.block).toBe(10);
      expect(card.upgradedVersion.block).toBe(14);
    });

    it('Sash Whip applies Weak', () => {
      const card = ALL_CARDS.find(c => c.id === 'sashWhip');
      expect(card).toBeDefined();
      expect(card.type).toBe(CARD_TYPES.ATTACK);
      expect(card.damage).toBe(8);
      expect(card.effects[0].type).toBe('weak');
      expect(card.effects[0].amount).toBe(1);
      expect(card.upgradedVersion.damage).toBe(10);
    });
  });

  describe('Card pool integrity', () => {
    it('all Watcher cards have unique IDs', () => {
      const ids = watcherCards.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('all Watcher cards have character set to watcher', () => {
      watcherCards.forEach(card => {
        expect(card.character).toBe('watcher');
      });
    });

    it('all Watcher cards have upgradedVersion', () => {
      watcherCards.forEach(card => {
        expect(card.upgradedVersion).toBeDefined();
      });
    });

    it('all Watcher cards have descriptions', () => {
      watcherCards.forEach(card => {
        expect(card.description).toBeTruthy();
        expect(card.upgradedVersion.description || card.description).toBeTruthy();
      });
    });

    it('Watcher cards have correct rarity distribution', () => {
      const basic = watcherCards.filter(c => c.rarity === RARITY.BASIC);
      const common = watcherCards.filter(c => c.rarity === RARITY.COMMON);
      expect(basic.length).toBe(4); // Strike, Defend, Eruption, Vigilance
      expect(common.length).toBeGreaterThanOrEqual(8);
    });
  });
});
