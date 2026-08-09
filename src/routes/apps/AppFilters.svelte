<script lang="ts">
	import { Button } from '@/ui/button/index.js';
	import { Command, Search, X } from '@lucide/svelte';
	import * as Dialog from '@/ui/dialog/index.js';
	import Input from '@/ui/input/input.svelte';
	import { PressedKeys } from 'runed';
	import { projects } from '$lib/index.svelte';

	let {
		app = $bindable(''),
		searchQuery = $bindable('')
	}: {
		app?: string;
		searchQuery?: string;
	} = $props();

	// Dialog open state — fully owned by this component
	let dialogOpen = $state(false);

	// Alphabetically sorted projects (locale-aware)
	let sortedProjects = $derived([...projects()].sort((a, b) => a.title.localeCompare(b.title)));

	let filteredProjects = $derived(
		searchQuery
			? sortedProjects.filter(
					(project) =>
						project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						project.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
						project.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
						project.link.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: sortedProjects
	);

	// Track currently pressed keys via Runed's PressedKeys utility.
	// `onKeys` only fires once the full combination is held, so pressing
	// Ctrl/Cmd alone can never open the dialog — the `k` must also be pressed.
	const keys = new PressedKeys();

	function openSearch() {
		// Don't re-trigger if the dialog is already open
		if (dialogOpen) return;
		dialogOpen = true;
	}

	// Ctrl+K (Windows/Linux) and Cmd+K (macOS) open the search dialog
	keys.onKeys(['control', 'k'], openSearch);
	keys.onKeys(['meta', 'k'], openSearch);

	// Suppress the browser's native Ctrl+K / Cmd+K (focuses the address/search
	// bar) so it doesn't steal focus from our dialog. PressedKeys' onKeys
	// callback doesn't receive the event, so we prevent the default here.
	function preventNativeCombo(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={preventNativeCombo} />

<!-- App Search Section -->
<div class="mb-12 flex w-full flex-col items-center justify-center gap-6">
	<!-- Search Bar -->
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Trigger class="w-full max-w-xl">
			<div class="group relative mx-auto w-full cursor-pointer">
				<div
					class="border-border/50 from-background/90 via-background/80 to-muted/35 ring-border/30 flex items-center gap-3 rounded-2xl border bg-gradient-to-br px-5 py-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)] ring-1 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-[0_32px_90px_-42px_rgba(220,38,38,0.45)] hover:ring-red-500/15"
				>
					<div
						class="flex size-11 items-center justify-center rounded-xl bg-red-500/12 text-red-600 transition-transform duration-300 group-hover:scale-105 dark:text-red-400"
					>
						<Search class="size-5" />
					</div>
					<div class="min-w-0 flex-1 text-left">
						<p class="text-foreground truncate text-base font-semibold">Open app search</p>
						<p class="text-muted-foreground text-sm">
							Jump to a mini app by name, tag, or feature.
						</p>
					</div>
					<div class="hidden items-center gap-2 sm:flex">
						<span
							class="bg-muted/80 text-muted-foreground ring-border/60 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1"
						>
							<Command class="size-3.5" />
							<span>Ctrl K</span>
						</span>
					</div>
				</div>
			</div>
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[620px]">
			<Dialog.Header>
				<div class="flex items-start gap-3">
					<div
						class="bg-muted text-foreground flex size-11 items-center justify-center rounded-xl border"
					>
						<Search class="size-5 text-red-500" />
					</div>
					<div class="space-y-1">
						<Dialog.Title>Search Apps</Dialog.Title>
						<Dialog.Description>
							Find the mini application you want by title, tag, or description.
						</Dialog.Description>
					</div>
				</div>
			</Dialog.Header>
			<div class="mt-5 space-y-4">
				<div class="flex items-center gap-2">
					<div
						class="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-xl border"
					>
						<Search class="size-4.5 text-red-500" />
					</div>
					<Input
						id="app-search-dialog"
						type="text"
						name="app-search"
						bind:value={searchQuery}
						oninput={() => {
							app = searchQuery;
						}}
						placeholder="Search by app name, description, tag, or slug..."
						class="border-input flex-1 rounded-xl focus-visible:ring-red-500"
						autofocus
					/>
					{#if searchQuery}
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground inline-flex size-10 items-center justify-center rounded-xl border transition-colors"
							onclick={() => {
								searchQuery = '';
								app = '';
							}}
						>
							<X class="size-4" />
							<span class="sr-only">Clear search</span>
						</button>
					{/if}
				</div>

				<div class="max-h-[320px] space-y-2 overflow-y-auto pr-1">
					{#if filteredProjects.length === 0}
						<div class="text-muted-foreground rounded-xl border border-dashed py-8 text-center">
							No projects found matching "{searchQuery}"
						</div>
					{:else}
						{#each filteredProjects as project (project.link)}
							<a
								href={'/apps/' + project.link}
								class="group from-background to-muted/20 flex w-full cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-r px-4 py-3 text-left transition-all hover:border-red-500/25 hover:bg-red-50/70 dark:hover:bg-red-900/10"
							>
								<div>
									<div
										class="text-foreground flex items-center gap-2 font-medium group-hover:text-red-600 dark:group-hover:text-red-400"
									>
										{project.title}
									</div>
									<div class="text-muted-foreground text-sm">
										{project.details}
									</div>
									<div
										class="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
									>
										{project.tag}
									</div>
								</div>
								<div class="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
									{project.difficulty}
								</div>
							</a>
						{/each}
					{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						searchQuery = '';
						app = '';
						dialogOpen = false;
					}}
				>
					Clear
				</Button>
				<Button
					class="bg-red-600 text-white hover:bg-red-700"
					onclick={() => {
						dialogOpen = false;
					}}
				>
					Close
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
