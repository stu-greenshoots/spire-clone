import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import {
  getSlowestActions,
  getMemoryUsage,
  estimateStateSize,
  formatBytes
} from '../systems/performanceMonitor';

/**
 * DevOverlay - Toggleable dev overlay showing game state (QR-04)
 *
 * Features:
 * - Toggle with backtick (`) key
 * - Shows: phase, floor, act, turn, player stats, enemies, hand, pile counts
 * - FPS counter (rolling average)
 * - Last action dispatched
 * - Click-through design (doesn't interfere with game)
 * - Machine-parseable with data-testid attributes
 *
 * Dev mode only - renders nothing in production.
 */
const DevOverlay = () => {
  const { state, lastAction } = useGame();
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [perfData, setPerfData] = useState({ slowest: [], memory: null, stateSize: 0 });
  const frameTimesRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const rafRef = useRef(null);

  // FPS calculation - only runs when overlay is visible to save CPU
  useEffect(() => {
    if (!import.meta.env.DEV || !visible) return;

    // Reset frame times when overlay becomes visible
    frameTimesRef.current = [];
    lastFrameTimeRef.current = performance.now();
    let frameCount = 0;

    const calculateFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      frameCount++;

      // Rolling average of last 30 frames
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
      }

      const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      setFps(Math.round(1000 / avgDelta));

      // Update performance data every 60 frames (~1 second)
      if (frameCount % 60 === 0) {
        setPerfData({
          slowest: getSlowestActions(3),
          memory: getMemoryUsage(),
          stateSize: estimateStateSize(state)
        });
      }

      rafRef.current = requestAnimationFrame(calculateFps);
    };

    rafRef.current = requestAnimationFrame(calculateFps);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [visible, state]);

  // Backtick toggle
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e) => {
      if (e.key === '`') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Production: render nothing
  if (!import.meta.env.DEV || !visible) return null;

  // Format status effects for display
  const formatEffects = (entity) => {
    const effects = [];
    const keys = ['strength', 'dexterity', 'vulnerable', 'weak', 'frail', 'poison',
      'artifact', 'intangible', 'thorns', 'metallicize', 'platedArmor', 'regen',
      'hex', 'confused', 'flight', 'barricade', 'entangle', 'focus', 'mantra'];
    keys.forEach(key => {
      if (entity[key]) {
        effects.push(`${key}:${entity[key]}`);
      }
    });
    return effects.join(', ') || 'none';
  };

  // Format intent for display
  const formatIntent = (enemy) => {
    if (!enemy.intent) return 'unknown';
    const { type, damage, times, block, effect, value } = enemy.intent;
    if (type === 'attack') return times > 1 ? `ATK ${damage}x${times}` : `ATK ${damage}`;
    if (type === 'attackDefend') return `ATK ${damage} + BLK ${block}`;
    if (type === 'defend') return `BLK ${block || value || '?'}`;
    if (type === 'buff') return `BUFF ${effect || ''}`;
    if (type === 'debuff') return `DEBUFF ${effect || ''}`;
    return type;
  };

  const player = state.player || {};
  const hand = state.hand || [];
  const enemies = (state.enemies || []).filter(e => e.currentHp > 0);

  return (
    <div
      data-testid="dev-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#0f0',
        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
      }}
    >
      {/* Top-left: Game State */}
      <div style={{ position: 'absolute', top: 8, left: 8 }}>
        <div data-testid="dev-phase">Phase: {state.phase}</div>
        <div data-testid="dev-floor">Floor: {state.currentFloor || 0}</div>
        <div data-testid="dev-act">Act: {state.act || 1}</div>
        <div data-testid="dev-turn">Turn: {state.turn || 0}</div>
        <div data-testid="dev-character">Character: {state.character || 'none'}</div>
        {state.endlessMode && <div data-testid="dev-endless">Endless Loop: {state.endlessLoop || 0}</div>}
      </div>

      {/* Top-right: FPS & Last Action */}
      <div style={{ position: 'absolute', top: 8, right: 8, textAlign: 'right' }}>
        <div data-testid="dev-fps" style={{ color: fps < 30 ? '#f00' : fps < 50 ? '#ff0' : '#0f0' }}>
          FPS: {fps}
        </div>
        <div data-testid="dev-last-action" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Last: {lastAction?.type || 'none'}
        </div>
        <div data-testid="dev-state-size" style={{ color: '#888', marginTop: 4 }}>
          State: {formatBytes(perfData.stateSize)}
        </div>
        {perfData.memory && (
          <div data-testid="dev-memory" style={{ color: perfData.memory.percentUsed > 80 ? '#f00' : '#888' }}>
            Heap: {perfData.memory.usedFormatted}/{perfData.memory.limitFormatted} ({perfData.memory.percentUsed}%)
          </div>
        )}
        {perfData.slowest.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ color: '#fa0', fontSize: '10px' }}>Slowest Actions:</div>
            {perfData.slowest.map(({ action, avg, max }) => (
              <div
                key={action}
                data-testid={`dev-perf-${action}`}
                style={{
                  fontSize: '10px',
                  color: avg > 16 ? '#f00' : avg > 8 ? '#ff0' : '#888'
                }}
              >
                {action}: {avg.toFixed(1)}ms (max: {max.toFixed(1)}ms)
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Left side: Player Stats */}
      <div style={{ position: 'absolute', top: 100, left: 8 }}>
        <div style={{ color: '#ff0', marginBottom: 4 }}>PLAYER</div>
        <div data-testid="dev-player-hp">HP: {player.currentHp || 0}/{player.maxHp || 0}</div>
        <div data-testid="dev-player-energy">Energy: {player.energy || 0}/{player.maxEnergy || 3}</div>
        <div data-testid="dev-player-block">Block: {player.block || 0}</div>
        <div data-testid="dev-player-gold">Gold: {player.gold || 0}</div>
        {player.currentStance && player.currentStance !== 'none' && (
          <div data-testid="dev-player-stance">Stance: {player.currentStance}</div>
        )}
        {player.mantra > 0 && <div data-testid="dev-player-mantra">Mantra: {player.mantra}/10</div>}
        {player.focus !== 0 && <div data-testid="dev-player-focus">Focus: {player.focus}</div>}
        {player.orbs && player.orbs.length > 0 && (
          <div data-testid="dev-player-orbs">Orbs: {player.orbs.map(o => `${o.type}(${o.amount || 0})`).join(', ')}</div>
        )}
        <div data-testid="dev-player-effects" style={{ color: '#aaa', fontSize: '10px', maxWidth: 150 }}>
          {formatEffects(player)}
        </div>
      </div>

      {/* Right side: Enemies */}
      <div style={{ position: 'absolute', top: 100, right: 8, textAlign: 'right' }}>
        <div style={{ color: '#f00', marginBottom: 4 }}>ENEMIES ({enemies.length})</div>
        {enemies.map((enemy, i) => (
          <div key={enemy.instanceId || i} data-testid={`dev-enemy-${i}`} style={{ marginBottom: 8 }}>
            <div data-testid={`dev-enemy-${i}-name`}>{enemy.name || 'Unknown'}</div>
            <div data-testid={`dev-enemy-${i}-hp`}>HP: {enemy.currentHp ?? 0}/{enemy.maxHp ?? 0}</div>
            {(enemy.block ?? 0) > 0 && <div data-testid={`dev-enemy-${i}-block`}>Block: {enemy.block}</div>}
            <div data-testid={`dev-enemy-${i}-intent`} style={{ color: '#fa0' }}>{formatIntent(enemy)}</div>
            <div data-testid={`dev-enemy-${i}-effects`} style={{ color: '#aaa', fontSize: '10px' }}>
              {formatEffects(enemy)}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom-left: Hand & Piles */}
      <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
        <div style={{ color: '#0ff', marginBottom: 4 }}>HAND ({hand.length})</div>
        <div data-testid="dev-hand" style={{ maxWidth: 300 }}>
          {hand.map((card, i) => {
            const energy = player.energy || 0;
            const cost = card.cost ?? 0;
            const playable = cost <= energy || cost === -1;
            return (
              <span
                key={card.instanceId || i}
                data-testid={`dev-hand-${i}`}
                style={{
                  color: playable ? '#0f0' : '#888',
                  marginRight: 8
                }}
              >
                {i + 1}:{card.name}({cost === -1 ? 'X' : cost})
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 8 }}>
          <span data-testid="dev-draw-pile" style={{ marginRight: 16 }}>Draw: {state.drawPile?.length || 0}</span>
          <span data-testid="dev-discard-pile" style={{ marginRight: 16 }}>Discard: {state.discardPile?.length || 0}</span>
          <span data-testid="dev-exhaust-pile">Exhaust: {state.exhaustPile?.length || 0}</span>
        </div>
      </div>

      {/* Bottom-right: Help */}
      <div style={{ position: 'absolute', bottom: 8, right: 8, color: '#666', fontSize: '10px' }}>
        Press ` to hide
      </div>
    </div>
  );
};

export default DevOverlay;
