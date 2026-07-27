<!--
@component

AppsSection — the actual app gallery.

Simplified in the second pass: this is now the single canonical place
where we name the apps. No featured strip, no trust micro-bar, no
app-count badge — those were duplicating the hero messaging. The "Built
with Svelte" line is preserved (one mention, in a non-decision spot) so
the framework brand anchor stays visible.

Layout:
  1. Section heading + outcome-led copy
  2. "Built with Svelte" brand anchor (one mention)
  3. All-apps grid (always expanded by default — Goal Gradient)
  4. Coming Soon section (collapsible)

-->

<script lang="ts">
	import { projects, done, isNewApp, isRecentlyUpdated } from '$lib/index.svelte';
	import { persistedLocale } from '$lib/stores/language-store.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { AppWindow, ArrowRight, CircleDashed, Construction } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import Svelte from '$lib/assets/svelte.svelte';
	import { PieChart } from 'layerchart';
	import { getAppCategories } from './data.svelte';
	import type { Project } from '$lib/index.svelte';

	let collator = $derived(new Intl.Collator(persistedLocale.current));

	let sortedProjects = $derived([...projects()].sort((a, b) => collator.compare(a.title, b.title)));

	let doneProjects = $derived(sortedProjects.filter((p) => done().some((d) => d.name === p.link)));

	let comingSoon = $derived(sortedProjects.filter((p) => !done().some((d) => d.name === p.link)));

	// Smart Default: open by default on every viewport (Goal Gradient — show progress).
	const isDesktop = new MediaQuery('(min-width: 768px)');
	let activeAppsOpen = $state(true);
	// User can still toggle; initial value is seeded from the viewport media query.
	let comingSoonOpen = $state(isDesktop.current);

	let categoryData = $derived(getAppCategories());
	const donutColors = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];
</script>

{#snippet appCard(project: Project)}
	{@const Icon = project.icon || AppWindow}
	<a
		href={'/apps/' + project.link}
		class="group bg-card text-card-foreground hover:border-primary/50 relative flex flex-col items-center overflow-hidden rounded-xl border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:flex-row md:p-4"
	>
		<div
			class="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors md:mb-0"
		>
			<Icon class="h-5 w-5" />
		</div>
		<div class="min-w-0 flex-1 text-center md:ml-4 md:text-left">
			<h3
				class="group-hover:text-primary truncate text-sm font-semibold transition-colors md:pr-6 md:text-base"
			>
				{project.title}
			</h3>
		</div>

		<!-- Status badges -->
		<div class="absolute top-2 right-2 flex gap-1">
			{#if isNewApp(project.link)}
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
				</span>
			{:else if isRecentlyUpdated(project.link)}
				<span class="relative flex h-2 w-2">
					<span class="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
				</span>
			{/if}
		</div>
	</a>
{/snippet}

{#snippet comingSoonItem(project: Project)}
	<div class="bg-muted/50 flex items-center rounded-lg border border-dashed p-3">
		<CircleDashed class="text-muted-foreground mr-3 h-4 w-4" />
		<span class="text-muted-foreground text-sm font-medium">{project.title}</span>
	</div>
{/snippet}

<section id="apps" class="bg-background w-full py-12 md:py-24 lg:py-32">
	<div class="container mx-auto px-4 md:px-6">
		<div class="mb-10 flex flex-col items-center justify-center space-y-4 text-center md:mb-14">
			<h2 class="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl">
				Every app is free, instant, and stays in your browser.
			</h2>
			<p
				class="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
			>
				From tracking a budget to sharing an expiring note — pick a tool, get to work in one click.
			</p>

			<!--
			  Brand anchor: small "Built with Svelte" line. One mention only.
			  This is the framework brand signal — not a sales pitch.
			-->
			<a
				href="https://svelte.dev"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
			>
				<Svelte class="h-3.5 w-3.5" />
				<span>Built with Svelte · Open source on GitHub</span>
			</a>

			<!-- Category donut: compact visual breakdown of app types -->
			<div class="mt-6 flex items-center justify-center gap-6">
				<div class="relative h-[140px] w-[140px]">
					<PieChart
						data={categoryData}
						key="name"
						value="count"
						innerRadius={-50}
						cRange={donutColors}
					>
						{#snippet tooltip()}{/snippet}
					</PieChart>
				</div>
				<div class="hidden flex-col gap-1.5 sm:flex">
					{#each categoryData as cat (cat.name)}
						<div class="flex items-center gap-2 text-xs">
							<span
								class="inline-block h-2.5 w-2.5 rounded-full"
								style="background-color: {cat.color}"
							></span>
							<span class="text-muted-foreground">{cat.name}</span>
							<span class="text-foreground font-medium">{cat.count}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Active Apps Section (always open by default — Goal Gradient) -->
		<div>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="flex items-center gap-2 text-xl font-semibold">
					<AppWindow class="h-5 w-5" />
					All apps
				</h3>
				<button
					type="button"
					onclick={() => (activeAppsOpen = !activeAppsOpen)}
					class="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
				>
					{activeAppsOpen ? 'Collapse' : 'Expand'}
					<ArrowRight
						class="h-4 w-4 transition-transform duration-200 {activeAppsOpen ? 'rotate-90' : ''}"
					/>
				</button>
			</div>

			{#if activeAppsOpen}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each doneProjects as project (project.link)}
						{@render appCard(project)}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Coming Soon Section -->
		{#if comingSoon.length > 0}
			<div class="mt-16 space-y-8">
				<Collapsible.Root bind:open={comingSoonOpen}>
					<div class="flex items-center gap-4">
						<Separator class="flex-1" />
						<Collapsible.Trigger
							class="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-xl font-semibold transition-colors"
						>
							<Construction class="h-5 w-5" />
							<span class="text-muted-foreground">Coming Soon ({comingSoon.length})</span>
							<ArrowRight
								class="text-muted-foreground h-4 w-4 transition-transform duration-200 {comingSoonOpen
									? 'rotate-90'
									: ''}"
							/>
						</Collapsible.Trigger>
						<Separator class="flex-1" />
					</div>

					<Collapsible.Content>
						<div
							class="mt-8 grid grid-cols-1 gap-4 opacity-60 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
						>
							{#each comingSoon as project (project.link)}
								{@render comingSoonItem(project)}
							{/each}
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			</div>
		{/if}

		<!--
		  Single deep-link for users who want more: "Browse the full list →" as
		  a link, not a tail-CTA. This is one mention, not a pitch.
		-->
		<div class="mt-12 text-center">
			<a href="/apps" class={buttonVariants({ variant: 'link', className: 'text-primary px-0' })}>
				Browse the full list
				<ArrowRight class="ml-1.5 h-4 w-4" />
			</a>
		</div>
	</div>
</section>
