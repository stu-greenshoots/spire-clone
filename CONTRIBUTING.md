# Contributing to Spire Ascent

Thank you for your interest in contributing to Spire Ascent! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd spire-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Development Workflow

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Linting

```bash
npm run lint
```

Fix any linting errors before submitting a PR.

### Building

```bash
npm run build
```

Ensure the build passes before submitting a PR.

## Adding New Content

### Adding a New Card

1. Open `src/data/cards.js`
2. Add your card to the `ALL_CARDS` array following this structure:

```javascript
{
  id: 'unique_card_id',
  name: 'Card Name',
  type: CARD_TYPES.ATTACK, // or SKILL, POWER, STATUS, CURSE
  rarity: RARITY.COMMON,   // or UNCOMMON, RARE
  cost: 1,
  damage: 6,               // for attacks
  block: 5,                // for skills that block
  description: 'Deal 6 damage.',
  target: 'single',        // or 'all', 'self', 'none'
  upgradedVersion: {
    damage: 9,
    description: 'Deal 9 damage.'
  }
}
```

3. If the card has special effects, add a handler in `GameContext.jsx` under the `PLAY_CARD` reducer action.

### Adding a New Enemy

1. Open `src/data/enemies.js`
2. Add your enemy to the `ALL_ENEMIES` array:

```javascript
{
  id: 'unique_enemy_id',
  name: 'Enemy Name',
  type: 'normal',          // or 'elite', 'boss'
  emoji: '👹',
  minHp: 40,
  maxHp: 50,
  moveset: [
    { type: 'attack', damage: 8 },
    { type: 'defend', block: 5 },
  ],
  ai: (enemy, turn, lastMove) => {
    // Return the move for this turn
    return enemy.moveset[turn % enemy.moveset.length];
  }
}
```

### Adding a New Relic

1. Open `src/data/relics.js`
2. Add your relic to the `ALL_RELICS` array:

```javascript
{
  id: 'unique_relic_id',
  name: 'Relic Name',
  rarity: 'common',        // or 'uncommon', 'rare', 'boss', 'starter'
  description: 'What the relic does.',
  triggers: ['onCombatStart'], // When the relic activates
  effect: {
    type: 'heal',
    value: 6
  }
}
```

## Code Style Guidelines

### General

- Use meaningful variable and function names
- Keep functions focused and small
- Add comments for complex logic
- Use ES6+ features (const/let, arrow functions, destructuring)

### React Components

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use the `useGame` hook to access game state

### File Organization

```
src/
├── components/     # React UI components
├── context/        # Game state management
├── data/           # Static game data (cards, enemies, relics)
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── systems/        # Game systems (future)
└── test/           # Test files
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm run test:run`
4. Ensure linting passes: `npm run lint`
5. Ensure the build succeeds: `npm run build`
6. Submit a pull request with a clear description of changes

## Questions?

Open an issue if you have questions or need help getting started.
