# Spire Ascent Style Guide

Quick-reference for palette, typography, spacing, and component patterns.

---

## Palette

All colors are defined as CSS custom properties in `src/App.css` `:root`.

### Card Types

| Token | Hex | Usage |
|-------|-----|-------|
| `--attack-color` | `#c41e3a` | Attack cards, HP bars |
| `--skill-color` | `#0078d4` | Skill cards, block indicators |
| `--power-color` | `#d4a017` | Power cards, energy/gold |
| `--curse-color` | `#4a0080` | Curse cards |
| `--status-color` | `#404040` | Status cards |

Each type also has a `--{type}-gradient` for card body tints (135deg, dark-light-dark).

### Rarity

| Token | Hex | Usage |
|-------|-----|-------|
| `--common-color` | `#888888` | Common card border/indicator |
| `--uncommon-color` | `#00bfff` | Uncommon card border/indicator |
| `--rare-color` | `#ffd700` | Rare card border/indicator |

### UI

| Token | Hex | Usage |
|-------|-----|-------|
| `--hp-color` | `#c41e3a` | Health bars, damage numbers |
| `--block-color` | `#4a90d9` | Block shields, defense UI |
| `--energy-color` | `#ffd700` | Energy orb, cost display |
| `--gold-color` | `#ffd700` | Gold/currency displays |

### Surfaces

These are not yet extracted to custom properties but are used consistently:

| Color | Usage |
|-------|-------|
| `#0a0a0f` | Page background (`index.css`) |
| `#1a1a2e` | App background, primary surface |
| `#252538` / `#252540` | Elevated surfaces (panels, cards, modals) |
| `#2a2a4e` | Radial gradient highlight center |
| `rgba(0,0,0,0.3)` | Overlay / scrim (light) |
| `rgba(0,0,0,0.85)` | Overlay / scrim (heavy) |
| `rgba(255,255,255,0.05)` | Subtle highlight / hover |
| `rgba(255,255,255,0.1)` | Active highlight / selected |

### Text

| Color | Usage |
|-------|-------|
| `white` | Primary text |
| `#FFD700` | Links, gold accent text |
| `rgba(255,255,255,0.7)` | Secondary / muted text |

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
```

System font stack -- no custom fonts to load.

### Scale

| Context | Size | Weight |
|---------|------|--------|
| Body default | `16px` (browser default) | `400` |
| Card name | `0.85rem` | `600` |
| Card cost | `1.1rem` | `700` |
| Small labels | `0.7rem` | `400`-`600` |
| Section headers | `1.2rem`-`1.5rem` | `600` |

### Line Height

Base line-height: `1.5` (set in `:root`).

---

## Spacing Scale

Use multiples of 4px for all spacing (margin, padding, gap).

| Token | Value | Common Usage |
|-------|-------|--------------|
| `xs` | `4px` | Tight inner padding, icon gaps |
| `sm` | `8px` | Card inner padding, small gaps |
| `md` | `12px` | Component padding, list gaps |
| `base` | `16px` | Section padding, card gaps |
| `lg` | `24px` | Panel padding, section gaps |
| `xl` | `32px` | Screen-level padding, major sections |

Not yet extracted to custom properties. Use literal `px` values for now, following this scale.

---

## Component Patterns

### Cards (`.card-frame`)

- 4px left border in type color for quick identification
- Type-tinted gradient overlay at 0.7 opacity
- Top glow strip with type color gradient
- Hover: `box-shadow` glow in type color (disabled cards excluded)
- Upgraded cards: dual-glow combining green upgrade + type color
- Rarity shown via colored indicator dot
- Transition: `0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### Buttons

- Default: `linear-gradient(180deg, #555, #333)`, white text
- Hover: `linear-gradient(180deg, #666, #444)`
- Disabled: reduced opacity, cursor `not-allowed`
- Border-radius: `8px`

### Panels / Containers

- Background: `#252538` or `linear-gradient(180deg, #252540, #1a1a2e)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border-radius: `8px`-`12px`
- Padding: `16px`-`24px`

### Overlays / Modals

- Backdrop: `rgba(0,0,0,0.85)`
- Content panel: elevated surface color
- Entry animation: fade + scale

### Health / Block Bars

- HP fill: `--hp-color` (`#c41e3a`)
- Block fill: `--block-color` (`#4a90d9`)
- Bar background: `rgba(0,0,0,0.3)`
- Height: `8px`, border-radius: `4px`

### Screen Shake

Three intensity levels for combat feedback:

| Class | Duration | Max offset |
|-------|----------|------------|
| `.shake-light` | `0.2s` | 2px |
| `.shake-medium` | `0.2s` | 5px |
| `.shake-heavy` | `0.3s` | 8px |

---

## Dark Theme Notes

- Color scheme: `dark` (set in `:root`)
- All surfaces are dark blue-grey, never pure black
- Text is white on dark; avoid pure `#000` backgrounds
- Card type colors are the primary source of vibrancy
- Opacity layering (`rgba` white/black) preferred over new hex values for surface variants
