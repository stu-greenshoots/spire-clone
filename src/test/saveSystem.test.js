import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGame,
  loadGame,
  deleteSave,
  hasSavedGame,
  getSavePreview,
  serializeCard,
  serializeRelic,
  serializePotion
} from '../systems/saveSystem';
import { getCardById, getStarterDeck } from '../data/cards';
import { getRelicById, getStarterRelic } from '../data/relics';
import { getPotionById } from '../data/potions';

describe('Save System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Serialization', () => {
    it('serializeCard stores only id, instanceId, and upgraded flag', () => {
      const card = { ...getCardById('strike'), instanceId: 'strike_0' };
      const serialized = serializeCard(card);
      expect(serialized).toEqual({ id: 'strike', instanceId: 'strike_0' });
      expect(serialized.damage).toBeUndefined();
      expect(serialized.name).toBeUndefined();
    });

    it('serializeCard preserves upgraded flag', () => {
      const card = { ...getCardById('strike'), instanceId: 'strike_0', upgraded: true };
      const serialized = serializeCard(card);
      expect(serialized).toEqual({ id: 'strike', instanceId: 'strike_0', upgraded: true });
    });

    it('serializeCard returns null for null input', () => {
      expect(serializeCard(null)).toBeNull();
    });

    it('serializeRelic stores id plus runtime state', () => {
      const relic = { ...getRelicById('nunchaku'), counter: 5 };
      const serialized = serializeRelic(relic);
      expect(serialized.id).toBe('nunchaku');
      expect(serialized.counter).toBe(5);
      expect(serialized.name).toBeUndefined();
      expect(serialized.effect).toBeUndefined();
    });

    it('serializeRelic preserves liftCount for girya', () => {
      const relic = { ...getRelicById('girya'), liftCount: 2 };
      const serialized = serializeRelic(relic);
      expect(serialized.id).toBe('girya');
      expect(serialized.liftCount).toBe(2);
    });

    it('serializeRelic preserves used flag for lizard_tail', () => {
      const relic = { ...getRelicById('lizard_tail'), used: true };
      const serialized = serializeRelic(relic);
      expect(serialized.id).toBe('lizard_tail');
      expect(serialized.used).toBe(true);
    });

    it('serializePotion stores only id', () => {
      const potion = getPotionById('fire_potion');
      const serialized = serializePotion(potion);
      expect(serialized).toEqual({ id: 'fire_potion' });
      expect(serialized.effect).toBeUndefined();
    });

    it('serializePotion returns null for null input', () => {
      expect(serializePotion(null)).toBeNull();
    });
  });

  describe('saveGame', () => {
    it('saves state in version 3 format with ID-based serialization', () => {
      const deck = getStarterDeck();
      const state = {
        player: { currentHp: 70, maxHp: 80, gold: 50, strength: 2, dexterity: 1 },
        deck,
        relics: [getStarterRelic()],
        potions: [getPotionById('fire_potion')],
        currentFloor: 5,
        act: 1,
        map: [[{ type: 'monster' }]],
        currentNode: { x: 0, y: 0 },
        ascension: 3
      };

      const result = saveGame(state);
      expect(result).toBe(true);

      const raw = JSON.parse(localStorage.getItem('spireAscent_save'));
      expect(raw.version).toBe(3);
      // Deck should be serialized as ID objects, not full card objects
      expect(raw.state.deck[0]).toHaveProperty('id');
      expect(raw.state.deck[0]).not.toHaveProperty('damage');
      expect(raw.state.deck[0]).not.toHaveProperty('description');
      // Relics should be ID objects
      expect(raw.state.relics[0]).toHaveProperty('id');
      expect(raw.state.relics[0]).not.toHaveProperty('effect');
      // Potions should be ID objects
      expect(raw.state.potions[0]).toEqual({ id: 'fire_potion' });
      // Player should have correct field names
      expect(raw.state.player.currentHp).toBe(70);
      expect(raw.state.player.maxHp).toBe(80);
    });
  });

  describe('Round-trip save/load', () => {
    it('basic deck round-trips correctly', () => {
      const deck = getStarterDeck();
      const state = {
        player: { currentHp: 65, maxHp: 80, gold: 120, strength: 0, dexterity: 0 },
        deck,
        relics: [getStarterRelic()],
        potions: [],
        currentFloor: 3,
        act: 1,
        map: [[{ type: 'monster' }]],
        currentNode: { x: 0, y: 1 },
        ascension: 0
      };

      saveGame(state);
      const loaded = loadGame();

      expect(loaded).not.toBeNull();
      expect(loaded.player.currentHp).toBe(65);
      expect(loaded.player.maxHp).toBe(80);
      expect(loaded.player.gold).toBe(120);
      expect(loaded.deck.length).toBe(deck.length);
      expect(loaded.currentFloor).toBe(3);
      expect(loaded.act).toBe(1);
      expect(loaded.ascension).toBe(0);
    });

    it('upgraded cards round-trip correctly', () => {
      const baseCard = getCardById('strike');
      const upgradedCard = {
        ...baseCard,
        ...baseCard.upgradedVersion,
        upgraded: true,
        name: baseCard.name + '+',
        instanceId: 'strike_upgraded_0'
      };

      const state = {
        player: { currentHp: 80, maxHp: 80, gold: 99, strength: 0, dexterity: 0 },
        deck: [upgradedCard],
        relics: [getStarterRelic()],
        potions: [],
        currentFloor: 1,
        act: 1,
        map: [],
        currentNode: null,
        ascension: 0
      };

      saveGame(state);
      const loaded = loadGame();

      // The loaded data contains serialized forms - verify it has the right shape
      expect(loaded.deck[0].id).toBe('strike');
      expect(loaded.deck[0].upgraded).toBe(true);
      expect(loaded.deck[0].instanceId).toBe('strike_upgraded_0');
    });

    it('relics with runtime state round-trip correctly', () => {
      const girya = { ...getRelicById('girya'), liftCount: 2 };
      const nunchaku = { ...getRelicById('nunchaku'), counter: 7 };
      const lizardTail = { ...getRelicById('lizard_tail'), used: true };

      const state = {
        player: { currentHp: 50, maxHp: 80, gold: 30, strength: 0, dexterity: 0 },
        deck: getStarterDeck(),
        relics: [girya, nunchaku, lizardTail],
        potions: [],
        currentFloor: 8,
        act: 2,
        map: [],
        currentNode: null,
        ascension: 5
      };

      saveGame(state);
      const loaded = loadGame();

      expect(loaded.relics.length).toBe(3);
      const savedGirya = loaded.relics.find(r => r.id === 'girya');
      const savedNunchaku = loaded.relics.find(r => r.id === 'nunchaku');
      const savedLizard = loaded.relics.find(r => r.id === 'lizard_tail');

      expect(savedGirya.liftCount).toBe(2);
      expect(savedNunchaku.counter).toBe(7);
      expect(savedLizard.used).toBe(true);
    });

    it('potions round-trip correctly', () => {
      const state = {
        player: { currentHp: 80, maxHp: 80, gold: 99, strength: 0, dexterity: 0 },
        deck: getStarterDeck(),
        relics: [getStarterRelic()],
        potions: [getPotionById('fire_potion'), getPotionById('health_potion')],
        currentFloor: 2,
        act: 1,
        map: [],
        currentNode: null,
        ascension: 0
      };

      saveGame(state);
      const loaded = loadGame();

      expect(loaded.potions.length).toBe(2);
      expect(loaded.potions[0].id).toBe('fire_potion');
      expect(loaded.potions[1].id).toBe('health_potion');
    });

    it('player stats round-trip correctly', () => {
      const state = {
        player: { currentHp: 45, maxHp: 90, gold: 250, strength: 5, dexterity: 3 },
        deck: getStarterDeck(),
        relics: [getStarterRelic()],
        potions: [],
        currentFloor: 12,
        act: 2,
        map: [[{ type: 'elite' }]],
        currentNode: { x: 2, y: 3 },
        ascension: 10
      };

      saveGame(state);
      const loaded = loadGame();

      expect(loaded.player.currentHp).toBe(45);
      expect(loaded.player.maxHp).toBe(90);
      expect(loaded.player.gold).toBe(250);
      expect(loaded.player.strength).toBe(5);
      expect(loaded.player.dexterity).toBe(3);
      expect(loaded.currentFloor).toBe(12);
      expect(loaded.act).toBe(2);
      expect(loaded.ascension).toBe(10);
    });
  });

  describe('hasSavedGame', () => {
    it('returns false when no save exists', () => {
      expect(hasSavedGame()).toBe(false);
    });

    it('returns true when valid save exists', () => {
      const state = {
        player: { currentHp: 80, maxHp: 80, gold: 99, strength: 0, dexterity: 0 },
        deck: getStarterDeck(),
        relics: [getStarterRelic()],
        potions: [],
        currentFloor: 1,
        act: 1,
        map: [],
        currentNode: null,
        ascension: 0
      };
      saveGame(state);
      expect(hasSavedGame()).toBe(true);
    });
  });

  describe('getSavePreview', () => {
    it('returns preview data from saved state', () => {
      const state = {
        player: { currentHp: 60, maxHp: 80, gold: 150, strength: 0, dexterity: 0 },
        deck: getStarterDeck(),
        relics: [getStarterRelic()],
        potions: [],
        currentFloor: 7,
        act: 2,
        map: [],
        currentNode: null,
        ascension: 4
      };
      saveGame(state);

      const preview = getSavePreview();
      expect(preview).not.toBeNull();
      expect(preview.floor).toBe(7);
      expect(preview.hp).toBe(60);
      expect(preview.maxHp).toBe(80);
      expect(preview.deckSize).toBe(10);
      expect(preview.relicCount).toBe(1);
      expect(preview.gold).toBe(150);
      expect(preview.ascension).toBe(4);
    });
  });

  describe('deleteSave', () => {
    it('removes saved game', () => {
      const state = {
        player: { currentHp: 80, maxHp: 80, gold: 99, strength: 0, dexterity: 0 },
        deck: getStarterDeck(),
        relics: [getStarterRelic()],
        potions: [],
        currentFloor: 1,
        act: 1,
        map: [],
        currentNode: null,
        ascension: 0
      };
      saveGame(state);
      expect(hasSavedGame()).toBe(true);

      deleteSave();
      expect(hasSavedGame()).toBe(false);
      expect(loadGame()).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('handles empty deck, relics, and potions', () => {
      const state = {
        player: { currentHp: 80, maxHp: 80, gold: 99, strength: 0, dexterity: 0 },
        deck: [],
        relics: [],
        potions: [],
        currentFloor: 0,
        act: 1,
        map: [],
        currentNode: null,
        ascension: 0
      };

      saveGame(state);
      const loaded = loadGame();

      expect(loaded.deck).toEqual([]);
      expect(loaded.relics).toEqual([]);
      expect(loaded.potions).toEqual([]);
    });

    it('handles undefined potions array gracefully', () => {
      const state = {
        player: { currentHp: 80, maxHp: 80, gold: 99, strength: 0, dexterity: 0 },
        deck: getStarterDeck(),
        relics: [getStarterRelic()],
        potions: undefined,
        currentFloor: 1,
        act: 1,
        map: [],
        currentNode: null,
        ascension: 0
      };

      const result = saveGame(state);
      expect(result).toBe(true);

      const loaded = loadGame();
      expect(loaded.potions).toEqual([]);
    });
  });
});
