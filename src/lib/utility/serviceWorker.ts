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
    .register('/service-worker.js')
    .then((registration) => {
      console.log('[ServiceWorker] Registration successful:', {
        scope: registration.scope,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting
      });

      // Handle updates when a new service worker is found
      registration.addEventListener('updatefound', () => {
        console.log('[ServiceWorker] New service worker being installed');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // When the new service worker is installed and there's an existing controller
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[ServiceWorker] New version available');
              if (window.confirm('A new version of the app is available. Load new version?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle the case when a new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[ServiceWorker] New service worker activated');
        if (window.confirm('A new version of the app is available. Load new version?')) {
          window.location.reload();
        }
      });
    })
    .catch((error) => {
      console.error('[ServiceWorker] Registration failed:', error);
    });
}
