import { useGame } from '../context/GameContext';

// Node type configurations
const NODE_CONFIG = {
  combat: { icon: '\u2694\uFE0F', color: '#AA4444', glow: 'rgba(170, 68, 68, 0.5)', label: 'Enemy' },
  elite: { icon: '\uD83D\uDC51', color: '#FFD700', glow: 'rgba(255, 215, 0, 0.5)', label: 'Elite' },
  rest: { icon: '\uD83D\uDD25', color: '#44AA44', glow: 'rgba(68, 170, 68, 0.5)', label: 'Rest' },
  shop: { icon: '\uD83C\uDFEA', color: '#44AAAA', glow: 'rgba(68, 170, 170, 0.5)', label: 'Shop' },
  event: { icon: '?', color: '#AA44AA', glow: 'rgba(170, 68, 170, 0.5)', label: 'Event' },
  boss: { icon: '\uD83D\uDC09', color: '#FF0000', glow: 'rgba(255, 0, 0, 0.6)', label: 'Boss' }
};

const MapScreen = () => {
  const { state, selectNode } = useGame();
  const { map, currentFloor, deck } = state;

  const isNodeAccessible = (node) => {
    // Before first move: only floor 0 nodes are accessible
    if (currentFloor === -1) {
      return node.floor === 0;
    }

    // After visiting a node: only nodes on the NEXT floor that are
    // connected from the visited node on the current floor are accessible
    if (node.floor !== currentFloor + 1) {
      return false;
    }

    const currentNodes = map[currentFloor];
    const visitedNode = currentNodes.find(n => n.visited);
    if (visitedNode) {
      return visitedNode.connections.includes(node.id);
    }
    return false;
  };

  // Check if a connection should be highlighted (from visited node to accessible node)
  const isConnectionAccessible = (fromNode, toNodeId) => {
    // Only highlight connections from the visited node on the current floor
    if (fromNode.floor !== currentFloor) {
      return false;
    }
    if (!fromNode.visited) {
      return false;
    }
    // Check if target node is accessible
    const toNode = map.flat().find(n => n.id === toNodeId);
    return toNode && isNodeAccessible(toNode);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
      paddingTop: '90px'
    }}>
      {/* Map Title with deck info */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 40, 0.6) 100%)',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          <span style={{ color: '#aaa' }}>Choose Your Path</span>
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '5px 10px',
          borderRadius: '15px',
          border: '1px solid #333'
        }}>
          <span style={{ fontSize: '14px' }}>{'\uD83C\uDCCF'}</span>
          <span style={{ color: '#AAAAFF', fontSize: '13px', fontWeight: 'bold' }}>{deck.length} cards</span>
        </div>
      </div>

      {/* Map Container */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '15px 10px',
          display: 'flex',
          flexDirection: 'column-reverse',
          background: 'radial-gradient(ellipse at center, rgba(50, 50, 80, 0.15) 0%, transparent 70%)',
          position: 'relative'
        }}
      >
        {/* Map Nodes with inline path rendering */}
        {map.map((floor, floorIdx) => (
          <div
            key={floorIdx}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '25px',
              padding: '20px 0',
              position: 'relative'
            }}
          >
            {/* Floor indicator */}
            <div style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              color: currentFloor + 1 === floorIdx ? '#FFD700' : '#444',
              fontWeight: 'bold',
              width: '20px',
              textAlign: 'center'
            }}>
              {floorIdx + 1}
            </div>

            {floor.map((node, nodeIdx) => {
              const accessible = isNodeAccessible(node);
              const config = NODE_CONFIG[node.type] || NODE_CONFIG.combat;
              const isBoss = node.type === 'boss';

              // Calculate connection lines to next floor
              const nextFloor = map[floorIdx + 1];
              const connections = node.connections.map(connId => {
                if (!nextFloor) return null;
                const targetIdx = nextFloor.findIndex(n => n.id === connId);
                if (targetIdx === -1) return null;

                const targetNode = nextFloor[targetIdx];
                const targetConfig = NODE_CONFIG[targetNode.type] || NODE_CONFIG.combat;
                const isConnAccessible = isConnectionAccessible(node, connId);

                // Calculate horizontal offset
                const currentNodesCount = floor.length;
                const nextNodesCount = nextFloor.length;
                const currentOffset = nodeIdx - (currentNodesCount - 1) / 2;
                const targetOffset = targetIdx - (nextNodesCount - 1) / 2;
                const horizontalShift = (targetOffset - currentOffset) * 80; // 80px per node gap

                // Calculate the actual line length needed (hypotenuse)
                const verticalDistance = 60; // Approximate vertical distance between node centers
                const lineLength = Math.sqrt(verticalDistance * verticalDistance + horizontalShift * horizontalShift);
                const angle = Math.atan2(horizontalShift, verticalDistance) * (180 / Math.PI);

                return {
                  id: connId,
                  horizontalShift,
                  lineLength,
                  angle,
                  isAccessible: isConnAccessible,
                  // A path is "visited" only if BOTH the from and to nodes are visited
                  isVisited: node.visited && targetNode.visited,
                  fromColor: config.color,
                  toColor: targetConfig.color
                };
              }).filter(Boolean);

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* Connection lines going UP to next floor */}
                  {connections.map((conn, _connIdx) => (
                    <div
                      key={`conn-${conn.id}`}
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        width: conn.isAccessible ? '4px' : '2px',
                        height: `${conn.lineLength}px`,
                        marginBottom: '-5px',
                        background: conn.isVisited
                          ? 'linear-gradient(180deg, #444 0%, #333 100%)'
                          : conn.isAccessible
                            ? `linear-gradient(180deg, ${conn.toColor} 0%, ${conn.fromColor} 100%)`
                            : `linear-gradient(180deg, ${conn.toColor}66 0%, ${conn.fromColor}44 100%)`,
                        transform: `translateX(-50%) rotate(${conn.angle}deg)`,
                        transformOrigin: 'bottom center',
                        borderRadius: '2px',
                        boxShadow: conn.isAccessible
                          ? `0 0 10px ${conn.toColor}, 0 0 20px ${conn.toColor}66`
                          : 'none',
                        opacity: conn.isVisited ? 0.4 : 1,
                        zIndex: 0
                      }}
                    >
                      {/* Animated glow for accessible paths */}
                      {conn.isAccessible && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: '-3px',
                          right: '-3px',
                          bottom: 0,
                          background: `linear-gradient(180deg, ${conn.toColor}44 0%, transparent 100%)`,
                          borderRadius: '4px',
                          animation: 'pathGlow 2s ease-in-out infinite'
                        }} />
                      )}
                    </div>
                  ))}

                  {/* Node circle */}
                  <div
                    onClick={() => accessible && selectNode(node.id)}
                    style={{
                      width: isBoss ? '65px' : '55px',
                      height: isBoss ? '65px' : '55px',
                      background: node.visited
                        ? 'linear-gradient(180deg, #333 0%, #222 100%)'
                        : `linear-gradient(180deg, ${config.color}88 0%, ${config.color}44 100%)`,
                      borderRadius: isBoss ? '12px' : '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isBoss ? '28px' : '22px',
                      cursor: accessible ? 'pointer' : 'default',
                      opacity: accessible ? 1 : node.visited ? 0.4 : 0.6,
                      border: accessible
                        ? '3px solid #FFD700'
                        : node.visited
                          ? '2px solid #444'
                          : `2px solid ${config.color}`,
                      boxShadow: accessible
                        ? `0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.2)`
                        : node.visited
                          ? 'none'
                          : `0 0 15px ${config.glow}`,
                      transform: accessible ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      touchAction: 'manipulation',
                      position: 'relative',
                      zIndex: 2,
                      animation: accessible ? 'glowPulse 1.5s ease-in-out infinite' : 'none'
                    }}
                  >
                    {/* Node icon */}
                    <span style={{
                      filter: node.visited ? 'grayscale(1) opacity(0.5)' : 'none',
                      textShadow: node.visited ? 'none' : `0 0 10px ${config.color}`
                    }}>
                      {config.icon}
                    </span>

                    {/* Accessible indicator ring */}
                    {accessible && (
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '-6px',
                        right: '-6px',
                        bottom: '-6px',
                        borderRadius: isBoss ? '16px' : '50%',
                        border: '2px solid transparent',
                        borderTopColor: '#FFD700',
                        animation: 'spin 1.5s linear infinite'
                      }} />
                    )}
                  </div>

                  {/* Node type label */}
                  <div style={{
                    marginTop: '5px',
                    fontSize: '9px',
                    color: accessible ? config.color : node.visited ? '#444' : config.color + '88',
                    fontWeight: 'bold',
                    textShadow: accessible ? `0 0 5px ${config.color}` : '0 1px 2px rgba(0, 0, 0, 0.8)'
                  }}>
                    {config.label}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        padding: '10px 15px',
        background: 'linear-gradient(180deg, rgba(20, 20, 30, 0.98) 0%, rgba(15, 15, 20, 1) 100%)',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '11px',
        flexWrap: 'wrap',
        borderTop: '1px solid #222'
      }}>
        {Object.entries(NODE_CONFIG).map(([type, config]) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{
              fontSize: '14px',
              filter: `drop-shadow(0 0 3px ${config.color})`
            }}>
              {config.icon}
            </span>
            <span style={{ color: config.color, fontWeight: '500' }}>
              {config.label}
            </span>
          </div>
        ))}
      </div>

      {/* Add keyframes via style tag */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pathGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MapScreen;
