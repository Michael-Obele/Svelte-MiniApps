import { registerServiceWorker } from '$lib/utility/serviceWorker';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  console.log('[Layout] Initializing app...');
  registerServiceWorker();
  console.log('[Layout] Service worker registration initiated');
  return {};
};
