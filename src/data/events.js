// 20 Game Events for Spire Ascent
// First 10: "Pattern glitches" in the Endless War (Varrow voice)
// Last 10: Dark fantasy flavor with dry humor and real trade-offs

export const events = [
  // ===== PATTERN GLITCHES (Endless War voice) =====
  {
    id: 'hollow_merchant',
    title: 'Supply Line Anomaly',
    description: 'The war keeps inventory. Resources cycle through its corridors in predictable loops. But this cache has stalled — a figure stands beside it, not quite a combatant, not quite anything. It holds out objects it should not have, in a place they should not be.',
    choices: [
      {
        text: 'Take the restorative (lose 75 gold)',
        effect: { loseGold: 75, heal: 30 },
        result: 'The liquid tastes of nothing. It heals like a process completing, efficient and without warmth. The figure does not react. It was never really here — just the war redistributing.'
      },
      {
        text: 'Take the crystallized output (lose 100 gold)',
        effect: { loseGold: 100, gainRelic: 'vajra' },
        result: 'A shard of concentrated force, dense with iterations the war ran and discarded. It bonds to you immediately. The figure dissolves. The supply line corrects itself.'
      },
      {
        text: 'Walk away',
        effect: { gainGold: 10 },
        result: 'You step past and something clinks underfoot. A small residue — the war rounds down, apparently. The anomaly collapses behind you without sound.'
      }
    ]
  },

  {
    id: 'traveling_alchemist',
    title: 'Process Deviation',
    description: 'A woman with singed eyebrows and acid-stained gloves blocks the corridor. She is not part of the war\'s pattern — or she is a part that has gone wrong. She holds out a concoction that bubbles with unstable intent. "Only mostly not kill you," she says, which is not how the war usually phrases things.',
    choices: [
      {
        text: 'Drink the concoction',
        effect: { loseHpPercent: 20, gainMaxHp: 10 },
        result: 'Your insides rearrange. The war does not approve of unauthorized modifications, but it cannot undo what has already compiled. You are sturdier now. The alchemist scribbles notes as if documenting a bug.'
      },
      {
        text: 'Politely decline and ask for gold instead',
        effect: { gainGold: 50, damage: 5 },
        result: 'She flicks a pouch at your head. It connects. The war did not arrange this interaction and seems unsure how to log it. Fair enough.'
      }
    ]
  },

  {
    id: 'forgotten_library',
    title: 'Pattern Archive',
    description: 'The war remembers everything, but not everything is meant to be accessed. This chamber holds older iterations — tactics tested and shelved, configurations abandoned mid-cycle. One record still pulses, its data wanting to be read.',
    choices: [
      {
        text: 'Access the active record',
        effect: { upgradeRandomCard: true, loseHp: 8 },
        result: 'The data overwrites something you knew with something sharper. Your nose bleeds — the war\'s archive was not designed for direct access. But the technique is yours now, refined beyond its original version.'
      },
      {
        text: 'Search for cached resources',
        effect: { gainGold: 80 },
        result: 'Behind a corrupted section, resources the war allocated and forgot. A previous iteration\'s budget, never reclaimed. The skeleton nearby suggests the last accessor did not log out cleanly.'
      },
      {
        text: 'Purge the archive',
        effect: { removeCard: true, gainMaxHp: 3 },
        result: 'The old data burns away, and with it a pattern you had been carrying — one the war embedded in you without asking. You are lighter. The walls shudder, but the war has no mechanism for complaint.'
      }
    ]
  },

  {
    id: 'crumbling_altar',
    title: 'Iteration Marker',
    description: 'A slab of dark stone scored with geometric patterns — the war\'s notation system, older than anything else in this corridor. Dried residue fills the grooves. This is where the war tracked its early cycles. The tracking still works.',
    choices: [
      {
        text: 'Offer resources to the marker (lose 60 gold)',
        effect: { loseGold: 60, gainRelic: 'anchor' },
        result: 'The gold dissolves into the grooves and reforms as a dense pendant. The war\'s oldest output — stability, grounding. The marker cracks and goes dark. Its function is complete.'
      },
      {
        text: 'Offer your blood',
        effect: { loseHp: 15, upgradeRandomCard: true, upgradeRandomCard2: true },
        result: 'Your blood fills the geometric pattern and the war reads you. It writes back. Techniques sharpen in your muscle memory as the system calibrates you like any other input. The price was steep but the data is permanent.'
      },
      {
        text: 'Break the marker',
        effect: { gainGold: 40, loseMaxHp: 3 },
        result: 'The stone shatters. Resources clatter free. But something in the breakage settles into you — a small corruption, a reduced ceiling. The war does not forget damage to its infrastructure.'
      }
    ]
  },

  {
    id: 'sunken_vault',
    title: 'Corrupted Cache',
    description: 'A storage node the war sealed and abandoned. Half-submerged, its contents glinting through murky overflow. Whatever corrupted this cache still moves in the water — the war\'s cleanup process, still running, still hungry.',
    choices: [
      {
        text: 'Grab what you can, fast',
        effect: { gainGold: 120, damage: 18 },
        result: 'You plunge in and snatch. The cleanup process objects — violently. Teeth marks cross your legs as you scramble out clutching resources the war wrote off long ago. Profitable, if the war\'s janitor doesn\'t follow.'
      },
      {
        text: 'Drain the cache slowly',
        effect: { gainGold: 60, loseMaxHp: 2 },
        result: 'Hours of careful work. The yield is modest, but the exposure to whatever saturates this place has thinned something in you. The war\'s runoff is not meant for extended contact.'
      }
    ]
  },

  {
    id: 'serpent_guardian',
    title: 'Legacy Process',
    description: 'Something old blocks the path — older than the current iteration of the war, still running on outdated logic. It coils in silver-tarnished armor and speaks in a frequency the war no longer uses: "I offer you a trade, warm-blood." The war tolerates it. It does not know how to stop it.',
    choices: [
      {
        text: 'Accept its bargain (lose 30 HP)',
        effect: { loseHp: 30, gainRelic: 'bronze_scales' },
        result: 'It bites deep, injecting something the war did not authorize. Your skin hardens with a pattern from an older version — bronze-scale armor, deprecated but functional. The war cannot patch what it did not write.'
      },
      {
        text: 'Challenge it for passage',
        effect: { damage: 12, gainGold: 65 },
        result: 'The old process strikes with outdated patterns — painful but predictable. It yields passage and sheds resources as it recoils. Impressed, perhaps. Or simply executing its loss condition.'
      },
      {
        text: 'Feed it from your reserves',
        effect: { loseGold: 30, heal: 10 },
        result: 'It accepts the input and coils aside. Warm air passes over your damage — a repair function from a gentler version of the war. The legacy process remembers a time before everything was combat.'
      }
    ]
  },

  {
    id: 'bone_collector',
    title: 'The Scavenger Pattern',
    description: 'A thing of misaligned joints and hollow sockets crouches over a pile of discarded outputs — the war\'s waste material, sorted by criteria only it understands. It grins with borrowed teeth: "Spare me something interesting?" The war does not acknowledge this entity, but it exists anyway.',
    choices: [
      {
        text: 'Offer a card from your deck',
        effect: { removeCard: true, gainRelic: 'pen_nib' },
        result: 'It extracts the technique from your configuration like pulling a bad tooth. In exchange, a sharp instrument — something for marking your progress through the war. "For writing your pattern in blood," it says. The war pretends this did not happen.'
      },
      {
        text: 'Offer your blood (lose 20 HP)',
        effect: { loseHp: 20, gainGold: 100 },
        result: 'It produces a cup and you fill it. The scavenger drinks, then produces resources from somewhere the war does not track. An off-the-books transaction. The war\'s economy has leaks.'
      }
    ]
  },

  {
    id: 'shadow_beast',
    title: 'Negative Space',
    description: 'Where the war\'s patterns do not reach, something else fills in. A gap in the corridor\'s logic, visible as a darker absence. It whispers in the frequency between the war\'s signals — offering modifications the system never intended.',
    choices: [
      {
        text: 'Accept its gift of strength',
        effect: { gainMaxHp: 8, loseGold: 50 },
        result: 'The negative space pours into you, expanding your capacity beyond the war\'s allocation. Your resources lighten — the gap feeds on surplus. An expensive update, but the war cannot roll it back.'
      },
      {
        text: 'Ask it to refine your technique',
        effect: { upgradeRandomCard: true, loseMaxHp: 4 },
        result: 'Dark tendrils rewrite a technique into something the war did not intend. Sharper, yes. But the edit cost you capacity — the gap took its margin. You are more precise now, and somehow less.'
      },
      {
        text: 'Drive it away',
        effect: { gainGold: 25 },
        result: 'You force the gap to collapse and something metallic drops from the absence. The war fills in the space immediately, relieved. Not much gained, but the system is stable again.'
      }
    ]
  },

  {
    id: 'blood_crown',
    title: 'Recursive Loop',
    description: 'An object the war produced and cannot reclaim — a crown of iron thorns, cycling endlessly through a self-referencing pattern. It sits atop the remains of everyone who wore it, each one feeding the next iteration. The loop wants a new input.',
    choices: [
      {
        text: 'Wear the crown',
        effect: { gainRelic: 'red_skull', loseHp: 25 },
        result: 'The thorns bite in and the loop accepts you. Power flows — but only at the edge, only when your own pattern is close to terminating. The crown optimizes for desperation. It knows exactly what it is doing.'
      },
      {
        text: 'Break the loop for materials',
        effect: { gainGold: 75, damage: 8 },
        result: 'The iron resists — recursive patterns do not want to end. Molten fragments spit and scar. Eventually the loop collapses into raw resources, and something that might have been a scream dissipates into the war\'s background noise.'
      }
    ]
  },

  {
    id: 'whispering_blade',
    title: 'Orphaned Instruction',
    description: 'A weapon embedded in a terminated combatant, still executing its last command. It hums at a frequency the war no longer monitors — an instruction orphaned when its owner stopped iterating. It wants to complete its function. The previous owner\'s expression suggests cooperation was not optional.',
    choices: [
      {
        text: 'Accept the instruction',
        effect: { upgradeRandomCard: true, damage: 10 },
        result: 'The blade completes its transfer — a combat technique from a pattern that no longer exists, refined by an iteration you never met. It cuts your hand in the process. Instructions from dead patterns are not gentle.'
      },
      {
        text: 'Salvage the hardware instead',
        effect: { gainGold: 90 },
        result: 'You strip the weapon\'s components without accepting its data. The instruction fades to static, then silence. Resources gained, pattern lost. The war does not mourn orphaned code.'
      },
      {
        text: 'Complete the termination properly',
        effect: { heal: 15, gainMaxHp: 3 },
        result: 'You set the blade down and close the process correctly. Something the war should have done and didn\'t. A clean shutdown restores something in you — the war\'s entropy reversed, briefly, by simple maintenance.'
      }
    ]
  },

  // ===== CLASSIC EVENTS (original dark fantasy voice) =====
  {
    id: 'mirror_of_souls',
    title: 'The Mirror of Souls',
    description: 'A cracked mirror stands in an empty room, reflecting a version of you that looks considerably more capable. It reaches toward the glass from the other side, offering something.',
    choices: [
      {
        text: 'Touch the mirror',
        effect: { gainMaxHp: 6, loseGold: 40 },
        result: 'Your reflection grabs your hand and pulls something through. You feel more whole, more alive. Your gold pouch is lighter - your reflection kept the payment.'
      },
      {
        text: 'Shatter the mirror',
        effect: { gainGold: 55, loseMaxHp: 5 },
        result: 'The glass explodes outward, showering you with shards and gold coins from beyond. Your reflection screams as it dies, and something permanent tears away from you.'
      }
    ]
  },

  // ===== NPCs IN DISTRESS =====
  {
    id: 'wounded_knight',
    title: 'The Fallen Knight',
    description: 'A knight in battered armor leans against the wall, bleeding from a dozen wounds. She offers you her shield if you help, or you could simply take what you want from her weakened form.',
    choices: [
      {
        text: 'Help her and accept the shield',
        effect: { loseHp: 5, gainRelic: 'orichalcum' },
        result: 'You bandage her wounds at the cost of your own supplies. She presses a golden-veined stone into your hands. "It will protect you when nothing else can," she gasps.'
      },
      {
        text: 'Take her gold and leave',
        effect: { gainGold: 90, loseMaxHp: 3 },
        result: 'Shame weighs on you as you pocket her coin. The Spire rewards cruelty, but something fundamental dims within you. The knight\'s eyes follow you out.'
      },
      {
        text: 'Trade combat knowledge',
        effect: { upgradeRandomCard: true },
        result: 'Between labored breaths, she teaches you a technique perfected over years of battle. Fair exchange - her wisdom for a moment of company in this forsaken place.'
      }
    ]
  },

  {
    id: 'trapped_spirit',
    title: 'The Trapped Spirit',
    description: 'A spectral figure writhes within a binding circle, its features shifting between despair and rage. It promises rewards for freedom, and threatens consequences regardless. Spirits are dramatic like that.',
    choices: [
      {
        text: 'Break the circle',
        effect: { gainRelic: 'lantern', loseHp: 10 },
        result: 'The spirit erupts from containment, clawing at you as it passes. It leaves behind a glowing lantern as promised. At least it kept its word, despite the scratches.'
      },
      {
        text: 'Reinforce the binding and demand payment',
        effect: { gainGold: 70, damage: 15 },
        result: 'The spirit shrieks and hurls gold at you with considerable force. Each coin hits like a thrown stone. Profitable, if painful.'
      },
      {
        text: 'Walk away from this mess',
        effect: { heal: 5 },
        result: 'Sometimes the wisest choice is not to choose. You leave the spirit to its fate and feel oddly at peace with the decision. A rare luxury in the Spire.'
      }
    ]
  },

  // ===== ENVIRONMENTAL HAZARDS =====
  {
    id: 'crystalline_cave',
    title: 'The Crystalline Cave',
    description: 'Luminous crystals line every surface of this cave, humming with stored energy. Some pulse invitingly, others crackle with barely contained force. The wrong choice could be energizing or agonizing.',
    choices: [
      {
        text: 'Absorb energy from the blue crystals',
        effect: { heal: 25, loseGold: 20 },
        result: 'Healing energy courses through you as the blue crystals dim. Some of your gold transmutes into crystal dust in the process. Energy must come from somewhere.'
      },
      {
        text: 'Harvest the red crystals',
        effect: { gainGold: 100, damage: 15 },
        result: 'The red crystals shatter as you pry them loose, each one a burst of heat and light. Your pack is full of valuable fragments, and your hands are thoroughly burned.'
      },
      {
        text: 'Meditate among the crystals',
        effect: { upgradeRandomCard: true, loseGold: 10 },
        result: 'The crystals\' resonance clears your mind. A technique crystallizes into something purer. A few coins in your pack have turned to worthless quartz, but the trade seems fair.'
      }
    ]
  },

  {
    id: 'toxic_spores',
    title: 'The Sporium Passage',
    description: 'Thick clouds of luminescent spores fill the corridor ahead. They drift in hypnotic patterns, beautiful and certainly toxic. Another path exists, but it is much longer and your legs already ache.',
    choices: [
      {
        text: 'Rush through the spores',
        effect: { damage: 12, gainGold: 35 },
        result: 'You hold your breath and sprint. The spores burn exposed skin but you stumble over a corpse halfway through - someone less lucky, but their gold is yours now.'
      },
      {
        text: 'Take the long way around',
        effect: { loseGold: 25, heal: 10 },
        result: 'The detour costs time and supplies but the clean air is restorative. You arrive refreshed, if slightly poorer. Sometimes patience is its own reward.'
      }
    ]
  },

  // ===== RELIGIOUS/OCCULT SITES =====
  {
    id: 'dark_chapel',
    title: 'The Dark Chapel',
    description: 'Pews of petrified wood face an altar where a candle burns with black flame. The prayers etched into the walls are in no language you recognize, yet you understand them perfectly. They offer power at a price.',
    choices: [
      {
        text: 'Pray for strength',
        effect: { gainRelic: 'shuriken', loseHpPercent: 25 },
        result: 'The black flame leaps to your hands, branding star-shaped marks into your palms. Your attacks will flow faster now, each strike building toward something greater.'
      },
      {
        text: 'Pray for protection',
        effect: { gainMaxHp: 7, loseGold: 45 },
        result: 'The chapel\'s power infuses your body with resilience. Gold coins tarnish and crumble in your pack - the chapel\'s tithe, taken without asking.'
      },
      {
        text: 'Steal the black candle',
        effect: { gainGold: 65, loseMaxHp: 4 },
        result: 'The candle comes free but its flame sears something from your soul. You stuff it in your pack where it continues burning, slowly converting your health into marketable goods.'
      }
    ]
  },

  {
    id: 'bone_oracle',
    title: 'The Bone Oracle',
    description: 'A circle of skulls arranged in the floor, each one facing inward. When you step into the center, they begin to whisper futures both promising and dire. They demand tribute for their visions.',
    choices: [
      {
        text: 'Pay gold for knowledge (lose 55 gold)',
        effect: { loseGold: 55, upgradeRandomCard: true, gainMaxHp: 3 },
        result: 'The skulls speak in unison, flooding your mind with tactical insights. Your body and mind both sharpen. Expensive tutors, but effective ones.'
      },
      {
        text: 'Pay in blood',
        effect: { loseHp: 20, gainRelic: 'bag_of_marbles' },
        result: 'Your blood pools in the skull circle and coalesces into a pouch of glass spheres. They will unbalance your foes before battle even begins. A worthy exchange for the light-headedness.'
      }
    ]
  },

  // ===== GAMBLING/RISK SCENARIOS =====
  {
    id: 'wheel_of_fortune',
    title: 'The Wheel of Misfortune',
    description: 'A great wheel of iron and bone dominates this chamber, its segments marked with symbols both auspicious and terrible. A skeletal attendant gestures toward it with theatrical enthusiasm.',
    choices: [
      {
        text: 'Spin the wheel (costs 30 gold)',
        effect: { loseGold: 30, gainGold: 100, damage: 8 },
        result: 'The wheel clatters to a stop on a golden segment. Coins shower from above as the attendant applauds. A blade also swings from the ceiling, because of course it does.'
      },
      {
        text: 'Bet big - spin twice (costs 60 gold)',
        effect: { loseGold: 60, gainRelic: 'blood_vial', damage: 15 },
        result: 'Two spins yield a vial of regenerative blood and considerably more lacerations from the wheel\'s defensive mechanisms. The attendant gives you a standing ovation.'
      },
      {
        text: 'Pickpocket the attendant instead',
        effect: { gainGold: 45, loseHp: 5 },
        result: 'The skeleton catches you mid-theft and delivers a surprisingly solid slap. You still manage to pocket its coin purse. It rattles in displeasure but lets you go.'
      }
    ]
  },

  {
    id: 'devil_game',
    title: 'The Devil\'s Wager',
    description: 'A horned figure in a too-fine suit sits at a table with two goblets. It shuffles them with inhuman speed, grins, and gestures for you to choose.',
    choices: [
      {
        text: 'Choose the left goblet',
        effect: { gainMaxHp: 10, loseGold: 75 },
        result: 'Liquid fire fills your veins and expands your very being. The devil pockets your gold with a satisfied smirk. "Pleasure doing business. Do come back when you have more to lose."'
      },
      {
        text: 'Choose the right goblet',
        effect: { gainGold: 100, loseMaxHp: 6 },
        result: 'The goblet fills your pack with gold but drains something vital. The devil claps slowly. "Greed suits you. The Spire will enjoy watching you count coins on your deathbed."'
      },
      {
        text: 'Flip the table',
        effect: { damage: 10, upgradeRandomCard: true },
        result: 'Both goblets shatter, their contents merging in the air. The devil laughs with genuine delight. "Audacity! How refreshing!" Power and pain crash into you simultaneously.'
      }
    ]
  },

  {
    id: 'ancient_guardian',
    title: 'The Sleeping Guardian',
    description: 'An enormous construct of stone and magic blocks the path, dormant but not dead. Its chest cavity is open, revealing a glowing core. Removing it would be profitable. Waking it would be inadvisable.',
    choices: [
      {
        text: 'Carefully extract the core',
        effect: { gainRelic: 'meat_on_the_bone', damage: 20 },
        result: 'The core comes free but the guardian\'s fist comes down. You scramble away clutching the core, which pulses with restorative energy. The guardian collapses, finally truly dead.'
      },
      {
        text: 'Siphon energy without removing it',
        effect: { heal: 20, gainMaxHp: 4 },
        result: 'You draw power from the core gently, like sipping from a river. The guardian remains dormant and you walk away stronger. Sometimes the patient approach yields the richest rewards.'
      },
      {
        text: 'Loot the area around it',
        effect: { gainGold: 70 },
        result: 'Previous challengers were not so careful. Their scattered belongings yield considerable gold. You step around the guardian on tiptoe, wealthy and whole.'
      }
    ]
  }
];

export default events;
