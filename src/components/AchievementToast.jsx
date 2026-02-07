import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { loadSettings, getAnimationDuration } from '../systems/settingsSystem';
import { audioManager, SOUNDS } from '../systems/audioSystem';

const AchievementToast = () => {
  const { state, dismissAchievementToast } = useGame();
  const pending = state.pendingAchievements || [];
  const current = pending[0] || null;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!current) return;

    const settings = loadSettings();
    const slideDuration = getAnimationDuration(settings, 400);
    const displayDuration = settings.animationSpeed === 'instant' ? 1500 : 3000;

    // Play celebratory SFX
    audioManager.playSFX(SOUNDS.combat.milestoneFanfare);

    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 50);

    // Auto-dismiss after display duration
    let slideOutTimer;
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      // Wait for slide-out animation then remove from queue
      slideOutTimer = setTimeout(() => {
        dismissAchievementToast();
      }, slideDuration);
    }, 50 + slideDuration + displayDuration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
      clearTimeout(slideOutTimer);
    };
  }, [current, dismissAchievementToast]);

  if (!current) return null;

  const settings = loadSettings();
  const slideDuration = getAnimationDuration(settings, 400);

  return (
    <div
      data-testid="achievement-toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: visible ? '20px' : '-350px',
        width: '300px',
        background: 'linear-gradient(135deg, #2a1f0a 0%, #1a1205 100%)',
        border: '2px solid #d4a017',
        borderRadius: '8px',
        padding: '16px',
        color: '#f0e6d0',
        boxShadow: '0 4px 20px rgba(212, 160, 23, 0.3)',
        transition: `right ${slideDuration}ms ease-out`,
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      <div style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#d4a017',
        marginBottom: '6px'
      }}>
        Achievement Unlocked
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ffd700',
        marginBottom: '4px'
      }}>
        {current.name}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#c0b090',
        opacity: 0.9
      }}>
        {current.description}
      </div>
    </div>
  );
};

export default AchievementToast;
