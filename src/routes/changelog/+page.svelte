<script lang="ts">
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
	import { Motion } from 'svelte-motion';
	import { items, allTimeline, timeline, updates, getTypeStyles } from './data';
	import { slide } from 'svelte/transition';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import { ArrowRightIcon } from 'lucide-svelte';
	import Highlight from './Highlight.svelte';
	import { once, preventDefault, scrollToID } from '$lib/utils';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Bot, SquarePen } from '@lucide/svelte';
	import DebugOrder from './DebugOrder.svelte';
	import ChangelogStats from './ChangelogStats.svelte';

	let selectedItem: (typeof allTimeline)[0] | null = $state(null);
	let showGenerated = $state(true);
	let showManual = $state(true);

	// Filter timeline based on selected filters
	const filteredTimeline = $derived(
		allTimeline.filter((item) => {
			if ('source' in item) {
				return (
					(item.source === 'manual' && showManual) || (item.source === 'generated' && showGenerated)
				);
			}
			return showManual; // Original timeline items are considered manual
		})
	);
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

<div class="min-h-screen bg-gradient-to-b from-background to-background/95">
	<div class="container mx-auto px-4 py-16">
		<div class="relative mb-16">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-white/10"></div>
			</div>
			<div class="relative flex justify-center">
				<span
					class="bg-background px-4 text-sm font-semibold uppercase tracking-wider text-white/60"
				>
					Latest Updates
				</span>
			</div>
		</div>

		<BlurInText>
			<h1
				class="mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text py-6 text-center text-4xl font-bold text-transparent sm:text-5xl"
			>
				Changelog: Svelte 4 to Svelte 5
			</h1>
		</BlurInText>

		<p class="mx-auto mb-16 mt-6 max-w-2xl text-center text-lg text-white/60">
			Transforming into a powerful offline-first platform while upgrading to the latest Svelte
			technologies
		</p>

		<!-- Bento Grid -->
		<div class="mx-auto mb-16 grid max-w-5xl gap-4 px-4 md:auto-rows-[20rem] md:grid-cols-3">
			{#each items as item}
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div
						class={`group relative overflow-hidden rounded-xl bg-white/5 p-8 ${item.className} transition-transform duration-300 hover:scale-105`}
					>
						<div class="relative z-10">
							<div class="mb-4">
								<item.icon size="32" />
							</div>
							<h3 class="mb-2 text-xl font-semibold text-white">{item.title}</h3>
							<p class="text-white/60">{item.description}</p>
						</div>
					</div>
				</Motion>
			{/each}
		</div>

		<Highlight />

		<section id="timeline" class="py-10">
			<!-- Updated timeline header using shadcn-svelte Badge component -->
			<div class="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
				<h2 class="text-3xl font-bold">Migration Timeline</h2>
				<a href="#updates" onclick={once(preventDefault(() => scrollToID('updates')))}>
					<Badge class="cursor-pointer text-xs">TL;DR Summary</Badge>
				</a>
			</div>

			<!-- Filter Controls -->
			<ChangelogStats />
			<DebugOrder />
			<div class="mb-8 flex flex-wrap items-center justify-center gap-4">
				<div class="flex items-center gap-2">
					<label class="flex cursor-pointer items-center gap-2">
						<input type="checkbox" bind:checked={showManual} class="rounded border-border" />
						<span class="text-sm">Manual Entries</span>
						<Badge variant="secondary" class="text-xs">
							{allTimeline.filter((item) => !('source' in item) || item.source === 'manual').length}
						</Badge>
					</label>
				</div>
				<div class="flex items-center gap-2">
					<label class="flex cursor-pointer items-center gap-2">
						<input type="checkbox" bind:checked={showGenerated} class="rounded border-border" />
						<span class="text-sm">Auto-Generated</span>
						<Badge variant="outline" class="text-xs">
							{allTimeline.filter((item) => 'source' in item && item.source === 'generated').length}
						</Badge>
					</label>
				</div>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						showManual = true;
						showGenerated = true;
					}}
				>
					Show All
				</Button>
			</div>

			<div class="relative mx-auto max-w-3xl">
				<!-- Timeline line -->
				<div class="absolute left-4 top-0 hidden h-full w-0.5 bg-border sm:left-1/2 sm:block"></div>
				<!-- Timeline items -->
				{#each filteredTimeline as item, index}
					<a
						href="#{index}"
						class="mb-8 flex flex-col transition-transform duration-300 hover:scale-105 sm:mb-12"
						transition:slide
						onclick={() => (selectedItem = item)}
						style="cursor: pointer;"
					>
						<div
							class="flex flex-col items-center sm:flex-row sm:gap-8"
							class:sm:flex-row-reverse={index % 2}
						>
							<!-- Date badge -->
							<div class="mb-4 flex-1 text-center sm:mb-0">
								<Badge variant="outline">{item.date}</Badge>
							</div>
							<!-- Icon -->
							<div
								class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow"
							>
								<item.icon class={`h-4 w-4 ${getTypeStyles(item.type)}`} />
							</div>
							<!-- Content -->
							<Card class="flex-1 p-4">
								<div class="mb-2 flex items-start justify-between gap-2">
									<h3 class="flex-1 font-semibold">{item.title}</h3>
									{#if 'source' in item}
										<Badge
											variant={item.source === 'manual' ? 'secondary' : 'outline'}
											class=" text-xs"
										>
											{#if item.source === 'generated'}
												<Bot class="size-4" />
											{:else}
												<SquarePen class="size-4" />
											{/if}
										</Badge>
									{:else}
										<Badge variant="secondary" class="text-xs">
											<SquarePen class="size-4" />
										</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">{item.description}</p>
							</Card>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<!-- Updated Modal for Timeline Item Details with full props and improved styling -->
		<Dialog.Root
			open={!!selectedItem}
			onOpenChange={(open) => {
				if (!open) selectedItem = null;
			}}
		>
			<Dialog.Content class="space-y-4 p-6 sm:max-w-[425px]">
				<Dialog.Header>
					<div class="flex flex-col items-center gap-3">
						{#if selectedItem}
							<selectedItem.icon
								class={`h-6 w-6 items-start ${getTypeStyles(selectedItem.type)}`}
							/>
						{/if}
						<Dialog.Title class="text-lg font-bold">
							{selectedItem?.title}
						</Dialog.Title>
					</div>
					<Dialog.Description class="text-sm text-muted-foreground">
						{selectedItem?.description}
					</Dialog.Description>
				</Dialog.Header>
				<!-- New info section for date and type -->
				{#if selectedItem}
					<div class="flex flex-wrap gap-2">
						<Badge variant="outline" class="text-sm">{selectedItem.date}</Badge>
						<Badge variant="outline" class="text-sm capitalize">{selectedItem.type}</Badge>
					</div>
				{/if}
				<!-- Details List -->
				{#if selectedItem}
					<ul class="my-4 ml-6 list-disc space-y-2">
						{#each selectedItem.items as detail}
							<li class="text-sm">{detail}</li>
						{/each}
					</ul>
				{/if}
				<Dialog.Footer>
					<Button onclick={() => (selectedItem = null)}>Close</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<!-- Detailed Updates (replaced section) -->
		<section id="updates" class="py-10">
			<h2 class="mb-2 text-center text-3xl font-bold">TL;DR: Key Summaries</h2>
			<p class="mb-10 text-center text-sm text-white/60">
				Click on any timeline item above for full details.
			</p>
			<div class="grid gap-6 md:grid-cols-2">
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
							class="font-semibold text-blue-500 underline hover:text-blue-300"
						>
							old.svelte-apps.me
						</a>
						or
						<a
							href="https://sv4.svelte-apps.me"
							class="font-semibold text-blue-500 underline hover:text-blue-300"
						>
							sv4.svelte-apps.me
						</a>.
					</p>
				</CardContent>
			</Card>
		</section>
	</div>
</div>
