# Implementation Plan

- [x] 1. Set up battle system data structures and types
  - Create TypeScript interfaces for Ability, AIModelData, and battle-related types
  - Define MODEL_DEFINITIONS constant with 4 AI models (GPT-4 Turbo, Claude 3.5 Sonnet, Llama 3 70B, Gemini Pro)
  - Add battle state enums (BattlePhase, BattleOutcome)
  - Update existing types.ts with new interfaces
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 11.1_

- [x] 2. Implement AIModel class with stat calculations
  - Create AIModel class with constructor that accepts model type and level
  - Implement stat calculation methods (calculateMaxLife, calculateMaxEnergy, calculateAbilityPower)
  - Implement combat methods (useAbility, takeDamage, consumeEnergy)
  - Implement progression methods (gainExperience, levelUp)
  - Implement state check methods (isAlive, canUseAbility, isCapturable)
  - Add restoreToFull method for inventory addition
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 2.1 Write property test for AIModel stat scaling
  - **Property 3: Model stat scaling follows formulas**
  - **Validates: Requirements 2.1, 2.2, 2.7, 2.8**

- [x] 2.2 Write property test for AIModel ability composition
  - **Property 4: Models have correct ability composition**
  - **Validates: Requirements 2.4, 2.5, 2.6**

- [x] 2.3 Write property test for AIModel level bounds
  - **Property 5: Level must be within valid range**
  - **Validates: Requirements 2.3**

- [x] 2.4 Write property test for ability power scaling
  - **Property 8: Ability power scales with level**
  - **Validates: Requirements 4.3**

- [x] 2.5 Write property test for level up stat increases
  - **Property 13: Level up increases stats and restores pools**
  - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

- [x] 3. Implement Inventory class
  - Create Inventory class with model storage array
  - Implement addModel method with full restoration
  - Implement removeModel method for permadeath
  - Implement getActiveModel and setActiveModel methods
  - Add query methods (getModelCount, hasModels, findModelById)
  - Implement save/load methods for persistence
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.1, 8.2_

- [x] 3.1 Write property test for inventory restoration
  - **Property 10: Inventory addition restores model to full**
  - **Validates: Requirements 5.2, 5.3**

- [x] 3.2 Write property test for active model persistence
  - **Property 11: Active model selection persists**
  - **Validates: Requirements 5.6**

- [x] 3.3 Write property test for permadeath removal
  - **Property 15: Zero life triggers permadeath**
  - **Validates: Requirements 8.1, 8.2**

- [ ] 4. Implement EncounterSystem class
  - Create EncounterSystem class with encounter rate configuration (15%)
  - Implement checkEncounter method that detects grass tiles and generates random checks
  - Implement generateWildModel method that creates random AI models
  - Implement selectRandomModelType method to choose from model pool
  - Add generateModelLevel method for random level generation (1-10)
  - Track last tile position to avoid duplicate checks
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4.1 Write property test for encounter probability
  - **Property 1: Grass encounter probability converges to 15%**
  - **Validates: Requirements 1.3**

- [ ] 5. Implement BattleEngine class
  - Create BattleEngine class with player and wild model references
  - Implement turn management (startPlayerTurn, executePlayerAction)
  - Implement wild model AI (selectWildAbility with random selection)
  - Implement ability execution logic (processTurn, apply damage/effects)
  - Add battle end condition checking (checkBattleEnd)
  - Implement capture and kill mechanics (executeCapture, executeKill)
  - Implement flee functionality (executeFlee)
  - Add isCaptureAvailable method (checks 15% threshold)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 5.1, 7.1, 7.2_

- [ ] 5.1 Write property test for energy consumption
  - **Property 6: Ability execution consumes energy**
  - **Validates: Requirements 3.4**

- [ ] 5.2 Write property test for offensive damage
  - **Property 7: Offensive abilities reduce target life**
  - **Validates: Requirements 3.5**

- [ ] 5.3 Write property test for insufficient energy prevention
  - **Property 9: Insufficient energy prevents ability use**
  - **Validates: Requirements 4.5**

- [ ] 5.4 Write property test for turn alternation
  - **Property 19: Turn alternation is enforced**
  - **Validates: Requirements 3.8**

- [ ] 5.5 Write property test for capture threshold
  - **Property 16: Capture available at 15% life threshold**
  - **Validates: Requirements 5.1**

