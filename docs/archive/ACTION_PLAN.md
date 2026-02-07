# Action Plan: Concise Execution Roadmap

**Status:** APPROVED - Ready for Execution  
**Timeline:** 16-20 weeks to production 1.0  
**Last Updated:** 2026-01-25

---

## TL;DR - Executive Summary

**What:** 8-sprint transformation from functional prototype to award-winning multi-platform indie game.

**Why:** Game works but feels amateur. Fix UI, scale architecture, add unique story, ship on web/desktop/mobile.

**How:** Keep solid engine (911 tests). Rebuild experience layer. Mobile-first redesign. Data-driven architecture. "Endless War" narrative.

**When:** 16-20 weeks. Early access after Sprint 8 (web). Full 1.0 after Sprint 12 (all platforms).

---

## The 8 Sprints (One-Line Each)

1. **Sprint 5** (Current): Wire meta-progression & ascension (BE-06, BE-07, SL-03, UX-08, QA-05)
2. **Sprint 6** (2w): Fix status bug, add monitoring, audit UX, balance pass
3. **Sprint 7** (2-3w): Mobile-first UI redesign (combat & map screens)
4. **Sprint 8** (2-3w): Migrate to JSON data architecture (5x scaling unlocked)
5. **Sprint 9** (2w): Integrate "Endless War" story (boss dialogue, events, relics)
6. **Sprint 10** (3w): Act 2 content (10 enemies, 10 events, boss dialogue)
7. **Sprint 11** (2w): Polish layer (animations, music, particles, title screen)
8. **Sprint 12** (2-3w): Ship prep + platform builds (web/desktop/mobile)

---

## Critical Tasks Per Sprint

### Sprint 6: Foundation (2 weeks)
**Must Do:**
- BE-10: Fix status effect timing bug
- BE-11: Performance dashboard (FPS/state monitoring)
- BE-12: Sentry error tracking
- UX-10: UX audit (50+ issues documented)
- QA-06: Balance pass (win rate 25-35% at A0)
- BE-13: Extract balance constants to JSON

**Output:** Monitoring live, bugs fixed, UX roadmap ready

### Sprint 7: Mobile UI Redesign (2-3 weeks)
**Must Do:**
- UX-13: Combat screen mobile-first (no clipping, full combat area)
- UX-14: Map screen mobile-first (path planning visible)
- GD-08: Visual style guide (moodboard, colors, typography)
- BE-07b: Balance constants in JSON (hot-reload working)

**Output:** Mobile experience feels professional

### Sprint 8: Data Migration (2-3 weeks)
**Must Do:**
- BE-08a/b/c/d: Migrate cards, enemies, rules to JSON
- QA-07: JSON schema validation
- GD-09a: State Builder tool (jump to any game state)

**Output:** 5x content scaling unlocked, rapid iteration enabled

### Sprint 9: Narrative (2 weeks)
**Must Do:**
- VARROW-01: Boss dialogue rewrite (Act 1 + Time Eater + Champ)
- VARROW-02: Event rewrite (10 events → "pattern glitches")
- VARROW-03: Victory/defeat narrative integration

**Output:** Unique "Endless War" identity established

### Sprint 10: Act 2 (3 weeks)
**Must Do:**
- JR-03: 10 Act 2 enemies (Centurion, Mystic, Snecko, etc.)
- SL-05: 10 Act 2 events
- VARROW-04: Act 2 boss dialogue

**Output:** Content depth doubled

### Sprint 11: Polish (2 weeks)
**Must Do:**
- UX-16: Combat animations (screen shake, particles, feedback)
- AR-06: Music (combat tracks, map ambient, boss themes)
- GD-10: Professional title screen art

**Output:** Game feels impactful and polished

### Sprint 12: Ship Prep (2-3 weeks)
**Must Do:**
- QA-04: Full regression (all cards/enemies/relics/events)
- BE-14: Platform builds (Tauri desktop, Capacitor mobile, PWA)
- BE-09: Starting bonus selection (Neow-like)
- AR-05b: Mobile responsiveness final pass

**Output:** Production 1.0 ready on web, desktop (Win/Mac/Linux), mobile (iOS/Android)

---

## Platform Build Details (Sprint 12 - BE-14)

### Desktop (Tauri)
```bash
# Setup
npm install @tauri-apps/cli @tauri-apps/api
npm run tauri init

# Build
npm run tauri build
# Output: .exe (Win), .dmg (Mac), .AppImage (Linux)
# Size: ~3-5MB overhead (vs Electron's 50MB)
```

### Mobile (Capacitor)
```bash
# Setup
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init

# Build
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios    # Xcode
npx cap open android # Android Studio
```

