<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import List from './List.svelte';
	import { Button } from '@/ui/button/index.js';
	import { filter } from '$lib/states.svelte';
	import Input from '@/ui/input/input.svelte';
	import BlurInText from '@/blocks/BlurInText.svelte';
	import { Command, Search, CheckCircle2 } from '@lucide/svelte';
	import * as Cmd from '@/ui/command/index.js';
	import * as Dialog from '@/ui/dialog/index.js';
	import { done, projects } from '$lib/index.svelte';

	function setFilterValue(filterValue: string): () => void {
		return () => {
			filter.current = filterValue;
		};
	}

	let app = $state('');
	let searchQuery = $state('');
	let filteredProjects = $derived(
		searchQuery
			? projects().filter(
					(project) =>
						project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						project.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
						project.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
						project.link.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: projects()
	);

	// Dialog state
	let dialogOpen = $state(false);

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

<RouteHead
	title="Apps | Svelte Mini Apps"
	description="Explore a variety of useful mini applications built with Svelte. Find tools for productivity, entertainment, and more."
	keywords="svelte, mini apps, applications, tools, productivity, entertainment"
	route="/apps"
/>
<BlurInText>
	<h1 class="my-8 text-center text-4xl font-bold">Explore Our Mini Applications</h1>
</BlurInText>

<div
	class="container mx-auto flex w-full flex-col items-center justify-center gap-4 py-6 md:flex-row md:py-8 lg:max-w-5xl"
>
	<div class="flex space-x-4">
		<Button
			onclick={setFilterValue('all')}
			class={`rounded-md px-5 py-2.5 text-base font-medium focus:ring-4 focus:outline-none ${
				filter.current === 'all'
					? 'border border-white bg-green-300 text-green-900 hover:border-green-200 hover:bg-green-700 focus:ring-green-300 dark:border-green-900 dark:bg-green-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-500 dark:focus:ring-green-800'
					: 'border border-green-600 bg-white text-green-700 hover:bg-green-700 hover:text-white focus:ring-green-300 dark:border-green-500 dark:bg-gray-900 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white dark:focus:ring-green-800'
			}`}
		>
			All
		</Button>

		<Button
			onclick={setFilterValue('done')}
			class="rounded-md px-5 py-2.5 text-base font-medium focus:ring-4 focus:outline-none {filter.current ===
			'done'
				? 'border border-white bg-green-300 text-green-900 hover:border-green-200 hover:bg-green-700 focus:ring-green-300 dark:border-green-900 dark:bg-green-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-500 dark:focus:ring-green-800'
				: 'border border-green-600 bg-white text-green-700 hover:bg-green-700 hover:text-white focus:ring-green-300 dark:border-green-500 dark:bg-gray-900 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white dark:focus:ring-green-800'}"
		>
			Done
		</Button>
	</div>

	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Trigger>
			<div class="relative mx-auto mt-4 w-full max-w-md cursor-pointer sm:mt-0">
				<div
					class="flex items-center rounded-lg border border-green-300 bg-white/5 px-4 py-2 shadow-md backdrop-blur-sm hover:border-green-500 hover:bg-white/10 dark:border-green-800 dark:bg-gray-900/50 dark:hover:border-green-700"
				>
					<Search class="mr-2 h-5 w-5 text-green-500 dark:text-green-400" />
					<div class="flex-1 px-2 py-1 text-base text-green-700 dark:text-green-400">
						Find App...
					</div>
					<div class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
						<Cmd.Shortcut
							class="flex items-center justify-center rounded-md bg-gray-200 px-1.5 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
						>
							<Command class="mr-1 size-3.5" />K
						</Cmd.Shortcut>
					</div>
				</div>
			</div>
		</Dialog.Trigger>
		<Dialog.Content class="w-80vw">
			<Dialog.Header>
				<Dialog.Title>Search Apps</Dialog.Title>
				<Dialog.Description>Find the mini application you're looking for</Dialog.Description>
			</Dialog.Header>
			<div class="mt-4 space-y-4">
				<div class="flex items-center space-x-2">
					<Search class="h-5 w-5 text-green-500 dark:text-green-400" />
					<Input
						id="app-search-dialog"
						type="text"
						name="app-search"
						bind:value={searchQuery}
						onchange={() => {
							app = searchQuery;
						}}
						placeholder="Search by name, or description..."
						class="flex-1 border-green-200 focus-visible:ring-green-500 dark:border-green-800 dark:focus-visible:ring-green-700"
						autofocus
					/>
				</div>

				<div class="max-h-[300px] overflow-y-auto">
					{#if filteredProjects.length === 0}
						<div class="py-4 text-center text-gray-500 dark:text-gray-400">
							No projects found matching "{searchQuery}"
						</div>
					{:else}
						{#each filteredProjects as project}
							{#if isCompleted(project.link)}
								<a
									href={'/apps/' + project.link}
									class="group flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left hover:bg-green-100 dark:hover:bg-green-900/30"
								>
									<div>
										<div
											class="flex items-center gap-2 font-medium text-green-800 dark:text-green-300"
										>
											{project.title}
											<CheckCircle2 class="h-4 w-4 text-green-600 dark:text-green-400" />
										</div>
										<div class="text-sm text-gray-600 dark:text-gray-400">{project.details}</div>
										<div
											class="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300"
										>
											{project.tag}
										</div>
									</div>
									<div class="text-xs font-medium text-gray-500 dark:text-gray-400">
										{project.difficulty}
									</div>
								</a>
							{:else}
								<div
									class="group flex w-full cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-left opacity-60"
								>
									<div>
										<div class="font-medium text-gray-500 dark:text-gray-400">
											{project.title} <span class="text-xs">(Coming Soon)</span>
										</div>
										<div class="text-sm text-gray-500 dark:text-gray-500">{project.details}</div>
										<div
											class="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
										>
											{project.tag}
										</div>
									</div>
									<div class="text-xs font-medium text-gray-400 dark:text-gray-500">
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

{#if app}
	<List filteredBy={app} />
{:else if filter.current === 'all'}
	<List filteredBy="all" />
{:else if filter.current === 'done'}
	<List filteredBy="done" />
{/if}
