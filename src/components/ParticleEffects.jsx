import { useState, useEffect } from 'react';

const PARTICLE_CONFIGS = {
  fire: { count: 8, colors: ['#ff6b35', '#ff9f1c', '#ffba08'], size: [4, 8], lifetime: 600, spread: 30, direction: 'up' },
  poison: { count: 6, colors: ['#2ecc71', '#27ae60', '#1abc9c'], size: [3, 6], lifetime: 800, spread: 20, direction: 'down' },
  block: { count: 5, colors: ['#3498db', '#2980b9', '#85c1e9'], size: [5, 10], lifetime: 500, spread: 25, direction: 'up' },
  heal: { count: 6, colors: ['#2ecc71', '#58d68d', '#82e0aa'], size: [4, 7], lifetime: 700, spread: 20, direction: 'up' },
  death: { count: 12, colors: ['#e74c3c', '#c0392b', '#ff6b6b', '#333'], size: [5, 12], lifetime: 800, spread: 50, direction: 'radial' },
  power: { count: 8, colors: ['#f39c12', '#f1c40f', '#ffd700'], size: [4, 8], lifetime: 600, spread: 35, direction: 'radial' },
  strength: { count: 6, colors: ['#e74c3c', '#c0392b', '#ff4757'], size: [4, 8], lifetime: 500, spread: 20, direction: 'up' },
  exhaust: { count: 8, colors: ['#95a5a6', '#7f8c8d', '#bdc3c7', '#ff6b35'], size: [3, 7], lifetime: 700, spread: 30, direction: 'up' }
};

const Particle = ({ x, y, color, size, lifetime, dx, dy }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(0), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="particle" style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      opacity: opacity,
      transition: `all ${lifetime}ms ease-out`,
      transform: opacity === 0 ? `translate(${dx}px, ${dy}px) scale(0)` : 'translate(0, 0) scale(1)',
      pointerEvents: 'none',
      zIndex: 1000
    }} />
  );
};

const ParticleEffects = ({ effects }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!effects || effects.length === 0) return;

    const newParticles = [];
    effects.forEach(effect => {
      const config = PARTICLE_CONFIGS[effect.type];
      if (!config) return;

      for (let i = 0; i < config.count; i++) {
        const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const angle = config.direction === 'radial'
          ? (Math.PI * 2 * i / config.count)
          : config.direction === 'up'
            ? -Math.PI/2 + (Math.random() - 0.5) * 1.5
            : Math.PI/2 + (Math.random() - 0.5) * 1.5;
        const speed = config.spread + Math.random() * config.spread;

        newParticles.push({
          id: `${effect.type}_${Date.now()}_${i}`,
          x: effect.x || 0,
          y: effect.y || 0,
          color,
          size,
          lifetime: config.lifetime + Math.random() * 200,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed
        });
      }
    });

    setParticles(prev => [...prev, ...newParticles]);

    // Cleanup after longest lifetime
    const maxLifetime = Math.max(...newParticles.map(p => p.lifetime));
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, maxLifetime + 100);

    return () => clearTimeout(timer);
  }, [effects]);

  return (
    <div className="particle-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 999 }}>
      {particles.map(p => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
};

export default ParticleEffects;
