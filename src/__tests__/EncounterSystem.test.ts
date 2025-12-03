import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { EncounterSystem } from '../EncounterSystem.js';

describe('EncounterSystem', () => {
    // **Feature: battle-system, Property 1: Grass encounter probability converges to 15%**
    // **Validates: Requirements 1.3**
    it('should have encounter probability converge to 15% over many grass encounters', () => {
        fc.assert(
            fc.property(fc.constant(null), () => {
                const encounterSystem = new EncounterSystem();
                const numTrials = 5000; // Large sample for statistical convergence
                let encounterCount = 0;
                
                // Run many encounter checks on grass tiles
                for (let i = 0; i < numTrials; i++) {
                    // Reset to ensure each check is independent
                    encounterSystem.resetLastTile();
                    
                    // Simulate moving to a new grass tile
                    // Use different positions to ensure we're on "new" tiles
                    const x = (i % 100) * 32 + 16; // Center of tile
                    const y = Math.floor(i / 100) * 32 + 16;
                    
                    const result = encounterSystem.checkEncounter(x, y, 'grass');
                    if (result !== null) {
                        encounterCount++;
                    }
                }
                
                const actualRate = encounterCount / numTrials;
                const expectedRate = 0.15;
                
                // Use 3 standard deviations for 99.7% confidence
                // For binomial distribution: σ = sqrt(n * p * (1-p)) / n
                const standardError = Math.sqrt(expectedRate * (1 - expectedRate) / numTrials);
                const tolerance = 3 * standardError; // ~0.015 for n=5000
                
                // The encounter rate should be within statistical tolerance of 15%
                expect(actualRate).toBeGreaterThanOrEqual(expectedRate - tolerance);
                expect(actualRate).toBeLessThanOrEqual(expectedRate + tolerance);
            }),
            { numRuns: 100 }
        );
    });
    
    it('should not trigger encounters on non-grass tiles', () => {
        const encounterSystem = new EncounterSystem();
        const tileTypes = ['ground', 'path', 'tree'];
        
        for (const tileType of tileTypes) {
            encounterSystem.resetLastTile();
            const result = encounterSystem.checkEncounter(100, 100, tileType);
            expect(result).toBeNull();
        }
    });
    
    it('should not trigger duplicate encounters on the same tile', () => {
        const encounterSystem = new EncounterSystem();
        
        // First check on a tile
        const firstResult = encounterSystem.checkEncounter(100, 100, 'grass');
        
        // Second check on the same tile (same tile coordinates)
        const secondResult = encounterSystem.checkEncounter(100, 100, 'grass');
        
        // Second result should always be null (no duplicate check)
        expect(secondResult).toBeNull();
    });
    
    it('should generate wild models with valid types and levels', () => {
        const encounterSystem = new EncounterSystem();
        
        for (let i = 0; i < 50; i++) {
            const model = encounterSystem.generateWildModel();
            
            expect(model).toBeDefined();
            expect(model.data.level).toBeGreaterThanOrEqual(1);
            expect(model.data.level).toBeLessThanOrEqual(10);
            expect(['gpt-4-turbo', 'claude-3-5-sonnet', 'llama-3-70b', 'gemini-pro']).toContain(model.data.id);
        }
    });
    
    it('should select random model types from the pool', () => {
        const encounterSystem = new EncounterSystem();
        const selectedTypes = new Set<string>();
        
        // Generate many selections to ensure randomness
        for (let i = 0; i < 100; i++) {
            const modelType = encounterSystem.selectRandomModelType();
            selectedTypes.add(modelType);
        }
        
        // Should have selected multiple different types (with high probability)
        expect(selectedTypes.size).toBeGreaterThan(1);
    });
    
    it('should generate levels within configured range', () => {
        const encounterSystem = new EncounterSystem({ minLevel: 3, maxLevel: 7 });
        
        for (let i = 0; i < 50; i++) {
            const level = encounterSystem.generateModelLevel();
            expect(level).toBeGreaterThanOrEqual(3);
            expect(level).toBeLessThanOrEqual(7);
        }
    });
});
