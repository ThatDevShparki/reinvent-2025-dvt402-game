import { AIModel } from './AIModel.js';
import { AIModelData } from './types.js';

export class Inventory {
    private models: AIModel[];
    private activeModelIndex: number;
    private maxSize: number;

    constructor(maxSize: number = 20) {
        this.models = [];
        this.activeModelIndex = -1;
        this.maxSize = maxSize;
    }

    // Model management
    addModel(model: AIModel): boolean {
        if (this.models.length >= this.maxSize) {
            return false;
        }

        // Restore model to full when adding to inventory
        model.restoreToFull();
        this.models.push(model);

        // If this is the first model, set it as active
        if (this.models.length === 1) {
            this.activeModelIndex = 0;
        }

        return true;
    }

    removeModel(modelId: string): void {
        const index = this.models.findIndex(m => m.data.id === modelId);
        
        if (index === -1) {
            return;
        }

        // Remove the model
        this.models.splice(index, 1);

        // Adjust active model index if necessary
        if (this.activeModelIndex === index) {
            // If we removed the active model, set to first available or -1
            this.activeModelIndex = this.models.length > 0 ? 0 : -1;
        } else if (this.activeModelIndex > index) {
            // If we removed a model before the active one, adjust index
            this.activeModelIndex--;
        }
    }

    getActiveModel(): AIModel | null {
        if (this.activeModelIndex >= 0 && this.activeModelIndex < this.models.length) {
            return this.models[this.activeModelIndex];
        }
        return null;
    }

    setActiveModel(index: number): boolean {
        if (index >= 0 && index < this.models.length) {
            this.activeModelIndex = index;
            return true;
        }
        return false;
    }

    // Query methods
    getModelCount(): number {
        return this.models.length;
    }

    hasModels(): boolean {
        return this.models.length > 0;
    }

    findModelById(id: string): AIModel | null {
        const model = this.models.find(m => m.data.id === id);
        return model || null;
    }

    // Get all models (for UI display)
    getAllModels(): AIModel[] {
        return [...this.models];
    }

    getActiveModelIndex(): number {
        return this.activeModelIndex;
    }

    // Persistence methods
    save(): string {
        const saveData = {
            models: this.models.map(m => m.data),
            activeModelIndex: this.activeModelIndex
        };
        return JSON.stringify(saveData);
    }

    load(saveDataString: string): boolean {
        try {
            const saveData = JSON.parse(saveDataString);
            
            // Validate save data structure
            if (!saveData.models || !Array.isArray(saveData.models)) {
                return false;
            }

            // Clear current inventory
            this.models = [];
            
            // Reconstruct models from saved data
            for (const modelData of saveData.models) {
                const model = new AIModel(modelData.id, modelData.level);
                
                // Restore saved state
                model.data.experience = modelData.experience;
                model.data.currentLife = modelData.currentLife;
                model.data.currentEnergy = modelData.currentEnergy;
                model.data.maxLife = modelData.maxLife;
                model.data.maxEnergy = modelData.maxEnergy;
                
                this.models.push(model);
            }

            // Restore active model index
            this.activeModelIndex = saveData.activeModelIndex;
            
            // Validate active model index
            if (this.activeModelIndex >= this.models.length) {
                this.activeModelIndex = this.models.length > 0 ? 0 : -1;
            }

            return true;
        } catch (error) {
            console.error('Failed to load inventory:', error);
            return false;
        }
    }
}
