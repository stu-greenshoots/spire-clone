export const BOSS_DIALOGUE = {
  slimeBoss: {
    personality: 'Mindless, hungry, primordial. Communicates through oozing sounds and gurgles.',
    intro: 'A massive wall of acidic slime blocks the passage. It pulses with a sick, hungry rhythm—sensing prey.',
    midFight: 'The creature shudders violently, splitting and reforming. Its hunger only grows.',
    deathQuote: 'The slime collapses into a bubbling pool, its hunger finally extinguished.',
  },
  theGuardian: {
    personality: 'Ancient construct, dutiful, speaks in mechanical tones. Sees combat as a test.',
    intro: '"INTRUDER DETECTED. INITIATING DEFENSE PROTOCOL. YOU WILL BE... EVALUATED."',
    midFight: '"RECALIBRATING. SWITCHING TO AGGRESSIVE STANCE. YOU ARE... PERSISTENT."',
    deathQuote: '"PROTOCOL... FAILED. PASSAGE... GRANTED. YOU ARE... WORTHY..."',
  },
  hexaghost: {
    personality: 'Ancient, melancholic, treats combat as ritual. Six flames are fragments of its former self.',
    intro: 'Six flames orbit a hollow shell of what was once a warrior. It regards you with something like pity.',
    midFight: '"You burn brightly... but all flames gutter in the end."',
    deathQuote: '"At last... the cold..."',
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
