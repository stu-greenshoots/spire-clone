import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { getRandomCard, RARITY } from '../data/cards';
import { getRandomRelic, RELIC_RARITY } from '../data/relics';
import Card from './Card';
import { getRelicImage } from '../assets/art/art-config';

const ShopScreen = () => {
  const { state, leaveShop } = useGame();
  const { player, deck, relics } = state;

  const [gold, setGold] = useState(player.gold);
  const [purchasedDeck, setPurchasedDeck] = useState([...deck]);
  const [purchasedRelics, setPurchasedRelics] = useState([...relics]);

  // Generate shop items once
  const shopItems = useMemo(() => {
    const cards = [];
    // 2 common, 2 uncommon, 1 rare
    for (let i = 0; i < 2; i++) {
      const card = getRandomCard(RARITY.COMMON);
      if (card) cards.push({ ...card, price: 50 + Math.floor(Math.random() * 30), bought: false });
    }
    for (let i = 0; i < 2; i++) {
      const card = getRandomCard(RARITY.UNCOMMON);
      if (card) cards.push({ ...card, price: 75 + Math.floor(Math.random() * 50), bought: false });
    }
    const rareCard = getRandomCard(RARITY.RARE);
    if (rareCard) cards.push({ ...rareCard, price: 150 + Math.floor(Math.random() * 50), bought: false });

    const relic = getRandomRelic(RELIC_RARITY.UNCOMMON, purchasedRelics.map(r => r.id));
    const removal = { type: 'removal', price: 75 };

    return { cards, relic: relic ? { ...relic, price: 150 + Math.floor(Math.random() * 50), bought: false } : null, removal };
  }, [purchasedRelics]);

  const [shopState, setShopState] = useState(shopItems);

  const buyCard = (cardIndex) => {
    const card = shopState.cards[cardIndex];
    if (gold >= card.price && !card.bought) {
      setGold(gold - card.price);
      setPurchasedDeck([...purchasedDeck, { ...card, instanceId: `shop_${card.id}_${Date.now()}` }]);
      const newCards = [...shopState.cards];
      newCards[cardIndex] = { ...card, bought: true };
      setShopState({ ...shopState, cards: newCards });
    }
  };

  const buyRelic = () => {
    if (shopState.relic && gold >= shopState.relic.price && !shopState.relic.bought) {
      setGold(gold - shopState.relic.price);
      setPurchasedRelics([...purchasedRelics, shopState.relic]);
      setShopState({ ...shopState, relic: { ...shopState.relic, bought: true } });
    }
  };

  const [showRemoval, setShowRemoval] = useState(false);

  const removeCard = (cardIndex) => {
    if (gold >= shopState.removal.price) {
      setGold(gold - shopState.removal.price);
      const newDeck = [...purchasedDeck];
      newDeck.splice(cardIndex, 1);
      setPurchasedDeck(newDeck);
      setShowRemoval(false);
    }
  };

  const handleLeave = () => {
    leaveShop(gold, purchasedDeck, purchasedRelics);
  };

  if (showRemoval) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
        overflow: 'hidden',
        paddingTop: '90px'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px 20px',
          background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%)',
          borderBottom: '2px solid #aa44aa',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: '#FFD700',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>{'\uD83D\uDDD1\uFE0F'}</span>
            Remove a Card
          </h2>
          <p style={{
            color: '#aa88aa',
            fontSize: '12px',
            marginTop: '5px'
          }}>
            Cost: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{shopState.removal.price}</span>
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          alignContent: 'flex-start'
        }}>
          {purchasedDeck.map((card, idx) => (
            <div
              key={card.instanceId}
              onClick={() => removeCard(idx)}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <Card card={card} small />
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div style={{
          padding: '15px',
          background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
          borderTop: '2px solid #333'
        }}>
          <button
            onClick={() => setShowRemoval(false)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(180deg, #444 0%, #333 100%)',
              color: 'white',
              border: '2px solid #555',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      background: 'linear-gradient(180deg, #0a0a1a 0%, #15152a 50%, #0a0a1a 100%)',
      overflow: 'hidden',
      paddingTop: '90px'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        background: 'linear-gradient(180deg, rgba(30, 40, 50, 0.95) 0%, rgba(20, 30, 40, 0.9) 100%)',
        borderBottom: '2px solid #44aaaa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(68, 170, 170, 0.2)'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '28px' }}>{'\uD83C\uDFEA'}</span>
          <span style={{
            color: '#FFD700',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
          }}>
            Shop
          </span>
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '8px 15px',
          borderRadius: '20px',
          border: '1px solid #FFD700'
        }}>
          <span style={{ fontSize: '20px' }}>{'\uD83D\uDCB0'}</span>
          <span style={{
            color: '#FFD700',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
          }}>
            {gold}
          </span>
        </div>
      </div>

      {/* Shop Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px 15px'
      }}>
        {/* Cards Section */}
        <SectionHeader icon={'\uD83C\uDCCF'} title="Cards for Sale" />
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '20px',
          marginBottom: '25px'
        }}>
          {shopState.cards.map((card, idx) => (
            <ShopCard
              key={`${card.id}_${idx}`}
              card={card}
              gold={gold}
              onBuy={() => buyCard(idx)}
            />
          ))}
        </div>

        {/* Relic Section */}
        {shopState.relic && (
          <>
            <SectionHeader icon={'\uD83D\uDC8E'} title="Relic" />
            <ShopRelic
              relic={shopState.relic}
              gold={gold}
              onBuy={buyRelic}
            />
          </>
        )}

        {/* Services Section */}
        <SectionHeader icon={'\uD83D\uDEE0\uFE0F'} title="Services" />
        <button
          onClick={() => gold >= shopState.removal.price && setShowRemoval(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            width: '100%',
            padding: '15px 20px',
            background: gold >= shopState.removal.price
              ? 'linear-gradient(180deg, rgba(170, 68, 170, 0.3) 0%, rgba(170, 68, 170, 0.1) 100%)'
              : 'rgba(30, 30, 40, 0.5)',
            border: gold >= shopState.removal.price
              ? '2px solid #aa44aa'
              : '2px solid #333',
            borderRadius: '12px',
            color: 'white',
            opacity: gold >= shopState.removal.price ? 1 : 0.5,
            cursor: gold >= shopState.removal.price ? 'pointer' : 'not-allowed',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: gold >= shopState.removal.price
              ? '0 4px 15px rgba(170, 68, 170, 0.3)'
              : 'none'
          }}
        >
          <span style={{
            fontSize: '32px',
            filter: gold >= shopState.removal.price ? 'none' : 'grayscale(1)'
          }}>
            {'\uD83D\uDDD1\uFE0F'}
          </span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: '16px',
              color: gold >= shopState.removal.price ? '#dd88dd' : '#666'
            }}>
              Remove a Card
            </div>
            <div style={{
              fontSize: '12px',
              color: gold >= shopState.removal.price ? '#aa88aa' : '#444'
            }}>
              Thin your deck for better draws
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontSize: '16px' }}>{'\uD83D\uDCB0'}</span>
            <span style={{
              color: gold >= shopState.removal.price ? '#FFD700' : '#664400',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {shopState.removal.price}
            </span>
          </div>
        </button>
      </div>

      {/* Leave Button */}
      <div style={{
        padding: '15px',
        background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
        borderTop: '2px solid #333'
      }}>
        <button
          onClick={handleLeave}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
            color: 'white',
            border: '2px solid #cc4444',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(170, 32, 32, 0.4)',
            touchAction: 'manipulation'
          }}
        >
           Leave Shop
        </button>
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon, title }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <h3 style={{
      margin: 0,
      color: '#aaa',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      {title}
    </h3>
    <div style={{
      flex: 1,
      height: '1px',
      background: 'linear-gradient(90deg, #444 0%, transparent 100%)',
      marginLeft: '10px'
    }} />
  </div>
);

// Shop Card Component
const ShopCard = ({ card, gold, onBuy }) => {
  const canAfford = gold >= card.price && !card.bought;

  return (
    <div
      onClick={() => canAfford && onBuy()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: card.bought ? 0.3 : canAfford ? 1 : 0.6,
        cursor: card.bought ? 'default' : canAfford ? 'pointer' : 'not-allowed',
        transition: 'transform 0.2s ease',
        transform: canAfford ? 'scale(1)' : 'scale(0.95)'
      }}
    >
      <Card card={card} small />
      <div style={{
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: card.bought
          ? 'rgba(50, 50, 50, 0.5)'
          : canAfford
            ? 'rgba(255, 215, 0, 0.2)'
            : 'rgba(170, 68, 68, 0.2)',
        padding: '4px 12px',
        borderRadius: '12px',
        border: card.bought
          ? '1px solid #444'
          : canAfford
            ? '1px solid #FFD700'
            : '1px solid #aa4444'
      }}>
        {card.bought ? (
          <span style={{ color: '#666', fontSize: '12px', fontWeight: 'bold' }}>SOLD</span>
        ) : (
          <>
            <span style={{ fontSize: '12px' }}>{'\uD83D\uDCB0'}</span>
            <span style={{
              color: canAfford ? '#FFD700' : '#aa4444',
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              {card.price}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Shop Relic Component
const ShopRelic = ({ relic, gold, onBuy }) => {
  const canAfford = gold >= relic.price && !relic.bought;

  return (
    <div
      onClick={() => canAfford && onBuy()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        background: relic.bought
          ? 'rgba(30, 30, 40, 0.5)'
          : canAfford
            ? 'linear-gradient(180deg, rgba(68, 136, 255, 0.2) 0%, rgba(68, 136, 255, 0.1) 100%)'
            : 'rgba(30, 30, 40, 0.5)',
        border: relic.bought
          ? '2px solid #333'
          : canAfford
            ? '2px solid #4488ff'
            : '2px solid #444',
        borderRadius: '12px',
        marginBottom: '25px',
        opacity: relic.bought ? 0.3 : canAfford ? 1 : 0.6,
        cursor: relic.bought ? 'default' : canAfford ? 'pointer' : 'not-allowed',
        touchAction: 'manipulation',
        transition: 'all 0.2s ease',
        boxShadow: canAfford && !relic.bought
          ? '0 4px 20px rgba(68, 136, 255, 0.3)'
          : 'none'
      }}
    >
      <span style={{
        fontSize: '40px',
        filter: relic.bought ? 'grayscale(1)' : 'drop-shadow(0 2px 8px rgba(68, 136, 255, 0.5))',
        animation: canAfford && !relic.bought ? 'float 3s ease-in-out infinite' : 'none'
      }}>
        {(() => {
          const img = getRelicImage(relic.id);
          return img ? <img src={img} alt={relic.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} /> : relic.emoji;
        })()}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: '15px',
          color: relic.bought ? '#666' : '#88ccff',
          marginBottom: '4px'
        }}>
          {relic.name}
        </div>
        <div style={{
          fontSize: '12px',
          color: relic.bought ? '#444' : '#88aacc',
          lineHeight: '1.4'
        }}>
          {relic.description}
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: relic.bought
          ? 'rgba(50, 50, 50, 0.5)'
          : canAfford
            ? 'rgba(255, 215, 0, 0.2)'
            : 'rgba(170, 68, 68, 0.2)',
        padding: '6px 14px',
        borderRadius: '15px',
        border: relic.bought
          ? '1px solid #444'
          : canAfford
            ? '1px solid #FFD700'
            : '1px solid #aa4444'
      }}>
        {relic.bought ? (
          <span style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>SOLD</span>
        ) : (
          <>
            <span style={{ fontSize: '14px' }}>{'\uD83D\uDCB0'}</span>
            <span style={{
              color: canAfford ? '#FFD700' : '#aa4444',
              fontSize: '15px',
              fontWeight: 'bold'
            }}>
              {relic.price}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopScreen;
