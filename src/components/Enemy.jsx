import { useState, useEffect, memo } from 'react';
import { INTENT } from '../data/enemies';
import { getEnemyArtInfo } from '../assets/art/art-config';
import { hasImage, preloadEnemyImage } from '../utils/assetLoader';

// ASCII art representations for enemies
const getEnemyArt = (enemyId, type) => {
  const arts = {
    // Act 1 Normal
    cultist: { art: '    ___\n   /   \\\n  | o o |\n   \\___/\n   /| |\\\n    | |\n   _| |_', color: '#9966cc' },
    jawWorm: { art: '  ___\n /   \\\n| o   |\n \\_@_/\n  |||', color: '#8B4513' },
    louse_red: { art: '  .-.\n ( o )\n  \\_/', color: '#cc3333' },
    louse_green: { art: '  .-.\n ( o )\n  \\_/', color: '#33cc33' },
    slime_small: { art: ' ___\n(   )\n ~~~', color: '#44cc44' },
    slime_medium: { art: '  ___\n /   \\\n( o o )\n ~~~~', color: '#44cc44' },
    slime_large: { art: '   ___\n  /   \\\n | o o |\n (     )\n  ~~~~~', color: '#44cc44' },
    spike_slime_small: { art: ' /^\\\n(   )\n ~~~', color: '#4488cc' },
    spike_slime_medium: { art: '  /^\\\n /   \\\n( o o )\n ~~~~', color: '#4488cc' },
    fungiBeast: { art: '   @\n  /|\\\n ( o )\n  |||', color: '#996633' },
    looter: { art: '  ,_,\n (o_o)\n  )_(\n  / \\', color: '#666666' },

    // Act 1 Elite
    gremlinNob: { art: '   ___\n  /   \\\n | >_< |\n  \\___/\n  /| |\\\n  _|||_', color: '#ff6633' },
    lagavulin: { art: ' _____\n|     |\n| -_- |\n|_____|', color: '#446688' },
    sentryA: { art: '  ___\n /   \\\n |[O]|\n |   |\n |___|', color: '#888888' },

    // Act 2 Normal
    chosen: { art: '  ___\n /   \\\n| o_o |\n \\___/\n  /|\\\n  / \\', color: '#cc9933' },
    byrd: { art: '  ___\n /(o)>\n  \\_/', color: '#6699cc' },
    snakePlant: { art: '   @\n  /|\\\n /   \\\n(     )\n |   |', color: '#339933' },
    centurion: { art: '  ___\n [___]\n | o |\n |___|\n  / \\', color: '#cc9944' },
    slaverBlue: { art: '  ___\n /   \\\n| -_- |\n \\___/\n  /|\\\n  / \\', color: '#4466aa' },

    // Act 2 Elite
    bookOfStabbing: { art: ' _____\n|     |\n| \\|/ |\n|  |  |\n|_____|', color: '#993333' },
    gremlinLeader: { art: '   ^\n  /^\\\n | w |\n  \\_/\n  /|\\', color: '#ffcc33' },

    // Act 3 Normal
    writhing_mass: { art: '  @@@\n @o o@\n @   @\n  @@@', color: '#663399' },
    orbWalker: { art: '   O\n  /|\\\n  / \\', color: '#66cccc' },
    spiker: { art: '  /^\\\n /^^^\\\n(  o  )\n \\vvv/', color: '#996666' },
    dagger: { art: '   |\n  \\|/\n   |', color: '#999999' },

    // Act 3 Elite
    giant_head: { art: '  _____\n /     \\\n|  O O  |\n|   o   |\n \\_____/', color: '#888888' },
    reptomancer: { art: '   ^\n  /o\\\n  \\_/\n  /|\\\n ~~|~~', color: '#669966' },

    // Bosses
    slimeBoss: { art: '   _____\n  /     \\\n |  o o  |\n (       )\n  ~~~~~~~', color: '#33cc33' },
    theGuardian: { art: ' _______\n|  ___  |\n| |   | |\n| | O | |\n| |___| |\n|_______|', color: '#4488aa' },
    hexaghost: { art: '   _____\n  / o o \\\n |   ^   |\n | ~~~~~ |\n  \\_____/', color: '#ff6644' },
    theChamp: { art: '   ___\n  /   \\\n |  @  |\n | \\o/ |\n |  |  |\n |_/ \\_|', color: '#ffcc00' },
    awakened_one: { art: '    ^\n   /^\\\n  / o \\\n |  ^  |\n  \\_|_/', color: '#9933ff' },
    timeEater: { art: '  _____\n / 12  \\\n|9  o  3|\n \\ 6  /', color: '#6699cc' },
    corruptHeart: { art: '   ___\n  /   \\\n |  @  |\n | \\|/ |\n  \\___/', color: '#cc3366' }
  };

  if (arts[enemyId]) return arts[enemyId];

  // Default based on type
  if (type === 'boss') return { art: '  ___\n / @ \\\n| O O |\n \\_^_/', color: '#ff4444' };
  if (type === 'elite') return { art: '  ^\n /o\\\n \\_/', color: '#ffcc00' };
  return { art: ' o\n/|\\\n/ \\', color: '#888888' };
};

