import { describe, it, expect } from 'vitest';
import { ALL_CARDS, getStarterDeck, getCardRewards, CARD_TYPES, RARITY } from '../data/cards';
import { CHARACTERS, getCharacterById, CHARACTER_IDS } from '../data/characters';
import { getStarterRelic } from '../data/relics';

describe('Silent Character', () => {
  it('Silent character exists in CHARACTERS', () => {
    const silent = getCharacterById('silent');
    expect(silent).toBeDefined();
    expect(silent.name).toBe('The Silent');
    expect(silent.maxHp).toBe(70);
    expect(silent.starterRelicId).toBe('ring_of_snake');
  });

  it('CHARACTER_IDS includes SILENT', () => {
    expect(CHARACTER_IDS.SILENT).toBe('silent');
  });

  it('Silent starter deck has 12 cards', () => {
    const deck = getStarterDeck('silent');
    expect(deck).toHaveLength(12);
  });

  it('Silent starter deck composition is correct', () => {
    const deck = getStarterDeck('silent');
    const strikes = deck.filter(c => c.id === 'strike_silent');
    const defends = deck.filter(c => c.id === 'defend_silent');
    const neutralizes = deck.filter(c => c.id === 'neutralize');
    const survivors = deck.filter(c => c.id === 'survivor');
    expect(strikes).toHaveLength(5);
    expect(defends).toHaveLength(5);
    expect(neutralizes).toHaveLength(1);
    expect(survivors).toHaveLength(1);
  });

  it('Silent starter deck cards have instanceIds', () => {
    const deck = getStarterDeck('silent');
    deck.forEach(card => {
      expect(card.instanceId).toBeDefined();
    });
  });

  it('Ring of the Snake starter relic exists', () => {
    const relic = getStarterRelic('silent');
    expect(relic).toBeDefined();
    expect(relic.id).toBe('ring_of_snake');
    expect(relic.trigger).toBe('onCombatStart');
    expect(relic.effect.type).toBe('draw');
    expect(relic.effect.amount).toBe(2);
  });
});

describe('Silent Card Pool', () => {
  const silentCards = ALL_CARDS.filter(c => c.character === 'silent');

  it('has at least 31 Silent cards', () => {
    expect(silentCards.length).toBeGreaterThanOrEqual(31);
  });

  it('Shiv token card exists', () => {
    const shiv = ALL_CARDS.find(c => c.id === 'shiv');
    expect(shiv).toBeDefined();
    expect(shiv.cost).toBe(0);
    expect(shiv.damage).toBe(4);
    expect(shiv.exhaust).toBe(true);
    expect(shiv.character).toBe('silent');
  });

  it('all Silent cards have character field set to silent', () => {
    silentCards.forEach(card => {
      expect(card.character).toBe('silent');
    });
  });

  it('each rarity has correct count', () => {
    const basics = silentCards.filter(c => c.rarity === RARITY.BASIC);
    const commons = silentCards.filter(c => c.rarity === RARITY.COMMON);
    const uncommons = silentCards.filter(c => c.rarity === RARITY.UNCOMMON);
    const rares = silentCards.filter(c => c.rarity === RARITY.RARE);
    expect(basics.length).toBe(5); // 4 starters + shiv
    expect(commons.length).toBe(10); // 5 attacks + 5 skills
    expect(uncommons.length).toBe(10);
    expect(rares.length).toBe(6);
  });

  it('poison cards exist', () => {
    const poisonCards = silentCards.filter(c =>
      c.effects?.some(e => e.type === 'poison') || c.special === 'noxiousFumes'
    );
    expect(poisonCards.length).toBeGreaterThanOrEqual(3);
  });

  it('shiv-generating cards exist', () => {
    const shivCards = silentCards.filter(c => c.special === 'addShivs');
    expect(shivCards.length).toBeGreaterThanOrEqual(2);
  });

  it('all cards have descriptions', () => {
    silentCards.forEach(card => {
      expect(card.description).toBeDefined();
      expect(card.description.length).toBeGreaterThan(0);
    });
  });

  it('all non-basic cards have upgraded versions', () => {
    silentCards
      .filter(c => c.rarity !== RARITY.BASIC && !c.upgraded)
      .forEach(card => {
        expect(card.upgradedVersion, `${card.id} missing upgradedVersion`).toBeDefined();
      });
  });

  it('card rewards for Silent only include Silent or neutral cards', () => {
    for (let i = 0; i < 20; i++) {
      const rewards = getCardRewards(3, 'silent');
      rewards.forEach(card => {
        const cardChar = card.character || 'ironclad';
        expect(['silent', 'neutral']).toContain(cardChar);
      });
    }
  });

  it('card rewards for Ironclad do not include Silent cards', () => {
    for (let i = 0; i < 20; i++) {
      const rewards = getCardRewards(3, 'ironclad');
      rewards.forEach(card => {
        expect(card.character).not.toBe('silent');
      });
    }
  });

  it('Ironclad starter deck unchanged', () => {
    const deck = getStarterDeck('ironclad');
    expect(deck).toHaveLength(10);
    const strikes = deck.filter(c => c.id === 'strike');
    const defends = deck.filter(c => c.id === 'defend');
    const bashes = deck.filter(c => c.id === 'bash');
    expect(strikes).toHaveLength(5);
    expect(defends).toHaveLength(4);
    expect(bashes).toHaveLength(1);
  });
});

