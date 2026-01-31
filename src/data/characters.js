// Character definitions for Spire Ascent
// Each character has a unique card pool, starter deck, and starter relic.

export const CHARACTER_IDS = {
  IRONCLAD: 'ironclad'
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
  }
];

export const getCharacterById = (id) => CHARACTERS.find(c => c.id === id);

export const getDefaultCharacter = () => CHARACTERS[0];
