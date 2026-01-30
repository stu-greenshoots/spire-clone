export const BOSS_DIALOGUE = {
  slimeBoss: {
    personality: 'The war\'s simplest output. No mind, no memory. It splits and consumes because that is the only pattern it knows. It does not fight you — it processes you.',
    intro: 'Something shifts in the passage ahead. Not a creature — a process. The war\'s simplest answer to complexity: divide, absorb, repeat.',
    midFight: 'It splits without hesitation, without thought. There is nothing behind its movement but pattern. It does not know you. It does not need to.',
    deathQuote: 'The mass collapses, but the pieces do not dissolve. They settle. Shrink. Reform into something smaller, denser. The war does not waste its material.',
  },
  theGuardian: {
    personality: 'The war\'s oldest iteration. It has stood at this threshold longer than anything else in the Spire. It does not guard — it repeats. It is the pattern examining itself.',
    intro: 'It was here before you. Before the last version of you. Before the version before that. The war\'s oldest pattern, still iterating, still finding the same answer.',
    midFight: 'Something shifts in its stance — not adaptation, but recognition. It has processed this configuration before. Or one close enough.',
    deathQuote: 'It does not fall. It simply stops iterating. The pattern that held it together unravels, and what remains is indistinguishable from the walls around it.',
  },
  hexaghost: {
    personality: 'Six flames, six failed attempts the war remembers. It is not a ghost — it is a record. The war\'s memory, burning.',
    intro: 'Six flames circle in the dark. Each one a different color, a different temperature. The war remembers its failed attempts, and it remembers them in fire.',
    midFight: 'The flames flicker with shapes almost familiar — a stance you considered, a card you almost played. Fragments of previous climbers, still burning in its memory.',
    deathQuote: 'The shell cracks and the flames scatter outward, each drifting in a different direction. They do not go out. Somewhere in the Spire, they will find new fuel.',
  },
  theChamp: {
    personality: 'Arrogant, theatrical, lives for the fight. Respects worthy opponents.',
    intro: '"FINALLY! A challenger approaches! I am THE CHAMP—undefeated, unbroken! Show me what you\'ve got!"',
    midFight: '"Hah! You actually landed a hit! Maybe you ARE worth my time after all..."',
    deathQuote: '"Im... impossible... I am... THE CHAMP... I don\'t... lose..."',
  },
  awakened_one: {
    personality: 'Transcendent, speaking in layers of voices. Curious about mortal power.',
    intro: 'A being of pure dark energy hovers before you, its many eyes studying your every card. "Show me... what mortals have learned."',
    midFight: '"Fascinating... you wield powers beyond your comprehension. But I have SEEN the void between stars."',
    deathQuote: '"This form... was merely... a vessel... I will return... in dreams..."',
  },
  timeEater: {
    personality: 'Patient, methodical, speaks in temporal metaphors. Sees all timelines.',
    intro: '"Tick... tock... I have watched you climb this spire a thousand times across a thousand timelines. In most, you die here."',
    midFight: '"You play your cards so... quickly. Do you not savor each moment? Time is all we have."',
    deathQuote: '"This timeline... diverges... unexpectedly... How... novel..."',
  },
  corruptHeart: {
    personality: 'The Spire itself. Speaks in booming, reality-warping declarations. Beyond good and evil.',
    intro: '"YOU HAVE REACHED THE HEART OF ALL THINGS. I AM THE SPIRE. I AM THE WORLD. I AM YOUR END."',
    midFight: '"YOU SCRATCH AT INFINITY. YOUR WEAPONS ARE DUST. YOUR WILL IS NOTHING."',
    deathQuote: '"IMPOSSIBLE... I AM... ETERNAL... THE SPIRE... CRUMBLES... BUT I... REMAIN..."',
  }
};

export const getBossDialogue = (bossId) => BOSS_DIALOGUE[bossId] || null;
