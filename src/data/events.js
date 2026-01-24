// 20 Meaningful Game Events for Spire Ascent
// Dark fantasy flavor with dry humor and real trade-offs

export const events = [
  // ===== MYSTERIOUS MERCHANTS/ENCOUNTERS =====
  {
    id: 'hollow_merchant',
    title: 'The Hollow Merchant',
    description: 'A figure draped in moth-eaten robes stands before a blanket of curious wares. Its face is a smooth void where features should be. It gestures toward its goods with fingers that bend the wrong way.',
    choices: [
      {
        text: 'Buy the glowing vial (lose 75 gold)',
        effect: { loseGold: 75, heal: 30 },
        result: 'The vial burns going down, but warmth floods your veins. The merchant nods approvingly with its featureless face.'
      },
      {
        text: 'Buy the wrapped relic (lose 100 gold)',
        effect: { loseGold: 100, gainRelic: 'vajra' },
        result: 'You unwrap a crystalline shard that hums with raw power. Strength courses through you as it bonds to your essence.'
      },
      {
        text: 'Walk away',
        effect: { gainGold: 10 },
        result: 'As you leave, you notice a coin on the ground where the merchant stood. It was not there before. Neither was the merchant, come to think of it.'
      }
    ]
  },

  {
    id: 'traveling_alchemist',
    title: 'The Traveling Alchemist',
    description: 'A woman with singed eyebrows and acid-stained gloves blocks the corridor. She offers you a bubbling concoction, insisting it will "only mostly not kill you." Her confidence is not reassuring.',
    choices: [
      {
        text: 'Drink the concoction',
        effect: { loseHpPercent: 20, gainMaxHp: 10 },
        result: 'Your insides rearrange themselves briefly. When the screaming stops, you feel fundamentally sturdier. The alchemist scribbles notes furiously.'
      },
      {
        text: 'Politely decline and ask for gold instead',
        effect: { gainGold: 50, damage: 5 },
        result: 'She flicks a pouch of gold at your head in annoyance. It connects solidly with your temple. Fair enough.'
      }
    ]
  },

  // ===== ANCIENT RUINS/ARTIFACTS =====
  {
    id: 'forgotten_library',
    title: 'The Forgotten Library',
    description: 'Shelves of crumbling tomes stretch into darkness. One book pulses with a faint glow, its pages turning of their own accord. The knowledge within could reshape your understanding of combat.',
    choices: [
      {
        text: 'Study the glowing tome',
        effect: { upgradeRandomCard: true, loseHp: 8 },
        result: 'Forbidden knowledge sears into your mind. A technique you knew becomes refined, perfected. Blood drips from your nose onto the yellowed pages.'
      },
      {
        text: 'Search for hidden valuables',
        effect: { gainGold: 80 },
        result: 'Behind a loose stone you find a scholar\'s emergency fund. Apparently they never came back for it. Their skeleton in the corner explains why.'
      },
      {
        text: 'Burn it all',
        effect: { removeCard: true, gainMaxHp: 3 },
        result: 'The flames consume the cursed knowledge and with it, a weakness you carried. You feel lighter, unburdened. The Spire groans in disapproval.'
      }
    ]
  },

  {
    id: 'crumbling_altar',
    title: 'The Crumbling Altar',
    description: 'An altar of obsidian stands in a chamber of broken pillars. Ancient bloodstains pattern its surface in geometric shapes. The air tastes of iron and ozone.',
    choices: [
      {
        text: 'Place gold on the altar (lose 60 gold)',
        effect: { loseGold: 60, gainRelic: 'anchor' },
        result: 'The gold melts into the stone and reforms as a heavy anchor pendant. You feel steadier, more grounded. The altar crumbles to dust, its purpose fulfilled.'
      },
      {
        text: 'Offer your blood',
        effect: { loseHp: 15, upgradeRandomCard: true, upgradeRandomCard2: true },
        result: 'Your blood traces the geometric patterns and blazes with light. Combat techniques burn into your muscle memory. The price was steep but the knowledge is forever.'
      },
      {
        text: 'Smash the altar',
        effect: { gainGold: 40, loseMaxHp: 3 },
        result: 'The obsidian shatters, revealing gold within. But a cold curse settles over you, diminishing something fundamental. Perhaps some things are better left intact.'
      }
    ]
  },

  {
    id: 'sunken_vault',
    title: 'The Sunken Vault',
    description: 'A half-submerged stone vault rises from black water. Its door hangs open, revealing glinting treasures within. The water ripples despite the stillness of the air.',
    choices: [
      {
        text: 'Wade in and grab what you can',
        effect: { gainGold: 120, damage: 18 },
        result: 'You snatch handfuls of gold before something beneath the water takes its toll. Teeth marks cross your legs as you scramble out, richer but bloodied.'
      },
      {
        text: 'Drain the water first (takes time)',
        effect: { gainGold: 60, loseMaxHp: 2 },
        result: 'You spend hours redirecting the flow. The vault yields modest treasure, but the exposure to the Spire\'s damp air has weakened your constitution.'
      }
    ]
  },

  // ===== DANGEROUS CREATURES OFFERING DEALS =====
  {
    id: 'serpent_guardian',
    title: 'The Coiled Serpent',
    description: 'A massive serpent with scales like tarnished silver blocks the path. Its eyes hold ancient intelligence. It speaks in a voice like grinding stone: "I offer you a trade, warm-blood."',
    choices: [
      {
        text: 'Accept the serpent\'s bargain (lose 30 HP)',
        effect: { loseHp: 30, gainRelic: 'bronze_scales' },
        result: 'The serpent bites deep, injecting something that burns. When the pain subsides, your skin has hardened with bronze-like scales. Attackers will regret touching you.'
      },
      {
        text: 'Challenge it to earn passage',
        effect: { damage: 12, gainGold: 65 },
        result: 'The serpent strikes but you dodge most of its fury. Impressed, it yields passage and a tribute of scales that crumble into gold at your touch.'
      },
      {
        text: 'Offer it food from your pack',
        effect: { loseGold: 30, heal: 10 },
        result: 'The serpent accepts your offering and coils aside. As thanks, it breathes warm air across your wounds. Surprisingly gentle for a creature that size.'
      }
    ]
  },

  {
    id: 'bone_collector',
    title: 'The Bone Collector',
    description: 'A creature of twisted antlers and too many joints crouches over a pile of bones, sorting them by some unknowable criteria. It looks up with hollow eye sockets and grins. "Spare me something interesting?"',
    choices: [
      {
        text: 'Offer a card from your deck',
        effect: { removeCard: true, gainRelic: 'pen_nib' },
        result: 'The creature plucks the technique from your mind like pulling a tooth. In exchange, it presses a sharp nib into your palm. "For writing your story in blood," it whispers.'
      },
      {
        text: 'Offer your blood (lose 20 HP)',
        effect: { loseHp: 20, gainGold: 100 },
        result: 'It produces a bone cup and you fill it. The creature drinks deeply and belches coins. "Delicious vintage," it says, patting a pouch of gold into your hands.'
      }
    ]
  },

  {
    id: 'shadow_beast',
    title: 'The Thing in the Walls',
    description: 'Something moves in the walls, visible only as a darker patch of shadow. It whispers offers in a voice like rustling parchment, promising power for a small sacrifice of self.',
    choices: [
      {
        text: 'Accept its gift of strength',
        effect: { gainMaxHp: 8, loseGold: 50 },
        result: 'Shadows pour into you, and your body swells with unnatural vitality. Your coin purse feels lighter. The shadow feeds on gold, apparently. An expensive appetite.'
      },
      {
        text: 'Ask it to refine your technique',
        effect: { upgradeRandomCard: true, loseMaxHp: 4 },
        result: 'Dark tendrils probe your mind, perfecting a technique but hollowing something out in the process. You are sharper now, but somehow less.'
      },
      {
        text: 'Drive it away with light',
        effect: { gainGold: 25 },
        result: 'You strike sparks and the shadow recoils, dropping something metallic as it flees. Not much, but better than dealing with whatever that was.'
      }
    ]
  },

  // ===== CURSED OBJECTS WITH POWER =====
  {
    id: 'blood_crown',
    title: 'The Blood Crown',
    description: 'A crown of iron thorns sits atop a pile of bones, stained rust-red. It radiates palpable malice, yet the power it promises is undeniable. Previous wearers did not fare well, judging by the bones.',
    choices: [
      {
        text: 'Wear the crown',
        effect: { gainRelic: 'red_skull', loseHp: 25 },
        result: 'The thorns bite deep into your scalp. Power floods through you, but only when your life hangs by a thread. The crown knows exactly what it is doing.'
      },
      {
        text: 'Melt it down for gold',
        effect: { gainGold: 75, damage: 8 },
        result: 'The iron resists your makeshift forge, spattering you with molten droplets. Eventually it yields gold, though the crown seemed to scream as it melted.'
      }
    ]
  },

  {
    id: 'whispering_blade',
    title: 'The Whispering Blade',
    description: 'A sword embedded in a corpse hums with a frequency that sets your teeth on edge. It promises to teach you its secrets if you free it. The corpse\'s expression suggests this was a poor decision.',
    choices: [
      {
        text: 'Take the blade and listen',
        effect: { upgradeRandomCard: true, damage: 10 },
        result: 'The blade teaches you a refined killing technique even as it cuts your hand. Knowledge paid for in blood, as all the best knowledge is.'
      },
      {
        text: 'Pry out the gemstones instead',
        effect: { gainGold: 90 },
        result: 'You avoid the blade entirely and pocket the gems from its hilt. The sword\'s whispers turn to curses, growing fainter as you walk away counting your earnings.'
      },
      {
        text: 'Bury blade and corpse together',
        effect: { heal: 15, gainMaxHp: 3 },
        result: 'A warm peace settles over you as you show respect to the dead. The act of mercy restores something the Spire had been slowly taking from you.'
      }
    ]
  },

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
