import { useState } from 'react';
import { useGame, GAME_PHASE } from '../context/GameContext';

// Status descriptions for tooltips
const STATUS_DESCRIPTIONS = {
  STR: { name: 'Strength', desc: 'Deals additional damage with attacks', buff: true },
  DEX: { name: 'Dexterity', desc: 'Gains additional block from cards', buff: true },
  VUL: { name: 'Vulnerable', desc: 'Takes 50% more damage from attacks', buff: false },
  WEAK: { name: 'Weak', desc: 'Deals 25% less damage with attacks', buff: false },
  FRAIL: { name: 'Frail', desc: 'Gains 25% less block from cards', buff: false },
  ARTIFACT: { name: 'Artifact', desc: 'Negates debuffs applied to you', buff: true },
  THORNS: { name: 'Thorns', desc: 'Deal damage when attacked', buff: true },
  REGEN: { name: 'Regeneration', desc: 'Heal HP at start of turn', buff: true },
  INTANGIBLE: { name: 'Intangible', desc: 'Reduce all damage to 1', buff: true },
  METALLICIZE: { name: 'Metallicize', desc: 'Gain block at end of turn', buff: true },
  BARRICADE: { name: 'Barricade', desc: 'Block is not removed at turn start', buff: true },
  DEMONFORM: { name: 'Demon Form', desc: 'Gain Strength each turn', buff: true },
  BERSERK: { name: 'Berserk', desc: 'Gain Energy each turn', buff: true },
  PLATEDARMOR: { name: 'Plated Armor', desc: 'Gain block each turn, loses 1 when hit', buff: true },
  FLIGHT: { name: 'Flight', desc: 'Take 50% damage, loses on hit', buff: true },
  HEX: { name: 'Hex', desc: 'Add Dazed when playing non-attacks', buff: false },
  RAGE: { name: 'Rage', desc: 'Gain block when playing attacks', buff: true },
  DOUBLETAP: { name: 'Double Tap', desc: 'Next attack is played twice', buff: true },
  CORRUPTION: { name: 'Corruption', desc: 'Skills cost 0 and exhaust', buff: true },
  DARKEMBRACE: { name: 'Dark Embrace', desc: 'Draw card when exhausting', buff: true },
  FEELNOPAIN: { name: 'Feel No Pain', desc: 'Gain block when exhausting', buff: true },
  FLAMEBARRIER: { name: 'Flame Barrier', desc: 'Deal damage when attacked', buff: true },
  EVOLVE: { name: 'Evolve', desc: 'Draw when drawing Status', buff: true },
  FIREBREATHING: { name: 'Fire Breathing', desc: 'Deal damage when drawing Status/Curse', buff: true },
  JUGGERNAUT: { name: 'Juggernaut', desc: 'Deal damage when gaining block', buff: true },
  RUPTURE: { name: 'Rupture', desc: 'Gain Strength when losing HP from cards', buff: true },
  BRUTALITY: { name: 'Brutality', desc: 'Draw a card at turn start, lose HP', buff: true },
  'NO DRAW': { name: 'No Draw', desc: 'Cannot draw cards next turn', buff: false }
};

// Compact Status Badge Component
const StatusBadge = ({ icon, label, value, color, positive, onClick }) => {
  const statusInfo = STATUS_DESCRIPTIONS[label] || { name: label, desc: '', buff: positive };
  const isBuff = statusInfo.buff || positive;

  return (
    <div
      onClick={() => onClick && onClick({ ...statusInfo, icon, value, color, isBuff })}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: `linear-gradient(180deg, ${color}55 0%, ${color}33 100%)`,
        padding: '4px 8px',
        borderRadius: '8px',
        border: `2px solid ${color}aa`,
        boxShadow: `0 0 8px ${color}44`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '50px'
      }}
    >
      <span style={{
        fontSize: '16px',
        filter: `drop-shadow(0 0 4px ${color})`
      }}>{icon}</span>
      <span style={{
        color: color,
        fontSize: '14px',
        fontWeight: 'bold',
        textShadow: `0 0 6px ${color}`
      }}>
        {typeof value === 'number' && isBuff && value > 0 ? '+' : ''}{value}
      </span>
    </div>
  );
};

