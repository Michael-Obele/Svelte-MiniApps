<script lang="ts">
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
	import { Motion } from 'svelte-motion';
	import { items, allTimeline, updates, getTypeAccent } from './data';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import { ArrowRightIcon } from '@lucide/svelte';
	import Highlight from './Highlight.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ChevronDown, Megaphone } from '@lucide/svelte';

	// Calculate dynamic statistics for insights
	const typeStats = $derived.by(() => {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const stats: Record<string, { count: number; recent: typeof allTimeline }> = {};

		// Initialize stats for all types
		['feature', 'fix', 'improvement', 'breaking', 'deprecation'].forEach((type) => {
			stats[type] = { count: 0, recent: [] };
		});

		allTimeline.forEach((item) => {
			const type = item.type;
			if (stats[type]) {
				stats[type].count++;

				// Check if item is recent (simplified date check)
				const itemDate = new Date(item.date + ', 2025'); // Assuming 2025 for now
				if (itemDate >= sevenDaysAgo) {
					stats[type].recent.push(item);
				}
			}
		});

		// Sort by count and return only types with data
		return Object.fromEntries(
			Object.entries(stats)
				.filter(([_, stat]) => stat.count > 0)
				.sort(([, a], [, b]) => b.count - a.count)
		);
	});
</script>

<RouteHead
	title="Changelog: Svelte 4 to Svelte 5 Migration"
	description="Track our journey from Svelte 4 to Svelte 5, featuring offline-first architecture, enhanced performance, and progressive web app capabilities."
	keywords="svelte, svelte5, migration, changelog, offline-first, pwa, web development"
	route="/changelog"
	type="article"
	publishedTime="2024-11-23T00:00:00.000Z"
	modifiedTime="2025-02-10T00:00:00.000Z"
	structuredData={{
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: 'Changelog: Svelte 4 to Svelte 5 Migration',
		description:
			'Track our journey from Svelte 4 to Svelte 5, featuring offline-first architecture, enhanced performance, and progressive web app capabilities.',
		datePublished: '2024-11-23T00:00:00.000Z',
		dateModified: '2025-02-10T00:00:00.000Z',
		author: {
			'@type': 'Person',
			name: 'Michael Obele'
		}
	}}
/>

