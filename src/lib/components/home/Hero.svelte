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
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowRight } from 'lucide-svelte';
	import Svelte from '$lib/assets/svelte.svelte';
	const arrow = '/lottie/trending-flat.json';

	import { generateMantra, getMillisecondsUntilNextPeriod } from '$lib/utility/greetings';
	import BlurInText from '@/blocks/BlurInText.svelte';

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

{#snippet welcomeHeader(username: string)}
	Welcome
	{#if username}
		Back,
		<span class="text-primary capitalize">
			{username}!
		</span>
	{/if}
	to...
{/snippet}

<section id="hero" class="bg-background relative w-full overflow-hidden py-12 md:py-24 lg:py-32">
	<!-- Background Glow -->
	<div
		class="bg-primary/5 dark:bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"
	></div>
	<div
		class="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-slate-500/5 blur-3xl dark:bg-slate-500/10"
	></div>

	<div class="relative z-10 container mx-auto px-4 md:px-6">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
			<div class="flex flex-col justify-center space-y-8">
				<div class="space-y-4">
					<BlurInText
						as="h2"
						class="text-foreground text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl/none"
					>
						{@render welcomeHeader(data?.user?.username)}
						<br />

						<BlurInText
							as="span"
							word="Svelte Mini Apps"
							class="text-primary text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl/none"
						/>
					</BlurInText>

					<BlurInText
						as="p"
						word="Explore our curated collection of elegant Svelte applications, thoughtfully designed to enhance your digital workflow with modern, efficient solutions."
						class="text-muted-foreground max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
					/>
				</div>
				<div class="flex flex-col gap-4 sm:flex-row">
					<BlurInText as="span" class="inline-flex items-center">
						<Button
							href="/apps"
							size="lg"
							class="bg-primary hover:bg-primary/90 border-none text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] dark:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
						>
							Start Exploring
							<lord-icon
								target="#hero"
								src={arrow}
								colors="primary:white,secondary:red"
								trigger="loop-on-hover"
								class="ml-2 hidden h-5 w-5 md:grid"
								state="hover-pinch"
							>
							</lord-icon>
						</Button>
					</BlurInText>
				</div>
			</div>
			<div class="relative flex justify-center lg:justify-end">
				<div
					class="relative h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]"
				>
					<!-- Glowing Svelte Logo -->
					<!-- Deep ambient glow -->
					<div
						class="pointer-events-none absolute top-1/2 left-1/2 h-[180%] w-[80%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(220,38,38,0.1)_0%,transparent_70%)] blur-3xl"
					></div>

					<!-- Core glow -->
					<div
						class="bg-primary/10 dark:bg-primary/20 pointer-events-none absolute inset-0 rounded-full blur-[90px]"
					></div>

					<Svelte class="relative z-10 h-full w-full drop-shadow-[0_0_40px_rgba(220,38,38,0.3)]" />
				</div>
			</div>
		</div>
	</div>
</section>