- [ ] 6. Implement BattleUI class
  - Create BattleUI class with rendering state management
  - Implement render method that orchestrates all battle UI elements
  - Implement renderModels to display both combatants with icons
  - Implement renderStats to show life, energy, and level bars/numbers
  - Implement renderAbilityMenu with ability names, costs, and descriptions
  - Implement renderCaptureOptions for capture/kill choice
  - Implement renderDamageNumbers with animation
  - Add input handling methods (handleAbilitySelection, handleCaptureChoice)
  - Implement update method for animation timing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 6.1 Write property test for battle UI completeness
  - **Property 20: Battle UI displays all required model information**
  - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 7. Implement InventoryUI class
  - Create InventoryUI class with visibility and selection state
  - Implement show/hide/toggle methods
  - Implement render method for inventory screen
  - Implement renderModelCard to display individual models with all stats
  - Implement renderModelIcon to show model logos
  - Implement renderAbilityList to show all 4 abilities
  - Add active model indicator rendering
  - Implement input handling (handleSelection, handleConfirm)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [ ] 7.1 Write property test for inventory UI completeness
  - **Property 21: Inventory UI displays complete model data**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8**

- [ ] 8. Integrate battle system into main game loop
  - Add game state enum (exploration, battle) to Game class
  - Create instances of Inventory, EncounterSystem, BattleEngine, BattleUI, InventoryUI
  - Modify update method to check for encounters during exploration
  - Add battle state update logic that processes battle turns
  - Implement state transition logic (exploration ↔ battle)
  - Add keyboard input handling for battle actions (ability selection, flee)
  - Add keyboard input for inventory toggle (e.g., 'I' key)
  - Give player a starter model on game initialization
  - _Requirements: 1.5, 3.2, 7.3, 8.3, 8.4, 8.5_

- [ ] 8.1 Write property test for battle state transition
  - **Property 2: Battle initiation transitions to battle state**
  - **Validates: Requirements 1.5**

- [ ] 8.2 Write property test for flee consequences
  - **Property 14: Flee ends battle without rewards**
  - **Validates: Requirements 7.4, 7.5**

- [ ] 8.3 Write property test for victory experience reward
  - **Property 12: Victory awards experience**
  - **Validates: Requirements 6.1**

- [ ] 9. Update rendering pipeline for battle and inventory
  - Modify Game.render to check game state and render appropriate UI
  - Add battle rendering path that calls BattleUI.render
  - Add inventory overlay rendering that calls InventoryUI.render
  - Ensure exploration rendering continues in background during inventory view
  - Pause exploration rendering during battle
  - _Requirements: 1.6, 1.7, 9.1, 9.2, 9.3, 10.1_

- [ ] 10. Add model icon assets and loading
  - Create assets/icons directory structure
  - Add placeholder icons for 4 AI models (OpenAI, Anthropic, Meta, Google logos)
  - Implement icon loading system in Game class
  - Add error handling for missing icons (fallback to colored squares)
  - Ensure icons are rendered at appropriate sizes (32x32 for battle, 48x48 for inventory)
  - _Requirements: 11.2, 11.3, 11.5_

- [ ] 10.1 Write property test for distinct model icons
  - **Property 17: Model types have distinct icons**
  - **Validates: Requirements 11.4**

- [ ] 11. Implement save/load system for battle data
  - Extend existing save system to include inventory data
  - Save active model index
  - Save all collected models with their stats and experience
  - Implement load validation to handle corrupted data
  - Add version checking for save compatibility
  - Handle missing model definitions gracefully
  - _Requirements: 5.4, 5.5, 5.6_

- [ ] 12. Add error handling and edge cases
  - Implement insufficient energy error display in BattleUI
  - Add game over screen for empty inventory after model death
  - Implement critical life warning (visual indicator at <25% life)
  - Add validation for ability selection
  - Handle invalid inventory selections gracefully
  - Add error logging for encounter system failures
  - _Requirements: 4.4, 4.5, 8.3, 8.4, 8.5_

- [ ] 12.1 Write property test for ability field validation
  - **Property 18: All abilities have required fields**
  - **Validates: Requirements 4.1, 4.2**

- [ ] 12.2 Write unit tests for edge cases
  - Test capture at exactly 15% life
  - Test game over with zero inventory
  - Test ability use with exactly enough energy
  - Test level up at max level boundary

- [ ] 13. Polish and visual feedback
  - Add screen shake effect when damage is dealt
  - Implement smooth transitions between exploration and battle
  - Add particle effects for ability animations
  - Implement damage number floating animation
  - Add sound effect hooks (prepare for future audio)
  - Ensure all UI elements use Kiro purple (#790ECB) accent color
  - Add hover effects for ability selection
  - Implement smooth inventory slide-in animation
  - _Requirements: 9.6, 9.7_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
