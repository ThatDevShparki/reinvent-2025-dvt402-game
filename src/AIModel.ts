import { Ability, AIModelData, MODEL_DEFINITIONS } from './types.js';

export interface AbilityResult {
    success: boolean;
    damage?: number;
    effect?: string;
    message: string;
}

export class AIModel {
    data: AIModelData;
    private static readonly MAX_LEVEL = 10;
    private static readonly CAPTURE_THRESHOLD = 0.15;

    constructor(modelType: string, level: number) {
        // Validate model type exists
        const definition = MODEL_DEFINITIONS[modelType];
        if (!definition) {
            throw new Error(`Unknown model type: ${modelType}`);
        }

        // Validate level is within bounds
        if (level < 1 || level > AIModel.MAX_LEVEL) {
            throw new Error(`Level must be between 1 and ${AIModel.MAX_LEVEL}`);
        }

        // Initialize model data
        const maxLife = this.calculateMaxLife(level);
        const maxEnergy = this.calculateMaxEnergy(level);

        this.data = {
            id: modelType,
            name: definition.name,
            version: definition.version,
            iconUrl: definition.iconUrl,
            companyName: definition.company,
            level: level,
            experience: 0,
            currentLife: maxLife,
            maxLife: maxLife,
            currentEnergy: maxEnergy,
            maxEnergy: maxEnergy,
            abilities: definition.abilities
        };
    }

    // Stat calculations
    calculateMaxLife(level?: number): number {
        const lvl = level ?? this.data.level;
        return 100 + (lvl * 20);
    }

    calculateMaxEnergy(level?: number): number {
        const lvl = level ?? this.data.level;
        return 50 + (lvl * 10);
    }

    calculateAbilityPower(ability: Ability): number {
        return ability.basePower * (1 + this.data.level * 0.1);
    }

    // Combat actions
    useAbility(ability: Ability, target: AIModel): AbilityResult {
        // Check if ability is valid for this model
        if (!this.data.abilities.includes(ability)) {
            return {
                success: false,
                message: 'This model does not have that ability'
            };
        }

        // Check if model can use the ability
        if (!this.canUseAbility(ability)) {
            return {
                success: false,
                message: 'Insufficient energy'
            };
        }

        // Consume energy
        this.consumeEnergy(ability.energyCost);

        // Calculate effective power
        const effectivePower = this.calculateAbilityPower(ability);

        // Apply ability effects based on type
        switch (ability.type) {
            case 'offensive':
                target.takeDamage(effectivePower);
                return {
                    success: true,
                    damage: effectivePower,
                    message: `${this.data.name} used ${ability.name} for ${effectivePower.toFixed(1)} damage!`
                };
            
            case 'defensive':
                return {
                    success: true,
                    effect: 'defense',
                    message: `${this.data.name} used ${ability.name}! Defense increased!`
                };
            
            case 'buff':
                return {
                    success: true,
                    effect: 'buff',
                    message: `${this.data.name} used ${ability.name}! Stats boosted!`
                };
            
            default:
                return {
                    success: false,
                    message: 'Unknown ability type'
                };
        }
    }

    takeDamage(amount: number): void {
        this.data.currentLife = Math.max(0, this.data.currentLife - amount);
    }

    consumeEnergy(amount: number): boolean {
        if (this.data.currentEnergy >= amount) {
            this.data.currentEnergy -= amount;
            return true;
        }
        return false;
    }

    // Progression
    gainExperience(amount: number): boolean {
        this.data.experience += amount;
        const experienceNeeded = this.data.level * 100;
        
        if (this.data.experience >= experienceNeeded && this.data.level < AIModel.MAX_LEVEL) {
            this.data.experience -= experienceNeeded;
            this.levelUp();
            return true;
        }
        
        return false;
    }

    levelUp(): void {
        if (this.data.level >= AIModel.MAX_LEVEL) {
            return;
        }

        this.data.level += 1;
        
        // Recalculate max stats
        this.data.maxLife = this.calculateMaxLife();
        this.data.maxEnergy = this.calculateMaxEnergy();
        
        // Restore to full
        this.data.currentLife = this.data.maxLife;
        this.data.currentEnergy = this.data.maxEnergy;
    }

    // State checks
    isAlive(): boolean {
        return this.data.currentLife > 0;
    }

    canUseAbility(ability: Ability): boolean {
        return this.data.currentEnergy >= ability.energyCost;
    }

    isCapturable(): boolean {
        return this.data.currentLife <= this.data.maxLife * AIModel.CAPTURE_THRESHOLD;
    }

    // Restoration
    restoreToFull(): void {
        this.data.currentLife = this.data.maxLife;
        this.data.currentEnergy = this.data.maxEnergy;
    }
}
