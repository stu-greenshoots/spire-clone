import { CARD_TYPES, RARITY } from '../../data/cards';

const EFFECT_TYPES = [
  'vulnerable', 'weak', 'frail', 'strength', 'dexterity', 'artifact',
  'intangible', 'thorns', 'metallicize', 'platedArmor', 'regen',
  'draw', 'energy', 'heal'
];

const SPECIAL_TYPES = [
  '', 'addCopyToDiscard', 'discardToDrawTop', 'addWound', 'damageEqualBlock', 'onlyAttacks',
  'upgradeInHand', 'flexStrength', 'playTopCard', 'exhaustRandom', 'exhaustChoose',
  'handToDrawTop', 'gainEnergyOnExhaust', 'gainEnergyOnExhaust3', 'hpForEnergy',
  'bonusIfVulnerable', 'escalatingDamage', 'escalatingDamage8', 'addDaze', 'xCost',
  'multiUpgrade', 'bonusPerStrike', 'bonusPerStrike3', 'cantDraw', 'removeStrength',
  'copyCardInHand', 'doubleBlock', 'retaliateOnHit', 'addRandomAttack', 'addWounds', 'addWoundsToHand',
  'blockPerAttack', 'exhaustNonAttacksBlock', 'strIfAttacking', 'killForMaxHp',
  'exhaustHandDamage', 'addBurn', 'lifesteal', 'doubleNextAttack', 'doubleNextAttacks2',
  'retrieveExhausted', 'doubleStrength', 'retainAllBlock', 'selfVulnForEnergy',
  'hpForDraw', 'hpForAoeDamage', 'freeSkillsExhaust', 'drawOnExhaust',
  'strengthEachTurn', 'drawOnStatus', 'blockOnExhaust', 'aoeOnStatus',
  'damageOnBlock', 'metallicize', 'strengthOnSelfHpLoss',
  'severSoul', 'loseHpGainEnergy',
  'burnDamage', 'voidCard', 'painCurse', 'regretCurse', 'doubtCurse', 'decayCurse'
];

