import { INTENT } from '../data/enemies';
import { getRalphEnemyName } from '../assets/art/art-config';

// Status effect descriptions for enemies
const STATUS_DESCRIPTIONS = {
  strength: {
    name: 'Strength',
    icon: '\uD83D\uDCAA',
    color: '#ff6666',
    desc: 'Increases damage dealt by attacks',
    isBuff: true
  },
  vulnerable: {
    name: 'Vulnerable',
    icon: '\uD83D\uDCA5',
    color: '#ff9944',
    desc: 'Takes 50% more damage from attacks',
    isBuff: false
  },
  weak: {
    name: 'Weak',
    icon: '\uD83D\uDCA7',
    color: '#44cc44',
    desc: 'Deals 25% less damage with attacks',
    isBuff: false
  },
  frail: {
    name: 'Frail',
    icon: '\uD83E\uDDB4',
    color: '#aa88aa',
    desc: 'Gains 25% less block from cards',
    isBuff: false
  },
  poison: {
    name: 'Poison',
    icon: '\u2620\uFE0F',
    color: '#88cc44',
    desc: 'Loses HP at the start of turn, then decreases by 1',
    isBuff: false
  },
  ritual: {
    name: 'Ritual',
    icon: '\uD83D\uDD2E',
    color: '#aa44ff',
    desc: 'Gains Strength at the end of each turn',
    isBuff: true
  },
  thorns: {
    name: 'Thorns',
    icon: '\uD83C\uDF35',
    color: '#ff8844',
    desc: 'Deals damage when attacked',
    isBuff: true
  },
  metallicize: {
    name: 'Metallicize',
    icon: '\uD83D\uDEE1\uFE0F',
    color: '#888899',
    desc: 'Gains Block at the end of each turn',
    isBuff: true
  },
  artifact: {
    name: 'Artifact',
    icon: '\uD83D\uDC8E',
    color: '#ffcc44',
    desc: 'Negates the next debuff applied',
    isBuff: true
  },
  enrage: {
    name: 'Enrage',
    icon: '\uD83D\uDCA2',
    color: '#ff4444',
    desc: 'Gains Strength when you play a Skill',
    isBuff: true
  },
  dexterity: {
    name: 'Dexterity',
    icon: '\uD83C\uDFAF',
    color: '#66ff66',
    desc: 'Gains additional Block from block actions',
    isBuff: true
  }
};

// Intent descriptions
const INTENT_DESCRIPTIONS = {
  [INTENT.ATTACK]: 'Planning to attack',
  [INTENT.ATTACK_BUFF]: 'Planning to attack and buff',
  [INTENT.ATTACK_DEBUFF]: 'Planning to attack and debuff you',
  [INTENT.ATTACK_DEFEND]: 'Planning to attack and gain block',
  [INTENT.BUFF]: 'Planning to buff itself',
  [INTENT.DEBUFF]: 'Planning to debuff you',
  [INTENT.STRONG_DEBUFF]: 'Planning a powerful debuff',
  [INTENT.DEFEND]: 'Planning to gain block',
  [INTENT.DEFEND_BUFF]: 'Planning to defend and buff',
  [INTENT.SLEEPING]: 'Currently sleeping...',
  [INTENT.STUN]: 'Stunned and unable to act',
  [INTENT.UNKNOWN]: 'Intent unknown'
};

