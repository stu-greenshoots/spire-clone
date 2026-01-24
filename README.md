# Spire Ascent

A single-player deckbuilding roguelike inspired by Slay the Spire, built with React and Vite.

## About

Spire Ascent is a browser-based card game where you climb a procedurally generated spire, building a deck of cards, collecting relics, and fighting enemies across three acts culminating in a final boss encounter.

This project is developed entirely by a team of AI agents, each specializing in a different aspect of game development. The agents collaborate through structured sprints, code reviews, and pull requests — simulating a real development team workflow using Claude Code.

## The Team

| Name | Role | Focus Area |
|------|------|------------|
| **Morgan** | Project Manager | Sprint coordination, CI/CD, process |
| **Sasha** | Architect | State management, reducers, performance |
| **Riley** | Gameplay Engineer | Potions, card upgrades, content |
| **Alex** | Systems Engineer | Audio, save/load, settings |
| **Jordan** | UX Engineer | Combat animations, tooltips, visual polish |
| **Taylor** | Art Director | Asset pipeline, image optimization, card frames |
| **Cameron** | Narrative Designer | Events, flavour text, world building |
| **Quinn** | QA Lead | Test suites, balance simulator, coverage |

## Features

- **81 unique cards** across attack, skill, and power types
- **34 enemies** with unique AI movesets across 3 acts
- **47 relics** with trigger-based passive effects
- **Procedural maps** with branching paths, events, shops, and rest sites
- **Status effects** — strength, dexterity, vulnerable, weak, poison, and more
- **Potion system** with combat and out-of-combat usage
- **Save/load** system with persistent progress
- **Touch and mouse** support

## Getting Started

```bash
npm install
npm run dev           # Dev server at localhost:5173
```

## Development

```bash
npm run validate      # Lint + test + build (pre-push gate)
npm run test:run      # Run tests once
npm run test:coverage # Tests with coverage report
npm run lint          # ESLint check
npm run build         # Production build
```

## How It Works

Each team member operates within defined file boundaries and follows a sprint-based workflow:

1. Tasks are planned on the sprint board
2. Each task gets its own branch (`sprint-N/task-id-description`)
3. PRs target the sprint integration branch, not master
4. CI must pass and changes are smoke-tested before merge
5. Sprint branches merge to master at the end of each sprint

The agents coordinate through shared planning documents, enforce code ownership boundaries, and review each other's work.

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **Vitest** — Testing framework (809+ tests)
- **GitHub Actions** — CI/CD pipeline
- **GitHub Pages** — Hosting

## Project Structure

```
src/
├── components/       # React UI components
├── context/          # Game state management (reducers)
├── data/             # Content definitions (cards, enemies, relics, events)
├── systems/          # Game logic (combat, cards, potions, audio, save)
├── hooks/            # Custom React hooks
├── utils/            # Utilities (asset loading, map generation)
└── test/             # Test suites
```

## Documentation

- [GAME_REFERENCE.md](./GAME_REFERENCE.md) — Complete game mechanics
- [SPRINT_BOARD.md](./SPRINT_BOARD.md) — Current sprint status
- [PROCESS.md](./PROCESS.md) — Development workflow

## License

MIT
