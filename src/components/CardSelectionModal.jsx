import Card from './Card';

/**
 * CardSelectionModal - Universal modal for selecting cards from various sources
 * Used for: Headbutt, Warcry, Armaments, Dual Wield, Exhume, etc.
 */
const CardSelectionModal = ({
  cards,
  title,
  subtitle,
  onSelect,
  onCancel,
  canSelect = () => true,
  showCancel = true
}) => {
  if (!cards || cards.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        animation: 'fadeIn 0.2s ease'
      }}>
        <div style={{ color: '#888', fontSize: '18px', marginBottom: '20px' }}>
          No valid cards to select
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '12px 30px',
              background: 'linear-gradient(180deg, #444 0%, #333 100%)',
              color: 'white',
              border: '2px solid #555',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 200,
      animation: 'fadeIn 0.2s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(180deg, #222 0%, #1a1a1a 100%)',
        borderBottom: '2px solid #FFD700',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: 0,
          color: '#FFD700',
          fontSize: '22px',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        justifyContent: 'center',
        alignContent: 'flex-start'
      }}>
        {cards.map((card, index) => {
          const selectable = canSelect(card, index);
          return (
            <div
              key={card.instanceId || `${card.id}_${index}`}
              onClick={() => selectable && onSelect(card, index)}
              style={{
                cursor: selectable ? 'pointer' : 'not-allowed',
                opacity: selectable ? 1 : 0.4,
                transition: 'all 0.2s ease',
                transform: selectable ? 'scale(1)' : 'scale(0.95)'
              }}
            >
              <Card card={card} />
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      {showCancel && (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
          borderTop: '2px solid #333',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '14px 50px',
              background: 'linear-gradient(180deg, #444 0%, #333 100%)',
              color: 'white',
              border: '2px solid #555',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              touchAction: 'manipulation'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CardSelectionModal;
