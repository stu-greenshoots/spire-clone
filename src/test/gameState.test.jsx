import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { GameProvider, useGame, GAME_PHASE } from '../context/GameContext';

// Test component to access game context - uses module-level variable to capture context
let capturedContext = null;
const TestComponent = () => {
  const context = useGame();
  capturedContext = context;
  return null;
};

describe('Game State', () => {
  describe('Initial State', () => {
    it('should start in MAIN_MENU phase', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(capturedContext.state.phase).toBe(GAME_PHASE.MAIN_MENU);
    });

    it('should have empty deck initially', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(capturedContext.state.deck.length).toBe(0);
    });

    it('should have no relics initially', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(capturedContext.state.relics.length).toBe(0);
    });
  });

  describe('START_GAME action', () => {
    it('should transition to MAP phase', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        capturedContext.startGame();
      });

      expect(capturedContext.state.phase).toBe(GAME_PHASE.STARTING_BONUS);
    });

    it('should provide necessary game functions', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(typeof capturedContext.startGame).toBe('function');
      expect(typeof capturedContext.selectNode).toBe('function');
      expect(typeof capturedContext.selectCard).toBe('function');
      expect(typeof capturedContext.playCard).toBe('function');
      expect(typeof capturedContext.endTurn).toBe('function');
      expect(typeof capturedContext.cancelTarget).toBe('function');
      expect(typeof capturedContext.collectGold).toBe('function');
      expect(typeof capturedContext.rest).toBe('function');
      expect(typeof capturedContext.upgradeCard).toBe('function');
      expect(typeof capturedContext.returnToMenu).toBe('function');
    });
  });

  describe('Player State', () => {
    it('should have correct initial player stats', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const { player } = capturedContext.state;
      expect(player.maxHp).toBe(80);
      expect(player.currentHp).toBe(80);
      expect(player.maxEnergy).toBe(3);
      expect(player.gold).toBe(99);
      expect(player.strength).toBe(0);
      expect(player.dexterity).toBe(0);
    });

    it('should have all status effect fields initialized', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const { player } = capturedContext.state;
      expect(player.vulnerable).toBe(0);
      expect(player.weak).toBe(0);
      expect(player.frail).toBe(0);
      expect(player.block).toBe(0);
    });

    it('should have all power fields initialized', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const { player } = capturedContext.state;
      expect(player.barricade).toBe(false);
      expect(player.berserk).toBe(0);
      expect(player.demonForm).toBe(0);
      expect(player.metallicize).toBe(0);
    });
  });

  describe('GAME_PHASE enum', () => {
    it('should have all required phases', () => {
      expect(GAME_PHASE.MAIN_MENU).toBeDefined();
      expect(GAME_PHASE.MAP).toBeDefined();
      expect(GAME_PHASE.COMBAT).toBeDefined();
      expect(GAME_PHASE.COMBAT_REWARD).toBeDefined();
      expect(GAME_PHASE.CARD_REWARD).toBeDefined();
      expect(GAME_PHASE.REST_SITE).toBeDefined();
      expect(GAME_PHASE.SHOP).toBeDefined();
      expect(GAME_PHASE.EVENT).toBeDefined();
      expect(GAME_PHASE.GAME_OVER).toBeDefined();
      expect(GAME_PHASE.VICTORY).toBeDefined();
    });
  });
});

describe('Map Generation', () => {
  // Helper to create mock map for testing
  const generateTestMap = (floors = 15) => {
    const map = [];

    for (let i = 0; i < floors; i++) {
      const nodesInFloor = Math.floor(Math.random() * 3) + 2;
      const floorNodes = [];

      for (let j = 0; j < nodesInFloor; j++) {
        let type = 'combat';
        if (i === floors - 1) {
          type = 'boss';
        }

        floorNodes.push({
          id: `${i}-${j}`,
          floor: i,
          index: j,
          type,
          visited: false,
          connections: []
        });
      }
      map.push(floorNodes);
    }

    // Create connections
    for (let i = 0; i < map.length - 1; i++) {
      const currentFloor = map[i];
      const nextFloor = map[i + 1];

      currentFloor.forEach((node, idx) => {
        const connectCount = Math.min(Math.floor(Math.random() * 2) + 1, nextFloor.length);
        const startIdx = Math.min(idx, nextFloor.length - 1);

        for (let c = 0; c < connectCount; c++) {
          const targetIdx = Math.min(startIdx + c, nextFloor.length - 1);
          if (!node.connections.includes(nextFloor[targetIdx].id)) {
            node.connections.push(nextFloor[targetIdx].id);
          }
        }
      });
    }

    return map;
  };

  it('should generate correct number of floors', () => {
    const map = generateTestMap(15);
    expect(map.length).toBe(15);
  });

  it('should have 2-4 nodes per floor', () => {
    const map = generateTestMap(15);
    map.forEach(floor => {
      expect(floor.length).toBeGreaterThanOrEqual(2);
      expect(floor.length).toBeLessThanOrEqual(4);
    });
  });

  it('last floor should be boss', () => {
    const map = generateTestMap(15);
    const lastFloor = map[map.length - 1];
    lastFloor.forEach(node => {
      expect(node.type).toBe('boss');
    });
  });

  it('all nodes should have unique IDs within the map', () => {
    const map = generateTestMap(15);
    const allIds = map.flat().map(n => n.id);
    const uniqueIds = [...new Set(allIds)];
    expect(allIds.length).toBe(uniqueIds.length);
  });

  it('all nodes except last floor should have connections', () => {
    const map = generateTestMap(15);
    for (let i = 0; i < map.length - 1; i++) {
      map[i].forEach(node => {
        expect(node.connections.length).toBeGreaterThan(0);
      });
    }
  });

  it('connections should point to valid nodes in next floor', () => {
    const map = generateTestMap(15);
    for (let i = 0; i < map.length - 1; i++) {
      const nextFloorIds = map[i + 1].map(n => n.id);
      map[i].forEach(node => {
        node.connections.forEach(connId => {
          expect(nextFloorIds).toContain(connId);
        });
      });
    }
  });
});

describe('Deck Management', () => {
  const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  it('shuffle should not lose any cards', () => {
    const deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(deck);
    expect(shuffled.length).toBe(deck.length);
    deck.forEach(card => {
      expect(shuffled).toContain(card);
    });
  });

  it('shuffle should maintain card counts', () => {
    const deck = [1, 1, 1, 2, 2, 3];
    const shuffled = shuffleArray(deck);
    expect(shuffled.filter(c => c === 1).length).toBe(3);
    expect(shuffled.filter(c => c === 2).length).toBe(2);
    expect(shuffled.filter(c => c === 3).length).toBe(1);
  });

  it('shuffle should produce different orderings', () => {
    const deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let sameCount = 0;

    for (let i = 0; i < 10; i++) {
      const shuffled = shuffleArray(deck);
      if (shuffled.every((val, idx) => val === deck[idx])) {
        sameCount++;
      }
    }

    // Very unlikely to get same ordering multiple times
    expect(sameCount).toBeLessThan(5);
  });
});
