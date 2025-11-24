<!--
@component

AppsSection — displays a compact grid of available mini-apps and a coming soon section.
Both sections are collapsible with different default states.

Usage:
```svelte
<AppsSection />
```

-->
<script lang="ts">
	import { projects, done, isNewApp, isRecentlyUpdated } from '$lib/index.svelte';
	import { persistedLocale } from '$lib/stores/language-store.svelte';
	import { AppWindow, CircleDashed, Construction, ChevronDown } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import type { Project } from '$lib/index.svelte';
	import { MediaQuery } from 'svelte/reactivity';

	// Create locale-aware collator that reacts to language changes
	let collator = $derived(new Intl.Collator(persistedLocale.current));

	// Sort projects alphabetically by title
	let sortedProjects = $derived([...projects()].sort((a, b) => collator.compare(a.title, b.title)));

	// Filter projects that are marked as done
	let doneProjects = $derived(sortedProjects.filter((p) => done().some((d) => d.name === p.link)));

	// Filter projects that are NOT done (Coming Soon)
	let comingSoon = $derived(sortedProjects.filter((p) => !done().some((d) => d.name === p.link)));

	// Collapsible state - Active Apps open by default, Coming Soon collapsed
	const isDesktop = new MediaQuery('min-width: 768px');
	let activeAppsOpen = $state(true);
	let comingSoonOpen: boolean = $derived(isDesktop.current);
</script>

{#snippet appCard(project: Project)}
	{@const Icon = project.icon || AppWindow}
	<a
		href={'/apps/' + project.link}
		class="group bg-card text-card-foreground hover:border-primary/50 relative flex items-center overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md"
	>
		<div
			class="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
		>
			<Icon class="h-5 w-5" />
		</div>
		<div class="ml-4 min-w-0 flex-1">
			<h3 class="group-hover:text-primary truncate pr-6 font-semibold transition-colors">
				{project.title}
			</h3>
		</div>

		<!-- Status Badges -->
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
		<div class="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
			<h2 class="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl">
				Tools That Make a Difference
			</h2>
			<p
				class="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
			>
				From managing your budget to boosting productivity, each app is designed to help you get
				things done. Built with <span class="font-semibold text-red-600 dark:text-red-500"
					>Svelte</span
				>, these tools are fast, responsive, and easy to use.
			</p>
		</div>

		<!-- Active Apps Section -->
		<Collapsible.Root bind:open={activeAppsOpen}>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="flex items-center gap-2 text-xl font-semibold">
					<AppWindow class="h-5 w-5" />
					Active Apps ({doneProjects.length})
				</h3>
				<Collapsible.Trigger
					class="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
				>
					{activeAppsOpen ? 'Collapse' : 'Expand'}
					<ChevronDown
						class="h-4 w-4 transition-transform duration-200 {activeAppsOpen ? 'rotate-180' : ''}"
					/>
				</Collapsible.Trigger>
			</div>

			<Collapsible.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each doneProjects as project (project.link)}
						{@render appCard(project)}
					{/each}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>

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
							<ChevronDown
								class="text-muted-foreground h-4 w-4 transition-transform duration-200 {comingSoonOpen
									? 'rotate-180'
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
	</div>
</section>
