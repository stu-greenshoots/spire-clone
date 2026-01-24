import { useState } from 'react';
import { useGame, GAME_PHASE } from '../context/GameContext';
import { canUsePotion } from '../systems/potionSystem';
import { POTION_COLORS, getPotionImage } from '../assets/art/art-config';

const PotionSlots = () => {
  const { state, usePotion: applyPotion } = useGame();
  const { potions, phase } = state;
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetingSlot, setTargetingSlot] = useState(null);

  const handlePotionClick = (index) => {
    const potion = potions[index];
    if (!potion) return;

    if (selectedSlot === index) {
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot(index);
  };

  const handleUsePotion = (slotIndex) => {
    const potion = potions[slotIndex];
    if (!potion) return;

    // If potion needs a target (single enemy damage/debuff), enter targeting mode
    if (potion.targetType === 'single_enemy' && phase === GAME_PHASE.COMBAT) {
      setTargetingSlot(slotIndex);
      setSelectedSlot(null);
      return;
    }

    applyPotion(slotIndex);
    setSelectedSlot(null);
  };

  const getColors = (potion) => {
    if (!potion) return { primary: '#333', secondary: '#444', glow: 'transparent' };
    return POTION_COLORS[potion.id] || { primary: '#888', secondary: '#aaa', glow: 'rgba(136,136,136,0.3)' };
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span style={{
        color: '#555',
        fontSize: '10px',
        marginRight: '2px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>Potions:</span>

      {potions.map((potion, index) => {
        const colors = getColors(potion);
        const isSelected = selectedSlot === index;
        const isUsable = potion && canUsePotion(potion, state);
        const potionImg = potion ? getPotionImage(potion.id) : null;

        return (
          <div key={index} style={{ position: 'relative' }}>
            {/* Potion display */}
            <div
              onClick={() => handlePotionClick(index)}
              style={{
                cursor: potion ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, filter 0.2s ease',
                transform: isSelected ? 'scale(1.2) translateY(-4px)' : 'scale(1)',
                filter: isSelected ? `drop-shadow(0 0 8px ${colors.glow})` : 'none',
              }}
            >
            {potionImg ? (
              <div style={{
                width: '28px',
                height: '36px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: `2px solid ${colors.primary}88`,
                boxShadow: `0 0 6px ${colors.glow}`,
                position: 'relative'
              }}>
                <img src={potionImg} alt={potion.name} style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} />
                {isUsable && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#44ff44',
                    boxShadow: '0 0 4px #44ff44'
                  }} />
                )}
              </div>
            ) : (
              <svg width="28" height="36" viewBox="0 0 28 36">
                {/* Bottle shape */}
                <defs>
                  <linearGradient id={`potionFill-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={potion ? colors.secondary : '#2a2a2a'} />
                    <stop offset="100%" stopColor={potion ? colors.primary : '#1a1a1a'} />
                  </linearGradient>
                  <linearGradient id={`bottleGlass-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                  </linearGradient>
                </defs>

                {/* Cork/stopper */}
                <rect x="10" y="2" width="8" height="5" rx="2"
                  fill={potion ? '#8B6914' : '#333'}
                  stroke={potion ? '#6B4914' : '#222'}
                  strokeWidth="0.5"
                />

                {/* Bottle neck */}
                <path d="M11 7 L11 12 L7 16 L7 30 Q7 33 10 33 L18 33 Q21 33 21 30 L21 16 L17 12 L17 7 Z"
                  fill={potion ? `url(#potionFill-${index})` : '#1a1a1a'}
                  stroke={potion ? colors.primary : '#333'}
                  strokeWidth="1"
                  opacity={potion ? 1 : 0.5}
                />

                {/* Glass highlight */}
                <path d="M12 13 L10 16 L10 28 Q10 30 12 30 L12 30 L12 13 Z"
                  fill="url(#bottleGlass-${index})"
                  opacity="0.6"
                />

                {/* Liquid bubbles (when filled) */}
                {potion && (
                  <>
                    <circle cx="12" cy="24" r="1.2" fill={colors.secondary} opacity="0.5">
                      <animate attributeName="cy" values="24;20;24" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="16" cy="26" r="0.8" fill={colors.secondary} opacity="0.4">
                      <animate attributeName="cy" values="26;21;26" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Empty slot X */}
                {!potion && (
                  <>
                    <line x1="11" y1="18" x2="17" y2="28" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="17" y1="18" x2="11" y2="28" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}

                {/* Usability indicator dot */}
                {potion && isUsable && (
                  <circle cx="14" cy="33" r="2" fill="#44ff44" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </svg>
            )}
            </div>

            {/* Tooltip/action popup */}
            {isSelected && potion && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  background: 'linear-gradient(180deg, rgba(30, 28, 40, 0.98) 0%, rgba(20, 18, 30, 0.98) 100%)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  border: `2px solid ${colors.primary}88`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 12px ${colors.glow}`,
                  minWidth: '160px',
                  zIndex: 2000,
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '10px',
                  height: '10px',
                  background: 'rgba(20, 18, 30, 0.98)',
                  borderRight: `2px solid ${colors.primary}88`,
                  borderBottom: `2px solid ${colors.primary}88`
                }} />

                <div style={{
                  color: colors.secondary,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  textShadow: `0 0 6px ${colors.glow}`
                }}>
                  {potion.name}
                </div>

                <div style={{
                  color: '#aaa',
                  fontSize: '10px',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {potion.description}
                </div>

                {isUsable && (
                  <button
                    onClick={() => handleUsePotion(index)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: `linear-gradient(180deg, ${colors.primary}cc 0%, ${colors.primary}88 100%)`,
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    {potion.targetType === 'single_enemy' ? 'Select Target' : 'Use'}
                  </button>
                )}

                {!isUsable && (
                  <div style={{
                    color: '#666',
                    fontSize: '9px',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    {phase !== GAME_PHASE.COMBAT && potion.type === 'combat'
                      ? 'Combat only'
                      : 'Cannot use now'}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Targeting mode overlay */}
      {targetingSlot !== null && (
        <div
          onClick={() => setTargetingSlot(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            background: 'rgba(20, 18, 30, 0.95)',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '2px solid #aa4444',
            color: '#ddd',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#ff6666' }}>
              Select a target enemy
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              Click an enemy to use the potion, or click here to cancel
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotionSlots;
