# Contributing to Spire Ascent

## Development Setup

### Prerequisites

- Node.js 20 or higher
- npm

### Getting Started

```bash
git clone https://github.com/stu-greenshoots/spire-clone.git
cd spire-clone
npm install
npm run dev
```

The game will be available at http://localhost:5173

## Workflow

1. Create a feature branch from the current sprint branch (`sprint-N/your-task-description`)
2. Make your changes
3. Run `npm run validate` (lint + test + build must all pass)
4. Push and open a PR targeting the sprint branch

See [PROCESS.md](./PROCESS.md) for full branch naming and PR conventions.

## Adding Content

### Cards

Add entries to `src/data/cards.js`. Card effects are handled in `src/systems/cardEffects.js`.

### Enemies

Add entries to `src/data/enemies.js`. AI logic lives in `src/systems/enemySystem.js`.

### Relics

Add entries to `src/data/relics.js`. Trigger logic is in `src/systems/relicSystem.js`.

### Events

Add entries to `src/data/events.js`.

## Code Style

- Functional React components with hooks
- Game state managed via `useGame` hook (context + reducers)
- ESLint enforced — no unused imports or variables
- Tests required for new functionality (`src/test/`)

## Validation Gate

Every push must pass:

```bash
npm run validate      # Runs: eslint . && vitest run && vite build
```
