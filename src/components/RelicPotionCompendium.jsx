import { useState } from 'react';
import { ALL_RELICS, RELIC_RARITY } from '../data/relics';
import { ALL_POTIONS, POTION_RARITY } from '../data/potions';
import { loadProgression } from '../systems/progressionSystem';

const RelicPotionCompendium = ({ onClose }) => {
  const [tab, setTab] = useState('relics');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterCharacter, setFilterCharacter] = useState('all');
  const [sortBy, setSortBy] = useState('rarity');

  const progression = loadProgression();
  const discoveredRelics = progression.relicsCollected || {};
  const discoveredPotions = progression.potionsCollected || {};

  // Relic rarity order
  const relicRarityOrder = { starter: 0, common: 1, uncommon: 2, rare: 3, boss: 4, event: 5, shop: 6 };
  const potionRarityOrder = { common: 0, uncommon: 1, rare: 2 };

  // Get unique characters from relics
  const relicCharacters = [...new Set(ALL_RELICS.filter(r => r.character).map(r => r.character))].sort();

  // --- RELICS ---
  const relicDiscoveredCount = ALL_RELICS.filter(r => discoveredRelics[r.id]).length;

  let relics = [...ALL_RELICS];
  if (filterRarity !== 'all') relics = relics.filter(r => r.rarity === filterRarity);
  if (filterCharacter !== 'all') {
    relics = relics.filter(r => r.character === filterCharacter);
  }

  relics.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (relicRarityOrder[a.rarity] || 99) - (relicRarityOrder[b.rarity] || 99);
  });

  // --- POTIONS ---
  const potionDiscoveredCount = ALL_POTIONS.filter(p => discoveredPotions[p.id]).length;

  let potions = [...ALL_POTIONS];
  if (filterRarity !== 'all') potions = potions.filter(p => p.rarity === filterRarity);

  potions.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (potionRarityOrder[a.rarity] || 99) - (potionRarityOrder[b.rarity] || 99);
  });

  const isRelicTab = tab === 'relics';
  const items = isRelicTab ? relics : potions;
  const totalCount = isRelicTab ? ALL_RELICS.length : ALL_POTIONS.length;
  const discoveredCount = isRelicTab ? relicDiscoveredCount : potionDiscoveredCount;
  const discoveredMap = isRelicTab ? discoveredRelics : discoveredPotions;

  // Available rarity filters per tab
  const rarityOptions = isRelicTab
    ? Object.values(RELIC_RARITY)
    : Object.values(POTION_RARITY);

  const getRarityColor = (rarity) => {
    const colors = {
      starter: '#8888aa',
      common: '#aaaaaa',
      uncommon: '#44cc88',
      rare: '#FFD700',
      boss: '#ff6644',
      event: '#aa88cc',
      shop: '#44aacc'
    };
    return colors[rarity] || '#888';
  };

  const getItemBackground = (item, discovered) => {
    if (!discovered) return 'rgba(255, 255, 255, 0.02)';
    const color = getRarityColor(item.rarity);
    // Parse hex to rgb for background
    return `rgba(${parseInt(color.slice(1, 3), 16) || 100}, ${parseInt(color.slice(3, 5), 16) || 100}, ${parseInt(color.slice(5, 7), 16) || 100}, 0.1)`;
  };

  const getItemBorder = (item, discovered) => {
    if (!discovered) return '1px solid rgba(255, 255, 255, 0.06)';
    const color = getRarityColor(item.rarity);
    return `1px solid ${color}33`;
  };

  return (
    <div
      data-testid="relic-potion-compendium-overlay"
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
          Collection
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          <FilterButton active={tab === 'relics'} onClick={() => { setTab('relics'); setFilterRarity('all'); setFilterCharacter('all'); }}>
            Relics
          </FilterButton>
          <FilterButton active={tab === 'potions'} onClick={() => { setTab('potions'); setFilterRarity('all'); setFilterCharacter('all'); }}>
            Potions
          </FilterButton>
        </div>

        {/* Discovery count */}
        <div style={{
          color: '#667788',
          fontSize: '13px',
          marginBottom: '8px',
          letterSpacing: '1px'
        }}>
          {discoveredCount} / {totalCount} {isRelicTab ? 'relics' : 'potions'} discovered
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
            width: `${totalCount > 0 ? (discoveredCount / totalCount) * 100 : 0}%`,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {/* Rarity filter */}
          <FilterButton active={filterRarity === 'all'} onClick={() => setFilterRarity('all')}>All</FilterButton>
          {rarityOptions.map(rarity => (
            <FilterButton key={rarity} active={filterRarity === rarity} onClick={() => setFilterRarity(rarity)}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </FilterButton>
          ))}
        </div>

        {/* Character filter (relics only) */}
        {isRelicTab && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            <FilterButton active={filterCharacter === 'all'} onClick={() => setFilterCharacter('all')}>All Classes</FilterButton>
            {relicCharacters.map(ch => (
              <FilterButton key={ch} active={filterCharacter === ch} onClick={() => setFilterCharacter(ch)}>
                {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </FilterButton>
            ))}
          </div>
        )}

        {/* Sort */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          <span style={{ color: '#556', fontSize: '11px', lineHeight: '28px' }}>Sort: </span>
          <FilterButton active={sortBy === 'rarity'} onClick={() => setSortBy('rarity')}>Rarity</FilterButton>
          <FilterButton active={sortBy === 'name'} onClick={() => setSortBy('name')}>Name</FilterButton>
        </div>

        {/* Item grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '8px'
        }}>
          {items.map(item => {
            const discovered = !!discoveredMap[item.id];
            return (
              <div
                key={item.id}
                data-testid={`compendium-${isRelicTab ? 'relic' : 'potion'}-${item.id}`}
                style={{
                  background: getItemBackground(item, discovered),
                  border: getItemBorder(item, discovered),
                  borderRadius: '6px',
                  padding: '8px',
                  opacity: discovered ? 1 : 0.4,
                  position: 'relative'
                }}
              >
                {/* Emoji */}
                {discovered && item.emoji && (
                  <div style={{
                    fontSize: '20px',
                    marginBottom: '4px'
                  }}>
                    {item.emoji}
                  </div>
                )}

                {/* Name */}
                <div style={{
                  color: discovered ? '#ddd' : '#444',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  lineHeight: '1.2'
                }}>
                  {discovered ? item.name : '???'}
                </div>

                {/* Description */}
                <div style={{
                  color: discovered ? '#999' : '#333',
                  fontSize: '10px',
                  lineHeight: '1.3'
                }}>
                  {discovered ? item.description : 'Not yet discovered'}
                </div>

                {/* Rarity badge */}
                {discovered && (
                  <div style={{
                    fontSize: '9px',
                    color: getRarityColor(item.rarity),
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: '4px'
                  }}>
                    {item.rarity}
                  </div>
                )}

                {/* Character badge (relics only) */}
                {discovered && item.character && (
                  <div style={{
                    fontSize: '9px',
                    color: '#8878a0',
                    textTransform: 'capitalize',
                    marginTop: '2px'
                  }}>
                    {item.character}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div style={{ color: '#555', fontSize: '14px', textAlign: 'center', padding: '30px 0', fontStyle: 'italic' }}>
            No {isRelicTab ? 'relics' : 'potions'} match the current filters.
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

export default RelicPotionCompendium;
