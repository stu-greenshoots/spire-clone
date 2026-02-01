import { useState, useEffect } from 'react';
import { useGame, GAME_PHASE } from '../context/GameContext';
import Card from './Card';
import PotionSlots from './PotionSlots';
import { getRelicImage } from '../assets/art/art-config';
import { isMuted, setMuted } from '../systems/audioSystem';

const PersistentHeader = ({ onPauseClick }) => {
  const { state } = useGame();
  const { player, phase, act, currentFloor, relics, deck } = state;
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [showDeckView, setShowDeckView] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [hudExpanded, setHudExpanded] = useState(false);

  const isCombatPhase = phase === GAME_PHASE.COMBAT ||
    phase === GAME_PHASE.CARD_SELECT_HAND ||
    phase === GAME_PHASE.CARD_SELECT_DISCARD ||
    phase === GAME_PHASE.CARD_SELECT_EXHAUST;

  const toggleMute = () => {
    const newValue = !muted;
    setMuted(newValue);
    setMutedState(newValue);
  };

  // Reset expanded state when leaving combat
  useEffect(() => {
    if (!isCombatPhase) {
      setHudExpanded(false);
    }
  }, [isCombatPhase]);

  // Don't show on main menu, game over, or victory screens
  if (phase === GAME_PHASE.MAIN_MENU || phase === GAME_PHASE.GAME_OVER || phase === GAME_PHASE.VICTORY) {
    return null;
  }

  const hpPercentage = (player.currentHp / player.maxHp) * 100;
  const hpColor = hpPercentage > 60 ? '#44AA44' : hpPercentage > 30 ? '#AAAA44' : '#AA4444';

  const handleRelicClick = (relic) => {
    setSelectedRelic(selectedRelic?.id === relic.id ? null : relic);
  };

  const closePopup = () => {
    setSelectedRelic(null);
  };

  return (
    <>
      <div
        className={`persistent-header-container${isCombatPhase ? ' combat-mode' : ''}${hudExpanded ? ' hud-expanded' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(20, 20, 35, 0.95) 100%)',
          borderBottom: '2px solid #444',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Combat compact header - shown on mobile during combat */}
        {isCombatPhase && (
          <div className="combat-header-compact" style={{
            display: 'none', /* shown via CSS on mobile */
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            gap: '8px'
          }}>
            {/* HP bar - compact */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '14px', filter: 'drop-shadow(0 0 4px #ff4444)' }}>{'\u2764\uFE0F'}</span>
              <div style={{
                position: 'relative',
                flex: 1,
                maxWidth: '100px',
                height: '16px',
                background: '#1a1a2a',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #333'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${hpPercentage}%`,
                  height: '100%',
                  background: `linear-gradient(180deg, ${hpColor} 0%, ${hpColor}88 100%)`,
                  borderRadius: '7px',
                  transition: 'width 0.4s ease'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                  }}>
                    {player.currentHp}/{player.maxHp}
                  </span>
                </div>
              </div>
            </div>

            {/* Block indicator - always reserve space */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 8px',
              background: player.block > 0 ? 'rgba(74, 144, 217, 0.25)' : 'rgba(74, 144, 217, 0.08)',
              borderRadius: '6px',
              border: `1px solid ${player.block > 0 ? 'rgba(74, 144, 217, 0.5)' : 'rgba(74, 144, 217, 0.15)'}`,
              minWidth: '42px',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '12px' }}>{'\uD83D\uDEE1\uFE0F'}</span>
              <span style={{
                color: player.block > 0 ? '#6bb5ff' : '#555',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {player.block}
              </span>
            </div>

            {/* Floor indicator - compact */}
            <div style={{
              color: '#FFD700',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '3px 6px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '6px'
            }}>
              {act}-{currentFloor + 2}
            </div>

            {/* Expand chevron */}
            <button
              onClick={() => setHudExpanded(!hudExpanded)}
              className="hud-expand-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#888',
                padding: 0,
                minHeight: 'auto',
                minWidth: 'auto',
                transition: 'transform 0.2s ease'
              }}
              title={hudExpanded ? 'Collapse' : 'Expand'}
            >
              {hudExpanded ? '\u25B2' : '\u25BC'}
            </button>
          </div>
        )}

        {/* Row 1: Stats - full header (hidden on mobile during combat unless expanded) */}
        <div className="header-stats-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '8px 16px',
          flexWrap: 'wrap'
        }}>
          {/* Floor/Act indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            background: 'rgba(255, 215, 0, 0.15)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <span style={{ fontSize: '14px' }}>{'\uD83C\uDFDB\uFE0F'}</span>
            <span style={{
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
            }}>
              Act {act} - Floor {currentFloor + 2}
            </span>
          </div>

          {/* HP Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px', filter: 'drop-shadow(0 0 4px #ff4444)' }}>{'\u2764\uFE0F'}</span>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '20px',
              background: '#1a1a2a',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid #333',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${hpPercentage}%`,
                height: '100%',
                background: `linear-gradient(180deg, ${hpColor} 0%, ${hpColor}88 100%)`,
                borderRadius: '8px',
                transition: 'width 0.4s ease, background 0.3s ease',
                boxShadow: `0 0 10px ${hpColor}66, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
                }}>
                  {player.currentHp} / {player.maxHp}
                </span>
              </div>
            </div>
          </div>

          {/* Gold */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <span style={{ fontSize: '14px' }}>{'\uD83D\uDCB0'}</span>
            <span style={{
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '0 0 5px rgba(255, 215, 0, 0.4)'
            }}>
              {player.gold}
            </span>
          </div>

          {/* Deck Count - Clickable */}
          <button
            onClick={() => setShowDeckView(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              background: 'rgba(100, 150, 200, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(100, 150, 200, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '14px' }}>{'\uD83C\uDCCF'}</span>
            <span style={{
              color: '#88bbff',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '0 0 5px rgba(100, 150, 200, 0.4)'
            }}>
              {deck?.length || 0}
            </span>
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="mute-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px 10px',
              background: 'rgba(100, 100, 100, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(100, 100, 100, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '16px'
            }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
          </button>

          {/* Pause/Menu Button */}
          <button
            onClick={onPauseClick}
            data-testid="pause-button"
            className="pause-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px 10px',
              background: 'rgba(100, 100, 100, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(100, 100, 100, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '12px',
              color: '#888',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
            title="Pause Menu (Esc)"
          >
            {'\u2630'} Menu
          </button>
        </div>

        {/* Row 2: Relics */}
        <div className="header-relics-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '6px 16px',
          borderTop: '1px solid #333',
          background: 'rgba(0, 0, 0, 0.2)',
          minHeight: '36px'
        }}>
          <span style={{
            color: '#888',
            fontSize: '10px',
            marginRight: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Relics:</span>

          {relics && relics.length > 0 ? (
            relics.map((relic, index) => {
              const relicImg = getRelicImage(relic.id);
              return (
                <div
                  key={relic.id || index}
                  onClick={() => handleRelicClick(relic)}
                  style={{
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
                    transition: 'all 0.2s ease',
                    transform: selectedRelic?.id === relic.id ? 'scale(1.2)' : 'scale(1)',
                    padding: '2px',
                    borderRadius: '6px',
                    background: selectedRelic?.id === relic.id ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                    border: selectedRelic?.id === relic.id ? '2px solid #FFD700' : '2px solid transparent',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={relic.name}
                >
                  {relicImg ? (
                    <img src={relicImg} alt={relic.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '18px' }}>{relic.emoji}</span>
                  )}
                </div>
              );
            })
          ) : (
            <span style={{ color: '#555', fontSize: '11px', fontStyle: 'italic' }}>None yet</span>
          )}
        </div>

        {/* Row 3: Potions */}
        <div className="header-potions-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 16px',
          borderTop: '1px solid #2a2235',
          background: 'rgba(0, 0, 0, 0.15)',
          minHeight: '44px'
        }}>
          <PotionSlots />
        </div>
      </div>

      {/* Relic Popup */}
      {selectedRelic && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '100px',
            background: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(40, 40, 60, 0.98) 0%, rgba(25, 25, 40, 0.98) 100%)',
              borderRadius: '16px',
              padding: '20px 28px',
              border: '3px solid #666',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.2)',
              maxWidth: '320px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #444'
            }}>
              <span style={{
                fontSize: '36px',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))'
              }}>
                {(() => {
                  const img = getRelicImage(selectedRelic.id);
                  return img ? <img src={img} alt={selectedRelic.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} /> : selectedRelic.emoji;
                })()}
              </span>
              <div>
                <h3 style={{
                  color: '#FFD700',
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
                }}>
                  {selectedRelic.name}
                </h3>
                <span style={{
                  color: getRarityColor(selectedRelic.rarity),
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {selectedRelic.rarity}
                </span>
              </div>
            </div>
            <p style={{
              color: '#ccc',
              margin: 0,
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {selectedRelic.description}
            </p>
            <button
              onClick={closePopup}
              style={{
                marginTop: '14px',
                padding: '8px 16px',
                background: 'linear-gradient(180deg, #444 0%, #333 100%)',
                border: '2px solid #555',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Deck View Modal */}
      {showDeckView && (
        <div
          onClick={() => setShowDeckView(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0, 0, 0, 0.95)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '15px 20px',
              background: 'linear-gradient(180deg, rgba(40, 40, 60, 0.98) 0%, rgba(25, 25, 40, 0.95) 100%)',
              borderBottom: '2px solid #555',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <h2 style={{
              margin: 0,
              color: '#FFD700',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>{'\uD83C\uDCCF'}</span>
              Your Deck ({deck?.length || 0} cards)
            </h2>
            <button
              onClick={() => setShowDeckView(false)}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(180deg, #555 0%, #444 100%)',
                border: '2px solid #666',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Cards Grid */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignContent: 'flex-start'
            }}
          >
            {deck && deck.map((card) => (
              <div key={card.instanceId} style={{ flexShrink: 0 }}>
                <Card card={card} small />
              </div>
            ))}
            {(!deck || deck.length === 0) && (
              <div style={{ color: '#666', fontSize: '16px', padding: '40px' }}>
                No cards in deck
              </div>
            )}
          </div>

          {/* Large Close Button at Bottom */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '15px 20px',
              background: 'linear-gradient(180deg, #1a1a2a 0%, #111 100%)',
              borderTop: '2px solid #444',
              flexShrink: 0
            }}>
            <button
              onClick={() => setShowDeckView(false)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(180deg, #aa2020 0%, #881515 100%)',
                color: 'white',
                border: '2px solid #cc4444',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'starter': return '#888888';
    case 'common': return '#aaaaaa';
    case 'uncommon': return '#44dd44';
    case 'rare': return '#ff8844';
    case 'boss': return '#ff4444';
    case 'event': return '#aa44ff';
    case 'shop': return '#44aaff';
    default: return '#888888';
  }
};

export default PersistentHeader;
