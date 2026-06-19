import { gameState } from '../state.js';

export const getStrings = (scene) => {
    const strings = scene.cache.json.get('strings');
    return strings?.[gameState.language] ?? strings?.en ?? {};
}

export const getText = (scene, key) => getStrings(scene)[key] ?? key;
