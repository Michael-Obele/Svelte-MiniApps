<!--
@component

Welcome — small personalised greeting + "where to start?" tile row.

The personal touch (greeting + mantra) is preserved for return visitors.
A new "Where to start?" tile row sits below — 3 quick-jump CTAs that
match common intents (I need a budget / I need a password / I need to
share something). IKEA Effect: by clicking, the user is already
committing to using the site, not just browsing it.

Usage:
```svelte
<Welcome {data} />
```

Props:
- data — page data with optional user and mantra.

-->
<script lang="ts">
	import { getGreetingAndNextPeriod } from '$lib/utility/greetings.client.svelte';
	import { RefreshCw, Star, StarOff, ArrowRight, Wallet, Lock, Share2 } from '@lucide/svelte';
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

	// Quick-start suggestions. Smart Default: pre-pick the most common entry points.
	const QUICK_STARTS = [
		{
			label: 'Track a budget',
			href: '/apps/budget-tracker',
			Icon: Wallet
		},
		{
			label: 'Generate a password',
			href: '/apps/random-password-generator',
			Icon: Lock
		},
		{
			label: 'Share self-destructing text',
			href: '/apps/flash-text',
			Icon: Share2
		}
	];

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

<header class="mx-auto my-10 flex flex-col justify-center space-y-4 md:my-14">
	<BlurFade delay={0.25}>
		<BlurInText
			as="h1"
			class="text-primary text-center text-2xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none"
		>
			<span class="text-slate-700 capitalize dark:text-slate-200">
				{`${greeting.greeting}${data.user?.username ? ` ${data.user.username}` : ''}!`}
			</span>
		</BlurInText>
	</BlurFade>
	<BlurFade class="px-1" delay={0.25 * 2}>
		{#if mantra}
			<div class="flex flex-wrap items-center justify-center gap-2 text-center">
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

				<p class="text-muted-foreground max-w-full text-base font-medium break-words sm:text-lg">
					{mantra}
				</p>

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
			<Skeleton class="mx-auto h-6 w-[35vw] rounded-md text-center" />
		{/if}
	</BlurFade>

	<!-- Where to start? — conversion-oriented quick-jump row -->
	<BlurFade delay={0.5}>
		<div class="mx-auto mt-4 max-w-2xl px-4">
			<p
				class="text-muted-foreground mb-3 text-center text-xs font-semibold tracking-widest uppercase"
			>
				Where to start?
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each QUICK_STARTS as start (start.href)}
					<a
						href={start.href}
						class="bg-card text-card-foreground hover:border-primary/50 group flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-all hover:shadow-sm"
					>
						<start.Icon
							class="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors"
						/>
						<span class="flex-1 truncate">{start.label}</span>
						<ArrowRight
							class="text-muted-foreground h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
						/>
					</a>
				{/each}
			</div>
		</div>
	</BlurFade>
</header>
