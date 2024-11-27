<!-- Offline Page Component -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let retryCount = 0;
  let isChecking = false;

  async function checkConnection() {
    if (isChecking) return;
    isChecking = true;
    retryCount++;
    
    try {
      const response = await fetch('/api/health-check');
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.log('Still offline');
    } finally {
      isChecking = false;
    }
  }

  // Auto retry connection every 30 seconds
  onMount(() => {
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  });
</script>

<div class="offline-container">
  <div class="offline-content">
    <div class="icon-container">
      <svg class="wifi-off" viewBox="0 0 24 24" width="48" height="48">
        <path d="M1 1L23 23M16.72 11.06C17.54 11.42 18.29 11.93 18.94 12.57M5.28 11.06C6.81 10.14 8.58 9.64 10.5 9.64M12 15.5C13.66 15.5 15 16.84 15 18.5M8.53 8.53C6.92 7.82 5.14 7.5 3.34 7.64M20.66 7.64C18.86 7.5 17.08 7.82 15.47 8.53M12 21.5V21.51M12 18.5C10.34 18.5 9 16.84 9 15.5" 
          stroke="currentColor" 
          fill="none" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
      </svg>
    </div>
    
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Some features might be unavailable.</p>
    
    <div class="actions">
      <button class="retry-button" on:click={checkConnection} disabled={isChecking}>
        {#if isChecking}
          Checking...
        {:else}
          Retry Connection {retryCount > 0 ? `(${retryCount})` : ''}
        {/if}
      </button>
      
      {#if 'share' in navigator}
        <button class="share-button" on:click={() => navigator.share({
          title: 'Check out Svelte MiniApps',
          text: 'A collection of useful mini applications built with SvelteKit',
          url: window.location.origin
        })}>
          Share App
        </button>
      {/if}
    </div>

    <div class="info">
      <p>While you're offline, you can still:</p>
      <ul>
        <li>Use cached mini-apps</li>
        <li>View previously loaded content</li>
        <li>Use tools that don't require internet</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .offline-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  }

  .offline-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    max-width: 32rem;
    width: 100%;
    text-align: center;
  }

  .icon-container {
    margin-bottom: 1.5rem;
  }

  .wifi-off {
    color: #6b7280;
    margin: 0 auto;
  }

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
  }

  p {
    color: #4b5563;
    margin-bottom: 1.5rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 150ms ease-in-out;
    border: none;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .retry-button {
    background-color: #3b82f6;
    color: white;
  }

  .retry-button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .share-button {
    background-color: #e5e7eb;
    color: #374151;
  }

  .share-button:hover {
    background-color: #d1d5db;
  }

  .info {
    text-align: left;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    color: #4b5563;
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
  }

  li::before {
    content: "•";
    color: #3b82f6;
    font-weight: bold;
    margin-right: 0.5rem;
  }

  @media (max-width: 640px) {
    .actions {
      flex-direction: column;
    }
    
    .offline-content {
      padding: 1.5rem;
    }
  }
</style>
