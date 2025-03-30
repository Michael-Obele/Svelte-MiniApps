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
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { toast } from 'svelte-sonner';

  let needRefresh = $state(false);
  let offlineReady = $state(false);
  let updateServiceWorker: (() => Promise<void>) | undefined = undefined;

  $effect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', {
        id: 'pwa-offline-ready',
        duration: 3000,
      });
    }
  });

  function close() {
    offlineReady = false;
    needRefresh = false;
  }

  async function updateSW() {
    if (!updateServiceWorker) return;
    
    needRefresh = false;
    await updateServiceWorker();
    
    // Force page reload after update
    window.location.reload();
  }

  onMount(async () => {
    if (!browser) return;
    
    try {
      // Dynamically import the virtual module
      const { pwaInfo } = await import('virtual:pwa-info');
      
      if (!pwaInfo) {
        console.warn('PWA info not available');
        return;
      }

      const { registerSW } = pwaInfo;

      if (!registerSW) {
        console.warn('Service worker registration function not available');
        return;
      }

      // Register the service worker
      registerSW({
        immediate: true,
        onNeedRefresh() {
          needRefresh = true;
          toast('New version available', {
            id: 'pwa-update',
            duration: Infinity,
            action: {
              label: 'Update now',
              onClick: () => updateSW(),
            },
          });
        },
        onOfflineReady() {
          offlineReady = true;
        },
        onRegistered(swRegistration: ServiceWorkerRegistration) {
          // Handle registration if needed
          console.info('Service Worker registered:', swRegistration);
        },
        onRegisterError(error: Error) {
          console.error('Service Worker registration error:', error);
        },
      }).then((swr: RegisterSWResult | undefined) => {
        updateServiceWorker = swr?.updateServiceWorker;
      });
    } catch (error) {
      console.error('Failed to setup PWA service worker:', error);
    }
  });
</script>

{#if needRefresh}
  <div
    class="fixed bottom-4 right-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="mb-3 text-sm font-normal text-gray-500 dark:text-gray-400">
      A new version is available
    </div>
    <div class="flex gap-2">
      <button
        onclick={updateSW}
        class="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Update
      </button>
      <button
        onclick={close}
        class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-700"
      >
        Close
      </button>
    </div>
  </div>
{/if}
