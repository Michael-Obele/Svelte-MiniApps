export function handleServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.addEventListener('controllerchange', () => {
                // When a new service worker takes control, show an alert and reload
                if (window.confirm('A new version of the app is available. Load new version?')) {
                    window.location.reload();
                }
            });
        });

        // Also check for updates when the page loads
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        // When the new service worker is installed, prompt to reload
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (window.confirm('A new version of the app is available. Load new version?')) {
                                window.location.reload();
                            }
                        }
                    });
                }
            });
        });
    }
}
