# Spire Ascent

A roguelike deck-building game inspired by Slay the Spire, built with React 19 and Vite.

## Features

- **81 unique cards** - Attacks, skills, powers, and curses
- **34 enemies** - From slimes to elite warriors to powerful bosses
- **47 relics** - Passive items that modify gameplay
- **Procedural maps** - Different paths with combat, events, shops, and rest sites
- **Touch & mouse support** - Drag cards to play or tap to select targets

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd spire-clone

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Game Controls

- **Click/tap a card** to select it
- **Drag cards** to the enemy area to play
- **Click enemies** to view their info or select as target
- **End Turn button** completes your turn
- **Draw/Discard/Exhaust piles** - tap to view contents

## Project Structure

```
src/
├── components/       # React UI components
│   ├── CombatScreen.jsx
│   ├── MapScreen.jsx
│   └── ...
├── context/          # Game state management
│   └── GameContext.jsx
├── data/             # Game content definitions
│   ├── cards.js      # Card definitions
│   ├── enemies.js    # Enemy definitions
│   └── relics.js     # Relic definitions
├── hooks/            # Custom React hooks
├── constants/        # Shared constants
└── test/             # Test files
```

## Development

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Vitest** - Testing framework
- **ESLint** - Code linting

## Documentation

- [GAME_REFERENCE.md](./GAME_REFERENCE.md) - Complete game mechanics documentation
- [AUDIT_MATRIX.md](./AUDIT_MATRIX.md) - Implementation status tracking

## License

MIT
