import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  console.log('[Layout] Initializing app...');
  // Service worker is now handled by vite-pwa in +layout.svelte
  console.log('[Layout] Service worker registration handled by vite-pwa');
  return {};
};
