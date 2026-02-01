/**
 * JR-14c: Watcher Regression — Starter Deck, Character Select, Pure Water Relic
 *
 * Tests for The Watcher character integration:
 * - Watcher appears in character definitions
 * - Starter deck composition (10 cards: 4 Strike, 4 Defend, 1 Eruption, 1 Vigilance)
 * - Pure Water relic adds Miracle to hand at combat start
 * - Miracle card works (0 cost, +1 energy, exhaust, retain)
 * - Existing characters unaffected
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_CARDS, getCardById, getStarterDeck, CARD_TYPES } from '../data/cards';
import { CHARACTERS, CHARACTER_IDS, getCharacterById } from '../data/characters';
import { getStarterRelic, ALL_RELICS } from '../data/relics';
import { triggerRelics } from '../systems/relicSystem';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

// ============================================================
// 1. Character Definition
// ============================================================

describe('Watcher Character Definition', () => {
  it('Watcher exists in CHARACTER_IDS', () => {
    expect(CHARACTER_IDS.WATCHER).toBe('watcher');
  });

  it('Watcher appears in CHARACTERS array', () => {
    const watcher = CHARACTERS.find(c => c.id === 'watcher');
    expect(watcher).toBeDefined();
    expect(watcher.name).toBe('The Watcher');
  });

  it('getCharacterById returns Watcher', () => {
    const watcher = getCharacterById('watcher');
    expect(watcher).toBeDefined();
    expect(watcher.id).toBe('watcher');
    expect(watcher.maxHp).toBe(72);
    expect(watcher.color).toBeDefined();
  });

  it('Watcher is the 4th character', () => {
    expect(CHARACTERS[3].id).toBe('watcher');
    expect(CHARACTERS.length).toBe(4);
  });

  it('Watcher has starterRelicId of pure_water', () => {
    const watcher = getCharacterById('watcher');
    expect(watcher.starterRelicId).toBe('pure_water');
  });

  it('Watcher starterDeck definition has 10 cards total', () => {
    const watcher = getCharacterById('watcher');
    const totalCount = watcher.starterDeck.reduce((sum, entry) => sum + entry.count, 0);
    expect(totalCount).toBe(10);
  });
});

// ============================================================
// 2. Starter Deck
// ============================================================

describe('Watcher Starter Deck', () => {
  const deck = getStarterDeck('watcher');

  it('has exactly 10 cards', () => {
    expect(deck.length).toBe(10);
  });

  it('has 4 Strike (Watcher)', () => {
    const strikes = deck.filter(c => c.id === 'strike_watcher');
    expect(strikes.length).toBe(4);
  });

  it('has 4 Defend (Watcher)', () => {
    const defends = deck.filter(c => c.id === 'defend_watcher');
    expect(defends.length).toBe(4);
  });

  it('has 1 Eruption', () => {
    const eruptions = deck.filter(c => c.id === 'eruption');
    expect(eruptions.length).toBe(1);
  });

  it('has 1 Vigilance', () => {
    const vigilances = deck.filter(c => c.id === 'vigilance');
    expect(vigilances.length).toBe(1);
  });

  it('all cards have unique instanceIds', () => {
    const ids = deck.map(c => c.instanceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all cards are watcher character cards', () => {
    deck.forEach(card => {
      expect(card.character).toBe('watcher');
    });
  });
});

// ============================================================
// 3. Pure Water Relic
// ============================================================

describe('Pure Water Relic', () => {
  it('exists in ALL_RELICS', () => {
    const relic = ALL_RELICS.find(r => r.id === 'pure_water');
    expect(relic).toBeDefined();
    expect(relic.name).toBe('Pure Water');
    expect(relic.rarity).toBe('starter');
    expect(relic.character).toBe('watcher');
  });

  it('getStarterRelic returns Pure Water for watcher', () => {
    const relic = getStarterRelic('watcher');
    expect(relic).toBeDefined();
    expect(relic.id).toBe('pure_water');
  });

  it('triggers on combat start and produces addCards effect', () => {
    const relics = [ALL_RELICS.find(r => r.id === 'pure_water')];
    const { effects } = triggerRelics(relics, 'onCombatStart', {});
    expect(effects.addCards).toContain('miracle');
  });

  it('does not affect other characters starter relics', () => {
    expect(getStarterRelic('ironclad').id).toBe('burning_blood');
    expect(getStarterRelic('silent').id).toBe('ring_of_snake');
    expect(getStarterRelic('defect').id).toBe('cracked_core');
  });
});

// ============================================================
// 4. Miracle Card
// ============================================================

describe('Miracle Card', () => {
  const miracle = getCardById('miracle');

  it('exists in ALL_CARDS', () => {
    expect(miracle).toBeDefined();
    expect(miracle.name).toBe('Miracle');
  });

  it('costs 0 energy', () => {
    expect(miracle.cost).toBe(0);
  });

  it('is a skill', () => {
    expect(miracle.type).toBe(CARD_TYPES.SKILL);
  });

  it('has exhaust', () => {
    expect(miracle.exhaust).toBe(true);
  });

  it('has retain', () => {
    expect(miracle.retain).toBe(true);
  });

  it('grants 1 energy via gainEnergy special', () => {
    expect(miracle.special).toBe('gainEnergy');
    expect(miracle.energyGain).toBe(1);
  });

  it('belongs to watcher character', () => {
    expect(miracle.character).toBe('watcher');
  });

  it('has basic rarity (generated card)', () => {
    expect(miracle.rarity).toBe('basic');
  });

  it('upgraded version grants 2 energy', () => {
    expect(miracle.upgradedVersion.energyGain).toBe(2);
  });
});

// ============================================================
// 5. Existing Characters Unaffected
// ============================================================

describe('Existing Characters Unaffected', () => {
  it('Ironclad starter deck still has 10 cards', () => {
    expect(getStarterDeck('ironclad').length).toBe(10);
  });

  it('Silent starter deck still has 12 cards', () => {
    expect(getStarterDeck('silent').length).toBe(12);
  });

  it('Defect starter deck still has 10 cards', () => {
    expect(getStarterDeck('defect').length).toBe(10);
  });

  it('Ironclad is still first character', () => {
    expect(CHARACTERS[0].id).toBe('ironclad');
  });

  it('Silent is still second character', () => {
    expect(CHARACTERS[1].id).toBe('silent');
  });

  it('Defect is still third character', () => {
    expect(CHARACTERS[2].id).toBe('defect');
  });
});