// Get specific effect label from effects array
const getEffectLabel = (effects) => {
  if (!effects || effects.length === 0) return null;

  const effectNames = {
    weak: 'Weak',
    vulnerable: 'Vuln',
    frail: 'Frail',
    strength: 'Str',
    strengthDown: '-Str',
    dexterity: 'Dex',
    dexterityDown: '-Dex',
    ritual: 'Ritual',
    artifact: 'Artifact',
    thorns: 'Thorns',
    metallicize: 'Metal',
    intangible: 'Intang',
    regen: 'Regen',
    entangle: 'Entangle',
    hex: 'Hex'
  };

  const parts = effects.map(e => {
    const name = effectNames[e.type] || e.type;
    return e.amount ? `${name} ${e.amount}` : name;
  });

  return parts.join(', ');
};

// Get intent icon and color
const getIntentDisplay = (enemy) => {
  if (!enemy.intentData) return { icon: '?', color: '#888', label: 'Unknown' };
  const { intent, damage, times, block, effects } = enemy.intentData;

  const getDamageValue = (dmg) => {
    if (dmg === null || dmg === undefined) return 0;
    if (typeof dmg === 'object' && dmg.min !== undefined) {
      return Math.floor((dmg.min + dmg.max) / 2);
    }
    return dmg;
  };

  // Add enemy strength to displayed damage
  let dmgValue = getDamageValue(damage);
  if (dmgValue > 0 && enemy.strength) {
    dmgValue += enemy.strength;
  }
  // Apply weak debuff to displayed damage (25% reduction)
  if (dmgValue > 0 && enemy.weak > 0) {
    dmgValue = Math.floor(dmgValue * 0.75);
  }
  const totalDmg = times > 1 ? `${dmgValue}x${times}` : dmgValue;

  // Get specific effect labels for buff/debuff intents
  const effectLabel = getEffectLabel(effects);

  switch (intent) {
    case INTENT.ATTACK:
      return { icon: '', color: '#ff4444', label: `${totalDmg}`, isAttack: true };
    case INTENT.ATTACK_BUFF:
      return { icon: '', color: '#ff8844', label: `${totalDmg}`, isAttack: true };
    case INTENT.ATTACK_DEBUFF:
      return { icon: '', color: '#ff44aa', label: effectLabel ? `${totalDmg} +${effectLabel}` : `${totalDmg}`, isAttack: true };
    case INTENT.ATTACK_DEFEND:
      return { icon: '', color: '#ff8866', label: `${totalDmg}`, isAttack: true };
    case INTENT.BUFF:
      return { icon: '', color: '#44ff44', label: effectLabel || 'Buff' };
    case INTENT.DEBUFF:
      return { icon: '', color: '#aa44ff', label: effectLabel || 'Debuff' };
    case INTENT.STRONG_DEBUFF:
      return { icon: '', color: '#ff44ff', label: effectLabel || 'Strong Debuff' };
    case INTENT.DEFEND:
      return { icon: '', color: '#4488ff', label: block ? `${block}` : 'Block' };
    case INTENT.DEFEND_BUFF:
      return { icon: '', color: '#44aaff', label: effectLabel ? `${block || ''} +${effectLabel}` : (block ? `${block}` : 'Defend') };
    case INTENT.SLEEPING:
      return { icon: '', color: '#8888aa', label: 'Zzz' };
    case INTENT.STUN:
      return { icon: '', color: '#ffff44', label: 'Stunned' };
    case INTENT.UNKNOWN:
      return { icon: '?', color: '#666688', label: '???' };
    default:
      return { icon: '?', color: '#888888', label: 'Unknown' };
  }
};

