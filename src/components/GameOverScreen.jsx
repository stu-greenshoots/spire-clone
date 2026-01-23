import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const GameOverScreen = () => {
  const { state, returnToMenu } = useGame();
  const { player, deck, relics, currentFloor, act } = state;
  const [showContent, setShowContent] = useState(false);

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
      background: 'radial-gradient(ellipse at center bottom, #1a0a0a 0%, #0a0505 50%, #050202 100%)',
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
        fontSize: '90px',
        marginBottom: '20px',
        filter: 'drop-shadow(0 0 20px rgba(170, 68, 68, 0.6))',
        animation: showContent ? 'shake 0.5s ease' : 'none'
      }}>
        {'\uD83D\uDC80'}
      </div>

      {/* Title */}
      <h1 style={{
        color: '#AA4444',
        fontSize: '38px',
        marginBottom: '10px',
        textShadow: '0 0 20px rgba(170, 68, 68, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)',
        letterSpacing: '4px',
        fontWeight: 'bold',
        animation: showContent ? 'fadeIn 0.5s ease' : 'none',
        opacity: showContent ? 1 : 0
      }}>
        DEFEAT
      </h1>

      {/* Subtitle */}
      <p style={{
        color: '#666',
        marginBottom: '30px',
        fontSize: '16px',
        fontStyle: 'italic',
        animation: showContent ? 'fadeIn 0.5s ease 0.2s both' : 'none'
      }}>
        You have fallen in the Spire...
      </p>

      {/* Run Summary */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 20, 20, 0.9) 0%, rgba(20, 15, 15, 0.95) 100%)',
        padding: '25px 35px',
        borderRadius: '15px',
        marginBottom: '30px',
        minWidth: '240px',
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
          <StatItem label="Act" value={act} icon={'\uD83C\uDFDB\uFE0F'} />
          <StatItem label="Floor" value={currentFloor + 1} icon={'\uD83D\uDDFC'} />
          <StatItem label="Cards" value={deck.length} icon={'\uD83C\uDCCF'} />
          <StatItem label="Relics" value={relics.length} icon={'\uD83D\uDC8E'} />
          <StatItem label="Gold" value={player.gold} icon={'\uD83D\uDCB0'} />
          <StatItem label="Max HP" value={player.maxHp} icon={'\u2764\uFE0F'} />
        </div>
      </div>

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
              {relic.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Return Button */}
      <button
        onClick={returnToMenu}
        style={{
          padding: '18px 55px',
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

      {/* Encouragement text */}
      <p style={{
        marginTop: '25px',
        color: '#444',
        fontSize: '13px',
        animation: showContent ? 'fadeIn 0.5s ease 1s both' : 'none'
      }}>
        The Spire awaits your return...
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
