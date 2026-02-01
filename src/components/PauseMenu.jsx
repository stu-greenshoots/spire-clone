import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Settings from './Settings';
import DeckViewer from './DeckViewer';

const PauseMenu = ({ onClose }) => {
  const { state, saveGameState, returnToMenu } = useGame();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'settings', 'deck'
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const handleSaveAndQuit = () => {
    saveGameState();
    returnToMenu();
    onClose();
  };

  const handleQuitClick = () => {
    setShowQuitConfirm(true);
  };

  const renderContent = () => {
    if (activeTab === 'settings') {
      return (
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <Settings />
        </div>
      );
    }

    if (activeTab === 'deck') {
      return (
        <DeckViewer
          deck={state.deck || []}
          relics={state.relics || []}
          runStats={{}}
          onClose={() => setActiveTab('menu')}
        />
      );
    }

    // Main pause menu
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
        <h2 style={styles.title}>Paused</h2>

        <button
          data-testid="pause-resume"
          onClick={onClose}
          style={styles.primaryButton}
        >
          Resume
        </button>

        <button
          data-testid="pause-settings"
          onClick={() => setActiveTab('settings')}
          style={styles.menuButton}
        >
          Settings
        </button>

        <button
          data-testid="pause-deck"
          onClick={() => setActiveTab('deck')}
          style={styles.menuButton}
        >
          View Deck ({state.deck?.length || 0})
        </button>

        {/* Run stats */}
        <div style={styles.statsSection}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Act</span>
            <span style={styles.statValue}>{state.act || 1}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Floor</span>
            <span style={styles.statValue}>{(state.currentFloor || 0) + 2}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>HP</span>
            <span style={styles.statValue}>{state.player?.currentHp}/{state.player?.maxHp}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Gold</span>
            <span style={styles.statValue}>{state.player?.gold || 0}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: '12px', marginTop: '4px' }}>
          {!showQuitConfirm ? (
            <button
              data-testid="pause-quit"
              onClick={handleQuitClick}
              style={styles.quitButton}
            >
              Save & Quit to Menu
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#ccc', fontSize: '13px', textAlign: 'center' }}>
                Save and return to main menu?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  data-testid="pause-quit-confirm"
                  onClick={handleSaveAndQuit}
                  style={{ ...styles.quitButton, flex: 1 }}
                >
                  Yes, Quit
                </button>
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  style={{ ...styles.menuButton, flex: 1 }}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      data-testid="pause-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={styles.overlay}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={styles.modal}
      >
        {/* Back button when in sub-screens */}
        {activeTab !== 'menu' && (
          <button
            onClick={() => setActiveTab('menu')}
            style={styles.backButton}
          >
            Back
          </button>
        )}

        {/* Close button */}
        <button
          data-testid="pause-close"
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Close pause menu"
        >
          {'\u2715'}
        </button>

        {renderContent()}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.15s ease-out'
  },
  modal: {
    background: 'linear-gradient(180deg, #252538 0%, #1a1a2e 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    maxWidth: '420px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8)'
  },
  title: {
    margin: '0 0 8px 0',
    textAlign: 'center',
    color: '#FFD700',
    fontSize: '1.4rem',
    letterSpacing: '3px',
    textTransform: 'uppercase'
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
    color: 'white',
    border: '2px solid #cc4444',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 15px rgba(170, 32, 32, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    touchAction: 'manipulation'
  },
  menuButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ccc',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    touchAction: 'manipulation'
  },
  quitButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(100, 100, 100, 0.2)',
    color: '#999',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    touchAction: 'manipulation'
  },
  statsSection: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0'
  },
  statLabel: {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  statValue: {
    color: '#ddd',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#aaa',
    border: 'none',
    borderRadius: '4px',
    width: '44px',
    height: '44px',
    fontSize: '18px',
    cursor: 'pointer',
    touchAction: 'manipulation',
    zIndex: 1
  },
  backButton: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#aaa',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    touchAction: 'manipulation',
    zIndex: 1
  }
};

export default PauseMenu;
