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
      updateViaCache: 'none'
    })
    .then((registration) => {
      console.log('[ServiceWorker] Registration successful:', {
        scope: registration.scope,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting
      });

      // Check for updates every hour
      setInterval(() => {
        console.log('[ServiceWorker] Checking for updates...');
        registration.update();
      }, 60 * 60 * 1000);

      // Handle updates when a new service worker is found
      registration.addEventListener('updatefound', () => {
        console.log('[ServiceWorker] New service worker being installed');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              console.log('[ServiceWorker] New version installed');
              window.location.reload();
            }
          });
        }
      });

      // Handle the case when a new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[ServiceWorker] New service worker activated');
        window.location.reload();
      });
    })
    .catch((error) => {
      console.error('[ServiceWorker] Registration failed:', error);
    });
}