const EnemyInfoPanel = ({ enemy, onClose, showRalphTheme = true }) => {
  if (!enemy) return null;

  const hpPercentage = (enemy.currentHp / enemy.maxHp) * 100;
  const ralphName = showRalphTheme ? getRalphEnemyName(enemy.id) : null;
  const displayName = ralphName || enemy.name;
  const isBoss = enemy.type === 'boss';
  const isElite = enemy.type === 'elite';

  // HP bar color based on percentage
  const getHpColor = () => {
    if (hpPercentage > 60) return { bar: '#44AA44', glow: 'rgba(68, 170, 68, 0.5)' };
    if (hpPercentage > 30) return { bar: '#AAAA44', glow: 'rgba(170, 170, 68, 0.5)' };
    return { bar: '#AA4444', glow: 'rgba(170, 68, 68, 0.5)' };
  };

  const hpColors = getHpColor();

  // Get damage value from intent (including strength and weak)
  const getDamageValue = (dmg) => {
    if (dmg === null || dmg === undefined) return 0;
    let baseDmg = dmg;
    if (typeof baseDmg === 'object' && baseDmg.min !== undefined) {
      baseDmg = Math.floor((baseDmg.min + baseDmg.max) / 2);
    }
    // Add enemy strength
    if (enemy.strength) {
      baseDmg += enemy.strength;
    }
    // Apply weak debuff (25% reduction)
    if (enemy.weak > 0) {
      baseDmg = Math.floor(baseDmg * 0.75);
    }
    return baseDmg;
  };

  // Collect all active buffs and debuffs
  const getStatusEffects = () => {
    const effects = [];

    if (enemy.strength > 0) effects.push({ ...STATUS_DESCRIPTIONS.strength, value: enemy.strength });
    if (enemy.dexterity > 0) effects.push({ ...STATUS_DESCRIPTIONS.dexterity, value: enemy.dexterity });
    if (enemy.vulnerable > 0) effects.push({ ...STATUS_DESCRIPTIONS.vulnerable, value: enemy.vulnerable });
    if (enemy.weak > 0) effects.push({ ...STATUS_DESCRIPTIONS.weak, value: enemy.weak });
    if (enemy.frail > 0) effects.push({ ...STATUS_DESCRIPTIONS.frail, value: enemy.frail });
    if (enemy.poison > 0) effects.push({ ...STATUS_DESCRIPTIONS.poison, value: enemy.poison });
    if (enemy.ritual > 0) effects.push({ ...STATUS_DESCRIPTIONS.ritual, value: enemy.ritual });
    if (enemy.thorns > 0) effects.push({ ...STATUS_DESCRIPTIONS.thorns, value: enemy.thorns });
    if (enemy.metallicize > 0) effects.push({ ...STATUS_DESCRIPTIONS.metallicize, value: enemy.metallicize });
    if (enemy.artifact > 0) effects.push({ ...STATUS_DESCRIPTIONS.artifact, value: enemy.artifact });
    if (enemy.enrage > 0) effects.push({ ...STATUS_DESCRIPTIONS.enrage, value: enemy.enrage });

    return effects;
  };

  const statusEffects = getStatusEffects();
  const buffs = statusEffects.filter(e => e.isBuff);
  const debuffs = statusEffects.filter(e => !e.isBuff);

  // Get intent info
  const intentData = enemy.intentData;
  const intentDescription = intentData ? INTENT_DESCRIPTIONS[intentData.intent] || 'Unknown intent' : 'Waiting...';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        animation: 'fadeIn 0.2s ease',
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          borderRadius: '16px',
          border: isBoss
            ? '3px solid #cc3366'
            : isElite
              ? '3px solid #ffcc00'
              : '2px solid #444',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: isBoss
            ? '0 0 40px rgba(204, 51, 102, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : isElite
              ? '0 0 40px rgba(255, 204, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 10px 40px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: isBoss
            ? 'linear-gradient(180deg, rgba(204, 51, 102, 0.3) 0%, rgba(204, 51, 102, 0.1) 100%)'
            : isElite
              ? 'linear-gradient(180deg, rgba(255, 204, 0, 0.2) 0%, rgba(255, 204, 0, 0.05) 100%)'
              : 'linear-gradient(180deg, rgba(100, 100, 150, 0.2) 0%, transparent 100%)',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Enemy type badge */}
            {(isBoss || isElite) && (
              <span style={{
                background: isBoss
                  ? 'linear-gradient(180deg, #cc3366 0%, #992244 100%)'
                  : 'linear-gradient(180deg, #ffcc00 0%, #cc9900 100%)',
                color: isBoss ? '#fff' : '#000',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {isBoss ? 'BOSS' : 'ELITE'}
              </span>
            )}
            <h2 style={{
              margin: 0,
              color: isBoss ? '#ff88aa' : isElite ? '#ffcc66' : '#fff',
              fontSize: '20px',
              fontWeight: 'bold',
              textShadow: isBoss
                ? '0 0 10px rgba(255, 136, 170, 0.5)'
                : '0 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
              {displayName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #444',
              color: '#888',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            x
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* HP Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>{'\u2764\uFE0F'}</span>
              <span style={{ color: '#aaa', fontSize: '14px', fontWeight: 'bold' }}>Health</span>
            </div>
            <div style={{
              background: '#0a0a15',
              borderRadius: '10px',
              padding: '4px',
              border: '1px solid #333'
            }}>
              <div style={{
                height: '24px',
                background: '#1a1a2a',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${hpPercentage}%`,
                  height: '100%',
                  background: `linear-gradient(180deg, ${hpColors.bar} 0%, ${hpColors.bar}88 100%)`,
                  borderRadius: '7px',
                  transition: 'width 0.3s ease',
                  boxShadow: `0 0 10px ${hpColors.glow}`
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
                }}>
                  {enemy.currentHp} / {enemy.maxHp}
                </div>
              </div>
            </div>
          </div>

          {/* Block Section */}
          {enemy.block > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(180deg, rgba(68, 136, 255, 0.2) 0%, rgba(68, 136, 255, 0.05) 100%)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(68, 136, 255, 0.4)'
              }}>
                <span style={{ fontSize: '24px' }}>{'\uD83D\uDEE1\uFE0F'}</span>
                <div>
                  <div style={{ color: '#88ccff', fontSize: '18px', fontWeight: 'bold' }}>
                    {enemy.block} Block
                  </div>
                  <div style={{ color: '#668899', fontSize: '12px' }}>
                    Absorbs incoming damage
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Intent Section */}
          {intentData && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>{'\uD83C\uDFAF'}</span>
                <span style={{ color: '#aaa', fontSize: '14px', fontWeight: 'bold' }}>Next Action</span>
              </div>
              <div style={{
                background: 'rgba(255, 100, 100, 0.1)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 100, 100, 0.3)'
              }}>
                <div style={{ color: '#ff8888', fontSize: '14px', marginBottom: '4px' }}>
                  {intentDescription}
                </div>
                {intentData.damage !== undefined && intentData.damage !== null && (
                  <div style={{
                    color: '#ff4444',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{'\u2694\uFE0F'}</span>
                    {getDamageValue(intentData.damage)}
                    {intentData.times > 1 && (
                      <span style={{ color: '#ff8888', fontSize: '14px' }}>
                        x{intentData.times} hits
                      </span>
                    )}
                  </div>
                )}
                {intentData.block !== undefined && intentData.block > 0 && (
                  <div style={{
                    color: '#4488ff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '4px'
                  }}>
                    <span>{'\uD83D\uDEE1\uFE0F'}</span>
                    +{intentData.block} Block
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buffs Section */}
          {buffs.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>{'\u2B06\uFE0F'}</span>
                <span style={{ color: '#44ff44', fontSize: '14px', fontWeight: 'bold' }}>Buffs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {buffs.map((buff, idx) => (
                  <StatusEffectRow key={idx} effect={buff} />
                ))}
              </div>
            </div>
          )}

          {/* Debuffs Section */}
          {debuffs.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>{'\u2B07\uFE0F'}</span>
                <span style={{ color: '#ff4444', fontSize: '14px', fontWeight: 'bold' }}>Debuffs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {debuffs.map((debuff, idx) => (
                  <StatusEffectRow key={idx} effect={debuff} />
                ))}
              </div>
            </div>
          )}

          {/* No effects message */}
          {statusEffects.length === 0 && !enemy.block && (
            <div style={{
              color: '#666',
              textAlign: 'center',
              padding: '20px',
              fontStyle: 'italic'
            }}>
              No active status effects
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid #333',
          textAlign: 'center'
        }}>
          <span style={{ color: '#666', fontSize: '12px' }}>
            Tap outside to close
          </span>
        </div>
      </div>
    </div>
  );
};

// Status Effect Row Component
const StatusEffectRow = ({ effect }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: `linear-gradient(90deg, ${effect.color}22 0%, transparent 100%)`,
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${effect.color}44`
  }}>
    <span style={{
      fontSize: '20px',
      filter: `drop-shadow(0 0 4px ${effect.color})`
    }}>
      {effect.icon}
    </span>
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '2px'
      }}>
        <span style={{
          color: effect.color,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {effect.name}
        </span>
        <span style={{
          background: effect.color,
          color: effect.isBuff ? '#000' : '#fff',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {effect.value}
        </span>
      </div>
      <div style={{
        color: '#888',
        fontSize: '11px',
        lineHeight: '1.3'
      }}>
        {effect.desc}
      </div>
    </div>
  </div>
);

export default EnemyInfoPanel;
