import { useEffect, useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { VICTORY_NARRATIVE } from '../data/flavorText';
import { getRelicImage } from '../assets/art/art-config';
import { calculateChallengeScore, saveChallengeScore } from '../systems/dailyChallengeSystem';

const getVictoryText = (defeatedHeart) => {
  const pool = defeatedHeart ? VICTORY_NARRATIVE.heart : VICTORY_NARRATIVE.standard;
  return pool[Math.floor(Math.random() * pool.length)];
};

const VictoryScreen = () => {
  const { state, returnToMenu } = useGame();
  const { player, deck, relics, currentFloor, dailyChallenge, runStats } = state;
  const [showContent, setShowContent] = useState(false);
  const victoryText = useMemo(() => getVictoryText(state.defeatedHeart), [state.defeatedHeart]);

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
      background: 'radial-gradient(ellipse at center, #2a2a1a 0%, #1a1a0a 30%, #0a0a05 100%)',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Celebration particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(2px 2px at 10% 20%, rgba(255, 215, 0, 0.6), transparent),
          radial-gradient(2px 2px at 30% 40%, rgba(255, 215, 0, 0.5), transparent),
          radial-gradient(2px 2px at 50% 15%, rgba(255, 255, 255, 0.4), transparent),
          radial-gradient(2px 2px at 70% 60%, rgba(255, 215, 0, 0.5), transparent),
          radial-gradient(2px 2px at 90% 30%, rgba(255, 215, 0, 0.6), transparent),
          radial-gradient(3px 3px at 20% 70%, rgba(255, 200, 100, 0.3), transparent),
          radial-gradient(3px 3px at 80% 80%, rgba(255, 200, 100, 0.3), transparent)
        `,
        animation: 'float 5s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Trophy glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 40%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Trophy */}
      <div style={{
        fontSize: 'clamp(60px, 15vw, 100px)',
        marginBottom: '20px',
        animation: 'celebrate 2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))'
      }}>
        {'\uD83C\uDFC6'}
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(28px, 8vw, 42px)',
        marginBottom: '10px',
        fontWeight: 'bold',
        letterSpacing: '4px',
        background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))',
        animation: showContent ? 'fadeIn 0.5s ease' : 'none',
        opacity: showContent ? 1 : 0
      }}>
        VICTORY!
      </h1>

      {/* Narrative text */}
      <p style={{
        color: '#88ff88',
        marginBottom: '30px',
        fontSize: '18px',
        maxWidth: 'min(420px, 90%)',
        lineHeight: '1.6',
        fontStyle: 'italic',
        textShadow: '0 0 10px rgba(136, 255, 136, 0.5)',
        animation: showContent ? 'fadeIn 0.5s ease 0.2s both' : 'none'
      }}>
        {victoryText}
      </p>

      {/* Run Summary */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(50, 50, 30, 0.8) 0%, rgba(30, 30, 20, 0.9) 100%)',
        padding: '20px clamp(16px, 5vw, 35px)',
        borderRadius: '15px',
        marginBottom: '25px',
        width: '90%',
        maxWidth: '340px',
        border: '3px solid #FFD700',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
        animation: showContent ? 'fadeIn 0.5s ease 0.4s both' : 'none'
      }}>
        <h3 style={{
          color: '#FFD700',
          marginBottom: '20px',
          fontSize: '20px',
          letterSpacing: '2px'
        }}>
           RUN COMPLETE
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          textAlign: 'left'
        }}>
          <StatItem label="Acts" value="3" icon={'\uD83C\uDFDB\uFE0F'} />
          <StatItem label="Final Floor" value={currentFloor + 1} icon={'\uD83D\uDDFC'} />
          <StatItem label="Final HP" value={`${player.currentHp}/${player.maxHp}`} icon={'\u2764\uFE0F'} />
          <StatItem label="Gold" value={player.gold} icon={'\uD83D\uDCB0'} />
          <StatItem label="Cards" value={deck.length} icon={'\uD83C\uDCCF'} />
          <StatItem label="Relics" value={relics.length} icon={'\uD83D\uDC8E'} />
        </div>
      </div>

      {/* Daily Challenge Score */}
      {challengeScore !== null && (
        <div style={{
          background: 'linear-gradient(180deg, rgba(60, 45, 20, 0.8) 0%, rgba(40, 30, 15, 0.9) 100%)',
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '2px solid rgba(255, 180, 85, 0.5)',
          boxShadow: '0 0 20px rgba(255, 160, 60, 0.2)',
          textAlign: 'center',
          animation: showContent ? 'fadeIn 0.5s ease 0.5s both' : 'none'
        }}>
          <div style={{ color: '#aa9977', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
            Daily Challenge Score
          </div>
          <div style={{ color: '#FFB855', fontSize: '32px', fontWeight: 'bold', textShadow: '0 0 15px rgba(255, 180, 85, 0.5)' }}>
            {challengeScore.toLocaleString()}
          </div>
        </div>
      )}

      {/* Relics Display */}
      {relics.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '320px',
          animation: showContent ? 'fadeIn 0.5s ease 0.6s both' : 'none'
        }}>
          {relics.map((relic, idx) => (
            <div
              key={idx}
              title={`${relic.name}: ${relic.description}`}
              style={{
                fontSize: '32px',
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
                animation: 'float 3s ease-in-out infinite',
                animationDelay: `${idx * 0.15}s`,
                cursor: 'help'
              }}
            >
              {(() => {
                const img = getRelicImage(relic.id);
                return img ? <img src={img} alt={relic.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} /> : relic.emoji;
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Play Again Button */}
      <button
        onClick={returnToMenu}
        style={{
          padding: '18px 48px',
          fontSize: '20px',
          background: 'linear-gradient(180deg, #44aa44 0%, #338833 50%, #226622 100%)',
          color: 'white',
          border: '3px solid #66cc66',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          boxShadow: '0 0 30px rgba(68, 170, 68, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4)',
          touchAction: 'manipulation',
          transition: 'all 0.3s ease',
          animation: showContent ? 'fadeIn 0.5s ease 0.8s both' : 'none'
        }}
      >
         Play Again
      </button>
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
    <span style={{ fontSize: '16px' }}>{icon}</span>
    <div>
      <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

export default VictoryScreen;
