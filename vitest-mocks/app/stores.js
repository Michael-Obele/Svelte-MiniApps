import { readable } from 'svelte/store';

export const page = readable({});
export const navigating = readable(null);
export const updated = { subscribe: () => () => {} };
