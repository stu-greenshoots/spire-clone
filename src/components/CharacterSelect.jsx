import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CHARACTERS } from '../data/characters';
import { getCharacterImage } from '../assets/art/art-config';

const CharacterSelect = () => {
  const { selectCharacter } = useGame();
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      textAlign: 'center',
      background: 'radial-gradient(ellipse at center bottom, #2a2a4a 0%, #1a1a2e 40%, #0d0d1a 100%)'
    }}>
      <h2 style={{
        color: '#FFD700',
        fontSize: 'clamp(24px, 5vw, 36px)',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        marginBottom: '8px',
        textShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
      }}>
        Choose Your Path
      </h2>

      <p style={{
        color: '#8878a0',
        fontSize: '14px',
        marginBottom: '32px',
        fontStyle: 'italic'
      }}>
        Each warrior enters the Endless War differently.
      </p>

      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '600px'
      }}>
        {CHARACTERS.map((character) => {
          const isHovered = hoveredId === character.id;
          const portraitUrl = getCharacterImage(character.id);
          return (
            <button
              key={character.id}
              data-testid={`btn-select-${character.id}`}
              onClick={() => selectCharacter(character.id)}
              onMouseEnter={() => setHoveredId(character.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isHovered
                  ? `linear-gradient(180deg, ${character.color}dd 0%, ${character.color}99 50%, ${character.color}66 100%)`
                  : `linear-gradient(180deg, ${character.color}aa 0%, ${character.color}77 50%, ${character.color}44 100%)`,
                color: 'white',
                border: `2px solid ${character.color}88`,
                borderRadius: '12px',
                padding: '20px 24px',
                cursor: 'pointer',
                minWidth: '200px',
                maxWidth: '260px',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                boxShadow: isHovered
                  ? `0 0 30px ${character.color}44, 0 8px 24px rgba(0, 0, 0, 0.5)`
                  : `0 4px 16px rgba(0, 0, 0, 0.4)`,
                touchAction: 'manipulation'
              }}
            >
              {portraitUrl && (
                <div style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${character.color}`,
                  boxShadow: isHovered
                    ? `0 0 20px ${character.color}66`
                    : `0 0 8px ${character.color}33`
                }}>
                  <img
                    src={portraitUrl}
                    alt={character.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              <div style={{
                fontSize: '22px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
              }}>
                {character.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5'
              }}>
                {character.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterSelect;
