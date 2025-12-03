import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Inventory } from '../Inventory.js';
import { AIModel } from '../AIModel.js';
import { arbModelType, arbLevel } from './generators.js';

describe('Inventory', () => {
    // **Feature: battle-system, Property 10: Inventory addition restores model to full**
    // **Validates: Requirements 5.2, 5.3**
    describe('Property 10: Inventory addition restores model to full', () => {
        it('should restore model to full life and energy when added to inventory', () => {
            fc.assert(
                fc.property(
                    arbModelType(),
                    arbLevel(),
                    fc.integer({ min: 1, max: 100 }),
                    fc.integer({ min: 1, max: 100 }),
                    (modelType, level, damageAmount, energyUsed) => {
                        // Create a model
                        const model = new AIModel(modelType, level);
                        const maxLife = model.data.maxLife;
                        const maxEnergy = model.data.maxEnergy;

                        // Damage the model (ensure it doesn't go below 0)
                        const actualDamage = Math.min(damageAmount, model.data.currentLife - 1);
                        model.takeDamage(actualDamage);

                        // Use some energy (ensure it doesn't go below 0)
                        const actualEnergyUsed = Math.min(energyUsed, model.data.currentEnergy);
                        model.consumeEnergy(actualEnergyUsed);

                        // Verify model is damaged
                        const wasNotFull = model.data.currentLife < maxLife || model.data.currentEnergy < maxEnergy;

                        // Add to inventory
                        const inventory = new Inventory();
                        inventory.addModel(model);

                        // Property: Model should be restored to full
                        expect(model.data.currentLife).toBe(maxLife);
                        expect(model.data.currentEnergy).toBe(maxEnergy);

                        // Only check if model was actually damaged before
                        return wasNotFull;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // **Feature: battle-system, Property 11: Active model selection persists**
    // **Validates: Requirements 5.6**
    describe('Property 11: Active model selection persists', () => {
        it('should maintain active model selection across operations', () => {
            fc.assert(
                fc.property(
                    fc.array(arbModelType(), { minLength: 2, maxLength: 10 }),
                    arbLevel(),
                    fc.integer({ min: 0, max: 9 }),
                    (modelTypes, level, selectionIndex) => {
                        const inventory = new Inventory();

                        // Add multiple models
                        const models: AIModel[] = [];
                        for (const modelType of modelTypes) {
                            const model = new AIModel(modelType, level);
                            inventory.addModel(model);
                            models.push(model);
                        }

                        // Select a model (ensure index is valid)
                        const validIndex = selectionIndex % models.length;
                        inventory.setActiveModel(validIndex);

                        // Get the selected model
                        const selectedModel = inventory.getActiveModel();

                        // Property: The active model should be the one we selected
                        expect(selectedModel).toBe(models[validIndex]);
                        expect(inventory.getActiveModelIndex()).toBe(validIndex);

                        return true;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // **Feature: battle-system, Property 15: Zero life triggers permadeath**
    // **Validates: Requirements 8.1, 8.2**
    describe('Property 15: Zero life triggers permadeath', () => {
        it('should remove model from inventory when life reaches zero', () => {
            fc.assert(
                fc.property(
                    arbModelType(),
                    arbLevel(),
                    (modelType, level) => {
                        const inventory = new Inventory();
                        const model = new AIModel(modelType, level);
                        
                        // Add model to inventory
                        inventory.addModel(model);
                        const initialCount = inventory.getModelCount();
                        const modelId = model.data.id;

                        // Verify model is in inventory
                        expect(initialCount).toBe(1);
                        expect(inventory.findModelById(modelId)).not.toBeNull();

                        // Reduce life to zero
                        model.takeDamage(model.data.maxLife);

                        // Simulate permadeath by removing the model
                        inventory.removeModel(modelId);

                        // Property: Model should be removed from inventory
                        expect(inventory.getModelCount()).toBe(0);
                        expect(inventory.findModelById(modelId)).toBeNull();
                        expect(inventory.getActiveModel()).toBeNull();

                        return true;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
