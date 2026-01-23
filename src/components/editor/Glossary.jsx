import { useState } from 'react';

const SECTIONS = ['Card Effects', 'Card Specials', 'Relic Triggers', 'Relic Effects', 'Enemy Specials', 'AI Patterns'];

const CARD_EFFECTS = [
  { name: 'vulnerable', desc: 'Target takes 50% more damage from attacks for X turns.' },
  { name: 'weak', desc: 'Target deals 25% less attack damage for X turns.' },
  { name: 'frail', desc: 'Target gains 25% less block from cards for X turns.' },
  { name: 'strength', desc: 'Increases attack damage by X. If "self" is checked, applies to player; otherwise to enemy.' },
  { name: 'dexterity', desc: 'Increases block gained from cards by X.' },
  { name: 'artifact', desc: 'Negates the next X debuffs applied.' },
  { name: 'intangible', desc: 'Reduces all damage and HP loss to 1 for X turns.' },
  { name: 'thorns', desc: 'Deals X damage back to any attacker.' },
  { name: 'metallicize', desc: 'Gain X block at the end of each turn.' },
  { name: 'platedArmor', desc: 'Gain X block at end of turn. Decreases by 1 when taking unblocked damage.' },
  { name: 'regen', desc: 'Heal X HP at end of turn. Decreases by 1 each turn.' },
  { name: 'draw', desc: 'Draw X additional cards.' },
  { name: 'energy', desc: 'Gain X energy this turn.' },
  { name: 'heal', desc: 'Restore X HP.' }
];