<div class="via-background/98 from-background to-background/95 min-h-screen bg-linear-to-b">
	<div class="container mx-auto px-4 py-16">
		<BlurInText>
			<h1
				class="from-foreground to-foreground/80 mb-4 bg-linear-to-r bg-clip-text py-6 text-center text-4xl font-bold text-transparent sm:text-5xl"
			>
				Changelog
			</h1>
		</BlurInText>

		<p class="text-muted-foreground mx-auto mt-6 mb-16 max-w-2xl text-center text-lg">
			Explore our Svelte 5 migration — a focused modernization bringing offline-first resilience,
			faster rendering with smaller bundles, enhanced PWA capabilities, and improved developer
			experience across the app.
		</p>

		<!-- Navigation Dropdown -->
		<div class="mb-8 flex justify-center">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" class="flex items-center gap-2">
						<Megaphone class="h-4 w-4" />
						More
						<ChevronDown class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Changelog Sections</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>
						<a href="/changelog/announcements" class="flex items-center gap-2">
							<Megaphone class="h-4 w-4" />
							Announcements
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<a href="/changelog/timeline" class="flex items-center gap-2">
							<ArrowRightIcon class="h-4 w-4" />
							Migration Timeline
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<a href="/changelog/planned-features" class="flex items-center gap-2">
							<ArrowRightIcon class="h-4 w-4" />
							Planned Features
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Bento Grid -->
		<div class="mx-auto mb-16 grid max-w-5xl gap-4 px-4 md:auto-rows-[20rem] md:grid-cols-3">
			{#each items as item}
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div
						class={`group relative overflow-hidden rounded-xl bg-black/5 p-8 dark:bg-white/5 ${item.className} transition-transform duration-300 hover:scale-105`}
					>
						<div class="relative z-10">
							<div class="mb-4">
								<item.icon size="32" />
							</div>
							<h3 class="text-foreground mb-2 text-xl font-semibold">{item.title}</h3>
							<p class="text-muted-foreground">{item.description}</p>
						</div>
					</div>
				</Motion>
			{/each}
		</div>

		<!-- Quick Access Cards -->
		<div class="mx-auto mb-16 grid max-w-4xl gap-6 md:grid-cols-3">
			<Card
				class="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
			>
				<CardHeader class="text-center">
					<div
						class="bg-primary/10 group-hover:bg-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<ArrowRightIcon class="text-primary h-6 w-6" />
					</div>
					<CardTitle class="text-lg">Migration Timeline</CardTitle>
					<CardDescription>Detailed timeline of our Svelte 5 migration journey</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<Button variant="outline" class="w-full">
						<a href="/changelog/timeline">View Timeline</a>
					</Button>
				</CardContent>
			</Card>

			<Card
				class="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
			>
				<CardHeader class="text-center">
					<div
						class="bg-primary/10 group-hover:bg-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<Megaphone class="text-primary h-6 w-6" />
					</div>
					<CardTitle class="text-lg">Announcements</CardTitle>
					<CardDescription>Latest news and upcoming features</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<Button variant="outline" class="w-full">
						<a href="/changelog/announcements">View Announcements</a>
					</Button>
				</CardContent>
			</Card>

			<Card
				class="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
			>
				<CardHeader class="text-center">
					<div
						class="bg-primary/10 group-hover:bg-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<ArrowRightIcon class="text-primary h-6 w-6" />
					</div>
					<CardTitle class="text-lg">Planned Features</CardTitle>
					<CardDescription>Explore what's coming next</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<Button variant="outline" class="w-full">
						<a href="/changelog/planned-features">View Features</a>
					</Button>
				</CardContent>
			</Card>
		</div>

		<!-- Enhanced Updates Section with Dynamic Insights -->
		<section id="updates" class="py-10">
			<h2 class="text-foreground mb-2 text-center text-3xl font-bold">
				TL;DR: Development Insights
			</h2>
			<p class="text-muted-foreground mb-10 text-center text-sm">
				Real-time insights from our automated changelog system.
			</p>

			<!-- Dynamic Category Insights -->
			<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(typeStats) as [type, stats]}
					<Card class="border-border/50 bg-card/50 relative overflow-hidden backdrop-blur">
						<CardHeader class="pb-2">
							<div class="flex items-center justify-between">
								<CardTitle class="text-lg capitalize">{type}s</CardTitle>
								<Badge variant="secondary" class="text-xs">
									{stats.count}
								</Badge>
							</div>
							<CardDescription class="text-xs">
								{#if stats.recent.length > 0}
									{stats.recent.length} recent update{stats.recent.length === 1 ? '' : 's'}
								{:else}
									No recent activity
								{/if}
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-2">
							{#if stats.recent.length > 0}
								{#each stats.recent.slice(0, 2) as item}
									<div class="text-muted-foreground text-sm">
										<div class="flex items-center gap-2">
											<div class="bg-primary/60 h-1.5 w-1.5 rounded-full"></div>
											<span class="truncate" title={item.description}>{item.title}</span>
										</div>
									</div>
								{/each}
								{#if stats.recent.length > 2}
									<div class="text-muted-foreground/60 text-xs">
										+{stats.recent.length - 2} more...
									</div>
								{/if}
							{:else}
								<div class="text-muted-foreground/40 text-xs italic">
									All {type}s are from earlier periods
								</div>
							{/if}
						</CardContent>
						<!-- Visual accent based on type -->
						<div class={`absolute bottom-0 left-0 h-1 w-full ${getTypeAccent(type)}`}></div>
					</Card>
				{/each}
			</div>

			<!-- Manual Highlights (preserved) -->
			<div class="grid gap-6 md:grid-cols-3">
				{#each updates as section}
					<Card>
						<CardHeader>
							<CardTitle>{section.category}</CardTitle>
							<CardDescription>Highlights</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each section.items as item}
								<Alert class="flex items-start gap-2">
									<ArrowRightIcon class="mt-1 h-4 w-4" />
									<AlertTitle class="leading-relaxed">{item}</AlertTitle>
								</Alert>
							{/each}
						</CardContent>
					</Card>
				{/each}
			</div>
		</section>
		<!-- Enhanced Updates Section with Dynamic Insights -->
		<section id="updates" class="py-10">
			<h2 class="text-foreground mb-2 text-center text-3xl font-bold">
				TL;DR: Development Insights
			</h2>
			<p class="text-muted-foreground mb-10 text-center text-sm">
				Real-time insights from our automated changelog system.
			</p>

			<!-- Dynamic Category Insights -->
			<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(typeStats) as [type, stats]}
					<Card class="border-border/50 bg-card/50 relative overflow-hidden backdrop-blur">
						<CardHeader class="pb-2">
							<div class="flex items-center justify-between">
								<CardTitle class="text-lg capitalize">{type}s</CardTitle>
								<Badge variant="secondary" class="text-xs">
									{stats.count}
								</Badge>
							</div>
							<CardDescription class="text-xs">
								{#if stats.recent.length > 0}
									{stats.recent.length} recent update{stats.recent.length === 1 ? '' : 's'}
								{:else}
									No recent activity
								{/if}
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-2">
							{#if stats.recent.length > 0}
								{#each stats.recent.slice(0, 2) as item}
									<div class="text-muted-foreground text-sm">
										<div class="flex items-center gap-2">
											<div class="bg-primary/60 h-1.5 w-1.5 rounded-full"></div>
											<span class="truncate" title={item.description}>{item.title}</span>
										</div>
									</div>
								{/each}
								{#if stats.recent.length > 2}
									<div class="text-muted-foreground/60 text-xs">
										+{stats.recent.length - 2} more...
									</div>
								{/if}
							{:else}
								<div class="text-muted-foreground/40 text-xs italic">
									All {type}s are from earlier periods
								</div>
							{/if}
						</CardContent>
						<!-- Visual accent based on type -->
						<div class={`absolute bottom-0 left-0 h-1 w-full ${getTypeAccent(type)}`}></div>
					</Card>
				{/each}
			</div>

			<!-- Manual Highlights (preserved) -->
			<div class="grid gap-6 md:grid-cols-3">
				{#each updates as section}
					<Card>
						<CardHeader>
							<CardTitle>{section.category}</CardTitle>
							<CardDescription>Highlights</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each section.items as item}
								<Alert class="flex items-start gap-2">
									<ArrowRightIcon class="mt-1 h-4 w-4" />
									<AlertTitle class="leading-relaxed">{item}</AlertTitle>
								</Alert>
							{/each}
						</CardContent>
					</Card>
				{/each}
			</div>
		</section>

		<section class="container mx-auto mt-16 max-w-3xl px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle>Need Svelte 4?</CardTitle>
					<CardDescription>Access the older version</CardDescription>
				</CardHeader>
				<CardContent class="text-center text-sm sm:text-base">
					<p class="mb-4">
						For those who wish to use the Svelte 4 version of the app, you can visit:
					</p>
					<p>
						<a
							href="https://old.svelte-apps.me"
							class="text-primary hover:text-primary/80 font-semibold underline transition-colors"
						>
							old.svelte-apps.me
						</a>
						or
						<a
							href="https://sv4.svelte-apps.me"
							class="text-primary hover:text-primary/80 font-semibold underline transition-colors"
						>
							sv4.svelte-apps.me
						</a>.
					</p>
				</CardContent>
			</Card>
		</section>
	</div>
</div>
