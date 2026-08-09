// Vitest mock for `$app/environment`. `browser` is false so code paths that
// touch IndexedDB / window are skipped in unit tests.
export const browser = false;
export const dev = false;
export const building = false;
export const version = 'test';
