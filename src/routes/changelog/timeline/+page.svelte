<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
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
	import { getAllTimeline, getTypeStyles } from '../data.svelte';
	import { Bot, SquarePen } from '@lucide/svelte';
	import ChangelogStats from '../ChangelogStats.svelte';
	import DebugOrder from '../DebugOrder.svelte';
	import Checkbox from '@/ui/checkbox/checkbox.svelte';
	import { Label } from '@/ui/label';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';

	const allTimeline = getAllTimeline();
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

	// Handle URL parameters to highlight specific timeline items on mount
	onMount(() => {
		const url = new URL(page.url);
		const highlightParam = url.searchParams.get('highlight');

		if (highlightParam) {
			// Find the timeline item that matches the highlight parameter
			const itemToHighlight = allTimeline.find(
				(item) =>
					item.title.toLowerCase().includes(highlightParam.toLowerCase()) ||
					item.date === highlightParam
			);

			if (itemToHighlight) {
				selectedItem = itemToHighlight;
			}
		}
	});
</script>

<RouteHead
	title="Timeline | Svelte Mini Apps Changelog"
	description="Detailed timeline of our Svelte 4 to Svelte 5 migration journey, featuring key milestones, technical updates, and development progress."
	keywords="svelte, svelte5, migration, timeline, changelog, development, milestones"
	route="/changelog/timeline"
	type="article"
/>

<div class="via-background/98 from-background to-background/95 min-h-screen bg-linear-to-b">
	<div class="container mx-auto px-4 py-16">
		<BlurInText>
			<h1
				class="from-foreground to-foreground/80 mb-4 bg-linear-to-r bg-clip-text py-6 text-center text-4xl font-bold text-transparent sm:text-5xl"
			>
				Timeline
			</h1>
		</BlurInText>

		<p class="text-muted-foreground mx-auto mt-6 mb-16 max-w-2xl text-center text-lg">
			Follow our detailed journey from Svelte 4 to Svelte 5, with key milestones, technical updates,
			and development progress tracking our modernization efforts.
		</p>

		<!-- Filter Controls -->
		<div class:hidden={!dev}>
			<ChangelogStats />
			<DebugOrder />
		</div>
		<div class="mb-8 flex flex-wrap items-center justify-center gap-4">
			<div class="flex items-center gap-2">
				<Label class="flex cursor-pointer items-center gap-2">
					<Checkbox bind:checked={showManual} class="h-4 w-4" />
					<span class="text-sm">Manual Entries</span>
					<Badge variant="secondary" class="text-xs">
						{allTimeline.filter((item) => !('source' in item) || item.source === 'manual').length}
					</Badge>
				</Label>
			</div>
			<div class="flex items-center gap-2">
				<Label class="flex cursor-pointer items-center gap-2">
					<Checkbox bind:checked={showGenerated} class="h-4 w-4" />
					<span class="text-sm">Auto-Generated</span>
					<Badge variant="outline" class="text-xs">
						{allTimeline.filter((item) => 'source' in item && item.source === 'generated').length}
					</Badge>
				</Label>
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
			<div class="bg-border absolute top-0 left-4 hidden h-full w-0.5 sm:left-1/2 sm:block"></div>
			<!-- Timeline items -->
			{#each filteredTimeline as item, index (item)}
				<div
					class="mb-8 flex flex-col transition-transform duration-300 hover:scale-105 sm:mb-12"
					transition:slide
					onclick={() => (selectedItem = item)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							selectedItem = item;
						}
					}}
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
							class="bg-card relative z-10 flex h-8 w-8 items-center justify-center rounded-full shadow"
						>
							<item.icon class={`h-4 w-4 ${getTypeStyles(item.type)}`} />
						</div>
						<!-- Content -->
						<Card class="flex-1 p-4">
							<div class="mb-2 flex items-start justify-between gap-2">
								<h3 class="flex-1 font-semibold">{item.title}</h3>
								{#if 'source' in item}
									<Badge variant="outline" class=" text-xs">
										{#if item.source === 'generated'}
											<Bot class="size-4" />
										{:else}
											<SquarePen class="size-4" />
										{/if}
									</Badge>
								{:else}
									<Badge variant="outline" class="text-xs">
										<SquarePen class="size-4" />
									</Badge>
								{/if}
							</div>
							<p class="text-muted-foreground text-sm">{item.description}</p>
						</Card>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Modal for Timeline Item Details -->
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
					<selectedItem.icon class={`h-6 w-6 items-start ${getTypeStyles(selectedItem.type)}`} />
				{/if}
				<Dialog.Title class="text-lg font-bold">
					{selectedItem?.title}
				</Dialog.Title>
			</div>
			<Dialog.Description class="text-muted-foreground text-sm">
				{selectedItem?.description}
			</Dialog.Description>
		</Dialog.Header>
		<!-- Info section for date and type -->
		{#if selectedItem}
			<div class="flex flex-wrap gap-2">
				<Badge variant="outline" class="text-sm">{selectedItem.date}</Badge>
				<Badge variant="outline" class="text-sm capitalize">{selectedItem.type}</Badge>
			</div>
		{/if}
		<!-- Details List -->
		{#if selectedItem}
			<ul class="my-4 ml-6 list-disc space-y-2">
				{#each selectedItem.items as detail (detail)}
					<li class="text-sm">{detail}</li>
				{/each}
			</ul>
		{/if}
		<Dialog.Footer>
			<Button onclick={() => (selectedItem = null)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
