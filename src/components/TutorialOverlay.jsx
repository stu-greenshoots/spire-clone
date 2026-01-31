import { useState, useEffect } from 'react';

const TUTORIAL_KEY = 'spireAscent_hasSeenTutorial';

const HINTS = [
  {
    id: 'play-cards',
    desktopText: 'Drag cards up to play them',
    mobileText: 'Tap a card, then tap again to play',
    target: 'hand',
    position: 'above-hand'
  },
  {
    id: 'draw-pile',
    text: 'You draw 5 cards each turn',
    target: 'draw-pile',
    position: 'above-controls'
  },
  {
    id: 'energy',
    text: 'Energy limits how many cards you play',
    target: 'energy',
    position: 'above-controls'
  },
  {
    id: 'end-turn',
    text: 'Click End Turn when done',
    target: 'end-turn',
    position: 'above-controls'
  }
];

const TutorialOverlay = ({ isMobile }) => {
  const [currentHint, setCurrentHint] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Check if tutorial already seen
  const [hasSeenTutorial] = useState(() => {
    try {
      return localStorage.getItem(TUTORIAL_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dismissed) {
      try {
        localStorage.setItem(TUTORIAL_KEY, 'true');
      } catch {
        // localStorage unavailable
      }
    }
  }, [dismissed]);

  if (hasSeenTutorial || dismissed) return null;

  const hint = HINTS[currentHint];
  const isLast = currentHint === HINTS.length - 1;
  const text = hint.desktopText && !isMobile ? hint.desktopText
    : hint.mobileText && isMobile ? hint.mobileText
    : hint.text;

  const handleNext = () => {
    if (isLast) {
      setDismissed(true);
    } else {
      setCurrentHint(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setDismissed(true);
  };

  return (
    <div
      className="tutorial-overlay"
      data-testid="tutorial-overlay"
      onClick={handleNext}
    >
      <div
        className={`tutorial-hint tutorial-hint--${hint.position}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tutorial-hint__arrow" />
        <div className="tutorial-hint__content">
          <p className="tutorial-hint__text">{text}</p>
          <div className="tutorial-hint__actions">
            <button
              className="tutorial-hint__skip"
              onClick={handleSkip}
            >
              Skip All
            </button>
            <button
              className="tutorial-hint__next"
              onClick={handleNext}
              data-testid="tutorial-next"
            >
              {isLast ? 'Got it!' : 'Next'}
            </button>
          </div>
          <div className="tutorial-hint__dots">
            {HINTS.map((_, i) => (
              <span
                key={i}
                className={`tutorial-hint__dot${i === currentHint ? ' tutorial-hint__dot--active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
