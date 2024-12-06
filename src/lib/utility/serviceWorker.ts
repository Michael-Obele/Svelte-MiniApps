export function registerServiceWorker() {
  if (typeof window === 'undefined') {
    console.log('[ServiceWorker] Skipping registration - not in browser');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[ServiceWorker] Skipping registration - service workers not supported');
    return;
  }

  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    console.log('[ServiceWorker] Skipping registration - not on HTTPS or localhost');
    return;
  }

  console.log('[ServiceWorker] Starting registration...');
  navigator.serviceWorker
    .register('/service-worker.js', { 
      type: 'module',
      updateViaCache: 'all' // Changed to 'all' to respect cache headers
    })
    .then((registration) => {
      console.log('[ServiceWorker] Registration successful:', {
        scope: registration.scope,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting
      });

      // Check for updates daily instead of hourly
      const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
      let lastCheck = Date.now();

      setInterval(() => {
        // Only check if it's been at least CHECK_INTERVAL since the last check
        if (Date.now() - lastCheck >= CHECK_INTERVAL) {
          console.log('[ServiceWorker] Checking for updates...');
          lastCheck = Date.now();
          registration.update();
        }
      }, CHECK_INTERVAL);

      // Handle updates when a new service worker is found
      registration.addEventListener('updatefound', () => {
        console.log('[ServiceWorker] New service worker being installed');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Only reload if there's an existing controller (not first install)
              console.log('[ServiceWorker] New version installed, will reload on next visit');
              // Don't force reload, let the user refresh naturally
              // window.location.reload();
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error('[ServiceWorker] Registration failed:', error);
    });
}
