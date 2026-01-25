# Sprint 6 Detailed Plan: Foundation & Quality

**Status:** READY FOR EXECUTION (Post-Sprint 5 Completion)  
**Goal:** Fix critical bugs, establish monitoring infrastructure, audit UX  
**Theme:** Foundation for Scalability  
**Duration:** 2 weeks  
**Integration Branch:** `sprint-6`

---

## Executive Context

Sprint 6 is the PIVOT SPRINT. After Sprint 5's replayability features, we:
1. Fix the critical status effect bug (user feedback #7)
2. Establish production monitoring (tech review gap #1)
3. Audit UX comprehensively (user feedback #6)
4. Balance tuning (user feedback #4, #5)

**Strategic Purpose:** Set foundation for Sprints 7-8 redesign work.

---

## Sprint 6 Tasks

### P0 - Must Complete (Critical Bugs + Infrastructure)

| Task | Owner | Size | Description | Dependencies |
|------|-------|------|-------------|--------------|
| **BE-10** | BE | M | **Status effect persistence bug** - Buff/debuff decrement timing fix. When enemy applies 2 Vulnerable, should NOT decrement until END of player's NEXT turn. Audit all status effect timing in combatReducer.js. | None |
| **BE-11** | BE | M | **Performance dashboard** - FPS counter overlay (dev mode), reducer execution time tracking, state size monitoring, memory usage display. Add `src/utils/performanceMonitor.js`. | None |
| **BE-12** | BE | S | **Error monitoring integration** - Integrate Sentry for crash reporting. Wrap gameReducer with error boundaries. Log errors to Sentry in production. Add `VITE_SENTRY_DSN` env var. | None |
| **UX-10** | UX | L | **Comprehensive UX audit** - Document ALL "amateur-looking" elements across all screens. Create prioritized punch list. Cover: title, map, combat, shop, rest, rewards, events, game over, victory. Output: `UX_AUDIT.md` with 50+ items. | None |

**P0 Estimated Effort:** 2M (BE) + 1S (BE) + 1L (UX) = ~5-6 person-weeks

### P1 - Should Complete (High Value)

| Task | Owner | Size | Description | Dependencies |
|------|-------|------|-------------|--------------|
| **QA-06** | QA | M | **Balance pass** - Run balance simulator 10,000 games. Tune enemy HP/damage, boss HP. Adjust rare card drop rates (currently too high - should be 3% not 10%). Target win rate 25-35% at A0. | BE-10 (status fix affects balance) |
| **UX-11** | UX | S | **Non-intrusive block indicator** - Block display should NOT cause layout shifts. Use absolute positioning or fixed-size reserved space. Test on mobile. | UX-10 (audit identifies layout jumps) |
| **SL-06** | SL/VARROW | S | **Event tone pass** - Rewrite 5 key events to "glitches in pattern" tone per "Endless War" story. Hollow Merchant, Cursed Altar, Serpent Guardian, 2 others. | None |
| **BE-13** | BE | S | **Extract balance constants** - Move magic numbers to `src/data/balance.json`. Update systems to read from config. Enables rapid iteration without code changes. | None |

**P1 Estimated Effort:** 1M (QA) + 1S (UX) + 1S (SL) + 1S (BE) = ~3-4 person-weeks

### P2 - If Time Permits

| Task | Owner | Size | Description | Dependencies |
|------|-------|------|-------------|--------------|
| **UX-12** | UX | S | **Smart card targeting** - Cards that don't affect enemies (Block, buffs) should NOT require dragging to enemy. Drop anywhere to activate. | UX-10 (audit) |
| **GD-11** | GD | M | **Title screen art** - Professional illustration. Dark fantasy style. "Spire Ascent" logo treatment. War/emergence motifs. | None |
| **AR-07** | AR | S | **Audio polish** - Add 3 more SFX: card discard, potion use, relic pickup. Improve spatial audio. | None |

**P2 Estimated Effort:** 1S + 1M + 1S = ~2-3 person-weeks

---

## Task Details

### BE-10: Status Effect Persistence Bug (P0)

**Problem:** User feedback #7 - "Buff/debuff system issues (persistence)"
- Enemy applies 2 Vulnerable to player
- Vulnerable should last 2 player turns
- Currently may be decrementing immediately or at wrong time
- Affects all status effects: Vulnerable, Weak, Strength, Dexterity, etc.

**Root Cause Investigation:**
1. Check `combatReducer.js` - when do we decrement status effects?
2. Check `END_TURN` action - is decrement happening at correct phase?
3. Check enemy turn - are enemy-applied statuses decrementing on enemy turn?

**Expected Behavior (from Slay the Spire):**
```
Turn 1: Enemy applies 2 Vulnerable to player
  - Player starts turn with Vulnerable 2
  - Player plays cards (takes 50% more damage if hit)
  - Player ends turn
  - Vulnerable decrements to 1 at END of player turn

Turn 2: Player starts turn with Vulnerable 1
  - Player plays cards (still takes 50% more damage)
  - Player ends turn
  - Vulnerable decrements to 0

Turn 3: Player starts turn with Vulnerable 0
  - Vulnerable removed from display
```

**Files to Audit:**
- `src/context/reducers/combatReducer.js` - END_TURN logic
- `src/systems/combatSystem.js` - status effect application
- `src/systems/effectProcessor.js` - applyStatus timing
- `src/test/combatReducer.test.js` - verify test coverage for this scenario

**Acceptance Criteria:**
- [ ] Status effects decrement at END of player turn
- [ ] Enemy-applied effects do NOT decrement on enemy turn
- [ ] Player-applied effects on enemies decrement at END of enemy turn
- [ ] Test coverage for: apply 2 Vulnerable, verify 2 turns of effect
- [ ] Visual display shows correct remaining turns
- [ ] Full playthrough with status-heavy deck (poison, Vulnerable) works correctly

**Test Plan:**
```javascript
// New test in combatReducer.test.js
describe('Status Effect Persistence', () => {
  it('enemy-applied Vulnerable lasts correct number of player turns', () => {
    const state = createCombatState({
      player: { vulnerable: 0 },
      enemies: [{ id: 'jaw_worm' }]
    });
    
    // Enemy applies 2 Vulnerable
    let newState = applyStatus(state, 'player', 'vulnerable', 2);
    expect(newState.player.vulnerable).toBe(2);
    
    // Player turn 1 - Vulnerable should still be 2
    expect(newState.player.vulnerable).toBe(2);
    
    // Player ends turn - decrement to 1
    newState = gameReducer(newState, { type: 'END_TURN' });
    expect(newState.player.vulnerable).toBe(1);
    
    // Player turn 2 - Vulnerable should still be 1
    expect(newState.player.vulnerable).toBe(1);
    
    // Player ends turn - decrement to 0
    newState = gameReducer(newState, { type: 'END_TURN' });
    expect(newState.player.vulnerable).toBe(0);
  });
});
```

**Estimated Effort:** 2-3 days (M)

---

### BE-11: Performance Dashboard (P0)

**Problem:** Tech review gap #3 - "No performance monitoring"
- Cannot detect performance regressions before users complain
- No visibility into reducer execution time
- No state size tracking
- No FPS monitoring

**Solution:** Add performance monitoring infrastructure

**Implementation:**

1. Create `src/utils/performanceMonitor.js`:
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 60,
      reducerTimes: {},
      stateSize: 0,
      memoryUsage: 0
    };
    this.enabled = import.meta.env.DEV || localStorage.getItem('perfMonitor') === 'true';
  }
  
  recordReducerTime(actionType, duration) {
    if (!this.enabled) return;
    if (!this.reducerTimes[actionType]) {
      this.reducerTimes[actionType] = [];
    }
    this.reducerTimes[actionType].push(duration);
    
    if (duration > 16) {
      console.warn(`Slow reducer: ${actionType} took ${duration}ms`);
    }
  }
  
  recordStateSize(state) {
    if (!this.enabled) return;
    this.stateSize = JSON.stringify(state).length;
  }
  
  startFPSTracking() {
    if (!this.enabled) return;
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        this.fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  getMetrics() {
    return {
      fps: this.fps,
      avgReducerTime: this.calculateAvgReducerTimes(),
      stateSize: this.formatBytes(this.stateSize),
      memory: this.formatBytes(performance.memory?.usedJSHeapSize || 0)
    };
  }
  
  calculateAvgReducerTimes() {
    const avgs = {};
    for (const [action, times] of Object.entries(this.reducerTimes)) {
      avgs[action] = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    }
    return avgs;
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

2. Create `src/components/PerformanceDashboard.jsx`:
```javascript
import { useEffect, useState } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';
import './PerformanceDashboard.css';

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setVisible(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="performance-dashboard">
      <div className="perf-metric">
        <span className="perf-label">FPS:</span>
        <span className={`perf-value ${metrics.fps < 30 ? 'red' : metrics.fps < 50 ? 'yellow' : 'green'}`}>
          {metrics.fps}
        </span>
      </div>
      <div className="perf-metric">
        <span className="perf-label">State:</span>
        <span className="perf-value">{metrics.stateSize}</span>
      </div>
      <div className="perf-metric">
        <span className="perf-label">Memory:</span>
        <span className="perf-value">{metrics.memory}</span>
      </div>
      <details>
        <summary>Reducer Times</summary>
        <ul>
          {Object.entries(metrics.avgReducerTime)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([action, time]) => (
              <li key={action}>
                <span>{action}:</span>
                <span className={time > 10 ? 'red' : time > 5 ? 'yellow' : ''}>{time}ms</span>
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
};
```

3. Integrate into GameContext.jsx:
```javascript
import { performanceMonitor } from '../utils/performanceMonitor';

const gameReducer = (state, action) => {
  const startTime = performance.now();
  
  // ... existing reducer logic ...
  
  const duration = performance.now() - startTime;
  performanceMonitor.recordReducerTime(action.type, duration);
  performanceMonitor.recordStateSize(newState);
  
  return newState;
};
```

4. Add to App.jsx (dev mode only):
```javascript
import { PerformanceDashboard } from './components/PerformanceDashboard';

{import.meta.env.DEV && <PerformanceDashboard />}
```

**Acceptance Criteria:**
- [ ] FPS counter displays in dev mode (Ctrl+Shift+P to toggle)
- [ ] Reducer execution times tracked for all actions
- [ ] State size displayed in KB/MB
- [ ] Memory usage displayed
- [ ] Slow reducers (>16ms) logged to console with warning
- [ ] Dashboard updates every second
- [ ] Dashboard hidden by default, keyboard shortcut to show

**Estimated Effort:** 2-3 days (M)

---

### BE-12: Error Monitoring Integration (P0)

**Problem:** Tech review gap #2 - "No error tracking"
- Production crashes invisible
- No way to debug user-reported issues
- No crash rate metrics

**Solution:** Integrate Sentry for error monitoring

**Implementation:**

1. Install Sentry:
```bash
npm install @sentry/react
```

2. Create `src/utils/errorMonitoring.js`:
```javascript
import * as Sentry from '@sentry/react';

export const initErrorMonitoring = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('Sentry DSN not configured - error monitoring disabled');
    return;
  }
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Don't send errors in dev mode
      if (import.meta.env.DEV) {
        console.error('Sentry error (not sent in dev):', event);
        return null;
      }
      return event;
    }
  });
};
```

3. Wrap App with Sentry ErrorBoundary:
```javascript
import * as Sentry from '@sentry/react';
import { initErrorMonitoring } from './utils/errorMonitoring';

initErrorMonitoring();

const App = () => {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {/* existing app */}
    </Sentry.ErrorBoundary>
  );
};
```

4. Add Sentry context to game state:
```javascript
// In GameContext.jsx
Sentry.setContext('game', {
  phase: state.phase,
  floor: state.currentFloor,
  act: state.act,
  hp: state.player.currentHp,
  gold: state.player.gold,
  deckSize: state.deck.length
});
```

5. Add error logging to reducer:
```javascript
const gameReducer = (state, action) => {
  try {
    // ... existing logic ...
  } catch (error) {
    Sentry.captureException(error, {
      contexts: {
        action: {
          type: action.type,
          payload: action.payload
        },
        state: {
          phase: state.phase,
          floor: state.currentFloor
        }
      }
    });
    
    // Return state unchanged to prevent crash
    console.error('Reducer error:', error);
    return state;
  }
};
```

6. Add `.env` file:
```
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Acceptance Criteria:**
- [ ] Sentry initialized in production
- [ ] Errors captured and sent to Sentry
- [ ] Game state included in error context
- [ ] ErrorBoundary shows friendly error screen
- [ ] Dev mode logs errors but doesn't send to Sentry
- [ ] Zero crashes from error monitoring overhead

**Estimated Effort:** 1-2 days (S)

---

### UX-10: Comprehensive UX Audit (P0)

**Problem:** User feedback #6 - "Game looks amateur"
- Need systematic identification of all UX issues
- Prioritized punch list for Sprint 7-8 redesign
- Cover all screens and interactions

**Solution:** Comprehensive UX audit document

**Audit Methodology:**

1. **Play through full game** on multiple viewports:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (390x844 iPhone 12)

2. **Screenshot every screen** at each viewport

3. **Document issues** in categories:
   - Layout (clipping, overflow, alignment)
   - Typography (sizes, weights, hierarchy)
   - Color/Contrast (readability, mood)
   - Touch Targets (size, spacing)
   - Information Hierarchy (what's prominent)
   - Animation/Transitions (jank, timing)
   - Consistency (pattern violations)
   - Mobile-Specific (viewport chrome, gestures)

4. **Prioritize each issue**:
   - P0: Blocks usability
   - P1: Looks amateur
   - P2: Minor polish

**Output Format:**

```markdown
# UX Audit - Spire Ascent
**Date:** 2026-01-XX
**Auditor:** UX
**Viewports Tested:** Desktop, Tablet, Mobile

## Executive Summary
- Total issues: X
- P0 (critical): Y
- P1 (important): Z
- P2 (polish): W

## Main Menu
### Desktop
[Screenshot]
- P1: Title is default font, not styled
- P2: Buttons have no hover state
...

### Mobile
[Screenshot]
- P0: Start button only 30px tall (too small to tap)
- P1: Logo is clipped on short viewports
...

## Combat Screen
### Desktop
[Screenshot]
- P1: Enemy HP bar is hard to read (low contrast)
- P1: Status effects overflow container at 10+ effects
...

### Mobile
[Screenshot]
- P0: Cards clipped at edges of screen
- P0: Can't see enemy intent on short viewports
- P1: Block indicator causes layout jump
- P1: Persistent chrome takes 25% of screen
...

## Map Screen
...

## Shop Screen
...

## Prioritized Punch List
1. [P0-MOB-01] Combat: Cards clipped at screen edges
2. [P0-MOB-02] Combat: Enemy intents not visible on short viewports
3. [P0-MOB-03] Combat: Start button 30px tall (need 44px minimum)
...
```

**Scope:**
- Main Menu
- Map Screen
- Combat Screen (normal, boss, multi-enemy)
- Shop Screen
- Rest Site
- Event Screen
- Reward Screen (gold, cards, relics)
- Game Over Screen
- Victory Screen
- Settings Modal
- Deck Viewer
- Data Editor (dev mode)

**Acceptance Criteria:**
- [ ] All screens audited at 3 viewports
- [ ] Screenshots included for each screen/viewport
- [ ] Minimum 50 issues documented
- [ ] All issues categorized and prioritized
- [ ] Punch list sorted by priority
- [ ] Quick wins identified (< 1 hour fixes)
- [ ] Major redesign items identified (Sprint 7 work)

**Estimated Effort:** 3-4 days (L)

---

### QA-06: Balance Pass (P1)

**Problem:** User feedback #4, #5 - "Enemies too powerful, rare cards too common"

**Solution:** Run balance simulator, tune numbers

**Methodology:**

1. Run balance simulator 10,000 games at each ascension level (0-5)
2. Collect metrics:
   - Win rate by ascension
   - Average floor reached on loss
   - Deaths by enemy type
   - Card rarity distribution in rewards
   - Time per run
3. Identify issues:
   - Win rate outside 25-35% at A0
   - Specific enemies with >30% kill rate
   - Rare cards appearing >5% of time
4. Tune and re-test

**Files to Modify:**
- `src/data/enemies.js` - HP, damage values
- `src/data/bosses.js` - Boss HP, damage values
- `src/systems/rewardSystem.js` - Card rarity probabilities
- `src/data/balance.json` (if BE-13 lands first)

**Target Metrics:**
- Win rate A0: 25-35%
- Win rate A1: 20-30%
- Win rate A2: 15-25%
- Win rate A3: 10-20%
- Win rate A4: 5-15%
- Win rate A5: 3-10%
- Rare card appearance: 3% (not 10%)
- Common card appearance: 60%
- Uncommon card appearance: 37%

**Acceptance Criteria:**
- [ ] Balance simulator run for 10,000 games per ascension
- [ ] Win rates within target ranges
- [ ] Rare card rate 3% (+/- 1%)
- [ ] No single enemy responsible for >30% of deaths
- [ ] Average run time 25-40 minutes
- [ ] Report documenting all tuning changes

**Estimated Effort:** 3-4 days (M)

---

### UX-11: Non-Intrusive Block Indicator (P1)

**Problem:** User feedback #9 - "Block indicator causes jumping"
- When player gains block, UI shifts/jumps
- Causes disorientation
- Looks unpolished

**Current Implementation:**
```jsx
<div className="player-stats">
  <div className="hp">HP: {currentHp}/{maxHp}</div>
  {block > 0 && <div className="block">Block: {block}</div>}
</div>
```

**Problem:** Block div appears/disappears, causing reflow

**Solution A: Reserved Space**
```jsx
<div className="player-stats">
  <div className="hp">HP: {currentHp}/{maxHp}</div>
  <div className="block" style={{ opacity: block > 0 ? 1 : 0 }}>
    Block: {block}
  </div>
</div>
```

**Solution B: Absolute Positioning**
```jsx
<div className="player-stats">
  <div className="hp">HP: {currentHp}/{maxHp}</div>
  {block > 0 && (
    <div className="block-overlay">
      Block: {block}
    </div>
  )}
</div>

// CSS
.player-stats {
  position: relative;
}
.block-overlay {
  position: absolute;
  top: 100%;
  left: 0;
}
```

**Recommendation:** Solution B (absolute positioning) - cleaner, no hidden elements

**Acceptance Criteria:**
- [ ] Block display does NOT cause layout shifts
- [ ] Works on desktop and mobile
- [ ] Tested with 0, 5, 50, 999 block values
- [ ] No overlapping text or clipping
- [ ] Smooth fade in/out animation (optional)

**Estimated Effort:** 1 day (S)

---

### SL-06: Event Tone Pass (P1)

**Problem:** Events feel generic, don't reflect "Endless War" story

**Solution:** Rewrite 5 key events to "glitches in pattern" tone

**Events to Rewrite:**

1. **Hollow Merchant** (shop event)
   - Current: Generic merchant
   - New: Construct that thinks it's a person, sells because "merchants sell"
   ```
   A figure stands behind a counter piled with relics. It smiles with a face 
   that doesn't quite match human proportions. "Welcome! I am... merchant. 
   Yes. I sell things. That is my function." It doesn't blink. You're not 
   sure it can blink. But it has relics. Real ones.
   ```

2. **Cursed Altar** (curse/benefit trade)
   - Current: Evil altar
   - New: Fragment of old gods, still running blessing protocol
   ```
   An altar carved from stone that predates the war. Runes glow with faint 
   divine light—not because gods still exist, but because the altar doesn't 
   know they're gone. It WILL bless you. That's what altars do. The cost is... 
   incidental.
   ```

3. **Serpent Guardian** (combat or trade event)
   - Current: Snake guarding treasure
   - New: Older iteration that got stuck, remembers being several people
   ```
   The serpent coils around a pile of relics. "I've been here... how long? 
   I remember being a soldier. No—a merchant. No—I was..." It trails off, 
   eyes distant. "Take something. I don't need them. I don't need anything. 
   I just... stay."
   ```

4. **Match and Keep** (matching game)
   - Current: Card matching minigame
   - New: Pattern recognition test (are you real enough to remember?)
   ```
   Three cards face-down. A voice (yours?) asks: "Do you remember? Can you 
   hold a pattern long enough to prove you exist?" Match them. If you're 
   real enough, you'll remember. If not... were you ever here at all?
   ```

5. **World of Goop** (curse removal event)
   - Current: Slime pool that removes curse
   - New: Formless void that dissolves patterns (including curses)
   ```
   A pool of something that refuses to have a shape. It's not hostile. 
   It's not anything. It just... un-makes. Curses dissolve here. So do 
   definitions. So do identities, if you're not careful. Drop something 
   in. See if it comes back.
   ```

**Acceptance Criteria:**
- [ ] All 5 events rewritten in "Endless War" tone
- [ ] Mechanics unchanged (just narrative)
- [ ] Tone consistent with boss dialogue from SL-03
- [ ] No lore contradictions
- [ ] Events feel like "glitches" not generic fantasy

**Estimated Effort:** 2 days (S)

---

### BE-13: Extract Balance Constants (P1)

**Problem:** Tech review finding - "Hardcoded balance values"
- Magic numbers scattered across codebase
- Balance changes require code changes + deploy
- Can't iterate quickly

**Solution:** Extract to `src/data/balance.json`

**Balance Constants to Extract:**

```json
{
  "player": {
    "starting_hp": 80,
    "starting_gold": 99,
    "starting_energy": 3,
    "cards_drawn_per_turn": 5,
    "potion_slots": 3,
    "starting_deck": [
      "strike", "strike", "strike", "strike", "strike",
      "defend", "defend", "defend", "defend", "defend",
      "bash"
    ]
  },
  "combat": {
    "energy_per_turn": 3,
    "draw_per_turn": 5,
    "weak_multiplier": 0.75,
    "vulnerable_multiplier": 1.5
  },
  "rewards": {
    "gold": {
      "normal_base": 10,
      "normal_variance": 5,
      "elite_base": 25,
      "elite_variance": 5,
      "boss_base": 100,
      "boss_variance": 0
    },
    "cards": {
      "cards_offered": 3,
      "rare_chance": 0.03,
      "uncommon_chance": 0.37,
      "common_chance": 0.60
    },
    "potion_drop_rate": 0.4
  },
  "shop": {
    "card_base_price": 50,
    "relic_base_price": 150,
    "potion_base_price": 50,
    "removal_cost": 75,
    "card_price_variance": 10
  },
  "rest": {
    "heal_percent": 0.30,
    "upgrade_count": 1
  },
  "map": {
    "floors_per_act": 15,
    "boss_floor": 15,
    "elite_count_act1": 3,
    "campfire_count_act1": 3,
    "shop_count_act1": 2,
    "treasure_count_act1": 2
  }
}
```

**Files to Modify:**
- Create `src/data/balance.json`
- Create `src/utils/balanceConfig.js` loader
- Update `src/context/reducers/metaReducer.js` (START_GAME)
- Update `src/context/reducers/rewardReducer.js` (card rarity)
- Update `src/systems/combatSystem.js` (damage multipliers)
- Update `src/components/ShopScreen.jsx` (prices)
- Update `src/components/RestSite.jsx` (heal percent)

**Implementation:**

```javascript
// src/utils/balanceConfig.js
import balanceData from '../data/balance.json';

class BalanceConfig {
  constructor(data) {
    this.config = data;
  }
  
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }
  
  set(path, value) {
    // For runtime tuning (dev mode only)
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], this.config);
    target[last] = value;
  }
}

export const balance = new BalanceConfig(balanceData);

// Usage:
balance.get('player.starting_hp') // 80
balance.get('rewards.gold.normal_base') // 10
```

**Acceptance Criteria:**
- [ ] All magic numbers moved to balance.json
- [ ] All systems read from balance config
- [ ] Dev mode allows runtime tuning (localStorage override)
- [ ] Hot-reload works (change JSON, see change without rebuild)
- [ ] All existing tests still pass
- [ ] Documentation added for balance config usage

**Estimated Effort:** 2 days (S)

---

## Dependencies & Execution Order

### Week 1 (Parallel Start)

**Day 1-2:**
- BE starts BE-10 (status bug fix) - CRITICAL PATH
- UX starts UX-10 (UX audit) - INDEPENDENT
- BE starts BE-11 (performance dashboard) - INDEPENDENT
- QA starts QA-06 setup (balance simulator prep)

**Day 3-4:**
- BE completes BE-10, starts BE-12 (Sentry)
- UX continues UX-10 (large task)
- BE completes BE-11
- SL starts SL-06 (event tone pass) - INDEPENDENT

**Day 5:**
- BE completes BE-12, starts BE-13 (balance JSON)
- UX completes UX-10
- SL completes SL-06
- QA runs balance simulator (depends on BE-10)

### Week 2 (Convergence)

**Day 6-7:**
- QA completes QA-06 (balance tuning)
- UX starts UX-11 (block indicator)
- BE completes BE-13
- GD starts GD-11 if time available (title screen)

**Day 8-9:**
- UX completes UX-11
- QA validation pass
- Integration testing
- Sprint retrospective

**Day 10:**
- Final validation gate
- Sprint close-out
- Sprint 7 planning

### Conflict Zones

| File | Tasks | Resolution |
|------|-------|------------|
| `combatReducer.js` | BE-10, BE-11 | BE-11 wraps BE-10's changes (sequential OK) |
| `GameContext.jsx` | BE-11, BE-12 | BE-11 adds monitoring, BE-12 adds error boundary (no conflict) |
| `balance.json` | BE-13, QA-06 | BE-13 creates file, QA-06 tunes values (QA-06 after BE-13) |

---

## Validation Gate

Before closing Sprint 6, ALL of these must be TRUE:

### P0 Validation
- [ ] **BE-10:** Status effects decrement at correct timing
- [ ] **BE-10:** Full playthrough with status-heavy deck works
- [ ] **BE-11:** Performance dashboard displays in dev mode
- [ ] **BE-11:** FPS, state size, reducer times all tracked
- [ ] **BE-12:** Sentry integration live, errors captured
- [ ] **BE-12:** Test error sent successfully to Sentry
- [ ] **UX-10:** UX audit document completed with 50+ items
- [ ] **UX-10:** Prioritized punch list created

### P1 Validation
- [ ] **QA-06:** Balance simulator run, win rate 25-35% at A0
- [ ] **QA-06:** Rare card rate 3% (+/- 1%)
- [ ] **UX-11:** Block indicator doesn't cause layout jumps
- [ ] **SL-06:** 5 events rewritten in "Endless War" tone
- [ ] **BE-13:** Balance constants extracted to JSON

### General Validation
- [ ] `npm run validate` passes (920+ tests expected)
- [ ] No P0/P1 regressions from Sprint 5
- [ ] Performance dashboard shows no red flags (FPS > 50, no reducer >20ms)
- [ ] Manual smoke test: full playthrough A0 and A1

---

## Risk Assessment

### High-Risk Items

**Risk:** BE-10 (status bug) has deeper roots than expected  
**Probability:** Medium (30%)  
**Impact:** High (could take full week)  
**Mitigation:** Timebox to 3 days, if not solved escalate to Mentor for architectural review

**Risk:** UX-10 audit reveals MORE than 50 issues  
**Probability:** High (60%)  
**Impact:** Medium (doesn't block sprint, informs Sprint 7)  
**Mitigation:** Prioritize ruthlessly, accept that not all can be fixed in Sprint 7

**Risk:** Sentry integration (BE-12) has deployment issues  
**Probability:** Medium (20%)  
**Impact:** Low (can be fixed post-sprint)  
**Mitigation:** Test in staging environment first, document setup steps

### Medium-Risk Items

**Risk:** Balance tuning (QA-06) requires multiple iterations  
**Probability:** High (70%)  
**Impact:** Medium (extends QA-06 by 1-2 days)  
**Mitigation:** Accept first-pass tuning, iterate in Sprint 7

**Risk:** BE-13 (balance JSON) breaks existing tests  
**Probability:** Low (15%)  
**Impact:** Medium (need to update 50+ tests)  
**Mitigation:** Use feature flag, can be toggled off if issues arise

---

## Success Metrics

At end of Sprint 6, we should have:

### Quantitative
- [ ] 920+ tests passing (up from 911)
- [ ] Status effect bug confirmed fixed (10+ test cases)
- [ ] Performance dashboard operational (FPS tracked)
- [ ] Error monitoring live (at least 1 test error logged)
- [ ] Win rate tuned to 25-35% at A0
- [ ] Rare card rate 3% (verified via simulator)

### Qualitative
- [ ] UX audit provides clear roadmap for Sprint 7-8
- [ ] Events feel more unique ("Endless War" tone)
- [ ] Block indicator no longer causes UI jumps
- [ ] Balance feels fairer (no "enemies too strong" feedback)

### Strategic
- [ ] Foundation for Sprint 7-8 redesign established
- [ ] Monitoring infrastructure enables data-driven decisions
- [ ] Balance iteration speed improved 10x (JSON vs code)

---

## Team Retrospective Questions

1. Was the UX audit comprehensive enough?
2. Did the status bug fix uncover other timing issues?
3. Is the performance dashboard useful or just noise?
4. Should balance tuning be ongoing or sprint-focused?
5. Are we ready for Sprint 7 mobile-first redesign?

---

## Sprint 7 Preview

Next sprint focuses on MOBILE-FIRST UI REDESIGN:
- Combat screen rebuild
- Map screen rebuild
- Visual style guide
- Touch interaction polish

Sprint 6's UX-10 audit will inform all Sprint 7 tasks.

---

**Sprint 6 Plan Version:** 1.0  
**Created:** 2026-01-25  
**Author:** GitHub Copilot (Technical Software Director)  
**Status:** Ready for Team Review
