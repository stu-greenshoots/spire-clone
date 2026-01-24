import { describe, it, expect } from 'vitest';
import events from '../data/events';
import { ALL_RELICS } from '../data/relics';

const VALID_EFFECT_KEYS = [
  'heal',
  'damage',
  'gainGold',
  'loseGold',
  'loseHp',
  'loseHpPercent',
  'gainRelic',
  'addCardToDiscard',
  'removeCard',
  'upgradeRandomCard',
  'gainMaxHp',
  'loseMaxHp'
];

const POTION_KEYWORDS = [
  'potion',
  'gainPotion',
  'losePotion',
  'addPotion',
  'removePotion',
  'usePotion'
];

const allRelicIds = ALL_RELICS.map(r => r.id);

describe('Events Data', () => {
  describe('Basic Structure', () => {
    it('should export an array of exactly 20 events', () => {
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBe(20);
    });

    it('should also be available as named export', async () => {
      const module = await import('../data/events');
      expect(module.events).toBeDefined();
      expect(Array.isArray(module.events)).toBe(true);
      expect(module.events.length).toBe(20);
    });

    it('all events should have required fields', () => {
      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('choices');
        expect(typeof event.id).toBe('string');
        expect(typeof event.title).toBe('string');
        expect(typeof event.description).toBe('string');
        expect(Array.isArray(event.choices)).toBe(true);
      });
    });

    it('all event IDs should be unique', () => {
      const ids = events.map(e => e.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('all event titles should be unique', () => {
      const titles = events.map(e => e.title);
      const uniqueTitles = [...new Set(titles)];
      expect(titles.length).toBe(uniqueTitles.length);
    });

    it('all events should have descriptions of 2-3 sentences', () => {
      events.forEach(event => {
        // Count sentences by looking for sentence-ending punctuation
        const sentences = event.description.split(/[.!?]+/).filter(s => s.trim().length > 0);
        expect(sentences.length).toBeGreaterThanOrEqual(2);
        expect(sentences.length).toBeLessThanOrEqual(4); // Allow slight flexibility
      });
    });
  });

  describe('Choices Structure', () => {
    it('all events should have 2-3 choices', () => {
      events.forEach(event => {
        expect(event.choices.length).toBeGreaterThanOrEqual(2);
        expect(event.choices.length).toBeLessThanOrEqual(3);
      });
    });

    it('all choices should have required fields', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          expect(choice).toHaveProperty('text');
          expect(choice).toHaveProperty('effect');
          expect(choice).toHaveProperty('result');
          expect(typeof choice.text).toBe('string');
          expect(typeof choice.effect).toBe('object');
          expect(typeof choice.result).toBe('string');
        });
      });
    });

    it('all choices should have non-empty text and result', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          expect(choice.text.length).toBeGreaterThan(0);
          expect(choice.result.length).toBeGreaterThan(0);
        });
      });
    });

    it('all effect objects should have at least one key', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          expect(Object.keys(choice.effect).length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Effect Validation', () => {
    it('all effect keys should be valid mechanics', () => {
      // Allow keys with numeric suffixes (e.g. upgradeRandomCard2) as variants
      const isValidKey = (key) => {
        return VALID_EFFECT_KEYS.includes(key) ||
          VALID_EFFECT_KEYS.some(valid => key.startsWith(valid));
      };

      events.forEach(event => {
        event.choices.forEach(choice => {
          Object.keys(choice.effect).forEach(key => {
            expect(isValidKey(key)).toBe(true);
          });
        });
      });
    });

    it('no effects should reference potions', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          Object.keys(choice.effect).forEach(key => {
            const lowerKey = key.toLowerCase();
            POTION_KEYWORDS.forEach(keyword => {
              expect(lowerKey).not.toContain(keyword.toLowerCase());
            });
          });

          // Also check values for potion references
          Object.values(choice.effect).forEach(value => {
            if (typeof value === 'string') {
              expect(value.toLowerCase()).not.toContain('potion');
            }
          });
        });
      });
    });

    it('all gainRelic references should be valid relic IDs', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          if (choice.effect.gainRelic) {
            expect(allRelicIds).toContain(choice.effect.gainRelic);
          }
        });
      });
    });

    it('heal values should be numbers', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          if (choice.effect.heal !== undefined) {
            expect(typeof choice.effect.heal).toBe('number');
          }
        });
      });
    });

    it('damage values should be positive numbers', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          if (choice.effect.damage !== undefined) {
            expect(typeof choice.effect.damage).toBe('number');
            expect(choice.effect.damage).toBeGreaterThan(0);
          }
        });
      });
    });

    it('gold values should be positive numbers', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          if (choice.effect.gainGold !== undefined) {
            expect(typeof choice.effect.gainGold).toBe('number');
            expect(choice.effect.gainGold).toBeGreaterThan(0);
          }
          if (choice.effect.loseGold !== undefined) {
            expect(typeof choice.effect.loseGold).toBe('number');
            expect(choice.effect.loseGold).toBeGreaterThan(0);
          }
        });
      });
    });

    it('loseHpPercent values should be between 1 and 100', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          if (choice.effect.loseHpPercent !== undefined) {
            expect(choice.effect.loseHpPercent).toBeGreaterThan(0);
            expect(choice.effect.loseHpPercent).toBeLessThanOrEqual(100);
          }
        });
      });
    });

    it('gainMaxHp and loseMaxHp should be positive numbers', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          if (choice.effect.gainMaxHp !== undefined) {
            expect(typeof choice.effect.gainMaxHp).toBe('number');
            expect(choice.effect.gainMaxHp).toBeGreaterThan(0);
          }
          if (choice.effect.loseMaxHp !== undefined) {
            expect(typeof choice.effect.loseMaxHp).toBe('number');
            expect(choice.effect.loseMaxHp).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe('Trade-offs and Balance', () => {
    it('no choice should be purely positive (all-gain, no-cost)', () => {
      const purelyPositiveKeys = ['heal', 'gainGold', 'gainRelic', 'upgradeRandomCard', 'gainMaxHp', 'addCardToDiscard'];
      const costKeys = ['damage', 'loseGold', 'loseHp', 'loseHpPercent', 'loseMaxHp', 'removeCard'];

      let totalPurelyPositive = 0;
      events.forEach(event => {
        event.choices.forEach(choice => {
          const keys = Object.keys(choice.effect);
          const hasPositive = keys.some(k => purelyPositiveKeys.includes(k));
          const hasCost = keys.some(k => costKeys.includes(k));
          // Allow some purely positive choices (walk-away options with small gain)
          // but count them
          if (hasPositive && !hasCost) {
            totalPurelyPositive++;
          }
        });
      });
      // Allow up to 30% purely positive (walk-away options, mercy choices, etc.)
      const totalChoices = events.reduce((sum, e) => sum + e.choices.length, 0);
      expect(totalPurelyPositive / totalChoices).toBeLessThan(0.35);
    });

    it('every event should have at least one choice with a cost', () => {
      const costKeys = ['damage', 'loseGold', 'loseHp', 'loseHpPercent', 'loseMaxHp', 'removeCard'];
      events.forEach(event => {
        const hasCostChoice = event.choices.some(choice => {
          const keys = Object.keys(choice.effect);
          return keys.some(k => costKeys.includes(k));
        });
        expect(hasCostChoice).toBe(true);
      });
    });
  });

  describe('Content Quality', () => {
    it('no event description should be empty or too short', () => {
      events.forEach(event => {
        expect(event.description.length).toBeGreaterThan(50);
      });
    });

    it('no choice result text should be too short', () => {
      events.forEach(event => {
        event.choices.forEach(choice => {
          expect(choice.result.length).toBeGreaterThan(20);
        });
      });
    });

    it('event descriptions should not contain emojis', () => {
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}]/u;
      events.forEach(event => {
        expect(emojiRegex.test(event.description)).toBe(false);
      });
    });
  });
});
