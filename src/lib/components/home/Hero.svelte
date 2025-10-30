<!--
@component

Hero — displays a time-aware greeting, short intro text, and a CTA button linking to /apps.

Usage:
```svelte
<Hero {data} />
```

Props:
- data — server page data (optional, used for username).

-->

<script lang="ts">
	import Svelte from '$lib/assets/svelte.svelte';
	import {
		generateMantra,
		getGreeting,
		getMillisecondsUntilNextPeriod
	} from '$lib/utility/greetings';
	import BlurInText from '@/blocks/BlurInText.svelte';

	const arrow = '/lottie/trending-flat.json';

	let greeting = $state(generateMantra());

	// Update greeting when time period changes
	$effect(() => {
		const timeoutId = setTimeout(() => {
			greeting = generateMantra();
			// Recursively set the next timeout
			timeoutId.refresh();
		}, getMillisecondsUntilNextPeriod());

		return () => clearTimeout(timeoutId);
	});

	let { data } = $props();
</script>

<section id="hero" class="w-full py-8 md:py-14 lg:py-20">
	<div class="px-4 md:px-6 xl:container">
		<div class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
			<div class="flex flex-col justify-center space-y-4">
				<div class="flex flex-col">
					<BlurInText
						as="h2"
						class="text-2xl font-bold text-red-700 sm:text-4xl xl:text-5xl/none dark:text-white"
					>
						Welcome
						{#if data?.user?.username}
							{@const username = data.user.username}
							Back,
							<span class="text-green-700 capitalize dark:text-green-300">
								{username}!
							</span>
						{/if}
						to...
					</BlurInText>
					<BlurInText
						as="h2"
						word="Svelte Mini Apps"
						class="text-2xl font-bold text-red-700 sm:text-4xl xl:text-5xl/none dark:text-white"
					/>
					<BlurInText
						as="p"
						word="Explore our curated collection of elegant Svelte applications, thoughtfully designed to enhance your digital workflow with modern, efficient solutions."
						class="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400"
					/>
				</div>
				<a
					href="/apps"
					class="flex h-10 items-center justify-center rounded-md bg-red-700 px-3 text-center text-base font-medium text-white shadow transition-colors hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-red-900"
				>
					<BlurInText as="span" class="inline-flex items-center">
						Start Exploring
						<lord-icon
							target="#hero"
							src={arrow}
							colors="primary:white,secondary:green"
							trigger="loop-on-hover"
							class="ml-2 hidden h-5 w-5 md:grid"
							state="hover-pinch"
						>
						</lord-icon>
					</BlurInText>
				</a>
			</div>
			<BlurInText
				as="div"
				word={Svelte}
				class="mx-auto hidden h-[60%] w-[60%] flex-row items-center justify-center md:flex md:w-full lg:h-full"
			/>
		</div>
	</div>
</section>
