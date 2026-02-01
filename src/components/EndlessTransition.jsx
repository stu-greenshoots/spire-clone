import { useEffect, useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { ENDLESS_LOOP_MILESTONES } from '../data/flavorText';

const EndlessTransition = () => {
  const { state, enterEndless, returnToMenu, updateProgression } = useGame();
  const [showContent, setShowContent] = useState(false);
  const loopNumber = (state.endlessLoop || 0) + 1;

  const milestoneText = useMemo(() => {
    const loop = state.endlessLoop || 0;
    // Check for specific milestone text (highest matching threshold)
    const thresholds = [25, 15, 10, 7, 5, 3];
    for (const threshold of thresholds) {
      if (loop >= threshold) return ENDLESS_LOOP_MILESTONES[threshold];
    }
    // Generic loop text
    const generic = ENDLESS_LOOP_MILESTONES.generic;
    return generic[Math.floor(Math.random() * generic.length)];
  }, [state.endlessLoop]);

  // Record progression on mount (player beat the Heart)
  useEffect(() => {
    updateProgression(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
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
      background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 40%, #050510 100%)',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Pulsing void effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(100, 50, 200, 0.15) 0%, transparent 60%)',
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      <div style={{
        fontSize: 'clamp(50px, 12vw, 80px)',
        marginBottom: '20px',
        filter: 'drop-shadow(0 0 20px rgba(100, 50, 200, 0.6))',
        animation: showContent ? 'fadeIn 0.5s ease' : 'none',
        opacity: showContent ? 1 : 0
      }}>
        {'\u267E\uFE0F'}
      </div>

      <h1 style={{
        fontSize: 'clamp(24px, 7vw, 36px)',
        marginBottom: '10px',
        fontWeight: 'bold',
        letterSpacing: '3px',
        color: '#bb88ff',
        textShadow: '0 0 20px rgba(150, 100, 255, 0.5)',
        animation: showContent ? 'fadeIn 0.5s ease 0.2s both' : 'none'
      }}>
        {state.endlessMode ? `LOOP ${loopNumber} COMPLETE` : 'THE HEART FALLS'}
      </h1>

      <p style={{
        color: '#9988bb',
        marginBottom: '30px',
        fontSize: '16px',
        maxWidth: 'min(400px, 85%)',
        lineHeight: '1.6',
        fontStyle: 'italic',
        animation: showContent ? 'fadeIn 0.5s ease 0.4s both' : 'none'
      }}>
        {state.endlessMode
          ? milestoneText
          : 'The Spire crumbles, yet its corruption lingers. Will you descend once more into the endless dark?'}
      </p>

      {/* Endless mode info */}
      <div style={{
        background: 'rgba(40, 30, 60, 0.6)',
        padding: '16px 24px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '1px solid rgba(150, 100, 255, 0.3)',
        maxWidth: '320px',
        animation: showContent ? 'fadeIn 0.5s ease 0.5s both' : 'none'
      }}>
        <div style={{ color: '#aa88cc', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          Endless Mode — Loop {loopNumber}
        </div>
        <div style={{ color: '#ccbbee', fontSize: '14px', lineHeight: '1.5' }}>
          Enemy HP & damage +{loopNumber * 10}%
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: showContent ? 'fadeIn 0.5s ease 0.6s both' : 'none'
      }}>
        <button
          onClick={enterEndless}
          data-testid="enter-endless-btn"
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            background: 'linear-gradient(180deg, #6633cc 0%, #4422aa 50%, #331188 100%)',
            color: 'white',
            border: '2px solid #8855ee',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 0 25px rgba(100, 50, 200, 0.4)',
            touchAction: 'manipulation'
          }}
        >
          Enter the Endless
        </button>
        <button
          onClick={returnToMenu}
          data-testid="claim-victory-btn"
          style={{
            padding: '12px 30px',
            fontSize: '14px',
            background: 'rgba(60, 60, 60, 0.6)',
            color: '#999',
            border: '1px solid #555',
            borderRadius: '20px',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          Claim Victory & Return
        </button>
      </div>
    </div>
  );
};

export default EndlessTransition;