const CardForm = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateNested = (path, value) => {
    const newData = { ...data };
    const parts = path.split('.');
    let obj = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj[parts[i]] = { ...obj[parts[i]] };
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    onChange(newData);
  };

  const addEffect = () => {
    const effects = [...(data.effects || []), { type: 'vulnerable', amount: 1 }];
    update('effects', effects);
  };

  const removeEffect = (index) => {
    const effects = [...(data.effects || [])];
    effects.splice(index, 1);
    update('effects', effects);
  };

  const updateEffect = (index, field, value) => {
    const effects = [...(data.effects || [])];
    effects[index] = { ...effects[index], [field]: value };
    update('effects', effects);
  };

  const toggleUpgrade = () => {
    if (data.upgradedVersion) {
      update('upgradedVersion', undefined);
    } else {
      update('upgradedVersion', { description: '' });
    }
  };

  const updateUpgrade = (field, value) => {
    const uv = { ...(data.upgradedVersion || {}), [field]: value };
    update('upgradedVersion', uv);
  };

  const addUpgradeEffect = () => {
    const uv = { ...(data.upgradedVersion || {}) };
    uv.effects = [...(uv.effects || []), { type: 'vulnerable', amount: 1 }];
    update('upgradedVersion', uv);
  };

  const removeUpgradeEffect = (index) => {
    const uv = { ...(data.upgradedVersion || {}) };
    uv.effects = [...(uv.effects || [])];
    uv.effects.splice(index, 1);
    update('upgradedVersion', uv);
  };

  const updateUpgradeEffect = (index, field, value) => {
    const uv = { ...(data.upgradedVersion || {}) };
    uv.effects = [...(uv.effects || [])];
    uv.effects[index] = { ...uv.effects[index], [field]: value };
    update('upgradedVersion', uv);
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
            <select style={styles.select} value={data.type || ''} onChange={e => update('type', e.target.value)}>
              {Object.entries(CARD_TYPES).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
            </select>
          </Field>
          <Field label="Rarity">
            <select style={styles.select} value={data.rarity || ''} onChange={e => update('rarity', e.target.value)}>
              {Object.entries(RARITY).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
            </select>
          </Field>
          <Field label="Cost">
            <input type="number" style={styles.inputSmall} value={data.cost ?? ''} onChange={e => update('cost', Number(e.target.value))} />
          </Field>
        </Row>
      </Section>

      <Section title="Combat Stats">
        <Row>
          <Field label="Damage">
            <input type="number" style={styles.inputSmall} value={data.damage ?? ''} onChange={e => update('damage', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Block">
            <input type="number" style={styles.inputSmall} value={data.block ?? ''} onChange={e => update('block', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Hits">
            <input type="number" style={styles.inputSmall} value={data.hits ?? ''} onChange={e => update('hits', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
        </Row>
        <Row>
          <Field label="Draw">
            <input type="number" style={styles.inputSmall} value={data.draw ?? ''} onChange={e => update('draw', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Energy">
            <input type="number" style={styles.inputSmall} value={data.energy ?? ''} onChange={e => update('energy', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Energy Gain">
            <input type="number" style={styles.inputSmall} value={data.energyGain ?? ''} onChange={e => update('energyGain', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="HP Cost">
            <input type="number" style={styles.inputSmall} value={data.hpCost ?? ''} onChange={e => update('hpCost', e.target.value === '' ? undefined : Number(e.target.value))} />
          </Field>
        </Row>
      </Section>

      <Section title="Flags">
        <Row>
          <Checkbox label="Target All" checked={!!data.targetAll} onChange={v => update('targetAll', v)} />
          <Checkbox label="Random Target" checked={!!data.randomTarget} onChange={v => update('randomTarget', v)} />
          <Checkbox label="Ethereal" checked={!!data.ethereal} onChange={v => update('ethereal', v)} />
          <Checkbox label="Exhaust" checked={!!data.exhaust} onChange={v => update('exhaust', v)} />
          <Checkbox label="Unplayable" checked={!!data.unplayable} onChange={v => update('unplayable', v)} />
          <Field label="Str. Multiplier">
            <input type="number" style={styles.inputSmall} value={data.strengthMultiplier ?? ''} onChange={e => update('strengthMultiplier', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="e.g. 3" />
          </Field>
        </Row>
      </Section>

      <Section title="Special">
        <Field label="Special Effect">
          <select style={styles.select} value={data.special || ''} onChange={e => update('special', e.target.value || undefined)}>
            {SPECIAL_TYPES.map(s => <option key={s} value={s}>{s || '(none)'}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Effects">
        {(data.effects || []).map((eff, i) => (
          <Row key={i}>
            <Field label="Type">
              <select style={styles.select} value={eff.type || ''} onChange={e => updateEffect(i, 'type', e.target.value)}>
                {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Amount">
              <input type="number" style={styles.inputSmall} value={eff.amount ?? 0} onChange={e => updateEffect(i, 'amount', Number(e.target.value))} />
            </Field>
            <Checkbox label="Self" checked={!!eff.self} onChange={v => updateEffect(i, 'self', v || undefined)} />
            <button onClick={() => removeEffect(i)} style={styles.removeBtn}>X</button>
          </Row>
        ))}
        <button onClick={addEffect} style={styles.addBtn}>+ Add Effect</button>
      </Section>

      <Section title="Description">
        <textarea
          style={styles.textarea}
          value={data.description || ''}
          onChange={e => update('description', e.target.value)}
          rows={3}
        />
      </Section>

      <Section title="Upgraded Version">
        <Checkbox label="Has Upgrade" checked={!!data.upgradedVersion} onChange={toggleUpgrade} />
        {data.upgradedVersion && (
          <div style={styles.upgradeBox}>
            <Row>
              <Field label="Damage">
                <input type="number" style={styles.inputSmall} value={data.upgradedVersion.damage ?? ''} onChange={e => updateUpgrade('damage', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
              <Field label="Block">
                <input type="number" style={styles.inputSmall} value={data.upgradedVersion.block ?? ''} onChange={e => updateUpgrade('block', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
              <Field label="Cost">
                <input type="number" style={styles.inputSmall} value={data.upgradedVersion.cost ?? ''} onChange={e => updateUpgrade('cost', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
            </Row>
            <Row>
              <Field label="Hits">
                <input type="number" style={styles.inputSmall} value={data.upgradedVersion.hits ?? ''} onChange={e => updateUpgrade('hits', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
              <Field label="Draw">
                <input type="number" style={styles.inputSmall} value={data.upgradedVersion.draw ?? ''} onChange={e => updateUpgrade('draw', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
            </Row>
            <Field label="Description">
              <textarea style={styles.textarea} value={data.upgradedVersion.description || ''} onChange={e => updateUpgrade('description', e.target.value)} rows={2} />
            </Field>
            <div style={{ marginTop: '8px' }}>
              <label style={styles.label}>Upgrade Effects:</label>
              {(data.upgradedVersion.effects || []).map((eff, i) => (
                <Row key={i}>
                  <Field label="Type">
                    <select style={styles.select} value={eff.type || ''} onChange={e => updateUpgradeEffect(i, 'type', e.target.value)}>
                      {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Amount">
                    <input type="number" style={styles.inputSmall} value={eff.amount ?? 0} onChange={e => updateUpgradeEffect(i, 'amount', Number(e.target.value))} />
                  </Field>
                  <Checkbox label="Self" checked={!!eff.self} onChange={v => updateUpgradeEffect(i, 'self', v || undefined)} />
                  <button onClick={() => removeUpgradeEffect(i)} style={styles.removeBtn}>X</button>
                </Row>
              ))}
              <button onClick={addUpgradeEffect} style={styles.addBtn}>+ Add Effect</button>
            </div>
          </div>
        )}
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
  upgradeBox: {
    marginTop: '10px',
    padding: '10px',
    background: '#1a2a1a',
    border: '1px solid #3a5a3a',
    borderRadius: '5px'
  }
};

export default CardForm;
