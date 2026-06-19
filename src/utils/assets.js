export const assetPath = (path) => new URL(`../../${path}`, import.meta.url).href;
