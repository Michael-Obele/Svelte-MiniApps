<script lang="ts">
	import { Button } from '@/ui/button/index.js';
	import { Command, Search, CheckCircle2, LayoutGrid, Grid2x2Check } from 'lucide-svelte';
	import * as Cmd from '@/ui/command/index.js';
	import * as Dialog from '@/ui/dialog/index.js';
	import * as ToggleGroup from '@/ui/toggle-group/index.js';
	import Input from '@/ui/input/input.svelte';
	import { done, projects } from '$lib/index.svelte';

	let {
		filter,
		app = $bindable(''),
		searchQuery = $bindable(''),
		dialogOpen = $bindable(false)
	}: {
		filter: { current: string };
		app?: string;
		searchQuery?: string;
		dialogOpen?: boolean;
	} = $props();

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

	// Function to handle keyboard shortcut
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey && event.key === 'k') {
			event.preventDefault();
			dialogOpen = true;
		}
	}

	// Add event listener for keydown
	$effect(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	// Check if a project is completed
	function isCompleted(link: string): boolean {
		return done().some((d) => d.name === link);
	}
</script>

<!-- Enhanced Filter & Search Section -->
<div class="mb-12 flex w-full flex-col items-center justify-center gap-6">
	<!-- Filter Toggle Group with Icons -->
	<div class="flex flex-col items-center gap-3">
		<p class="text-muted-foreground text-sm font-medium">Filter by</p>
		<ToggleGroup.Root
			type="single"
			value={filter.current}
			onValueChange={(value) => {
				if (value) filter.current = value;
			}}
			variant="outline"
			size="lg"
			class="from-background/80 to-muted/30 ring-border/50 inline-flex rounded-xl bg-gradient-to-br p-1.5 shadow-lg ring-1 backdrop-blur-sm transition-all"
		>
			<ToggleGroup.Item
				value="all"
				aria-label="Show all apps"
				class={`gap-2 px-6 py-2.5 text-base font-medium transition-all duration-300 ${
					filter.current === 'all'
						? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700 dark:shadow-[0_0_20px_rgba(220,38,38,0.3)]'
						: 'hover:bg-accent/50'
				}`}
			>
				<LayoutGrid class="h-4 w-4" />
				All Apps
			</ToggleGroup.Item>
			<ToggleGroup.Item
				value="done"
				aria-label="Show completed apps"
				class={`gap-2 px-6 py-2.5 text-base font-medium transition-all duration-300 ${
					filter.current === 'done'
						? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700 dark:shadow-[0_0_20px_rgba(220,38,38,0.3)]'
						: 'hover:bg-accent/50'
				}`}
			>
				<Grid2x2Check class="h-4 w-4" />
				Completed
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>

	<!-- Search Bar -->
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Trigger class="w-full max-w-xl">
			<div class="group relative mx-auto w-full cursor-pointer">
				<div
					class="border-border/50 from-background/80 to-muted/30 ring-border/30 flex items-center gap-3 rounded-xl border-2 bg-gradient-to-br px-5 py-3.5 shadow-lg ring-1 backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:ring-red-500/20"
				>
					<Search class="h-5 w-5 text-red-500 transition-transform group-hover:scale-110" />
					<div class="text-muted-foreground flex-1 text-left text-base font-medium">
						Search apps...
					</div>
					<div class="flex items-center gap-1.5">
						<Cmd.Shortcut
							class="bg-muted/80 text-muted-foreground ring-border/50 flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1"
						>
							<Command class="h-3 w-3" />
							<span>K</span>
						</Cmd.Shortcut>
					</div>
				</div>
			</div>
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[550px]">
			<Dialog.Header>
				<Dialog.Title>Search Apps</Dialog.Title>
				<Dialog.Description>Find the mini application you're looking for</Dialog.Description>
			</Dialog.Header>
			<div class="mt-4 space-y-4">
				<div class="flex items-center space-x-2">
					<Search class="h-5 w-5 text-red-500" />
					<Input
						id="app-search-dialog"
						type="text"
						name="app-search"
						bind:value={searchQuery}
						onchange={() => {
							app = searchQuery;
						}}
						placeholder="Search by name, or description..."
						class="border-input flex-1 focus-visible:ring-red-500"
						autofocus
					/>
				</div>

				<div class="max-h-[300px] overflow-y-auto">
					{#if filteredProjects.length === 0}
						<div class="text-muted-foreground py-4 text-center">
							No projects found matching "{searchQuery}"
						</div>
					{:else}
						{#each filteredProjects as project (project.link)}
							{#if isCompleted(project.link)}
								<a
									href={'/apps/' + project.link}
									class="group flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/10"
								>
									<div>
										<div
											class="text-foreground flex items-center gap-2 font-medium group-hover:text-red-600 dark:group-hover:text-red-400"
										>
											{project.title}
											<CheckCircle2 class="h-4 w-4 text-green-500" />
										</div>
										<div class="text-muted-foreground text-sm">
											{project.details}
										</div>
										<div
											class="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
										>
											{project.tag}
										</div>
									</div>
									<div class="text-muted-foreground text-xs font-medium">
										{project.difficulty}
									</div>
								</a>
							{:else}
								<div
									class="group flex w-full cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-left opacity-60"
								>
									<div>
										<div class="text-muted-foreground font-medium">
											{project.title}
											<span class="text-xs">(Coming Soon)</span>
										</div>
										<div class="text-muted-foreground text-sm">
											{project.details}
										</div>
										<div
											class="bg-muted text-muted-foreground mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
										>
											{project.tag}
										</div>
									</div>
									<div class="text-muted-foreground text-xs font-medium">
										{project.difficulty}
									</div>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						searchQuery = '';
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
