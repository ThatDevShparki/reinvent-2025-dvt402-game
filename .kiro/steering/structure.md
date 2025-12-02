# Project Structure

## Directory Layout

```
.
├── src/                    # TypeScript source files
│   ├── game.ts            # Main game loop and initialization
│   ├── Player.ts          # Player character with physics and collision
│   ├── Map.ts             # Game map with tiles and collision detection
│   ├── Camera.ts          # Camera system with edge scrolling
│   └── types.ts           # Shared TypeScript interfaces and enums
├── dist/                   # Compiled JavaScript output (generated)
├── index.html             # Game entry point with canvas and UI
├── package.json           # Project metadata and scripts
└── tsconfig.json          # TypeScript compiler configuration
```

## Architecture Patterns

### Class-Based Organization

Each game system is encapsulated in its own class:

- `Game`: Main game loop, orchestrates all systems
- `Player`: Character state, movement physics, collision
- `GameMap`: Tile-based map, collision map generation
- `Camera`: Viewport management, player following

### Coordinate System

- Tile size: 32x32 pixels
- Map dimensions: 50x40 tiles (1600x1280 pixels)
- Canvas viewport: 800x600 pixels
- Player position stored in world coordinates (not screen coordinates)

### Game Loop

- Uses `requestAnimationFrame` for 60 FPS target
- Delta time tracking for frame-independent updates
- Update-then-render pattern

### Rendering

- Camera offset applied to all world objects during rendering
- Draw order: map → player → UI overlay
- Pixel-perfect rendering with `image-rendering: pixelated`

## File Naming Conventions

- PascalCase for class files: `Player.ts`, `Camera.ts`
- camelCase for main entry: `game.ts`
- lowercase for types: `types.ts`

## Import/Export Pattern

- ES6 modules with `.js` extension in imports (for browser compatibility)
- Named exports for classes and interfaces
- Type-only imports where applicable
