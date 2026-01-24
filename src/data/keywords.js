export const KEYWORDS = {
  vulnerable: { name: 'Vulnerable', description: 'Take 50% more damage from attacks. Lasts for the number of turns shown.' },
  weak: { name: 'Weak', description: 'Deal 25% less attack damage. Lasts for the number of turns shown.' },
  frail: { name: 'Frail', description: 'Gain 25% less Block from cards. Lasts for the number of turns shown.' },
  strength: { name: 'Strength', description: 'Increases attack damage by this amount.' },
  dexterity: { name: 'Dexterity', description: 'Increases Block gained from cards by this amount.' },
  exhaust: { name: 'Exhaust', description: 'When played or discarded, remove from your deck for the rest of combat.' },
  ethereal: { name: 'Ethereal', description: 'If this card is in your hand at end of turn, it is Exhausted.' },
  innate: { name: 'Innate', description: 'This card will always be in your starting hand.' },
  retain: { name: 'Retain', description: 'This card is not discarded at end of turn.' },
  unplayable: { name: 'Unplayable', description: 'This card cannot be played from your hand.' },
  intangible: { name: 'Intangible', description: 'Reduce ALL damage taken and HP loss to 1.' },
  thorns: { name: 'Thorns', description: 'When attacked, deal this much damage back to the attacker.' },
  artifact: { name: 'Artifact', description: 'Negates the next debuff applied to you.' },
  poison: { name: 'Poison', description: 'At start of turn, lose HP equal to stacks, then reduce by 1.' },
  block: { name: 'Block', description: 'Prevents damage. Removed at start of your turn unless you have Barricade.' },
  regen: { name: 'Regen', description: 'Heal this much HP at end of turn, then reduce by 1.' },
  metallicize: { name: 'Metallicize', description: 'Gain this much Block at end of each turn.' },
  platedArmor: { name: 'Plated Armor', description: 'Gain Block at end of each turn. Reduced by 1 when you take unblocked damage.' },
  barricade: { name: 'Barricade', description: 'Block is not removed at start of your turn.' }
};

export const getKeywordsInText = (text) => {
  if (!text) return [];
  const found = [];
  Object.entries(KEYWORDS).forEach(([key, data]) => {
    const regex = new RegExp(`\\b${data.name}\\b`, 'i');
    if (regex.test(text)) {
      found.push({ key, ...data });
    }
  });
  return found;
};
