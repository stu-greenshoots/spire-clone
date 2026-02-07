# Spire Ascent 1.0 Release Checklist

**Created:** 2026-02-07 (Sprint 18 — VP-15)
**Purpose:** Step-by-step guide to releasing version 1.0 to GitHub Pages.
**Target:** Any team member can follow this checklist to perform the release.

---

## Pre-Release Verification

Complete ALL items before proceeding to release steps.

### Code Quality Gate

- [ ] `npm run validate` passes (lint + tests + build)
- [ ] All 3747+ tests passing
- [ ] Zero lint errors
- [ ] Build completes without errors

### E2E Verification

- [ ] E2E tests pass locally: `npm run test:e2e`
- [ ] Smoke tests pass: `npm run test:deploy-smoke`
- [ ] Deploy smoke tests pass on CI (GitHub Actions)

### Manual Verification

Play through the game manually to verify critical paths:

- [ ] **Title screen** — Loads correctly, all buttons work
- [ ] **Character selection** — All 4 characters selectable
- [ ] **Combat** — Cards play, enemies attack, damage applies
- [ ] **Keyboard controls** — Full combat via 1-9, Tab, Enter, E keys
- [ ] **Map navigation** — Nodes selectable, paths work
- [ ] **Rewards** — Card rewards, gold, relics grant correctly
- [ ] **Shop** — Items purchasable, gold deducts
- [ ] **Rest sites** — Heal and upgrade both work
- [ ] **Boss fight** — At least one Act 1 boss defeated
- [ ] **Save/load** — Game persists across browser refresh
- [ ] **Audio** — Music plays, SFX trigger, volume controls work
- [ ] **Mobile** — Playable on 390x844 viewport (iPhone 14 Pro size)

### Content Verification

- [ ] All 4 characters have unique card pools and mechanics
- [ ] Orb system works (Defect)
- [ ] Stance system works (Watcher)
- [ ] Poison/Shiv mechanics work (Silent)
- [ ] Strength/Exhaust mechanics work (Ironclad)

### Documentation Verification

- [ ] README.md reflects current feature set
- [ ] GAME_REFERENCE.md has accurate keyboard controls
- [ ] docs/SELF_ASSESSMENT.md completed honestly
- [ ] Known issues documented in README.md

---

## Release Steps

### Step 1: Merge Sprint Branch to Master

```bash
# Ensure you're on the sprint branch and it's up to date
git checkout sprint-18
git pull origin sprint-18

# Verify no uncommitted changes
git status

# Create a final integration PR (if not already done)
gh pr create --base master --head sprint-18 \
  --title "Sprint 18: Visual Polish & Ship Readiness" \
  --body "$(cat <<'EOF'
## Sprint 18 Integration

Visual polish and ship readiness sprint.

### Completed Tasks
- VP-01: Act 1 Boss Sprite Replacement
- VP-02: Act 1 Elite Sprite Replacement
- VP-03: Common Enemy Sprite Replacement
- VP-04: Character-Specific Relic Art
- VP-05: High-Priority Card Art
- VP-06: Act 2/3 Enemy Art
- VP-07: Keyboard-Only Playthrough Verification
- VP-08: DevTools Full Playthrough Test
- VP-09: Honest Self-Assessment
- VP-10: E2E CI Stabilization
- VP-14: Documentation Polish
- VP-15: Release Checklist

### Validation
- [ ] All CI checks pass
- [ ] Full playthrough completed
- [ ] Self-assessment score: 92+/100

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# Wait for CI to pass, then merge
gh pr merge --squash --delete-branch
```

### Step 2: Tag the Release

```bash
# Checkout master and pull latest
git checkout master
git pull origin master

# Update version in package.json (currently 0.0.0)
# Edit package.json to set "version": "1.0.0"

# Commit version bump
git commit -am "Release v1.0.0"

# Create annotated tag
git tag -a v1.0.0 -m "Spire Ascent 1.0.0

First official release.

Features:
- 4 playable characters (Ironclad, Silent, Defect, Watcher)
- 188 cards, 45+ enemies, 64 relics, 15 potions
- 4 acts + true final boss (The Heart)
- Endless mode, daily challenges, custom seeded runs
- Ascension 0-20 difficulty progression
- Full keyboard controls
- PWA with offline support

Known Issues:
- Some E2E tests flaky due to phase transition timing
- Some card/enemy art still being improved
- Audio uses synthesized placeholder sounds
"

# Push tag
git push origin v1.0.0
git push origin master
```

### Step 3: Verify GitHub Pages Deployment

