# Battle System Design Document

## Overview

The battle system introduces Pokemon-style turn-based combat and creature collection mechanics to the Kiro Adventure game. Players encounter AI models (GPT-4, Claude, Llama, etc.) through random grass encounters, engage them in strategic turn-based battles, and can capture weakened models to build a team. The system integrates seamlessly with the existing exploration gameplay, adding a new game mode that switches between exploration and battle states.

The design emphasizes:

- Smooth transitions between exploration and battle modes
- Strategic depth through energy management and ability selection
- Progression through experience gain and leveling
- Meaningful stakes through permadeath mechanics
- Recognizable AI model branding for player engagement

## Architecture

### High-Level Architecture

The battle system follows a state-based architecture with clear separation between exploration and battle modes:

```
Game (Main Controller)
├── ExplorationState
│   ├── Player
│   ├── GameMap
│   ├── Camera
│   └── EncounterSystem
└── BattleState
    ├── BattleEngine
    ├── PlayerModel (AIModel instance)
    ├── WildModel (AIModel instance)
    └── BattleUI
```

### State Management

The game operates in two primary states:

1. **Exploration State**: Player navigates the world, grass encounters trigger battles
2. **Battle State**: Turn-based combat with ability selection and capture mechanics

State transitions occur when:

- Exploration → Battle: Player walks through grass and triggers 15% encounter chance
- Battle → Exploration: Battle ends (victory, defeat, flee, or capture)

### Component Responsibilities

**EncounterSystem**

- Tracks player movement through grass tiles
- Generates random encounter checks (15% probability)
- Selects random AI model type for encounters
- Initiates battle state transitions

**BattleEngine**

- Manages turn order (player → wild model alternation)
- Executes abilities and applies effects
- Tracks battle state (active, capture available, ended)
- Calculates damage, energy costs, and stat modifications
- Determines battle outcomes

**AIModel**

- Represents both player-owned and wild AI models
- Stores stats (life, energy, level, experience)
- Defines four abilities (2 offensive, 1 defensive, 1 buff)
- Handles leveling and stat scaling

**Inventory**

- Stores collected AI models
- Manages active model selection
- Persists model data between sessions

**BattleUI**

- Renders battle scene with both models
- Displays stats (life, energy, level) for both combatants
- Shows ability selection interface
- Provides capture/kill options when threshold reached
- Displays combat feedback (damage numbers, ability effects)

## Components and Interfaces

### AIModel Class

```typescript
interface Ability {
    name: string;
    type: 'offensive' | 'defensive' | 'buff';
    energyCost: number;
    basePower: number; // Damage for offensive, effect strength for others
    description: string;
}

interface AIModelData {
    id: string; // Unique identifier for model type (e.g., "gpt-4-turbo")
    name: string; // Display name (e.g., "GPT-4 Turbo")
    version: string; // Version info (e.g., "1106-preview")
    iconUrl: string; // Path to model icon or company logo
    companyName: string; // "OpenAI", "Anthropic", etc.
    
    // Stats
    level: number;
    experience: number;
    currentLife: number;
    maxLife: number;
    currentEnergy: number;
    maxEnergy: number;
    
    // Abilities
    abilities: [Ability, Ability, Ability, Ability]; // Exactly 4
}

class AIModel {
    data: AIModelData;
    
    constructor(modelType: string, level: number);
    
    // Stat calculations
    calculateMaxLife(): number; // Base 100 + (level * 20)
    calculateMaxEnergy(): number; // Base 50 + (level * 10)
    calculateAbilityPower(ability: Ability): number; // basePower * (1 + level * 0.1)
    
    // Combat actions
    useAbility(ability: Ability, target: AIModel): AbilityResult;
    takeDamage(amount: number): void;
    consumeEnergy(amount: number): boolean;
    
    // Progression
    gainExperience(amount: number): boolean; // Returns true if leveled up
    levelUp(): void;
    
    // State checks
    isAlive(): boolean;
    canUseAbility(ability: Ability): boolean;
    isCapturable(): boolean; // Life <= 15% of max
    
    // Restoration
    restoreToFull(): void; // Called when added to inventory
}
```

### BattleEngine Class

