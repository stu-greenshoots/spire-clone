# Spire Ascent

A single-player deckbuilding roguelike inspired by Slay the Spire, built with React and Vite.

## Play Now

**[Play on GitHub Pages](https://stuarthaigh.github.io/spire/)** — No installation required.

## About

Spire Ascent is a browser-based card game where you climb a procedurally generated spire, building a deck of cards, collecting relics, and fighting enemies across four acts culminating in a final boss encounter against The Heart.

This project is developed entirely by a team of AI agents, each specializing in a different aspect of game development. The agents collaborate through structured sprints, code reviews, and pull requests — simulating a real development team workflow using Claude Code.

## Features

### Content
- **4 playable characters** — Ironclad (strength), Silent (poison/shiv), Defect (orbs), Watcher (stances)
- **188 unique cards** — Attacks, skills, powers, curses, and status cards
- **45+ enemies** — Unique AI movesets across 4 acts
- **64 relics** — Trigger-based passive effects
- **15 potions** — Combat and out-of-combat usage
- **Procedural maps** — Branching paths, events, shops, rest sites, and treasures

### Game Modes
- **Standard run** — Climb 4 acts and face The Heart
- **Endless mode** — Post-Heart infinite scaling challenge
- **Daily challenges** — Seeded runs with modifiers
- **Custom seeded runs** — Share runs with friends via seed codes
- **Ascension 0-20** — Progressive difficulty modifiers

### Systems
- **Status effects** — Strength, Dexterity, Vulnerable, Weak, Poison, and more
- **Orb mechanics** — Lightning, Frost, Dark, Plasma (Defect)
- **Stance system** — Calm, Wrath, Divinity (Watcher)
- **Meta-progression** — Achievements and unlocks
- **Run history** — Statistics and past run tracking
- **Save/load** — Persistent progress with export/import

### Controls
- **Mouse/Touch** — Click or drag cards to play
- **Keyboard** — Full combat control via keyboard (press `?` for help)

## Keyboard Controls

Combat is fully playable via keyboard (desktop):

| Key | Action |
|-----|--------|
| `1-9` | Select card by hand position |
| `Tab` / `Shift+Tab` | Cycle target between enemies |
| `Enter` / `Space` | Play selected card |
| `E` | End turn |
| `Escape` | Cancel / deselect card |
| `Q` | Use first available potion |
| `D` | View draw pile |
| `I` | Toggle enemy info panel |
| `?` | Toggle keyboard help overlay |

## Getting Started

```bash
npm install
npm run dev           # Dev server at localhost:5173
```

## Development

```bash
npm run validate      # Lint + test + build (pre-push gate)
npm run test:run      # Run tests once (3747 tests)
npm run test:coverage # Tests with coverage report
npm run lint          # ESLint check
npm run build         # Production build
```

## The Team

| Name | Role | Focus Area |
|------|------|------------|
| **Morgan** | Project Manager | Sprint coordination, CI/CD, process |
| **Sasha** | Architect | State management, reducers, performance |
| **Riley** | Gameplay Engineer | Cards, enemies, content, balance |
| **Alex** | Systems Engineer | Audio, save/load, settings |
| **Jordan** | UX Engineer | Combat animations, tooltips, visual polish |
| **Taylor** | Art Director | Asset pipeline, image optimization, sprite sheets |
| **Varrow** | Narrative Designer | Events, dialogue, world building |
| **Quinn** | QA Lead | Test suites, E2E, balance simulator |

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **Vitest** — Testing framework (3747+ tests)
- **Playwright** — E2E testing
- **GitHub Actions** — CI/CD pipeline
- **GitHub Pages** — PWA hosting

## Project Structure

```
src/
├── components/       # React UI components (lazy-loaded)
├── context/          # Game state management (reducers)
├── data/             # Content definitions (cards, enemies, relics, events)
├── systems/          # Game logic (combat, cards, potions, audio, save)
├── hooks/            # Custom React hooks
├── utils/            # Utilities (asset loading, map generation)
└── test/             # Test suites
tests/
└── e2e/              # Playwright E2E tests
public/
├── images/           # Game assets (sprites, backgrounds)
└── sounds/           # Audio files (music, SFX, ambient)
```

## Known Issues

- **E2E test flakiness** — Some E2E tests fail intermittently due to phase transition timing
- **Some placeholder art** — A portion of card/enemy art is still being improved
- **Audio quality** — Synthesized placeholder sounds in some SFX

## Credits

### Audio
All audio files are CC0 (public domain) or synthesized:
- Music tracks: Procedurally generated
- Sound effects: CC0 sources and synthesized audio

### Art
- Character silhouettes, enemy sprites, card art: AI-generated with style consistency
- UI elements: Custom designed for dark fantasy theme

### Inspiration
- Inspired by [Slay the Spire](https://www.megacrit.com/) by Mega Crit Games

## Documentation

- [GAME_REFERENCE.md](./GAME_REFERENCE.md) — Complete game mechanics and keyboard controls
- [SPRINT_BOARD.md](./SPRINT_BOARD.md) — Current sprint status
- [PROCESS.md](./PROCESS.md) — Development workflow
- [docs/SELF_ASSESSMENT.md](./docs/SELF_ASSESSMENT.md) — Honest quality assessment

## License

MIT
