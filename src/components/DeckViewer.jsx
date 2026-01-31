import { useState } from 'react';
import { CARD_TYPES } from '../data/cards';
import { SimpleTooltip } from './Tooltip';
import { getRelicImage } from '../assets/art/art-config';

const DeckViewer = ({ deck, relics, runStats, onClose }) => {
  const [sortBy, setSortBy] = useState('type'); // 'type', 'cost', 'name'
  const [filterType, setFilterType] = useState('all');

  const sortedDeck = [...deck].sort((a, b) => {
    if (sortBy === 'cost') return (a.cost || 0) - (b.cost || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'type') {
      const typeOrder = { attack: 0, skill: 1, power: 2, curse: 3, status: 4 };
      return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
    }
    return 0;
  });

  const filteredDeck = filterType === 'all'
    ? sortedDeck
    : sortedDeck.filter(c => c.type === filterType);

  const typeBreakdown = {
    attack: deck.filter(c => c.type === CARD_TYPES.ATTACK).length,
    skill: deck.filter(c => c.type === CARD_TYPES.SKILL).length,
    power: deck.filter(c => c.type === CARD_TYPES.POWER).length,
    curse: deck.filter(c => c.type === CARD_TYPES.CURSE || c.type === CARD_TYPES.STATUS).length
  };

  return (
    <div className="deck-viewer-overlay">
      <div className="deck-viewer">
        <div className="deck-viewer-header">
          <h2>Deck ({deck.length} cards)</h2>
          <button className="close-btn" onClick={onClose}>&#x2715;</button>
        </div>

        <div className="deck-viewer-controls">
          <div className="sort-controls">
            <span>Sort: </span>
            <button className={sortBy === 'type' ? 'active' : ''} onClick={() => setSortBy('type')}>Type</button>
            <button className={sortBy === 'cost' ? 'active' : ''} onClick={() => setSortBy('cost')}>Cost</button>
            <button className={sortBy === 'name' ? 'active' : ''} onClick={() => setSortBy('name')}>Name</button>
          </div>
          <div className="filter-controls">
            <button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>All</button>
            <button className={filterType === 'attack' ? 'active' : ''} onClick={() => setFilterType('attack')}>Attacks ({typeBreakdown.attack})</button>
            <button className={filterType === 'skill' ? 'active' : ''} onClick={() => setFilterType('skill')}>Skills ({typeBreakdown.skill})</button>
            <button className={filterType === 'power' ? 'active' : ''} onClick={() => setFilterType('power')}>Powers ({typeBreakdown.power})</button>
          </div>
        </div>

        <div className="deck-card-grid">
          {filteredDeck.map((card, idx) => (
            <div key={card.instanceId || idx} className={`deck-card-item card-type-${card.type}${card.rarity && card.rarity !== 'basic' && card.rarity !== 'common' ? ` card-rarity-${card.rarity}` : ''}`}>
              <div className="deck-card-cost">{card.cost >= 0 ? card.cost : 'X'}</div>
              <div className="deck-card-name">{card.name}{card.upgraded ? '+' : ''}</div>
              <div className="deck-card-desc">{card.description}</div>
              {card.rarity && card.rarity !== 'basic' && card.rarity !== 'common' && (
                <div className={`deck-card-rarity deck-card-rarity--${card.rarity}`}>
                  {card.rarity}
                </div>
              )}
            </div>
          ))}
        </div>

        {relics && relics.length > 0 && (
          <div className="deck-relics-section">
            <h3>Relics ({relics.length})</h3>
            <div className="deck-relics-grid">
              {relics.map((relic, idx) => (
                <SimpleTooltip
                  key={relic.id || idx}
                  content={
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#DAA520', marginBottom: '4px' }}>
                        {relic.name}
                      </div>
                      <div style={{ color: '#ccc' }}>{relic.description}</div>
                    </div>
                  }
                  placement="top"
                  delay={150}
                >
                  <div className="deck-relic-item">
                    {(() => {
                      const img = getRelicImage(relic.id);
                      return img ? <img src={img} alt={relic.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} /> : <span className="relic-emoji">{relic.emoji}</span>;
                    })()}
                    <span className="relic-name">{relic.name}</span>
                  </div>
                </SimpleTooltip>
              ))}
            </div>
          </div>
        )}

        {runStats && (
          <div className="run-stats-section">
            <h3>Run Stats</h3>
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-label">Floor</span><span className="stat-value">{runStats.floor || 0}</span></div>
              <div className="stat-item"><span className="stat-label">Cards Played</span><span className="stat-value">{runStats.cardsPlayed || 0}</span></div>
              <div className="stat-item"><span className="stat-label">Damage Dealt</span><span className="stat-value">{runStats.damageDealt || 0}</span></div>
              <div className="stat-item"><span className="stat-label">Enemies Killed</span><span className="stat-value">{runStats.enemiesKilled || 0}</span></div>
              <div className="stat-item"><span className="stat-label">Gold Earned</span><span className="stat-value">{runStats.goldEarned || 0}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckViewer;
