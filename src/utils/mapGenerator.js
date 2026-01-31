/**
 * Map Generator Utilities
 * Generates procedural maps for the game
 */

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} arr - Array to shuffle
 * @returns {Array} - New shuffled array
 */
export const shuffleArray = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

/**
 * Act-specific node type distributions for regular floors (2-6, 8-12).
 * Each entry defines cumulative probability thresholds:
 * [combat, +elite, +rest, +shop, remainder=event]
 */
const ACT_DISTRIBUTIONS = {
  1: { combat: 0.50, elite: 0.65, rest: 0.77, shop: 0.88 },
  2: { combat: 0.45, elite: 0.62, rest: 0.74, shop: 0.86 },
  3: { combat: 0.40, elite: 0.62, rest: 0.72, shop: 0.84 },
};

/**
 * Generate a procedural map for the given act
 *
 * Map Rules:
 * - 15 floors total (0-14)
 * - Floor 0: Always 2-4 combat encounters (never elite/rest/shop)
 * - Floor 7 (middle): Guaranteed rest site
 * - Floor 13 (pre-boss): At least one rest site guaranteed
 * - Floor 14: Exactly one boss node
 * - All nodes must be reachable from floor 0
 * - Boss must be reachable
 *
 * Act-specific differences:
 * - Act 3: More elites (22% vs 15%), fewer rest sites, fewer combat-only floors
 *
 * @param {number} act - Current act number (1, 2, or 3)
 * @returns {Array} - 2D array of map nodes
 */
export const generateMap = (act) => {
  const floors = 15;
  const map = [];
  const dist = ACT_DISTRIBUTIONS[act] || ACT_DISTRIBUTIONS[1];

  // Generate nodes for each floor
  for (let i = 0; i < floors; i++) {
    // Boss floor: exactly 1 boss node
    if (i === floors - 1) {
      map.push([{
        id: `${i}-0`,
        floor: i,
        index: 0,
        type: 'boss',
        visited: false,
        connections: []
      }]);
      continue;
    }

    const nodesInFloor = Math.floor(Math.random() * 3) + 2; // 2-4 nodes
    const floorNodes = [];

    for (let j = 0; j < nodesInFloor; j++) {
      let type;

      if (i === 0) {
        // First floor: ALWAYS combat (never elite, rest, shop, or event)
        type = 'combat';
      } else if (i === Math.floor(floors / 2)) {
        // Middle floor (7): guaranteed rest site for all nodes
        type = 'rest';
      } else if (i === floors - 2) {
        // Pre-boss floor (13): ALL nodes are rest sites
        type = 'rest';
      } else if (i === 1) {
        // Second floor: no elites yet, mostly combat with some events
        const roll = Math.random();
        if (roll < 0.7) type = 'combat';
        else if (roll < 0.85) type = 'event';
        else type = 'shop';
      } else {
        // Regular floors (2-6, 8-12): use act-specific distribution
        const roll = Math.random();
        if (roll < dist.combat) type = 'combat';
        else if (roll < dist.elite) type = 'elite';
        else if (roll < dist.rest) type = 'rest';
        else if (roll < dist.shop) type = 'shop';
        else type = 'event';
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

  // Create connections between floors with better distribution
  for (let i = 0; i < map.length - 1; i++) {
    const currentFloor = map[i];
    const nextFloor = map[i + 1];

    currentFloor.forEach((node, idx) => {
      // Each node gets 1-2 connections
      const connectCount = Math.floor(Math.random() * 2) + 1;

      // Calculate proportional target position
      // Maps current position to equivalent position in next floor
      const ratio = currentFloor.length > 1
        ? idx / (currentFloor.length - 1)
        : 0.5;
      const baseTarget = Math.round(ratio * (nextFloor.length - 1));

      const targets = new Set();
      targets.add(baseTarget);

      // Add additional nearby connections for variety
      if (connectCount > 1 && nextFloor.length > 1) {
        // Try to add a connection to an adjacent node
        const possibleOffsets = [-1, 1];
        shuffleArray(possibleOffsets);

        for (const offset of possibleOffsets) {
          const newTarget = baseTarget + offset;
          if (newTarget >= 0 && newTarget < nextFloor.length) {
            targets.add(newTarget);
            break;
          }
        }
      }

      // Add connections
      targets.forEach(targetIdx => {
        const targetId = nextFloor[targetIdx].id;
        if (!node.connections.includes(targetId)) {
          node.connections.push(targetId);
        }
      });
    });
  }

  // Validate: ensure ALL nodes are reachable from floor 0
  const reachable = new Set();

  // Floor 0 nodes are all reachable (player can choose any starting path)
  map[0].forEach(node => reachable.add(node.id));

  // Propagate reachability through connections
  for (let i = 0; i < map.length - 1; i++) {
    map[i].forEach(node => {
      if (reachable.has(node.id)) {
        node.connections.forEach(connId => reachable.add(connId));
      }
    });
  }

  // Fix any unreachable nodes by adding connections from previous floor
  for (let i = 1; i < map.length; i++) {
    map[i].forEach(node => {
      if (!reachable.has(node.id)) {
        // Find reachable nodes on the previous floor
        const prevFloor = map[i - 1];
        const reachablePrev = prevFloor.filter(n => reachable.has(n.id));

        if (reachablePrev.length > 0) {
          // Connect from a random reachable node
          const connector = reachablePrev[Math.floor(Math.random() * reachablePrev.length)];
          connector.connections.push(node.id);
          reachable.add(node.id);

          // Also propagate this node's connections
          node.connections.forEach(connId => reachable.add(connId));
        }
      }
    });
  }

  // Final validation: ensure boss is reachable
  const bossNode = map[floors - 1][0];
  if (!reachable.has(bossNode.id)) {
    // Connect all pre-boss floor nodes to boss
    map[floors - 2].forEach(node => {
      if (!node.connections.includes(bossNode.id)) {
        node.connections.push(bossNode.id);
      }
    });
  }

  return map;
};
