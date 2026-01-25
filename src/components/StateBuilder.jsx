import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SCENARIOS, getScenariosByCategory } from '../data/scenarios';

/**
 * StateBuilder - Dev tool for loading test scenarios
 *
 * Allows jumping to any predefined game state for testing.
 * Access from main menu (dev mode only in production).
 */
const StateBuilder = ({ onClose }) => {
  const { loadScenario } = useGame();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [activeCategory, setActiveCategory] = useState('combat');

  const categories = getScenariosByCategory();

  const categoryLabels = {
    combat: 'Combat',
    shop: 'Shop',
    map: 'Map',
    reward: 'Rewards',
    rest: 'Rest Site',
    edge: 'Edge Cases'
  };

  const handleLoadScenario = () => {
    if (selectedScenario && SCENARIOS[selectedScenario]) {
      loadScenario(SCENARIOS[selectedScenario]);
    }
  };

  const handleQuickLoad = (key) => {
    if (SCENARIOS[key]) {
      loadScenario(SCENARIOS[key]);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        background: '#1a1a2e'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#ffd700' }}>
          State Builder
        </h1>
        <button
          onClick={onClose}
          style={{
            background: '#333',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px 20px',
        background: '#111',
        borderBottom: '1px solid #333',
        flexWrap: 'wrap'
      }}>
        {Object.keys(categories).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? '#ffd700' : '#2a2a3e',
              color: activeCategory === cat ? '#000' : '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeCategory === cat ? 'bold' : 'normal'
            }}
          >
            {categoryLabels[cat]} ({categories[cat].length})
          </button>
        ))}
      </div>

      {/* Scenario List */}
      <div style={{
        flex: 1,
        padding: '16px 20px',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {categories[activeCategory].map(scenario => (
            <div
              key={scenario.key}
              onClick={() => setSelectedScenario(scenario.key)}
              style={{
                background: selectedScenario === scenario.key ? '#2a2a5e' : '#1a1a2e',
                border: selectedScenario === scenario.key ? '2px solid #ffd700' : '1px solid #333',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#ffd700' }}>
                  {scenario.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLoad(scenario.key);
                  }}
                  style={{
                    background: '#27ae60',
                    border: 'none',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  LOAD
                </button>
              </div>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#888',
                lineHeight: '1.4'
              }}>
                {scenario.description}
              </p>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}>
                {scenario.phase && (
                  <span style={{
                    background: '#333',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#aaa'
                  }}>
                    {scenario.phase}
                  </span>
                )}
                {scenario.floor !== undefined && (
                  <span style={{
                    background: '#333',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#aaa'
                  }}>
                    Floor {scenario.floor}
                  </span>
                )}
                {scenario.enemies?.length > 0 && (
                  <span style={{
                    background: '#4a1a1a',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#e74c3c'
                  }}>
                    {scenario.enemies.length} {scenario.enemies.length === 1 ? 'enemy' : 'enemies'}
                  </span>
                )}
                {scenario.player?.currentHp && (
                  <span style={{
                    background: '#1a3a1a',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#27ae60'
                  }}>
                    {scenario.player.currentHp}/{scenario.player.maxHp} HP
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with selected scenario action */}
      {selectedScenario && (
        <div style={{
          padding: '16px 20px',
          background: '#1a1a2e',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ color: '#888', fontSize: '13px' }}>Selected: </span>
            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
              {SCENARIOS[selectedScenario]?.name}
            </span>
          </div>
          <button
            onClick={handleLoadScenario}
            style={{
              background: '#ffd700',
              color: '#000',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold'
            }}
          >
            Load Scenario
          </button>
        </div>
      )}

      {/* Console API hint */}
      <div style={{
        padding: '12px 20px',
        background: '#0a0a15',
        borderTop: '1px solid #222',
        fontSize: '11px',
        color: '#666'
      }}>
        Console API: <code style={{ color: '#888' }}>
          window.__SPIRE__.loadScenario(&apos;{selectedScenario || 'combat-basic'}&apos;)
        </code>
      </div>
    </div>
  );
};

export default StateBuilder;
