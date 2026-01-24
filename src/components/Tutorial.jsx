import { useState, useEffect } from 'react';

const TUTORIAL_STEPS = [
  { id: 'energy', phase: 'combat', turn: 1, message: 'This is your Energy. Cards cost energy to play. You get 3 each turn.', target: '.energy-display' },
  { id: 'cards', phase: 'combat', turn: 1, message: 'These are your cards. Click a card to select it, then click an enemy to play it.', target: '.hand-area' },
  { id: 'endTurn', phase: 'combat', turn: 1, message: 'When you\'re done playing cards, click End Turn. Enemies will then attack.', target: '.end-turn-btn' },
  { id: 'block', phase: 'combat', turn: 2, message: 'Block absorbs damage. It resets at the start of your turn.', target: '.player-block' },
  { id: 'map', phase: 'map', message: 'Choose your path up the Spire. Each icon is a different encounter type.', target: '.map-container' },
  { id: 'rest', phase: 'rest_site', message: 'At Rest Sites you can heal 30% of your max HP, or upgrade a card to make it stronger.', target: '.rest-options' }
];

const STORAGE_KEY = 'spireAscent_tutorialDone';

const Tutorial = ({ phase, turn, children }) => {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [currentHint, setCurrentHint] = useState(null);

  useEffect(() => {
    const hint = TUTORIAL_STEPS.find(step => {
      if (dismissed.includes(step.id)) return false;
      if (step.phase !== phase) return false;
      if (step.turn && step.turn !== turn) return false;
      return true;
    });
    setCurrentHint(hint || null);
  }, [phase, turn, dismissed]);

  const dismissHint = () => {
    if (currentHint) {
      const newDismissed = [...dismissed, currentHint.id];
      setDismissed(newDismissed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed));
      setCurrentHint(null);
    }
  };

  const dismissAll = () => {
    const allIds = TUTORIAL_STEPS.map(s => s.id);
    setDismissed(allIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    setCurrentHint(null);
  };

  return (
    <>
      {children}
      {currentHint && (
        <div className="tutorial-overlay">
          <div className="tutorial-hint">
            <p>{currentHint.message}</p>
            <div className="tutorial-buttons">
              <button onClick={dismissHint}>Got it</button>
              <button onClick={dismissAll} className="tutorial-skip">Skip all hints</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tutorial;