```typescript
enum BattlePhase {
    PLAYER_TURN,
    WILD_TURN,
    ABILITY_ANIMATION,
    BATTLE_END
}

enum BattleOutcome {
    PLAYER_VICTORY,
    PLAYER_DEFEAT,
    FLED,
    CAPTURED
}

interface TurnAction {
    actor: AIModel;
    ability: Ability;
    target: AIModel;
}

class BattleEngine {
    playerModel: AIModel;
    wildModel: AIModel;
    phase: BattlePhase;
    outcome: BattleOutcome | null;
    
    constructor(playerModel: AIModel, wildModel: AIModel);
    
    // Turn management
    startPlayerTurn(): void;
    executePlayerAction(ability: Ability): void;
    executeFlee(): void;
    executeCapture(): void;
    executeKill(): void;
    
    // Wild model AI
    selectWildAbility(): Ability; // Random selection from available abilities
    executeWildTurn(): void;
    
    // Battle flow
    processTurn(action: TurnAction): void;
    checkBattleEnd(): BattleOutcome | null;
    endBattle(outcome: BattleOutcome): void;
    
    // State queries
    isCaptureAvailable(): boolean;
    getCurrentPhase(): BattlePhase;
}
```

### EncounterSystem Class

```typescript
interface EncounterConfig {
    encounterRate: number; // 0.15 for 15%
    modelPool: string[]; // Available model types
}

class EncounterSystem {
    config: EncounterConfig;
    lastTilePosition: { x: number, y: number };
    
    constructor(config: EncounterConfig);
    
    // Encounter detection
    checkEncounter(playerX: number, playerY: number, tileType: string): AIModel | null;
    
    // Model generation
    generateWildModel(): AIModel;
    selectRandomModelType(): string;
    generateModelLevel(): number; // Random level 1-10 initially
}
```

### Inventory Class

```typescript
class Inventory {
    models: AIModel[];
    activeModelIndex: number;
    maxSize: number; // Optional limit
    
    constructor();
    
    // Model management
    addModel(model: AIModel): boolean;
    removeModel(modelId: string): void;
    getActiveModel(): AIModel | null;
    setActiveModel(index: number): boolean;
    
    // Queries
    getModelCount(): number;
    hasModels(): boolean;
    findModelById(id: string): AIModel | null;
    
    // Persistence
    save(): void;
    load(): void;
}
```

### BattleUI Class

```typescript
interface BattleUIState {
    showAbilitySelection: boolean;
    showCaptureOptions: boolean;
    selectedAbilityIndex: number;
    animatingAbility: Ability | null;
    damageNumbers: Array<{ value: number, x: number, y: number, lifetime: number }>;
}

class BattleUI {
    state: BattleUIState;
    
    constructor();
    
    // Rendering
    render(ctx: CanvasRenderingContext2D, battle: BattleEngine): void;
    renderModels(ctx: CanvasRenderingContext2D, player: AIModel, wild: AIModel): void;
    renderStats(ctx: CanvasRenderingContext2D, model: AIModel, x: number, y: number): void;
    renderAbilityMenu(ctx: CanvasRenderingContext2D, abilities: Ability[]): void;
    renderCaptureOptions(ctx: CanvasRenderingContext2D): void;
    renderDamageNumbers(ctx: CanvasRenderingContext2D): void;
    
    // Input handling
    handleAbilitySelection(index: number): void;
    handleCaptureChoice(capture: boolean): void;
    
    // Animations
    playAbilityAnimation(ability: Ability): void;
    showDamage(amount: number, x: number, y: number): void;
    update(deltaTime: number): void; // Update animations
}
```

### InventoryUI Class

```typescript
class InventoryUI {
    visible: boolean;
    selectedIndex: number;
    
    constructor();
    
    // Display control
    show(): void;
    hide(): void;
    toggle(): void;
    
    // Rendering
    render(ctx: CanvasRenderingContext2D, inventory: Inventory): void;
    renderModelCard(ctx: CanvasRenderingContext2D, model: AIModel, x: number, y: number, isActive: boolean): void;
    renderModelIcon(ctx: CanvasRenderingContext2D, iconUrl: string, x: number, y: number): void;
    renderAbilityList(ctx: CanvasRenderingContext2D, abilities: Ability[], x: number, y: number): void;
    
    // Input handling
    handleSelection(index: number): void;
    handleConfirm(): void;
}
```

## Data Models

### Model Type Definitions

The game includes several real-world AI models with distinct characteristics:

