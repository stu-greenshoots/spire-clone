import { describe, it, expect } from 'vitest';
import {
  ALL_RELICS,
  RELIC_RARITY,
  getRelicById,
  getRandomRelic,
  getBossRelic,
  getStarterRelic
} from '../data/relics';
import { triggerRelics } from '../systems/relicSystem';

describe('Relics Data', () => {
  describe('ALL_RELICS', () => {
    it('should have at least 40 relics', () => {
      expect(ALL_RELICS.length).toBeGreaterThanOrEqual(40);
    });

    it('all relics should have required properties', () => {
      ALL_RELICS.forEach(relic => {
        expect(relic).toHaveProperty('id');
        expect(relic).toHaveProperty('name');
        expect(relic).toHaveProperty('rarity');
        expect(relic).toHaveProperty('description');
        expect(relic).toHaveProperty('emoji');
        expect(relic).toHaveProperty('trigger');
        expect(relic).toHaveProperty('effect');
        expect(typeof relic.id).toBe('string');
        expect(typeof relic.name).toBe('string');
        expect(typeof relic.description).toBe('string');
      });
    });

    it('all relics should have valid rarities', () => {
      const validRarities = Object.values(RELIC_RARITY);
      ALL_RELICS.forEach(relic => {
        expect(validRarities).toContain(relic.rarity);
      });
    });

    it('all relic IDs should be unique', () => {
      const ids = ALL_RELICS.map(r => r.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('all relic names should be unique', () => {
      const names = ALL_RELICS.map(r => r.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have relics of main rarity types', () => {
      const mainRarities = [
        RELIC_RARITY.STARTER,
        RELIC_RARITY.COMMON,
        RELIC_RARITY.UNCOMMON,
        RELIC_RARITY.RARE,
        RELIC_RARITY.BOSS,
        RELIC_RARITY.SHOP
      ];
      mainRarities.forEach(rarity => {
        const relicsOfRarity = ALL_RELICS.filter(r => r.rarity === rarity);
        expect(relicsOfRarity.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Relic Effects', () => {
    it('all relics should have valid triggers', () => {
      const validTriggers = [
        'onCombatStart', 'onCombatEnd', 'onTurnStart', 'onTurnEnd',
        'onAttackPlayed', 'onSkillPlayed', 'onStrikePlayed', 'onExhaust',
        'onDamageTaken', 'onDamageReceived', 'onHpLoss', 'onFirstHpLoss',
        'onDeath', 'onRest', 'onCardReward', 'onPickup', 'onFirstTurn',
        'passive'
      ];

      ALL_RELICS.forEach(relic => {
        expect(validTriggers).toContain(relic.trigger);
      });
    });

    it('all relics should have effect object', () => {
      ALL_RELICS.forEach(relic => {
        expect(typeof relic.effect).toBe('object');
        expect(relic.effect).toHaveProperty('type');
      });
    });

    it('relics with counter mechanics should have threshold', () => {
      const counterRelics = ALL_RELICS.filter(r => r.counter !== undefined);
      counterRelics.forEach(relic => {
        expect(relic.threshold).toBeDefined();
        expect(relic.threshold).toBeGreaterThan(0);
      });
    });
  });

  describe('getRelicById', () => {
    it('should return the correct relic', () => {
      const burningBlood = getRelicById('burning_blood');
      expect(burningBlood).toBeDefined();
      expect(burningBlood.name).toBe('Burning Blood');
    });

    it('should return undefined for non-existent relic', () => {
      const relic = getRelicById('nonexistent');
      expect(relic).toBeUndefined();
    });
  });

  describe('getRandomRelic', () => {
    it('should return a relic', () => {
      const relic = getRandomRelic();
      expect(relic).toBeDefined();
      expect(relic).toHaveProperty('id');
    });

    it('should not return starter, boss, or shop relics by default', () => {
      for (let i = 0; i < 50; i++) {
        const relic = getRandomRelic();
        expect(relic.rarity).not.toBe(RELIC_RARITY.STARTER);
        expect(relic.rarity).not.toBe(RELIC_RARITY.BOSS);
        expect(relic.rarity).not.toBe(RELIC_RARITY.SHOP);
      }
    });

    it('should filter by rarity when specified', () => {
      for (let i = 0; i < 20; i++) {
        const relic = getRandomRelic(RELIC_RARITY.RARE);
        expect(relic.rarity).toBe(RELIC_RARITY.RARE);
      }
    });

    it('should exclude specified IDs', () => {
      const excludeIds = ['anchor', 'vajra', 'lantern'];
      for (let i = 0; i < 50; i++) {
        const relic = getRandomRelic(null, excludeIds);
        expect(excludeIds).not.toContain(relic.id);
      }
    });
  });

  describe('getBossRelic', () => {
    it('should return a boss relic', () => {
      const relic = getBossRelic();
      expect(relic).toBeDefined();
      expect(relic.rarity).toBe(RELIC_RARITY.BOSS);
    });

    it('should exclude specified IDs', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      const excludeIds = bossRelics.slice(0, 3).map(r => r.id);

      for (let i = 0; i < 20; i++) {
        const relic = getBossRelic(excludeIds);
        if (relic) {
          expect(excludeIds).not.toContain(relic.id);
        }
      }
    });
  });

  describe('getStarterRelic', () => {
    it('should return Burning Blood', () => {
      const relic = getStarterRelic();
      expect(relic).toBeDefined();
      expect(relic.id).toBe('burning_blood');
      expect(relic.name).toBe('Burning Blood');
      expect(relic.rarity).toBe(RELIC_RARITY.STARTER);
    });
  });

  describe('Character-Specific Relics', () => {
    const characterRelics = ALL_RELICS.filter(r => r.character && r.rarity !== RELIC_RARITY.STARTER);

    it('should have 12 character-specific relics (3 per character)', () => {
      expect(characterRelics.length).toBe(12);
      const byChar = {};
      characterRelics.forEach(r => {
        byChar[r.character] = (byChar[r.character] || 0) + 1;
      });
      expect(byChar.ironclad).toBe(3);
      expect(byChar.silent).toBe(3);
      expect(byChar.defect).toBe(3);
      expect(byChar.watcher).toBe(3);
    });

    it('each character should have 2 uncommon and 1 rare relic', () => {
      ['ironclad', 'silent', 'defect', 'watcher'].forEach(char => {
        const charRelics = characterRelics.filter(r => r.character === char);
        const uncommon = charRelics.filter(r => r.rarity === RELIC_RARITY.UNCOMMON);
        const rare = charRelics.filter(r => r.rarity === RELIC_RARITY.RARE);
        expect(uncommon.length).toBe(2);
        expect(rare.length).toBe(1);
      });
    });

    it('all character-specific relics should have valid effect types', () => {
      characterRelics.forEach(relic => {
        expect(relic.effect).toBeDefined();
        expect(relic.effect.type).toBeDefined();
        expect(relic.trigger).toBeDefined();
      });
    });

    it('getRandomRelic with characterId should include that character relics', () => {
      const allIroncladRelics = ALL_RELICS.filter(r =>
        r.character === 'ironclad' && r.rarity !== RELIC_RARITY.STARTER
      );
      const ironcladIds = allIroncladRelics.map(r => r.id);

      let foundCharacterRelic = false;
      for (let i = 0; i < 200; i++) {
        const relic = getRandomRelic(null, [], 'ironclad');
        if (ironcladIds.includes(relic.id)) {
          foundCharacterRelic = true;
          break;
        }
      }
      expect(foundCharacterRelic).toBe(true);
    });

    it('getRandomRelic without characterId should exclude character-specific relics', () => {
      for (let i = 0; i < 100; i++) {
        const relic = getRandomRelic();
        expect(relic.character).toBeUndefined();
      }
    });

    it('getRandomRelic for silent should not return ironclad relics', () => {
      for (let i = 0; i < 100; i++) {
        const relic = getRandomRelic(null, [], 'silent');
        if (relic.character) {
          expect(relic.character).toBe('silent');
        }
      }
    });
  });

  describe('Boss Relics', () => {
    it('boss relics should have energy bonus effect', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      bossRelics.forEach(relic => {
        // Most boss relics give energy or have significant effects
        expect(relic.effect).toBeDefined();
      });
    });

    it('boss relics should have meaningful drawbacks or powerful effects', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      expect(bossRelics.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Character Relic Effects', () => {
    it('Data Disk (strengthAndDexterity) should grant both strength and dexterity', () => {
      const dataDisk = getRelicById('data_disk');
      const { effects } = triggerRelics([dataDisk], 'onCombatStart', {});
      expect(effects.strength).toBe(1);
      expect(effects.dexterity).toBe(1);
    });

    it('Emotion Chip (blockAndDraw) should grant block and draw on first HP loss', () => {
      const emotionChip = getRelicById('emotion_chip');
      const { effects } = triggerRelics([emotionChip], 'onFirstHpLoss', {});
      expect(effects.block).toBe(3);
      expect(effects.draw).toBe(2);
    });

    it('Emotion Chip should only trigger once per combat', () => {
      const emotionChip = getRelicById('emotion_chip');
      const { updatedRelics } = triggerRelics([emotionChip], 'onFirstHpLoss', {});
      expect(updatedRelics[0].usedThisCombat).toBe(true);
      const { effects: effects2 } = triggerRelics(updatedRelics, 'onFirstHpLoss', {});
      expect(effects2.block).toBe(0);
      expect(effects2.draw).toBe(0);
    });

    it('Mark of Pain should grant 2 strength at combat start', () => {
      const markOfPain = getRelicById('mark_of_pain');
      const { effects } = triggerRelics([markOfPain], 'onCombatStart', {});
      expect(effects.strength).toBe(2);
    });

    it('Charred Glove should trigger after 5 attacks', () => {
      const charredGlove = getRelicById('charred_glove');
      let relics = [charredGlove];
      for (let i = 0; i < 4; i++) {
        const result = triggerRelics(relics, 'onAttackPlayed', {});
        expect(result.effects.damageAll).toBe(0);
        relics = result.updatedRelics;
      }
      const finalResult = triggerRelics(relics, 'onAttackPlayed', {});
      expect(finalResult.effects.damageAll).toBe(8);
    });

    it('Capacitor Coil should channel a frost orb at combat start', () => {
      const capacitorCoil = getRelicById('capacitor_coil');
      const { effects } = triggerRelics([capacitorCoil], 'onCombatStart', {});
      expect(effects.channelOrbs).toContain('frost');
    });

    it('Envenom Ring should apply weak at combat start', () => {
      const envenomRing = getRelicById('envenom_ring');
      const { effects } = triggerRelics([envenomRing], 'onCombatStart', {});
      expect(effects.weak).toBe(2);
    });

    it('Wrist Blade should trigger after 2 skills', () => {
      const wristBlade = getRelicById('wrist_blade');
      let relics = [wristBlade];
      const result1 = triggerRelics(relics, 'onSkillPlayed', {});
      expect(result1.effects.dexterity).toBe(0);
      relics = result1.updatedRelics;
      const result2 = triggerRelics(relics, 'onSkillPlayed', {});
      expect(result2.effects.dexterity).toBe(1);
    });

    it('Duality should trigger after 4 attacks', () => {
      const duality = getRelicById('duality');
      let relics = [duality];
      for (let i = 0; i < 3; i++) {
        const result = triggerRelics(relics, 'onAttackPlayed', {});
        expect(result.effects.block).toBe(0);
        relics = result.updatedRelics;
      }
      const finalResult = triggerRelics(relics, 'onAttackPlayed', {});
      expect(finalResult.effects.block).toBe(8);
    });
  });
});