const Enemy = memo(function Enemy({ enemy, onClick, targeted, hideIntents = false, defeated = false }) {
  const [isEntering, setIsEntering] = useState(true);
  const [imageReady, setImageReady] = useState(() => hasImage(enemy.id));
  const [prevBlock, setPrevBlock] = useState(enemy.block || 0);
  const [showBlockGained, setShowBlockGained] = useState(false);
  const hpPercentage = (enemy.currentHp / enemy.maxHp) * 100;

  // Track block changes to trigger animation
  useEffect(() => {
    if (enemy.block > prevBlock) {
      // Block was gained - trigger animation
      setShowBlockGained(true);
      const timer = setTimeout(() => {
        setShowBlockGained(false);
      }, 600);
      return () => clearTimeout(timer);
    }
    setPrevBlock(enemy.block || 0);
  }, [enemy.block, prevBlock]);
  const enemyArt = getEnemyArt(enemy.id, enemy.type);
  const intentDisplay = getIntentDisplay(enemy);
  const isBoss = enemy.type === 'boss';
  const isElite = enemy.type === 'elite';

  // Defeated state styling
  const defeatedStyle = defeated ? {
    filter: 'grayscale(0.8) brightness(0.5)',
    opacity: 0.6
  } : {};

  // Asset pipeline: lazy-load enemy image (don't block initial render)
  useEffect(() => {
    if (!hasImage(enemy.id)) {
      preloadEnemyImage(enemy.id)
        .then(() => setImageReady(true))
        .catch(() => setImageReady(false));
    }
  }, [enemy.id]);

  const artInfo = getEnemyArtInfo(enemy.id);
  const displayName = enemy.name;

  // Boss/Elite entrance animation
  useEffect(() => {
    if (isBoss || isElite) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, isBoss ? 800 : 500);
      return () => clearTimeout(timer);
    } else {
      setIsEntering(false);
    }
  }, [isBoss, isElite]);

  // HP bar color based on percentage
  const getHpColor = () => {
    if (hpPercentage > 60) return { bar: '#44AA44', glow: 'rgba(68, 170, 68, 0.5)' };
    if (hpPercentage > 30) return { bar: '#AAAA44', glow: 'rgba(170, 170, 68, 0.5)' };
    return { bar: '#AA4444', glow: 'rgba(170, 68, 68, 0.5)' };
  };

  const hpColors = getHpColor();

  // Boss-specific idle animations (GD-19)
  const getBossIdleAnimation = (enemyId) => {
    switch (enemyId) {
      case 'hexaghost': return 'hexaghostPulse 2.5s ease-in-out infinite';
      case 'awakened_one': return 'awakenedShift 4s ease-in-out infinite';
      case 'corruptHeart': return 'heartBeat 1.5s ease-in-out infinite';
      default: return 'breathe 3s ease-in-out infinite';
    }
  };

  // Determine animation based on state
  const getAnimation = () => {
    if (isEntering && isBoss) {
      return 'bossEntrance 0.8s ease-out';
    }
    if (isEntering && isElite) {
      return 'fadeIn 0.5s ease-out';
    }
    if (isBoss) return getBossIdleAnimation(enemy.id);
    return 'breathe 4s ease-in-out infinite';
  };

  // Compute sprite rendering values if sprite sheet is available
  const spriteRender = artInfo.sprite ? (() => {
    const displaySize = isBoss ? 100 : isElite ? 85 : 70;
    const scale = displaySize / artInfo.sprite.cellSize;
    return {
      displaySize,
      bgWidth: artInfo.sprite.sheetWidth * scale,
      bgHeight: artInfo.sprite.sheetHeight * scale,
      bgX: artInfo.sprite.x * scale,
      bgY: artInfo.sprite.y * scale,
    };
  })() : null;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isBoss ? '12px 16px' : '10px 12px',
        background: targeted
          ? 'linear-gradient(180deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 100%)'
          : `linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 30, 0.6) 100%)`,
        borderRadius: '12px',
        border: targeted
          ? '2px solid #FFD700'
          : isBoss
            ? '2px solid #cc3366'
            : isElite
              ? '2px solid #ffcc00'
              : '2px solid rgba(255, 255, 255, 0.1)',
        minWidth: isBoss ? '130px' : '100px',
        cursor: defeated ? 'default' : 'pointer',
        touchAction: 'manipulation',
        boxShadow: targeted
          ? '0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 15px rgba(255, 215, 0, 0.1)'
          : isBoss
            ? '0 4px 20px rgba(204, 51, 102, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        transition: isEntering ? 'none' : 'all 0.2s ease',
        animation: defeated ? 'none' : getAnimation(),
        position: 'relative',
        ...defeatedStyle
      }}
    >
      {/* Elite/Boss Badge */}
      {(isBoss || isElite) && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isBoss
            ? 'linear-gradient(180deg, #cc3366 0%, #992244 100%)'
            : 'linear-gradient(180deg, #ffcc00 0%, #cc9900 100%)',
          color: isBoss ? '#fff' : '#000',
          fontSize: '8px',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: isBoss
            ? '0 2px 8px rgba(204, 51, 102, 0.5)'
            : '0 2px 8px rgba(255, 204, 0, 0.5)'
        }}>
          {isBoss ? 'BOSS' : 'ELITE'}
        </div>
      )}

      {/* Intent Display */}
      {!hideIntents ? (
        <div data-testid="enemy-intent" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: `linear-gradient(180deg, ${intentDisplay.color}33 0%, ${intentDisplay.color}11 100%)`,
          border: `1px solid ${intentDisplay.color}66`,
          padding: '4px 10px',
          borderRadius: '15px',
          marginBottom: '8px',
          marginTop: isBoss || isElite ? '6px' : '0',
          animation: intentDisplay.isAttack ? 'intentPulse 1s ease-in-out infinite' : 'none',
          boxShadow: `0 0 10px ${intentDisplay.color}44`
        }}>
          <span style={{
            fontSize: '14px',
            filter: `drop-shadow(0 0 3px ${intentDisplay.color})`
          }}>
            {intentDisplay.icon}
          </span>
          <span style={{
            color: intentDisplay.color,
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: `0 0 5px ${intentDisplay.color}88`
          }}>
            {intentDisplay.label}
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(180deg, #66666633 0%, #66666611 100%)',
          border: '1px solid #66666666',
          padding: '4px 10px',
          borderRadius: '15px',
          marginBottom: '8px',
          marginTop: isBoss || isElite ? '6px' : '0'
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>?</span>
          <span style={{ color: '#666', fontSize: '12px', fontWeight: 'bold' }}>???</span>
        </div>
      )}

      {/* Enemy Visual Representation */}
      <div style={{
        position: 'relative',
        marginBottom: '6px'
      }}>
        {/* Priority: 1) Sprite sheet, 2) Asset pipeline image, 3) Individual art image, 4) ASCII art */}
        {spriteRender ? (
          <div
            role="img"
            aria-label={displayName}
            style={{
              width: `${spriteRender.displaySize}px`,
              height: `${spriteRender.displaySize}px`,
              borderRadius: '8px',
              overflow: 'hidden',
              border: `2px solid ${enemyArt.color}`,
              boxShadow: `0 0 15px ${enemyArt.color}44`,
              backgroundImage: `url(${artInfo.sprite.spriteUrl})`,
              backgroundPosition: `-${spriteRender.bgX}px -${spriteRender.bgY}px`,
              backgroundSize: `${spriteRender.bgWidth}px ${spriteRender.bgHeight}px`,
            }}
          />
        ) : imageReady ? (
          <div style={{
            width: isBoss ? '100px' : isElite ? '85px' : '70px',
            height: isBoss ? '100px' : isElite ? '85px' : '70px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `2px solid ${enemyArt.color}`,
            boxShadow: `0 0 15px ${enemyArt.color}44`
          }}>
            <img
              src={`/images/enemies/${enemy.id}.webp`}
              alt={displayName}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ) : artInfo.hasImage && artInfo.imageUrl ? (
          <div style={{
            width: isBoss ? '100px' : '70px',
            height: isBoss ? '100px' : '70px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `2px solid ${enemyArt.color}`,
            boxShadow: `0 0 15px ${enemyArt.color}44`
          }}>
            <img
              src={artInfo.imageUrl}
              alt={displayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ) : (
          <div style={{
            fontFamily: 'monospace',
            fontSize: isBoss ? '10px' : '9px',
            lineHeight: '1.1',
            color: enemyArt.color,
            textAlign: 'center',
            whiteSpace: 'pre',
            textShadow: `0 0 10px ${enemyArt.color}88`,
            padding: '4px',
            minHeight: isBoss ? '70px' : '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {enemyArt.art}
          </div>
        )}

        {/* Emoji overlay for mobile clarity (only when no image from any pipeline) */}
        {!spriteRender && !imageReady && !artInfo.hasImage && (
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            right: '-5px',
            fontSize: isBoss ? '28px' : '22px',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
          }}>
            {enemy.emoji || ''}
          </div>
        )}
      </div>

      {/* Enemy Name */}
      <div data-testid="enemy-name" style={{
        color: isBoss ? '#ff88aa' : isElite ? '#ffcc66' : 'white',
        fontSize: isBoss ? '13px' : '11px',
        fontWeight: 'bold',
        marginBottom: '6px',
        textAlign: 'center',
        textShadow: isBoss
          ? '0 0 8px rgba(255, 136, 170, 0.5)'
          : '0 1px 2px rgba(0, 0, 0, 0.8)',
        letterSpacing: '0.5px',
        maxWidth: isBoss ? '120px' : '90px'
      }}>
        {displayName}
      </div>

      {/* HP Bar */}
      <div style={{
        width: '100%',
        height: '16px',
        backgroundColor: '#1a1a2a',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid #333',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)'
      }}>
        {/* HP Fill */}
        <div style={{
          width: `${hpPercentage}%`,
          height: '100%',
          background: `linear-gradient(180deg, ${hpColors.bar} 0%, ${hpColors.bar}88 100%)`,
          borderRadius: '7px',
          transition: 'width 0.3s ease',
          boxShadow: `0 0 8px ${hpColors.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
        }} />
        {/* HP Text */}
        <div data-testid="enemy-hp" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.5)'
        }}>
          {enemy.currentHp}/{enemy.maxHp}
        </div>
      </div>

      {/* Block Display - always rendered to prevent layout jumps */}
      <div
        data-testid="enemy-block"
        className={showBlockGained ? 'enemy-block-gained' : ''}
        style={{
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'linear-gradient(180deg, #4488ff44 0%, #4488ff22 100%)',
          border: '1px solid #4488ff',
          padding: '3px 10px',
          borderRadius: '12px',
          boxShadow: showBlockGained
            ? '0 0 20px rgba(68, 136, 255, 0.8), 0 0 40px rgba(68, 136, 255, 0.4)'
            : '0 0 8px rgba(68, 136, 255, 0.4)',
          animation: showBlockGained ? 'enemyBlockAppear 0.5s ease-out' : 'none',
          transition: 'box-shadow 0.3s ease, opacity 0.3s ease',
          opacity: enemy.block > 0 ? 1 : 0,
          pointerEvents: enemy.block > 0 ? 'auto' : 'none'
        }}>
        <span style={{
          fontSize: '14px',
          animation: showBlockGained ? 'shieldIconPulse 0.5s ease-out' : 'none'
        }}>🛡️</span>
        <span style={{
          color: '#88ccff',
          fontSize: '12px',
          fontWeight: 'bold',
          textShadow: '0 0 5px rgba(68, 136, 255, 0.8)'
        }}>
          {enemy.block || 0}
        </span>
      </div>

      {/* Invincible Shield Display */}
      {enemy.invincible > 0 && (
        <div
          data-testid="enemy-invincible"
          style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(180deg, #ff880044 0%, #ff880022 100%)',
            border: '1px solid #ff8800',
            padding: '3px 10px',
            borderRadius: '12px',
            boxShadow: '0 0 8px rgba(255, 136, 0, 0.4)',
            transition: 'opacity 0.3s ease'
          }}>
          <span style={{ fontSize: '14px' }}>🔶</span>
          <span style={{
            color: '#ffcc88',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(255, 136, 0, 0.8)'
          }}>
            {enemy.invincible}
          </span>
        </div>
      )}

      {/* Status Effects */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginTop: '6px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {enemy.strength > 0 && (
          <StatusBadge icon="" value={enemy.strength} color="#ff6666" label="STR" />
        )}
        {enemy.strength < 0 && (
          <StatusBadge icon="" value={enemy.strength} color="#6666ff" label="STR-" />
        )}
        {enemy.vulnerable > 0 && (
          <StatusBadge icon="" value={enemy.vulnerable} color="#ff9944" label="VUL" />
        )}
        {enemy.weak > 0 && (
          <StatusBadge icon="" value={enemy.weak} color="#44cc44" label="WK" />
        )}
        {enemy.ritual > 0 && (
          <StatusBadge icon="" value={enemy.ritual} color="#aa44ff" label="RIT" />
        )}
        {enemy.enrage > 0 && (
          <StatusBadge icon="" value={enemy.enrage} color="#ff4444" label="ENR" />
        )}
        {enemy.thorns > 0 && (
          <StatusBadge icon="" value={enemy.thorns} color="#ff8844" label="THN" />
        )}
        {enemy.metallicize > 0 && (
          <StatusBadge icon="" value={enemy.metallicize} color="#888899" label="MTL" />
        )}
        {enemy.artifact > 0 && (
          <StatusBadge icon="" value={enemy.artifact} color="#ffcc44" label="ART" />
        )}
        {enemy.intangible > 0 && (
          <StatusBadge icon="" value={enemy.intangible} color="#aaaaff" label="INT" />
        )}
      </div>
    </div>
  );
});

// Status Badge Component
const StatusBadge = memo(function StatusBadge({ icon, value, color, _label }) { return (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: `linear-gradient(180deg, ${color}44 0%, ${color}22 100%)`,
    border: `1px solid ${color}88`,
    padding: '2px 6px',
    borderRadius: '8px',
    boxShadow: `0 0 5px ${color}44`
  }}>
    <span style={{ fontSize: '10px' }}>{icon}</span>
    <span style={{
      fontSize: '9px',
      fontWeight: 'bold',
      color: color,
      textShadow: `0 0 3px ${color}88`
    }}>
      {value}
    </span>
  </div>
); });

export default Enemy;
