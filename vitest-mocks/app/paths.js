// Vitest mock for `$app/paths`.
export const asset = (path) => String(path);
export const resolve = (path) => (String(path).startsWith('/') ? String(path) : `/${path}`);
export const match = async () => null;