After pushing to master, GitHub Actions will automatically deploy to GitHub Pages.

1. Check workflow status: https://github.com/{owner}/{repo}/actions
2. Wait for "Deploy to GitHub Pages" workflow to complete
3. Verify smoke test job passes
4. Visit deployed site: https://{owner}.github.io/spire/

### Step 4: Verify PWA Installation

Test that the PWA is installable:

1. Open Chrome on desktop
2. Navigate to the deployed site
3. Look for install prompt in address bar (+ icon)
4. Click to install — verify app installs
5. Launch installed app — verify it works offline

On mobile:
1. Open Safari (iOS) or Chrome (Android)
2. Use "Add to Home Screen" option
3. Verify app launches from home screen
4. Toggle airplane mode — verify app still works

### Step 5: Create GitHub Release

```bash
gh release create v1.0.0 \
  --title "Spire Ascent 1.0.0" \
  --notes "$(cat <<'EOF'
# Spire Ascent 1.0.0

The first official release of Spire Ascent — a browser-based deck-building roguelike inspired by Slay the Spire.

## Play Now

**[Play on GitHub Pages](https://{owner}.github.io/spire/)**

No installation required. Works offline as a PWA.

## What's Included

### Characters
- **Ironclad** — Strength-based warrior with exhaust synergies
- **Silent** — Poison and Shiv specialist with discard manipulation
- **Defect** — Orb mechanic user (Lightning, Frost, Dark, Plasma)
- **Watcher** — Stance-shifting monk (Calm, Wrath, Divinity)

### Content
- 188 unique cards across 4 character pools
- 45+ enemies with unique AI patterns
- 64 relics with trigger-based passive effects
- 15 potions for combat and out-of-combat use
- 4 acts culminating in The Heart boss fight

### Game Modes
- Standard 4-act runs
- Endless mode with infinite scaling
- Daily challenges with modifiers
- Custom seeded runs (shareable)
- Ascension 0-20 difficulty progression

### Technical
- React 19 + Vite 7
- Full keyboard control support
- PWA with offline capability
- Mobile-responsive design

## Known Issues
- Some E2E tests flaky on CI
- ~100 cards still have placeholder art being improved
- Audio uses synthesized sounds in some SFX

## Credits
Developed by a team of AI agents using Claude Code.
EOF
)"
```

### Step 6: Post-Release Verification

After release is live:

- [ ] Play full game from fresh browser (no localStorage)
- [ ] Complete Act 1 with each character
- [ ] Verify save/load works on production
- [ ] Check PWA installable and works offline
- [ ] Verify GitHub release page shows correctly
- [ ] Check that release tag appears in repo

---

## Rollback Procedure

If critical issues are discovered post-release:

### Quick Fix (Minor Issues)
```bash
# Create hotfix branch from master
git checkout master
git checkout -b hotfix-1.0.1

# Make fix, commit, push
git commit -am "Hotfix: description"
git push -u origin hotfix-1.0.1

# Create PR, merge, tag
gh pr create --base master --title "Hotfix 1.0.1"
gh pr merge --squash --delete-branch
git checkout master && git pull
git tag -a v1.0.1 -m "Hotfix: description"
git push origin v1.0.1
```

### Full Rollback (Critical Issues)
```bash
# Force-revert to previous known good state
git checkout master
git revert HEAD --no-commit  # Or specify the merge commit
git commit -m "Revert: Rolling back 1.0.0 due to critical issue"
git push origin master

# Tag rollback
git tag -a v1.0.0-reverted -m "Reverted due to: <description>"
git push origin v1.0.0-reverted
```

---

## Communication Checklist

After successful release:

- [ ] Update project README with release badge (optional)
- [ ] Archive sprint-18 plan to docs/archive/sprint-plans/
- [ ] Create Sprint 19 planning document (if continuing)
- [ ] Update SPRINT_BOARD.md with "Sprint 18 COMPLETE" status
- [ ] Celebrate! 🎉

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | TBD | Initial release |

---

## Notes for Future Releases

### Version Numbering
- **Major (X.0.0):** Breaking changes, major features
- **Minor (1.X.0):** New content, features, improvements
- **Patch (1.0.X):** Bug fixes, hotfixes

### Release Cadence
- Patch releases: As needed for critical fixes
- Minor releases: After each sprint (if significant changes)
- Major releases: Milestone features only

### Pre-Release Testing
Consider adding beta testing phase for future major releases:
1. Deploy to staging environment
2. Gather feedback from limited users
3. Fix issues before public release
