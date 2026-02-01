import { describe, it, expect } from 'vitest';
import { ALL_CARDS } from '../data/cards';
import { ALL_ENEMIES } from '../data/enemies';
import { ALL_RELICS } from '../data/relics';
import {
  CARD_FLAVOR,
  ENEMY_LORE,
  ACT_DESCRIPTIONS,
  RELIC_FLAVOR,
  WORLD_LORE,
  SILENT_ACT_DESCRIPTIONS,
  DEFECT_ACT_DESCRIPTIONS,
  WATCHER_ACT_DESCRIPTIONS
} from '../data/flavorText';
import {
  BOSS_DIALOGUE,
  getBossDialogue,
  SILENT_DEFEAT_NARRATIVE,
  SILENT_VICTORY_NARRATIVE,
  DEFECT_DEFEAT_NARRATIVE,
  DEFECT_VICTORY_NARRATIVE,
  WATCHER_DEFEAT_NARRATIVE,
  WATCHER_VICTORY_NARRATIVE
} from '../data/bossDialogue';

describe('Flavor Text Data', () => {
  describe('CARD_FLAVOR', () => {
    it('should exist and be a non-empty object', () => {
      expect(CARD_FLAVOR).toBeDefined();
      expect(typeof CARD_FLAVOR).toBe('object');
      expect(Object.keys(CARD_FLAVOR).length).toBeGreaterThan(0);
    });

    it('should have keys matching actual card IDs from cards data', () => {
      const cardIds = ALL_CARDS.map(card => card.id);
      const flavorKeys = Object.keys(CARD_FLAVOR);

      flavorKeys.forEach(key => {
        expect(cardIds).toContain(key);
      });
    });

    it('should have flavor text for all cards', () => {
      const cardIds = ALL_CARDS.map(card => card.id);

      cardIds.forEach(id => {
        expect(CARD_FLAVOR[id]).toBeDefined();
        expect(typeof CARD_FLAVOR[id]).toBe('string');
        expect(CARD_FLAVOR[id].length).toBeGreaterThan(0);
      });
    });

    it('should not have any flavor text exceeding 200 characters', () => {
      Object.entries(CARD_FLAVOR).forEach(([key, text]) => {
        expect(text.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('ENEMY_LORE', () => {
    it('should exist and be a non-empty object', () => {
      expect(ENEMY_LORE).toBeDefined();
      expect(typeof ENEMY_LORE).toBe('object');
      expect(Object.keys(ENEMY_LORE).length).toBeGreaterThan(0);
    });

    it('should have keys matching actual enemy IDs from enemies data', () => {
      const enemyIds = ALL_ENEMIES.map(enemy => enemy.id);
      const loreKeys = Object.keys(ENEMY_LORE);

      loreKeys.forEach(key => {
        expect(enemyIds).toContain(key);
      });
    });

    it('should have lore for all enemies', () => {
      const enemyIds = ALL_ENEMIES.map(enemy => enemy.id);

      enemyIds.forEach(id => {
        expect(ENEMY_LORE[id]).toBeDefined();
        expect(typeof ENEMY_LORE[id]).toBe('string');
        expect(ENEMY_LORE[id].length).toBeGreaterThan(0);
      });
    });

    it('should not have any lore text exceeding 200 characters', () => {
      Object.entries(ENEMY_LORE).forEach(([key, text]) => {
        expect(text.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('ACT_DESCRIPTIONS', () => {
    it('should exist and be a non-empty object', () => {
      expect(ACT_DESCRIPTIONS).toBeDefined();
      expect(typeof ACT_DESCRIPTIONS).toBe('object');
      expect(Object.keys(ACT_DESCRIPTIONS).length).toBeGreaterThan(0);
    });

    it('should have descriptions for acts 1 through 3', () => {
      expect(ACT_DESCRIPTIONS[1]).toBeDefined();
      expect(ACT_DESCRIPTIONS[2]).toBeDefined();
      expect(ACT_DESCRIPTIONS[3]).toBeDefined();
    });

    it('should have name, subtitle, description, and entering for each act', () => {
      [1, 2, 3].forEach(act => {
        expect(ACT_DESCRIPTIONS[act].name).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].name).toBe('string');
        expect(ACT_DESCRIPTIONS[act].subtitle).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].subtitle).toBe('string');
        expect(ACT_DESCRIPTIONS[act].description).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].description).toBe('string');
        expect(ACT_DESCRIPTIONS[act].entering).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].entering).toBe('string');
      });
    });

    it('should have correct act names', () => {
      expect(ACT_DESCRIPTIONS[1].name).toBe('The Periphery');
      expect(ACT_DESCRIPTIONS[2].name).toBe('The Infrastructure');
      expect(ACT_DESCRIPTIONS[3].name).toBe('The Core');
    });
  });

  describe('RELIC_FLAVOR', () => {
    it('should exist and be a non-empty object', () => {
      expect(RELIC_FLAVOR).toBeDefined();
      expect(typeof RELIC_FLAVOR).toBe('object');
      expect(Object.keys(RELIC_FLAVOR).length).toBeGreaterThan(0);
    });

    it('should have keys matching actual relic IDs from relics data', () => {
      const relicIds = ALL_RELICS.map(relic => relic.id);
      const flavorKeys = Object.keys(RELIC_FLAVOR);

      flavorKeys.forEach(key => {
        expect(relicIds).toContain(key);
      });
    });

    it('should have flavor text for all relics', () => {
      const relicIds = ALL_RELICS.map(relic => relic.id);

      relicIds.forEach(id => {
        expect(RELIC_FLAVOR[id]).toBeDefined();
        expect(typeof RELIC_FLAVOR[id]).toBe('string');
        expect(RELIC_FLAVOR[id].length).toBeGreaterThan(0);
      });
    });

    it('should not have any flavor text exceeding 200 characters', () => {
      Object.entries(RELIC_FLAVOR).forEach(([key, text]) => {
        expect(text.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('WORLD_LORE', () => {
    it('should exist and be a non-empty array', () => {
      expect(WORLD_LORE).toBeDefined();
      expect(Array.isArray(WORLD_LORE)).toBe(true);
      expect(WORLD_LORE.length).toBeGreaterThan(0);
    });

    it('should have at least 8 lore snippets', () => {
      expect(WORLD_LORE.length).toBeGreaterThanOrEqual(8);
    });

    it('should contain only non-empty strings', () => {
      WORLD_LORE.forEach(snippet => {
        expect(typeof snippet).toBe('string');
        expect(snippet.length).toBeGreaterThan(0);
      });
    });

    it('should not have any snippet exceeding 200 characters', () => {
      WORLD_LORE.forEach(snippet => {
        expect(snippet.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('Silent Character Narrative (VARROW-06)', () => {
    const bossIds = Object.keys(BOSS_DIALOGUE);

    describe('getBossDialogue with character parameter', () => {
      it('should return default dialogue for ironclad', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'ironclad');
          expect(dialogue.intro).toBe(BOSS_DIALOGUE[bossId].intro);
        });
      });

      it('should return Silent-specific dialogue for silent character', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'silent');
          expect(dialogue.intro).toBeDefined();
          expect(typeof dialogue.intro).toBe('string');
          expect(dialogue.intro.length).toBeGreaterThan(0);
          // Silent dialogue should differ from default
          expect(dialogue.intro).not.toBe(BOSS_DIALOGUE[bossId].intro);
        });
      });

      it('should preserve personality field from base dialogue', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'silent');
          expect(dialogue.personality).toBe(BOSS_DIALOGUE[bossId].personality);
        });
      });

      it('should return null for unknown boss', () => {
        expect(getBossDialogue('nonexistent', 'silent')).toBeNull();
      });

      it('should work without character parameter (backwards compatible)', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId);
          expect(dialogue.intro).toBe(BOSS_DIALOGUE[bossId].intro);
        });
      });
    });

    describe('SILENT_DEFEAT_NARRATIVE', () => {
      it('should have all defeat pools', () => {
        ['early', 'midAct1', 'act2', 'act3', 'boss', 'heart'].forEach(pool => {
          expect(SILENT_DEFEAT_NARRATIVE[pool]).toBeDefined();
          expect(Array.isArray(SILENT_DEFEAT_NARRATIVE[pool])).toBe(true);
          expect(SILENT_DEFEAT_NARRATIVE[pool].length).toBeGreaterThan(0);
        });
      });

      it('should contain only non-empty strings', () => {
        Object.values(SILENT_DEFEAT_NARRATIVE).forEach(pool => {
          pool.forEach(text => {
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
          });
        });
      });
    });

    describe('SILENT_VICTORY_NARRATIVE', () => {
      it('should have standard and heart pools', () => {
        ['standard', 'heart'].forEach(pool => {
          expect(SILENT_VICTORY_NARRATIVE[pool]).toBeDefined();
          expect(Array.isArray(SILENT_VICTORY_NARRATIVE[pool])).toBe(true);
          expect(SILENT_VICTORY_NARRATIVE[pool].length).toBeGreaterThan(0);
        });
      });
    });

    describe('SILENT_ACT_DESCRIPTIONS', () => {
      it('should have entering text for all 3 acts', () => {
        [1, 2, 3].forEach(act => {
          expect(SILENT_ACT_DESCRIPTIONS[act]).toBeDefined();
          expect(typeof SILENT_ACT_DESCRIPTIONS[act].entering).toBe('string');
          expect(SILENT_ACT_DESCRIPTIONS[act].entering.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Defect Character Narrative (VARROW-09)', () => {
    const bossIds = Object.keys(BOSS_DIALOGUE);

    describe('getBossDialogue with defect character', () => {
      it('should return Defect-specific dialogue for defect character', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'defect');
          expect(dialogue.intro).toBeDefined();
          expect(typeof dialogue.intro).toBe('string');
          expect(dialogue.intro.length).toBeGreaterThan(0);
          expect(dialogue.intro).not.toBe(BOSS_DIALOGUE[bossId].intro);
        });
      });

      it('should preserve personality field from base dialogue', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'defect');
          expect(dialogue.personality).toBe(BOSS_DIALOGUE[bossId].personality);
        });
      });

      it('should have Defect-specific phaseTransition for Heart', () => {
        const dialogue = getBossDialogue('corruptHeart', 'defect');
        expect(dialogue.phaseTransition).toBeDefined();
        expect(dialogue.phaseTransition).not.toBe(BOSS_DIALOGUE.corruptHeart.phaseTransition);
      });
    });

    describe('DEFECT_DEFEAT_NARRATIVE', () => {
      it('should have all defeat pools', () => {
        ['early', 'midAct1', 'act2', 'act3', 'boss', 'heart'].forEach(pool => {
          expect(DEFECT_DEFEAT_NARRATIVE[pool]).toBeDefined();
          expect(Array.isArray(DEFECT_DEFEAT_NARRATIVE[pool])).toBe(true);
          expect(DEFECT_DEFEAT_NARRATIVE[pool].length).toBeGreaterThan(0);
        });
      });

      it('should contain only non-empty strings', () => {
        Object.values(DEFECT_DEFEAT_NARRATIVE).forEach(pool => {
          pool.forEach(text => {
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
          });
        });
      });
    });

    describe('DEFECT_VICTORY_NARRATIVE', () => {
      it('should have standard and heart pools', () => {
        ['standard', 'heart'].forEach(pool => {
          expect(DEFECT_VICTORY_NARRATIVE[pool]).toBeDefined();
          expect(Array.isArray(DEFECT_VICTORY_NARRATIVE[pool])).toBe(true);
          expect(DEFECT_VICTORY_NARRATIVE[pool].length).toBeGreaterThan(0);
        });
      });
    });

    describe('DEFECT_ACT_DESCRIPTIONS', () => {
      it('should have entering text for all 3 acts', () => {
        [1, 2, 3].forEach(act => {
          expect(DEFECT_ACT_DESCRIPTIONS[act]).toBeDefined();
          expect(typeof DEFECT_ACT_DESCRIPTIONS[act].entering).toBe('string');
          expect(DEFECT_ACT_DESCRIPTIONS[act].entering.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Watcher Character Narrative (VARROW-11)', () => {
    const bossIds = Object.keys(BOSS_DIALOGUE);

    describe('getBossDialogue with watcher character', () => {
      it('should return Watcher-specific dialogue for watcher character', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'watcher');
          expect(dialogue.intro).toBeDefined();
          expect(typeof dialogue.intro).toBe('string');
          expect(dialogue.intro.length).toBeGreaterThan(0);
          expect(dialogue.intro).not.toBe(BOSS_DIALOGUE[bossId].intro);
        });
      });

      it('should preserve personality field from base dialogue', () => {
        bossIds.forEach(bossId => {
          const dialogue = getBossDialogue(bossId, 'watcher');
          expect(dialogue.personality).toBe(BOSS_DIALOGUE[bossId].personality);
        });
      });

      it('should have Watcher-specific phaseTransition for Heart', () => {
        const dialogue = getBossDialogue('corruptHeart', 'watcher');
        expect(dialogue.phaseTransition).toBeDefined();
        expect(dialogue.phaseTransition).not.toBe(BOSS_DIALOGUE.corruptHeart.phaseTransition);
      });
    });

    describe('WATCHER_DEFEAT_NARRATIVE', () => {
      it('should have all defeat pools', () => {
        ['early', 'midAct1', 'act2', 'act3', 'boss', 'heart'].forEach(pool => {
          expect(WATCHER_DEFEAT_NARRATIVE[pool]).toBeDefined();
          expect(Array.isArray(WATCHER_DEFEAT_NARRATIVE[pool])).toBe(true);
          expect(WATCHER_DEFEAT_NARRATIVE[pool].length).toBeGreaterThan(0);
        });
      });

      it('should contain only non-empty strings', () => {
        Object.values(WATCHER_DEFEAT_NARRATIVE).forEach(pool => {
          pool.forEach(text => {
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
          });
        });
      });
    });

    describe('WATCHER_VICTORY_NARRATIVE', () => {
      it('should have standard and heart pools', () => {
        ['standard', 'heart'].forEach(pool => {
          expect(WATCHER_VICTORY_NARRATIVE[pool]).toBeDefined();
          expect(Array.isArray(WATCHER_VICTORY_NARRATIVE[pool])).toBe(true);
          expect(WATCHER_VICTORY_NARRATIVE[pool].length).toBeGreaterThan(0);
        });
      });
    });

    describe('WATCHER_ACT_DESCRIPTIONS', () => {
      it('should have entering text for all 3 acts', () => {
        [1, 2, 3].forEach(act => {
          expect(WATCHER_ACT_DESCRIPTIONS[act]).toBeDefined();
          expect(typeof WATCHER_ACT_DESCRIPTIONS[act].entering).toBe('string');
          expect(WATCHER_ACT_DESCRIPTIONS[act].entering.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Boss Phase Transition Dialogue (VARROW-07)', () => {
    it('should have phaseTransition text for Corrupt Heart', () => {
      const dialogue = BOSS_DIALOGUE.corruptHeart;
      expect(dialogue.phaseTransition).toBeDefined();
      expect(typeof dialogue.phaseTransition).toBe('string');
      expect(dialogue.phaseTransition.length).toBeGreaterThan(0);
    });

    it('should have phaseTransition text for Awakened One', () => {
      const dialogue = BOSS_DIALOGUE.awakened_one;
      expect(dialogue.phaseTransition).toBeDefined();
      expect(typeof dialogue.phaseTransition).toBe('string');
      expect(dialogue.phaseTransition.length).toBeGreaterThan(0);
    });

    it('should return Silent-specific phaseTransition for Heart', () => {
      const dialogue = getBossDialogue('corruptHeart', 'silent');
      expect(dialogue.phaseTransition).toBeDefined();
      expect(dialogue.phaseTransition).not.toBe(BOSS_DIALOGUE.corruptHeart.phaseTransition);
    });

    it('should return default phaseTransition for ironclad', () => {
      const dialogue = getBossDialogue('corruptHeart', 'ironclad');
      expect(dialogue.phaseTransition).toBe(BOSS_DIALOGUE.corruptHeart.phaseTransition);
    });
  });
});
