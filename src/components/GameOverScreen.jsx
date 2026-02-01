import { useEffect, useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { DEFEAT_NARRATIVE, DEFEAT_FOOTER, ENDLESS_DEFEAT_NARRATIVE, ENDLESS_DEFEAT_FOOTER } from '../data/flavorText';
import { SILENT_DEFEAT_NARRATIVE, DEFECT_DEFEAT_NARRATIVE, WATCHER_DEFEAT_NARRATIVE } from '../data/bossDialogue';
import { getRelicImage } from '../assets/art/art-config';
import { calculateChallengeScore, saveChallengeScore } from '../systems/dailyChallengeSystem';

const getDefeatText = (act, currentFloor, currentNode, characterId, endlessMode, endlessLoop) => {
  // Endless mode has its own dissolution narrative based on loop depth
  if (endlessMode && endlessLoop >= 1) {
    let pool;
    if (endlessLoop >= 10) pool = ENDLESS_DEFEAT_NARRATIVE.extreme;
    else if (endlessLoop >= 6) pool = ENDLESS_DEFEAT_NARRATIVE.deep;
    else if (endlessLoop >= 3) pool = ENDLESS_DEFEAT_NARRATIVE.mid;
    else pool = ENDLESS_DEFEAT_NARRATIVE.early;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const isBoss = currentNode?.type === 'boss';
  const narrative = characterId === 'silent' ? SILENT_DEFEAT_NARRATIVE : characterId === 'defect' ? DEFECT_DEFEAT_NARRATIVE : characterId === 'watcher' ? WATCHER_DEFEAT_NARRATIVE : DEFEAT_NARRATIVE;
  let pool;
  if (isBoss && act >= 3) {
    pool = narrative.heart;
  } else if (isBoss) {
    pool = narrative.boss;
  } else if (act >= 3) {
    pool = narrative.act3;
  } else if (act >= 2) {
    pool = narrative.act2;
  } else if (currentFloor <= 5) {
    pool = narrative.early;
  } else {
    pool = narrative.midAct1;
  }
  return pool[Math.floor(Math.random() * pool.length)];
};

const GameOverScreen = () => {
  const { state, returnToMenu, updateProgression } = useGame();
  const { player, deck, relics, currentFloor, act, dailyChallenge, runStats, endlessMode, endlessLoop } = state;
  const [showContent, setShowContent] = useState(false);
  const defeatText = useMemo(() => getDefeatText(act, currentFloor, state.currentNode, state.character, endlessMode, endlessLoop), [act, currentFloor, state.currentNode, state.character, endlessMode, endlessLoop]);
  const footerText = useMemo(() => {
    const pool = endlessMode ? ENDLESS_DEFEAT_FOOTER : DEFEAT_FOOTER;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [endlessMode]);

  // Calculate and save daily challenge score
  const challengeScore = useMemo(() => {
    if (!dailyChallenge) return null;
    const score = calculateChallengeScore(
      { ...runStats, floor: currentFloor },
      player,
      dailyChallenge.modifierIds
    );
    saveChallengeScore(dailyChallenge.date, score);
    return score;
  }, [dailyChallenge, runStats, currentFloor, player]);

  // Record run in history and update progression on mount
  useEffect(() => {
    const enemyName = state.enemies?.[0]?.name || 'Unknown';
    updateProgression(false, `Slain by ${enemyName} on floor ${currentFloor + 1}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center',
      background: endlessMode
        ? 'radial-gradient(ellipse at center bottom, #1a0a1a 0%, #0a050a 50%, #050205 100%)'
        : 'radial-gradient(ellipse at center bottom, #1a0a0a 0%, #0a0505 50%, #050202 100%)',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Dark particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(2px 2px at 15% 25%, rgba(170, 68, 68, 0.4), transparent),
          radial-gradient(2px 2px at 35% 55%, rgba(100, 50, 50, 0.3), transparent),
          radial-gradient(2px 2px at 55% 20%, rgba(170, 68, 68, 0.3), transparent),
          radial-gradient(2px 2px at 75% 70%, rgba(100, 50, 50, 0.4), transparent),
          radial-gradient(2px 2px at 85% 35%, rgba(170, 68, 68, 0.3), transparent)
        `,
        animation: 'float 8s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

      {/* Defeat glow */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(170, 68, 68, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Skull Icon */}
      <div style={{
        fontSize: 'clamp(56px, 14vw, 90px)',
        marginBottom: '20px',
        filter: 'drop-shadow(0 0 20px rgba(170, 68, 68, 0.6))',
        animation: showContent ? 'shake 0.5s ease' : 'none'
      }}>
        {'\uD83D\uDC80'}
      </div>

      {/* Title */}
      <h1 style={{
        color: endlessMode ? '#bb88ff' : '#AA4444',
        fontSize: 'clamp(26px, 7vw, 38px)',
        marginBottom: '10px',
        textShadow: endlessMode
          ? '0 0 20px rgba(150, 100, 255, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)'
          : '0 0 20px rgba(170, 68, 68, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)',
        letterSpacing: '4px',
        fontWeight: 'bold',
        animation: showContent ? 'fadeIn 0.5s ease' : 'none',
        opacity: showContent ? 1 : 0
      }}>
        {endlessMode ? 'THE ENDLESS CLAIMS YOU' : 'DEFEAT'}
      </h1>

      {/* Narrative text */}
      <p style={{
        color: '#aa8888',
        marginBottom: '30px',
        fontSize: '16px',
        fontStyle: 'italic',
        maxWidth: '400px',
        lineHeight: '1.6',
        animation: showContent ? 'fadeIn 0.5s ease 0.2s both' : 'none'
      }}>
        {defeatText}
      </p>

      {/* Run Summary */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 20, 20, 0.9) 0%, rgba(20, 15, 15, 0.95) 100%)',
        padding: '20px clamp(16px, 5vw, 35px)',
        borderRadius: '15px',
        marginBottom: '30px',
        width: '90%',
        maxWidth: '320px',
        border: '2px solid #553333',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(170, 68, 68, 0.1)',
        animation: showContent ? 'fadeIn 0.5s ease 0.4s both' : 'none'
      }}>
        <h3 style={{
          color: '#aa6666',
          marginBottom: '20px',
          fontSize: '18px',
          letterSpacing: '1px'
        }}>
           Run Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          textAlign: 'left'
        }}>
          {endlessMode && <StatItem label="Loop" value={endlessLoop} icon={'\u267E\uFE0F'} />}
          {endlessMode && <StatItem label="Scaling" value={`+${endlessLoop * 10}%`} icon={'\uD83D\uDCC8'} />}
          <StatItem label="Act" value={act} icon={'\uD83C\uDFDB\uFE0F'} />
          <StatItem label="Floor" value={currentFloor + 1} icon={'\uD83D\uDDFC'} />
          <StatItem label="Cards" value={deck.length} icon={'\uD83C\uDCCF'} />
          <StatItem label="Relics" value={relics.length} icon={'\uD83D\uDC8E'} />
          <StatItem label="Gold" value={player.gold} icon={'\uD83D\uDCB0'} />
          <StatItem label="Max HP" value={player.maxHp} icon={'\u2764\uFE0F'} />
          {endlessMode && runStats && <StatItem label="Enemies" value={runStats.enemiesKilled || 0} icon={'\u2694\uFE0F'} />}
          {endlessMode && runStats && <StatItem label="Damage" value={runStats.damageDealt || 0} icon={'\uD83D\uDCA5'} />}
        </div>
      </div>

      {/* Daily Challenge Score */}
      {challengeScore !== null && (
        <div style={{
          background: 'rgba(40, 25, 15, 0.8)',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 180, 85, 0.3)',
          textAlign: 'center',
          animation: showContent ? 'fadeIn 0.5s ease 0.5s both' : 'none'
        }}>
          <div style={{ color: '#887755', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Daily Challenge Score
          </div>
          <div style={{ color: '#cc9955', fontSize: '26px', fontWeight: 'bold' }}>
            {challengeScore.toLocaleString()}
          </div>
        </div>
      )}

      {/* Relics Display */}
      {relics.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '25px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '280px',
          animation: showContent ? 'fadeIn 0.5s ease 0.6s both' : 'none'
        }}>
          {relics.map((relic, idx) => (
            <div
              key={idx}
              title={`${relic.name}: ${relic.description}`}
              style={{
                fontSize: '26px',
                filter: 'grayscale(0.5) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
                opacity: 0.7,
                cursor: 'help'
              }}
            >
              {(() => {
                const img = getRelicImage(relic.id);
                return img ? <img src={img} alt={relic.name} style={{ width: '26px', height: '26px', borderRadius: '4px', objectFit: 'cover' }} /> : relic.emoji;
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Return Button */}
      <button
        onClick={returnToMenu}
        style={{
          padding: '18px 48px',
          fontSize: '18px',
          background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
          color: 'white',
          border: '2px solid #cc4444',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          boxShadow: '0 0 20px rgba(170, 32, 32, 0.4), 0 6px 15px rgba(0, 0, 0, 0.4)',
          touchAction: 'manipulation',
          transition: 'all 0.3s ease',
          animation: showContent ? 'fadeIn 0.5s ease 0.8s both' : 'none'
        }}
      >
         Try Again
      </button>

      {/* Footer narrative */}
      <p style={{
        marginTop: '25px',
        color: endlessMode ? '#776699' : '#555',
        fontSize: '13px',
        fontStyle: 'italic',
        animation: showContent ? 'fadeIn 0.5s ease 1s both' : 'none'
      }}>
        {footerText}
      </p>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ label, value, icon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <span style={{ fontSize: '14px', opacity: 0.7 }}>{icon}</span>
    <div>
      <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: '#aaa', fontSize: '14px', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

export default GameOverScreen;
