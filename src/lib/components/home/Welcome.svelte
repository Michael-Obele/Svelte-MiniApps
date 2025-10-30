<!--
@component

Welcome — header section showing a time-based greeting and a mantra with controls to like or regenerate it.

Usage:
```svelte
<Welcome {data} />
```

Props:
- data — page data with optional user and mantra.

-->
<script lang="ts">
	import { getGreetingAndNextPeriod } from '$lib/utility/greetings.client.svelte';
	import { RefreshCw, Star, StarOff } from '@lucide/svelte';
	import BlurInText from '@/blocks/BlurInText.svelte';
	import BlurFade from '@/blocks/BlurFade.svelte';
	import { Skeleton } from '@/ui/skeleton';
	import { Button } from '@/ui/button';
	import { getMantra, likeMantra } from '$lib/remote/mantra.remote';

	let { data } = $props();

	// Get current greeting based on time of day
	let greeting = $derived(getGreetingAndNextPeriod());

	// Access the current value from the query
	let mantra = $derived(getMantra().current);

	function handleGenerate() {
		// Call refresh on the cached query instance
		getMantra().refresh();
	}

	// Update greeting when time period changes
	$effect(() => {
		const timeoutId = setTimeout(() => {
			const { greeting: newGreeting } = getGreetingAndNextPeriod();
			greeting.greeting = newGreeting;
			// Recursively set the next timeout
			timeoutId.refresh();
		}, getGreetingAndNextPeriod().millisecondsUntilNext);

		return () => clearTimeout(timeoutId);
	});
</script>

<header class="mx-auto my-12 flex flex-col justify-center space-y-2">
	<BlurFade delay={0.25}>
		<BlurInText
			as="h1"
			class="text-center text-3xl font-bold tracking-tighter text-red-700 sm:text-5xl xl:text-6xl/none dark:text-white"
		>
			<span class="text-green-700 capitalize dark:text-green-300">
				{`${greeting.greeting}${data.user?.username ? ` ${data.user.username}` : ''}!`}
			</span>
		</BlurInText>
	</BlurFade>
	<BlurFade class="px-1" delay={0.25 * 2}>
		{#if mantra}
			<div class="my-2 flex flex-wrap items-center justify-center gap-2 text-center">
				{#if data.user?.username}
					<!-- Use remote form for like functionality -->
					{@const form = likeMantra.for(mantra)}
					<form
						{...form.enhance(async ({ submit }) => {
							// Submit without refreshing other queries
							await submit();
						})}
					>
						<!-- Hidden input to bind the mantra value to the form field -->
						<input type="hidden" name="mantra" value={mantra} />

						{#if !form.pending}
							<button type="submit">
								{#if form.result?.like}
									<StarOff class="h-4 w-4 peer-hover:text-gray-600" />
								{:else}
									<Star class="h-4 w-4 peer-hover:text-gray-600" />
								{/if}
							</button>
						{:else}
							<Skeleton class="mx-auto h-5 w-[1.3rem] rounded-md text-center" />
						{/if}
					</form>
				{/if}

				<button
					onclick={handleGenerate}
					class="text-muted-foreground max-w-full cursor-pointer text-2xl font-medium break-words underline-offset-4 hover:underline sm:text-3xl xl:text-4xl/none"
				>
					{mantra}
				</button>

				<Button
					variant="link"
					class="text-muted-foreground inline-flex size-3 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 hover:text-gray-900 sm:size-8 dark:hover:bg-gray-800 dark:hover:text-gray-50"
					onclick={handleGenerate}
					title="Get a new mantra"
				>
					<RefreshCw class="h-4 w-4 {getMantra().loading ? 'animate-spin' : ''}" />
				</Button>
			</div>
		{:else}
			<Skeleton class="mx-auto h-10 w-[35vw] rounded-md text-center" />
		{/if}
	</BlurFade>
</header>
