import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useGame, GAME_PHASE } from '../context/GameContext';
import Card from './Card';
import Enemy from './Enemy';
import EnemyInfoPanel from './EnemyInfoPanel';
import AnimationOverlay from './AnimationOverlay';
import { useAnimations } from '../hooks/useAnimations';
import { ANIMATION_TYPE } from '../constants/animationTypes';
import CardSelectionModal from './CardSelectionModal';
import { CARD_TYPES } from '../data/cards';
import { getOrbImage, getBackgroundImage, getStanceImage } from '../assets/art/art-config';
import CardTooltip from './CardTooltip';
import TutorialOverlay from './TutorialOverlay';
import BossDialogue from './BossDialogue';
import { getBossDialogue } from '../data/bossDialogue';
import { getPassiveRelicEffects } from '../systems/combatSystem';
import { loadSettings, getAnimationDuration } from '../systems/settingsSystem';

const CombatScreen = ({ showDefeatedEnemies = false }) => {
  const { state, selectCard, playCard, cancelTarget, endTurn, selectCardFromPile, cancelCardSelection } = useGame();
  const { player, enemies, hand, drawPile, discardPile, exhaustPile, selectedCard, targetingMode, turn, phase, cardSelection, character } = state;

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
  const [mobileSelectedCard, setMobileSelectedCard] = useState(null);
  const [inspectCard, setInspectCard] = useState(null);
  const [screenShakeClass, setScreenShakeClass] = useState('');
  const longPressTimer = useRef(null);
  const prevEnemyStatuses = useRef({});
  const prevPlayerStatuses = useRef({});

  // Detect mobile for tap-to-play (matches CSS breakpoint)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  // Boss dialogue state
  const [bossDialogue, setBossDialogue] = useState(null);
  const shownDialogues = useRef(new Set());
  const prevBossPhases = useRef({});

  // Store current enemy data for death animations
  useEffect(() => {
    enemies.forEach(enemy => {
      prevEnemyData.current[enemy.instanceId] = { ...enemy };
    });
  }, [enemies]);

  const { animations, addAnimation, removeAnimation } = useAnimations();

  // Clear mobile selection when hand changes
  useEffect(() => {
    if (mobileSelectedCard && !hand.find(c => c.instanceId === mobileSelectedCard.instanceId)) {
      setMobileSelectedCard(null);
    }
  }, [hand, mobileSelectedCard]);

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

        // Screen shake on heavy enemy hits
        const settings = loadSettings();
        if (settings.screenShake && damage > 15) {
          const duration = getAnimationDuration(settings, 200);
          if (duration > 0) {
            setScreenShakeClass('shake-medium');
            setTimeout(() => setScreenShakeClass(''), duration);
          }
        }

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

      // Screen shake on heavy hits (respects settings)
      const settings = loadSettings();
      if (settings.screenShake && damage > 0) {
        const shakeLevel = damage > 20 ? 'shake-heavy' : damage > 10 ? 'shake-medium' : 'shake-light';
        const duration = getAnimationDuration(settings, damage > 20 ? 300 : 200);
        if (duration > 0) {
          setScreenShakeClass(shakeLevel);
          setTimeout(() => setScreenShakeClass(''), duration);
        }
      }

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

  // Track energy spent/gained - setState is intentional for animation triggers
  useEffect(() => {
    if (player.energy !== prevPlayerEnergy.current) {
      setEnergySpent(true);
      setTimeout(() => setEnergySpent(false), 300);
    }
    prevPlayerEnergy.current = player.energy;
  }, [player.energy]);

  // Track status effect changes on enemies — pop animation
  useEffect(() => {
    enemies.forEach((enemy) => {
      const prev = prevEnemyStatuses.current[enemy.instanceId] || {};
      const statusKeys = ['vulnerable', 'weak', 'strength', 'platedArmor', 'artifact'];
      const statusLabels = { vulnerable: 'Vulnerable', weak: 'Weak', strength: 'Strength', platedArmor: 'Plated', artifact: 'Artifact' };
      const statusColors = { vulnerable: '#ff9944', weak: '#44cc44', strength: '#ff4444', platedArmor: '#8888aa', artifact: '#ffdd44' };

      statusKeys.forEach(key => {
        const prevVal = prev[key] || 0;
        const curVal = enemy[key] || 0;
        if (curVal > prevVal) {
          const enemyEl = enemyRefs.current[enemy.instanceId];
          if (enemyEl && containerRef.current) {
            const rect = enemyEl.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top + rect.height * 0.7;
            addAnimation(ANIMATION_TYPE.STATUS, curVal, x, y, {
              label: `${statusLabels[key]} ${curVal}`,
              color: statusColors[key],
              duration: 600
            });
          }
        }
      });

      prevEnemyStatuses.current[enemy.instanceId] = {
        vulnerable: enemy.vulnerable || 0,
        weak: enemy.weak || 0,
        strength: enemy.strength || 0,
        platedArmor: enemy.platedArmor || 0,
        artifact: enemy.artifact || 0
      };
    });
  }, [enemies, addAnimation]);

  // Track status effect changes on player — pop animation
  const playerVulnerable = player.vulnerable || 0;
  const playerWeak = player.weak || 0;
  const playerStrength = player.strength || 0;
  useEffect(() => {
    const prev = prevPlayerStatuses.current;
    const statuses = [
      { key: 'vulnerable', val: playerVulnerable, label: 'Vulnerable', color: '#ff9944' },
      { key: 'weak', val: playerWeak, label: 'Weak', color: '#44cc44' },
      { key: 'strength', val: playerStrength, label: 'Strength', color: '#ff4444' }
    ];

    statuses.forEach(({ key, val, label, color }) => {
      if (val > (prev[key] || 0) && containerRef.current) {
        addAnimation(ANIMATION_TYPE.STATUS, val, 100, 80, {
          label: `${label} ${val}`,
          color,
          duration: 600
        });
      }
    });

    prevPlayerStatuses.current = {
      vulnerable: playerVulnerable,
      weak: playerWeak,
      strength: playerStrength
    };
  }, [playerVulnerable, playerWeak, playerStrength, addAnimation]);

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

  // Long-press handlers for mobile card inspect
  const handleCardTouchStart = useCallback((card) => {
    if (!isMobile) return;
    longPressTimer.current = setTimeout(() => {
      setInspectCard(card);
      longPressTimer.current = null;
    }, 500);
  }, [isMobile]);

  const handleCardTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleCardTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleCardClick = useCallback((card) => {
    if (inspectCard) return;
    if (targetingMode) {
      cancelTarget();
      setMobileSelectedCard(null);
      return;
    }

    // Mobile: smart targeting — single tap plays non-targeting cards, double-tap for targeted attacks
    if (isMobile) {
      const needsTargeting = card.type === CARD_TYPES.ATTACK && !card.targetAll && enemies.length > 1;

      if (needsTargeting) {
        // Attack card with multiple enemies: tap-to-select, tap-again enters targeting
        if (mobileSelectedCard?.instanceId === card.instanceId) {
          selectCard(card); // enters targeting mode
          setMobileSelectedCard(null);
        } else {
          setMobileSelectedCard(card);
        }
      } else {
        // Non-targeting cards (skills, powers, target-all, single-enemy): play immediately
        setCardPlaying(card.instanceId);
        setTimeout(() => setCardPlaying(null), 300);
        selectCard(card);
        setMobileSelectedCard(null);
      }
      return;
    }

    // Desktop: original behaviour
    if (card.type !== 'attack' || enemies.length === 1) {
      setCardPlaying(card.instanceId);
      setTimeout(() => {
        setCardPlaying(null);
      }, 300);
    }
    selectCard(card);
  }, [inspectCard, targetingMode, cancelTarget, isMobile, mobileSelectedCard, enemies.length, selectCard]);

  const handleEnemyClick = useCallback((enemyInstanceId) => {
    if (targetingMode && selectedCard) {
      // Trigger card play animation
      setCardPlaying(selectedCard.instanceId);
      setTimeout(() => {
        setCardPlaying(null);
      }, 300);
      playCard(selectedCard, enemyInstanceId);
    } else if (!isMobile) {
      // Desktop: show full enemy info panel
      const enemy = enemies.find(e => e.instanceId === enemyInstanceId);
      setShowEnemyInfo(enemy);
    }
    // Mobile: inline info is always visible, no panel needed
  }, [targetingMode, selectedCard, playCard, isMobile, enemies]);

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
    const card = draggingCard;
    const isAttack = card.type === 'attack';

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeY = clientY - containerRect.top;
      const containerHeight = containerRect.height;
      const inEnemyArea = relativeY < containerHeight * 0.6;

      // Non-attack cards (skills, powers) can be played by dropping anywhere
      if (!isAttack) {
        setCardPlaying(card.instanceId);
        setTimeout(() => setCardPlaying(null), 300);
        selectCard(card);
      } else if (inEnemyArea) {
        // Attack cards must be dropped in enemy area
        if (enemies.length > 1) {
          if (dropTargetEnemy !== null) {
            // Play card on specific enemy
            setCardPlaying(card.instanceId);
            setTimeout(() => setCardPlaying(null), 300);
            playCard(card, dropTargetEnemy);
          } else {
            // Enter targeting mode
            selectCard(card);
          }
        } else {
          // Single enemy - auto-target
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

  // Boss dialogue detection and display
  useEffect(() => {
    const boss = enemies.find(e => e.type === 'boss');
    if (!boss) return;

    const bossData = getBossDialogue(boss.id, state.character);
    if (!bossData) return;

    const dialogueKey = `${boss.instanceId}`;

    // Show intro dialogue on first encounter
    if (!shownDialogues.current.has(`${dialogueKey}-intro`)) {
      shownDialogues.current.add(`${dialogueKey}-intro`);
      setBossDialogue({
        boss: { ...bossData, name: boss.name, emoji: boss.emoji },
        trigger: 'intro'
      });
      return;
    }

    // Check for phase transitions
    const prevPhase = prevBossPhases.current[boss.instanceId] || {};

    // Awakened One rebirth detection (reborn flag changes from false/undefined to true)
    if (boss.id === 'awakened_one' && boss.reborn && !prevPhase.reborn) {
      if (!shownDialogues.current.has(`${dialogueKey}-phaseTransition`)) {
        shownDialogues.current.add(`${dialogueKey}-phaseTransition`);
        setBossDialogue({
          boss: { ...bossData, name: boss.name, emoji: boss.emoji },
          trigger: 'phaseTransition'
        });
        prevBossPhases.current[boss.instanceId] = { ...prevPhase, reborn: true };
        return;
      }
    }

    // Corrupt Heart shield break detection (invincible drops to 0)
    if (boss.id === 'corruptHeart' && prevPhase.invincible > 0 && boss.invincible === 0) {
      if (!shownDialogues.current.has(`${dialogueKey}-phaseTransition`)) {
        shownDialogues.current.add(`${dialogueKey}-phaseTransition`);
        setBossDialogue({
          boss: { ...bossData, name: boss.name, emoji: boss.emoji },
          trigger: 'phaseTransition'
        });
        prevBossPhases.current[boss.instanceId] = { ...prevPhase, invincible: 0 };
        return;
      }
    }

    // Guardian defensive mode shift detection (defensiveMode toggle)
    if (boss.id === 'theGuardian' && prevPhase.defensiveMode !== undefined &&
        boss.defensiveMode !== prevPhase.defensiveMode) {
      if (!shownDialogues.current.has(`${dialogueKey}-phaseTransition`)) {
        shownDialogues.current.add(`${dialogueKey}-phaseTransition`);
        setBossDialogue({
          boss: { ...bossData, name: boss.name, emoji: boss.emoji },
          trigger: 'phaseTransition'
        });
        prevBossPhases.current[boss.instanceId] = { ...prevPhase, defensiveMode: boss.defensiveMode };
        return;
      }
    }

    // Mid-fight dialogue at 50% HP
    const hpPercent = boss.currentHp / boss.maxHp;
    if (hpPercent <= 0.5 && !shownDialogues.current.has(`${dialogueKey}-midFight`)) {
      shownDialogues.current.add(`${dialogueKey}-midFight`);
      setBossDialogue({
        boss: { ...bossData, name: boss.name, emoji: boss.emoji },
        trigger: 'midFight'
      });
      return;
    }

    // Update phase tracking
    prevBossPhases.current[boss.instanceId] = {
      reborn: boss.reborn,
      invincible: boss.invincible,
      defensiveMode: boss.defensiveMode
    };
  }, [enemies, state.character]);

  // Boss death dialogue detection
  useEffect(() => {
    const currentEnemyIds = new Set(enemies.map(e => e.instanceId));
    const removedEnemyIds = [...prevEnemyIds.current].filter(id => !currentEnemyIds.has(id));

    removedEnemyIds.forEach(id => {
      const enemyData = prevEnemyData.current[id];
      if (enemyData && enemyData.type === 'boss') {
        const bossData = getBossDialogue(enemyData.id, state.character);
        if (bossData && !shownDialogues.current.has(`${id}-death`)) {
          shownDialogues.current.add(`${id}-death`);
          setBossDialogue({
            boss: { ...bossData, name: enemyData.name, emoji: enemyData.emoji },
            trigger: 'death'
          });
        }
      }
    });
  }, [enemies, state.character]);

  // Act-specific color palettes for subtle background differentiation
  const ACT_THEMES = {
    1: { hueShift: 0, label: 'dungeon' },       // Act 1: cool blue-purple (default)
    2: { hueShift: 0.15, label: 'city' },        // Act 2: warmer, slightly green-teal
    3: { hueShift: 0.35, label: 'beyond' },      // Act 3: warm amber/orange tint
    4: { hueShift: -0.1, label: 'heart' }        // Act 4: deep crimson shift
  };

  // Apply subtle act-based tint to a hex color
  const applyActTint = (hex, act) => {
    const theme = ACT_THEMES[act] || ACT_THEMES[1];
    if (theme.hueShift === 0) return hex;
    // Parse hex and shift red/green channels subtly
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const shift = theme.hueShift;
    const nr = Math.min(255, Math.max(0, Math.round(r + shift * 30)));
    const ng = Math.min(255, Math.max(0, Math.round(g + shift * 15)));
    const nb = Math.min(255, Math.max(0, Math.round(b - shift * 20)));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  // Determine background based on enemy type and current act
  const getBackgroundStyle = () => {
    const hasBoss = enemies.some(e => e.type === 'boss');
    const hasElite = enemies.some(e => e.type === 'elite');
    const enemyId = enemies[0]?.id || '';
    const act = state.act || 1;

    let style;
    if (hasBoss) {
      // Boss fight - dramatic red/purple theme
      style = {
        background: `linear-gradient(180deg, ${applyActTint('#1a0a1a', act)} 0%, ${applyActTint('#2a1020', act)} 30%, ${applyActTint('#1a0515', act)} 60%, ${applyActTint('#0a0510', act)} 100%)`,
        particles: 'radial-gradient(ellipse at 50% 20%, rgba(200, 50, 100, 0.15) 0%, transparent 60%)',
        ambientColor: 'rgba(255, 50, 100, 0.1)',
        groundGlow: '#aa2244'
      };
    } else if (hasElite) {
      // Elite fight - golden theme
      style = {
        background: `linear-gradient(180deg, ${applyActTint('#1a1508', act)} 0%, ${applyActTint('#252015', act)} 30%, ${applyActTint('#1a150a', act)} 60%, ${applyActTint('#0a0a05', act)} 100%)`,
        particles: 'radial-gradient(ellipse at 50% 20%, rgba(255, 200, 50, 0.12) 0%, transparent 60%)',
        ambientColor: 'rgba(255, 200, 50, 0.08)',
        groundGlow: '#aa8822'
      };
    } else if (enemyId.includes('slime')) {
      // Slime fight - green swamp theme
      style = {
        background: `linear-gradient(180deg, ${applyActTint('#0a1510', act)} 0%, ${applyActTint('#152518', act)} 30%, ${applyActTint('#0a1a0f', act)} 60%, ${applyActTint('#050a08', act)} 100%)`,
        particles: 'radial-gradient(ellipse at 50% 80%, rgba(50, 200, 100, 0.1) 0%, transparent 50%)',
        ambientColor: 'rgba(50, 200, 100, 0.08)',
        groundGlow: '#228844'
      };
    } else if (enemyId.includes('cultist') || enemyId.includes('chosen')) {
      // Cult fight - purple mystical theme
      style = {
        background: `linear-gradient(180deg, ${applyActTint('#10081a', act)} 0%, ${applyActTint('#1a1025', act)} 30%, ${applyActTint('#150a20', act)} 60%, ${applyActTint('#080510', act)} 100%)`,
        particles: 'radial-gradient(ellipse at 50% 30%, rgba(150, 50, 200, 0.12) 0%, transparent 55%)',
        ambientColor: 'rgba(150, 50, 200, 0.1)',
        groundGlow: '#6622aa'
      };
    } else {
      // Default dungeon theme with act tint
      style = {
        background: `linear-gradient(180deg, ${applyActTint('#0a0a1a', act)} 0%, ${applyActTint('#1a1a2e', act)} 30%, ${applyActTint('#12121f', act)} 60%, ${applyActTint('#0a0a12', act)} 100%)`,
        particles: 'radial-gradient(ellipse at 50% 0%, rgba(100, 100, 200, 0.1) 0%, transparent 50%)',
        ambientColor: 'rgba(100, 150, 200, 0.05)',
        groundGlow: applyActTint('#334466', act)
      };
    }
    return style;
  };

  const bgStyle = getBackgroundStyle();

  const passiveEffects = useMemo(() => getPassiveRelicEffects(state.relics, {}), [state.relics]);
  const hideIntents = passiveEffects.hideIntents;

  return (
    <div
      ref={containerRef}
      className={`combat-screen-container ${screenShakeClass}`}
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

      {/* Tutorial hints for first-time players */}
      <TutorialOverlay isMobile={isMobile} />

      {/* Boss dialogue overlay */}
      {bossDialogue && (
        <BossDialogue
          boss={bossDialogue.boss}
          trigger={bossDialogue.trigger}
          onDismiss={() => setBossDialogue(null)}
        />
      )}

      {/* Act-specific background illustration */}
      {(() => {
        const actBg = getBackgroundImage(`act${state.act || 1}`);
        return actBg ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${actBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            pointerEvents: 'none'
          }} />
        ) : null;
      })()}

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
            className={isMobile ? 'mobile-enemy-wrapper' : ''}
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

      {/* Orb Slots (Defect) */}
      {player.orbSlots > 0 && (
        <div
          data-testid="orb-slots"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 15px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderTop: '1px solid rgba(68, 136, 204, 0.3)'
          }}
        >
          {player.focus !== 0 && (
            <span style={{
              color: player.focus > 0 ? '#88ccff' : '#ff8888',
              fontSize: '11px',
              fontWeight: 'bold',
              marginRight: '4px'
            }}>
              Focus: {player.focus > 0 ? '+' : ''}{player.focus}
            </span>
          )}
          {Array.from({ length: player.orbSlots }).map((_, i) => {
            const orb = (player.orbs || [])[i];
            const orbColors = {
              lightning: { bg: '#ffdd44', border: '#ccaa00', glow: 'rgba(255, 221, 68, 0.5)', icon: '⚡' },
              frost: { bg: '#66bbff', border: '#3388cc', glow: 'rgba(102, 187, 255, 0.5)', icon: '❄️' },
              dark: { bg: '#9944cc', border: '#6622aa', glow: 'rgba(153, 68, 204, 0.5)', icon: '🌑' },
              plasma: { bg: '#ff6644', border: '#cc3322', glow: 'rgba(255, 102, 68, 0.5)', icon: '🔥' }
            };
            const colors = orb ? orbColors[orb.type] || orbColors.lightning : null;
            return (
              <div
                key={i}
                data-testid={orb ? `orb-${orb.type}-${i}` : `orb-empty-${i}`}
                title={orb ? `${orb.type.charAt(0).toUpperCase() + orb.type.slice(1)} Orb` : 'Empty orb slot'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  border: orb ? `2px solid ${colors.border}` : '2px dashed #555',
                  background: orb
                    ? `radial-gradient(circle at 30% 30%, ${colors.bg}, ${colors.border})`
                    : 'rgba(30, 30, 40, 0.5)',
                  boxShadow: orb ? `0 0 10px ${colors.glow}` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {orb ? (() => {
                  const orbImg = getOrbImage(orb.type);
                  return orbImg
                    ? <img src={orbImg} alt={orb.type} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                    : colors.icon;
                })() : ''}
              </div>
            );
          })}
        </div>
      )}

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
          role="group"
          aria-label={`Hand: ${hand.length} cards`}
          className={isMobile ? 'mobile-card-fan' : ''}
          style={{
          padding: '12px 10px',
          paddingBottom: '5px',
          overflowX: isMobile ? 'visible' : 'auto',
          overflowY: 'hidden',
          display: 'flex',
          gap: isMobile ? '0' : '8px',
          justifyContent: isMobile ? 'center' : (hand.length > 4 ? 'flex-start' : 'center'),
          minHeight: '155px',
          alignItems: 'flex-end',
          WebkitOverflowScrolling: 'touch'
        }}>
        {hand.map((card, index) => {
          const isPlaying = cardPlaying === card.instanceId;
          const isNewlyDrawn = newlyDrawnCards.has(card.instanceId);
          const isSelected = selectedCard?.instanceId === card.instanceId;
          const isMobileSelected = mobileSelectedCard?.instanceId === card.instanceId;
          const isBeingDragged = draggingCard?.instanceId === card.instanceId;

          // Fan/arc calculation for mobile
          const cardCount = hand.length;
          const midIndex = (cardCount - 1) / 2;
          const offset = index - midIndex;
          const maxRotation = Math.min(cardCount * 3, 25);
          const rotation = cardCount > 1 ? (offset / midIndex) * maxRotation : 0;
          const arcY = cardCount > 1 ? Math.abs(offset) * Math.abs(offset) * 4 : 0;

          const mobileTransform = isMobile
            ? `rotate(${rotation}deg) translateY(${isMobileSelected ? -(20 + arcY) : arcY}px)${isMobileSelected ? ' scale(1.15)' : ''}`
            : `translateY(${isSelected ? '-10px' : '0'})`;

          return (
            <div
              key={card.instanceId}
              className={`${isMobile ? 'mobile-card-slot' : ''}${isMobileSelected ? ' mobile-card-selected' : ''}`}
              onMouseDown={(e) => !isMobile && handleDragStart(card, e)}
              onTouchStart={(e) => {
                if (isMobile) {
                  handleCardTouchStart(card);
                } else {
                  handleDragStart(card, e);
                }
              }}
              onTouchEnd={handleCardTouchEnd}
              onTouchMove={handleCardTouchMove}
              style={{
                transform: mobileTransform,
                transition: isPlaying ? 'none' : 'transform 0.2s ease',
                animation: isPlaying
                  ? 'cardFlyToEnemy 0.3s ease-out forwards'
                  : isNewlyDrawn
                    ? `cardDraw 0.4s ease-out ${index * 0.05}s both`
                    : 'none',
                opacity: isBeingDragged ? 0.4 : 1,
                cursor: canPlayCard(card)
                  ? (isMobile
                    ? 'pointer'
                    : (card.type === CARD_TYPES.ATTACK && !card.targetAll && enemies.length > 1 ? 'grab' : 'pointer'))
                  : 'not-allowed',
                touchAction: isMobile ? 'manipulation' : 'pan-x',
                flexShrink: 0,
                zIndex: isMobileSelected ? 20 : (isMobile ? cardCount - Math.abs(Math.round(offset)) : 'auto'),
                transformOrigin: 'bottom center'
              }}
            >
              <CardTooltip card={card} player={player} targetEnemy={card.type === CARD_TYPES.ATTACK && enemies.length === 1 ? enemies[0] : null}>
                <Card
                  card={card}
                  onClick={() => !isDragging && handleCardClick(card)}
                  selected={isSelected || isMobileSelected}
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

        {/* Mobile tap hint */}
        {isMobile && mobileSelectedCard && (
          <div className="mobile-tap-hint">
            Tap again to target with {mobileSelectedCard.name}
          </div>
        )}

        {/* Visual scroll track for large hands (desktop only) */}
        {!isMobile && hand.length > 4 && (
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
        <div
          role="status"
          aria-label={`Energy: ${player.energy} of ${player.maxEnergy}`}
          style={{
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

        {/* Stance Indicator (Watcher only) */}
        {character === 'watcher' && <StanceIndicator stance={player.currentStance} mantra={player.mantra} />}

        {/* End Turn Button */}
        <button
          data-testid="btn-end-turn"
          aria-label="End Turn"
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

      {/* Card Inspect Modal (mobile long-press) */}
      {inspectCard && (
        <div
          className="card-inspect-overlay"
          role="dialog"
          aria-label={`Inspecting card: ${inspectCard.name}`}
          onClick={() => setInspectCard(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setInspectCard(null); }}
        >
          <div className="card-inspect-panel" onClick={(e) => e.stopPropagation()}>
            <div className="card-inspect-header">
              <span className="card-inspect-cost">{inspectCard.cost}</span>
              <span className="card-inspect-name">{inspectCard.name}</span>
              <span className={`card-inspect-type card-inspect-type--${inspectCard.type}`}>
                {inspectCard.type}
              </span>
            </div>
            <div className="card-inspect-body">
              <p className="card-inspect-description">{inspectCard.description}</p>
              {inspectCard.upgraded && (
                <span className="card-inspect-upgraded">Upgraded</span>
              )}
            </div>
            <button
              className="card-inspect-close"
              onClick={() => setInspectCard(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
            phase === GAME_PHASE.CARD_SELECT_DRAW ? drawPile.slice(0, cardSelection.scryCount || 3) :
            []
          }
          title={
            cardSelection.type === 'discardToDrawTop' ? 'Select a card to put on top of deck' :
            cardSelection.type === 'handToDrawTop' ? 'Select a card to put on top of deck' :
            cardSelection.type === 'upgradeInHand' ? 'Select a card to upgrade' :
            cardSelection.type === 'copyCardInHand' ? 'Select an Attack or Power to copy' :
            cardSelection.type === 'retrieveExhausted' ? 'Select a card to return to hand' :
            cardSelection.type === 'exhaustChoose' ? 'Select a card to exhaust' :
            cardSelection.type === 'scryCards' ? 'Scry — select cards to discard' :
            'Select a card'
          }
          subtitle={
            cardSelection.type === 'upgradeInHand' ? 'Upgrade permanently improves the card' :
            cardSelection.type === 'copyCardInHand' ? `Add ${cardSelection.copies || 1} cop${(cardSelection.copies || 1) > 1 ? 'ies' : 'y'} to your hand` :
            cardSelection.type === 'scryCards' ? 'Click cards to discard them, or Done to keep the rest' :
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

// Stance Indicator Component (Watcher)
const STANCE_CONFIG = {
  calm: { label: 'Calm', icon: '🧘', color: '#44aacc', glowColor: 'rgba(68, 170, 204, 0.5)', desc: '+2 Energy on exit' },
  wrath: { label: 'Wrath', icon: '⚔️', color: '#cc4444', glowColor: 'rgba(204, 68, 68, 0.6)', desc: '2× damage dealt & taken' },
  divinity: { label: 'Divinity', icon: '✨', color: '#ffcc00', glowColor: 'rgba(255, 204, 0, 0.7)', desc: '3× damage, +3 Energy' }
};

const StanceIndicator = memo(function StanceIndicator({ stance, mantra }) {
  const config = stance ? STANCE_CONFIG[stance] : null;
  const hasMantra = mantra > 0;

  if (!config && !hasMantra) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      {/* Current stance badge */}
      {config && (
        <div
          role="status"
          aria-label={`Stance: ${config.label} — ${config.desc}`}
          title={`${config.label}: ${config.desc}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            background: `${config.color}22`,
            borderRadius: '12px',
            border: `2px solid ${config.color}88`,
            boxShadow: `0 0 12px ${config.glowColor}, inset 0 0 8px ${config.color}11`,
            animation: stance === 'wrath' ? 'wrathPulse 1.2s ease-in-out infinite' : stance === 'divinity' ? 'divinityGlow 0.8s ease-in-out infinite' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {getStanceImage(stance) ? (
            <img src={getStanceImage(stance)} alt={config.label} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '16px' }}>{config.icon}</span>
          )}
          <span style={{
            color: config.color,
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textShadow: `0 0 6px ${config.glowColor}`
          }}>
            {config.label}
          </span>
        </div>
      )}

      {/* Mantra progress */}
      {hasMantra && (
        <div
          role="status"
          aria-label={`Mantra: ${mantra} of 10`}
          title={`Mantra: ${mantra}/10 — Divinity at 10`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            background: 'rgba(180, 130, 255, 0.12)',
            borderRadius: '8px',
            border: '1px solid rgba(180, 130, 255, 0.3)'
          }}
        >
          <span style={{ fontSize: '10px' }}>🔮</span>
          <div style={{
            width: '40px',
            height: '6px',
            background: '#1a1a2a',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(mantra / 10, 1) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #9966cc, #cc88ff)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
              boxShadow: mantra >= 7 ? '0 0 6px rgba(204, 136, 255, 0.6)' : 'none'
            }} />
          </div>
          <span style={{
            color: '#bb88ee',
            fontSize: '9px',
            fontWeight: 'bold'
          }}>
            {mantra}/10
          </span>
        </div>
      )}
    </div>
  );
});

// Pile Button Component
const PileButton = memo(function PileButton({ label, count, onClick, color }) { return (
  <button
    aria-label={`${label} pile: ${count} cards`}
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
); });

export default CombatScreen;
