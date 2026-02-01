import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { getRandomCard, RARITY, ALL_CARDS } from '../data/cards';
import { getRandomRelic } from '../data/relics';
import { getEventImage } from '../assets/art/art-config';

const EVENTS = [
  {
    id: 'shrine',
    title: 'Ancient Shrine',
    description: 'You find an ancient shrine glowing with mysterious energy. Whispers of power emanate from within...',
    emoji: '\u26E9\uFE0F',
    color: '#9966cc',
    options: [
      { text: '\uD83D\uDE4F Pray at the shrine', effect: 'random_buff_or_curse' },
      { text: '\uD83D\uDEB6 Leave it be', effect: 'nothing' }
    ]
  },
  {
    id: 'treasure',
    title: 'Treasure Chest',
    description: 'A golden chest sits before you, seemingly unguarded. But is anything truly free in the Spire?',
    emoji: '\uD83D\uDCE6',
    color: '#FFD700',
    options: [
      { text: '\uD83D\uDD13 Open it', effect: 'gold_or_curse' },
      { text: '\uD83D\uDEB6 Walk away', effect: 'nothing' }
    ]
  },
  {
    id: 'merchant',
    title: 'Wandering Merchant',
    description: 'A hooded figure steps from the shadows, offering curious wares. Their eyes gleam with knowing intent.',
    emoji: '\uD83E\uDDD9',
    color: '#44aaaa',
    options: [
      { text: '\uD83D\uDCB0 Trade 50 gold for a relic', effect: 'trade_gold_relic', cost: 50 },
      { text: '\u2764\uFE0F Trade 10 HP for a card', effect: 'trade_hp_card', cost: 10 },
      { text: '\uD83D\uDC4B Decline their offer', effect: 'nothing' }
    ]
  },
  {
    id: 'fountain',
    title: 'Healing Fountain',
    description: 'Crystal clear water flows from an ancient fountain. Its surface glimmers with restorative magic.',
    emoji: '\u26F2',
    color: '#44aaff',
    options: [
      { text: '\uD83D\uDCA7 Drink deeply', effect: 'heal_full' },
      { text: '\uD83D\uDCA6 Take a sip', effect: 'heal_small' }
    ]
  },
  {
    id: 'warrior_tomb',
    title: "Warrior's Tomb",
    description: 'An ancient warrior lies entombed here with their legendary blade. Disturbing the dead has consequences...',
    emoji: '\u26B0\uFE0F',
    color: '#aa6644',
    options: [
      { text: '\uD83D\uDC80 Loot the tomb', effect: 'rare_card_and_curse' },
      { text: '\uD83D\uDE4F Pay respects', effect: 'small_heal' },
      { text: '\uD83D\uDEB6 Leave in peace', effect: 'nothing' }
    ]
  },
  {
    id: 'golden_idol',
    title: 'Golden Idol',
    description: 'A golden idol sits on a pedestal. It looks incredibly valuable, but the room seems trapped...',
    emoji: '\uD83D\uDDFF',
    color: '#ffcc00',
    options: [
      { text: '\uD83E\uDD19 Grab the idol!', effect: 'gold_and_damage' },
      { text: '\uD83D\uDEB6 Not worth the risk', effect: 'nothing' }
    ]
  },
  {
    id: 'upgrade_shrine',
    title: 'Shrine of Order',
    description: 'This shrine pulses with orderly power. Blood sacrifice could channel its energy into your cards.',
    emoji: '\uD83D\uDD25',
    color: '#ff6644',
    options: [
      { text: '\uD83E\uDE78 Sacrifice 15 HP', effect: 'upgrade_random', cost: 15 },
      { text: '\uD83D\uDEB6 Leave', effect: 'nothing' }
    ]
  },
  {
    id: 'mysterious_egg',
    title: 'Mysterious Egg',
    description: 'You find a strange glowing egg emanating warmth. Who knows what power slumbers within?',
    emoji: '\uD83E\uDD5A',
    color: '#ffaa66',
    options: [
      { text: '\uD83E\uDD32 Take the egg', effect: 'max_hp' },
      { text: '\uD83D\uDEB6 Leave it be', effect: 'nothing' }
    ]
  }
];

