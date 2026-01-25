import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { SCENARIOS, getScenarioNames } from '../data/scenarios';

/**
 * DevTools - Exposes console API for testing
 *
 * In development mode, provides window.__SPIRE__ with:
 * - loadScenario(name) - Load a preset scenario by name
 * - listScenarios() - List all available scenario names
 * - getState() - Get current game state
 * - setState(partialState) - Directly set state (advanced)
 */
const DevTools = () => {
  const { state, loadScenario } = useGame();

  useEffect(() => {
    if (import.meta.env.DEV) {
      window.__SPIRE__ = {
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
          console.log('Current game state:', state);
          return { ...state };
        },

        // Direct state load (for custom scenarios)
        setState: (scenario) => {
          console.log('Loading custom scenario...');
          loadScenario(scenario);
          return true;
        },

        // Quick reference for scenario names
        scenarios: getScenarioNames()
      };

      console.log('%c🎮 Spire Dev Tools Loaded', 'color: #ffd700; font-weight: bold; font-size: 14px;');
      console.log('%cUse window.__SPIRE__ to access testing tools:', 'color: #888;');
      console.log('%c  __SPIRE__.listScenarios() - See all available scenarios', 'color: #aaa;');
      console.log('%c  __SPIRE__.loadScenario("combat-boss-hexaghost") - Load a scenario', 'color: #aaa;');
      console.log('%c  __SPIRE__.getState() - View current state', 'color: #aaa;');
    }

    return () => {
      if (import.meta.env.DEV) {
        delete window.__SPIRE__;
      }
    };
  }, [state, loadScenario]);

  // This component renders nothing
  return null;
};

export default DevTools;
