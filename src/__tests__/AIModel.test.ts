import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { AIModel } from '../AIModel.js';
import { arbLevel, arbModelType, arbModelTypeAndLevel } from './generators.js';
import { MODEL_DEFINITIONS } from '../types.js';

describe('AIModel Property-Based Tests', () => {
    // **Feature: battle-system, Property 3: Model stat scaling follows formulas**
    test('Property 3: Model stat scaling follows formulas', () => {
        fc.assert(
            fc.property(arbModelTypeAndLevel(), ({ modelType, level }) => {
                const model = new AIModel(modelType, level);
                
                // Life scaling: Base 100 + (level * 20)
                const expectedMaxLife = 100 + (level * 20);
                expect(model.data.maxLife).toBe(expectedMaxLife);
                expect(model.calculateMaxLife()).toBe(expectedMaxLife);
                
                // Energy scaling: Base 50 + (level * 10)
                const expectedMaxEnergy = 50 + (level * 10);
                expect(model.data.maxEnergy).toBe(expectedMaxEnergy);
                expect(model.calculateMaxEnergy()).toBe(expectedMaxEnergy);
            }),
            { numRuns: 100 }
        );
    });

    // **Feature: battle-system, Property 4: Models have correct ability composition**
    test('Property 4: Models have correct ability composition', () => {
        fc.assert(
            fc.property(arbModelTypeAndLevel(), ({ modelType, level }) => {
                const model = new AIModel(modelType, level);
                
                // Should have exactly 4 abilities
                expect(model.data.abilities).toHaveLength(4);
                
                // Count abilities by type
                const offensiveCount = model.data.abilities.filter(a => a.type === 'offensive').length;
                const defensiveCount = model.data.abilities.filter(a => a.type === 'defensive').length;
                const buffCount = model.data.abilities.filter(a => a.type === 'buff').length;
                
                // Should have exactly 2 offensive, 1 defensive, 1 buff
                expect(offensiveCount).toBe(2);
                expect(defensiveCount).toBe(1);
                expect(buffCount).toBe(1);
            }),
            { numRuns: 100 }
        );
    });

    // **Feature: battle-system, Property 5: Level must be within valid range**
    test('Property 5: Level must be within valid range', () => {
        fc.assert(
            fc.property(arbModelTypeAndLevel(), ({ modelType, level }) => {
                const model = new AIModel(modelType, level);
                
                // Level should be between 1 and 10 (inclusive)
                expect(model.data.level).toBeGreaterThanOrEqual(1);
                expect(model.data.level).toBeLessThanOrEqual(10);
            }),
            { numRuns: 100 }
        );
    });

    // **Feature: battle-system, Property 8: Ability power scales with level**
    test('Property 8: Ability power scales with level', () => {
        fc.assert(
            fc.property(arbModelTypeAndLevel(), ({ modelType, level }) => {
                const model = new AIModel(modelType, level);
                
                // Test each ability's power scaling
                model.data.abilities.forEach(ability => {
                    const effectivePower = model.calculateAbilityPower(ability);
                    const expectedPower = ability.basePower * (1 + level * 0.1);
                    
                    // Use toBeCloseTo for floating point comparison
                    expect(effectivePower).toBeCloseTo(expectedPower, 5);
                });
            }),
            { numRuns: 100 }
        );
    });

    // **Feature: battle-system, Property 13: Level up increases stats and restores pools**
    test('Property 13: Level up increases stats and restores pools', () => {
        fc.assert(
            fc.property(
                arbModelType(),
                fc.integer({ min: 1, max: 9 }), // Start at level 1-9 so we can level up
                (modelType, startLevel) => {
                    const model = new AIModel(modelType, startLevel);
                    
                    // Record stats before level up
                    const oldLevel = model.data.level;
                    const oldMaxLife = model.data.maxLife;
                    const oldMaxEnergy = model.data.maxEnergy;
                    
                    // Damage the model to test restoration
                    model.takeDamage(10);
                    model.consumeEnergy(10);
                    
                    // Level up
                    model.levelUp();
                    
                    // Check level increased by 1
                    expect(model.data.level).toBe(oldLevel + 1);
                    
                    // Check max life increased by 20
                    expect(model.data.maxLife).toBe(oldMaxLife + 20);
                    
                    // Check max energy increased by 10
                    expect(model.data.maxEnergy).toBe(oldMaxEnergy + 10);
                    
                    // Check current life restored to new max
                    expect(model.data.currentLife).toBe(model.data.maxLife);
                    
                    // Check current energy restored to new max
                    expect(model.data.currentEnergy).toBe(model.data.maxEnergy);
                }
            ),
            { numRuns: 100 }
        );
    });
});
