import { useEffect, useRef } from 'react';
import { useGame, GAME_PHASE } from '../context/GameContext';
import { SCENARIOS, getScenarioNames } from '../data/scenarios';
import { getCardById } from '../data/cards';
import { getRelicById } from '../data/relics';
import { getPotionById } from '../data/potions';

/**
 * DevTools - Exposes console API for testing and automation
 *
 * In development mode, provides window.__SPIRE__ with:
 * - loadScenario(name) - Load a preset scenario by name
 * - listScenarios() - List all available scenario names
 * - getState() - Get current game state
 * - setState(partialState) - Directly set state (advanced)
 *
 * Enhanced API (QR-02):
 * - playCard(handIndex, targetIndex?) - Play card by hand index
 * - endTurn() - End current turn
 * - getVisibleState() - Machine-readable state snapshot
 * - autoPlayTurn() - Play all affordable cards, then end turn
 * - autoFight() - Auto-play until combat ends
 * - skipToPhase(phase) - Jump to any game phase
 * - giveCard(cardId) - Add card to deck
 * - giveRelic(relicId) - Add relic
 * - givePotion(potionId) - Add potion
 * - giveGold(amount) - Add gold
 * - setHp(current, max?) - Set player HP
 * - fullPlaythrough(options?) - Automated full run
 */
