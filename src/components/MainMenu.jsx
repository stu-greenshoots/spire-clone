import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { hasSave, getRunHistory } from '../systems/saveSystem';
import { loadProgression } from '../systems/progressionSystem';
import { getAscensionDescription, getMaxAscension } from '../systems/ascensionSystem';
import { audioManager } from '../systems/audioSystem';
import { getDailyChallenge, getModifierDetails, getChallengeScore } from '../systems/dailyChallengeSystem';
import Settings from './Settings';
import StateBuilder from './StateBuilder';

const MainMenu = () => {
  const { startGame, startDailyChallenge, loadGameState, deleteSaveState, openDataEditor } = useGame();
  const [hovering, setHovering] = useState(false);
  const [hoveringContinue, setHoveringContinue] = useState(false);
  const [hoveringSettings, setHoveringSettings] = useState(false);
  const [hoveringChallenge, setHoveringChallenge] = useState(false);
  const [hoveringHistory, setHoveringHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStateBuilder, setShowStateBuilder] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showRunHistory, setShowRunHistory] = useState(false);
  const [saveExists, setSaveExists] = useState(false);
  const [selectedAscension, setSelectedAscension] = useState(0);
  const [unlockedAscension, setUnlockedAscension] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setSaveExists(hasSave());
    const progression = loadProgression();
    const maxUnlocked = Math.min(progression.highestAscension, getMaxAscension());
    setUnlockedAscension(maxUnlocked);
    // Trigger entrance animation
    const timer = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(timer);
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
      background: 'radial-gradient(ellipse at center bottom, #2a2a4a 0%, #1a1a2e 40%, #0d0d1a 100%)',
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
        maxWidth: '500px',
        height: '80%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(40, 30, 60, 0.3) 20%, rgba(30, 25, 50, 0.5) 50%, rgba(20, 20, 40, 0.7) 80%, rgba(15, 15, 30, 0.9) 100%)',
        clipPath: 'polygon(50% 0%, 53% 8%, 58% 12%, 55% 20%, 62% 25%, 58% 35%, 65% 40%, 60% 50%, 70% 55%, 62% 65%, 75% 70%, 65% 80%, 80% 85%, 70% 90%, 85% 95%, 100% 100%, 0% 100%, 15% 95%, 30% 90%, 20% 85%, 35% 80%, 25% 70%, 40% 65%, 30% 55%, 45% 50%, 35% 40%, 48% 35%, 42% 25%, 47% 20%, 45% 12%, 48% 8%)',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 40px rgba(100, 50, 150, 0.25))'
      }} />

      {/* Ambient fog */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(50, 40, 80, 0.1) 40%, rgba(30, 25, 60, 0.25) 100%)',
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

      {/* War-pattern vignette overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(10, 5, 20, 0.6) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Title section with entrance animation */}
      <div style={{
        zIndex: 1,
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease'
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 56px)',
          marginBottom: '8px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: '#FFD700',
          textShadow: `
            0 0 10px rgba(255, 215, 0, 0.8),
            0 0 20px rgba(255, 215, 0, 0.5),
            0 0 40px rgba(255, 107, 53, 0.3),
            0 4px 8px rgba(0, 0, 0, 0.6)
          `,
          animation: 'float 5s ease-in-out infinite'
        }}>
          SPIRE ASCENT
        </h1>

        {/* Narrative subtitle — Endless War tone */}
        <div style={{
          fontSize: '13px',
          color: '#8878a0',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          The Endless War
        </div>

        {/* Atmospheric tagline */}
        <p style={{
          fontSize: '15px',
          color: '#9988aa',
          marginBottom: '40px',
          maxWidth: '320px',
          lineHeight: '1.8',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
          fontStyle: 'italic',
          margin: '0 auto 40px'
        }}>
          The spire remembers every climb. The war unmakes every climber.
        </p>
      </div>

      {/* Button Container with entrance animation */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1,
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1s ease 0.3s, transform 1s ease 0.3s'
      }}>
        {/* Continue Run Button */}
        {saveExists && (
          <button
            data-testid="btn-continue"
            onClick={loadGameState}
            onMouseEnter={() => setHoveringContinue(true)}
            onMouseLeave={() => setHoveringContinue(false)}
            style={{
              background: hoveringContinue
                ? 'linear-gradient(180deg, #30dd30 0%, #20bb20 50%, #159915 100%)'
                : 'linear-gradient(180deg, #20cc20 0%, #15aa15 50%, #108810 100%)',
              color: 'white',
              border: '2px solid rgba(85, 255, 85, 0.6)',
              padding: '16px 48px',
              fontSize: '20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              boxShadow: hoveringContinue
                ? '0 0 40px rgba(80, 255, 80, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5)'
                : '0 0 20px rgba(50, 200, 50, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4)',
              touchAction: 'manipulation',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              transform: hoveringContinue ? 'scale(1.03) translateY(-2px)' : 'scale(1)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              animation: 'shimmer 2.5s infinite'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>Continue Run</span>
          </button>
        )}

        {/* Ascension Selector */}
        {unlockedAscension > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '4px'
          }}>
            <button
              onClick={() => setSelectedAscension(Math.max(0, selectedAscension - 1))}
              disabled={selectedAscension === 0}
              style={{
                background: selectedAscension === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                color: selectedAscension === 0 ? '#555' : '#aaa',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                width: '44px',
                height: '44px',
                fontSize: '18px',
                cursor: selectedAscension === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              -
            </button>
            <div style={{
              minWidth: '140px',
              textAlign: 'center',
              color: selectedAscension === 0 ? '#8878a0' : '#FFD700',
              fontSize: '13px',
              fontWeight: 'bold',
              textShadow: selectedAscension > 0 ? '0 0 10px rgba(255, 215, 0, 0.4)' : 'none'
            }}>
              {selectedAscension === 0 ? 'Normal' : `Ascension ${selectedAscension}`}
              <div style={{
                fontSize: '10px',
                color: '#666',
                fontWeight: 'normal',
                marginTop: '2px'
              }}>
                {getAscensionDescription(selectedAscension)}
              </div>
            </div>
            <button
              onClick={() => setSelectedAscension(Math.min(unlockedAscension, selectedAscension + 1))}
              disabled={selectedAscension >= unlockedAscension}
              style={{
                background: selectedAscension >= unlockedAscension ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                color: selectedAscension >= unlockedAscension ? '#555' : '#aaa',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                width: '44px',
                height: '44px',
                fontSize: '18px',
                cursor: selectedAscension >= unlockedAscension ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              +
            </button>
          </div>
        )}

        {/* New Game Button */}
        <button
          data-testid="btn-new-game"
          onClick={() => {
            deleteSaveState();
            startGame(selectedAscension);
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            background: hovering
              ? 'linear-gradient(180deg, #cc3333 0%, #aa2020 50%, #881515 100%)'
              : 'linear-gradient(180deg, #bb2525 0%, #991818 50%, #771010 100%)',
            color: 'white',
            border: '2px solid rgba(255, 85, 85, 0.6)',
            padding: '16px 48px',
            fontSize: '20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: hovering
              ? '0 0 40px rgba(255, 80, 80, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5)'
              : '0 0 20px rgba(200, 50, 50, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4)',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            transform: hovering ? 'scale(1.03) translateY(-2px)' : 'scale(1)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            animation: 'shimmer 2.5s infinite'
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>New Game</span>
        </button>

        {/* Daily Challenge Button */}
        <button
          data-testid="btn-daily-challenge"
          onClick={() => setShowDailyChallenge(true)}
          onMouseEnter={() => setHoveringChallenge(true)}
          onMouseLeave={() => setHoveringChallenge(false)}
          style={{
            background: hoveringChallenge
              ? 'linear-gradient(180deg, #cc8833 0%, #aa6620 50%, #885515 100%)'
              : 'linear-gradient(180deg, #bb7725 0%, #995518 50%, #774410 100%)',
            color: 'white',
            border: '2px solid rgba(255, 180, 85, 0.6)',
            padding: '14px 44px',
            fontSize: '17px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: hoveringChallenge
              ? '0 0 30px rgba(255, 160, 60, 0.4), 0 6px 20px rgba(0, 0, 0, 0.4)'
              : '0 0 15px rgba(200, 120, 40, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease',
            transform: hoveringChallenge ? 'scale(1.03) translateY(-2px)' : 'scale(1)'
          }}
        >
          Daily Challenge
        </button>

        {/* Run History Button */}
        <button
          data-testid="btn-run-history"
          onClick={() => setShowRunHistory(true)}
          onMouseEnter={() => setHoveringHistory(true)}
          onMouseLeave={() => setHoveringHistory(false)}
          style={{
            background: hoveringHistory
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.06)',
            color: '#9988aa',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '12px 40px',
            fontSize: '14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease',
            transform: hoveringHistory ? 'scale(1.03) translateY(-2px)' : 'scale(1)'
          }}
        >
          Run History
        </button>

        {/* Settings Button */}
        <button
          data-testid="btn-settings"
          onClick={() => { setShowSettings(true); audioManager.duckMusic(); }}
          onMouseEnter={() => setHoveringSettings(true)}
          onMouseLeave={() => setHoveringSettings(false)}
          style={{
            background: hoveringSettings
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.06)',
            color: '#9988aa',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '12px 40px',
            fontSize: '14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease',
            transform: hoveringSettings ? 'scale(1.03) translateY(-2px)' : 'scale(1)'
          }}
        >
          Settings
        </button>

        {/* Dev tools - only in development */}
        {import.meta.env.DEV && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
            <button
              onClick={openDataEditor}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#666',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 20px',
                fontSize: '11px',
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              Data Editor
            </button>
            <button
              onClick={() => setShowStateBuilder(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#666',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 20px',
                fontSize: '11px',
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              State Builder
            </button>
          </div>
        )}
      </div>

      {/* Version credit */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        fontSize: '10px',
        color: '#333',
        letterSpacing: '1px',
        zIndex: 1
      }}>
        Inspired by Slay the Spire
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) { setShowSettings(false); audioManager.unduckMusic(); }
          }}
        >
          <div style={{
            background: 'linear-gradient(180deg, #252538 0%, #1a1a2e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowSettings(false); audioManager.unduckMusic(); }}
              style={{
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <Settings />
          </div>
        </div>
      )}

      {/* State Builder Modal */}
      {showStateBuilder && (
        <StateBuilder onClose={() => setShowStateBuilder(false)} />
      )}

      {/* Daily Challenge Modal */}
      {showDailyChallenge && (
        <DailyChallengePanel
          onClose={() => setShowDailyChallenge(false)}
          onStart={(challenge) => {
            deleteSaveState();
            startDailyChallenge(challenge);
          }}
        />
      )}

      {/* Run History Modal */}
      {showRunHistory && (
        <RunHistoryPanel onClose={() => setShowRunHistory(false)} />
      )}
    </div>
  );
};

// Daily Challenge Panel — shows today's modifiers, personal best, and start button
const DailyChallengePanel = ({ onClose, onStart }) => {
  const challenge = getDailyChallenge();
  const modifiers = getModifierDetails(challenge.modifierIds);
  const personalBest = getChallengeScore(challenge.date);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(180deg, #2a2520 0%, #1a1510 100%)',
        border: '2px solid rgba(255, 180, 85, 0.4)',
        borderRadius: '12px',
        padding: '28px 24px',
        maxWidth: '380px',
        width: '90%',
        position: 'relative',
        boxShadow: '0 0 40px rgba(200, 120, 40, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255, 255, 255, 0.1)', color: '#aaa',
            border: 'none', borderRadius: '4px',
            width: '44px', height: '44px', fontSize: '18px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h2 style={{
          color: '#FFB855',
          fontSize: '22px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          textShadow: '0 0 15px rgba(255, 180, 85, 0.4)'
        }}>
          Daily Challenge
        </h2>

        {/* Date */}
        <div style={{
          color: '#887766',
          fontSize: '13px',
          marginBottom: '20px',
          letterSpacing: '1px'
        }}>
          {challenge.date}
        </div>

        {/* Modifiers */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            color: '#aa9988',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '10px'
          }}>
            Today&apos;s Modifiers
          </div>
          {modifiers.map((mod) => (
            <div key={mod.id} style={{
              background: 'rgba(255, 180, 85, 0.08)',
              border: '1px solid rgba(255, 180, 85, 0.2)',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '8px'
            }}>
              <div style={{
                color: '#FFB855',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '3px'
              }}>
                {mod.name}
                <span style={{
                  fontSize: '11px',
                  color: mod.scoreMultiplier >= 1 ? '#66cc66' : '#cc6666',
                  marginLeft: '8px',
                  fontWeight: 'normal'
                }}>
                  {mod.scoreMultiplier >= 1 ? '+' : ''}{Math.round((mod.scoreMultiplier - 1) * 100)}% score
                </span>
              </div>
              <div style={{ color: '#998877', fontSize: '12px' }}>
                {mod.description}
              </div>
            </div>
          ))}
        </div>

        {/* Personal Best */}
        {personalBest !== null && (
          <div style={{
            background: 'rgba(255, 215, 0, 0.06)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#887755', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Personal Best
            </div>
            <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>
              {personalBest.toLocaleString()}
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          data-testid="btn-start-daily"
          onClick={() => onStart(challenge)}
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #cc8833 0%, #aa6620 50%, #885515 100%)',
            color: 'white',
            border: '2px solid rgba(255, 180, 85, 0.6)',
            padding: '14px',
            fontSize: '18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(255, 160, 60, 0.3)',
            touchAction: 'manipulation',
            transition: 'all 0.3s ease'
          }}
        >
          Begin Challenge
        </button>
      </div>
    </div>
  );
};

