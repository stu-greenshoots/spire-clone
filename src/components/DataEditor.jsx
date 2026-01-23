import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { ALL_CARDS, CARD_TYPES, RARITY } from '../data/cards';
import { ALL_RELICS, RELIC_RARITY } from '../data/relics';
import { ALL_ENEMIES } from '../data/enemies';
import { saveCustomEntry, deleteCustomEntry, resetAllCustomData, isCustomEntry } from '../systems/customDataManager';
import CardForm from './editor/CardForm';
import RelicForm from './editor/RelicForm';
import EnemyForm from './editor/EnemyForm';
import EditorPreview from './editor/EditorPreview';
import Glossary from './editor/Glossary';

const TABS = ['Cards', 'Relics', 'Enemies', 'Help'];

const DataEditor = () => {
  const { returnToMenu } = useGame();
  const [activeTab, setActiveTab] = useState('Cards');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [saveFlash, setSaveFlash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const items = useMemo(() => {
    let list = [];
    if (activeTab === 'Cards') {
      list = ALL_CARDS.map(c => ({ id: c.id, name: c.name, type: c.type, rarity: c.rarity }));
    } else if (activeTab === 'Relics') {
      list = ALL_RELICS.map(r => ({ id: r.id, name: r.name, rarity: r.rarity, emoji: r.emoji }));
    } else {
      list = ALL_ENEMIES.map(e => ({ id: e.id, name: e.name, type: e.type, act: e.act, emoji: e.emoji }));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(term) || item.id.toLowerCase().includes(term));
    }

    if (filterType !== 'all') {
      if (activeTab === 'Cards') {
        list = list.filter(item => item.type === filterType || item.rarity === filterType);
      } else if (activeTab === 'Relics') {
        list = list.filter(item => item.rarity === filterType);
      } else {
        list = list.filter(item => item.type === filterType || String(item.act) === filterType);
      }
    }

    return list;
  }, [activeTab, searchTerm, filterType]);

  const getFilterOptions = () => {
    if (activeTab === 'Cards') {
      return [
        { value: 'all', label: 'All' },
        ...Object.entries(CARD_TYPES).map(([k, v]) => ({ value: v, label: k })),
        ...Object.entries(RARITY).map(([k, v]) => ({ value: v, label: k }))
      ];
    } else if (activeTab === 'Relics') {
      return [
        { value: 'all', label: 'All' },
        ...Object.entries(RELIC_RARITY).map(([k, v]) => ({ value: v, label: k }))
      ];
    } else {
      return [
        { value: 'all', label: 'All' },
        { value: 'normal', label: 'Normal' },
        { value: 'elite', label: 'Elite' },
        { value: 'boss', label: 'Boss' },
        { value: '1', label: 'Act 1' },
        { value: '2', label: 'Act 2' },
        { value: '3', label: 'Act 3' }
      ];
    }
  };

  const selectItem = (id) => {
    setSelectedId(id);
    let source;
    if (activeTab === 'Cards') {
      source = ALL_CARDS.find(c => c.id === id);
    } else if (activeTab === 'Relics') {
      source = ALL_RELICS.find(r => r.id === id);
    } else {
      source = ALL_ENEMIES.find(e => e.id === id);
    }
    if (source) {
      setFormData(JSON.parse(JSON.stringify(source, (key, value) => {
        if (typeof value === 'function') return undefined;
        return value;
      })));
    }
  };

  const handleCreateNew = () => {
    const type = activeTab === 'Cards' ? 'cards' : activeTab === 'Relics' ? 'relics' : 'enemies';
    const prefix = 'custom_';
    const existingCustom = items.filter(i => i.id.startsWith(prefix));
    const newId = `${prefix}${type.slice(0, -1)}_${existingCustom.length + 1}`;

    let newItem;
    if (activeTab === 'Cards') {
      newItem = {
        id: newId, name: 'New Card', type: CARD_TYPES.ATTACK, rarity: RARITY.COMMON,
        cost: 1, damage: 6, description: 'A custom card.'
      };
    } else if (activeTab === 'Relics') {
      newItem = {
        id: newId, name: 'New Relic', rarity: RELIC_RARITY.COMMON,
        emoji: '\u2B50', description: 'A custom relic.',
        trigger: 'onCombatStart', effect: { type: 'block', amount: 5 }
      };
    } else {
      newItem = {
        id: newId, name: 'New Enemy', type: 'normal', act: 1, emoji: '\uD83D\uDC7E',
        hp: { min: 30, max: 40 },
        moveset: [{ id: 'attack', intent: 'attack', damage: 6, message: 'Attack' }],
        aiPattern: 'sequential'
      };
    }

    if (activeTab === 'Cards') ALL_CARDS.push(newItem);
    else if (activeTab === 'Relics') ALL_RELICS.push(newItem);
    else ALL_ENEMIES.push(newItem);

    saveCustomEntry(type, newId, newItem);
    setSelectedId(newId);
    setFormData({ ...newItem });
  };

  const handleSave = () => {
    if (!formData || !selectedId) return;
    const type = activeTab === 'Cards' ? 'cards' : activeTab === 'Relics' ? 'relics' : 'enemies';

    if (activeTab === 'Cards') {
      const idx = ALL_CARDS.findIndex(c => c.id === selectedId);
      if (idx >= 0) ALL_CARDS[idx] = { ...ALL_CARDS[idx], ...formData };
    } else if (activeTab === 'Relics') {
      const idx = ALL_RELICS.findIndex(r => r.id === selectedId);
      if (idx >= 0) ALL_RELICS[idx] = { ...ALL_RELICS[idx], ...formData };
    } else {
      const idx = ALL_ENEMIES.findIndex(e => e.id === selectedId);
      if (idx >= 0) ALL_ENEMIES[idx] = { ...ALL_ENEMIES[idx], ...formData };
    }

    saveCustomEntry(type, selectedId, formData);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 800);
  };

  const handleReset = () => {
    if (!selectedId) return;
    const type = activeTab === 'Cards' ? 'cards' : activeTab === 'Relics' ? 'relics' : 'enemies';
    deleteCustomEntry(type, selectedId);
    selectItem(selectedId);
  };

  const handleResetAll = () => {
    if (confirm('Reset ALL custom data? This cannot be undone.')) {
      resetAllCustomData();
      setSelectedId(null);
      setFormData(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedId(null);
    setFormData(null);
    setSearchTerm('');
    setFilterType('all');
  };

  const typeKey = activeTab === 'Cards' ? 'cards' : activeTab === 'Relics' ? 'relics' : 'enemies';

  return (
    <div style={styles.container}>
      {/* Header row: back + tabs */}
      <div style={styles.header}>
        <button onClick={returnToMenu} style={styles.backBtn}>&larr;</button>
        <div style={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              style={activeTab === tab ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            >
              {tab}
            </button>
          ))}
        </div>
        <button onClick={handleResetAll} style={styles.resetBtn}>Reset</button>
      </div>

      {activeTab !== 'Help' && (
        <>
          {/* Selector row: filter + item picker + new */}
          <div style={styles.selectorRow}>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              {getFilterOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={selectedId || ''}
              onChange={e => { if (e.target.value) selectItem(e.target.value); }}
              style={styles.itemSelect}
            >
              <option value="">-- Select --</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {isCustomEntry(typeKey, item.id) ? '* ' : ''}{item.name}
                </option>
              ))}
            </select>
            <button onClick={handleCreateNew} style={styles.createBtn}>+</button>
          </div>

          {/* Search row */}
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </>
      )}

      {/* Scrollable content: form + preview or glossary */}
      <div style={styles.scrollArea}>
        {activeTab === 'Help' ? (
          <Glossary />
        ) : formData ? (
          <>
            {/* Actions bar */}
            <div style={styles.actionsBar}>
              <span style={styles.editingLabel}>{formData.name || selectedId}</span>
              <div style={styles.actionBtns}>
                <button onClick={handleReset} style={styles.resetItemBtn}>Reset</button>
                <button
                  onClick={handleSave}
                  style={saveFlash ? { ...styles.saveBtn, ...styles.saveBtnFlash } : styles.saveBtn}
                >
                  {saveFlash ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>

            {/* Form */}
            {activeTab === 'Cards' && <CardForm data={formData} onChange={setFormData} />}
            {activeTab === 'Relics' && <RelicForm data={formData} onChange={setFormData} />}
            {activeTab === 'Enemies' && <EnemyForm data={formData} onChange={setFormData} />}

            {/* Preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={styles.previewToggle}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {showPreview && (
              <div style={styles.previewSection}>
                <EditorPreview type={activeTab} data={formData} />
              </div>
            )}
          </>
        ) : (
          <div style={styles.placeholder}>Select an item above to edit</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#1a1a2e',
    color: '#eee',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    background: '#12122a',
    borderBottom: '1px solid #333',
    gap: '8px',
    flexShrink: 0
  },
  backBtn: {
    background: '#444',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  tabs: {
    display: 'flex',
    gap: '3px',
    flex: 1,
    justifyContent: 'center'
  },
  tab: {
    background: '#2a2a4a',
    color: '#aaa',
    border: '1px solid #444',
    padding: '6px 14px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  tabActive: {
    background: '#4466aa',
    color: '#fff',
    borderColor: '#6688cc'
  },
  resetBtn: {
    background: '#552222',
    color: '#f88',
    border: '1px solid #773333',
    padding: '6px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  selectorRow: {
    display: 'flex',
    padding: '8px 10px',
    gap: '6px',
    borderBottom: '1px solid #2a2a3a',
    flexShrink: 0
  },
  filterSelect: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '6px',
    borderRadius: '4px',
    fontSize: '12px',
    width: '80px'
  },
  itemSelect: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '6px',
    borderRadius: '4px',
    fontSize: '12px',
    flex: 1,
    minWidth: 0
  },
  createBtn: {
    background: '#2a6a2a',
    color: '#8f8',
    border: '1px solid #4a8a4a',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  searchRow: {
    padding: '6px 10px',
    borderBottom: '1px solid #2a2a3a',
    flexShrink: 0
  },
  searchInput: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    width: '100%',
    boxSizing: 'border-box'
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px'
  },
  actionsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '8px 10px',
    background: '#12122a',
    borderRadius: '6px',
    border: '1px solid #333'
  },
  editingLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ccc',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '8px'
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0
  },
  resetItemBtn: {
    background: '#553322',
    color: '#fa6',
    border: '1px solid #775533',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  saveBtn: {
    background: '#225588',
    color: '#8cf',
    border: '1px solid #3377aa',
    padding: '5px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  saveBtnFlash: {
    background: '#228833',
    color: '#afa',
    borderColor: '#44aa55'
  },
  previewToggle: {
    marginTop: '12px',
    width: '100%',
    background: '#2a2a4a',
    color: '#aaa',
    border: '1px solid #444',
    padding: '8px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'center'
  },
  previewSection: {
    marginTop: '10px',
    padding: '12px',
    background: '#151528',
    border: '1px solid #333',
    borderRadius: '6px'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#666',
    fontSize: '14px',
    fontStyle: 'italic'
  }
};

export default DataEditor;