### PWA (Service Worker)
```javascript
// vite.config.js - add plugin
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Spire Ascent',
        short_name: 'Spire',
        theme_color: '#1a1a2e',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
}
```

**Effort:** 3-5 days for initial setup, 2-3 days for platform-specific polish per platform.

---

## Success Metrics (Pass/Fail)

**Technical:**
- 1000+ tests passing ✓
- FPS ≥ 60 on mobile ✓
- Bundle < 2MB ✓
- Crash rate < 0.1% ✓

**Content:**
- 100+ cards ✓
- 50+ enemies ✓
- 60+ relics ✓
- 10 ascension levels ✓

**Experience:**
- Win rate 20-35% at A0 ✓
- Mobile playable without frustration ✓
- Magazine score 75+/100 ✓
- Unique identity (not "StS clone") ✓

**Platforms:**
- Web (instant play) ✓
- Desktop (Win/Mac/Linux) ✓
- Mobile (iOS/Android) ✓
- PWA (installable) ✓

---

## Decision Points (PM Approval Required)

**Sprint 6:**
- [ ] Approve UX audit scope (how deep?)
- [ ] Confirm balance target (25-35% win rate at A0)

**Sprint 7:**
- [ ] Approve visual style guide (moodboard)
- [ ] Confirm mobile-first scope (combat + map only, or all screens?)

**Sprint 8:**
- [ ] Approve data migration completeness (content only, or logic too?)

**Sprint 9:**
- [ ] Approve narrative tone (is "Endless War" direction confirmed?)

**Sprint 10:**
- [ ] Confirm Act 3 timing (Sprint 10 parallel, or post-1.0?)

**Sprint 12:**
- [ ] Approve platform priorities (all 3, or web-first then desktop/mobile?)

---

## Risk Mitigation

**High Risk:**
- Mobile UI redesign uncovers structural issues → Prototype first, validate early
- Data migration breaks content → Migrate incrementally, maintain test coverage
- Act 2 scope too large → Split into JR-03a (5 enemies) and JR-03b (5 enemies)

**Medium Risk:**
- Narrative feels forced → Multiple review gates, tone grounded in mechanics
- Platform builds have deployment issues → Test in staging, document setup

---

## Team Capacity Check

**Sprint 6:** BE 80%, UX 60%, QA 40%, SL 20% = ~2.0 FTE (feasible)  
**Sprint 7:** UX 90%, GD 60%, BE 40%, AR 40% = ~2.3 FTE (tight but doable)  
**Sprint 8:** BE 90%, QA 60%, SL 30%, GD 40% = ~2.2 FTE (feasible)  
**Sprint 9:** VARROW 90%, UX 40%, QA 30% = ~1.6 FTE (light sprint)  
**Sprint 10:** JR 90%, SL 50%, VARROW 50%, GD 60% = ~2.5 FTE (peak capacity)  
**Sprint 11:** UX 80%, AR 80%, GD 60% = ~2.2 FTE (feasible)  
**Sprint 12:** QA 90%, BE 50%, AR 60%, GD 60% = ~2.6 FTE (peak capacity)

**Average:** ~2.2 FTE across 8 sprints. **Sustainable if no overlapping sprints.**

---

## What This Enables Post-1.0

**Distribution:**
- Steam (desktop builds ready)
- iOS App Store (Capacitor build ready)
- Google Play (Capacitor build ready)
- itch.io (web + desktop)
- Direct web hosting

**Monetization:**
- Premium purchase (desktop/mobile apps)
- Free-to-play (web) with cosmetics
- Patreon/supporter tier (early access to content)

**Community:**
- Mod support (JSON data format)
- Community events (daily challenges)
- Speedrun community (deterministic seed system)

**Content Pipeline:**
- 5x scaling capacity (400+ cards, 150+ enemies)
- Hot-reload iteration (balance changes without rebuild)
- Data-driven expansion (new acts, characters, modes)

---

## Next Steps (Immediate)

1. **Complete Sprint 5** - All tasks must hit validation gate
2. **PM reviews this action plan** - Adjust priorities/scope as needed
3. **Team kickoff for Sprint 6** - Monday start, tasks assigned
4. **Daily diary updates** - Track progress, identify blockers
5. **Weekly demos** - Show progress, celebrate wins

---

**This is the plan. Let's execute.**

---

*Action Plan Version 1.0 - Condensed from EXECUTIVE_ROADMAP.md and SPRINT_6_DETAILED_PLAN.md*  
*Created: 2026-01-25*  
*Approved by: [Awaiting Stu's approval]*
