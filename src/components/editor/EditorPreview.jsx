import Card from '../Card';

const EditorPreview = ({ type, data }) => {
  if (type === 'Cards') return <CardPreview data={data} />;
  if (type === 'Relics') return <RelicPreview data={data} />;
  if (type === 'Enemies') return <EnemyPreview data={data} />;
  return null;
};

const CardPreview = ({ data }) => {
  const cardData = {
    ...data,
    instanceId: 'preview_' + (data.id || 'card')
  };

  return (
    <div style={styles.previewContainer}>
      <h4 style={styles.previewTitle}>Card Preview</h4>
      <div style={styles.cardWrapper}>
        <Card card={cardData} small={false} />
      </div>
      <div style={styles.statsBox}>
        <StatRow label="Type" value={data.type || '-'} />
        <StatRow label="Rarity" value={data.rarity || '-'} />
        <StatRow label="Cost" value={data.cost ?? '-'} />
        {data.damage != null && <StatRow label="Damage" value={data.damage} color="#ff6b6b" />}
        {data.block != null && <StatRow label="Block" value={data.block} color="#6baaff" />}
        {data.hits != null && <StatRow label="Hits" value={data.hits} />}
        {data.draw != null && <StatRow label="Draw" value={data.draw} color="#6bff6b" />}
        {data.effects && data.effects.length > 0 && (
          <StatRow label="Effects" value={data.effects.map(e => `${e.type} ${e.amount}`).join(', ')} />
        )}
        {data.special && <StatRow label="Special" value={data.special} color="#ffaa44" />}
      </div>
    </div>
  );
};

const RelicPreview = ({ data }) => {
  return (
    <div style={styles.previewContainer}>
      <h4 style={styles.previewTitle}>Relic Preview</h4>
      <div style={styles.relicCard}>
        <div style={styles.relicEmoji}>{data.emoji || '?'}</div>
        <div style={styles.relicName}>{data.name || 'Unnamed'}</div>
        <div style={styles.relicRarity}>{data.rarity || '-'}</div>
        <div style={styles.relicDesc}>{data.description || 'No description'}</div>
      </div>
      <div style={styles.statsBox}>
        <StatRow label="Trigger" value={data.trigger || '-'} color="#aaccff" />
        {data.effect && (
          <>
            <StatRow label="Effect" value={data.effect.type || '-'} color="#ffcc88" />
            {data.effect.amount != null && <StatRow label="Amount" value={data.effect.amount} />}
            {data.effect.threshold != null && <StatRow label="Threshold" value={data.effect.threshold} />}
          </>
        )}
      </div>
    </div>
  );
};

const EnemyPreview = ({ data }) => {
  const hpMin = data.hp?.min ?? 10;
  const hpMax = data.hp?.max ?? 20;
  const avgHp = Math.round((hpMin + hpMax) / 2);

  return (
    <div style={styles.previewContainer}>
      <h4 style={styles.previewTitle}>Enemy Preview</h4>
      <div style={styles.enemyCard}>
        <div style={styles.enemyEmoji}>{data.emoji || '?'}</div>
        <div style={styles.enemyName}>{data.name || 'Unnamed'}</div>
        <div style={styles.enemyType}>{data.type || 'normal'} - Act {data.act || 1}</div>
        <div style={styles.hpBar}>
          <div style={styles.hpBarFill} />
          <span style={styles.hpText}>{hpMin}-{hpMax} HP (avg {avgHp})</span>
        </div>
      </div>
      <div style={styles.statsBox}>
        <div style={styles.movesetTitle}>Moveset:</div>
        {(data.moveset || []).map((move, i) => (
          <div key={i} style={styles.movePreview}>
            <span style={styles.moveIntent}>{getIntentIcon(move.intent)}</span>
            <span style={styles.moveName}>{move.message || move.id}</span>
            {move.damage != null && <span style={styles.moveDmg}>{move.damage}{move.times ? `x${move.times}` : ''}</span>}
            {move.block != null && <span style={styles.moveBlk}>{move.block}B</span>}
          </div>
        ))}
        {data.aiPattern && <StatRow label="AI" value={data.aiPattern} color="#aaffcc" />}
      </div>
    </div>
  );
};

const getIntentIcon = (intent) => {
  const icons = {
    attack: '🗡️',
    attack_buff: '⚔️',
    attack_debuff: '☠️',
    attack_defend: '🛡️',
    buff: '💪',
    debuff: '💀',
    defend: '🛡️',
    defend_buff: '🔰',
    strong_debuff: '⚡',
    unknown: '❓',
    sleeping: '💤',
    stun: '💫'
  };
  return icons[intent] || '❓';
};

const StatRow = ({ label, value, color }) => (
  <div style={styles.statRow}>
    <span style={styles.statLabel}>{label}:</span>
    <span style={{ ...styles.statValue, color: color || '#ddd' }}>{value}</span>
  </div>
);

const styles = {
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  previewTitle: {
    margin: 0,
    fontSize: '13px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  cardWrapper: {
    transform: 'scale(0.85)',
    transformOrigin: 'top center'
  },
  statsBox: {
    width: '100%',
    background: '#1a1a30',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '10px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '3px 0',
    fontSize: '12px'
  },
  statLabel: { color: '#888' },
  statValue: { color: '#ddd', fontWeight: 'bold' },
  relicCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a30 100%)',
    border: '1px solid #4466aa',
    borderRadius: '10px',
    padding: '16px',
    width: '100%',
    boxSizing: 'border-box'
  },
  relicEmoji: { fontSize: '40px' },
  relicName: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  relicRarity: { fontSize: '11px', color: '#88aacc', textTransform: 'uppercase' },
  relicDesc: { fontSize: '12px', color: '#ccc', textAlign: 'center', lineHeight: '1.4' },
  enemyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(180deg, #2a1a1a 0%, #1a1010 100%)',
    border: '1px solid #aa4444',
    borderRadius: '10px',
    padding: '16px',
    width: '100%',
    boxSizing: 'border-box'
  },
  enemyEmoji: { fontSize: '50px' },
  enemyName: { fontSize: '16px', fontWeight: 'bold', color: '#ff9999' },
  enemyType: { fontSize: '11px', color: '#aa8888', textTransform: 'uppercase' },
  hpBar: {
    width: '100%',
    height: '18px',
    background: '#333',
    borderRadius: '9px',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '4px'
  },
  hpBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #cc3333, #ff4444)',
    borderRadius: '9px'
  },
  hpText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    color: '#fff',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
  },
  movesetTitle: {
    fontSize: '11px',
    color: '#888',
    marginBottom: '6px',
    textTransform: 'uppercase'
  },
  movePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 0',
    fontSize: '12px',
    borderBottom: '1px solid #2a2a3a'
  },
  moveIntent: { fontSize: '14px' },
  moveName: { flex: 1, color: '#ccc' },
  moveDmg: { color: '#ff8888', fontWeight: 'bold', fontSize: '11px' },
  moveBlk: { color: '#88aaff', fontWeight: 'bold', fontSize: '11px' }
};

export default EditorPreview;