const CARD_SPECIALS = [
  { name: 'addCopyToDiscard', desc: 'Adds a copy of this card to the discard pile when played.' },
  { name: 'discardToDrawTop', desc: 'Choose a card from discard pile to put on top of draw pile.' },
  { name: 'addWound', desc: 'Adds Wound status cards to your discard pile.' },
  { name: 'damageEqualBlock', desc: 'Deals damage equal to your current block.' },
  { name: 'onlyAttacks', desc: 'Can only be played if every card in hand is an Attack.' },
  { name: 'upgradeInHand', desc: 'Upgrade a card in your hand (or all cards if upgraded version).' },
  { name: 'flexStrength', desc: 'Gain temporary Strength that is lost at end of turn.' },
  { name: 'playTopCard', desc: 'Play the top card of your draw pile automatically.' },
  { name: 'exhaustRandom', desc: 'Exhaust a random card from your hand.' },
  { name: 'exhaustChoose', desc: 'Choose a card from your hand to exhaust.' },
  { name: 'handToDrawTop', desc: 'Put a card from your hand on top of your draw pile.' },
  { name: 'gainEnergyOnExhaust', desc: 'If this card is exhausted, gain 2 Energy.' },
  { name: 'gainEnergyOnExhaust3', desc: 'If this card is exhausted, gain 3 Energy.' },
  { name: 'hpForEnergy', desc: 'Lose HP to gain Energy.' },
  { name: 'bonusIfVulnerable', desc: 'If enemy is Vulnerable, gain bonus Energy and draw a card.' },
  { name: 'escalatingDamage', desc: 'Damage increases by 5 each time this card is played this combat.' },
  { name: 'escalatingDamage8', desc: 'Damage increases by 8 each time played (upgraded).' },
  { name: 'addDaze', desc: 'Add Daze status cards to the discard pile.' },
  { name: 'xCost', desc: 'Uses all remaining energy. Effect scales with energy spent.' },
  { name: 'multiUpgrade', desc: 'Can be upgraded multiple times, increasing damage each time.' },
  { name: 'bonusPerStrike', desc: 'Deals +2 damage for each "Strike" card in your deck.' },
  { name: 'bonusPerStrike3', desc: 'Deals +3 damage for each "Strike" card in your deck (upgraded).' },
  { name: 'cantDraw', desc: 'You cannot draw any cards next turn.' },
  { name: 'removeStrength', desc: 'Enemy loses X Strength. Exhaust.' },
  { name: 'copyCardInHand', desc: 'Choose an Attack or Power card in hand to make a copy of.' },
  { name: 'doubleBlock', desc: 'Double your current block.' },
  { name: 'retaliateOnHit', desc: 'Whenever you are attacked this turn, deal damage back.' },
  { name: 'addRandomAttack', desc: 'Add a random Attack card to your hand.' },
  { name: 'addWoundsToHand', desc: 'Add Wound cards to your hand.' },
  { name: 'blockPerAttack', desc: 'Gain X block whenever you play an Attack this turn.' },
  { name: 'exhaustNonAttacksBlock', desc: 'Exhaust all non-Attack cards, gain block for each.' },
  { name: 'strIfAttacking', desc: 'If enemy intends to attack, gain Strength.' },
  { name: 'killForMaxHp', desc: 'If this kills an enemy, gain max HP.' },
  { name: 'exhaustHandDamage', desc: 'Exhaust all cards in hand, deal damage for each card exhausted.' },
  { name: 'addBurn', desc: 'Add Burn status cards to discard pile.' },
  { name: 'lifesteal', desc: 'Heal HP equal to unblocked damage dealt.' },
  { name: 'doubleNextAttack', desc: 'Your next Attack this turn is played twice.' },
  { name: 'doubleNextAttacks2', desc: 'Your next 2 Attacks this turn are played twice (upgraded).' },
  { name: 'retrieveExhausted', desc: 'Choose a card from exhaust pile to put in your hand.' },
  { name: 'doubleStrength', desc: 'Double your current Strength.' },
  { name: 'retainAllBlock', desc: 'Block is no longer removed at the start of your turn (Power).' },
  { name: 'selfVulnForEnergy', desc: 'Gain Vulnerable on self. Gain 1 extra Energy each turn (Power).' },
  { name: 'hpForDraw', desc: 'At the start of each turn, lose 1 HP and draw 1 card (Power).' },
  { name: 'hpForAoeDamage', desc: 'At end of turn, lose 1 HP and deal damage to ALL enemies (Power).' },
  { name: 'freeSkillsExhaust', desc: 'Skills cost 0 but are Exhausted when played (Power).' },
  { name: 'drawOnExhaust', desc: 'Whenever a card is Exhausted, draw 1 card (Power).' },
  { name: 'strengthEachTurn', desc: 'Gain X Strength at the start of each turn (Power).' },
  { name: 'drawOnStatus', desc: 'Whenever you draw a Status card, draw X cards (Power).' },
  { name: 'blockOnExhaust', desc: 'Whenever a card is Exhausted, gain X Block (Power).' },
  { name: 'aoeOnStatus', desc: 'Whenever you draw a Status or Curse, deal damage to ALL enemies (Power).' },
  { name: 'damageOnBlock', desc: 'Whenever you gain Block, deal X damage to a random enemy (Power).' },
  { name: 'metallicize', desc: 'Gain X Block at the end of each turn (Power, same as effect).' },
  { name: 'strengthOnSelfHpLoss', desc: 'Whenever you lose HP from a card, gain Strength (Power).' },
  { name: 'burnDamage', desc: 'Unplayable. At end of turn, take X damage (Burn status).' },
  { name: 'voidCard', desc: 'Unplayable. When drawn, lose 1 Energy (Void status).' },
  { name: 'painCurse', desc: 'Unplayable. Whenever you play a card, lose 1 HP.' },
  { name: 'regretCurse', desc: 'Unplayable. At end of turn, lose HP equal to cards in hand.' },
  { name: 'doubtCurse', desc: 'Unplayable. At end of turn, gain 1 Weak.' },
  { name: 'decayCurse', desc: 'Unplayable. At end of turn, take 2 damage.' }
];

const RELIC_TRIGGERS = [
  { name: 'onCombatStart', desc: 'Activates when combat begins.' },
  { name: 'onCombatEnd', desc: 'Activates when combat is won.' },
  { name: 'onTurnStart', desc: 'Activates at the start of each player turn.' },
  { name: 'onTurnEnd', desc: 'Activates at the end of each player turn.' },
  { name: 'onAttackPlayed', desc: 'Activates whenever an Attack card is played.' },
  { name: 'onSkillPlayed', desc: 'Activates whenever a Skill card is played.' },
  { name: 'onStrikePlayed', desc: 'Activates whenever a Strike card is played.' },
  { name: 'onFirstHpLoss', desc: 'Activates the first time you lose HP each combat.' },
  { name: 'onFirstTurn', desc: 'Activates on the first turn of combat only.' },
  { name: 'onHpLoss', desc: 'Activates every time you lose HP.' },
  { name: 'onDamageTaken', desc: 'Activates when you take attack damage.' },
  { name: 'onDamageReceived', desc: 'Activates after damage is applied.' },
  { name: 'onDeath', desc: 'Activates when you would die (can prevent death).' },
  { name: 'onExhaust', desc: 'Activates whenever a card is exhausted.' },
  { name: 'onCardReward', desc: 'Activates when card rewards are offered.' },
  { name: 'onRest', desc: 'Activates when you rest at a campfire.' },
  { name: 'onPickup', desc: 'Activates once when the relic is first obtained.' },
  { name: 'passive', desc: 'Always active, modifies game rules (energy, draw, etc).' }
];

