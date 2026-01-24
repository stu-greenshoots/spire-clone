import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from './Card';

// Helper to get stat differences between current and upgraded card
const getUpgradeDiffs = (card) => {
  if (!card || !card.upgradedVersion) return [];
  const diffs = [];
  const upgraded = card.upgradedVersion;

  if (upgraded.damage !== undefined && upgraded.damage !== card.damage) {
    diffs.push({ label: 'Damage', from: card.damage, to: upgraded.damage });
  }
  if (upgraded.block !== undefined && upgraded.block !== card.block) {
    diffs.push({ label: 'Block', from: card.block || 0, to: upgraded.block });
  }
  if (upgraded.cost !== undefined && upgraded.cost !== card.cost) {
    diffs.push({ label: 'Cost', from: card.cost, to: upgraded.cost });
  }
  if (upgraded.hits !== undefined && upgraded.hits !== card.hits) {
    diffs.push({ label: 'Hits', from: card.hits, to: upgraded.hits });
  }
  if (upgraded.draw !== undefined && upgraded.draw !== card.draw) {
    diffs.push({ label: 'Draw', from: card.draw || 0, to: upgraded.draw });
  }
  if (upgraded.effects && card.effects) {
    card.effects.forEach((eff, i) => {
      const upgEff = upgraded.effects[i];
      if (upgEff && upgEff.amount !== eff.amount) {
        const label = eff.type.charAt(0).toUpperCase() + eff.type.slice(1);
        diffs.push({ label, from: eff.amount, to: upgEff.amount });
      }
    });
  }
  return diffs;
};

