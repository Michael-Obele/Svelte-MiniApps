<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
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
	title="Offline | Svelte Mini Apps"
	description="Check your internet connection status and access cached content while offline."
	keywords="svelte, mini apps, offline, connection, cached content"
	route="/offline"
/>

<div class="flex min-h-screen items-center justify-center bg-red-50 p-8 dark:bg-black">
	<div
		class="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-500 dark:border dark:border-zinc-900/50 dark:bg-black dark:shadow-none"
	>
		<div class="mb-6">
			{#if isConnectionRestored}
				<svg
					class="mx-auto text-green-600 transition-colors dark:text-green-500"
					viewBox="0 0 24 24"
					width="48"
					height="48"
					stroke="currentColor"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 20h.01" />
					<path d="M2 8.82a15 15 0 0 1 20 0" />
					<path d="M5 12.859a10 10 0 0 1 14 0" />
					<path d="M8.5 16.429a5 5 0 0 1 7 0" />
				</svg>
			{:else}
				<svg
					class="mx-auto text-red-600 transition-colors dark:text-red-500"
					viewBox="0 0 24 24"
					width="48"
					height="48"
					stroke="currentColor"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="1" x2="23" y1="1" y2="23" />
					<path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.57" />
					<path d="M5 12.57a10.94 10.94 0 0 1 5.5-2.93" />
					<path d="M8.5 16.429a5 5 0 0 1 7 0" />
					<path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
					<path d="M10.66 5a15 15 0 0 1 11.34 3.82" />
					<line x1="12" x2="12.01" y1="20" y2="20" />
				</svg>
			{/if}
		</div>

		{#if isConnectionRestored}
			<h1 class="mb-4 text-3xl font-bold text-green-600 transition-colors dark:text-green-500">
				You're Online
			</h1>
			<p class="mb-6 text-zinc-800 transition-colors dark:text-zinc-400">
				Your internet connection has been restored. You can now access all features and continue
				using the application.
			</p>

			<div class="my-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<button
					class="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:border dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
					onclick={() => (window.location.href = '/')}
				>
					Go Home
				</button>

				<button
					class="rounded-lg bg-zinc-800 px-6 py-3 font-medium text-zinc-100 transition-all hover:bg-zinc-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:border dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
					onclick={() => window.history.back()}
				>
					Go Back
				</button>
			</div>
		{:else}
			<h1 class="mb-4 text-3xl font-bold text-red-600 transition-colors dark:text-red-500">
				You're Offline
			</h1>
			<p class="mb-6 text-zinc-800 transition-colors dark:text-zinc-400">
				It looks like you've lost your internet connection. Some features might be unavailable.
			</p>

			<div class="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
				<button
					class="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:border dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
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
					<p class="text-green-600 transition-colors dark:text-green-500">Connection restored!</p>
				{:else}
					<p class="text-red-600 transition-colors dark:text-red-500">Still offline...</p>
				{/if}
			</div>

			<div class="border-t border-zinc-300 pt-6 text-left transition-colors dark:border-zinc-900">
				<p class="text-zinc-800 transition-colors dark:text-zinc-400">
					While you're offline, you can still:
				</p>
				<ul class="mt-2">
					<li
						class="flex items-center py-2 text-zinc-800 transition-colors before:mr-2 before:font-bold before:text-red-600 before:content-['•'] dark:text-zinc-400 dark:before:text-red-500"
					>
						Use cached mini-apps
					</li>
					<li
						class="flex items-center py-2 text-zinc-800 transition-colors before:mr-2 before:font-bold before:text-red-600 before:content-['•'] dark:text-zinc-400 dark:before:text-red-500"
					>
						View previously loaded content
					</li>
					<li
						class="flex items-center py-2 text-zinc-800 transition-colors before:mr-2 before:font-bold before:text-red-600 before:content-['•'] dark:text-zinc-400 dark:before:text-red-500"
					>
						Use tools that don't require internet
					</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
