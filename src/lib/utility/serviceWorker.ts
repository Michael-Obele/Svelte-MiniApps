import { notifyUpdateAvailable } from '../stores/serviceWorkerStore';

// Function to register the service worker
let notificationShown = false; // Flag to track if notification has been shown

export async function registerServiceWorker() {
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
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', { 
      type: 'module',
      updateViaCache: 'all' // Changed to 'all' to respect cache headers
    });
    console.log('[ServiceWorker] Registration successful:', {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting
    });

    // Fetch and check the hash
    const hashResponse = await fetch('/service-worker-hash.json');
    if (hashResponse.ok) {
      const hashData = await hashResponse.json();
      const cache = await caches.open('app-cache');
      const storedHashResponse = await cache.match('app-hash');
      const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
      if (storedHash === hashData.hash) {
        console.log('[ServiceWorker] Hash has not changed, discarding registration.');
        return;
      }
    }

    // Check for updates daily instead of hourly
    const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    let lastCheck = Date.now();

    setInterval(() => {
      // Only check if it's been at least CHECK_INTERVAL since the last check
      if (Date.now() - lastCheck >= CHECK_INTERVAL) {
        console.log('[ServiceWorker] Checking for updates...');
        lastCheck = Date.now();

        // Fetch the current version or hash from the server
        fetch('./service-worker-version.json')
          .then((response) => response.json())
          .then((data) => {
            const currentVersion = localStorage.getItem('serviceWorkerVersion');

            if (currentVersion !== data.version) {
              console.log('[ServiceWorker] New version detected:', data.version);
              localStorage.setItem('serviceWorkerVersion', data.version);

              // Fetch the current hash from the server
              fetch('/service-worker-hash.json')
                .then((response) => response.json())
                .then((data) => {
                  const currentHash = localStorage.getItem('serviceWorkerHash');

                  if (currentHash !== data.hash) {
                    console.log('[ServiceWorker] New content detected:', data.hash);
                    localStorage.setItem('serviceWorkerHash', data.hash);
                    registration.update();
                  } else {
                    console.log('[ServiceWorker] No new content detected.');
                  }
                });
            } else {
              console.log('[ServiceWorker] No new version detected.');
            }
          });
      }
    }, CHECK_INTERVAL);

    // Handle updates when a new service worker is found
    registration.addEventListener('updatefound', () => {
      console.log('[ServiceWorker] New service worker being installed');
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is installed and ready to take over
            console.log('[ServiceWorker] New version ready to be activated');
            if (!notificationShown) { // Check if notification has already been shown
              notifyUpdateAvailable(registration);
              notificationShown = true; // Set the flag to true after showing the notification
            }
          }
        });
      }
    });

    // Listen for the SKIP_WAITING message
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  } catch (error) {
    console.error('[ServiceWorker] Registration failed:', error);
  }
}
