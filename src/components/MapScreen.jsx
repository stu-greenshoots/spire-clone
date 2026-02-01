import { useGame } from '../context/GameContext';
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import DeckViewer from './DeckViewer';
import { getBackgroundImage } from '../assets/art/art-config';

// Hook to track viewport width for responsive layout
const useViewportWidth = () => {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

// SVG icon paths for each node type
const NODE_ICONS = {
  combat: {
    path: 'M7 2l3 3-1.5 1.5L10 8l-2-2-2 2-2-2 1.5-1.5L4 3l3-3zm0 3L5.5 3.5 6 4l1-1 1 1 .5-.5L7 5z M3 10l1-1 3 3 3-3 1 1-4 4-4-4z',
    viewBox: '0 0 14 14',
    color: '#AA4444',
    glow: 'rgba(170, 68, 68, 0.6)',
    label: 'Enemy'
  },
  elite: {
    path: 'M7 1l2 4h4l-3.2 2.5L11 12 7 9.5 3 12l1.2-4.5L1 5h4l2-4z',
    viewBox: '0 0 14 14',
    color: '#DAA520',
    glow: 'rgba(218, 165, 32, 0.6)',
    label: 'Elite'
  },
  rest: {
    path: 'M7 1C4.5 1 3 3 3 5c0 3 4 7 4 7s4-4 4-7c0-2-1.5-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
    viewBox: '0 0 14 14',
    color: '#44AA44',
    glow: 'rgba(68, 170, 68, 0.6)',
    label: 'Rest'
  },
  shop: {
    path: 'M2 3h10l-1 7H3L2 3zm1-2h8v2H3V1zm2 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm4 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
    viewBox: '0 0 14 14',
    color: '#44AAAA',
    glow: 'rgba(68, 170, 170, 0.6)',
    label: 'Shop'
  },
  event: {
    path: 'M7 1a1.5 1.5 0 00-1.5 1.5v4.25L3.6 8.4a1.5 1.5 0 102.1 2.1l1.3-1.3 1.3 1.3a1.5 1.5 0 102.1-2.1L8.5 6.75V2.5A1.5 1.5 0 007 1zm0 9.5a1 1 0 100 2 1 1 0 000-2z',
    viewBox: '0 0 14 14',
    color: '#AA44AA',
    glow: 'rgba(170, 68, 170, 0.6)',
    label: 'Event'
  },
  boss: {
    path: 'M7 0l2.5 3.5L13 5l-2.5 3L11 12H7h-4l.5-4L1 5l3.5-1.5L7 0zm0 4a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
    viewBox: '0 0 14 14',
    color: '#CC2222',
    glow: 'rgba(204, 34, 34, 0.7)',
    label: 'Boss'
  }
};

// Layout constants
const MAP_PADDING_X = 60;
const MAP_PADDING_TOP = 50;
const MAP_PADDING_BOTTOM = 30;
const NODE_RADIUS = 22;
const BOSS_RADIUS = 30;

const MapScreen = () => {
  const { state, selectNode } = useGame();
  const { map, currentFloor, deck, relics, act } = state;
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const lastKnownFloorRef = useRef(null);
  const [isDeckViewerOpen, setIsDeckViewerOpen] = useState(false);
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < 480;

  // Keyboard shortcut: 'D' key toggles deck viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'd' || e.key === 'D') {
        setIsDeckViewerOpen(prev => !prev);
      }
      // Escape closes deck viewer
      if (e.key === 'Escape' && isDeckViewerOpen) {
        setIsDeckViewerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeckViewerOpen]);

  const totalFloors = map.length;

  // Track scroll position for mini-map indicator and persistence
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      const position = container.scrollTop / maxScroll;
      setScrollPosition(position);
      // Save scroll position for restoration on return
      try {
        sessionStorage.setItem('mapScrollPosition', container.scrollTop.toString());
        sessionStorage.setItem('mapScrollFloor', currentFloor.toString());
      } catch {
        // sessionStorage not available
      }
    }
  }, [currentFloor]);

  // Calculate SVG dimensions and node positions
  const layout = useMemo(() => {
    // Responsive width: fit viewport on mobile, cap at 360 on desktop
    const width = isMobile ? Math.max(280, viewportWidth - 32) : 360;
    const floorHeight = 65;
    const height = MAP_PADDING_TOP + (totalFloors - 1) * floorHeight + MAP_PADDING_BOTTOM;

    const positions = {};

    map.forEach((floor, floorIdx) => {
      // Y position: bottom to top (floor 0 at bottom, boss at top)
      const y = height - MAP_PADDING_BOTTOM - floorIdx * floorHeight;

      floor.forEach((node, nodeIdx) => {
        const nodesInFloor = floor.length;
        const totalWidth = width - MAP_PADDING_X * 2;
        const spacing = nodesInFloor > 1 ? totalWidth / (nodesInFloor - 1) : 0;
        const x = nodesInFloor > 1
          ? MAP_PADDING_X + nodeIdx * spacing
          : width / 2;

        positions[node.id] = { x, y };
      });
    });

    return { width, height, positions };
  }, [map, totalFloors, isMobile, viewportWidth]);

  // Auto-scroll to current floor on mount and floor change
  // VP-04: Restore saved scroll position if returning to same floor
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if we should restore saved position (returning to same floor)
    try {
      const savedFloor = sessionStorage.getItem('mapScrollFloor');
      const savedScrollTop = sessionStorage.getItem('mapScrollPosition');

      if (savedFloor !== null && savedScrollTop !== null) {
        const savedFloorNum = parseInt(savedFloor, 10);

        // If returning to the same floor, restore scroll position
        if (savedFloorNum === currentFloor && lastKnownFloorRef.current === null) {
          containerRef.current.scrollTo({
            top: parseFloat(savedScrollTop),
            behavior: 'instant'
          });
          lastKnownFloorRef.current = currentFloor;
          return;
        }
      }
    } catch {
      // sessionStorage not available
    }

    // Otherwise, scroll to current floor (new floor or first visit)
    if (currentFloor >= 0 && currentFloor !== lastKnownFloorRef.current) {
      const floorY = layout.positions[map[currentFloor]?.[0]?.id]?.y;
      if (floorY) {
        containerRef.current.scrollTo({
          top: floorY - containerRef.current.clientHeight / 2,
          behavior: lastKnownFloorRef.current === null ? 'instant' : 'smooth'
        });
      }
      lastKnownFloorRef.current = currentFloor;
    }
  }, [currentFloor, layout.positions, map]);

  const isNodeAccessible = (node) => {
    if (currentFloor === -1) {
      return node.floor === 0;
    }
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

  // Check if a floor is "discovered" (visible through fog of war)
  const isFloorVisible = (floorIdx) => {
    // Always show: floor 0, current floor, adjacent floors, visited floors, boss
    if (floorIdx === 0) return true;
    if (floorIdx === totalFloors - 1) return true;
    if (floorIdx <= currentFloor + 2) return true;
    // Show if any node on this floor has been visited
    if (map[floorIdx].some(n => n.visited)) return true;
    return false;
  };

  // Build path data
  const paths = (() => {
    const result = [];
    map.forEach((floor, floorIdx) => {
      floor.forEach((node) => {
        node.connections.forEach((connId) => {
          const from = layout.positions[node.id];
          const to = layout.positions[connId];
          if (!from || !to) return;

          const targetNode = map.flat().find(n => n.id === connId);
          const isVisitedPath = node.visited && targetNode?.visited;
          const isAccessible = node.visited && node.floor === currentFloor && isNodeAccessible(targetNode);

          // Bezier curve control points for smooth paths
          const midY = (from.y + to.y) / 2;
          const dx = to.x - from.x;
          const cp1x = from.x + dx * 0.2;
          const cp2x = from.x + dx * 0.8;

          result.push({
            key: `${node.id}-${connId}`,
            d: `M ${from.x} ${from.y} C ${cp1x} ${midY}, ${cp2x} ${midY}, ${to.x} ${to.y}`,
            isVisited: isVisitedPath,
            isAccessible,
            floorIdx,
            fromColor: NODE_ICONS[node.type]?.color || '#666',
            toColor: NODE_ICONS[targetNode?.type]?.color || '#666',
            visible: isFloorVisible(floorIdx) && isFloorVisible(floorIdx + 1),
          });
        });
      });
    });
    return result;
  })();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
      background: act === 2 ? '#0a0f12' : act === 3 ? '#120a08' : act === 4 ? '#12080a' : '#0a0a12',
      paddingTop: isMobile ? '60px' : '90px',
      maxWidth: '100vw',
      position: 'relative'
    }}>
      {/* Act-specific background illustration */}
      {(() => {
        const actBg = getBackgroundImage(`act${act}`);
        return actBg ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${actBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            pointerEvents: 'none',
            zIndex: 0
          }} />
        ) : null;
      })()}
      {/* Map Header */}
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '6px 10px' : '10px 16px',
        background: 'linear-gradient(180deg, rgba(20, 18, 30, 0.95) 0%, rgba(12, 10, 20, 0.8) 100%)',
        borderBottom: '1px solid #2a2235',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? '10px' : '20px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#8a7a5a'
        }}>
          The Spire
        </h2>
        {/* Floor Position Indicator */}
        <div
          data-testid="floor-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid #2a2235'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M7 1L12 13H2L7 1z" fill="none" stroke="#DAA520" strokeWidth="1.5"/>
            <line x1="4" y1="10" x2="10" y2="10" stroke="#DAA520" strokeWidth="1" opacity="0.5"/>
            <line x1="5" y1="7" x2="9" y2="7" stroke="#DAA520" strokeWidth="1" opacity="0.5"/>
            <line x1="6" y1="4" x2="8" y2="4" stroke="#DAA520" strokeWidth="1" opacity="0.5"/>
          </svg>
          <span style={{ color: '#DAA520', fontSize: '12px', fontWeight: 'bold' }}>
            Floor {Math.max(1, currentFloor + 1)} of {totalFloors}
          </span>
        </div>
        <button
          onClick={() => setIsDeckViewerOpen(true)}
          data-testid="deck-viewer-button"
          title="View Deck (D)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid #2a2235',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(100, 100, 200, 0.2)';
            e.currentTarget.style.borderColor = '#4a4a8a';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.borderColor = '#2a2235';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <rect x="2" y="1" width="10" height="12" rx="1" fill="none" stroke="#6a6a8a" strokeWidth="1.5"/>
            <line x1="5" y1="4" x2="9" y2="4" stroke="#6a6a8a" strokeWidth="1"/>
            <line x1="5" y1="7" x2="9" y2="7" stroke="#6a6a8a" strokeWidth="1"/>
          </svg>
          <span style={{ color: '#8888bb', fontSize: '12px', fontWeight: 'bold' }}>{deck.length}</span>
        </button>
      </div>

      {/* SVG Map with Scroll Position Bar */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {/* Main Map Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            WebkitOverflowScrolling: 'touch'
          }}
        >
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{
            display: 'block',
            margin: '0 auto',
            minHeight: '100%'
          }}
        >
          {/* Background - Dark spire gradient */}
          <defs>
            <linearGradient id="spireGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={act === 2 ? '#0a2e1a' : act === 3 ? '#2e1a0a' : act === 4 ? '#2e0a0f' : '#1a0a2e'} />
              <stop offset="30%" stopColor={act === 2 ? '#0a1a12' : act === 3 ? '#1a120a' : act === 4 ? '#1a0a0f' : '#0f0a1a'} />
              <stop offset="70%" stopColor={act === 2 ? '#081208' : act === 3 ? '#12100a' : act === 4 ? '#120808' : '#0a0812'} />
              <stop offset="100%" stopColor={act === 2 ? '#0a0f12' : act === 3 ? '#120a08' : act === 4 ? '#12080a' : '#0a0a12'} />
            </linearGradient>
            <radialGradient id="fogGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="80%" stopColor="rgba(10, 10, 18, 0.7)" />
              <stop offset="100%" stopColor="rgba(10, 10, 18, 0.95)" />
            </radialGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Animated dash pattern for accessible paths */}
            <pattern id="accessibleDash" patternUnits="userSpaceOnUse" width="12" height="1">
              <rect width="8" height="1" fill="#FFD700" opacity="0.8"/>
            </pattern>
          </defs>

          <rect width={layout.width} height={layout.height} fill="url(#spireGradient)" />

          {/* Spire structure background lines */}
          <g opacity="0.08">
            {/* Central spire pillar */}
            <line x1={layout.width/2} y1="30" x2={layout.width/2} y2={layout.height - 20}
              stroke="#4a3a6a" strokeWidth="1" strokeDasharray="4 8" />
            {/* Side pillars */}
            <line x1={layout.width * 0.25} y1="100" x2={layout.width * 0.35} y2={layout.height - 20}
              stroke="#3a2a5a" strokeWidth="0.5" strokeDasharray="2 12" />
            <line x1={layout.width * 0.75} y1="100" x2={layout.width * 0.65} y2={layout.height - 20}
              stroke="#3a2a5a" strokeWidth="0.5" strokeDasharray="2 12" />
          </g>

          {/* Connection paths */}
          <g>
            {paths.map((p) => {
              if (!p.visible) return null;

              const strokeColor = p.isVisited
                ? '#2a2a3a'
                : p.isAccessible
                  ? '#FFD700'
                  : '#3a3a4a';

              const strokeWidth = p.isAccessible ? 3 : p.isVisited ? 1.5 : 1.5;
              const opacity = p.isVisited ? 0.4 : p.isAccessible ? 1 : 0.5;

              return (
                <g key={p.key}>
                  {/* Path glow for accessible */}
                  {p.isAccessible && (
                    <path
                      d={p.d}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="8"
                      opacity="0.15"
                      strokeLinecap="round"
                    />
                  )}
                  <path
                    d={p.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    strokeLinecap="round"
                    strokeDasharray={p.isAccessible ? '6 4' : 'none'}
                  >
                    {p.isAccessible && (
                      <animate
                        attributeName="stroke-dashoffset"
                        values="20;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </path>
                </g>
              );
            })}
          </g>

          {/* Fog of war overlay for hidden floors */}
          {map.map((floor, floorIdx) => {
            if (isFloorVisible(floorIdx)) return null;
            const y = layout.positions[floor[0]?.id]?.y;
            if (!y) return null;

            return (
              <rect
                key={`fog-${floorIdx}`}
                x="0"
                y={y - 35}
                width={layout.width}
                height="70"
                fill="rgba(10, 10, 18, 0.85)"
                style={{ pointerEvents: 'none' }}
              />
            );
          })}

          {/* Map nodes */}
          {map.map((floor, floorIdx) => {
            const visible = isFloorVisible(floorIdx);

            return floor.map((node) => {
              const pos = layout.positions[node.id];
              if (!pos) return null;

              const accessible = isNodeAccessible(node);
              const config = NODE_ICONS[node.type] || NODE_ICONS.combat;
              const isBoss = node.type === 'boss';
              const radius = isBoss ? BOSS_RADIUS : NODE_RADIUS;

              // Fog: dim undiscovered nodes
              const nodeOpacity = !visible ? 0.15 : accessible ? 1 : node.visited ? 0.35 : 0.7;

              return (
                <g
                  key={node.id}
                  data-testid={`map-node-${node.id}`}
                  role={accessible ? 'button' : undefined}
                  tabIndex={accessible ? 0 : undefined}
                  aria-label={`${node.type} node${accessible ? ', available' : node.visited ? ', visited' : ''}`}
                  onClick={() => accessible && selectNode(node.id)}
                  onKeyDown={(e) => { if (accessible && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectNode(node.id); } }}
                  style={{ cursor: accessible ? 'pointer' : 'default' }}
                  opacity={nodeOpacity}
                >
                  {/* Accessible pulse ring */}
                  {accessible && (
                    <>
                      <circle cx={pos.x} cy={pos.y} r={radius + 8} fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.5">
                        <animate attributeName="r" values={`${radius + 5};${radius + 12};${radius + 5}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* Node glow */}
                  {!node.visited && (
                    <circle cx={pos.x} cy={pos.y} r={radius + 4}
                      fill={config.color} opacity={accessible ? 0.2 : 0.08}
                      filter={accessible ? 'url(#strongGlow)' : 'url(#glowFilter)'}
                    />
                  )}

                  {/* Node background circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={node.visited
                      ? '#1a1a22'
                      : `${config.color}22`
                    }
                    stroke={accessible
                      ? '#FFD700'
                      : node.visited
                        ? '#333340'
                        : config.color
                    }
                    strokeWidth={accessible ? 3 : 2}
                    opacity={1}
                  />

                  {/* Inner darker circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius - 4}
                    fill={node.visited ? '#111118' : '#0a0a14'}
                    opacity="0.8"
                  />

                  {/* Node icon */}
                  <g transform={`translate(${pos.x - 8}, ${pos.y - 8}) scale(${isBoss ? 1.4 : 1.15})`}
                    opacity={node.visited ? 0.3 : 1}
                  >
                    <path
                      d={config.path}
                      fill={node.visited ? '#444' : config.color}
                      filter={accessible ? 'url(#glowFilter)' : 'none'}
                    />
                  </g>

                  {/* Visited checkmark overlay */}
                  {node.visited && !accessible && (
                    <g transform={`translate(${pos.x + radius * 0.35}, ${pos.y - radius * 0.35})`}>
                      <circle cx="0" cy="0" r="7" fill="#1a1a22" stroke="#333340" strokeWidth="1.5" />
                      <path d="M-3 0.5L-1 3L3.5-2" fill="none" stroke="#4a4a6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}

                  {/* Node type label */}
                  <text
                    x={pos.x}
                    y={pos.y + radius + 14}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={accessible ? config.color : node.visited ? '#333' : `${config.color}88`}
                    fontFamily="system-ui, sans-serif"
                  >
                    {config.label}
                  </text>

                  {/* Floor number (left side, only for first node) */}
                  {node.index === 0 && (
                    <text
                      x="16"
                      y={pos.y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={currentFloor + 1 === floorIdx ? '#DAA520' : '#2a2a3a'}
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {floorIdx + 1}
                    </text>
                  )}
                </g>
              );
            });
          })}
        </svg>
        </div>

        {/* Scroll Position Bar / Mini-map — hidden on mobile to save space */}
        <div
          data-testid="scroll-position-bar"
          style={{
            width: '24px',
            background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0812 100%)',
            borderLeft: '1px solid #2a2235',
            display: isMobile ? 'none' : 'flex',
            flexDirection: 'column',
            padding: '8px 4px',
            position: 'relative'
          }}
        >
          {/* Mini tower representation */}
          <div style={{
            flex: 1,
            background: 'rgba(40, 30, 60, 0.3)',
            borderRadius: '4px',
            position: 'relative',
            minHeight: '100px'
          }}>
            {/* Floor markers */}
            {Array.from({ length: totalFloors }, (_, i) => {
              const floorProgress = 1 - (i / (totalFloors - 1));
              const isCurrentFloor = i === Math.max(0, currentFloor);
              const isVisited = i <= currentFloor;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '2px',
                    right: '2px',
                    top: `${floorProgress * 100}%`,
                    height: '2px',
                    background: isCurrentFloor ? '#DAA520' : isVisited ? '#4a4a6a' : '#2a2a3a',
                    borderRadius: '1px',
                    transform: 'translateY(-1px)',
                    boxShadow: isCurrentFloor ? '0 0 4px #DAA520' : 'none'
                  }}
                />
              );
            })}

            {/* Current view position indicator */}
            <div
              style={{
                position: 'absolute',
                left: '-2px',
                right: '-2px',
                top: `${scrollPosition * 100}%`,
                height: '20px',
                background: 'rgba(218, 165, 32, 0.2)',
                border: '1px solid rgba(218, 165, 32, 0.5)',
                borderRadius: '3px',
                transform: 'translateY(-10px)',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Boss icon at top */}
          <div style={{
            textAlign: 'center',
            marginBottom: '4px',
            color: '#CC2222',
            fontSize: '10px'
          }}>
            <svg width="12" height="12" viewBox="0 0 14 14">
              <path d={NODE_ICONS.boss.path} fill="#CC2222" />
            </svg>
          </div>

          {/* Start label at bottom */}
          <div style={{
            textAlign: 'center',
            marginTop: '4px',
            color: '#44AA44',
            fontSize: '8px',
            fontWeight: 'bold'
          }}>
            START
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: isMobile ? '6px 8px' : '8px 12px',
        background: 'linear-gradient(180deg, rgba(15, 12, 25, 0.98) 0%, rgba(10, 8, 18, 1) 100%)',
        display: 'flex',
        justifyContent: 'center',
        gap: isMobile ? '8px' : '16px',
        fontSize: isMobile ? '9px' : '10px',
        flexWrap: 'wrap',
        borderTop: '1px solid #1a1525'
      }}>
        {Object.entries(NODE_ICONS).map(([type, config]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox={config.viewBox}>
              <path d={config.path} fill={config.color} />
            </svg>
            <span style={{ color: config.color, fontWeight: '500', letterSpacing: '0.5px' }}>
              {config.label}
            </span>
          </div>
        ))}
      </div>

      {/* Deck Viewer Modal */}
      {isDeckViewerOpen && (
        <DeckViewer
          deck={deck}
          relics={relics}
          onClose={() => setIsDeckViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default MapScreen;
