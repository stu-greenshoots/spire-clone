import { RELIC_RARITY } from '../../data/relics';

const TRIGGER_TYPES = [
  'onCombatStart', 'onCombatEnd', 'onTurnStart', 'onTurnEnd',
  'onAttackPlayed', 'onSkillPlayed', 'onStrikePlayed',
  'onFirstHpLoss', 'onFirstTurn', 'onHpLoss', 'onDamageTaken',
  'onDamageReceived', 'onDeath', 'onExhaust', 'onCardReward',
  'onRest', 'onPickup', 'passive'
];

const EFFECT_TYPES = [
  'block', 'heal', 'draw', 'energy', 'strength', 'dexterity', 'thorns',
  'vulnerable', 'doubleDamage', 'blockIfNone', 'strengthIfLowHp',
  'playCurses', 'drawSpecific', 'healPerCards', 'damageAll', 'healIfLowHp',
  'blockNextTurn', 'vulnerableBonus', 'reduceLowDamage', 'retainBlock',
  'addRandomCard', 'strengthPerCurse', 'strengthOption', 'conserveEnergy',
  'intangible', 'revive', 'healingBonus', 'maxHp', 'reduceHpLoss',
  'doubleEliteRelics', 'energyBonus', 'drawBonus', 'shopDiscount',
  'removeDebuffsIfAllTypes', 'damage', 'maxHpOption'
];

const RelicForm = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateEffect = (field, value) => {
    const effect = { ...(data.effect || {}), [field]: value };
    update('effect', effect);
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
          <Field label="Rarity">
            <select style={styles.select} value={data.rarity || ''} onChange={e => update('rarity', e.target.value)}>
              {Object.entries(RELIC_RARITY).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
            </select>
          </Field>
          <Field label="Emoji">
            <input style={styles.inputSmall} value={data.emoji || ''} onChange={e => update('emoji', e.target.value)} />
          </Field>
        </Row>
        <Field label="Description">
          <textarea
            style={styles.textarea}
            value={data.description || ''}
            onChange={e => update('description', e.target.value)}
            rows={3}
          />
        </Field>
      </Section>

      <Section title="Trigger">
        <Field label="Trigger Type">
          <select style={styles.select} value={data.trigger || ''} onChange={e => update('trigger', e.target.value)}>
            {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Effect">
        <Row>
          <Field label="Effect Type">
            <select style={styles.select} value={data.effect?.type || ''} onChange={e => updateEffect('type', e.target.value)}>
              <option value="">(none)</option>
              {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Amount">
            <input type="number" style={styles.inputSmall} value={data.effect?.amount ?? ''} onChange={e => updateEffect('amount', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
        </Row>
        <Row>
          <Field label="Threshold">
            <input type="number" step="0.1" style={styles.inputSmall} value={data.effect?.threshold ?? ''} onChange={e => updateEffect('threshold', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Counter">
            <input type="number" style={styles.inputSmall} value={data.effect?.counter ?? ''} onChange={e => updateEffect('counter', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
        </Row>
        {data.effect?.type === 'energyBonus' && (
          <Row>
            <Checkbox label="No Rest" checked={!!data.effect?.noRest} onChange={v => updateEffect('noRest', v || undefined)} />
            <Checkbox label="No Gold" checked={!!data.effect?.noGold} onChange={v => updateEffect('noGold', v || undefined)} />
            <Checkbox label="No Potions" checked={!!data.effect?.noPotions} onChange={v => updateEffect('noPotions', v || undefined)} />
            <Checkbox label="Hide Intents" checked={!!data.effect?.hideIntents} onChange={v => updateEffect('hideIntents', v || undefined)} />
            <Checkbox label="Curse on Chest" checked={!!data.effect?.curseOnChest} onChange={v => updateEffect('curseOnChest', v || undefined)} />
          </Row>
        )}
        {data.effect?.type === 'drawBonus' && (
          <Checkbox label="Confused" checked={!!data.effect?.confused} onChange={v => updateEffect('confused', v || undefined)} />
        )}
        {data.effect?.type === 'energyBonus' && (
          <Field label="Card Limit">
            <input type="number" style={styles.inputSmall} value={data.effect?.cardLimit ?? ''} onChange={e => updateEffect('cardLimit', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
        )}
        <Checkbox label="Target All" checked={!!data.effect?.targetAll} onChange={v => updateEffect('targetAll', v || undefined)} />
      </Section>

      <Section title="Flags">
        <Row>
          <Checkbox label="Used This Combat" checked={!!data.usedThisCombat} onChange={v => update('usedThisCombat', v)} />
          <Checkbox label="Reset On Turn End" checked={!!data.resetOnTurnEnd} onChange={v => update('resetOnTurnEnd', v || undefined)} />
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

const Checkbox = ({ label, checked, onChange }) => (
  <label style={styles.checkboxLabel}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
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
  textarea: {
    background: '#222244',
    border: '1px solid #444',
    color: '#eee',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '13px',
    width: '100%',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#ccc',
    cursor: 'pointer'
  }
};

export default RelicForm;
