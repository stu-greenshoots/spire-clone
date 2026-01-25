import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { hasSave } from '../systems/saveSystem';

const MainMenu = () => {
  const { startGame, loadGameState, deleteSaveState, openDataEditor } = useGame();
  const [_titleGlow, setTitleGlow] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [hoveringContinue, setHoveringContinue] = useState(false);
  const [hoveringEditor, setHoveringEditor] = useState(false);
  const [saveExists, setSaveExists] = useState(false);

  // Check for save on mount
  useEffect(() => {
    setSaveExists(hasSave());
  }, []);

  // Animate title glow
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleGlow(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      textAlign: 'center',
      background: 'radial-gradient(ellipse at center bottom, #2a2a4a 0%, #1a1a2e 40%, #12121f 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated starfield background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(1px 1px at 5% 10%, rgba(255, 255, 255, 0.4), transparent),
          radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.3), transparent),
          radial-gradient(2px 2px at 25% 15%, rgba(255, 215, 0, 0.4), transparent),
          radial-gradient(1px 1px at 35% 45%, rgba(255, 255, 255, 0.3), transparent),
          radial-gradient(1px 1px at 45% 30%, rgba(255, 255, 255, 0.25), transparent),
          radial-gradient(2px 2px at 55% 8%, rgba(255, 150, 50, 0.3), transparent),
          radial-gradient(1px 1px at 65% 55%, rgba(255, 255, 255, 0.35), transparent),
          radial-gradient(1px 1px at 75% 20%, rgba(255, 255, 255, 0.3), transparent),
          radial-gradient(2px 2px at 85% 40%, rgba(100, 150, 255, 0.3), transparent),
          radial-gradient(1px 1px at 90% 65%, rgba(255, 255, 255, 0.25), transparent),
          radial-gradient(1px 1px at 10% 70%, rgba(255, 255, 255, 0.2), transparent),
          radial-gradient(1px 1px at 30% 80%, rgba(255, 255, 255, 0.3), transparent),
          radial-gradient(2px 2px at 50% 85%, rgba(255, 200, 100, 0.25), transparent),
          radial-gradient(1px 1px at 70% 75%, rgba(255, 255, 255, 0.2), transparent),
          radial-gradient(1px 1px at 95% 90%, rgba(255, 255, 255, 0.3), transparent)
        `,
        animation: 'twinkle 4s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Spire silhouette with glow */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '400px',
        height: '70%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(40, 30, 60, 0.4) 30%, rgba(30, 25, 50, 0.6) 60%, rgba(20, 20, 40, 0.8) 100%)',
        clipPath: 'polygon(50% 0%, 53% 8%, 58% 12%, 55% 20%, 62% 25%, 58% 35%, 65% 40%, 60% 50%, 70% 55%, 62% 65%, 75% 70%, 65% 80%, 80% 85%, 70% 90%, 85% 95%, 100% 100%, 0% 100%, 15% 95%, 30% 90%, 20% 85%, 35% 80%, 25% 70%, 40% 65%, 30% 55%, 45% 50%, 35% 40%, 48% 35%, 42% 25%, 47% 20%, 45% 12%, 48% 8%)',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 30px rgba(100, 50, 150, 0.3))'
      }} />

      {/* Ambient fog */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(50, 40, 80, 0.15) 50%, rgba(30, 25, 60, 0.3) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Floating ember particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(3px 3px at 20% 30%, rgba(255, 100, 50, 0.4), transparent),
          radial-gradient(2px 2px at 40% 60%, rgba(255, 150, 50, 0.3), transparent),
          radial-gradient(3px 3px at 60% 25%, rgba(255, 80, 30, 0.35), transparent),
          radial-gradient(2px 2px at 80% 70%, rgba(255, 120, 40, 0.3), transparent),
          radial-gradient(3px 3px at 15% 75%, rgba(255, 200, 100, 0.25), transparent),
          radial-gradient(2px 2px at 90% 35%, rgba(255, 100, 30, 0.3), transparent)
        `,
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Logo/Icon with enhanced glow */}
      <div style={{
        fontSize: '90px',
        marginBottom: '5px',
        filter: 'drop-shadow(0 0 25px rgba(255, 100, 50, 0.6)) drop-shadow(0 0 50px rgba(255, 50, 0, 0.3))',
        animation: 'float 3s ease-in-out infinite',
        zIndex: 1
      }}>

      </div>

      {/* Title with enhanced gradient */}
      <h1 style={{
        fontSize: '48px',
        marginBottom: '5px',
        fontWeight: 'bold',
        letterSpacing: '6px',
        color: '#FFD700',
        textShadow: `
          0 0 10px rgba(255, 215, 0, 0.8),
          0 0 20px rgba(255, 215, 0, 0.6),
          0 0 30px rgba(255, 107, 53, 0.4),
          0 4px 8px rgba(0, 0, 0, 0.5)
        `,
        zIndex: 1,
        animation: 'float 4s ease-in-out infinite'
      }}>
        SPIRE ASCENT
      </h1>

      {/* Subtitle with improved styling */}
      <div style={{
        fontSize: '14px',
        color: '#aa99bb',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        marginBottom: '25px',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }}>
        A Deck-Building Roguelike
      </div>

      {/* Description with better readability */}
      <p style={{
        fontSize: '16px',
        color: '#ccbbdd',
        marginBottom: '35px',
        maxWidth: '340px',
        lineHeight: '1.7',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
        zIndex: 1,
        fontStyle: 'italic'
      }}>
        Climb the Spire. Build your deck. Defeat the heart.
      </p>

      {/* Button Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1 }}>
        {/* Continue Run Button - only show if save exists */}
        {saveExists && (
          <button
            onClick={loadGameState}
            onMouseEnter={() => setHoveringContinue(true)}
            onMouseLeave={() => setHoveringContinue(false)}
            style={{
              background: hoveringContinue
                ? 'linear-gradient(180deg, #30dd30 0%, #20bb20 50%, #159915 100%)'
                : 'linear-gradient(180deg, #20cc20 0%, #15aa15 50%, #108810 100%)',
              color: 'white',
              border: '3px solid #55ff55',
              padding: '20px 70px',
              fontSize: '24px',
              borderRadius: '35px',
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              boxShadow: hoveringContinue
                ? '0 0 50px rgba(80, 255, 80, 0.7), 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
                : '0 0 35px rgba(50, 200, 50, 0.5), 0 8px 25px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
              touchAction: 'manipulation',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              transform: hoveringContinue ? 'scale(1.05) translateY(-2px)' : 'scale(1)'
            }}
          >
            {/* Button shine effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              animation: 'shimmer 2.5s infinite'
            }} />
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>{'\u25B6\uFE0F'}</span>
              Continue Run
            </span>
          </button>
        )}

        {/* New Game Button */}
        <button
          onClick={() => {
            deleteSaveState();
            startGame();
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            background: hovering
              ? 'linear-gradient(180deg, #dd3030 0%, #bb2020 50%, #991515 100%)'
              : 'linear-gradient(180deg, #cc2020 0%, #aa1515 50%, #881010 100%)',
            color: 'white',
            border: '3px solid #ff5555',
            padding: '20px 70px',
            fontSize: '24px',
            borderRadius: '35px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: hovering
              ? '0 0 50px rgba(255, 80, 80, 0.7), 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
              : '0 0 35px rgba(200, 50, 50, 0.5), 0 8px 25px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            transform: hovering ? 'scale(1.05) translateY(-2px)' : 'scale(1)'
          }}
        >
          {/* Button shine effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: 'shimmer 2.5s infinite'
          }} />
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>{'\u2694\uFE0F'}</span>
            New Game
          </span>
        </button>

        {/* Data Editor Button */}
        <button
          onClick={openDataEditor}
          onMouseEnter={() => setHoveringEditor(true)}
          onMouseLeave={() => setHoveringEditor(false)}
          style={{
            background: hoveringEditor
              ? 'linear-gradient(180deg, #4488dd 0%, #3366bb 50%, #225599 100%)'
              : 'linear-gradient(180deg, #3377cc 0%, #2255aa 50%, #114488 100%)',
            color: 'white',
            border: '2px solid #6699ee',
            padding: '12px 40px',
            fontSize: '16px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: hoveringEditor
              ? '0 0 30px rgba(80, 130, 255, 0.5), 0 6px 20px rgba(0, 0, 0, 0.4)'
              : '0 0 20px rgba(50, 100, 200, 0.3), 0 4px 15px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease',
            transform: hoveringEditor ? 'scale(1.05) translateY(-2px)' : 'scale(1)'
          }}
        >
          Data Editor
        </button>
      </div>

      {/* Features Grid - Improved layout */}
      <div style={{
        marginTop: '45px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        maxWidth: '380px',
        zIndex: 1
      }}>
        <FeatureItem icon={'\uD83C\uDCCF'} label="60+ Cards" color="#c41e3a" />
        <FeatureItem icon={'\uD83D\uDC79'} label="25+ Enemies" color="#ff8844" />
        <FeatureItem icon={'\uD83D\uDC8E'} label="40+ Relics" color="#0078d4" />
        <FeatureItem icon={'\uD83C\uDFDB\uFE0F'} label="3 Acts" color="#44aa44" />
        <FeatureItem icon={'\uD83D\uDC09'} label="Epic Bosses" color="#d4a017" />
        <FeatureItem icon={'\u2B06\uFE0F'} label="Upgrades" color="#aa44aa" />
      </div>

      {/* Version/Credit - improved */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        fontSize: '11px',
        color: '#555',
        letterSpacing: '1px',
        zIndex: 1
      }}>
        Inspired by Slay the Spire
      </div>

      {/* Add custom keyframes */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Enhanced Feature Item Component
const FeatureItem = ({ icon, label, color }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    background: `linear-gradient(180deg, ${color}25 0%, ${color}10 100%)`,
    padding: '10px 8px',
    borderRadius: '12px',
    border: `1px solid ${color}55`,
    boxShadow: `0 4px 12px ${color}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
    transition: 'all 0.2s ease'
  }}>
    <span style={{
      fontSize: '24px',
      filter: `drop-shadow(0 0 6px ${color})`
    }}>{icon}</span>
    <span style={{
      fontSize: '11px',
      color: color,
      fontWeight: 'bold',
      textShadow: `0 0 8px ${color}66`,
      textAlign: 'center'
    }}>
      {label}
    </span>
  </div>
);

export default MainMenu;