const RELIC_EFFECTS = [
  { name: 'block', desc: 'Gain X Block.' },
  { name: 'heal', desc: 'Heal X HP.' },
  { name: 'draw', desc: 'Draw X cards.' },
  { name: 'energy', desc: 'Gain X Energy.' },
  { name: 'strength', desc: 'Gain X Strength.' },
  { name: 'dexterity', desc: 'Gain X Dexterity.' },
  { name: 'thorns', desc: 'Deal X damage back when hit.' },
  { name: 'vulnerable', desc: 'Apply X Vulnerable (to enemies if targetAll checked).' },
  { name: 'doubleDamage', desc: 'Next attack deals double damage (Pen Nib - every 10th attack).' },
  { name: 'blockIfNone', desc: 'Gain X Block if you have no Block (Orichalcum).' },
  { name: 'strengthIfLowHp', desc: 'Gain X Strength if HP is below threshold % (Red Skull).' },
  { name: 'playCurses', desc: 'Curse cards can be played (Blue Candle).' },
  { name: 'drawSpecific', desc: 'Draw a specific card type at start of combat.' },
  { name: 'healPerCards', desc: 'Heal X HP per Y cards in deck on rest.' },
  { name: 'damageAll', desc: 'Deal X damage to ALL enemies.' },
  { name: 'healIfLowHp', desc: 'Heal X if HP drops below threshold % (Meat on the Bone).' },
  { name: 'blockNextTurn', desc: 'Gain X Block next turn when hit (Self-Forming Clay).' },
  { name: 'vulnerableBonus', desc: 'Vulnerable makes enemies take X% more damage (Paper Phrog).' },
  { name: 'reduceLowDamage', desc: 'Reduce damage to 1 if it\'s X or less (Torii).' },
  { name: 'retainBlock', desc: 'Keep up to X Block between turns (Calipers).' },
  { name: 'addRandomCard', desc: 'Add a random card to hand when a card is exhausted (Dead Branch).' },
  { name: 'strengthPerCurse', desc: 'Gain X Strength per Curse in deck (Du-Vu Doll).' },
  { name: 'strengthOption', desc: 'Option to gain X Strength when resting (Girya).' },
  { name: 'conserveEnergy', desc: 'Unspent Energy carries over to next turn (Ice Cream).' },
  { name: 'intangible', desc: 'Gain Intangible for X turn(s) (Incense Burner - every 6 turns).' },
  { name: 'revive', desc: 'When you die, heal to X% of max HP instead (Lizard Tail).' },
  { name: 'healingBonus', desc: 'All healing increased by X% (Magic Flower).' },
  { name: 'maxHp', desc: 'Increase max HP by X on pickup (Mango).' },
  { name: 'reduceHpLoss', desc: 'All HP loss reduced by X (Tungsten Rod).' },
  { name: 'doubleEliteRelics', desc: 'Elite enemies drop an extra relic (Black Star).' },
  { name: 'energyBonus', desc: 'Gain X extra energy each turn (Boss relics - has drawback flags).' },
  { name: 'drawBonus', desc: 'Draw X extra cards each turn. Confused flag randomizes costs.' },
  { name: 'shopDiscount', desc: 'Shop prices reduced by X% (Membership Card).' },
  { name: 'removeDebuffsIfAllTypes', desc: 'Remove all debuffs when you play Attack+Skill+Power in one turn (Orange Pellets).' },
  { name: 'damage', desc: 'Deal X damage (Strike Dummy - bonus per Strike in deck).' },
  { name: 'maxHpOption', desc: 'Option to gain max HP at card reward (Singing Bowl).' }
];

