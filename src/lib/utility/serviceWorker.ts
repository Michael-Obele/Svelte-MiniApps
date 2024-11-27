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

      registration.addEventListener('updatefound', () => {
        console.log('[ServiceWorker] New service worker being installed');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('[ServiceWorker] New service worker state:', newWorker.state);
          });
        }
      });
    })
    .catch((error) => {
      console.error('[ServiceWorker] Registration failed:', error);
    });

  // Log when the service worker takes control
  if (navigator.serviceWorker.controller) {
    console.log('[ServiceWorker] Active service worker found, no need for registration');
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[ServiceWorker] New service worker has taken control');
  });
}
