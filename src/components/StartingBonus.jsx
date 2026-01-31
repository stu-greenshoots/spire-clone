import { useState } from 'react';
import { useGame } from '../context/GameContext';

const BONUS_OPTIONS = [
  {
    id: 'random_relic',
    title: 'Receive a blessing',
    description: 'Gain a random common relic.',
    icon: '\u2728'
  },
  {
    id: 'gain_gold',
    title: 'Demand tribute',
    description: 'Gain 100 gold.',
    icon: '\uD83D\uDCB0'
  },
  {
    id: 'upgrade_card',
    title: 'Hone your weapon',
    description: 'Upgrade a random starter card.',
    icon: '\u2694\uFE0F'
  },
  {
    id: 'transform_card',
    title: 'Reshape your fate',
    description: 'Transform a random starter card into a new card.',
    icon: '\uD83D\uDD04'
  }
];

const StartingBonus = () => {
  const { selectStartingBonus } = useGame();
  const [selected, setSelected] = useState(null);

  const handleSelect = (bonusId) => {
    setSelected(bonusId);
    selectStartingBonus(bonusId);
  };

  return (
    <div className="starting-bonus-screen" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '2rem',
      gap: '1.5rem'
    }}>
      <h2 style={{
        color: '#c8b8db',
        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
        textAlign: 'center',
        marginBottom: '0.5rem',
        fontWeight: 'normal',
        letterSpacing: '0.05em'
      }}>
        The war offers you a choice before the climb...
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        {BONUS_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={selected !== null}
            data-testid={`bonus-${option.id}`}
            style={{
              background: 'rgba(30, 30, 50, 0.8)',
              border: '1px solid rgba(100, 80, 140, 0.5)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              color: '#d0c8e0',
              cursor: selected !== null ? 'default' : 'pointer',
              textAlign: 'left',
              opacity: selected !== null && selected !== option.id ? 0.4 : 1,
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {option.icon} {option.title}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9988aa' }}>
              {option.description}
            </div>
          </button>
        ))}

        <button
          onClick={() => handleSelect('skip')}
          disabled={selected !== null}
          data-testid="bonus-skip"
          style={{
            background: 'transparent',
            border: '1px solid rgba(80, 80, 100, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            color: '#666',
            cursor: selected !== null ? 'default' : 'pointer',
            textAlign: 'center',
            fontSize: '0.85rem',
            marginTop: '0.5rem'
          }}
        >
          Embark with nothing
        </button>
      </div>
    </div>
  );
};

export default StartingBonus;
