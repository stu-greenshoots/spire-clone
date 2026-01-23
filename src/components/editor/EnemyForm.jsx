import { INTENT } from '../../data/enemies';
import { AI_PATTERNS } from '../../systems/customDataManager';

const ENEMY_TYPES = ['normal', 'elite', 'boss'];

const INTENT_OPTIONS = Object.entries(INTENT).map(([k, v]) => ({ label: k, value: v }));

const AI_PATTERN_OPTIONS = Object.keys(AI_PATTERNS);

const SPECIAL_TYPES = [
  '', 'addSlimed', 'splitMedium', 'splitBoss', 'stealGold', 'escape',
  'addDazed', 'addHex', 'gainFlight', 'addStab', 'buffGremlins', 'summonGremlins',
  'addParasite', 'count', 'summonDaggers', 'killSelf', 'addBurn', 'addBurns',
  'modeShift', 'activate', 'divider', 'upgradeBurn', 'removeDebuffs',
  'rebirth', 'bloodShots', 'addStatus', 'beatOfDeath'
];

const EFFECT_TYPES = [
  'vulnerable', 'weak', 'frail', 'strength', 'dexterity', 'artifact',
  'ritual', 'metallicize', 'thorns', 'platedArmor', 'regen', 'intangible',
  'enrage', 'entangle', 'strengthDown', 'dexterityDown', 'drawReduction'
];

