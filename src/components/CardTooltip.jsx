import { useState, useRef, useCallback } from 'react';
import { getKeywordsInText } from '../data/keywords';

/**
 * CardTooltip - Shows keyword explanations and damage/block preview on card hover.
 * Wraps a card element and shows a tooltip above it after a short delay.
 * UX-02: Lightweight, CSS-positioned, does not block input.
 */
const CardTooltip = ({ card, player, targetEnemy, children }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, 180); // 180ms delay to avoid flicker
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  // Compute effective damage including strength, weak, and target's vulnerable
  const getEffectiveDamage = () => {
    if (!card.damage || typeof card.damage !== 'number') return null;
    const strengthMult = card.strengthMultiplier || 1;
    let dmg = card.damage + (player?.strength || 0) * strengthMult;
    if (player?.weak > 0) dmg = Math.floor(dmg * 0.75);
    // Apply vulnerable from target enemy (50% more damage)
    const hasVulnerable = targetEnemy && targetEnemy.vulnerable > 0;
    if (hasVulnerable) dmg = Math.floor(dmg * 1.5);
    dmg = Math.max(0, dmg);
    const hits = card.hits || 1;
    return { perHit: dmg, hits, total: dmg * hits, hasVulnerable };
  };

  // Compute effective block including dexterity and frail
  const getEffectiveBlock = () => {
    if (!card.block || typeof card.block !== 'number') return null;
    let blk = card.block + (player?.dexterity || 0);
    if (player?.frail > 0) blk = Math.floor(blk * 0.75);
    return Math.max(0, blk);
  };

  // Gather keywords from card description and properties
  const getCardKeywords = () => {
    const keywords = getKeywordsInText(card.description || '');
    if (card.exhaust && !keywords.find(k => k.key === 'exhaust')) {
      keywords.push({ key: 'exhaust', name: 'Exhaust', description: 'When played or discarded, remove from your deck for the rest of combat.' });
    }
    if (card.ethereal && !keywords.find(k => k.key === 'ethereal')) {
      keywords.push({ key: 'ethereal', name: 'Ethereal', description: 'If this card is in your hand at end of turn, it is Exhausted.' });
    }
    if (card.innate && !keywords.find(k => k.key === 'innate')) {
      keywords.push({ key: 'innate', name: 'Innate', description: 'This card will always be in your starting hand.' });
    }
    return keywords;
  };

  const damage = getEffectiveDamage();
  const block = getEffectiveBlock();
  const keywords = getCardKeywords();

  const hasContent = damage !== null || block !== null || keywords.length > 0;

  if (!hasContent) {
    return <>{children}</>;
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {visible && (
        <div
          className="card-tooltip-popup"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            background: 'linear-gradient(180deg, #1e1e30 0%, #14142a 100%)',
            border: '1px solid #555',
            borderRadius: '6px',
            padding: '8px 10px',
            minWidth: '160px',
            maxWidth: '220px',
            zIndex: 200,
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.7), 0 0 8px rgba(100, 100, 200, 0.15)',
            animation: 'tooltipFadeIn 0.15s ease-out',
            color: '#ddd',
            fontSize: '11px',
            lineHeight: '1.4'
          }}
        >
          {/* Damage Preview */}
          {damage !== null && (
            <div style={{ marginBottom: keywords.length > 0 || block !== null ? '6px' : 0 }}>
              <div style={{
                color: '#ff6b6b',
                fontWeight: 'bold',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '10px' }}>&#9876;</span>
                {damage.hits > 1
                  ? `${damage.perHit} x ${damage.hits} = ${damage.total} dmg`
                  : `${damage.total} damage`
                }
              </div>
              {player && (player.strength || 0) !== 0 && (
                <div style={{ color: '#8f8', fontSize: '10px', marginTop: '1px' }}>
                  +{(player.strength || 0) * (card.strengthMultiplier || 1)} from Strength
                </div>
              )}
              {player && player.weak > 0 && (
                <div style={{ color: '#f88', fontSize: '10px', marginTop: '1px' }}>
                  -25% from Weak
                </div>
              )}
              {damage.hasVulnerable && (
                <div style={{ color: '#ff9944', fontSize: '10px', marginTop: '1px' }}>
                  +50% vs Vulnerable
                </div>
              )}
              {card.targetAll && (
                <div style={{ color: '#aaf', fontSize: '10px', marginTop: '1px' }}>
                  Hits ALL enemies
                </div>
              )}
            </div>
          )}

          {/* Block Preview */}
          {block !== null && (
            <div style={{ marginBottom: keywords.length > 0 ? '6px' : 0 }}>
              <div style={{
                color: '#6bc5ff',
                fontWeight: 'bold',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '10px' }}>&#128737;</span>
                {block} Block
              </div>
              {player && (player.dexterity || 0) !== 0 && (
                <div style={{ color: '#8f8', fontSize: '10px', marginTop: '1px' }}>
                  +{player.dexterity || 0} from Dexterity
                </div>
              )}
              {player && player.frail > 0 && (
                <div style={{ color: '#f88', fontSize: '10px', marginTop: '1px' }}>
                  -25% from Frail
                </div>
              )}
            </div>
          )}

          {/* Keyword Explanations */}
          {keywords.length > 0 && (
            <div style={{
              borderTop: (damage !== null || block !== null) ? '1px solid #333' : 'none',
              paddingTop: (damage !== null || block !== null) ? '5px' : 0
            }}>
              {keywords.map(kw => (
                <div key={kw.key} style={{ marginBottom: '3px' }}>
                  <span style={{
                    color: '#ffd700',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {kw.name}
                  </span>
                  <div style={{ color: '#bbb', fontSize: '10px', marginTop: '1px' }}>
                    {kw.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Arrow pointer */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px',
            height: '8px',
            background: '#14142a',
            borderRight: '1px solid #555',
            borderBottom: '1px solid #555'
          }} />
        </div>
      )}
    </div>
  );
};

export default CardTooltip;
