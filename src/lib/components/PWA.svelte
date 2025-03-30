<script module>
  // Type definition for service worker registration options
  interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration) => void;
    onRegisterError?: (error: Error) => void;
  }

  // Type definition for service worker registration result
  interface RegisterSWResult {
    updateServiceWorker: () => Promise<void>;
  }
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  // State for PWA installation prompt
  let installPrompt: any = $state(null);
  let installable = $state(false);
  
  // Wait for useRegisterSW to be imported only in the browser
  let registerSW: any = $state(null);

  /**
   * Check if the app is installable
   */
  function checkInstallable() {
    installable = !!installPrompt;
  }

  /**
   * Install the PWA
   */
  async function installPWA() {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      installPrompt = null;
      installable = false;
      toast.success('Thank you for installing our app!');
    } else {
      toast.error('Installation was canceled');
    }
  }

  /**
   * Handle beforeinstallprompt event to capture install prompt
   */
  function handleBeforeInstallPrompt(e: Event) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Store the event for later use
    installPrompt = e;
    // Update installable state
    checkInstallable();
  }

  // Dynamically import the register module only in the browser
  onMount(() => {
    if (!browser) return;
    
    // Setup function to handle initialization
    const setupPWA = async () => {
      try {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        // Check if already installed
        window.addEventListener('appinstalled', () => {
          installPrompt = null;
          installable = false;
          toast.success('App installed successfully!');
        });
        
        // Import the virtual module for PWA registration
        const { useRegisterSW } = await import('virtual:pwa-register/svelte');
        
        // Use the register function
        const { 
          offlineReady,
          needRefresh,
          updateServiceWorker
        } = useRegisterSW({
          immediate: true,
          onRegisteredSW(swUrl, registration) {
            // Check for updates periodically
            if (registration) {
              setInterval(async () => {
                if (registration.installing || !navigator.onLine) return;
                
                // Poll for updates
                try {
                  const response = await fetch(swUrl, {
                    cache: 'no-store',
                    headers: {
                      'cache': 'no-store',
                      'cache-control': 'no-cache'
                    }
                  });
                  
                  if (response.status === 200) {
                    await registration.update();
                  }
                } catch (error) {
                  console.error('Error checking for SW updates:', error);
                }
              }, 60000); // Check every minute
            }
          },
          onNeedRefresh() {
            toast('New version available', {
              id: 'pwa-update',
              duration: Infinity,
              action: {
                label: 'Update now',
                onClick: () => updateServiceWorker(true),
              },
            });
          },
          onOfflineReady() {
            toast.success('App ready to work offline', {
              id: 'pwa-offline-ready',
              duration: 3000,
            });
          },
          onRegisterError(error) {
            console.error('Service Worker registration error:', error);
            toast.error('Failed to register service worker');
          }
        });
        
        // Store the register function
        registerSW = { offlineReady, needRefresh, updateServiceWorker };
      } catch (error) {
        console.error('Failed to setup PWA service worker:', error);
      }
    };
    
    // Start the async setup
    setupPWA();
    
    // Return the cleanup function directly (not wrapped in a Promise)
    return () => {
      // Clean up event listeners
      if (browser) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  });
</script>

{#if installable}
  <div class="fixed bottom-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div class="mb-3 text-sm font-normal text-gray-500 dark:text-gray-400">
      Install our app for a better experience
    </div>
    <div class="flex gap-2">
      <button
        onclick={installPWA}
        class="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Install
      </button>
      <button
        onclick={() => installable = false}
        class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-700"
      >
        Maybe later
      </button>
    </div>
  </div>
{/if}
