import { useState, useEffect, useCallback } from 'react';
import { ANIMATION_TYPE } from '../constants/animationTypes';

// Enemy Turn Indicator component
const EnemyTurnIndicator = ({ enemyTurn, onSkip }) => {
  if (!enemyTurn) return null;

  return (
    <div
      data-testid="enemy-turn-indicator"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(180deg, rgba(80, 20, 20, 0.95) 0%, rgba(40, 10, 10, 0.98) 100%)',
        border: '2px solid #aa4444',
        borderRadius: '12px',
        padding: '16px 28px',
        boxShadow: '0 0 30px rgba(200, 50, 50, 0.4), 0 8px 32px rgba(0, 0, 0, 0.6)',
        zIndex: 1001,
        animation: 'enemyTurnIndicatorPulse 0.8s ease-in-out infinite',
        pointerEvents: 'auto',
        cursor: 'pointer',
        minWidth: '200px',
        textAlign: 'center'
      }}
      onClick={onSkip}
      title="Click to skip"
    >
      <div style={{
        color: '#ffcccc',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '6px',
        opacity: 0.8
      }}>
        Enemy Turn
      </div>
      <div style={{
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 100, 100, 0.6)',
        marginBottom: '4px'
      }}>
        {enemyTurn.name}
      </div>
      <div style={{
        color: '#ff9999',
        fontSize: '14px',
        fontStyle: 'italic'
      }}>
        is {enemyTurn.action}
      </div>
      <div style={{
        color: '#888',
        fontSize: '10px',
        marginTop: '8px',
        opacity: 0.6
      }}>
        (click to skip)
      </div>
    </div>
  );
};

// Floating number component
const FloatingNumber = ({ animation, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(animation.id);
    }, animation.duration || 800);

    return () => clearTimeout(timer);
  }, [animation.id, animation.duration, onComplete]);

  if (!isVisible) return null;

  const getAnimationStyle = () => {
    switch (animation.type) {
      case ANIMATION_TYPE.DAMAGE:
        return {
          animation: 'damageFloat 0.8s ease-out forwards',
          color: '#ff4444',
          textShadow: '0 0 10px #ff0000, 0 2px 4px rgba(0, 0, 0, 0.8)',
          fontSize: animation.value > 15 ? '28px' : animation.value > 10 ? '24px' : '20px'
        };
      case ANIMATION_TYPE.BLOCK:
        return {
          animation: 'blockFloat 0.7s ease-out forwards',
          color: '#4488ff',
          textShadow: '0 0 10px #4488ff, 0 2px 4px rgba(0, 0, 0, 0.8)',
          fontSize: '20px'
        };
      case ANIMATION_TYPE.HEAL:
        return {
          animation: 'healFloat 0.7s ease-out forwards',
          color: '#44ff44',
          textShadow: '0 0 10px #44ff44, 0 2px 4px rgba(0, 0, 0, 0.8)',
          fontSize: '20px'
        };
      case ANIMATION_TYPE.STATUS:
        return {
          animation: 'statusApplied 0.5s ease-out forwards',
          color: animation.color || '#ffaa44',
          textShadow: `0 0 8px ${animation.color || '#ffaa44'}, 0 2px 4px rgba(0, 0, 0, 0.8)`,
          fontSize: '14px'
        };
      default:
        return {
          animation: 'fadeIn 0.5s ease-out forwards',
          color: '#ffffff',
          fontSize: '18px'
        };
    }
  };

  const style = getAnimationStyle();
  const prefix = animation.type === ANIMATION_TYPE.BLOCK ? '🛡️ +' :
                 animation.type === ANIMATION_TYPE.HEAL ? '❤️ +' :
                 animation.type === ANIMATION_TYPE.DAMAGE ? '-' : '';

  return (
    <div
      style={{
        position: 'absolute',
        left: animation.x,
        top: animation.y,
        transform: 'translate(-50%, -50%)',
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: 1000,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {animation.type === ANIMATION_TYPE.STATUS ? (
        <span>{animation.label}</span>
      ) : (
        <span>{prefix}{animation.value}</span>
      )}
    </div>
  );
};

// Main Animation Overlay Component
const AnimationOverlay = ({ animations, onAnimationComplete, activeEnemyTurn, onSkipEnemyTurn, highlightedEnemyId: _highlightedEnemyId }) => {
  const handleComplete = useCallback((id) => {
    if (onAnimationComplete) {
      onAnimationComplete(id);
    }
  }, [onAnimationComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 999,
        overflow: 'hidden'
      }}
    >
      {animations.map((anim) => (
        <FloatingNumber
          key={anim.id}
          animation={anim}
          onComplete={handleComplete}
        />
      ))}
      <EnemyTurnIndicator
        enemyTurn={activeEnemyTurn}
        onSkip={onSkipEnemyTurn}
      />
    </div>
  );
};

export { EnemyTurnIndicator };
export default AnimationOverlay;