// Run History Panel — shows past runs with statistics
const RunHistoryPanel = ({ onClose }) => {
  const history = getRunHistory();
  const progression = loadProgression();

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(180deg, #1e1e30 0%, #141425 100%)',
        border: '2px solid rgba(136, 120, 160, 0.4)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '440px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 0 40px rgba(100, 80, 150, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255, 255, 255, 0.1)', color: '#aaa',
            border: 'none', borderRadius: '4px',
            width: '44px', height: '44px', fontSize: '18px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h2 style={{
          color: '#aa99cc',
          fontSize: '20px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          textShadow: '0 0 15px rgba(136, 120, 160, 0.4)'
        }}>
          Run History
        </h2>

        {/* Overall Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Runs</div>
            <div style={{ color: '#ddd', fontSize: '20px', fontWeight: 'bold' }}>{progression.totalRuns}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Wins</div>
            <div style={{ color: '#88ff88', fontSize: '20px', fontWeight: 'bold' }}>{progression.wins}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Win Rate</div>
            <div style={{ color: '#ddd', fontSize: '20px', fontWeight: 'bold' }}>
              {progression.totalRuns > 0 ? Math.round((progression.wins / progression.totalRuns) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '20px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{ color: '#888', fontSize: '12px' }}>
            Highest Floor: <span style={{ color: '#ccc', fontWeight: 'bold' }}>{progression.highestFloor}</span>
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            Highest Ascension: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{progression.highestAscension}</span>
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            Enemies Killed: <span style={{ color: '#ccc', fontWeight: 'bold' }}>{progression.totalEnemiesKilled}</span>
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            Cards Played: <span style={{ color: '#ccc', fontWeight: 'bold' }}>{progression.totalCardsPlayed}</span>
          </div>
        </div>

        {/* Run List */}
        <div style={{
          color: '#776688',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '10px'
        }}>
          Recent Runs
        </div>

        {history.length === 0 ? (
          <div style={{ color: '#555', fontSize: '14px', textAlign: 'center', padding: '30px 0', fontStyle: 'italic' }}>
            No runs recorded yet. Start a game to begin tracking!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((run, idx) => (
              <div key={idx} style={{
                background: run.won
                  ? 'rgba(68, 170, 68, 0.08)'
                  : 'rgba(170, 68, 68, 0.08)',
                border: `1px solid ${run.won ? 'rgba(68, 170, 68, 0.2)' : 'rgba(170, 68, 68, 0.2)'}`,
                borderRadius: '8px',
                padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{
                    color: run.won ? '#88ff88' : '#ff8888',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    {run.won ? 'Victory' : 'Defeat'}
                    {run.character && run.character !== 'ironclad' && (
                      <span style={{ color: '#888', fontWeight: 'normal', marginLeft: '6px', fontSize: '11px' }}>
                        ({run.character})
                      </span>
                    )}
                  </span>
                  <span style={{ color: '#555', fontSize: '11px' }}>{formatDate(run.date)}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888' }}>
                  <span>Floor {run.floor}</span>
                  <span>Act {run.act}</span>
                  {run.ascension > 0 && <span style={{ color: '#FFD700' }}>A{run.ascension}</span>}
                  <span>{run.deckSize} cards</span>
                  <span>{run.relicCount} relics</span>
                </div>
                {!run.won && run.causeOfDeath && (
                  <div style={{ color: '#775555', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                    {run.causeOfDeath}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
