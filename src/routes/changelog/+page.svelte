<script lang="ts">
  import RouteHead from '$lib/components/RouteHead.svelte';
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
	import { Motion } from 'svelte-motion';
	import { items, timeline, updates, getTypeStyles } from './data';
	import { slide } from 'svelte/transition';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog/index.js';
	import { Button, buttonVariants } from '@/ui/button/index.js';
	import { Alert, AlertTitle, AlertDescription } from '@/ui/alert';
	import { ArrowRightIcon } from 'lucide-svelte';
	import Highlight from './Highlight.svelte';
	import { once, preventDefault, scrollToID } from '$lib/utils';

	let selectedItem: (typeof timeline)[0] | null = $state(null);
</script>
<RouteHead
  title="Changelog | Svelte MiniApps"
  description="Explore the latest updates and improvements to Svelte MiniApps. Stay informed about new features, bug fixes, and performance enhancements."
  keywords="svelte, mini apps, changelog, updates, features, bug fixes, performance"
  route="/changelog"
/>
<div class="min-h-screen bg-gradient-to-b from-background to-background/95">
	<div class="container mx-auto px-4 py-16 lg:max-w-7xl">
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
		<div class="mx-auto mb-16 grid gap-6 px-4 md:auto-rows-[22rem] md:grid-cols-3 lg:gap-8">
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
								<item.icon size="36" class="lg:h-10 lg:w-10" />
							</div>
							<h3 class="mb-2 text-xl font-semibold text-white lg:text-2xl">{item.title}</h3>
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
				<h2 class="text-3xl font-bold lg:text-4xl">Migration Timeline</h2>
				<a href="#updates" onclick={preventDefault(() => scrollToID('updates'))}>
					<Badge class="cursor-pointer text-xs lg:text-sm">TL;DR Summary</Badge>
				</a>
			</div>
			<div class="relative mx-auto max-w-3xl lg:max-w-5xl">
				<!-- Timeline line -->
				<div class="absolute left-4 top-0 hidden h-full w-0.5 bg-border sm:left-1/2 sm:block"></div>
				<!-- Timeline items -->
				{#each timeline as item, index}
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
							<Card class="flex-1 p-4 lg:p-6">
								<h3 class="mb-2 font-semibold lg:text-lg">{item.title}</h3>
								<p class="text-sm text-muted-foreground lg:text-base">{item.description}</p>
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
			<h2 class="mb-2 text-center text-3xl font-bold lg:text-4xl">TL;DR: Key Summaries</h2>
			<p class="mb-10 text-center text-sm text-white/60 lg:text-base">
				Click on any timeline item above for full details.
			</p>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{#each updates as section}
					<Card>
						<CardHeader>
							<CardTitle class='my-3'>{section.category}</CardTitle>
							<!-- <CardDescription>Highlights</CardDescription> -->
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

		<section class="container mx-auto mt-16 max-w-3xl px-4 py-8 lg:max-w-4xl">
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
