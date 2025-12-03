import * as fc from 'fast-check';
import { MODEL_DEFINITIONS } from '../types.js';

// Generator for valid level values (1-10)
export const arbLevel = (): fc.Arbitrary<number> => {
    return fc.integer({ min: 1, max: 10 });
};

// Generator for valid model type strings
export const arbModelType = (): fc.Arbitrary<string> => {
    const modelTypes = Object.keys(MODEL_DEFINITIONS);
    return fc.constantFrom(...modelTypes);
};

// Generator for model type and level pair
export const arbModelTypeAndLevel = (): fc.Arbitrary<{ modelType: string; level: number }> => {
    return fc.record({
        modelType: arbModelType(),
        level: arbLevel()
    });
};