```typescript
const MODEL_DEFINITIONS: Record<string, {
    name: string;
    version: string;
    company: string;
    iconUrl: string;
    abilities: [Ability, Ability, Ability, Ability];
}> = {
    'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        version: '1106-preview',
        company: 'OpenAI',
        iconUrl: '/assets/icons/openai.png',
        abilities: [
            { name: 'Token Blast', type: 'offensive', energyCost: 15, basePower: 30, description: 'Fires a burst of tokens' },
            { name: 'Context Overflow', type: 'offensive', energyCost: 25, basePower: 50, description: 'Overwhelms with massive context' },
            { name: 'System Prompt Shield', type: 'defensive', energyCost: 20, basePower: 40, description: 'Reduces damage by 40%' },
            { name: 'Temperature Boost', type: 'buff', energyCost: 15, basePower: 30, description: 'Increases attack power' }
        ]
    },
    'claude-3-5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        version: '20241022',
        company: 'Anthropic',
        iconUrl: '/assets/icons/anthropic.png',
        abilities: [
            { name: 'Thinking Strike', type: 'offensive', energyCost: 15, basePower: 35, description: 'Analytical attack' },
            { name: 'Constitutional Beam', type: 'offensive', energyCost: 20, basePower: 45, description: 'Principled assault' },
            { name: 'Harmlessness Guard', type: 'defensive', energyCost: 18, basePower: 45, description: 'Reduces damage by 45%' },
            { name: 'Helpfulness Aura', type: 'buff', energyCost: 12, basePower: 25, description: 'Boosts all stats' }
        ]
    },
    'llama-3-70b': {
        name: 'Llama 3',
        version: '70B',
        company: 'Meta',
        iconUrl: '/assets/icons/meta.png',
        abilities: [
            { name: 'Open Source Slam', type: 'offensive', energyCost: 12, basePower: 28, description: 'Community-powered attack' },
            { name: 'Parameter Surge', type: 'offensive', energyCost: 22, basePower: 48, description: 'Unleashes 70B parameters' },
            { name: 'License Shield', type: 'defensive', energyCost: 15, basePower: 35, description: 'Reduces damage by 35%' },
            { name: 'Fine-tune Boost', type: 'buff', energyCost: 18, basePower: 28, description: 'Adapts to situation' }
        ]
    },
    'gemini-pro': {
        name: 'Gemini Pro',
        version: '1.5',
        company: 'Google',
        iconUrl: '/assets/icons/google.png',
        abilities: [
            { name: 'Multimodal Strike', type: 'offensive', energyCost: 18, basePower: 32, description: 'Attacks from multiple angles' },
            { name: 'Search Integration', type: 'offensive', energyCost: 24, basePower: 46, description: 'Leverages vast knowledge' },
            { name: 'Safety Filter', type: 'defensive', energyCost: 16, basePower: 38, description: 'Reduces damage by 38%' },
            { name: 'Bard Legacy', type: 'buff', energyCost: 14, basePower: 26, description: 'Channels creative energy' }
        ]
    }
};
```

### Stat Scaling Formulas

```typescript
// Life scaling: Base 100 + (level * 20)
// Level 1: 120 HP
// Level 5: 200 HP
// Level 10: 300 HP

// Energy scaling: Base 50 + (level * 10)
// Level 1: 60 Energy
// Level 5: 100 Energy
// Level 10: 150 Energy

// Ability power scaling: basePower * (1 + level * 0.1)
// Level 1: 100% base power
// Level 5: 150% base power
// Level 10: 200% base power

// Experience to level: level * 100
// Level 1→2: 100 XP
// Level 2→3: 200 XP
// Level 9→10: 900 XP

// Experience reward: defeated model's level * 50
// Defeating level 1: 50 XP
// Defeating level 5: 250 XP
// Defeating level 10: 500 XP
```

### Save Data Structure

```typescript
interface SaveData {
    version: string;
    inventory: {
        models: AIModelData[];
        activeModelIndex: number;
    };
    playerPosition: { x: number, y: number };
    gameState: 'exploration' | 'battle';
}
```

##

Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Grass encounter probability converges to 15%

*For any* sequence of grass tile encounters, when running a large number of encounter checks (n ≥ 1000), the ratio of battles initiated to total checks should converge to 0.15 ± 0.02.
**Validates: Requirements 1.3**

### Property 2: Battle initiation transitions to battle state

*For any* game in exploration mode, when a battle is initiated, the game state should transition to battle mode.
**Validates: Requirements 1.5**

### Property 3: Model stat scaling follows formulas

*For any* AI model at any level L, the maximum life pool should equal 100 + (L *20) and the maximum energy pool should equal 50 + (L* 10).
**Validates: Requirements 2.1, 2.2, 2.7, 2.8**