const EnemyForm = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateHp = (field, value) => {
    const hp = { ...(data.hp || { min: 10, max: 20 }), [field]: value };
    update('hp', hp);
  };

  // Moveset management
  const addMove = () => {
    const moveset = [...(data.moveset || []), {
      id: `move_${(data.moveset || []).length + 1}`,
      intent: INTENT.ATTACK,
      damage: 6,
      message: 'Attack'
    }];
    update('moveset', moveset);
  };

  const removeMove = (index) => {
    const moveset = [...(data.moveset || [])];
    moveset.splice(index, 1);
    update('moveset', moveset);
  };

  const updateMove = (index, field, value) => {
    const moveset = [...(data.moveset || [])];
    moveset[index] = { ...moveset[index], [field]: value };
    update('moveset', moveset);
  };

  const addMoveEffect = (moveIndex) => {
    const moveset = [...(data.moveset || [])];
    const move = { ...moveset[moveIndex] };
    move.effects = [...(move.effects || []), { type: 'strength', amount: 2 }];
    moveset[moveIndex] = move;
    update('moveset', moveset);
  };

  const removeMoveEffect = (moveIndex, effIndex) => {
    const moveset = [...(data.moveset || [])];
    const move = { ...moveset[moveIndex] };
    move.effects = [...(move.effects || [])];
    move.effects.splice(effIndex, 1);
    moveset[moveIndex] = move;
    update('moveset', moveset);
  };

  const updateMoveEffect = (moveIndex, effIndex, field, value) => {
    const moveset = [...(data.moveset || [])];
    const move = { ...moveset[moveIndex] };
    move.effects = [...(move.effects || [])];
    move.effects[effIndex] = { ...move.effects[effIndex], [field]: value };
    moveset[moveIndex] = move;
    update('moveset', moveset);
  };

  return (
    <div style={styles.form}>
      <Section title="Core">
        <Row>
          <Field label="ID">
            <input style={styles.input} value={data.id || ''} onChange={e => update('id', e.target.value)} />
          </Field>
          <Field label="Name">
            <input style={styles.input} value={data.name || ''} onChange={e => update('name', e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field label="Type">
            <select style={styles.select} value={data.type || 'normal'} onChange={e => update('type', e.target.value)}>
              {ENEMY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Act">
            <select style={styles.select} value={data.act || 1} onChange={e => update('act', Number(e.target.value))}>
              {[1, 2, 3, 4].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Emoji">
            <input style={styles.inputSmall} value={data.emoji || ''} onChange={e => update('emoji', e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field label="HP Min">
            <input type="number" style={styles.inputSmall} value={data.hp?.min ?? 10} onChange={e => updateHp('min', Number(e.target.value))} />
          </Field>
          <Field label="HP Max">
            <input type="number" style={styles.inputSmall} value={data.hp?.max ?? 20} onChange={e => updateHp('max', Number(e.target.value))} />
          </Field>
        </Row>
      </Section>

      <Section title="AI Pattern">
        <Field label="Pattern">
          <select style={styles.select} value={data.aiPattern || ''} onChange={e => update('aiPattern', e.target.value || undefined)}>
            <option value="">(keep original)</option>
            {AI_PATTERN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <div style={styles.patternDesc}>
          {data.aiPattern === 'sequential' && 'Cycles through moves in order'}
          {data.aiPattern === 'random' && 'Picks a random move each turn'}
          {data.aiPattern === 'firstThenRandom' && 'First move is always moveset[0], then random'}
          {data.aiPattern === 'weighted' && 'Earlier moves have higher weight, avoids repeats'}
          {data.aiPattern === 'phaseShift' && 'First half of moves for 3 turns, then second half'}
        </div>
      </Section>

      <Section title="Moveset">
        {(data.moveset || []).map((move, i) => (
          <div key={i} style={styles.moveBox}>
            <div style={styles.moveHeader}>
              <span style={styles.moveLabel}>Move {i + 1}</span>
              <button onClick={() => removeMove(i)} style={styles.removeBtn}>X</button>
            </div>
            <Row>
              <Field label="ID">
                <input style={styles.input} value={move.id || ''} onChange={e => updateMove(i, 'id', e.target.value)} />
              </Field>
              <Field label="Message">
                <input style={styles.input} value={move.message || ''} onChange={e => updateMove(i, 'message', e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label="Intent">
                <select style={styles.select} value={move.intent || ''} onChange={e => updateMove(i, 'intent', e.target.value)}>
                  {INTENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Damage">
                <input type="number" style={styles.inputSmall} value={move.damage ?? ''} onChange={e => updateMove(i, 'damage', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
              <Field label="Times">
                <input type="number" style={styles.inputSmall} value={move.times ?? ''} onChange={e => updateMove(i, 'times', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
            </Row>
            <Row>
              <Field label="Block">
                <input type="number" style={styles.inputSmall} value={move.block ?? ''} onChange={e => updateMove(i, 'block', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
              <Field label="Special">
                <select style={styles.select} value={move.special || ''} onChange={e => updateMove(i, 'special', e.target.value || undefined)}>
                  {SPECIAL_TYPES.map(s => <option key={s} value={s}>{s || '(none)'}</option>)}
                </select>
              </Field>
            </Row>

            {/* Move effects */}
            <div style={styles.moveEffects}>
              <label style={styles.label}>Effects:</label>
              {(move.effects || []).map((eff, j) => (
                <Row key={j}>
                  <Field label="Type">
                    <select style={styles.select} value={eff.type || ''} onChange={e => updateMoveEffect(i, j, 'type', e.target.value)}>
                      {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Amount">
                    <input type="number" style={styles.inputSmall} value={eff.amount ?? 0} onChange={e => updateMoveEffect(i, j, 'amount', Number(e.target.value))} />
                  </Field>
                  <button onClick={() => removeMoveEffect(i, j)} style={styles.removeBtn}>X</button>
                </Row>
              ))}
              <button onClick={() => addMoveEffect(i)} style={styles.addBtnSmall}>+ Effect</button>
            </div>
          </div>
        ))}
        <button onClick={addMove} style={styles.addBtn}>+ Add Move</button>
      </Section>

      <Section title="Optional Stats">
        <Row>
          <Field label="Metallicize">
            <input type="number" style={styles.inputSmall} value={data.metallicize ?? ''} onChange={e => update('metallicize', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Artifact">
            <input type="number" style={styles.inputSmall} value={data.artifact ?? ''} onChange={e => update('artifact', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Thorns">
            <input type="number" style={styles.inputSmall} value={data.thorns ?? ''} onChange={e => update('thorns', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
        </Row>
      </Section>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h4 style={styles.sectionTitle}>{title}</h4>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={styles.row}>{children}</div>
);

const Field = ({ label, children }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '4px' },
  section: {
    background: '#1e1e3a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px'
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    color: '#88aacc',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  row: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  field: { display: 'flex', flexDirection: 'column', gap: '3px', flex: '1 1 60px', minWidth: '60px' },
  label: { fontSize: '11px', color: '#999' },
  input: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box'
  },
  inputSmall: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box'
  },
  select: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    width: '100%',
    boxSizing: 'border-box'
  },
  moveBox: {
    background: '#181830',
    border: '1px solid #3a3a5a',
    borderRadius: '6px',
    padding: '10px',
    marginBottom: '10px'
  },
  moveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  moveLabel: {
    fontSize: '12px',
    color: '#aabbdd',
    fontWeight: 'bold'
  },
  moveEffects: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #333'
  },
  addBtn: {
    background: '#2a4a2a',
    color: '#8f8',
    border: '1px solid #4a6a4a',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '4px'
  },
  addBtnSmall: {
    background: '#2a3a4a',
    color: '#8cf',
    border: '1px solid #3a5a6a',
    padding: '3px 8px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
    marginTop: '4px'
  },
  removeBtn: {
    background: '#4a2a2a',
    color: '#f88',
    border: '1px solid #6a4a4a',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    alignSelf: 'flex-end'
  },
  patternDesc: {
    fontSize: '11px',
    color: '#888',
    fontStyle: 'italic',
    marginTop: '4px'
  }
};

export default EnemyForm;