const PlayerStatusBar = () => {
  const { state } = useGame();
  const { player, phase } = state;
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Don't show on main menu (no game data yet)
  if (phase === GAME_PHASE.MAIN_MENU) {
    return null;
  }

  // Check if there are any buffs or debuffs to display
  const hasBuffs = player.strength > 0 || player.dexterity > 0 || player.artifact > 0 ||
    player.thorns > 0 || player.metallicize > 0 || player.intangible > 0 ||
    player.regen > 0 || player.barricade || player.demonForm > 0 || player.berserk > 0 ||
    player.platedArmor > 0 || player.flight > 0 || player.rage > 0 || player.doubleTap > 0 ||
    player.corruption || player.darkEmbrace || player.feelNoPain > 0 || player.flameBarrier > 0 ||
    player.evolve > 0 || player.fireBreathing > 0 || player.juggernaut > 0 || player.rupture > 0 ||
    player.brutality;

  const hasDebuffs = player.strength < 0 || player.dexterity < 0 ||
    player.vulnerable > 0 || player.weak > 0 || player.frail > 0 || player.hex > 0 ||
    player.noDrawNextTurn;

  const hasBlock = player.block > 0;

  // Don't show if nothing to display
  if (!hasBuffs && !hasDebuffs && !hasBlock) {
    return null;
  }

  return (
    <div style={{
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      padding: '14px 20px',
      background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.98) 0%, rgba(5, 5, 15, 1) 100%)',
      borderTop: '3px solid #555',
      boxShadow: '0 -6px 30px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.05)',
      flexWrap: 'wrap',
      flexShrink: 0
    }}>
      {/* Block Display - Large and prominent */}
      {hasBlock && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          background: 'linear-gradient(180deg, rgba(68, 136, 255, 0.5) 0%, rgba(68, 136, 255, 0.25) 100%)',
          borderRadius: '16px',
          border: '4px solid rgba(100, 180, 255, 0.9)',
          boxShadow: '0 0 30px rgba(68, 136, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.15)',
          animation: 'glowPulse 2s infinite'
        }}>
          <span style={{
            fontSize: '36px',
            filter: 'drop-shadow(0 0 12px rgba(68, 136, 255, 1))'
          }}>{'\uD83D\uDEE1\uFE0F'}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '12px',
              color: '#bbddff',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 'bold'
            }}>Block</span>
            <span style={{
              color: '#aaddff',
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '0 0 15px rgba(68, 136, 255, 1)'
            }}>
              {player.block}
            </span>
          </div>
        </div>
      )}

      {/* Divider if block and other statuses */}
      {hasBlock && (hasBuffs || hasDebuffs) && (
        <div style={{ width: '2px', height: '50px', background: '#444' }} />
      )}

      {/* Buffs Section */}
      {hasBuffs && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {player.strength > 0 && (
            <StatusBadge
              icon={'\uD83D\uDCAA'}
              label="STR"
              value={player.strength}
              color="#ff6666"
              positive={true}
              onClick={setSelectedStatus}
            />
          )}
          {player.dexterity > 0 && (
            <StatusBadge
              icon={'\uD83C\uDFAF'}
              label="DEX"
              value={player.dexterity}
              color="#66ff66"
              positive={true}
              onClick={setSelectedStatus}
            />
          )}
          {player.artifact > 0 && (
            <StatusBadge icon={'\uD83D\uDC8E'} label="ARTIFACT" value={player.artifact} color="#ffcc44" positive={true} />
          )}
          {player.thorns > 0 && (
            <StatusBadge icon={'\uD83C\uDF35'} label="THORNS" value={player.thorns} color="#ff8844" positive={true} />
          )}
          {player.metallicize > 0 && (
            <StatusBadge icon={'\uD83D\uDEE1\uFE0F'} label="METALLICIZE" value={player.metallicize} color="#8888aa" positive={true} />
          )}
          {player.intangible > 0 && (
            <StatusBadge icon={'\uD83D\uDC7B'} label="INTANGIBLE" value={player.intangible} color="#aaaaff" positive={true} />
          )}
          {player.regen > 0 && (
            <StatusBadge icon={'\u2728'} label="REGEN" value={player.regen} color="#44ff88" positive={true} />
          )}
          {player.barricade && (
            <StatusBadge icon={'\uD83C\uDFF0'} label="BARRICADE" value="ON" color="#4488ff" positive={true} />
          )}
          {player.demonForm > 0 && (
            <StatusBadge icon={'\uD83D\uDD25'} label="DEMONFORM" value={player.demonForm} color="#ff44aa" positive={true} />
          )}
          {player.berserk > 0 && (
            <StatusBadge icon={'\uD83D\uDCA2'} label="BERSERK" value={player.berserk} color="#ffaa44" positive={true} />
          )}
          {player.platedArmor > 0 && (
            <StatusBadge icon={'\u2699\uFE0F'} label="PLATEDARMOR" value={player.platedArmor} color="#8888cc" positive={true} />
          )}
          {player.flight > 0 && (
            <StatusBadge icon={'\uD83E\uDD85'} label="FLIGHT" value={player.flight} color="#88ccff" positive={true} />
          )}
          {player.rage > 0 && (
            <StatusBadge icon={'\uD83D\uDCA2'} label="RAGE" value={player.rage} color="#ff4444" positive={true} />
          )}
          {player.doubleTap > 0 && (
            <StatusBadge icon={'\u2694\uFE0F'} label="DOUBLETAP" value={player.doubleTap} color="#ff8888" positive={true} />
          )}
          {player.corruption && (
            <StatusBadge icon={'\uD83D\uDDA4'} label="CORRUPTION" value="ON" color="#8844aa" positive={true} />
          )}
          {player.darkEmbrace && (
            <StatusBadge icon={'\uD83C\uDF11'} label="DARKEMBRACE" value="ON" color="#6644aa" positive={true} />
          )}
          {player.feelNoPain > 0 && (
            <StatusBadge icon={'\uD83D\uDCAA'} label="FEELNOPAIN" value={player.feelNoPain} color="#aa6644" positive={true} />
          )}
          {player.flameBarrier > 0 && (
            <StatusBadge icon={'\uD83D\uDD25'} label="FLAMEBARRIER" value={player.flameBarrier} color="#ff6622" positive={true} />
          )}
          {player.evolve > 0 && (
            <StatusBadge icon={'\uD83E\uDDEC'} label="EVOLVE" value={player.evolve} color="#22aa88" positive={true} />
          )}
          {player.fireBreathing > 0 && (
            <StatusBadge icon={'\uD83D\uDC32'} label="FIREBREATHING" value={player.fireBreathing} color="#ff4422" positive={true} />
          )}
          {player.juggernaut > 0 && (
            <StatusBadge icon={'\uD83D\uDEE1\uFE0F'} label="JUGGERNAUT" value={player.juggernaut} color="#4488ff" positive={true} />
          )}
          {player.rupture > 0 && (
            <StatusBadge icon={'\uD83E\uDE78'} label="RUPTURE" value={player.rupture} color="#cc2222" positive={true} />
          )}
          {player.brutality && (
            <StatusBadge icon={'\u2620\uFE0F'} label="BRUTALITY" value="ON" color="#aa2222" positive={true} />
          )}
        </div>
      )}

      {/* Divider between buffs and debuffs */}
      {hasBuffs && hasDebuffs && (
        <div style={{ width: '2px', height: '50px', background: '#444' }} />
      )}

      {/* Debuffs Section */}
      {hasDebuffs && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {player.strength < 0 && (
            <StatusBadge
              icon={'\uD83D\uDCAA'}
              label="STR"
              value={player.strength}
              color="#6666ff"
              positive={false}
              onClick={setSelectedStatus}
            />
          )}
          {player.dexterity < 0 && (
            <StatusBadge
              icon={'\uD83C\uDFAF'}
              label="DEX"
              value={player.dexterity}
              color="#ff6666"
              positive={false}
              onClick={setSelectedStatus}
            />
          )}
          {player.vulnerable > 0 && (
            <StatusBadge icon={'\uD83D\uDCA5'} label="VUL" value={player.vulnerable} color="#ff9944" positive={false} onClick={setSelectedStatus} />
          )}
          {player.weak > 0 && (
            <StatusBadge icon={'\uD83D\uDCA7'} label="WEAK" value={player.weak} color="#88aa88" positive={false} onClick={setSelectedStatus} />
          )}
          {player.frail > 0 && (
            <StatusBadge icon={'\uD83E\uDDB4'} label="FRAIL" value={player.frail} color="#aa88aa" positive={false} onClick={setSelectedStatus} />
          )}
          {player.hex > 0 && (
            <StatusBadge icon={'\uD83D\uDC7E'} label="HEX" value={player.hex} color="#aa44aa" positive={false} onClick={setSelectedStatus} />
          )}
          {player.noDrawNextTurn && (
            <StatusBadge icon={'\uD83D\uDEAB'} label="NO DRAW" value="!" color="#666666" positive={false} onClick={setSelectedStatus} />
          )}
        </div>
      )}

      {/* Status Info Popup */}
      {selectedStatus && (
        <div
          onClick={() => setSelectedStatus(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(40, 40, 60, 0.98) 0%, rgba(25, 25, 40, 0.98) 100%)',
              borderRadius: '16px',
              padding: '20px 28px',
              border: `3px solid ${selectedStatus.color || '#666'}`,
              boxShadow: `0 8px 40px rgba(0, 0, 0, 0.8), 0 0 20px ${selectedStatus.color}44`,
              maxWidth: '300px',
              minWidth: '220px',
              animation: 'fadeIn 0.15s ease-out'
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
                filter: `drop-shadow(0 0 8px ${selectedStatus.color})`
              }}>
                {selectedStatus.icon}
              </span>
              <div>
                <h3 style={{
                  color: selectedStatus.color || '#fff',
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: `0 0 8px ${selectedStatus.color}88`
                }}>
                  {selectedStatus.name}
                </h3>
                <span style={{
                  color: selectedStatus.isBuff ? '#88ff88' : '#ff8888',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {selectedStatus.isBuff ? 'Buff' : 'Debuff'}
                  {typeof selectedStatus.value === 'number' ? ` \u2022 ${Math.abs(selectedStatus.value)} ${Math.abs(selectedStatus.value) === 1 ? 'stack' : 'stacks'}` : ''}
                </span>
              </div>
            </div>
            <p style={{
              color: '#ccc',
              margin: 0,
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {selectedStatus.desc}
            </p>
            <button
              onClick={() => setSelectedStatus(null)}
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
    </div>
  );
};

export default PlayerStatusBar;
