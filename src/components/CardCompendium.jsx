import { useState } from 'react';
import { ALL_CARDS, CARD_TYPES } from '../data/cards';
import { loadProgression } from '../systems/progressionSystem';

const CardCompendium = ({ onClose }) => {
  const [sortBy, setSortBy] = useState('type');
  const [filterType, setFilterType] = useState('all');
  const [filterCharacter, setFilterCharacter] = useState('all');

  const progression = loadProgression();
  const discoveredIds = progression.cardsPlayedById || {};

  // Get unique cards (exclude status cards like wounds/burns/dazed that aren't collectible)
  const allCards = ALL_CARDS.filter(c => c.type !== CARD_TYPES.STATUS);

  const discoveredCount = allCards.filter(c => discoveredIds[c.id]).length;

  // Filter
  let cards = allCards;
  if (filterType !== 'all') cards = cards.filter(c => c.type === filterType);
  if (filterCharacter !== 'all') {
    cards = cards.filter(c => (c.character || 'ironclad') === filterCharacter);
  }

  // Sort
  cards = [...cards].sort((a, b) => {
    if (sortBy === 'cost') return (a.cost || 0) - (b.cost || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rarity') {
      const order = { basic: 0, common: 1, uncommon: 2, rare: 3, curse: 4 };
      return (order[a.rarity] || 5) - (order[b.rarity] || 5);
    }
    // Default: type
    const typeOrder = { attack: 0, skill: 1, power: 2, curse: 3 };
    return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
  });

  // Get unique characters for filter
  const characters = [...new Set(allCards.map(c => c.character || 'ironclad'))].sort();

  return (
    <div
      data-testid="card-compendium-overlay"
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
        background: 'linear-gradient(180deg, #1e2530 0%, #141420 100%)',
        border: '2px solid rgba(68, 170, 204, 0.4)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '520px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 0 40px rgba(68, 170, 204, 0.15), 0 8px 32px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close button */}
        <button
          data-testid="compendium-close"
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
          color: '#44aacc',
          fontSize: '20px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          textShadow: '0 0 15px rgba(68, 170, 204, 0.4)'
        }}>
          Card Compendium
        </h2>

        {/* Discovery count */}
        <div style={{
          color: '#667788',
          fontSize: '13px',
          marginBottom: '16px',
          letterSpacing: '1px'
        }}>
          {discoveredCount} / {allCards.length} cards discovered
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          height: '6px',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #44aacc, #66ccee)',
            height: '100%',
            width: `${allCards.length > 0 ? (discoveredCount / allCards.length) * 100 : 0}%`,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {/* Character filter */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <FilterButton active={filterCharacter === 'all'} onClick={() => setFilterCharacter('all')}>All Classes</FilterButton>
            {characters.map(ch => (
              <FilterButton key={ch} active={filterCharacter === ch} onClick={() => setFilterCharacter(ch)}>
                {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </FilterButton>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {/* Type filter */}
          <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')}>All</FilterButton>
          <FilterButton active={filterType === 'attack'} onClick={() => setFilterType('attack')}>Attacks</FilterButton>
          <FilterButton active={filterType === 'skill'} onClick={() => setFilterType('skill')}>Skills</FilterButton>
          <FilterButton active={filterType === 'power'} onClick={() => setFilterType('power')}>Powers</FilterButton>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          <span style={{ color: '#556', fontSize: '11px', lineHeight: '28px' }}>Sort: </span>
          <FilterButton active={sortBy === 'type'} onClick={() => setSortBy('type')}>Type</FilterButton>
          <FilterButton active={sortBy === 'cost'} onClick={() => setSortBy('cost')}>Cost</FilterButton>
          <FilterButton active={sortBy === 'name'} onClick={() => setSortBy('name')}>Name</FilterButton>
          <FilterButton active={sortBy === 'rarity'} onClick={() => setSortBy('rarity')}>Rarity</FilterButton>
        </div>

        {/* Card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '8px'
        }}>
          {cards.map(card => {
            const discovered = !!discoveredIds[card.id];
            return (
              <div
                key={card.id}
                data-testid={`compendium-card-${card.id}`}
                style={{
                  background: discovered
                    ? `rgba(${card.type === 'attack' ? '180, 60, 60' : card.type === 'skill' ? '60, 120, 180' : card.type === 'power' ? '180, 140, 60' : '100, 60, 60'}, 0.12)`
                    : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${discovered
                    ? `rgba(${card.type === 'attack' ? '180, 60, 60' : card.type === 'skill' ? '60, 120, 180' : card.type === 'power' ? '180, 140, 60' : '100, 60, 60'}, 0.3)`
                    : 'rgba(255, 255, 255, 0.06)'}`,
                  borderRadius: '6px',
                  padding: '8px',
                  opacity: discovered ? 1 : 0.4,
                  position: 'relative'
                }}
              >
                {/* Cost */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: discovered ? '#ddd' : '#555',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {card.cost >= 0 ? card.cost : 'X'}
                </div>

                {/* Name */}
                <div style={{
                  color: discovered ? '#ddd' : '#444',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginTop: '20px',
                  marginBottom: '4px',
                  lineHeight: '1.2'
                }}>
                  {discovered ? card.name : '???'}
                </div>

                {/* Description */}
                <div style={{
                  color: discovered ? '#999' : '#333',
                  fontSize: '10px',
                  lineHeight: '1.3'
                }}>
                  {discovered ? card.description : 'Not yet discovered'}
                </div>

                {/* Rarity badge */}
                {discovered && card.rarity && card.rarity !== 'basic' && card.rarity !== 'common' && (
                  <div style={{
                    fontSize: '9px',
                    color: card.rarity === 'rare' ? '#FFD700' : card.rarity === 'uncommon' ? '#44cc88' : '#aa6666',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: '4px'
                  }}>
                    {card.rarity}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {cards.length === 0 && (
          <div style={{ color: '#555', fontSize: '14px', textAlign: 'center', padding: '30px 0', fontStyle: 'italic' }}>
            No cards match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? 'rgba(68, 170, 204, 0.2)' : 'rgba(255, 255, 255, 0.05)',
      color: active ? '#44aacc' : '#667',
      border: `1px solid ${active ? 'rgba(68, 170, 204, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
      borderRadius: '4px',
      padding: '4px 10px',
      fontSize: '11px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'capitalize'
    }}
  >
    {children}
  </button>
);

export default CardCompendium;
