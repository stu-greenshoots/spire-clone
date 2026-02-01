// Character definitions for Spire Ascent
// Each character has a unique card pool, starter deck, and starter relic.

export const CHARACTER_IDS = {
  IRONCLAD: 'ironclad',
  SILENT: 'silent',
  DEFECT: 'defect'
};

export const CHARACTERS = [
  {
    id: CHARACTER_IDS.IRONCLAD,
    name: 'The Ironclad',
    description: 'A hardened warrior who embraces pain and power. Specializes in Strength and Exhaust synergies.',
    starterRelicId: 'burning_blood',
    maxHp: 80,
    starterDeck: [
      { id: 'strike', count: 5 },
      { id: 'defend', count: 4 },
      { id: 'bash', count: 1 }
    ],
    color: '#cc3333'
  },
  {
    id: CHARACTER_IDS.SILENT,
    name: 'The Silent',
    description: 'A deadly huntress who dispatches foes with poison and a flurry of daggers. Specializes in Poison and Shiv synergies.',
    starterRelicId: 'ring_of_snake',
    maxHp: 70,
    starterDeck: [
      { id: 'strike_silent', count: 5 },
      { id: 'defend_silent', count: 5 },
      { id: 'neutralize', count: 1 },
      { id: 'survivor', count: 1 }
    ],
    color: '#2d8a4e'
  },
  {
    id: CHARACTER_IDS.DEFECT,
    name: 'The Defect',
    description: 'An ancient automaton that channels Orbs of elemental energy. Specializes in Lightning, Frost, Dark, and Plasma orbs.',
    starterRelicId: 'cracked_core',
    maxHp: 75,
    orbSlots: 3,
    starterDeck: [
      { id: 'strike_defect', count: 4 },
      { id: 'defend_defect', count: 4 },
      { id: 'zap', count: 1 },
      { id: 'dualcast', count: 1 }
    ],
    color: '#4488cc'
  }
];

export const getCharacterById = (id) => CHARACTERS.find(c => c.id === id);

export const getDefaultCharacter = () => CHARACTERS[0];