### Property 4: Models have correct ability composition

*For any* created AI model, it should have exactly 2 offensive abilities, exactly 1 defensive ability, and exactly 1 buff ability (total of 4 abilities).
**Validates: Requirements 2.4, 2.5, 2.6**

### Property 5: Level must be within valid range

*For any* created AI model, its level should be greater than or equal to 1 and less than or equal to the maximum level cap.
**Validates: Requirements 2.3**

### Property 6: Ability execution consumes energy

*For any* ability execution, the executing model's energy pool should decrease by exactly the ability's energy cost.
**Validates: Requirements 3.4**

### Property 7: Offensive abilities reduce target life

*For any* offensive ability execution, the target model's life pool should decrease by the calculated damage amount.
**Validates: Requirements 3.5**

### Property 8: Ability power scales with level

*For any* ability with base power P used by a model at level L, the effective power should equal P *(1 + L* 0.1).
**Validates: Requirements 4.3**

### Property 9: Insufficient energy prevents ability use

*For any* model with current energy E attempting to use an ability with cost C where E < C, the ability should not execute and the model's state should remain unchanged.
**Validates: Requirements 4.5**

### Property 10: Inventory addition restores model to full

*For any* model added to inventory, its current life should equal its maximum life and its current energy should equal its maximum energy.
**Validates: Requirements 5.2, 5.3**

### Property 11: Active model selection persists

*For any* model selected as active in inventory while in exploration mode, that model should be the player's model in the next battle initiated.
**Validates: Requirements 5.6**

### Property 12: Victory awards experience

*For any* battle ending in victory, the victorious model should gain experience points equal to the defeated model's level multiplied by 50.
**Validates: Requirements 6.1**

### Property 13: Level up increases stats and restores pools

*For any* model that levels up from level L to L+1, its maximum life should increase by 20, its maximum energy should increase by 10, and both current life and current energy should equal their new maximum values.
**Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 14: Flee ends battle without rewards

*For any* battle ended by fleeing, the player's model should gain zero experience points and the wild model should not be added to inventory.
**Validates: Requirements 7.4, 7.5**

### Property 15: Zero life triggers permadeath

*For any* player-owned model whose life reaches zero in battle, that model should be removed from the player's inventory and should not be recoverable.
**Validates: Requirements 8.1, 8.2**

### Property 16: Capture available at 15% life threshold

*For any* wild model in battle, when its current life is less than or equal to 15% of its maximum life, the capture option should be available to the player.
**Validates: Requirements 5.1**

### Property 17: Model types have distinct icons

*For any* two different model types in the game, they should have different icon URLs assigned.
**Validates: Requirements 11.4**

### Property 18: All abilities have required fields

*For any* ability in the game, it should have a non-empty name, a valid type (offensive/defensive/buff), a positive energy cost, a positive base power, and a non-empty description.
**Validates: Requirements 4.1, 4.2**

### Property 19: Turn alternation is enforced

*For any* battle in progress, after the player's turn completes, the next turn should be the wild model's turn, and vice versa.
**Validates: Requirements 3.8**

### Property 20: Battle UI displays all required model information

*For any* model displayed in battle, the UI should include its current life, maximum life, current energy, maximum energy, level, and icon.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 21: Inventory UI displays complete model data

*For any* model displayed in inventory, the UI should include its icon, name with version, level, current and maximum life, current and maximum energy, all four abilities with names and descriptions, and active status indicator.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8**

## Error Handling

### Battle System Errors

**Invalid Ability Selection**

- Error: Player attempts to use an ability with insufficient energy
- Handling: Display error message, keep turn active, allow new selection
- Prevention: Disable/gray out abilities that cannot be afforded

**Model Death During Battle**

- Error: Player's model reaches zero life
- Handling: End battle immediately, remove model from inventory, check for game over
- Prevention: Display clear life indicators, warn when life is critical (<25%)

**Empty Inventory**

- Error: Player has no models in inventory
- Handling: Display game over screen with restart option
- Prevention: Ensure player starts with at least one model, warn before last model enters battle

**Invalid Model Selection**

- Error: Player attempts to select non-existent inventory slot
- Handling: Ignore input, maintain current selection
- Prevention: Only allow selection of valid inventory indices

### Encounter System Errors

**Invalid Tile Type**

- Error: Encounter check on non-grass tile
- Handling: Skip encounter check, continue exploration
- Prevention: Only trigger encounter logic on grass tiles

**No Available Models**

