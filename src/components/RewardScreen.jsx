import { useGame, GAME_PHASE } from '../context/GameContext';
import Card from './Card';

const RewardScreen = ({ isOverlay = false }) => {
  const { state, collectGold, collectRelic, openCardRewards, selectCardReward, skipCardReward, proceedToMap } = useGame();
  const { phase, combatRewards, cardRewards, player } = state;

  // Overlay styles for victory screen
  const overlayContainerStyle = isOverlay ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.7)',
    animation: 'fadeIn 0.3s ease-out'
  } : {};

  const overlayContentStyle = isOverlay ? {
    background: 'linear-gradient(180deg, rgba(20, 30, 20, 0.98) 0%, rgba(10, 20, 10, 0.98) 100%)',
    borderRadius: '20px',
    border: '2px solid #FFD700',
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto'
  } : {};

  if (phase === GAME_PHASE.CARD_REWARD && cardRewards) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        background: isOverlay ? 'rgba(0, 0, 0, 0.85)' : 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
        overflow: 'hidden',
        paddingTop: isOverlay ? '20px' : '90px',
        ...(isOverlay ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 } : {})
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%)',
          borderBottom: '2px solid #aa4444',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: '#FFD700',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>{'\uD83C\uDCCF'}</span>
            Choose a Card
          </h2>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>
            Select one card to add to your deck
          </p>
        </div>

        {/* Cards */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          padding: '30px 20px',
          flexWrap: 'wrap'
        }}>
          {cardRewards.map((card, index) => (
            <div
              key={card.instanceId}
              data-testid={`reward-card-${index}`}
              onClick={() => selectCardReward(card)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Card card={card} />
            </div>
          ))}
        </div>

        {/* Skip Button */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
          borderTop: '2px solid #333',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            data-testid="btn-skip-reward"
            onClick={skipCardReward}
            style={{
              padding: '14px 50px',
              fontSize: '16px',
              background: 'linear-gradient(180deg, #444 0%, #333 100%)',
              color: 'white',
              border: '2px solid #555',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              touchAction: 'manipulation'
            }}
          >
             Skip Reward
          </button>
        </div>
      </div>
    );
  }

  // Main rewards screen (COMBAT_REWARD phase)
  if (isOverlay) {
    return (
      <div className="victory-overlay-container" style={overlayContainerStyle}>
        <div className="victory-content-panel" style={overlayContentStyle}>
          {/* Victory Header */}
          <div style={{
            padding: '25px 20px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div style={{
              fontSize: '50px',
              marginBottom: '10px',
              animation: 'celebrate 2s ease-in-out infinite'
            }}>
              {'\uD83C\uDFC6'}
            </div>
            <h2 style={{
              color: '#FFD700',
              fontSize: '28px',
              marginBottom: '5px',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
              letterSpacing: '3px',
              margin: 0
            }}>
              VICTORY!
            </h2>
            <p style={{ color: '#88aa88', fontSize: '13px', marginTop: '8px' }}>
              Choose your rewards
            </p>
          </div>

          {/* Rewards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px'
          }}>
            {/* Gold Reward */}
            {combatRewards?.gold > 0 && (
              <RewardButton
                testId="reward-gold"
                icon={'\uD83D\uDCB0'}
                title={`${combatRewards.gold} Gold`}
                subtitle="Add to your purse"
                onClick={collectGold}
                color="#FFD700"
              />
            )}

            {/* Relic Reward */}
            {combatRewards?.relicReward && (
              <RewardButton
                icon={combatRewards.relicReward.emoji}
                title={combatRewards.relicReward.name}
                subtitle={combatRewards.relicReward.description}
                onClick={collectRelic}
                color="#44AAFF"
              />
            )}

            {/* Card Reward */}
            {combatRewards?.cardRewards && combatRewards.cardRewards.length > 0 && (
              <RewardButton
                testId="reward-cards"
                icon={'\uD83C\uDCCF'}
                title="Add Card to Deck"
                subtitle="Choose from 3 cards"
                onClick={openCardRewards}
                color="#AA4444"
              />
            )}
          </div>

          {/* Proceed Button */}
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <button
              data-testid="btn-proceed-map"
              onClick={proceedToMap}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
                color: 'white',
                border: '2px solid #cc4444',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 20px rgba(170, 32, 32, 0.4)',
                touchAction: 'manipulation'
              }}
            >
               Continue
            </button>

            {/* Stats */}
            <div style={{
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'center',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '13px' }}>{'\u2764\uFE0F'}</span>
                <span style={{
                  color: player.currentHp / player.maxHp > 0.5 ? '#44aa44' : '#aa4444',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {player.currentHp}/{player.maxHp}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '13px' }}>{'\uD83D\uDCB0'}</span>
                <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>
                  {player.gold}
                </span>
              </div>
            </div>
          </div>
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
      background: 'radial-gradient(ellipse at center, #1a2a1a 0%, #0a1a0a 50%, #050a05 100%)',
      overflow: 'hidden',
      position: 'relative',
      paddingTop: '90px'
    }}>
      {/* Victory glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '200px',
        background: 'radial-gradient(ellipse, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        padding: '25px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '10px',
          animation: 'celebrate 2s ease-in-out infinite'
        }}>
          {'\uD83C\uDFC6'}
        </div>
        <h2 style={{
          color: '#FFD700',
          fontSize: '32px',
          marginBottom: '5px',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          letterSpacing: '3px'
        }}>
          VICTORY!
        </h2>
        <p style={{ color: '#88aa88', fontSize: '14px' }}>
          Choose your rewards
        </p>
      </div>

      {/* Rewards */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        padding: '20px',
        maxWidth: '350px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Gold Reward */}
        {combatRewards?.gold > 0 && (
          <RewardButton
            testId="reward-gold"
            icon={'\uD83D\uDCB0'}
            title={`${combatRewards.gold} Gold`}
            subtitle="Add to your purse"
            onClick={collectGold}
            color="#FFD700"
          />
        )}

        {/* Relic Reward */}
        {combatRewards?.relicReward && (
          <RewardButton
            icon={combatRewards.relicReward.emoji}
            title={combatRewards.relicReward.name}
            subtitle={combatRewards.relicReward.description}
            onClick={collectRelic}
            color="#44AAFF"
          />
        )}

        {/* Card Reward */}
        {combatRewards?.cardRewards && combatRewards.cardRewards.length > 0 && (
          <RewardButton
            testId="reward-cards"
            icon={'\uD83C\uDCCF'}
            title="Add Card to Deck"
            subtitle="Choose from 3 cards"
            onClick={openCardRewards}
            color="#AA4444"
          />
        )}
      </div>

      {/* Proceed Button */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
        borderTop: '2px solid #333'
      }}>
        <button
          data-testid="btn-proceed-map"
          onClick={proceedToMap}
          style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
            color: 'white',
            border: '2px solid #cc4444',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 20px rgba(170, 32, 32, 0.4)',
            touchAction: 'manipulation'
          }}
        >
           Continue
        </button>

        {/* Stats */}
        <div style={{
          marginTop: '15px',
          display: 'flex',
          justifyContent: 'center',
          gap: '25px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>{'\u2764\uFE0F'}</span>
            <span style={{
              color: player.currentHp / player.maxHp > 0.5 ? '#44aa44' : '#aa4444',
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              {player.currentHp}/{player.maxHp}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>{'\uD83D\uDCB0'}</span>
            <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 'bold' }}>
              {player.gold}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reward Button Component
const RewardButton = ({ icon, title, subtitle, onClick, color, testId }) => (
  <button
    className="victory-reward-button"
    data-testid={testId}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '18px 20px',
      background: `linear-gradient(180deg, ${color}33 0%, ${color}11 100%)`,
      border: `2px solid ${color}`,
      borderRadius: '15px',
      color: 'white',
      cursor: 'pointer',
      touchAction: 'manipulation',
      transition: 'all 0.2s ease',
      boxShadow: `0 4px 20px ${color}44`,
      textAlign: 'left'
    }}
  >
    <span style={{
      fontSize: '36px',
      filter: `drop-shadow(0 0 8px ${color})`,
      animation: 'float 3s ease-in-out infinite'
    }}>
      {icon}
    </span>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '17px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '3px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#aaa',
        lineHeight: '1.4'
      }}>
        {subtitle}
      </div>
    </div>
    <span style={{ fontSize: '20px', color: '#666' }}>{'\u27A1\uFE0F'}</span>
  </button>
);

export default RewardScreen;
