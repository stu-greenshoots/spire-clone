import { useState, useEffect, useCallback } from 'react';

/**
 * BossDialogue - Non-blocking overlay for boss encounter dialogue
 * Displays intro, mid-fight, and death quotes for Act 1 bosses
 * Per DEC-016: Semi-transparent overlay, 2-3 seconds, click to dismiss
 */
const BossDialogue = ({ boss, trigger, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');

  // Get the appropriate dialogue text based on trigger
  const getDialogueText = useCallback(() => {
    if (!boss) return '';

    switch (trigger) {
      case 'intro':
        return boss.intro || '';
      case 'midFight':
        return boss.midFight || '';
      case 'death':
        return boss.deathQuote || '';
      default:
        return '';
    }
  }, [boss, trigger]);

  // Handle visibility and auto-dismiss
  useEffect(() => {
    const dialogueText = getDialogueText();
    if (!dialogueText) {
      setVisible(false);
      return;
    }

    setText(dialogueText);
    setVisible(true);

    // Auto-dismiss after 2.5 seconds (within 2-3 second requirement)
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 2500);

    return () => clearTimeout(timer);
  }, [boss, trigger, getDialogueText, onDismiss]);

  // Handle click to dismiss
  const handleClick = useCallback(() => {
    setVisible(false);
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  if (!visible || !text) return null;

  // Determine styling based on trigger type
  const getAccentColor = () => {
    switch (trigger) {
      case 'intro':
        return '#aa2244'; // Boss red for intro
      case 'midFight':
        return '#cc6600'; // Warning orange for mid-fight
      case 'death':
        return '#448844'; // Victory green for death
      default:
        return '#666666';
    }
  };

  const accentColor = getAccentColor();

  return (
    <div
      data-testid="boss-dialogue"
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '90px', // Below persistent header
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '90%',
        width: '500px',
        padding: '16px 24px',
        background: 'rgba(0, 0, 0, 0.85)',
        border: `2px solid ${accentColor}`,
        borderRadius: '8px',
        boxShadow: `0 4px 20px ${accentColor}66, 0 8px 40px rgba(0, 0, 0, 0.8)`,
        zIndex: 150,
        pointerEvents: 'auto', // Allow click to dismiss
        cursor: 'pointer',
        animation: 'bossDialogueFadeIn 0.4s ease-out'
      }}
    >
      {/* Boss name header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <span style={{
          fontSize: '28px',
          filter: `drop-shadow(0 0 8px ${accentColor})`
        }}>
          {boss?.emoji || ''}
        </span>
        <span style={{
          color: accentColor,
          fontSize: '14px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {boss?.name || 'Boss'}
        </span>
      </div>

      {/* Dialogue text */}
      <p style={{
        margin: 0,
        color: '#ddd',
        fontSize: '15px',
        lineHeight: '1.5',
        fontStyle: trigger === 'midFight' ? 'italic' : 'normal'
      }}>
        {text}
      </p>

      {/* Dismiss hint */}
      <div style={{
        marginTop: '12px',
        textAlign: 'right',
        color: '#666',
        fontSize: '11px'
      }}>
        Click to dismiss
      </div>

      {/* CSS animation keyframes injected via style tag */}
      <style>
        {`
          @keyframes bossDialogueFadeIn {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default BossDialogue;
