# Technical Stack

## Core Technologies

- **TypeScript** (ES2020 target)
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (no frameworks)
- **ES Modules** for code organization

## Build System

- TypeScript compiler (`tsc`) for transpilation
- Output directory: `./dist`
- Source directory: `./src`

## Common Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development (auto-rebuild on changes)
npm run watch

# Serve the game locally on port 8000
npm run serve
```

## Development Workflow

1. Run `npm run watch` in one terminal to auto-compile TypeScript
2. Run `npm run serve` in another terminal to start local server
3. Open browser to `http://localhost:8000`

## TypeScript Configuration

- Strict mode enabled
- ES2020 module system
- DOM lib included for Canvas API
- Module resolution: node

## Dependencies

- **typescript**: ^5.3.0 (dev dependency only)
- No runtime dependencies (pure vanilla implementation)
