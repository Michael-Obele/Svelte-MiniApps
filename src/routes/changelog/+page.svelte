<script lang="ts">
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
	import { Motion } from 'svelte-motion';
	import { getAllTimeline, getUpdates, getTypeAccent } from './data.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import { ArrowRightIcon, ExternalLink } from '@lucide/svelte';
	import Highlight from './Highlight.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ChevronDown, Megaphone } from '@lucide/svelte';
	import { Code, Rocket, Search, Wrench, CircleSlash } from '@lucide/svelte';
	import { Badge } from '@/ui/badge';

	// Get data from factory functions
	const updates = getUpdates();

	// Bento grid items - defined here so strings are properly extracted by Wuchale
	const items = [
		{
			title: 'Offline-First Architecture',
			description:
				'Complete rebuild focusing on offline capabilities and local-first data management. Users can use the nuke button to clear cached data if they notice issues with the app.',
			className: 'md:col-span-2',
			color: 'from-blue-500/20 via-transparent',
			icon: Code
		},
		{
			title: 'Enhanced Performance',
			description: 'Optimized load times and responsiveness through local data management.',
			className: 'md:col-span-1',
			color: 'from-purple-500/20 via-transparent',
			icon: Rocket
		},
		{
			title: 'Svelte 5 Migration',
			description: 'Complete upgrade to Svelte 5 with modern features and optimizations.',
			className: 'md:col-span-1',
			color: 'from-green-500/20 via-transparent',
			icon: Search
		},
		{
			title: 'Local Data Persistence',
			description: 'Robust local storage implementation with IndexedDB and background sync.',
			className: 'md:col-span-1',
			color: 'from-yellow-500/20 via-transparent',
			icon: Wrench
		},
		{
			title: 'PWA Support',
			description: 'Full Progressive Web App capabilities with offline support and installability.',
			className: 'md:col-span-1',
			color: 'from-red-500/20 via-transparent',
			icon: CircleSlash
		}
	];

	const quickAccessCards = [
		{
			icon: ArrowRightIcon,
			title: 'Timeline',
			description: 'Detailed timeline of our Svelte 5 migration journey',
			href: '/changelog/timeline',
			buttonText: 'View Timeline'
		},
		{
			icon: Megaphone,
			title: 'Announcements',
			description: 'Latest news and upcoming features',
			href: '/changelog/announcements',
			buttonText: 'View Announcements'
		},
		{
			icon: ArrowRightIcon,
			title: 'Planned Features',
			description: "Explore what's coming next",
			href: '/changelog/planned-features',
			buttonText: 'View Features'
		}
	];
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
							Timeline
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
			{#each items as item (item.title)}
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
			{#each quickAccessCards as card (card.title)}
				<Card class="group  transition-all duration-300 hover:scale-105 hover:shadow-lg">
					<CardHeader class="text-center">
						<div
							class="bg-primary/10 group-hover:bg-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
						>
							<card.icon class="text-primary h-6 w-6" />
						</div>
						<CardTitle class="text-lg">{card.title}</CardTitle>
						<CardDescription>{card.description}</CardDescription>
					</CardHeader>
					<CardContent class="text-center">
						<Button href={card.href} variant="outline" class="w-full">{card.buttonText}</Button>
					</CardContent>
				</Card>
			{/each}
		</div>

		<!-- Manual Highlights Section -->
		<section id="updates" class="py-10">
			<h2 class="text-foreground mb-2 text-center text-3xl font-bold">Highlights</h2>
			<p class="text-muted-foreground mb-10 text-center text-sm">
				Key achievements and major improvements.
			</p>

			<div class="grid gap-6 md:grid-cols-3">
				{#each updates as section (section.category)}
					<Card>
						<CardHeader>
							<CardTitle>{section.category}</CardTitle>
							<CardDescription>Highlights</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each section.items as item (item)}
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
			<Card class="border-primary/20 overflow-visible border-t-2">
				<CardHeader class="flex items-start justify-between gap-4">
					<div class="flex items-start gap-3">
						<!-- <div class="text-primary pt-1">
							<ExternalLink class="h-5 w-5" />
						</div> -->
						<div>
							<CardTitle>Need Svelte 4?</CardTitle>
							<CardDescription>Legacy version access and migration resources</CardDescription>
						</div>
					</div>
					<Badge variant="secondary" class="tracking-wider uppercase">Legacy</Badge>
				</CardHeader>
				<CardContent class="text-center text-sm sm:text-base">
					<p class="text-muted-foreground mb-6">
						If you depend on the Svelte 4 release, open the legacy app. The new app focuses on
						performance and PWA features; review your integration before upgrading.
					</p>
					<div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
						<Button class="w-full sm:w-auto" variant="secondary">
							<a href="https://old.svelte-apps.me" target="_blank" rel="noopener noreferrer">
								Open Legacy App
							</a>
							<ExternalLink />
						</Button>
					</div>
					<p class="text-muted-foreground/70 mt-4 text-xs">
						Note: Legacy builds may not include the latest security or PWA improvements.
					</p>
				</CardContent>
			</Card>
		</section>
	</div>
</div>
