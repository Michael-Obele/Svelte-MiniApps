<script lang="ts">
  import RouteHead from '$lib/components/RouteHead.svelte';
	let retryCount = $state(0);
	let isChecking = $state(false);
	let isOnline = $state(false);
	let isConnectionRestored = $state(false);
	let interval: any;

	async function checkConnection() {
		if (isChecking) return;
		isChecking = true;
		retryCount++;

		try {
			const response = await fetch('/api/health-check');
			if (response.ok) {
				isOnline = true;
				handleConnectionRestored();
				return true; // Connection restored
			} else {
				isOnline = false;
			}
		} catch (error) {
			isOnline = false;
			console.log('Still offline');
		} finally {
			isChecking = false;
		}
		return false;
	}

	function handleConnectionRestored() {
		console.info('Connection restored! The application is now fully functional.');
		isConnectionRestored = true;
		clearInterval(interval); // Stop checking once connection is restored
	}

	// Function to start the interval only when offline is confirmed
	function startCheckConnectionInterval() {
		return setInterval(async () => {
			const isRestored = await checkConnection();
			if (isRestored) {
				clearInterval(interval); // Stop checking once connection is restored
			}
		}, 15000);
	}

	// Only start interval checking after first confirmed offline status
	$effect(() => {
		if (!isOnline) {
			interval = startCheckConnectionInterval();
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<RouteHead
  title="Offline | Svelte MiniApps"
  description="Check your internet connection status and access cached content while offline."
  keywords="svelte, mini apps, offline, connection, cached content"
  route="/offline"
/>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-8 dark:from-gray-800 dark:to-gray-700"
>
	<div class="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-900">
		<div class="mb-6">
			<svg
				class="mx-auto text-red-600 dark:text-red-500"
				viewBox="0 0 24 24"
				width="48"
				height="48"
			>
				<path
					d="M1 1L23 23M16.72 11.06C17.54 11.42 18.29 11.93 18.94 12.57M5.28 11.06C6.81 10.14 8.58 9.64 10.5 9.64M12 15.5C13.66 15.5 15 16.84 15 18.5M8.53 8.53C6.92 7.82 5.14 7.5 3.34 7.64M20.66 7.64C18.86 7.5 17.08 7.82 15.47 8.53M12 21.5V21.51M12 18.5C10.34 18.5 9 16.84 9 15.5"
					stroke="currentColor"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>

		{#if isConnectionRestored}
			<h1 class="mb-4 text-3xl font-bold text-green-600 dark:text-green-200">You're Online</h1>
			<p class="mb-6 text-gray-800 dark:text-gray-300">
				Your internet connection has been restored. You can now access all features and continue
				using the application.
			</p>

			<div class="my-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<button
					class="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
					onclick={() => (window.location.href = '/')}
				>
					Go Home
				</button>

				<button
					class="rounded-lg bg-gray-800 px-6 py-3 font-medium text-gray-200 transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
					onclick={() => window.history.back()}
				>
					Go Back
				</button>
			</div>
		{:else}
			<h1 class="mb-4 text-3xl font-bold text-red-600 dark:text-red-200">You're Offline</h1>
			<p class="mb-6 text-gray-800 dark:text-gray-300">
				It looks like you've lost your internet connection. Some features might be unavailable.
			</p>

			<div class="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
				<button
					class="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
					onclick={checkConnection}
					disabled={isChecking}
				>
					{#if isChecking}
						Checking...
					{:else}
						Retry Connection {retryCount > 0 ? `(${retryCount})` : ''}
					{/if}
				</button>
			</div>

			<!-- Connection status message -->
			<div class="my-4 text-center">
				{#if isOnline}
					<p class="text-green-600 dark:text-green-400">Connection restored!</p>
				{:else}
					<p class="text-red-600 dark:text-red-400">Still offline...</p>
				{/if}
			</div>

			<div class="border-t border-gray-300 pt-6 text-left dark:border-gray-700">
				<p class="text-gray-800 dark:text-gray-300">While you're offline, you can still:</p>
				<ul class="mt-2">
					<li
						class="flex items-center py-2 text-gray-800 before:mr-2 before:font-bold before:text-red-600 before:content-['•'] dark:text-gray-300 dark:before:text-red-200"
					>
						Use cached mini-apps
					</li>
					<li
						class="flex items-center py-2 text-gray-800 before:mr-2 before:font-bold before:text-red-600 before:content-['•'] dark:text-gray-300 dark:before:text-red-200"
					>
						View previously loaded content
					</li>
					<li
						class="flex items-center py-2 text-gray-800 before:mr-2 before:font-bold before:text-red-600 before:content-['•'] dark:text-gray-300 dark:before:text-red-200"
					>
						Use tools that don't require internet
					</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
