import { AIModel } from './AIModel.js';
import { MODEL_DEFINITIONS } from './types.js';

export interface EncounterConfig {
    encounterRate: number; // 0.15 for 15%
    modelPool: string[]; // Available model types
    minLevel: number;
    maxLevel: number;
}

export class EncounterSystem {
    config: EncounterConfig;
    lastTilePosition: { x: number, y: number };
    
    constructor(config?: Partial<EncounterConfig>) {
        // Default configuration
        this.config = {
            encounterRate: 0.15, // 15% encounter rate
            modelPool: Object.keys(MODEL_DEFINITIONS),
            minLevel: 1,
            maxLevel: 10,
            ...config
        };
        
        this.lastTilePosition = { x: -1, y: -1 };
    }
    
    /**
     * Check if an encounter should occur based on player position and tile type
     * Returns an AIModel if encounter triggered, null otherwise
     * @param playerX - X coordinate of player (should be center position)
     * @param playerY - Y coordinate of player (should be center position)
     * @param tileType - Type of tile the player is on
     */
    checkEncounter(playerX: number, playerY: number, tileType: string): AIModel | null {
        // Only trigger encounters on grass tiles
        if (tileType !== 'grass') {
            return null;
        }
        
        // Calculate tile position (assuming 32x32 tile size)
        const tileX = Math.floor(playerX / 32);
        const tileY = Math.floor(playerY / 32);
        
        // Check if player moved to a new tile
        if (tileX === this.lastTilePosition.x && tileY === this.lastTilePosition.y) {
            return null; // Still on same tile, no new check
        }
        
        // Update last tile position
        this.lastTilePosition = { x: tileX, y: tileY };
        
        // Generate random encounter check
        if (Math.random() < this.config.encounterRate) {
            return this.generateWildModel();
        }
        
        return null;
    }
    
    /**
     * Generate a random wild AI model
     */
    generateWildModel(): AIModel {
        const modelType = this.selectRandomModelType();
        const level = this.generateModelLevel();
        return new AIModel(modelType, level);
    }
    
    /**
     * Select a random model type from the model pool
     */
    selectRandomModelType(): string {
        const randomIndex = Math.floor(Math.random() * this.config.modelPool.length);
        return this.config.modelPool[randomIndex];
    }
    
    /**
     * Generate a random level for a wild model
     */
    generateModelLevel(): number {
        const range = this.config.maxLevel - this.config.minLevel + 1;
        return this.config.minLevel + Math.floor(Math.random() * range);
    }
    
    /**
     * Reset the last tile position (useful for testing or state reset)
     */
    resetLastTile(): void {
        this.lastTilePosition = { x: -1, y: -1 };
    }
}