const ENEMY_SPECIALS = [
  { name: 'addSlimed', desc: 'Adds Slimed status cards to your discard pile.' },
  { name: 'splitMedium', desc: 'Medium Slime splits into two Small Slimes when low HP.' },
  { name: 'splitBoss', desc: 'Slime Boss splits into two Medium Slimes at half HP.' },
  { name: 'stealGold', desc: 'Steals gold from the player (Looter).' },
  { name: 'escape', desc: 'Enemy flees from combat (Looter smoke bomb).' },
  { name: 'addDazed', desc: 'Adds Daze status cards to your discard pile (Sentry).' },
  { name: 'addHex', desc: 'Adds Void/Daze to your draw pile when you play non-Attacks.' },
  { name: 'gainFlight', desc: 'Enemy gains Flight (takes reduced damage, removed when hit enough).' },
  { name: 'addStab', desc: 'Adds Wound cards on multi-hit attack (Book of Stabbing).' },
  { name: 'buffGremlins', desc: 'Gives all Gremlin allies Strength (Gremlin Leader).' },
  { name: 'summonGremlins', desc: 'Spawns new Gremlin minions (Gremlin Leader).' },
  { name: 'addParasite', desc: 'Adds a Parasite curse card to your deck.' },
  { name: 'count', desc: 'Counts up each turn, does big damage when reaching threshold (Giant Head).' },
  { name: 'summonDaggers', desc: 'Spawns Dagger minions (Reptomancer).' },
  { name: 'killSelf', desc: 'Enemy dies after using this move (Exploder/Dagger).' },
  { name: 'addBurn', desc: 'Adds Burn status cards to your discard pile.' },
  { name: 'addBurns', desc: 'Adds multiple Burn cards (Hexaghost Inferno).' },
  { name: 'modeShift', desc: 'Enemy switches between offensive/defensive modes (Guardian).' },
  { name: 'activate', desc: 'Hexaghost powers up on first turn.' },
  { name: 'divider', desc: 'Deals damage equal to current HP divided across hits (Hexaghost).' },
  { name: 'upgradeBurn', desc: 'Upgrades all Burn cards in your deck to deal more damage.' },
  { name: 'removeDebuffs', desc: 'Removes all debuffs from self (The Champ/Time Eater).' },
  { name: 'rebirth', desc: 'Enemy resurrects in a new form (Awakened One phase 2).' },
  { name: 'bloodShots', desc: 'Multi-hit attack that scales (Corrupt Heart).' },
  { name: 'addStatus', desc: 'Adds random Status cards to your draw pile.' },
  { name: 'beatOfDeath', desc: 'Deals damage to player whenever a card is played (Corrupt Heart passive).' }
];

const AI_PATTERNS = [
  { name: 'sequential', desc: 'Cycles through moves in order: move 1, move 2, move 3, move 1, ...' },
  { name: 'random', desc: 'Picks a completely random move from the moveset each turn.' },
  { name: 'firstThenRandom', desc: 'Always uses the first move on turn 1, then random moves after.' },
  { name: 'weighted', desc: 'Earlier moves in the list are more likely. Avoids repeating the last move used.' },
  { name: 'phaseShift', desc: 'Uses the first half of the moveset for turns 1-3, then switches to the second half.' }
];

const Glossary = () => {
  const [activeSection, setActiveSection] = useState('Card Effects');

  const getEntries = () => {
    switch (activeSection) {
      case 'Card Effects': return CARD_EFFECTS;
      case 'Card Specials': return CARD_SPECIALS;
      case 'Relic Triggers': return RELIC_TRIGGERS;
      case 'Relic Effects': return RELIC_EFFECTS;
      case 'Enemy Specials': return ENEMY_SPECIALS;
      case 'AI Patterns': return AI_PATTERNS;
      default: return [];
    }
  };

  return (
    <div style={styles.container}>
      {/* Section tabs */}
      <div style={styles.sectionTabs}>
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={activeSection === s ? { ...styles.sectionTab, ...styles.sectionTabActive } : styles.sectionTab}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Entries list */}
      <div style={styles.entries}>
        {getEntries().map(entry => (
          <div key={entry.name} style={styles.entry}>
            <code style={styles.entryName}>{entry.name}</code>
            <div style={styles.entryDesc}>{entry.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  sectionTab: {
    background: '#2a2a4a',
    color: '#aaa',
    border: '1px solid #444',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px'
  },
  sectionTabActive: {
    background: '#4466aa',
    color: '#fff',
    borderColor: '#6688cc'
  },
  entries: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  entry: {
    background: '#1e1e3a',
    border: '1px solid #333',
    borderRadius: '5px',
    padding: '8px 10px'
  },
  entryName: {
    color: '#88ccff',
    fontSize: '13px',
    fontFamily: 'monospace'
  },
  entryDesc: {
    color: '#bbb',
    fontSize: '12px',
    marginTop: '3px',
    lineHeight: '1.4'
  }
};

export default Glossary;