const DevTools = () => {
  const gameContext = useGame();
  const { state, loadScenario } = gameContext;

  // Use ref to avoid stale closure issues
  const stateRef = useRef(state);
  const gameContextRef = useRef(gameContext);

  useEffect(() => {
    stateRef.current = state;
    gameContextRef.current = gameContext;
  }, [state, gameContext]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      /**
       * Check if a card can be played given current energy and restrictions
       */
      const canPlayCard = (card, currentState) => {
        if (!card) return false;
        const energy = currentState.player?.energy ?? 0;
        const cost = card.cost ?? 0;
        if (cost > energy && cost !== -1) return false; // X-cost cards (cost -1) are always playable
        if (card.type === 'status' || card.type === 'curse') return false;
        if (currentState.player?.entangle && card.type === 'attack') return false;
        return true;
      };

      /**
       * Check if card requires targeting (attacks with multiple enemies)
       */
      const requiresTargeting = (card, currentState) => {
        if (card.target === 'all' || card.targetAll) return false;
        if (card.type === 'attack' && currentState.enemies.length > 1) return true;
        return false;
      };

      /**
       * Get a human-readable summary of enemy intent
       */
      const formatIntent = (enemy) => {
        if (!enemy.intent) return 'unknown';
        const { type, damage, times, block, effect, value } = enemy.intent;
        if (type === 'attack') {
          return times > 1 ? `attack ${damage}x${times}` : `attack ${damage}`;
        }
        if (type === 'attackDefend') {
          return `attack ${damage} + block ${block}`;
        }
        if (type === 'defend') {
          return `block ${block || value || '?'}`;
        }
        if (type === 'buff') {
          return `buff ${effect || ''}`;
        }
        if (type === 'debuff') {
          return `debuff ${effect || ''}`;
        }
        return type;
      };

      window.__SPIRE__ = {
        // ============================================
        // ORIGINAL API
        // ============================================

        // Load a preset scenario by name
        loadScenario: (name) => {
          const scenario = SCENARIOS[name];
          if (!scenario) {
            console.error(`Scenario "${name}" not found. Use __SPIRE__.listScenarios() to see available scenarios.`);
            return false;
          }
          console.log(`Loading scenario: ${name} - ${scenario.name}`);
          loadScenario(scenario);
          return true;
        },

        // List all available scenario names
        listScenarios: () => {
          const names = getScenarioNames();
          console.log('Available scenarios:');
          names.forEach(name => {
            const scenario = SCENARIOS[name];
            console.log(`  - ${name}: ${scenario.name} (${scenario.description})`);
          });
          return names;
        },

        // Get current game state (read-only snapshot)
        getState: () => {
          const s = stateRef.current;
          console.log('Current game state:', s);
          return { ...s };
        },

        // Direct state load (for custom scenarios)
        setState: (scenario) => {
          console.log('Loading custom scenario...');
          loadScenario(scenario);
          return true;
        },

        // Quick reference for scenario names
        scenarios: getScenarioNames(),

        // ============================================
        // ENHANCED API - Combat Actions (QR-02)
        // ============================================

        /**
         * Play a card from hand by index
         * @param {number} handIndex - 0-indexed position in hand
         * @param {number} [targetIndex] - Optional enemy index for targeting cards
         * @returns {boolean} - True if card was played successfully
         */
        playCard: (handIndex, targetIndex) => {
          const s = stateRef.current;
          const ctx = gameContextRef.current;

          if (s.phase !== GAME_PHASE.COMBAT) {
            console.error('playCard: Not in combat phase');
            return false;
          }

          const card = s.hand[handIndex];
          if (!card) {
            console.error(`playCard: No card at hand index ${handIndex}`);
            return false;
          }

          if (!canPlayCard(card, s)) {
            console.error(`playCard: Cannot play "${card.name}" (cost: ${card.cost}, energy: ${s.player.energy})`);
            return false;
          }

          // Determine target
          let targetId = null;
          if (requiresTargeting(card, s)) {
            const targetEnemy = s.enemies[targetIndex ?? 0];
            if (!targetEnemy) {
              console.error(`playCard: Invalid target index ${targetIndex}`);
              return false;
            }
            targetId = targetEnemy.instanceId;
          } else if (card.type === 'attack' && s.enemies.length === 1) {
            targetId = s.enemies[0].instanceId;
          }

          console.log(`Playing card: ${card.name}${targetId ? ` -> enemy ${targetIndex ?? 0}` : ''}`);
          ctx.playCard(card, targetId);
          return true;
        },

        /**
         * End the current turn
         * @returns {boolean} - True if turn was ended
         */
        endTurn: () => {
          const s = stateRef.current;
          const ctx = gameContextRef.current;

          if (s.phase !== GAME_PHASE.COMBAT) {
            console.error('endTurn: Not in combat phase');
            return false;
          }

          console.log('Ending turn...');
          ctx.endTurn();
          return true;
        },

        /**
         * Get a machine-readable snapshot of the visible game state
         * @returns {Object} - Parseable state object
         */
        getVisibleState: () => {
          const s = stateRef.current;

          // Extract status effects that are non-zero
          const getActiveEffects = (entity) => {
            const effects = {};
            const statusKeys = ['strength', 'dexterity', 'vulnerable', 'weak', 'frail',
              'artifact', 'intangible', 'thorns', 'metallicize', 'platedArmor', 'regen',
              'poison', 'hex', 'confused', 'flight', 'barricade', 'berserk', 'brutality',
              'corruption', 'darkEmbrace', 'demonForm', 'doubleTap', 'evolve', 'feelNoPain',
              'fireBreathing', 'juggernaut', 'rage', 'rupture', 'flameBarrier'];
            statusKeys.forEach(key => {
              if (entity[key]) effects[key] = entity[key];
            });
            return effects;
          };

          const result = {
            phase: s.phase,
            floor: s.currentFloor,
            act: s.act,
            turn: s.turn,
            character: s.character,
            player: {
              hp: s.player.currentHp,
              maxHp: s.player.maxHp,
              energy: s.player.energy,
              maxEnergy: s.player.maxEnergy,
              gold: s.player.gold,
              block: s.player.block,
              stance: s.player.currentStance,
              mantra: s.player.mantra,
              focus: s.player.focus,
              orbs: s.player.orbs?.map(o => ({ type: o.type, amount: o.amount })) || [],
              statusEffects: getActiveEffects(s.player)
            },
            hand: s.hand.map(card => ({
              name: card.name,
              id: card.id,
              instanceId: card.instanceId,
              cost: card.cost,
              type: card.type,
              playable: canPlayCard(card, s),
              damage: card.damage,
              block: card.block,
              description: card.description
            })),
            enemies: s.enemies
              .filter(e => e.currentHp > 0)
              .map((e, i) => ({
                index: i,
                name: e.name,
                id: e.id,
                instanceId: e.instanceId,
                hp: e.currentHp,
                maxHp: e.maxHp,
                block: e.block || 0,
                intent: formatIntent(e),
                intentRaw: e.intent,
                statusEffects: getActiveEffects(e)
              })),
            drawPile: s.drawPile.length,
            discardPile: s.discardPile.length,
            exhaustPile: s.exhaustPile.length,
            relics: s.relics.map(r => ({ name: r.name, id: r.id })),
            potions: s.potions.map(p => p ? { name: p.name, id: p.id } : null)
          };

          console.log('Visible state:', result);
          return result;
        },

        // ============================================
        // ENHANCED API - Automation (QR-02)
        // ============================================

        /**
         * Automatically play all affordable cards, then end turn
         * Uses a simple priority: attacks on lowest HP enemy, then skills/powers
         * @returns {Object} - { cardsPlayed: number, turnEnded: boolean }
         */
        autoPlayTurn: () => {
          const s = stateRef.current;
          const ctx = gameContextRef.current;

          if (s.phase !== GAME_PHASE.COMBAT) {
            console.error('autoPlayTurn: Not in combat phase');
            return { cardsPlayed: 0, turnEnded: false };
          }

          let cardsPlayed = 0;
          let iterations = 0;
          const maxIterations = 50; // Prevent infinite loops

          // Keep playing cards until we can't
          while (iterations < maxIterations) {
            iterations++;
            const currentState = stateRef.current;

            // All enemies dead?
            const aliveEnemies = currentState.enemies.filter(e => e.currentHp > 0);
            if (aliveEnemies.length === 0) break;

            // Combat ended?
            if (currentState.phase !== GAME_PHASE.COMBAT) break;

            // Find playable cards
            const playableCards = currentState.hand
              .map((card, index) => ({ card, index }))
              .filter(({ card }) => canPlayCard(card, currentState));

            if (playableCards.length === 0) break;

            // Prioritize: attacks first (on lowest HP enemy), then defend/skills, then powers
            playableCards.sort((a, b) => {
              if (a.card.type === 'attack' && b.card.type !== 'attack') return -1;
              if (a.card.type !== 'attack' && b.card.type === 'attack') return 1;
              if (a.card.type === 'skill' && b.card.type === 'power') return -1;
              if (a.card.type === 'power' && b.card.type === 'skill') return 1;
              return 0;
            });

            const { card } = playableCards[0];

            // Find target (lowest HP enemy for attacks)
            let targetIndex = 0;
            if (card.type === 'attack' && card.target !== 'all') {
              let lowestHp = Infinity;
              aliveEnemies.forEach((e, i) => {
                if (e.currentHp < lowestHp) {
                  lowestHp = e.currentHp;
                  targetIndex = i;
                }
              });
            }

            // Determine target ID
            let targetId = null;
            if (requiresTargeting(card, currentState)) {
              targetId = aliveEnemies[targetIndex]?.instanceId;
            } else if (card.type === 'attack' && aliveEnemies.length === 1) {
              targetId = aliveEnemies[0].instanceId;
            }

            ctx.playCard(card, targetId);
            cardsPlayed++;

            // Small delay to let state update
            // In test environment, state should update synchronously
          }

          // End turn
          const finalState = stateRef.current;
          if (finalState.phase === GAME_PHASE.COMBAT) {
            ctx.endTurn();
          }

          console.log(`autoPlayTurn: Played ${cardsPlayed} cards, ended turn`);
          return { cardsPlayed, turnEnded: true };
        },

        /**
         * Automatically fight until combat ends
         * @param {Object} [options] - { maxTurns?: number }
         * @returns {Object} - { result: 'win'|'loss'|'timeout', turnsPlayed: number, cardsPlayed: number }
         */
        autoFight: (options = {}) => {
          const { maxTurns = 100 } = options;

          let turnsPlayed = 0;
          let totalCardsPlayed = 0;

          const checkState = () => stateRef.current;

          while (turnsPlayed < maxTurns) {
            const currentState = checkState();

            // Combat over?
            if (currentState.phase === GAME_PHASE.COMBAT_REWARD ||
                currentState.phase === GAME_PHASE.CARD_REWARD) {
              console.log(`autoFight: Victory after ${turnsPlayed} turns, ${totalCardsPlayed} cards`);
              return { result: 'win', turnsPlayed, cardsPlayed: totalCardsPlayed };
            }

            if (currentState.phase === GAME_PHASE.GAME_OVER) {
              console.log(`autoFight: Defeat after ${turnsPlayed} turns, ${totalCardsPlayed} cards`);
              return { result: 'loss', turnsPlayed, cardsPlayed: totalCardsPlayed };
            }

            // Not in combat?
            if (currentState.phase !== GAME_PHASE.COMBAT) {
              console.log(`autoFight: Phase changed to ${currentState.phase}`);
              return { result: 'phaseChanged', turnsPlayed, cardsPlayed: totalCardsPlayed };
            }

            // Play a turn
            const turnResult = window.__SPIRE__.autoPlayTurn();
            turnsPlayed++;
            totalCardsPlayed += turnResult.cardsPlayed;
          }

          console.log(`autoFight: Timeout after ${maxTurns} turns`);
          return { result: 'timeout', turnsPlayed, cardsPlayed: totalCardsPlayed };
        },

        /**
         * Attempt a full automated playthrough
         * @param {Object} [options] - { character?: string, maxFloors?: number, ascension?: number }
         * @returns {Object} - { result: 'win'|'loss'|'timeout', floorsCleared: number, finalState: Object }
         */
        fullPlaythrough: async (options = {}) => {
          const { character = 'ironclad', maxFloors = 100, ascension = 0 } = options;
          const ctx = gameContextRef.current;
          const checkState = () => stateRef.current;

          let floorsCleared = 0;
          let iterations = 0;
          const maxIterations = 1000;

          console.log(`fullPlaythrough: Starting ${character} run at A${ascension}`);

          // Start game if at menu
          let currentState = checkState();
          if (currentState.phase === GAME_PHASE.MAIN_MENU) {
            ctx.startGame(ascension);
            // Wait for state update
            await new Promise(r => setTimeout(r, 50));
          }

          // Select character if needed
          currentState = checkState();
          if (currentState.phase === GAME_PHASE.CHARACTER_SELECT) {
            ctx.selectCharacter(character);
            await new Promise(r => setTimeout(r, 50));
          }

          // Select starting bonus if needed
          currentState = checkState();
          if (currentState.phase === GAME_PHASE.STARTING_BONUS) {
            ctx.selectStartingBonus('skip');
            await new Promise(r => setTimeout(r, 50));
          }

          // Main game loop
          while (iterations < maxIterations && floorsCleared < maxFloors) {
            iterations++;
            currentState = checkState();
            const phase = currentState.phase;

            switch (phase) {
              case GAME_PHASE.MAP: {
                // Select first available node
                if (currentState.map && currentState.map.length > 0) {
                  const nextFloorNodes = currentState.map[currentState.currentFloor] || [];
                  const nodeToSelect = nextFloorNodes.find(n => n.accessible) || nextFloorNodes[0];
                  if (nodeToSelect) {
                    ctx.selectNode(nodeToSelect.id);
                    floorsCleared = currentState.currentFloor;
                    await new Promise(r => setTimeout(r, 50));
                  } else {
                    console.log('fullPlaythrough: No accessible node');
                    return { result: 'stuck', floorsCleared, finalState: currentState };
                  }
                }
                break;
              }

              case GAME_PHASE.COMBAT: {
                const fightResult = window.__SPIRE__.autoFight();
                if (fightResult.result === 'loss') {
                  return { result: 'loss', floorsCleared, finalState: checkState() };
                }
                await new Promise(r => setTimeout(r, 50));
                break;
              }

              case GAME_PHASE.COMBAT_REWARD:
              case GAME_PHASE.CARD_REWARD: {
                // Collect gold, skip card rewards
                ctx.collectGold();
                await new Promise(r => setTimeout(r, 20));
                currentState = checkState();
                if (currentState.phase === GAME_PHASE.CARD_REWARD) {
                  ctx.skipCardReward();
                  await new Promise(r => setTimeout(r, 20));
                }
                ctx.proceedToMap();
                await new Promise(r => setTimeout(r, 50));
                break;
              }

              case GAME_PHASE.REST_SITE: {
                ctx.rest(); // Always rest for HP
                await new Promise(r => setTimeout(r, 50));
                ctx.proceedToMap();
                await new Promise(r => setTimeout(r, 50));
                break;
              }

              case GAME_PHASE.SHOP: {
                ctx.leaveShop(currentState.player.gold, currentState.deck, currentState.relics, currentState.potions);
                await new Promise(r => setTimeout(r, 50));
                break;
              }

              case GAME_PHASE.EVENT: {
                ctx.skipEvent();
                await new Promise(r => setTimeout(r, 50));
                break;
              }

              case GAME_PHASE.VICTORY: {
                console.log(`fullPlaythrough: Victory! Cleared ${floorsCleared} floors`);
                return { result: 'win', floorsCleared, finalState: checkState() };
              }

              case GAME_PHASE.GAME_OVER: {
                console.log(`fullPlaythrough: Defeat at floor ${currentState.currentFloor}`);
                return { result: 'loss', floorsCleared, finalState: checkState() };
              }

              case GAME_PHASE.ENDLESS_TRANSITION: {
                // For now, claim victory instead of continuing
                console.log(`fullPlaythrough: Reached endless transition at floor ${currentState.currentFloor}`);
                return { result: 'win', floorsCleared, finalState: checkState() };
              }

              default: {
                console.log(`fullPlaythrough: Unhandled phase ${phase}`);
                await new Promise(r => setTimeout(r, 100));
              }
            }
          }

          console.log(`fullPlaythrough: Timeout after ${iterations} iterations`);
          return { result: 'timeout', floorsCleared, finalState: checkState() };
        },

        // ============================================
        // ENHANCED API - State Manipulation (QR-02)
        // ============================================

        /**
         * Add a card to the deck
         * @param {string} cardId - Card ID to add
         * @returns {boolean} - True if card was added
         */
        giveCard: (cardId) => {
          const card = getCardById(cardId);
          if (!card) {
            console.error(`giveCard: Unknown card ID "${cardId}"`);
            return false;
          }

          const s = stateRef.current;
          const newCard = { ...card, instanceId: `${cardId}_dev_${Date.now()}` };

          // Add to deck and hand if in combat
          loadScenario({
            ...s,
            deck: [...s.deck, newCard],
            hand: s.phase === GAME_PHASE.COMBAT ? [...s.hand, newCard] : s.hand
          });

          console.log(`Added card: ${card.name}`);
          return true;
        },

        /**
         * Add a relic
         * @param {string} relicId - Relic ID to add
         * @returns {boolean} - True if relic was added
         */
        giveRelic: (relicId) => {
          const relic = getRelicById(relicId);
          if (!relic) {
            console.error(`giveRelic: Unknown relic ID "${relicId}"`);
            return false;
          }

          const s = stateRef.current;
          const newRelic = { ...relic, instanceId: `${relicId}_dev_${Date.now()}` };

          loadScenario({
            ...s,
            relics: [...s.relics, newRelic]
          });

          console.log(`Added relic: ${relic.name}`);
          return true;
        },

        /**
         * Add a potion to the first empty slot
         * @param {string} potionId - Potion ID to add
         * @returns {boolean} - True if potion was added
         */
        givePotion: (potionId) => {
          const potion = getPotionById(potionId);
          if (!potion) {
            console.error(`givePotion: Unknown potion ID "${potionId}"`);
            return false;
          }

          const s = stateRef.current;
          const emptySlot = s.potions.findIndex(p => p === null);
          if (emptySlot === -1) {
            console.error('givePotion: No empty potion slots');
            return false;
          }

          const newPotions = [...s.potions];
          newPotions[emptySlot] = { ...potion, instanceId: `${potionId}_dev_${Date.now()}` };

          loadScenario({
            ...s,
            potions: newPotions
          });

          console.log(`Added potion: ${potion.name} to slot ${emptySlot}`);
          return true;
        },

        /**
         * Add gold
         * @param {number} amount - Amount of gold to add
         * @returns {boolean}
         */
        giveGold: (amount) => {
          const s = stateRef.current;
          const newGold = Math.max(0, (s.player.gold || 0) + amount);

          loadScenario({
            ...s,
            player: { ...s.player, gold: newGold }
          });

          console.log(`Gold: ${s.player.gold} -> ${newGold}`);
          return true;
        },

        /**
         * Set player HP
         * @param {number} current - Current HP
         * @param {number} [max] - Max HP (optional)
         * @returns {boolean}
         */
        setHp: (current, max) => {
          const s = stateRef.current;
          const newMax = max ?? s.player.maxHp;
          const newCurrent = Math.min(current, newMax);

          loadScenario({
            ...s,
            player: {
              ...s.player,
              currentHp: newCurrent,
              maxHp: newMax
            }
          });

          console.log(`HP: ${s.player.currentHp}/${s.player.maxHp} -> ${newCurrent}/${newMax}`);
          return true;
        },

        /**
         * Set player energy
         * @param {number} amount - Energy amount
         * @returns {boolean}
         */
        setEnergy: (amount) => {
          const s = stateRef.current;

          loadScenario({
            ...s,
            player: { ...s.player, energy: amount }
          });

          console.log(`Energy: ${s.player.energy} -> ${amount}`);
          return true;
        },

        /**
         * Skip to a specific floor
         * @param {number} floor - Target floor number
         * @returns {boolean}
         */
        setFloor: (floor) => {
          const s = stateRef.current;

          loadScenario({
            ...s,
            currentFloor: floor
          });

          console.log(`Floor: ${s.currentFloor} -> ${floor}`);
          return true;
        },

        /**
         * Jump to a specific game phase
         * @param {string} phase - Target phase (from GAME_PHASE)
         * @returns {boolean}
         */
        skipToPhase: (phase) => {
          const validPhases = Object.values(GAME_PHASE);
          if (!validPhases.includes(phase)) {
            console.error(`skipToPhase: Invalid phase "${phase}". Valid: ${validPhases.join(', ')}`);
            return false;
          }

          const s = stateRef.current;

          loadScenario({
            ...s,
            phase
          });

          console.log(`Phase: ${s.phase} -> ${phase}`);
          return true;
        },

        // ============================================
        // HELPER EXPORTS
        // ============================================

        /** Available game phases */
        PHASES: GAME_PHASE,

        /** Check if currently in combat */
        inCombat: () => stateRef.current.phase === GAME_PHASE.COMBAT,

        /** Get hand size */
        handSize: () => stateRef.current.hand.length,

        /** Get number of living enemies */
        enemyCount: () => stateRef.current.enemies.filter(e => e.currentHp > 0).length,

        /** Get player HP as fraction */
        hpPercent: () => {
          const s = stateRef.current;
          return s.player.currentHp / s.player.maxHp;
        }
      };

      console.log('%c🎮 Spire Dev Tools Loaded (Enhanced API)', 'color: #ffd700; font-weight: bold; font-size: 14px;');
      console.log('%cUse window.__SPIRE__ to access testing tools:', 'color: #888;');
      console.log('%c  __SPIRE__.listScenarios() - See all available scenarios', 'color: #aaa;');
      console.log('%c  __SPIRE__.loadScenario("combat-basic") - Load a scenario', 'color: #aaa;');
      console.log('%c  __SPIRE__.getVisibleState() - Get machine-readable state', 'color: #aaa;');
      console.log('%c  __SPIRE__.playCard(0, 0) - Play card at index 0 on enemy 0', 'color: #aaa;');
      console.log('%c  __SPIRE__.autoFight() - Auto-play until combat ends', 'color: #aaa;');
      console.log('%c  __SPIRE__.fullPlaythrough() - Automated full run', 'color: #aaa;');
    }

    return () => {
      if (import.meta.env.DEV) {
        delete window.__SPIRE__;
      }
    };
  }, [loadScenario]);

  // This component renders nothing
  return null;
};

export default DevTools;