- Error: Encounter system cannot generate a wild model
- Handling: Log error, skip encounter, continue exploration
- Prevention: Ensure model pool is never empty, validate on game start

### Save/Load Errors

**Corrupted Save Data**

- Error: Save file is malformed or incompatible version
- Handling: Display error message, start new game with default state
- Prevention: Validate save data structure before loading, use version checking

**Missing Model Definitions**

- Error: Saved model references undefined model type
- Handling: Replace with default model type, log warning
- Prevention: Validate model types against definitions on load

## Testing Strategy

The battle system will be tested using a dual approach combining unit tests for specific scenarios and property-based tests for universal correctness properties.

### Unit Testing Approach

Unit tests will cover:

**Specific Battle Scenarios**

- Player defeats wild model at exactly 15% life (capture threshold edge case)
- Player model dies with no remaining inventory (game over trigger)
- Wild model uses ability with exactly enough energy
- Model levels up from level 9 to 10 (max level boundary)

**Integration Points**

- State transition from exploration to battle
- Battle outcome flowing back to exploration state
- Inventory changes persisting across battles
- Save/load preserving battle-related state

**Edge Cases**

- Zero life triggering permadeath
- Insufficient energy preventing ability use
- Empty inventory triggering game over
- Capture at exactly 15% life threshold

### Property-Based Testing Approach

Property-based tests will verify the 21 correctness properties defined above using **fast-check** (JavaScript/TypeScript property testing library).

**Configuration**

- Minimum 100 iterations per property test
- Custom generators for AI models, abilities, and battle states
- Shrinking enabled to find minimal failing cases

**Test Tagging**
Each property-based test will include a comment tag in this exact format:

```typescript
// **Feature: battle-system, Property N: [property description]**
```

For example:

```typescript
// **Feature: battle-system, Property 3: Model stat scaling follows formulas**
test('model stats scale correctly with level', () => {
    fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (level) => {
            const model = new AIModel('gpt-4-turbo', level);
            expect(model.maxLife).toBe(100 + level * 20);
            expect(model.maxEnergy).toBe(50 + level * 10);
        }),
        { numRuns: 100 }
    );
});
```

**Generator Strategy**

- `arbLevel()`: Generates valid level values (1-10)
- `arbModelType()`: Generates valid model type strings
- `arbAIModel()`: Generates complete AI model instances
- `arbAbility()`: Generates valid abilities with random costs and powers
- `arbBattleState()`: Generates valid battle states with two models

**Property Test Coverage**
Each of the 21 correctness properties will be implemented as a single property-based test. Tests will be placed as close to implementation as possible to catch errors early.

### Test Organization

```
src/
├── __tests__/
│   ├── AIModel.test.ts          # Unit + property tests for AIModel
│   ├── BattleEngine.test.ts     # Unit + property tests for BattleEngine
│   ├── EncounterSystem.test.ts  # Unit + property tests for encounters
│   ├── Inventory.test.ts        # Unit + property tests for inventory
│   └── generators.ts            # Shared property test generators
```

## Implementation Notes

### Performance Considerations

**Encounter Checks**

- Only perform encounter checks when player moves to a new tile
- Cache last tile position to avoid redundant checks
- Use efficient random number generation

**Battle Rendering**

- Only redraw battle UI when state changes
- Use sprite caching for model icons
- Optimize damage number animations with object pooling

**Inventory Management**

- Limit inventory size to prevent performance degradation (suggested: 20 models)
- Use efficient data structures for model lookup
- Lazy load model icons

### Accessibility

**Visual Indicators**

- Use both color and text for life/energy status (not color alone)
- Provide text alternatives for all icons
- Ensure sufficient contrast ratios (WCAG AA minimum)

**Keyboard Navigation**

- Arrow keys for ability selection
- Enter to confirm, Escape to flee
- Tab navigation through inventory

**Screen Reader Support**

- Announce battle state changes
- Describe ability effects clearly
- Provide context for all UI elements

### Future Enhancements

**Phase 2 Features** (not in current scope)

- Model evolution at specific levels
- Status effects (poison, burn, paralysis)
- Held items that modify stats or abilities
- Multiplayer battles
- Trading models between players
- Breeding system for new models
- Shiny variants with different colors
- Achievement system for collecting all models

**Balance Tuning**

- Adjust encounter rate based on player feedback
- Fine-tune ability costs and damage values
- Modify experience curves for better progression
- Add difficulty settings (easy/normal/hard)
