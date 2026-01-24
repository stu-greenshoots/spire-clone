#!/usr/bin/env node

/**
 * Spire Ascent - Dark Fantasy Art Generator
 *
 * Generates all game art using OpenAI DALL-E 3 with consistent dark fantasy theme.
 *
 * Usage:
 *   OPENAI_API_KEY=your_key node scripts/generate-images.js [options]
 *
 * Options:
 *   --type=cards|enemies|relics|potions|all  Generate specific type (default: all)
 *   --start=id                               Start from specific asset ID
 *   --only=id1,id2,id3                       Generate only specific IDs
 *   --dry-run                                Show what would be generated without calling API
 *   --quality=standard|hd                    Image quality (default: standard, $0.04 vs $0.08)
 *   --size=1024x1024                         Image size (default: 1024x1024)
 *   --skip-existing                          Skip assets that already have image files
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  outputDir: path.join(__dirname, '../src/assets/art'),
  progressFile: path.join(__dirname, '../src/assets/art/.generation-progress.json'),
  quality: 'standard',
  size: '1024x1024',
  model: 'dall-e-3',
  rateLimitDelay: 1200, // ms between requests
  maxRetries: 3,
};

// Dark fantasy style template - consistent across all assets
const STYLE_BASE = [
  'dark fantasy oil painting style',
  'dramatic top-left lighting with deep shadows',
  'muted desaturated background',
  'rich jewel-tone palette',
  'textured brushstrokes visible',
  'no text no watermark no signature',
  'atmospheric fog and particle effects',
  'high detail fantasy game art'
].join(', ');

const CATEGORY_STYLE = {
  card: 'portrait card art composition, single focused action, vignette edges, dramatic contrast',
  enemy: 'centered full-body character portrait, menacing pose, dark atmospheric background, creature design',
  relic: 'centered iconic object, glowing magical aura, dark velvet background, ornate detailed item',
  potion: 'glass bottle with luminous liquid, magical glow emanating, dark shelf background, alchemical style'
};

// ============================================
// CARD PROMPTS - Dark Fantasy Theme
// ============================================

const CARD_PROMPTS = {
  // === BASIC ===
  strike: {
    prompt: 'A worn iron sword held in a ready position, glowing with faint red energy along the edge, dark dungeon corridor behind, sparks drifting from the blade'
  },
  defend: {
    prompt: 'A weathered iron shield with protective runes glowing blue, dents and scratches visible across its surface, torchlit stone walls behind'
  },
  bash: {
    prompt: 'A heavy armored gauntlet clenched into a fist, surrounded by crackling red energy rings, shockwave ripples emanating outward in a dark corridor'
  },

  // === COMMON ATTACKS ===
  anger: {
    prompt: 'A berserker with glowing red veins bursting from their skin, feral rage expression, dark crimson mist swirling'
  },
  cleave: {
    prompt: 'A massive greatsword mid-swing in a wide horizontal arc, bright energy trail behind the blade, wind and debris swirling around the warrior'
  },
  clothesline: {
    prompt: 'A warriors extended armored forearm with kinetic energy waves radiating from it, momentum lines trailing behind, dark arena setting'
  },
  headbutt: {
    prompt: 'A helmeted warrior lunging forward in a charge pose, energy emanating from the visor, stars and concussive rings around the helmet'
  },
  ironWave: {
    prompt: 'A warrior holding both sword and shield, a wave of iron-grey energy flowing between the two weapons, defensive yet powerful stance'
  },
  pommelStrike: {
    prompt: 'Close-up of an ornate sword pommel surrounded by concussive force rings, glowing with impact energy, dark background'
  },
  swordBoomerang: {
    prompt: 'A spinning enchanted blade flying through dark air in a curved arc, trailing blue ethereal energy ribbons, magical weapon in flight'
  },
  thunderclap: {
    prompt: 'Two gauntleted hands with crackling lightning arcing between the palms, thunder energy building, electric blue light illuminating a dark scene'
  },
  twinStrike: {
    prompt: 'Two crossed swords forming an X shape, dual trails of crimson energy emanating from the blades, dark moody atmosphere'
  },
  wildStrike: {
    prompt: 'A frenzied warrior swinging recklessly with abandon, wild red energy arcs, chaotic and untamed power'
  },
  bodySlam: {
    prompt: 'A heavily armored warrior mid-leap with momentum energy trailing behind, massive weight and gravitational force visible as distortion waves'
  },
  clash: {
    prompt: 'Two swords crossed together with a shower of sparks at the contact point, intense energy at the intersection, dramatic lighting'
  },
  heavyBlade: {
    prompt: 'An impossibly large dark iron greatsword being lifted overhead, veins of molten energy along the blade, immense power'
  },

  // === COMMON SKILLS ===
  armaments: {
    prompt: 'A blacksmith forge glowing with magical energy, weapons and armor being enhanced with runes, sparks flying upward'
  },
  flexCard: {
    prompt: 'A warrior flexing with temporary supernatural strength, muscles glowing with fading red energy, power surge'
  },
  havoc: {
    prompt: 'Pure chaos energy erupting from a warriors hands, random bolts of wild magic in all directions, untamed arcane power'
  },
  shrugItOff: {
    prompt: 'A stoic warrior with a fading shield aura around them, standing firm with determination, protective energy dissipating'
  },
  trueGrit: {
    prompt: 'A weathered warrior standing resolute, gritting teeth with iron determination, exhaling mist in cold air, enduring'
  },
  warcry: {
    prompt: 'A warrior shouting with visible sound waves rippling outward, rallying energy pulse, dark atmospheric scene'
  },
  sentinel: {
    prompt: 'A stalwart guardian in heavy plate standing immovable, shield planted in ground, protective aura emanating'
  },

  // === UNCOMMON ATTACKS ===
  carnage: {
    prompt: 'A dark ethereal greatsword wreathed in nightmare energy, pulsing with red-black power, ominous crimson aurora in the sky above'
  },
  dropkick: {
    prompt: 'A warrior leaping through the air in a dynamic flying kick pose, kinetic energy trail from boots, dramatic motion blur'
  },
  hemokinesis: {
    prompt: 'Crimson magical energy swirling from a warriors open palms upward, tendrils of arcane power forming a sphere'
  },
  pummel: {
    prompt: 'A warriors armored fists with multiple afterimage echoes showing rapid motion, energy burst rings around the hands'
  },
  rampage: {
    prompt: 'A warrior surrounded by escalating layers of red energy, building unstoppable momentum, each layer brighter and more intense'
  },
  recklessCharge: {
    prompt: 'A warrior sprinting forward recklessly, trails of desperate energy behind them, throwing caution aside, motion blur and speed lines'
  },
  uppercut: {
    prompt: 'A warriors fist raised upward trailing golden energy in an arc, upward force shockwave, dramatic low angle view'
  },
  whirlwind: {
    prompt: 'A warrior spinning with dual weapons extended creating a tornado of steel and energy, circular motion blur, wind vortex'
  },
  searingBlow: {
    prompt: 'A weapon glowing white-hot with accumulated power, intense heat distortion warping the air around it, molten edge'
  },
  perfectedStrike: {
    prompt: 'A perfectly poised sword gleaming with mastery energy, clean precise edge, the pinnacle of blade craft, elegant and refined'
  },

  // === UNCOMMON SKILLS ===
  battleTrance: {
    prompt: 'A warrior entering a deep meditative state, third eye opening with golden light, time slowing around them, focused awareness'
  },
  disarm: {
    prompt: 'A lone blade spinning through the air after being knocked loose, tactical precision energy ripple, weapon floating weightlessly'
  },
  dualWield: {
    prompt: 'A warrior wielding two gleaming weapons simultaneously in a ready stance, dual blade form, perfectly balanced posture'
  },
  entrench: {
    prompt: 'A warrior digging in behind massive fortifications, doubling their defensive position, immovable stance'
  },
  flameBarrier: {
    prompt: 'A ring of magical fire surrounding a warrior protectively, swirling flame wall, radiant fire shield glowing in darkness'
  },
  ghostlyArmor: {
    prompt: 'Ethereal spectral armor materializing around a warrior, translucent ghostly plates, otherworldly protection'
  },
  infernalBlade: {
    prompt: 'A sword spontaneously igniting with hellfire, demonic flames wrapping the blade, infernal weapon conjured from nothing'
  },
  intimidate: {
    prompt: 'A warriors terrifying dark aura expanding outward, commanding presence, shadow energy radiating from their silhouette'
  },
  powerThrough: {
    prompt: 'A warrior pushing forward through a wall of dark energy, converting adversity into protective power, determination personified'
  },
  rage: {
    prompt: 'Building fury creating a defensive aura around a warrior, red rage energy becoming a visible shield, protective wrath'
  },
  secondWind: {
    prompt: 'A warrior catching their second breath, old scrolls dissolving into healing energy around them, renewed vitality aura'
  },
  seeingRed: {
    prompt: 'A warriors vision turning crimson with fury, gaining energy from pure rage, red-tinted perspective, power rising'
  },
  shockwave: {
    prompt: 'A warrior slamming the ground with a fist, concentric shockwave rings spreading outward across cracked stone floor'
  },
  spotWeakness: {
    prompt: 'A warriors trained eye with a glowing tactical monocle, analyzing a glowing weak point in the air, strategic assessment'
  },
  bloodletting: {
    prompt: 'A warriors open palm with crimson energy orbs rising from it, sacrifice for power, dark ritual glow'
  },

  // === RARE ATTACKS ===
  bludgeon: {
    prompt: 'A massive ornate warhammer raised overhead, crackling with immense stored energy, ground cracking beneath the wielders feet'
  },
  feed: {
    prompt: 'A dark warrior absorbing swirling green life energy into their body, growing stronger, ethereal wisps being drawn inward'
  },
  fiendFire: {
    prompt: 'Hellish fire erupting from a warriors outstretched hands in all directions, cards burning as fuel, massive infernal firestorm'
  },
  immolate: {
    prompt: 'A warrior engulfed in controlled flames, fire radiating outward in all directions, self-immolation as a source of power'
  },
  reaper: {
    prompt: 'A spectral scythe emanating dark and green healing energy simultaneously, death and life intertwined in one weapon, ethereal'
  },

  // === RARE SKILLS ===
  doubleTap: {
    prompt: 'A warrior with a temporal afterimage echo visible beside them, ghostly duplicate of their next motion, time-doubled effect'
  },
  exhume: {
    prompt: 'A hand reaching into a grave to pull out a discarded weapon, resurrection of exhausted power, necromantic recovery'
  },
  impervious: {
    prompt: 'An impenetrable fortress of magical shields layering around a warrior, absolute defense, impenetrable barrier of light'
  },
  limitBreak: {
    prompt: 'A warrior shattering their own limitations, strength doubling, chains breaking, power surge beyond natural limits'
  },
  offering: {
    prompt: 'A warrior offering their own essence at a dark altar, receiving glowing cards and energy orbs in return, sacrificial ritual'
  },

  // === POWERS ===
  barricade: {
    prompt: 'Magical runes inscribing themselves on a shield, block becoming permanent, fortress enchantment activated'
  },
  berserk: {
    prompt: 'A warriors eyes glowing with berserk fury, unstable energy crackling around them, power building dangerously'
  },
  brutality: {
    prompt: 'A warrior in a primal stance drawing cards from dark energy around them, savage wisdom, raw instinctive power'
  },
  combust: {
    prompt: 'Internal combustion building within a warrior, flames erupting from cracks in their armor, living furnace of contained fire'
  },
  corruption: {
    prompt: 'Dark corruption spreading through a warriors armor, skills becoming free but ephemeral, power at a cost'
  },
  darkEmbrace: {
    prompt: 'Shadowy tendrils embracing exhausted cards, drawing new power from destruction, dark recycling magic'
  },
  demonForm: {
    prompt: 'A warrior slowly transforming into a demon, growing horns and strength each turn, dark metamorphosis'
  },
  evolve: {
    prompt: 'Mutations and adaptations occurring in real-time, status cards triggering evolution, biological enhancement'
  },
  feelNoPain: {
    prompt: 'A warrior numbed to all pain, exhausted cards becoming protective energy, transcending suffering'
  },
  fireBreathing: {
    prompt: 'A warrior with draconic features, flames flickering from their mouth, fiery aura surrounding them'
  },
  inflame: {
    prompt: 'Flames wrapping around a warriors fists permanently increasing strength, internal fire power growing'
  },
  juggernaut: {
    prompt: 'An unstoppable armored juggernaut figure radiating force waves with each step, fortress incarnate, immovable power'
  },
  metallicize: {
    prompt: 'Skin slowly turning to living metal, gaining automatic armor each turn, iron transformation'
  },
  rupture: {
    prompt: 'Crimson energy veins cracking along armor and skin, raw power converting loss into strength, glowing transformation'
  },

  // === STATUS/CURSE ===
  wound: {
    prompt: 'A dark cursed mark on weathered armor, spreading dark energy cracks, useless and debilitating, persistent dark magic'
  },
  dazed: {
    prompt: 'Swirling stars and confusion effects, ethereal daze, a mind lost in fog, disorienting magical state'
  },
  burn: {
    prompt: 'A persistent cursed magical flame hovering in darkness, embers that never die, eternal fire curse, unquenchable'
  },
  slimed: {
    prompt: 'Thick green acidic slime coating over armor, heavy and useless, corrosive magical ooze, hindering substance'
  },
  void: {
    prompt: 'A void of absolute nothingness, unplayable emptiness, ethereal black hole consuming energy and hope'
  },
  curse_pain: {
    prompt: 'A cursed dark thorn vine wrapped around a glowing crystal heart, unplayable dark magic, thorns dripping shadow'
  },
  curse_regret: {
    prompt: 'A mirror showing ghostly past failures, cursed reflection, haunting memories made visible, regret personified'
  },
  curse_doubt: {
    prompt: 'A cursed eye spreading uncertainty, doubt made manifest as dark magic, wavering shadowy aura'
  },
  curse_decay: {
    prompt: 'Rotting corruption spreading from a cursed mark, decay consuming everything, ethereal decomposition'
  },

  // === ADDITIONAL CARDS (upgraded variants and extras) ===
  severSoul: {
    prompt: 'A dark ethereal blade with a ghostly soul energy being separated from it, wisps of spirit energy floating away, soul magic'
  },
  darkShackles: {
    prompt: 'Heavy shadow chains and dark magical shackles floating in darkness, weakening aura emanating, restraint magic'
  },
  burningPact: {
    prompt: 'A flaming scroll contract with arcane symbols, fire consuming old pages while new ones appear, pact with fire'
  },
  bloodForBlood: {
    prompt: 'A dark ceremonial blade on an altar with decreasing crimson candles around it, each flame smaller, reducing cost runes'
  },
  fireBreath: {
    prompt: 'A warrior with draconic features exhaling a cone of magical flame, dragon breath power, fiery aura surrounding them'
  },
  infernalStrike: {
    prompt: 'A sword wreathed in hellfire held aloft, infernal energy radiating outward, demonic blade glowing with power'
  },
  flameStrike: {
    prompt: 'A massive fire-enchanted greatsword with flame trail arcing through the air, scorching energy radiating'
  },
  evolvedRage: {
    prompt: 'Transcendent rage energy evolving beyond normal fury, layered auras of red and gold power, ascended wrath'
  },
  demonStrike: {
    prompt: 'A partially transformed warriors demonic clawed hand crackling with dark energy, shadow flames around the arm'
  },
  combust_plus: {
    prompt: 'Enhanced internal combustion, greater flames erupting from within a warriors armor, intensified living furnace'
  },
  doubleTapPlus: {
    prompt: 'Triple afterimages of a warrior in sequence, enhanced temporal echo effect, perfected time-doubling aura'
  },
  seeingRedPlus: {
    prompt: 'Eyes burning completely crimson, maximum fury energy gain, enhanced rage state, power overflowing'
  },
  sentinel_plus: {
    prompt: 'An enhanced guardian with doubled shield aura, stronger protective stance, empowered sentinel form'
  },
  rupturePlus: {
    prompt: 'More powerful energy-to-strength conversion, greater rupture effect, enhanced transformation glow'
  },
  warcryPlus: {
    prompt: 'An enhanced rallying shout shaking the earth, stronger energy pulse radiating outward, empowered voice'
  }
};

// ============================================
// ENEMY PROMPTS - Dark Fantasy Theme
// ============================================

const ENEMY_PROMPTS = {
  // === ACT 1 ===
  cultist: {
    prompt: 'A hooded cultist with glowing purple ritual marks on face, building dark power each turn, sinister ceremonial robes'
  },
  jawWorm: {
    prompt: 'A massive segmented worm with razor-sharp mandibles, burrowing from dark earth, armored carapace sections'
  },
  louse_red: {
    prompt: 'A giant aggressive red parasitic louse with armored shell, sharp pincers, curling defensively, insectoid horror'
  },
  louse_green: {
    prompt: 'A bloated green parasitic louse oozing toxic fluid, weakening aura, sickly bioluminescent segments'
  },
  slime_small: {
    prompt: 'A small translucent acidic slime creature, simple but corrosive, gelatinous body with visible bones inside'
  },
  slime_medium: {
    prompt: 'A medium green slime pulsating with absorbed matter, about to split, multiple dark nuclei visible inside'
  },
  slime_large: {
    prompt: 'A large imposing slime creature towering over the warrior, massive gelatinous body, threatening to divide'
  },
  spike_slime_small: {
    prompt: 'A small blue slime with sharp crystalline spikes protruding, aggressive and toxic, slime applying debuffs'
  },
  spike_slime_medium: {
    prompt: 'A medium spiked slime with longer crystal protrusions, blue acidic body, more dangerous and volatile'
  },
  fungiBeast: {
    prompt: 'A shambling fungal beast covered in toxic spore mushrooms, releasing poisonous clouds, decomposing flesh host'
  },
  looter: {
    prompt: 'A sneaky masked thief in dark leather, daggers drawn, looking for gold to steal, quick and evasive'
  },
  gremlinNob: {
    prompt: 'A massive muscular gremlin chieftain with a bone club, enraged and powerful, tribal war paint, hulking brute'
  },
  lagavulin: {
    prompt: 'A sleeping ancient stone golem with dormant power, heavy armored shell, devastating once awakened, rune-covered'
  },
  sentryA: {
    prompt: 'A floating magical sentry construct, beam-firing eye, automated dungeon guardian, bronze and crystal construction'
  },

  // === ACT 2 ===
  chosen: {
    prompt: 'A chosen cultist champion with hexing powers, ornate dark robes, glowing third eye, empowered zealot'
  },
  byrd: {
    prompt: 'A large aggressive bird creature with razor talons, flying and swooping, feathered nightmare with flight ability'
  },
  snakePlant: {
    prompt: 'A carnivorous plant with snake-like vines, venomous thorns, writhing tendrils, dark forest predator'
  },
  centurion: {
    prompt: 'An undead Roman centurion in corroded bronze armor, shield wall stance, protecting allies, ghostly legion warrior'
  },
  bookOfStabbing: {
    prompt: 'A malevolent floating tome with razor-sharp pages, attacking relentlessly, eldritch book creature, multi-attack'
  },
  gremlinLeader: {
    prompt: 'A cunning gremlin leader commanding lesser gremlins, crown of teeth, tactical intelligence, summoning minions'
  },
  slaverBlue: {
    prompt: 'A cruel slaver with a barbed whip, blue-tinged skin, applying weakness and dealing damage, sadistic warrior'
  },

  // === ACT 3 ===
  writhing_mass: {
    prompt: 'An amorphous writhing mass of tentacles and eyes, unpredictable attacks, eldritch horror constantly shifting form'
  },
  giant_head: {
    prompt: 'An enormous floating stone head with glowing eyes, counting down to devastating attack, ancient and implacable'
  },
  reptomancer: {
    prompt: 'A reptilian sorcerer summoning dagger minions, scaled skin, staff of serpents, dark ritual magic'
  },
  dagger: {
    prompt: 'A small animated flying dagger, summoned minion creature, magical blade with its own malevolent will'
  },
  orbWalker: {
    prompt: 'A tall slender construct walking on stilts with a glowing orb core, energy beam attacks, mechanical horror'
  },
  spiker: {
    prompt: 'A defensive creature covered in retractable spines, dealing thorns damage when attacked, armored hedgehog beast'
  },

  // === BOSSES ===
  slimeBoss: {
    prompt: 'A colossal slime boss filling the chamber, splitting into smaller slimes, massive gelatinous titan, dungeon boss'
  },
  theGuardian: {
    prompt: 'A massive mechanical guardian construct, switching between offensive and defensive modes, ancient dungeon protector'
  },
  hexaghost: {
    prompt: 'A spectral entity with six orbiting ghost flames, building to devastating fire attack, haunted boss creature'
  },
  theChamp: {
    prompt: 'A veteran arena champion warrior, switching between tactical and berserk phases, scarred and powerful fighter'
  },
  awakened_one: {
    prompt: 'A dark entity in first form with bird-like features, then awakening into a devastating second phase, two-form boss'
  },
  timeEater: {
    prompt: 'A time-devouring entity punishing rapid play, clock motifs embedded in eldritch flesh, temporal horror'
  },
  corruptHeart: {
    prompt: 'The corrupt heart of the spire itself, massive pulsating organ with invulnerable shield, final boss entity, cosmic horror'
  }
};

// ============================================
// RELIC PROMPTS - Dark Fantasy Theme
// ============================================

const RELIC_PROMPTS = {
  // === STARTER ===
  burning_blood: {
    prompt: 'A vial of eternally burning blood, crimson flames licking around the container, healing warmth at combat end'
  },

  // === COMMON ===
  anchor: {
    prompt: 'A heavy iron anchor etched with protective runes, providing starting block, weathered by ocean and magic'
  },
  bag_of_preparation: {
    prompt: 'An enchanted leather satchel overflowing with scrolls, extra cards drawn at combat start, magical preparation'
  },
  blood_vial: {
    prompt: 'A crystal vial filled with restorative blood, slight healing at combat start, dark red liquid with a faint glow'
  },
  bronze_scales: {
    prompt: 'Overlapping bronze dragon scales formed into an ornate bracer, reflective metallic surface, protective draconic armor piece'
  },
  centennial_puzzle: {
    prompt: 'An ancient puzzle box with a hundred faces, draws cards when first hurt, intricate mechanical artifact'
  },
  lantern: {
    prompt: 'A flickering lantern with an eternal blue flame, granting extra energy on first turn, mystical light'
  },
  nunchaku: {
    prompt: 'Battle-worn nunchaku wrapped in enchanted cloth, building energy through attack combos, martial weapon'
  },
  oddly_smooth_stone: {
    prompt: 'A perfectly smooth river stone with impossible polish, granting dexterity, unnaturally perfect surface'
  },
  orichalcum: {
    prompt: 'A chunk of mythical orichalcum ore glowing amber, providing block when undefended, ancient metal'
  },
  pen_nib: {
    prompt: 'A quill pen nib stained with ink and blood, every tenth attack dealing double damage, counting scratches on it'
  },
  vajra: {
    prompt: 'A diamond-hard vajra thunderbolt weapon, granting starting strength, crackling with contained lightning'
  },
  red_skull: {
    prompt: 'A small red crystalline skull glowing when HP is low, granting strength in desperation, dark gem carving'
  },
  bag_of_marbles: {
    prompt: 'A pouch of enchanted glass marbles, applying vulnerability to all enemies at combat start, scattered light'
  },

  // === UNCOMMON ===
  blue_candle: {
    prompt: 'A blue wax candle with an ethereal flame, allowing curses to be played and burned away, ghostly light'
  },
  bottled_flame: {
    prompt: 'A glass bottle containing a captured flame spirit, ensuring an attack in starting hand, fire trapped in glass'
  },
  eternal_feather: {
    prompt: 'A golden feather that never decays, healing at rest based on deck size, pristine angelic plumage'
  },
  horn_cleat: {
    prompt: 'A nautical horn cleat wrapped in enchanted rope, granting block on second turn, maritime artifact'
  },
  kunai: {
    prompt: 'A razor-sharp throwing kunai with a poison edge, gaining dexterity from attack combos, ninja weapon'
  },
  letter_opener: {
    prompt: 'An ornate silver letter opener with a cruel edge, dealing damage through skill combos, aristocratic weapon'
  },
  meat_on_the_bone: {
    prompt: 'A mystical bone with regenerating meat, healing when low HP after combat, cursed sustenance'
  },
  mercury_hourglass: {
    prompt: 'An ornate hourglass filled with flowing liquid mercury instead of sand, silver drops falling, time-themed artifact'
  },
  ornamental_fan: {
    prompt: 'A decorative combat fan with hidden blades, gaining block from attack combos, eastern weapon art'
  },
  paper_phrog: {
    prompt: 'A paper origami frog with magical properties, increasing vulnerable damage, enchanted paper charm'
  },
  self_forming_clay: {
    prompt: 'Living clay that reshapes itself into armor when hurt, gaining block after HP loss, adaptive material'
  },
  shuriken: {
    prompt: 'A star-shaped throwing blade glowing with ki energy, gaining strength from attack combos, ninja star'
  },
  singing_bowl: {
    prompt: 'A bronze singing bowl resonating with healing frequency, offering max HP instead of cards, vibrating artifact'
  },
  strike_dummy: {
    prompt: 'A battered training dummy with glowing strike points, boosting strike card damage, practice target'
  },
  torii: {
    prompt: 'A miniature sacred torii gate, reducing small amounts of incoming damage, protective shrine artifact'
  },

  // === RARE ===
  calipers: {
    prompt: 'Enchanted measuring calipers that preserve block between turns, precision instrument with rune markings'
  },
  dead_branch: {
    prompt: 'A withered branch from a dead world-tree, generating random cards when exhausting, necromantic wood'
  },
  du_vu_doll: {
    prompt: 'A small cloth effigy doll with glowing rune stitching, gaining power from dark magic, curse-empowered artifact'
  },
  girya: {
    prompt: 'A heavy kettlebell weight inscribed with strength runes, trainable at rest sites, iron exercise weight'
  },
  ice_cream: {
    prompt: 'A never-melting ice cream in a dark cone, conserving energy between turns, frozen magical treat'
  },
  incense_burner: {
    prompt: 'An ornate incense burner with swirling sacred smoke, granting intangible every six turns, holy artifact'
  },
  lizard_tail: {
    prompt: 'A glowing green lizard tail with regenerative magic emanating, regrowth energy swirling, reptilian renewal artifact'
  },
  magic_flower: {
    prompt: 'A luminous magical flower blooming with healing energy, boosting all healing effects, enchanted blossom'
  },
  mango: {
    prompt: 'A golden mango fruit radiating vitality, permanently raising max HP on pickup, divine fruit'
  },
  tungsten_rod: {
    prompt: 'A heavy tungsten rod absorbing impact, reducing all HP loss by one, dense protective metal bar'
  },

  // === BOSS ===
  black_star: {
    prompt: 'A black crystalline star absorbing light, doubling elite relic drops, void-touched cosmic gem'
  },
  coffee_dripper: {
    prompt: 'A magical coffee dripper endlessly brewing dark liquid, extra energy but no resting, cursed caffeine'
  },
  cursed_key: {
    prompt: 'An ornate skeleton key wrapped in cursed chains, extra energy but cursed chests, double-edged artifact'
  },
  ectoplasm: {
    prompt: 'A jar of glowing green ectoplasm, extra energy but no gold gain, ghostly restrictive substance'
  },
  runic_dome: {
    prompt: 'A miniature dome covered in ancient runes, extra energy but hidden enemy intents, sealed knowledge'
  },
  snecko_eye: {
    prompt: 'A preserved snecko eye in amber, drawing extra cards but randomizing costs, chaotic reptilian artifact'
  },
  sozu: {
    prompt: 'A traditional sozu water feature cursed with dark magic, extra energy but no potions, restrictive artifact'
  },
  velvet_choker: {
    prompt: 'A tight black velvet choker with a dark gem, extra energy but limiting card plays per turn, constricting'
  },

  // === SHOP ===
  membership_card: {
    prompt: 'A worn merchants guild membership card with a gold seal, shop discount artifact, trade privilege'
  },
  orange_pellets: {
    prompt: 'A bottle of glowing orange medicinal pellets, removing debuffs when all card types played, alchemical cure'
  }
};

// ============================================
// POTION PROMPTS - Dark Fantasy Theme
// ============================================

const POTION_PROMPTS = {
  fire_potion: {
    prompt: 'A round flask filled with swirling liquid fire, orange and red flames visible inside glass, cork stopper, explosive'
  },
  block_potion: {
    prompt: 'A stout blue bottle with thick silver liquid, shimmering defensive aura, heavy and protective, ice-blue glow'
  },
  energy_potion: {
    prompt: 'A tall vial of crackling yellow-white lightning liquid, pure energy contained, electric sparks escaping the cork'
  },
  explosive_potion: {
    prompt: 'A round flask with volatile swirling red-orange alchemical mixture, bubbling intensely, radiant energy potion'
  },
  weak_potion: {
    prompt: 'A thin flask of murky green dripping liquid, sapping aura, debilitating alchemical brew, swirling contents'
  },
  health_potion: {
    prompt: 'A heart-shaped bottle of rich crimson healing elixir, warm red glow, restorative blood-red liquid, golden stopper'
  },
  strength_potion: {
    prompt: 'A muscular-shaped bottle of deep red power liquid, veins of energy visible inside, raw strength essence'
  },
  dexterity_potion: {
    prompt: 'A sleek elongated flask of swirling green agility liquid, fluid and graceful, speed essence, emerald glow'
  },
  speed_potion: {
    prompt: 'A streamlined vial of quicksilver-blue rushing liquid, motion blur on the contents, haste and card draw'
  },
  fear_potion: {
    prompt: 'A dark purple bottle with swirling shadow faces visible in the mist inside, unsettling aura, vulnerability elixir'
  },
  fairy_potion: {
    prompt: 'A small bottle with a trapped fairy spirit glowing inside, revival magic, golden light, tiny wings visible'
  },
  cultist_potion: {
    prompt: 'A chalice-shaped vessel of swirling dark purple arcane liquid, extreme power boost, concentrated ritual energy'
  },
  duplication_potion: {
    prompt: 'A bottle containing a mirror-like reflective liquid, showing doubles of everything nearby, copy magic'
  },
  essence_of_steel: {
    prompt: 'A flask of liquid metal, steel essence that hardens into plated armor, silvery and impossibly dense'
  },
  heart_of_iron: {
    prompt: 'A heart-shaped iron container with molten metal inside, granting metallicize, core of a construct'
  }
};

// ============================================
// UTILITIES
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadProgress() {
  try {
    if (fs.existsSync(CONFIG.progressFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf8'));
    }
  } catch (e) {
    console.log('Could not load progress file, starting fresh');
  }
  return { completed: [], failed: [], lastRun: null };
}

function saveProgress(progress) {
  progress.lastRun = new Date().toISOString();
  fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getOutputSubdir(type) {
  switch (type) {
    case 'card': return 'cards';
    case 'enemy': return 'enemies';
    case 'relic': return 'relics';
    case 'potion': return 'potions';
    default: return type + 's';
  }
}

// ============================================
// IMAGE GENERATION
// ============================================

async function generateImage(openai, prompt, type, id, options = {}) {
  const fullPrompt = `${prompt}, ${STYLE_BASE}, ${CATEGORY_STYLE[type]}`;

  console.log(`\n[${type}/${id}] Generating...`);
  if (options.dryRun) {
    console.log(`  Prompt: ${fullPrompt.substring(0, 120)}...`);
    console.log(`  Size: ${CONFIG.size}`);
    return { success: true, dryRun: true };
  }

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: CONFIG.model,
        prompt: fullPrompt,
        n: 1,
        size: CONFIG.size,
        quality: options.quality || CONFIG.quality,
      });

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      // Download and save
      const outputDir = path.join(CONFIG.outputDir, getOutputSubdir(type));
      ensureDir(outputDir);

      const filepath = path.join(outputDir, `${id}.png`);
      await downloadImage(imageUrl, filepath);

      console.log(`  Saved: ${filepath}`);
      if (revisedPrompt && revisedPrompt !== fullPrompt) {
        console.log(`  Note: DALL-E revised the prompt`);
      }

      return { success: true, filepath, revisedPrompt };

    } catch (error) {
      console.error(`  Attempt ${attempt}/${CONFIG.maxRetries} ERROR: ${error.message}`);
      if (error.code === 'content_policy_violation') {
        console.error(`  Content policy violation - skipping`);
        return { success: false, error: error.message };
      }
      if (attempt < CONFIG.maxRetries) {
        const backoff = attempt * 2000;
        console.log(`  Retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const options = {
    type: 'all',
    dryRun: args.includes('--dry-run'),
    skipExisting: args.includes('--skip-existing'),
    quality: 'standard',
    only: null,
    start: null,
  };

  args.forEach(arg => {
    if (arg.startsWith('--type=')) options.type = arg.split('=')[1];
    if (arg.startsWith('--quality=')) options.quality = arg.split('=')[1];
    if (arg.startsWith('--only=')) options.only = arg.split('=')[1].split(',');
    if (arg.startsWith('--start=')) options.start = arg.split('=')[1];
  });

  if (!process.env.OPENAI_API_KEY && !options.dryRun) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    console.error('Usage: OPENAI_API_KEY=your_key node scripts/generate-images.js [options]');
    process.exit(1);
  }

  const openai = options.dryRun ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log('='.repeat(60));
  console.log('SPIRE ASCENT - DARK FANTASY ART GENERATOR');
  console.log('='.repeat(60));
  console.log(`Type: ${options.type}`);
  console.log(`Quality: ${options.quality} ($${options.quality === 'hd' ? '0.08' : '0.04'}/image)`);
  console.log(`Dry run: ${options.dryRun}`);
  console.log(`Skip existing: ${options.skipExisting}`);
  if (options.only) console.log(`Only: ${options.only.join(', ')}`);
  if (options.start) console.log(`Starting from: ${options.start}`);
  console.log('='.repeat(60));

  const progress = loadProgress();
  console.log(`\nPreviously completed: ${progress.completed.length} images`);

  // Build generation queue
  const queue = [];

  const shouldGenerate = (type, id) => {
    const key = `${type}/${id}`;
    if (progress.completed.includes(key)) return false;
    if (options.only && !options.only.includes(id)) return false;
    if (options.skipExisting) {
      const dir = path.join(CONFIG.outputDir, getOutputSubdir(type));
      const extensions = ['.png', '.webp', '.jpg'];
      for (const ext of extensions) {
        if (fs.existsSync(path.join(dir, `${id}${ext}`))) return false;
      }
    }
    return true;
  };

  let startFound = !options.start;

  const promptSets = {
    cards: { prompts: CARD_PROMPTS, type: 'card' },
    enemies: { prompts: ENEMY_PROMPTS, type: 'enemy' },
    relics: { prompts: RELIC_PROMPTS, type: 'relic' },
    potions: { prompts: POTION_PROMPTS, type: 'potion' },
  };

  for (const [setName, { prompts, type }] of Object.entries(promptSets)) {
    if (options.type !== 'all' && options.type !== setName) continue;

    Object.entries(prompts).forEach(([id, data]) => {
      if (!startFound && id === options.start) startFound = true;
      if (startFound && shouldGenerate(type, id)) {
        queue.push({ type, id, prompt: data.prompt });
      }
    });
  }

  console.log(`\nImages to generate: ${queue.length}`);

  if (queue.length === 0) {
    console.log('Nothing to generate! All images exist or are completed.');
    return;
  }

  const costPerImage = options.quality === 'hd' ? 0.08 : 0.04;
  const estimatedCost = queue.length * costPerImage;
  console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);
  console.log(`\nBreakdown:`);
  console.log(`  Cards:   ${queue.filter(q => q.type === 'card').length}`);
  console.log(`  Enemies: ${queue.filter(q => q.type === 'enemy').length}`);
  console.log(`  Relics:  ${queue.filter(q => q.type === 'relic').length}`);
  console.log(`  Potions: ${queue.filter(q => q.type === 'potion').length}`);

  if (!options.dryRun) {
    console.log('\nStarting generation in 3 seconds... (Ctrl+C to cancel)');
    await sleep(3000);
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    console.log(`\n[${i + 1}/${queue.length}]`);

    const result = await generateImage(openai, item.prompt, item.type, item.id, options);

    const key = `${item.type}/${item.id}`;
    if (result.success) {
      successCount++;
      if (!options.dryRun) {
        progress.completed.push(key);
        progress.failed = progress.failed.filter(f => f !== key);
      }
    } else {
      failCount++;
      if (!options.dryRun && !progress.failed.includes(key)) {
        progress.failed.push(key);
      }
    }

    if (!options.dryRun) {
      saveProgress(progress);
    }

    if (i < queue.length - 1 && !options.dryRun) {
      await sleep(CONFIG.rateLimitDelay);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total completed: ${progress.completed.length}`);

  if (progress.failed.length > 0) {
    console.log(`\nFailed images (retry with --only=id1,id2):`);
    progress.failed.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
