import { memo, useState } from 'react';
import { CARD_TYPES } from '../data/cards';
import { getCardArtInfo } from '../assets/art/art-config';
import { getKeywordsInText } from '../data/keywords';

// Tooltip component for keyword hover descriptions
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline' }}>
      {children}
      {show && <div className="tooltip-popup">{text}</div>}
    </span>
  );
};

// Card art patterns for different card types (using CSS/Unicode visual)
const getCardArt = (card) => {
  const type = card.type;
  const id = card.id || '';

  // Attack cards
  if (type === CARD_TYPES.ATTACK) {
    if (id.includes('strike')) return { icon: '', bg: 'linear-gradient(180deg, #2a1515 0%, #1a0a0a 100%)' };
    if (id.includes('bash') || id.includes('bludgeon')) return { icon: '', bg: 'linear-gradient(180deg, #2a1a15 0%, #1a0a0a 100%)' };
    if (id.includes('cleave') || id.includes('whirlwind')) return { icon: '', bg: 'linear-gradient(180deg, #2a1515 0%, #1a0505 100%)' };
    if (id.includes('iron') || id.includes('heavy')) return { icon: '', bg: 'linear-gradient(180deg, #252525 0%, #151515 100%)' };
    if (id.includes('twin') || id.includes('pommel')) return { icon: '', bg: 'linear-gradient(180deg, #2a1a1a 0%, #1a0a0a 100%)' };
    if (id.includes('body') || id.includes('slam')) return { icon: '', bg: 'linear-gradient(180deg, #2a2015 0%, #1a1005 100%)' };
    if (id.includes('rampage') || id.includes('anger')) return { icon: '', bg: 'linear-gradient(180deg, #3a1010 0%, #200505 100%)' };
    if (id.includes('fire') || id.includes('immolate') || id.includes('burn')) return { icon: '', bg: 'linear-gradient(180deg, #3a2010 0%, #201005 100%)' };
    if (id.includes('reaper') || id.includes('feed')) return { icon: '', bg: 'linear-gradient(180deg, #251520 0%, #150510 100%)' };
    if (id.includes('blood') || id.includes('hemo')) return { icon: '', bg: 'linear-gradient(180deg, #300a0a 0%, #150505 100%)' };
    if (id.includes('perfected')) return { icon: '', bg: 'linear-gradient(180deg, #2a2020 0%, #151010 100%)' };
    return { icon: '', bg: 'linear-gradient(180deg, #2a1515 0%, #1a0a0a 100%)' };
  }

  // Skill cards
  if (type === CARD_TYPES.SKILL) {
    if (id.includes('defend')) return { icon: '', bg: 'linear-gradient(180deg, #152530 0%, #0a1520 100%)' };
    if (id.includes('entrench') || id.includes('barricade')) return { icon: '', bg: 'linear-gradient(180deg, #1a2530 0%, #0a1520 100%)' };
    if (id.includes('flex') || id.includes('limit')) return { icon: '', bg: 'linear-gradient(180deg, #252015 0%, #15100a 100%)' };
    if (id.includes('shrug') || id.includes('armament')) return { icon: '', bg: 'linear-gradient(180deg, #1a2025 0%, #0a1015 100%)' };
    if (id.includes('flame') || id.includes('barrier')) return { icon: '', bg: 'linear-gradient(180deg, #252015 0%, #15100a 100%)' };
    if (id.includes('battle') || id.includes('trance') || id.includes('offering')) return { icon: '', bg: 'linear-gradient(180deg, #201525 0%, #100a15 100%)' };
    if (id.includes('intimidate') || id.includes('disarm')) return { icon: '', bg: 'linear-gradient(180deg, #1a1a25 0%, #0a0a15 100%)' };
    if (id.includes('impervious')) return { icon: '', bg: 'linear-gradient(180deg, #202530 0%, #101520 100%)' };
    if (id.includes('second') || id.includes('wind')) return { icon: '', bg: 'linear-gradient(180deg, #152025 0%, #0a1015 100%)' };
    if (id.includes('warcry') || id.includes('rage')) return { icon: '', bg: 'linear-gradient(180deg, #251a1a 0%, #150a0a 100%)' };
    return { icon: '', bg: 'linear-gradient(180deg, #152535 0%, #0a1520 100%)' };
  }

  // Power cards
  if (type === CARD_TYPES.POWER) {
    if (id.includes('demon') || id.includes('form')) return { icon: '', bg: 'linear-gradient(180deg, #2a1a25 0%, #150a15 100%)' };
    if (id.includes('inflame') || id.includes('combust')) return { icon: '', bg: 'linear-gradient(180deg, #2a2015 0%, #15100a 100%)' };
    if (id.includes('barricade')) return { icon: '', bg: 'linear-gradient(180deg, #252520 0%, #151510 100%)' };
    if (id.includes('berserk') || id.includes('brutal')) return { icon: '', bg: 'linear-gradient(180deg, #2a1515 0%, #150a0a 100%)' };
    if (id.includes('corruption')) return { icon: '', bg: 'linear-gradient(180deg, #1a1525 0%, #0a0a15 100%)' };
    if (id.includes('metal') || id.includes('jugger')) return { icon: '', bg: 'linear-gradient(180deg, #252525 0%, #151515 100%)' };
    if (id.includes('evolve') || id.includes('dark')) return { icon: '', bg: 'linear-gradient(180deg, #201520 0%, #100a10 100%)' };
    if (id.includes('rupture') || id.includes('fire')) return { icon: '', bg: 'linear-gradient(180deg, #2a1a10 0%, #150a05 100%)' };
    return { icon: '', bg: 'linear-gradient(180deg, #252015 0%, #15100a 100%)' };
  }

  // Curse cards
  if (type === CARD_TYPES.CURSE) {
    if (id.includes('pain')) return { icon: '', bg: 'linear-gradient(180deg, #1a0a1a 0%, #0a050a 100%)' };
    if (id.includes('regret')) return { icon: '', bg: 'linear-gradient(180deg, #150a15 0%, #0a050a 100%)' };
    if (id.includes('doubt')) return { icon: '', bg: 'linear-gradient(180deg, #151520 0%, #0a0a10 100%)' };
    if (id.includes('decay')) return { icon: '', bg: 'linear-gradient(180deg, #151510 0%, #0a0a05 100%)' };
    return { icon: '', bg: 'linear-gradient(180deg, #150a15 0%, #0a050a 100%)' };
  }

  // Status cards
  if (type === CARD_TYPES.STATUS) {
    if (id.includes('wound')) return { icon: '', bg: 'linear-gradient(180deg, #201515 0%, #100a0a 100%)' };
    if (id.includes('dazed')) return { icon: '', bg: 'linear-gradient(180deg, #151520 0%, #0a0a10 100%)' };
    if (id.includes('burn')) return { icon: '', bg: 'linear-gradient(180deg, #252010 0%, #151005 100%)' };
    if (id.includes('slime')) return { icon: '', bg: 'linear-gradient(180deg, #102015 0%, #05100a 100%)' };
    if (id.includes('void')) return { icon: '', bg: 'linear-gradient(180deg, #0a0a15 0%, #05050a 100%)' };
    return { icon: '', bg: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' };
  }

  return { icon: '', bg: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)' };
};

// Get the card frame CSS class based on type
const getFrameClass = (card) => {
  const classes = ['card-frame'];
  switch (card.type) {
    case CARD_TYPES.ATTACK: classes.push('card-frame--attack'); break;
    case CARD_TYPES.SKILL: classes.push('card-frame--skill'); break;
    case CARD_TYPES.POWER: classes.push('card-frame--power'); break;
    case CARD_TYPES.CURSE: classes.push('card-frame--curse'); break;
    case CARD_TYPES.STATUS: classes.push('card-frame--status'); break;
    default: break;
  }
  if (card.upgraded) classes.push('card-frame--upgraded');
  return classes.join(' ');
};

// Get the cost orb CSS class based on type
const getCostOrbClass = (card) => {
  const classes = ['card-cost-orb'];
  switch (card.type) {
    case CARD_TYPES.ATTACK: classes.push('card-cost-orb--attack'); break;
    case CARD_TYPES.SKILL: classes.push('card-cost-orb--skill'); break;
    case CARD_TYPES.POWER: classes.push('card-cost-orb--power'); break;
    default: break;
  }
  return classes.join(' ');
};

// Get the rarity indicator CSS class
const getRarityClass = (card) => {
  const classes = ['card-rarity-indicator'];
  switch (card.rarity) {
    case 'common': classes.push('card-rarity--common'); break;
    case 'uncommon': classes.push('card-rarity--uncommon'); break;
    case 'rare': classes.push('card-rarity--rare'); break;
    default: break;
  }
  return classes.join(' ');
};

// Render description text with keyword highlights and tooltips
const renderDescriptionWithKeywords = (text, small) => {
  if (!text) return null;
  const keywords = getKeywordsInText(text);
  if (keywords.length === 0) return text;

  // Build a regex that matches any keyword name
  const keywordNames = keywords.map(k => k.name);
  const pattern = new RegExp(`(${keywordNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const matchedKeyword = keywords.find(k => k.name.toLowerCase() === part.toLowerCase());
    if (matchedKeyword) {
      if (small) {
        // In small mode, just show the underline without tooltip
        return (
          <span key={index} className="keyword-highlight">
            {part}
          </span>
        );
      }
      return (
        <Tooltip key={index} text={matchedKeyword.description}>
          <span className="keyword-highlight">{part}</span>
        </Tooltip>
      );
    }
    return part;
  });
};

const Card = memo(function Card({ card, onClick, selected, disabled, small, player, targetEnemy }) {
  const artInfo = getCardArtInfo(card.id);

  const getCardColor = () => {
    switch (card.type) {
      case CARD_TYPES.ATTACK: return { main: '#c41e3a', dark: '#8B0000', light: '#ff3050' };
      case CARD_TYPES.SKILL: return { main: '#0078d4', dark: '#004488', light: '#40a0ff' };
      case CARD_TYPES.POWER: return { main: '#d4a017', dark: '#8B6914', light: '#ffc040' };
      case CARD_TYPES.CURSE: return { main: '#6a0dad', dark: '#330066', light: '#9030d0' };
      case CARD_TYPES.STATUS: return { main: '#505050', dark: '#303030', light: '#707070' };
      default: return { main: '#505050', dark: '#303030', light: '#707070' };
    }
  };

  const getRarityColor = () => {
    switch (card.rarity) {
      case 'rare': return { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' };
      case 'uncommon': return { color: '#00BFFF', glow: 'rgba(0, 191, 255, 0.5)' };
      default: return { color: '#666666', glow: 'rgba(100, 100, 100, 0.3)' };
    }
  };

  const colors = getCardColor();
  const rarity = getRarityColor();
  const cardArt = getCardArt(card);

  // Compute adjusted damage/block values based on player stats and target modifiers
  const getAdjustedDescription = () => {
    if (!player || !card.description) return { text: card.description, modified: false };

    let desc = card.description;
    let modified = false;

    // Calculate adjusted damage
    if (card.damage && typeof card.damage === 'number') {
      const strengthMult = card.strengthMultiplier || 1;
      let adjustedDmg = card.damage + (player.strength || 0) * strengthMult;
      if (player.weak > 0) adjustedDmg = Math.floor(adjustedDmg * 0.75);
      // Apply vulnerable from target enemy (50% more damage)
      if (targetEnemy && targetEnemy.vulnerable > 0) {
        adjustedDmg = Math.floor(adjustedDmg * 1.5);
      }
      adjustedDmg = Math.max(0, adjustedDmg);

      if (adjustedDmg !== card.damage) {
        modified = true;
        // Replace the first number that matches the base damage in context of "Deal X damage"
        desc = desc.replace(
          new RegExp(`(Deal\\s+)${card.damage}(\\s+damage)`),
          `$1${adjustedDmg}$2`
        );
        // Also handle "X damage" patterns without "Deal" prefix
        if (desc.includes(`${card.damage} damage`) && adjustedDmg !== card.damage) {
          desc = desc.replace(
            new RegExp(`${card.damage}(\\s+damage)`),
            `${adjustedDmg}$1`
          );
        }
      }
    }

    // Calculate adjusted block
    if (card.block && typeof card.block === 'number') {
      let adjustedBlock = card.block + (player.dexterity || 0);
      if (player.frail > 0) adjustedBlock = Math.floor(adjustedBlock * 0.75);
      adjustedBlock = Math.max(0, adjustedBlock);

      if (adjustedBlock !== card.block) {
        modified = true;
        desc = desc.replace(
          new RegExp(`(Gain\\s+)${card.block}(\\s+Block)`),
          `$1${adjustedBlock}$2`
        );
      }
    }

    return { text: desc, modified };
  };

  const adjustedDesc = getAdjustedDescription();
  const getDescColor = () => {
    if (!adjustedDesc.modified || !player) return '#ddd';
    // Check if damage is buffed or nerfed
    if (card.damage && typeof card.damage === 'number') {
      const strengthMult = card.strengthMultiplier || 1;
      let adj = card.damage + (player.strength || 0) * strengthMult;
      if (player.weak > 0) adj = Math.floor(adj * 0.75);
      // Apply vulnerable from target enemy
      if (targetEnemy && targetEnemy.vulnerable > 0) {
        adj = Math.floor(adj * 1.5);
      }
      if (adj > card.damage) return '#88ff88';
      if (adj < card.damage) return '#ff8888';
    }
    // Check if block is buffed or nerfed
    if (card.block && typeof card.block === 'number') {
      let adj = card.block + (player.dexterity || 0);
      if (player.frail > 0) adj = Math.floor(adj * 0.75);
      if (adj > card.block) return '#88ff88';
      if (adj < card.block) return '#ff8888';
    }
    return '#ddd';
  };
  const descColor = getDescColor();

  // Calculate damage preview value including target modifiers
  const getDamagePreview = () => {
    if (!card.damage || typeof card.damage !== 'number') return null;
    const strengthMult = card.strengthMultiplier || 1;
    let dmg = card.damage;
    if (player) {
      dmg = card.damage + (player.strength || 0) * strengthMult;
      if (player.weak > 0) dmg = Math.floor(dmg * 0.75);
    }
    // Apply vulnerable from target enemy (50% more damage)
    if (targetEnemy && targetEnemy.vulnerable > 0) {
      dmg = Math.floor(dmg * 1.5);
    }
    return Math.max(0, dmg);
  };

  const damagePreview = getDamagePreview();

  const cardWidth = small ? 75 : 100;
  const cardHeight = small ? 110 : 145;

  // Build frame and rarity class names
  const frameClass = getFrameClass(card);
  const costOrbClass = getCostOrbClass(card);
  const rarityClass = getRarityClass(card);

  // Get the type-specific accent color for the left border
  const getTypeAccentColor = () => {
    switch (card.type) {
      case CARD_TYPES.ATTACK: return 'rgba(200, 50, 50, 0.85)';
      case CARD_TYPES.SKILL: return 'rgba(50, 100, 200, 0.85)';
      case CARD_TYPES.POWER: return 'rgba(200, 170, 50, 0.85)';
      case CARD_TYPES.CURSE: return 'rgba(120, 40, 160, 0.7)';
      case CARD_TYPES.STATUS: return 'rgba(100, 100, 100, 0.7)';
      default: return 'rgba(100, 100, 100, 0.5)';
    }
  };

  const typeAccent = getTypeAccentColor();

  return (
    <div
      className={frameClass}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${card.name}, ${card.type}, cost ${card.cost === -1 ? 'X' : card.cost}${card.upgraded ? ', upgraded' : ''}${disabled ? ', unavailable' : ''}`}
      aria-disabled={disabled || undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={!disabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        background: `linear-gradient(180deg, ${colors.main}22 0%, ${colors.dark} 100%)`,
        border: selected ? `3px solid #FFD700` : `2px solid ${rarity.color}`,
        borderLeft: selected ? `3px solid #FFD700` : `4px solid ${typeAccent}`,
        borderRadius: '10px',
        padding: '3px',
        display: 'flex',
        flexDirection: 'column',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        color: 'white',
        boxShadow: selected
          ? `0 0 20px rgba(255, 215, 0, 0.8), 0 8px 25px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(255, 215, 0, 0.2)`
          : `0 4px 15px rgba(0, 0, 0, 0.4), 0 2px 5px ${rarity.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 3px 0 8px ${colors.main}33`,
        transform: selected ? 'scale(1.12) translateY(-15px)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        flexShrink: 0,
        touchAction: 'manipulation',
        overflow: 'hidden'
      }}
    >
      {/* Card Frame Gradient Overlay with type-tinted top edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${colors.main}18 0%, transparent 40%, rgba(0,0,0,0.2) 100%)`,
        borderRadius: '8px',
        pointerEvents: 'none'
      }} />

      {/* Type accent glow strip at the top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: small ? '2px' : '3px',
        background: `linear-gradient(90deg, transparent 0%, ${colors.main} 30%, ${colors.light} 50%, ${colors.main} 70%, transparent 100%)`,
        borderRadius: '8px 8px 0 0',
        opacity: 0.7,
        pointerEvents: 'none'
      }} />

      {/* Energy Cost Orb */}
      {card.cost >= 0 && (
        <div className={costOrbClass} style={{
          position: 'absolute',
          top: '-6px',
          left: '-6px',
          width: small ? '22px' : '28px',
          height: small ? '22px' : '28px',
          background: 'radial-gradient(circle at 30% 30%, #555 0%, #222 70%, #111 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: small ? '12px' : '15px',
          border: '2px solid #888',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
          color: card.cost > 2 ? '#FF6666' : '#FFD700',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
          zIndex: 10
        }}>
          {card.cost === -1 ? 'X' : card.cost}
        </div>
      )}

      {/* Card Art Area */}
      <div style={{
        height: small ? '35px' : '50px',
        margin: small ? '8px 4px 2px 4px' : '12px 6px 4px 6px',
        background: cardArt.bg,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: small ? '20px' : '28px',
        border: `1px solid ${colors.main}66`,
        boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.05)`,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Show sprite sheet, individual image, or fallback icon */}
        {artInfo.sprite ? (
          (() => {
            const displayWidth = small ? 67 : 88;
            const scale = displayWidth / artInfo.sprite.cellSize;
            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${artInfo.sprite.spriteUrl})`,
                  backgroundPosition: `-${artInfo.sprite.x * scale}px -${artInfo.sprite.y * scale}px`,
                  backgroundSize: `${artInfo.sprite.sheetWidth * scale}px ${artInfo.sprite.sheetHeight * scale}px`,
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '3px'
                }}
              />
            );
          })()
        ) : artInfo.hasImage ? (
          <img
            src={artInfo.imageUrl}
            alt={card.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '3px'
            }}
          />
        ) : (
          cardArt.icon
        )}
      </div>

      {/* Card Name Banner */}
      <div style={{
        background: `linear-gradient(90deg, ${colors.dark}00 0%, ${colors.dark} 15%, ${colors.dark} 85%, ${colors.dark}00 100%)`,
        padding: small ? '2px 4px' : '3px 6px',
        marginTop: '2px',
        minHeight: small ? '12px' : '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: card.name.length > 14 ? (small ? '7px' : '9px') : (small ? '8px' : '10px'),
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
          letterSpacing: card.name.length > 14 ? '0.3px' : '0.5px',
          lineHeight: '1.1',
          wordBreak: 'break-word',
          hyphens: 'auto'
        }}>
          {card.name}
        </div>
      </div>

      {/* Card Type Badge */}
      <div style={{
        fontSize: small ? '6px' : '7px',
        textAlign: 'center',
        color: colors.light,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginTop: '1px',
        fontWeight: '600',
        background: `linear-gradient(90deg, transparent 0%, ${colors.main}25 30%, ${colors.main}25 70%, transparent 100%)`,
        padding: small ? '1px 2px' : '1px 4px',
        borderRadius: '2px'
      }}>
        {card.type}
      </div>

      {/* Card Description with Keyword Highlights */}
      <div style={{
        flex: 1,
        fontSize: small ? '6px' : '8px',
        textAlign: 'center',
        padding: small ? '2px 4px' : '4px 6px',
        color: descColor,
        lineHeight: '1.35',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <span style={{
          textShadow: adjustedDesc.modified
            ? `0 0 4px ${descColor}88, 0 1px 2px rgba(0, 0, 0, 0.5)`
            : '0 1px 2px rgba(0, 0, 0, 0.5)'
        }}>
          {renderDescriptionWithKeywords(adjustedDesc.text, small)}
        </span>
        {/* Damage Preview */}
        {damagePreview !== null && !small && (
          <span className="damage-preview">
            {damagePreview} dmg
          </span>
        )}
      </div>

      {/* Rarity Indicator */}
      {card.rarity && card.rarity !== 'basic' && (
        <div className={rarityClass} style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: small ? '6px' : '8px',
          height: small ? '6px' : '8px',
          background: `radial-gradient(circle at 30% 30%, ${rarity.color} 0%, ${rarity.color}88 100%)`,
          borderRadius: '50%',
          boxShadow: `0 0 6px ${rarity.glow}, inset 0 -1px 2px rgba(0, 0, 0, 0.3)`,
          border: `1px solid ${rarity.color}88`
        }} />
      )}

      {/* Upgraded Indicator */}
      {card.upgraded && (
        <div style={{
          position: 'absolute',
          bottom: '3px',
          right: '5px',
          color: '#00FF88',
          fontSize: small ? '10px' : '14px',
          fontWeight: 'bold',
          textShadow: '0 0 6px rgba(0, 255, 136, 0.8), 0 1px 2px rgba(0, 0, 0, 0.8)'
        }}>
          +
        </div>
      )}

      {/* Selection Glow Animation */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '8px',
          animation: 'cardGlow 1.5s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
});

export default Card;