const RestSite = () => {
  const { state, rest, upgradeCard, liftGirya } = useGame();
  const { player, deck, relics } = state;

  // Check for rest site relics
  const hasGirya = relics.find(r => r.id === 'girya');
  const giryaLifts = hasGirya?.liftCount || 0;
  const canLift = hasGirya && giryaLifts < 3;

  const hasEternalFeather = relics.find(r => r.id === 'eternal_feather');
  const eternalFeatherHeal = hasEternalFeather ? Math.floor(deck.length / 5) * 3 : 0;
  const hasCoffeeDripper = relics.some(r => r.id === 'coffee_dripper');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [hoverCard, setHoverCard] = useState(null);

  const healAmount = Math.floor(player.maxHp * 0.3);
  const upgradableCards = deck.filter(c => !c.upgraded && c.upgradedVersion);

  const handleSelectForUpgrade = (card) => {
    setPreviewCard(card);
    setPreviewIndex(card.instanceId);
  };

  const handleConfirmUpgrade = () => {
    if (previewIndex !== null) {
      upgradeCard(previewIndex);
      setPreviewCard(null);
      setPreviewIndex(null);
    }
  };

  const handleCancelPreview = () => {
    setPreviewCard(null);
    setPreviewIndex(null);
  };

  if (showUpgrade) {
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
          padding: '12px 20px',
          background: 'linear-gradient(180deg, rgba(40, 30, 20, 0.95) 0%, rgba(30, 20, 15, 0.9) 100%)',
          borderBottom: '2px solid #aa6644',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <h2 style={{
            margin: 0,
            color: '#FFD700',
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>{'\u2692\uFE0F'}</span>
            Smith - Upgrade a Card
          </h2>
          <p style={{ color: '#aa8866', fontSize: '12px', marginTop: '5px' }}>
            Select a card to permanently enhance
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
          {deck.map((card) => {
            const canUpgrade = !card.upgraded && card.upgradedVersion;
            const isHovered = hoverCard === card.instanceId;
            return (
              <div
                key={card.instanceId}
                onClick={() => canUpgrade && handleSelectForUpgrade(card)}
                onMouseEnter={() => canUpgrade && setHoverCard(card.instanceId)}
                onMouseLeave={() => setHoverCard(null)}
                style={{
                  opacity: canUpgrade ? 1 : 0.4,
                  cursor: canUpgrade ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  transform: canUpgrade
                    ? (isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)')
                    : 'scale(0.95)',
                  position: 'relative',
                  boxShadow: canUpgrade
                    ? '0 0 8px rgba(255, 170, 60, 0.4), 0 0 16px rgba(255, 170, 60, 0.2)'
                    : 'none',
                  borderRadius: '12px'
                }}
              >
                {/* Upgrade glow indicator */}
                {canUpgrade && (
                  <div style={{
                    position: 'absolute',
                    top: '-3px',
                    left: '-3px',
                    right: '-3px',
                    bottom: '-3px',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 170, 60, 0.6)',
                    boxShadow: isHovered
                      ? '0 0 12px rgba(255, 170, 60, 0.7), inset 0 0 8px rgba(255, 170, 60, 0.15)'
                      : '0 0 6px rgba(255, 170, 60, 0.3)',
                    animation: isHovered ? 'none' : 'upgradeGlow 2s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 1
                  }} />
                )}
                <Card card={card} small />
                {/* Hover comparison tooltip */}
                {canUpgrade && isHovered && (() => {
                  const diffs = getUpgradeDiffs(card);
                  if (diffs.length === 0) return null;
                  return (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: '8px',
                      background: 'rgba(20, 15, 10, 0.97)',
                      border: '2px solid #aa6644',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      whiteSpace: 'nowrap',
                      zIndex: 100,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        color: '#FFD700',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(170, 102, 68, 0.4)',
                        paddingBottom: '4px'
                      }}>
                        {card.name} → {card.name}+
                      </div>
                      {diffs.map((diff, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          fontSize: '10px',
                          marginTop: '3px'
                        }}>
                          <span style={{ color: '#aa8866' }}>{diff.label}:</span>
                          <span>
                            <span style={{ color: '#ff8888' }}>{diff.from}</span>
                            <span style={{ color: '#666', margin: '0 3px' }}>→</span>
                            <span style={{ color: '#88ff88', fontWeight: 'bold' }}>{diff.to}</span>
                          </span>
                        </div>
                      ))}
                      {/* Tooltip arrow */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid #aa6644'
                      }} />
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Upgrade Preview Modal */}
        {previewCard && (
          <div
            onClick={handleCancelPreview}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.95)',
              animation: 'fadeIn 0.2s ease-out',
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(180deg, rgba(40, 30, 20, 0.98) 0%, rgba(25, 20, 15, 0.98) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '3px solid #aa6644',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8)',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <h3 style={{
                margin: '0 0 20px 0',
                color: '#FFD700',
                fontSize: '20px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <span>{'\u2692\uFE0F'}</span>
                Upgrade Preview
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                {/* Current Card */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>CURRENT</p>
                  <Card card={previewCard} />
                </div>

                {/* Arrow */}
                <div style={{
                  fontSize: '32px',
                  color: '#FFD700',
                  padding: '0 10px'
                }}>
                  {'\u27A1\uFE0F'}
                </div>

                {/* Upgraded Card */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#44ff44', fontSize: '12px', marginBottom: '8px' }}>UPGRADED</p>
                  <Card card={{
                    ...previewCard,
                    ...previewCard.upgradedVersion,
                    upgraded: true,
                    name: previewCard.name + '+'
                  }} />
                </div>
              </div>

              {/* Stat Changes Summary */}
              {(() => {
                const diffs = getUpgradeDiffs(previewCard);
                if (diffs.length === 0) return null;
                return (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                  }}>
                    {diffs.map((diff, i) => (
                      <div key={i} style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(170, 102, 68, 0.4)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '10px', color: '#aa8866', marginBottom: '2px' }}>
                          {diff.label}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          <span style={{ color: '#ff8888' }}>{diff.from}</span>
                          <span style={{ color: '#666', margin: '0 4px' }}>→</span>
                          <span style={{ color: '#88ff88', fontWeight: 'bold' }}>{diff.to}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleCancelPreview}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(180deg, #444 0%, #333 100%)',
                    border: '2px solid #555',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(180deg, #44aa44 0%, #338833 100%)',
                    border: '2px solid #55bb55',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(68, 170, 68, 0.4)'
                  }}
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div style={{
          padding: '15px',
          background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
          borderTop: '2px solid #333'
        }}>
          <button
            onClick={() => setShowUpgrade(false)}
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
            Back to Campfire
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      paddingTop: '90px',
      background: 'radial-gradient(ellipse at center bottom, #2a1a10 0%, #1a0a0a 40%, #0a0510 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Campfire glow effect */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 150, 50, 0.3) 0%, rgba(255, 100, 30, 0.1) 40%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Campfire visual */}
      <div style={{
        fontSize: '100px',
        marginBottom: '25px',
        animation: 'float 3s ease-in-out infinite',
        filter: 'drop-shadow(0 0 30px rgba(255, 150, 50, 0.6))'
      }}>
        {'\uD83D\uDD25'}
      </div>

      {/* Title */}
      <h2 style={{
        color: '#FFD700',
        fontSize: '28px',
        marginBottom: '8px',
        textShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
        letterSpacing: '2px'
      }}>
        Rest Site
      </h2>

      <p style={{
        color: '#aa8866',
        fontSize: '14px',
        marginBottom: '35px'
      }}>
        Choose wisely, weary traveler...
      </p>

      {/* Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '320px'
      }}>
        {/* Rest Option */}
        <button
          onClick={hasCoffeeDripper ? undefined : rest}
          disabled={hasCoffeeDripper}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '18px 20px',
            background: hasCoffeeDripper
              ? 'rgba(30, 30, 40, 0.5)'
              : 'linear-gradient(180deg, rgba(68, 170, 68, 0.25) 0%, rgba(68, 170, 68, 0.1) 100%)',
            border: hasCoffeeDripper ? '2px solid #333' : '2px solid #44aa44',
            borderRadius: '15px',
            color: 'white',
            cursor: hasCoffeeDripper ? 'not-allowed' : 'pointer',
            opacity: hasCoffeeDripper ? 0.5 : 1,
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: hasCoffeeDripper ? 'none' : '0 4px 20px rgba(68, 170, 68, 0.3)'
          }}
        >
          <span style={{
            fontSize: '36px',
            filter: hasCoffeeDripper ? 'grayscale(1)' : 'drop-shadow(0 0 8px rgba(68, 170, 68, 0.6))'
          }}>
            {'\uD83D\uDE34'}
          </span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: hasCoffeeDripper ? '#666' : '#88ff88',
              marginBottom: '4px'
            }}>
              Rest
            </div>
            <div style={{ fontSize: '13px', color: hasCoffeeDripper ? '#aa4444' : '#88aa88' }}>
              {hasCoffeeDripper ? (
                <span style={{ color: '#aa4444', fontStyle: 'italic' }}>Coffee Dripper prevents resting</span>
              ) : (
                <>
                  Heal <span style={{ color: '#44ff44', fontWeight: 'bold' }}>{healAmount + eternalFeatherHeal}</span> HP
                  <span style={{ color: '#666', marginLeft: '8px' }}>
                    ({player.currentHp} → {Math.min(player.maxHp, player.currentHp + healAmount + eternalFeatherHeal)})
                  </span>
                  {eternalFeatherHeal > 0 && (
                    <span style={{ color: '#8888ff', marginLeft: '4px' }}>
                      (+{eternalFeatherHeal} feather)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {!hasCoffeeDripper && (
            <div style={{
              fontSize: '24px',
              color: '#44ff44'
            }}>
              +{healAmount + eternalFeatherHeal}
            </div>
          )}
        </button>

        {/* Girya Lift Option */}
        {canLift && (
          <button
            onClick={liftGirya}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '18px 20px',
              background: 'linear-gradient(180deg, rgba(170, 68, 170, 0.25) 0%, rgba(170, 68, 170, 0.1) 100%)',
              border: '2px solid #aa44aa',
              borderRadius: '15px',
              color: 'white',
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(170, 68, 170, 0.3)'
            }}
          >
            <span style={{
              fontSize: '36px',
              filter: 'drop-shadow(0 0 8px rgba(170, 68, 170, 0.6))'
            }}>
              {'\uD83C\uDFCB\uFE0F'}
            </span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ff88ff',
                marginBottom: '4px'
              }}>
                Lift
              </div>
              <div style={{ fontSize: '13px', color: '#aa88aa' }}>
                Gain <span style={{ color: '#ff44ff', fontWeight: 'bold' }}>1</span> Strength permanently
                <span style={{ color: '#666', marginLeft: '8px' }}>
                  ({3 - giryaLifts} uses left)
                </span>
              </div>
            </div>
            <div style={{
              fontSize: '24px',
              color: '#ff44ff'
            }}>
              +1 STR
            </div>
          </button>
        )}

        {/* Smith Option */}
        <button
          onClick={() => setShowUpgrade(true)}
          disabled={upgradableCards.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '18px 20px',
            background: upgradableCards.length > 0
              ? 'linear-gradient(180deg, rgba(170, 102, 68, 0.25) 0%, rgba(170, 102, 68, 0.1) 100%)'
              : 'rgba(30, 30, 40, 0.5)',
            border: upgradableCards.length > 0 ? '2px solid #aa6644' : '2px solid #333',
            borderRadius: '15px',
            color: 'white',
            cursor: upgradableCards.length > 0 ? 'pointer' : 'not-allowed',
            opacity: upgradableCards.length > 0 ? 1 : 0.5,
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            boxShadow: upgradableCards.length > 0 ? '0 4px 20px rgba(170, 102, 68, 0.3)' : 'none'
          }}
        >
          <span style={{
            fontSize: '36px',
            filter: upgradableCards.length > 0 ? 'drop-shadow(0 0 8px rgba(170, 102, 68, 0.6))' : 'grayscale(1)'
          }}>
            {'\u2692\uFE0F'}
          </span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: upgradableCards.length > 0 ? '#ffaa77' : '#666',
              marginBottom: '4px'
            }}>
              Smith
            </div>
            <div style={{
              fontSize: '13px',
              color: upgradableCards.length > 0 ? '#aa8866' : '#444'
            }}>
              Upgrade a card permanently
            </div>
          </div>
          <div style={{
            background: upgradableCards.length > 0 ? 'rgba(170, 102, 68, 0.3)' : 'rgba(50, 50, 50, 0.3)',
            padding: '4px 12px',
            borderRadius: '12px',
            border: `1px solid ${upgradableCards.length > 0 ? '#aa6644' : '#444'}`
          }}>
            <span style={{
              fontSize: '13px',
              color: upgradableCards.length > 0 ? '#ffaa77' : '#555',
              fontWeight: 'bold'
            }}>
              {upgradableCards.length} cards
            </span>
          </div>
        </button>
      </div>

      {/* HP Display */}
      <div style={{
        marginTop: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid #333'
      }}>
        <span style={{ fontSize: '16px' }}>{'\u2764\uFE0F'}</span>
        <span style={{
          color: player.currentHp / player.maxHp > 0.5 ? '#44aa44' : player.currentHp / player.maxHp > 0.25 ? '#aaaa44' : '#aa4444',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {player.currentHp}/{player.maxHp}
        </span>
      </div>
    </div>
  );
};

export default RestSite;
