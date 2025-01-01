<!-- Handle Protocol Page -->
<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { done } from '$lib';

  let protocolUrl: string | null = null;
  let error: string | null = null;

  // Convert app name to URL-friendly format
  function normalizeAppName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  // Check if the app exists in our list
  function isValidApp(appName: string): boolean {
    return done.some(app => normalizeAppName(app) === appName.toLowerCase());
  }

  // Get the original app name from normalized version
  function getOriginalAppName(normalizedName: string): string | null {
    return done.find(app => normalizeAppName(app) === normalizedName.toLowerCase()) || null;
  }

  onMount(() => {
    try {
      // Get the URL parameter
      const urlParam = page.url.searchParams.get('url');
      if (!urlParam) {
        error = 'No URL parameter provided';
        return;
      }

      protocolUrl = urlParam;
      
      // Handle the protocol URL
      handleProtocolUrl(urlParam);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error occurred';
    }
  });

  async function handleProtocolUrl(url: string) {
    try {
      // Remove the protocol prefix
      const cleanUrl = url.replace('web+miniapps://', '');
      
      // Parse the URL to determine which mini-app to open
      const [appName, ...params] = cleanUrl.split('/');
      
      if (!appName) {
        error = 'No app name provided';
        return;
      }

      // Check if the app exists
      if (!isValidApp(appName)) {
        const availableApps = done.map(app => `"${app}"`).join(', ');
        error = `Invalid app name. Available apps are: ${availableApps}`;
        return;
      }

      // Get the original app name with correct casing
      const originalAppName = getOriginalAppName(appName);
      if (!originalAppName) {
        error = 'App not found';
        return;
      }

      // Navigate to the appropriate mini-app
      const normalizedAppPath = normalizeAppName(originalAppName);
      await goto(`/${normalizedAppPath}${params.length ? '/' + params.join('/') : ''}`);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to handle protocol';
    }
  }
</script>

<div class="protocol-handler">
  {#if error}
    <div class="error">
      <h1>Error</h1>
      <p>{error}</p>
    </div>
  {:else if protocolUrl}
    <div class="loading">
      <p>Handling protocol: {protocolUrl}</p>
    </div>
  {/if}
</div>

<style>
  .protocol-handler {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .error {
    color: #ef4444;
    background: #fee2e2;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .loading {
    color: #3b82f6;
    background: #dbeafe;
    padding: 1rem;
    border-radius: 0.5rem;
  }
</style>
