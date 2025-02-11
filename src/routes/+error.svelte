<script lang="ts">
  import { page } from '$app/state';
  import { fade } from 'svelte/transition';
  import NF from '$lib/assets/404.svelte';
  import Bad from '$lib/assets/Bad.svelte';
  import { Button } from '$lib/components/ui/button';



  // Custom messages and descriptions for common errors
  interface ErrorInfo {
    title: string;
    description: string;
    action?: string;
  }

  const errorInfo: Record<number, ErrorInfo> = {
    404: {
      title: 'Page Not Found',
      description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      action: 'Please check the URL or try navigating from the home page.'
    },
    500: {
      title: 'Server Error',
      description: 'Our servers encountered an error while processing your request.',
      action: 'Please try again later or contact support if the problem persists.'
    },
    403: {
      title: 'Access Denied',
      description: 'You don\'t have permission to access this resource.',
      action: 'Please log in or contact your administrator for access.'
    }
  };

  const defaultError: ErrorInfo = {
    title: 'Unexpected Error',
    description: 'An unexpected error occurred while processing your request.',
    action: 'Please try again or contact support if the problem persists.'
  };

  let currentError = $derived(errorInfo[page.status] || defaultError);
</script>

<svelte:head>
  <title>{currentError.title} - Error {page.status}</title>
</svelte:head>

<section 
  class="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 dark:bg-gray-900 md:px-8" 
  in:fade={{ duration: 200 }}
>
  <div class="relative w-full max-w-screen-xl">
    <div class="relative flex flex-col items-center">
      <div class="mb-5 flex justify-center">
        <div class="flex size-60 flex-row items-center transition-transform hover:scale-105 sm:size-96">
          {#if page.status === 404}
            <NF />
          {:else}
            <Bad />
          {/if}
        </div>
      </div>

      <div class="max-w-2xl space-y-6 px-4 text-center md:px-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          {currentError.title}
        </h1>

        <p class="text-xl text-gray-600 dark:text-gray-300">
          {currentError.description}
        </p>

        {#if currentError.action}
          <p class="text-gray-500 dark:text-gray-400">{currentError.action}</p>
        {/if}

        <div class="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-gray-800/50">
          <div class="border-b border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-800">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Technical Details</h3>
          </div>
          <div class="space-y-3 px-4 py-3 text-left">
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
              <code class="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-300">
                {page.status}
              </code>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Path:</span>
              <code class="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-300">
                {page.url.pathname}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-center gap-4">
        <Button
          variant="default"
          class="bg-blue-500 text-white transition-colors hover:bg-blue-600 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-500"
          href="/"
        >
          Go Home
        </Button>
        <Button
          variant="outline"
          class="border-gray-200 text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-gray-800"
          onclick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  </div>
</section>