describe('Poison Mechanic', () => {
  it('poison effect type exists on Silent cards', () => {
    const poisonedStab = ALL_CARDS.find(c => c.id === 'poisonedStab');
    expect(poisonedStab).toBeDefined();
    expect(poisonedStab.effects).toEqual([{ type: 'poison', amount: 3 }]);
  });

  it('deadlyPoison applies poison without damage', () => {
    const deadlyPoison = ALL_CARDS.find(c => c.id === 'deadlyPoison');
    expect(deadlyPoison).toBeDefined();
    expect(deadlyPoison.effects).toEqual([{ type: 'poison', amount: 5 }]);
    expect(deadlyPoison.damage).toBeUndefined();
  });

  it('corpseExplosion applies poison', () => {
    const ce = ALL_CARDS.find(c => c.id === 'corpseExplosion');
    expect(ce).toBeDefined();
    expect(ce.effects[0].type).toBe('poison');
    expect(ce.special).toBe('corpseExplosion');
  });
});

describe('Silent Powers', () => {
  it('noxiousFumes has correct structure', () => {
    const nf = ALL_CARDS.find(c => c.id === 'noxiousFumes');
    expect(nf).toBeDefined();
    expect(nf.type).toBe(CARD_TYPES.POWER);
    expect(nf.special).toBe('noxiousFumes');
    expect(nf.poisonPerTurn).toBe(2);
  });

  it('footwork has correct structure', () => {
    const fw = ALL_CARDS.find(c => c.id === 'footwork');
    expect(fw).toBeDefined();
    expect(fw.type).toBe(CARD_TYPES.POWER);
    expect(fw.dexterity).toBe(2);
  });

  it('aThousandCuts has correct structure', () => {
    const tc = ALL_CARDS.find(c => c.id === 'aThousandCuts');
    expect(tc).toBeDefined();
    expect(tc.type).toBe(CARD_TYPES.POWER);
    expect(tc.damagePerCard).toBe(1);
  });

  it('wellLaidPlans has correct structure', () => {
    const wlp = ALL_CARDS.find(c => c.id === 'wellLaidPlans');
    expect(wlp).toBeDefined();
    expect(wlp.type).toBe(CARD_TYPES.POWER);
    expect(wlp.retainCount).toBe(1);
  });

  it('envenom has correct structure', () => {
    const env = ALL_CARDS.find(c => c.id === 'envenom');
    expect(env).toBeDefined();
    expect(env.type).toBe(CARD_TYPES.POWER);
    expect(env.poisonOnUnblocked).toBe(1);
  });
});
