export var Direction;
(function (Direction) {
    Direction["UP"] = "up";
    Direction["DOWN"] = "down";
    Direction["LEFT"] = "left";
    Direction["RIGHT"] = "right";
})(Direction || (Direction = {}));
export var BattlePhase;
(function (BattlePhase) {
    BattlePhase["PLAYER_TURN"] = "PLAYER_TURN";
    BattlePhase["WILD_TURN"] = "WILD_TURN";
    BattlePhase["ABILITY_ANIMATION"] = "ABILITY_ANIMATION";
    BattlePhase["BATTLE_END"] = "BATTLE_END";
})(BattlePhase || (BattlePhase = {}));
export var BattleOutcome;
(function (BattleOutcome) {
    BattleOutcome["PLAYER_VICTORY"] = "PLAYER_VICTORY";
    BattleOutcome["PLAYER_DEFEAT"] = "PLAYER_DEFEAT";
    BattleOutcome["FLED"] = "FLED";
    BattleOutcome["CAPTURED"] = "CAPTURED";
})(BattleOutcome || (BattleOutcome = {}));
// Model Definitions - 4 AI models with their abilities
export const MODEL_DEFINITIONS = {
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
