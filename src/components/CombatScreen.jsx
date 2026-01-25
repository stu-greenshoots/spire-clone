import { useState, useRef, useEffect, useCallback } from 'react';
import { useGame, GAME_PHASE } from '../context/GameContext';
import Card from './Card';
import Enemy from './Enemy';
import EnemyInfoPanel from './EnemyInfoPanel';
import AnimationOverlay from './AnimationOverlay';
import { useAnimations } from '../hooks/useAnimations';
import { ANIMATION_TYPE } from '../constants/animationTypes';
import CardSelectionModal from './CardSelectionModal';
import { CARD_TYPES } from '../data/cards';
import CardTooltip from './CardTooltip';
import { getPassiveRelicEffects } from '../systems/combatSystem';

const CombatScreen = ({ showDefeatedEnemies = false }) => {
  const { state, selectCard, playCard, cancelTarget, endTurn, selectCardFromPile, cancelCardSelection } = useGame();
  const { player, enemies, hand, drawPile, discardPile, exhaustPile, selectedCard, targetingMode, turn, phase, cardSelection } = state;

  const [showDeck, setShowDeck] = useState(null);
  const [showEnemyInfo, setShowEnemyInfo] = useState(null);
  const [enemyHitStates, setEnemyHitStates] = useState({});
  const [dyingEnemies, setDyingEnemies] = useState({});
  // Store defeated enemies for victory overlay display
  const [defeatedEnemies, setDefeatedEnemies] = useState([]);
  const [_playerHit, setPlayerHit] = useState(false);
  const [energySpent, setEnergySpent] = useState(false);
  const [cardPlaying, setCardPlaying] = useState(null);
  const [combatStarted] = useState(true);
  const [newlyDrawnCards, setNewlyDrawnCards] = useState(new Set());

  // Drag and drop state
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dropTargetEnemy, setDropTargetEnemy] = useState(null);

  const enemyRefs = useRef({});
  const containerRef = useRef(null);
  const prevEnemyHp = useRef({});
  const prevEnemyData = useRef({});
  const prevEnemyIds = useRef(new Set(enemies.map(e => e.instanceId)));
  const prevPlayerHp = useRef(player.currentHp);
  const prevPlayerBlock = useRef(player.block);
  const prevPlayerEnergy = useRef(player.energy);
  const prevHandSize = useRef(hand.length);
  const lastDragUpdate = useRef(0);

  // Store current enemy data for death animations
  useEffect(() => {
    enemies.forEach(enemy => {
      prevEnemyData.current[enemy.instanceId] = { ...enemy };
    });
  }, [enemies]);

  const { animations, addAnimation, removeAnimation } = useAnimations();

  // Track card draw animations
  useEffect(() => {
    if (hand.length > prevHandSize.current) {
      const newCards = hand.slice(prevHandSize.current);
      const newCardIds = new Set(newCards.map(c => c.instanceId));
      setNewlyDrawnCards(newCardIds);

      // Clear the animation state after animation completes
      setTimeout(() => {
        setNewlyDrawnCards(new Set());
      }, 400);
    }
    prevHandSize.current = hand.length;
  }, [hand]);

  // Track damage to enemies and show floating numbers
  useEffect(() => {
    enemies.forEach((enemy) => {
      const prevHp = prevEnemyHp.current[enemy.instanceId];
      if (prevHp !== undefined && enemy.currentHp < prevHp) {
        const damage = prevHp - enemy.currentHp;

        // Trigger hit animation
        setEnemyHitStates(prev => ({ ...prev, [enemy.instanceId]: true }));
        setTimeout(() => {
          setEnemyHitStates(prev => ({ ...prev, [enemy.instanceId]: false }));
        }, 500);

        // Add floating damage number
        const enemyEl = enemyRefs.current[enemy.instanceId];
        if (enemyEl && containerRef.current) {
          const rect = enemyEl.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const x = rect.left - containerRect.left + rect.width / 2;
          const y = rect.top - containerRect.top + rect.height / 3;
          addAnimation(ANIMATION_TYPE.DAMAGE, damage, x, y);
        }
      }
      prevEnemyHp.current[enemy.instanceId] = enemy.currentHp;
    });
  }, [enemies, addAnimation]);

  // Track player damage and healing - setState is intentional for animation triggers
  useEffect(() => {
    if (player.currentHp < prevPlayerHp.current) {
      const damage = prevPlayerHp.current - player.currentHp;
      setPlayerHit(true);
      setTimeout(() => setPlayerHit(false), 500);
      // Add floating damage number for enemy attacks on player
      if (containerRef.current) {
        // Position near player stats area (bottom left)
        addAnimation(ANIMATION_TYPE.DAMAGE, damage, 80, 120);
      }
    } else if (player.currentHp > prevPlayerHp.current) {
      // Player healed - add floating heal number
      const healed = player.currentHp - prevPlayerHp.current;
      if (containerRef.current) {
        addAnimation(ANIMATION_TYPE.HEAL, healed, 100, 40);
      }
    }
    prevPlayerHp.current = player.currentHp;
  }, [player.currentHp, addAnimation]);

  // Track block gained
  useEffect(() => {
    if (player.block > prevPlayerBlock.current) {
      const gained = player.block - prevPlayerBlock.current;
      // Add floating block number near player stats
      if (containerRef.current) {
        addAnimation(ANIMATION_TYPE.BLOCK, gained, 100, 60);
      }
    }
    prevPlayerBlock.current = player.block;
  }, [player.block, addAnimation]);

  // Track energy spent - setState is intentional for animation triggers
  useEffect(() => {
    if (player.energy < prevPlayerEnergy.current) {
      setEnergySpent(true);
      setTimeout(() => setEnergySpent(false), 300);
    }
    prevPlayerEnergy.current = player.energy;
  }, [player.energy]);

  // Track enemy deaths - store dying enemies for death animation
  useEffect(() => {
    const currentEnemyIds = new Set(enemies.map(e => e.instanceId));
    const removedEnemyIds = [...prevEnemyIds.current].filter(id => !currentEnemyIds.has(id));

    if (removedEnemyIds.length > 0) {
      // Mark these enemies as dying with their data
      const newDyingEnemies = {};
      const newDefeatedEnemies = [];
      removedEnemyIds.forEach(id => {
        const enemyData = prevEnemyData.current[id];
        if (enemyData) {
          newDyingEnemies[id] = { ...enemyData, currentHp: 0 };
          // Also store for defeated display
          newDefeatedEnemies.push({ ...enemyData, currentHp: 0 });
        }
      });
      setDyingEnemies(prev => ({ ...prev, ...newDyingEnemies }));
      // Accumulate defeated enemies for victory overlay
      setDefeatedEnemies(prev => [...prev, ...newDefeatedEnemies]);

      // Clear dying enemies after animation
      setTimeout(() => {
        setDyingEnemies(prev => {
          const updated = { ...prev };
          removedEnemyIds.forEach(id => {
            delete updated[id];
            delete prevEnemyData.current[id];
          });
          return updated;
        });
      }, 600);
    }

    prevEnemyIds.current = currentEnemyIds;
  }, [enemies]);

  const handleCardClick = (card) => {
    if (targetingMode) {
      cancelTarget();
    } else {
      // Trigger card play animation for non-targeting cards
      if (card.type !== 'attack' || enemies.length === 1) {
        setCardPlaying(card.instanceId);
        setTimeout(() => {
          setCardPlaying(null);
        }, 300);
      }
      selectCard(card);
    }
  };

  const handleEnemyClick = (enemyInstanceId) => {
    if (targetingMode && selectedCard) {
      // Trigger card play animation
      setCardPlaying(selectedCard.instanceId);
      setTimeout(() => {
        setCardPlaying(null);
      }, 300);
      playCard(selectedCard, enemyInstanceId);
    } else {
      // Show enemy info panel when not targeting
      const enemy = enemies.find(e => e.instanceId === enemyInstanceId);
      setShowEnemyInfo(enemy);
    }
  };

  const canPlayCard = useCallback((card) => {
    if (card.unplayable) return false;
    if (card.cost < 0) return false;
    return player.energy >= card.cost;
  }, [player.energy]);

  // Drag and drop handlers
  const handleDragStart = useCallback((card, e) => {
    if (!canPlayCard(card)) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setDraggingCard(card);
    setDragPosition({ x: clientX, y: clientY });
    setIsDragging(true);
  }, [canPlayCard]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !draggingCard) return;

    // Throttle to 60fps (16ms)
    const now = Date.now();
    if (now - lastDragUpdate.current < 16) return;
    lastDragUpdate.current = now;

    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragPosition({ x: clientX, y: clientY });

    // Check if hovering over enemy area for drop target detection
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeY = clientY - containerRect.top;
      const containerHeight = containerRect.height;

      // If dragging card is in the upper 60% of screen (enemy area)
      if (relativeY < containerHeight * 0.6) {
        // Find which enemy we're over
        let foundEnemy = null;
        enemies.forEach((enemy) => {
          const enemyEl = enemyRefs.current[enemy.instanceId];
          if (enemyEl) {
            const enemyRect = enemyEl.getBoundingClientRect();
            if (clientX >= enemyRect.left && clientX <= enemyRect.right &&
                clientY >= enemyRect.top && clientY <= enemyRect.bottom) {
              foundEnemy = enemy.instanceId;
            }
          }
        });
        setDropTargetEnemy(foundEnemy);
      } else {
        setDropTargetEnemy(null);
      }
    }
  }, [isDragging, draggingCard, enemies]);

  const handleDragEnd = useCallback((e) => {
    if (!isDragging || !draggingCard) {
      setIsDragging(false);
      setDraggingCard(null);
      setDropTargetEnemy(null);
      return;
    }

    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeY = clientY - containerRect.top;
      const containerHeight = containerRect.height;

      // Check if dropped in enemy area (upper 60% of screen)
      if (relativeY < containerHeight * 0.6) {
        const card = draggingCard;

        // For attack cards that need targeting
        if (card.type === 'attack' && enemies.length > 1) {
          if (dropTargetEnemy !== null) {
            // Play card on specific enemy
            setCardPlaying(card.instanceId);
            setTimeout(() => setCardPlaying(null), 300);
            playCard(card, dropTargetEnemy);
          } else {
            // Entered targeting mode
            selectCard(card);
          }
        } else {
          // Non-targeted cards or single enemy
          setCardPlaying(card.instanceId);
          setTimeout(() => setCardPlaying(null), 300);
          selectCard(card);
        }
      }
    }

    setIsDragging(false);
    setDraggingCard(null);
    setDropTargetEnemy(null);
  }, [isDragging, draggingCard, dropTargetEnemy, enemies, playCard, selectCard]);

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handleDragMove(e);
      const handleEnd = (e) => handleDragEnd(e);

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Determine background based on enemy type
  const getBackgroundStyle = () => {
    const hasBoss = enemies.some(e => e.type === 'boss');
    const hasElite = enemies.some(e => e.type === 'elite');
    const enemyId = enemies[0]?.id || '';

    if (hasBoss) {
      // Boss fight - dramatic red/purple theme
      return {
        background: 'linear-gradient(180deg, #1a0a1a 0%, #2a1020 30%, #1a0515 60%, #0a0510 100%)',
        particles: 'radial-gradient(ellipse at 50% 20%, rgba(200, 50, 100, 0.15) 0%, transparent 60%)',
        ambientColor: 'rgba(255, 50, 100, 0.1)',
        groundGlow: '#aa2244'
      };
    } else if (hasElite) {
      // Elite fight - golden theme
      return {
        background: 'linear-gradient(180deg, #1a1508 0%, #252015 30%, #1a150a 60%, #0a0a05 100%)',
        particles: 'radial-gradient(ellipse at 50% 20%, rgba(255, 200, 50, 0.12) 0%, transparent 60%)',
        ambientColor: 'rgba(255, 200, 50, 0.08)',
        groundGlow: '#aa8822'
      };
    } else if (enemyId.includes('slime')) {
      // Slime fight - green swamp theme
      return {
        background: 'linear-gradient(180deg, #0a1510 0%, #152518 30%, #0a1a0f 60%, #050a08 100%)',
        particles: 'radial-gradient(ellipse at 50% 80%, rgba(50, 200, 100, 0.1) 0%, transparent 50%)',
        ambientColor: 'rgba(50, 200, 100, 0.08)',
        groundGlow: '#228844'
      };
    } else if (enemyId.includes('cultist') || enemyId.includes('chosen')) {
      // Cult fight - purple mystical theme
      return {
        background: 'linear-gradient(180deg, #10081a 0%, #1a1025 30%, #150a20 60%, #080510 100%)',
        particles: 'radial-gradient(ellipse at 50% 30%, rgba(150, 50, 200, 0.12) 0%, transparent 55%)',
        ambientColor: 'rgba(150, 50, 200, 0.1)',
        groundGlow: '#6622aa'
      };
    } else {
      // Default dungeon theme
      return {
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 30%, #12121f 60%, #0a0a12 100%)',
        particles: 'radial-gradient(ellipse at 50% 0%, rgba(100, 100, 200, 0.1) 0%, transparent 50%)',
        ambientColor: 'rgba(100, 150, 200, 0.05)',
        groundGlow: '#334466'
      };
    }
  };

  const bgStyle = getBackgroundStyle();

  const passiveEffects = getPassiveRelicEffects(state.relics, {});
  const hideIntents = passiveEffects.hideIntents;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        background: bgStyle.background,
        overflow: 'hidden',
        position: 'relative',
        paddingTop: '90px',
        animation: combatStarted ? 'combatStart 0.4s ease-out' : 'none'
      }}
    >
      {/* Animation Overlay for floating numbers */}
      <AnimationOverlay
        animations={animations}
        onAnimationComplete={removeAnimation}
      />

      {/* Background scenery elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Distant mountains/spires silhouette */}
        <div style={{
          position: 'absolute',
          bottom: '40%',
          left: 0,
          right: 0,
          height: '200px',
          background: `linear-gradient(180deg, transparent 0%, ${bgStyle.ambientColor} 100%)`,
          clipPath: 'polygon(0% 100%, 5% 60%, 12% 80%, 20% 40%, 28% 70%, 35% 30%, 45% 55%, 50% 20%, 55% 50%, 65% 35%, 72% 60%, 80% 25%, 88% 55%, 95% 45%, 100% 70%, 100% 100%)',
          opacity: 0.6
        }} />

        {/* Ground glow effect */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '150px',
          background: `radial-gradient(ellipse at 50% 100%, ${bgStyle.groundGlow}33 0%, transparent 70%)`,
        }} />

        {/* Floating particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(2px 2px at 10% 20%, rgba(255, 255, 255, 0.15), transparent),
            radial-gradient(2px 2px at 30% 60%, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(2px 2px at 50% 35%, rgba(255, 255, 255, 0.12), transparent),
            radial-gradient(2px 2px at 70% 75%, rgba(255, 255, 255, 0.08), transparent),
            radial-gradient(2px 2px at 90% 45%, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(3px 3px at 25% 80%, rgba(255, 255, 255, 0.05), transparent),
            radial-gradient(3px 3px at 75% 15%, rgba(255, 255, 255, 0.07), transparent)
          `,
          animation: 'float 8s ease-in-out infinite'
        }} />
      </div>

      {/* Ambient particles effect (CSS background) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: bgStyle.particles,
        pointerEvents: 'none'
      }} />

      {/* Turn indicator - minimal, below persistent header */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '4px 15px',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '3px 10px',
          borderRadius: '10px',
          border: '1px solid #444'
        }}>
          <span style={{ color: '#888', fontSize: '11px' }}>Turn </span>
          <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>{turn + 1}</span>
        </div>
      </div>

      {/* Enemy Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        padding: '15px',
        flexWrap: 'wrap',
        overflow: 'auto',
        background: 'radial-gradient(ellipse at center, rgba(50, 50, 80, 0.2) 0%, transparent 70%)',
        position: 'relative',
        border: isDragging ? '2px dashed rgba(255, 215, 0, 0.5)' : '2px dashed transparent',
        transition: 'border-color 0.2s ease'
      }}>
        {/* Drop zone indicator when dragging */}
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, rgba(255, 100, 100, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0
          }}>
            <div style={{
              color: 'rgba(255, 215, 0, 0.6)',
              fontSize: '16px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
            }}>
              Drop card here to play
            </div>
          </div>
        )}

        {/* Render active enemies */}
        {enemies.map((enemy) => (
          <div
            key={enemy.instanceId}
            data-testid={`enemy-${enemy.instanceId}`}
            ref={el => enemyRefs.current[enemy.instanceId] = el}
            style={{
              animation: enemyHitStates[enemy.instanceId] ? 'enemyHit 0.5s ease-out' : 'none',
              transform: dropTargetEnemy === enemy.instanceId ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.15s ease',
              zIndex: dropTargetEnemy === enemy.instanceId ? 10 : 1,
              boxShadow: dropTargetEnemy === enemy.instanceId ? '0 0 30px rgba(255, 100, 100, 0.6)' : 'none',
              borderRadius: '12px'
            }}
          >
            <Enemy
              enemy={enemy}
              onClick={() => handleEnemyClick(enemy.instanceId)}
              targeted={(targetingMode && enemies.length > 1) || dropTargetEnemy === enemy.instanceId}
              hideIntents={hideIntents}
            />
          </div>
        ))}

        {/* Render dying enemies with death animation */}
        {Object.values(dyingEnemies).map((enemy) => (
          <div
            key={`dying-${enemy.instanceId}`}
            style={{
              animation: 'enemyDeath 0.6s ease-out forwards',
              pointerEvents: 'none'
            }}
          >
            <Enemy
              enemy={enemy}
              onClick={() => {}}
              targeted={false}
              hideIntents={hideIntents}
            />
          </div>
        ))}

        {/* Render defeated enemies for victory overlay */}
        {showDefeatedEnemies && defeatedEnemies.map((enemy) => (
          <div
            key={`defeated-${enemy.instanceId}`}
            className="enemy--defeated"
            style={{
              pointerEvents: 'none'
            }}
          >
            <Enemy
              enemy={enemy}
              onClick={() => {}}
              targeted={false}
              hideIntents={true}
              defeated={true}
            />
          </div>
        ))}
      </div>

      {/* Targeting Indicator */}
      {targetingMode && (
        <div
          onClick={cancelTarget}
          style={{
            padding: '10px',
            background: 'linear-gradient(180deg, #FFD700 0%, #cc9900 100%)',
            color: '#000',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            animation: 'glowPulse 1.5s ease-in-out infinite'
          }}
        >
           SELECT TARGET - Tap to Cancel
        </div>
      )}

      {/* Hand Area */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
        borderTop: '2px solid #333',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Scrollable card container */}
        <div
          data-testid="hand-area"
          style={{
          padding: '12px 10px',
          paddingBottom: '5px',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          gap: '8px',
          justifyContent: hand.length > 4 ? 'flex-start' : 'center',
          minHeight: '155px',
          alignItems: 'flex-end',
          WebkitOverflowScrolling: 'touch'
        }}>
        {hand.map((card, index) => {
          const isPlaying = cardPlaying === card.instanceId;
          const isNewlyDrawn = newlyDrawnCards.has(card.instanceId);
          const isSelected = selectedCard?.instanceId === card.instanceId;
          const isBeingDragged = draggingCard?.instanceId === card.instanceId;

          return (
            <div
              key={card.instanceId}
              onMouseDown={(e) => handleDragStart(card, e)}
              onTouchStart={(e) => handleDragStart(card, e)}
              style={{
                transform: `translateY(${isSelected ? '-10px' : '0'})`,
                transition: isPlaying ? 'none' : 'transform 0.2s ease',
                animation: isPlaying
                  ? 'cardFlyToEnemy 0.3s ease-out forwards'
                  : isNewlyDrawn
                    ? `cardDraw 0.4s ease-out ${index * 0.05}s both`
                    : 'none',
                opacity: isBeingDragged ? 0.4 : 1,
                cursor: canPlayCard(card) ? 'grab' : 'not-allowed',
                touchAction: 'pan-x',
                flexShrink: 0
              }}
            >
              <CardTooltip card={card} player={player} targetEnemy={card.type === CARD_TYPES.ATTACK && enemies.length === 1 ? enemies[0] : null}>
                <Card
                  card={card}
                  onClick={() => !isDragging && handleCardClick(card)}
                  selected={isSelected}
                  disabled={!canPlayCard(card)}
                  player={player}
                  targetEnemy={card.type === CARD_TYPES.ATTACK && enemies.length === 1 ? enemies[0] : null}
                />
              </CardTooltip>
            </div>
          );
        })}
        {hand.length === 0 && (
          <div style={{
            color: '#555',
            padding: '30px',
            textAlign: 'center',
            width: '100%',
            fontStyle: 'italic'
          }}>
            No cards in hand
          </div>
        )}
        </div>

        {/* Visual scroll track for large hands */}
        {hand.length > 4 && (
          <div style={{
            height: '12px',
            margin: '0 10px 8px 10px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            border: '1px solid #333'
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #666 0%, #444 100%)',
              borderRadius: '4px',
              height: '100%',
              width: `${Math.max(20, 100 / Math.ceil(hand.length / 4))}%`,
              minWidth: '40px',
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)'
            }} />
            <span
              className="swipe-hint"
              style={{
                marginLeft: 'auto',
                color: '#666',
                fontSize: '10px',
                paddingRight: '5px'
              }}
            >
              ← swipe →
            </span>
          </div>
        )}
      </div>

      {/* Dragged Card Overlay */}
      {isDragging && draggingCard && (
        <div
          className="card dragging"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: `translate(${dragPosition.x - 50}px, ${dragPosition.y - 72}px) rotate(-5deg) scale(1.1)`,
            zIndex: 1000,
            pointerEvents: 'none',
            willChange: 'transform',
            animation: 'cardDragging 0.5s ease-in-out infinite',
            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))'
          }}>
          <Card
            card={draggingCard}
            selected={true}
            disabled={false}
            player={player}
            targetEnemy={
              draggingCard.type === CARD_TYPES.ATTACK
                ? (dropTargetEnemy !== null
                    ? enemies.find(e => e.instanceId === dropTargetEnemy)
                    : enemies.length === 1 ? enemies[0] : null)
                : null
            }
          />
        </div>
      )}


      {/* Bottom Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
        borderTop: '1px solid #333'
      }}>
        {/* Pile Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <PileButton
            label="Draw"
            count={drawPile.length}
            onClick={() => setShowDeck('draw')}
            color="#44aa88"
          />
          <PileButton
            label="Disc"
            count={discardPile.length}
            onClick={() => setShowDeck('discard')}
            color="#aa8844"
          />
          {exhaustPile.length > 0 && (
            <PileButton
              label="Exh"
              count={exhaustPile.length}
              onClick={() => setShowDeck('exhaust')}
              color="#aa4466"
            />
          )}
        </div>

        {/* Energy Orb */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '52px',
          height: '52px',
          background: 'radial-gradient(circle at 30% 30%, #ffdd55 0%, #cc9900 50%, #886600 100%)',
          borderRadius: '50%',
          border: '3px solid #aa8800',
          boxShadow: '0 0 15px rgba(255, 215, 0, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.3), inset 0 3px 8px rgba(255, 255, 255, 0.3)',
          animation: energySpent ? 'energySpent 0.3s ease-out' : 'energyGlow 2s ease-in-out infinite'
        }}>
          <span style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
            lineHeight: '1'
          }}>
            {player.energy}/{player.maxEnergy}
          </span>
          <span style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '7px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '1px'
          }}>
            Energy
          </span>
        </div>

        {/* End Turn Button */}
        <button
          data-testid="btn-end-turn"
          onClick={endTurn}
          style={{
            padding: '12px 30px',
            fontSize: '15px',
            fontWeight: 'bold',
            background: 'linear-gradient(180deg, #aa2020 0%, #881515 50%, #661010 100%)',
            color: 'white',
            border: '2px solid #cc4444',
            borderRadius: '25px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(170, 32, 32, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            animation: (player.energy === 0 || hand.every(c => !canPlayCard(c))) && hand.length > 0
              ? 'endTurnPulse 1.5s ease-in-out infinite'
              : 'none'
          }}
        >
          End Turn
        </button>
      </div>

      {/* Enemy Info Panel */}
      {showEnemyInfo && (
        <EnemyInfoPanel
          enemy={showEnemyInfo}
          onClose={() => setShowEnemyInfo(null)}
        />
      )}

      {/* Deck View Modal */}
      {showDeck && (
        <div
          onClick={() => setShowDeck(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1500,
            animation: 'fadeIn 0.2s ease'
          }}>
          {/* Modal Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '15px 20px',
              paddingTop: '20px',
              background: 'linear-gradient(180deg, #222 0%, #1a1a1a 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #444',
              flexShrink: 0
            }}>
            <h3 style={{
              margin: 0,
              textTransform: 'capitalize',
              color: '#FFD700',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>
                {showDeck === 'draw' ? '\uD83C\uDCCF' : showDeck === 'discard' ? '\u267B\uFE0F' : '\uD83D\uDD25'}
              </span>
              {showDeck} Pile
              <span style={{
                background: '#333',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#aaa'
              }}>
                {(showDeck === 'draw' ? drawPile : showDeck === 'discard' ? discardPile : exhaustPile).length}
              </span>
            </h3>
            <button
              onClick={() => setShowDeck(null)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(180deg, #444 0%, #333 100%)',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                touchAction: 'manipulation'
              }}
            >
              Close
            </button>
          </div>

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignContent: 'flex-start'
            }}>
            {(showDeck === 'draw' ? drawPile : showDeck === 'discard' ? discardPile : exhaustPile).map((card, idx) => (
              <Card key={`${card.instanceId}_${idx}`} card={card} small />
            ))}
            {(showDeck === 'draw' ? drawPile : showDeck === 'discard' ? discardPile : exhaustPile).length === 0 && (
              <div style={{ color: '#666', padding: '40px', textAlign: 'center' }}>
                No cards in this pile
              </div>
            )}
          </div>

          {/* Large Close Button at Bottom */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '15px 20px',
              background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
              borderTop: '2px solid #444',
              flexShrink: 0
            }}>
            <button
              onClick={() => setShowDeck(null)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(180deg, #aa2020 0%, #881515 100%)',
                color: 'white',
                border: '2px solid #cc4444',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Card Selection Modal */}
      {cardSelection && (
        <CardSelectionModal
          cards={
            phase === GAME_PHASE.CARD_SELECT_HAND ? hand :
            phase === GAME_PHASE.CARD_SELECT_DISCARD ? discardPile :
            phase === GAME_PHASE.CARD_SELECT_EXHAUST ? exhaustPile.filter(c => c.id !== 'exhume' && c.id !== 'exhumeUp') :
            []
          }
          title={
            cardSelection.type === 'discardToDrawTop' ? 'Select a card to put on top of deck' :
            cardSelection.type === 'handToDrawTop' ? 'Select a card to put on top of deck' :
            cardSelection.type === 'upgradeInHand' ? 'Select a card to upgrade' :
            cardSelection.type === 'copyCardInHand' ? 'Select an Attack or Power to copy' :
            cardSelection.type === 'retrieveExhausted' ? 'Select a card to return to hand' :
            cardSelection.type === 'exhaustChoose' ? 'Select a card to exhaust' :
            'Select a card'
          }
          subtitle={
            cardSelection.type === 'upgradeInHand' ? 'Upgrade permanently improves the card' :
            cardSelection.type === 'copyCardInHand' ? `Add ${cardSelection.copies || 1} cop${(cardSelection.copies || 1) > 1 ? 'ies' : 'y'} to your hand` :
            null
          }
          onSelect={selectCardFromPile}
          onCancel={cancelCardSelection}
          canSelect={(card) => {
            if (cardSelection.type === 'upgradeInHand') {
              return !card.upgraded && card.upgradedVersion;
            }
            if (cardSelection.type === 'copyCardInHand') {
              return card.type === CARD_TYPES.ATTACK || card.type === CARD_TYPES.POWER;
            }
            return true;
          }}
        />
      )}
    </div>
  );
};

// Pile Button Component
const PileButton = ({ label, count, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 12px',
      fontSize: '11px',
      background: `linear-gradient(180deg, ${color}44 0%, ${color}22 100%)`,
      color: 'white',
      border: `1px solid ${color}88`,
      borderRadius: '15px',
      cursor: 'pointer',
      touchAction: 'manipulation',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: `0 2px 8px ${color}33`
    }}
  >
    <span style={{ fontWeight: 'bold' }}>{label}</span>
    <span style={{
      background: color,
      color: '#000',
      padding: '1px 6px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: 'bold'
    }}>
      {count}
    </span>
  </button>
);

export default CombatScreen;