const EventScreen = () => {
  const { state, skipEvent: _skipEvent, proceedToMap } = useGame();
  const { player, deck, relics } = state;

  const [playerState, setPlayerState] = useState({ ...player });
  const [deckState, setDeckState] = useState([...deck]);
  const [relicState, setRelicState] = useState([...relics]);
  const [result, setResult] = useState(null);

  const event = useMemo(() => {
    return EVENTS[Math.floor(Math.random() * EVENTS.length)];
  }, []);

  const handleOption = (option) => {
    let message = '';
    let newPlayerState = { ...playerState };
    let newDeckState = [...deckState];
    let newRelicState = [...relicState];

    switch (option.effect) {
      case 'nothing':
        message = 'You leave without incident.';
        break;

      case 'random_buff_or_curse':
        if (Math.random() < 0.6) {
          newPlayerState.maxHp += 7;
          newPlayerState.currentHp += 7;
          message = ' The shrine blesses you! +7 Max HP';
        } else {
          const curse = ALL_CARDS.find(c => c.id === 'curse_doubt');
          if (curse) {
            newDeckState.push({ ...curse, instanceId: `curse_${Date.now()}` });
          }
          message = ' The shrine curses you! Gained Doubt.';
        }
        break;

      case 'gold_or_curse':
        if (Math.random() < 0.7) {
          const goldAmount = 50 + Math.floor(Math.random() * 50);
          newPlayerState.gold += goldAmount;
          message = ` You found ${goldAmount} gold!`;
        } else {
          const curse = ALL_CARDS.find(c => c.id === 'curse_regret');
          if (curse) {
            newDeckState.push({ ...curse, instanceId: `curse_${Date.now()}` });
          }
          newPlayerState.currentHp = Math.max(1, newPlayerState.currentHp - 10);
          message = ' The chest was trapped! -10 HP and gained Regret.';
        }
        break;

      case 'trade_gold_relic':
        if (newPlayerState.gold >= option.cost) {
          newPlayerState.gold -= option.cost;
          const relic = getRandomRelic(null, newRelicState.map(r => r.id), state.character);
          if (relic) {
            newRelicState.push(relic);
            message = ` You traded 50 gold for ${relic.name}!`;
          }
        } else {
          message = ' Not enough gold.';
        }
        break;

      case 'trade_hp_card':
        newPlayerState.currentHp = Math.max(1, newPlayerState.currentHp - option.cost);
        const card = getRandomCard(RARITY.UNCOMMON);
        if (card) {
          newDeckState.push({ ...card, instanceId: `event_${card.id}_${Date.now()}` });
          message = ` You traded 10 HP for ${card.name}!`;
        }
        break;

      case 'heal_full':
        const fullHeal = newPlayerState.maxHp - newPlayerState.currentHp;
        newPlayerState.currentHp = newPlayerState.maxHp;
        message = ` You are fully healed! +${fullHeal} HP`;
        break;

      case 'heal_small':
        const smallHeal = Math.floor(newPlayerState.maxHp * 0.25);
        newPlayerState.currentHp = Math.min(newPlayerState.maxHp, newPlayerState.currentHp + smallHeal);
        message = ` You feel refreshed. +${smallHeal} HP`;
        break;

      case 'rare_card_and_curse':
        const rareCard = getRandomCard(RARITY.RARE);
        if (rareCard) {
          newDeckState.push({ ...rareCard, instanceId: `event_${rareCard.id}_${Date.now()}` });
        }
        const curse2 = ALL_CARDS.find(c => c.id === 'curse_pain');
        if (curse2) {
          newDeckState.push({ ...curse2, instanceId: `curse_${Date.now()}` });
        }
        message = ` You obtained ${rareCard?.name || 'a rare card'}, but felt a curse settle upon you.`;
        break;

      case 'small_heal':
        const respHeal = Math.floor(newPlayerState.maxHp * 0.1);
        newPlayerState.currentHp = Math.min(newPlayerState.maxHp, newPlayerState.currentHp + respHeal);
        message = ` The warrior's spirit grants you peace. +${respHeal} HP`;
        break;

      case 'gold_and_damage':
        newPlayerState.gold += 200;
        newPlayerState.currentHp = Math.max(1, newPlayerState.currentHp - 20);
        message = ' You grabbed the idol! +200 gold but -20 HP from the trap!';
        break;

      case 'upgrade_random':
        newPlayerState.currentHp = Math.max(1, newPlayerState.currentHp - option.cost);
        const upgradable = newDeckState.filter(c => !c.upgraded && c.upgradedVersion);
        if (upgradable.length > 0) {
          const toUpgrade = upgradable[Math.floor(Math.random() * upgradable.length)];
          const idx = newDeckState.findIndex(c => c.instanceId === toUpgrade.instanceId);
          if (idx >= 0) {
            newDeckState[idx] = {
              ...toUpgrade,
              ...toUpgrade.upgradedVersion,
              upgraded: true,
              name: toUpgrade.name + '+'
            };
            message = ` Upgraded ${toUpgrade.name}! (-15 HP)`;
          }
        } else {
          message = ' No cards to upgrade. Lost 15 HP for nothing...';
        }
        break;

      case 'max_hp':
        newPlayerState.maxHp += 5;
        newPlayerState.currentHp += 5;
        message = " The egg's warmth fills you with vitality. +5 Max HP";
        break;

      default:
        message = 'Nothing happened.';
    }

    setPlayerState(newPlayerState);
    setDeckState(newDeckState);
    setRelicState(newRelicState);
    setResult(message);
  };

  const handleContinue = () => {
    // Apply changes to actual game state
    state.player.gold = playerState.gold;
    state.player.currentHp = playerState.currentHp;
    state.player.maxHp = playerState.maxHp;
    state.deck.length = 0;
    state.deck.push(...deckState);
    state.relics.length = 0;
    state.relics.push(...relicState);
    proceedToMap();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      padding: '20px',
      paddingTop: '90px',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(ellipse at center, ${event.color}22 0%, #0a0a1a 50%, #050510 100%)`,
      position: 'relative'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        background: `radial-gradient(circle, ${event.color}33 0%, transparent 70%)`,
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Event Icon — image art with emoji fallback */}
      {(() => {
        const eventArt = getEventImage(event.id);
        if (eventArt) {
          return (
            <img
              src={eventArt}
              alt={event.title}
              style={{
                width: '120px',
                height: '120px',
                marginBottom: '20px',
                borderRadius: '16px',
                objectFit: 'cover',
                animation: 'float 3s ease-in-out infinite',
                filter: `drop-shadow(0 0 20px ${event.color})`,
                border: `2px solid ${event.color}66`
              }}
            />
          );
        }
        return (
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'float 3s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px ${event.color})`
          }}>
            {event.emoji}
          </div>
        );
      })()}

      {/* Event Title */}
      <h2 style={{
        color: event.color,
        marginBottom: '12px',
        textAlign: 'center',
        fontSize: '26px',
        textShadow: `0 0 15px ${event.color}66`,
        letterSpacing: '1px'
      }}>
        {event.title}
      </h2>

      {/* Event Description */}
      <p style={{
        color: '#ccc',
        textAlign: 'center',
        maxWidth: '320px',
        marginBottom: '30px',
        fontSize: '14px',
        lineHeight: '1.6',
        padding: '0 10px'
      }}>
        {event.description}
      </p>

      {!result ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '320px'
        }}>
          {event.options.map((option, idx) => {
            const canAfford = !option.cost ||
              (option.effect.includes('gold') ? playerState.gold >= option.cost : playerState.currentHp > option.cost);

            return (
              <button
                key={idx}
                onClick={() => canAfford && handleOption(option)}
                disabled={!canAfford}
                style={{
                  padding: '16px 20px',
                  background: canAfford
                    ? `linear-gradient(180deg, ${event.color}33 0%, ${event.color}11 100%)`
                    : 'rgba(30, 30, 40, 0.5)',
                  border: canAfford ? `2px solid ${event.color}88` : '2px solid #333',
                  borderRadius: '12px',
                  color: canAfford ? 'white' : '#555',
                  fontSize: '15px',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  boxShadow: canAfford ? `0 4px 15px ${event.color}33` : 'none'
                }}
              >
                {option.text}
                {option.cost && (
                  <span style={{
                    color: canAfford ? '#ffaa66' : '#664433',
                    fontSize: '12px',
                    marginLeft: '8px'
                  }}>
                    ({option.effect.includes('gold') ? `${option.cost} Gold` : `${option.cost} HP`})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '25px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            padding: '20px 25px',
            background: result.includes('+') || result.includes('Blessed') || result.includes('healed') || result.includes('obtained')
              ? 'linear-gradient(180deg, rgba(68, 170, 68, 0.2) 0%, rgba(68, 170, 68, 0.05) 100%)'
              : result.includes('-') || result.includes('curse') || result.includes('trapped')
                ? 'linear-gradient(180deg, rgba(170, 68, 68, 0.2) 0%, rgba(170, 68, 68, 0.05) 100%)'
                : 'linear-gradient(180deg, rgba(100, 100, 100, 0.2) 0%, rgba(100, 100, 100, 0.05) 100%)',
            borderRadius: '12px',
            border: result.includes('+') || result.includes('Blessed') || result.includes('healed') || result.includes('obtained')
              ? '1px solid #44aa44'
              : result.includes('-') || result.includes('curse') || result.includes('trapped')
                ? '1px solid #aa4444'
                : '1px solid #666',
            maxWidth: '300px'
          }}>
            <p style={{
              color: result.includes('+') || result.includes('Blessed') || result.includes('healed') || result.includes('obtained')
                ? '#88ff88'
                : result.includes('-') || result.includes('curse') || result.includes('trapped')
                  ? '#ff8888'
                  : '#aaa',
              textAlign: 'center',
              fontSize: '15px',
              lineHeight: '1.5',
              margin: 0
            }}>
              {result}
            </p>
          </div>

          <button
            onClick={handleContinue}
            style={{
              padding: '16px 50px',
              background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
              color: 'white',
              border: '2px solid #cc4444',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              touchAction: 'manipulation',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 20px rgba(170, 32, 32, 0.4)'
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Stats Display */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        gap: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px 12px',
          borderRadius: '15px',
          border: '1px solid #333'
        }}>
          <span style={{ fontSize: '14px' }}>{'\u2764\uFE0F'}</span>
          <span style={{
            color: playerState.currentHp / playerState.maxHp > 0.5 ? '#44aa44' : '#aa4444',
            fontSize: '13px',
            fontWeight: 'bold'
          }}>
            {playerState.currentHp}/{playerState.maxHp}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px 12px',
          borderRadius: '15px',
          border: '1px solid #333'
        }}>
          <span style={{ fontSize: '14px' }}>{'\uD83D\uDCB0'}</span>
          <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 'bold' }}>
            {playerState.gold}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventScreen;
