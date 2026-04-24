<script lang="ts">
	import * as Breadcrumb from '@/ui/breadcrumb/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Badge } from '@/ui/badge/index.js';
	import { page } from '$app/state';
	import { CodeXml } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { PanelRightOpen, Keyboard } from '@lucide/svelte';
	import AppTracker from '@/blocks/AppTracker.svelte';
	import { done } from '$lib/index.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { toast } from 'svelte-sonner';
	import { PersistedState } from 'runed';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let route = $derived(page.url.pathname.split('/'));
	let routeId = $derived(route[2]);
	let currentRoute = $derived(route[route.length - 1]);

	let link = 'https://github.com/Michael-Obele/Svelte-MiniApps/tree/master/src/routes/apps/(app)';
	let isSheetOpen = $state(false);
	type Shortcut = {
		description: string;
		keys: string[];
	};

	const keyboardShortcuts: Shortcut[] = [
		{ description: 'Toggle this menu', keys: ['Alt', 'D'] },
		{ description: 'Navigate forward', keys: ['Tab'] },
		{ description: 'Navigate backwards', keys: ['Shift', 'Tab'] },
		{ description: 'Open selected app', keys: ['Enter'] }
	];

	const indexedDbNoticeSeen = new PersistedState('miniapps-indexeddb-notice-seen', false, {
		storage: 'local',
		syncTabs: true
	});

	// Function to toggle the sheet
	function toggleSheet() {
		isSheetOpen = !isSheetOpen;
	}

	// Handle keyboard shortcut (Alt+A for "Apps")
	function handleKeyDown(event: KeyboardEvent) {
		if (event.altKey && event.key === 'd') {
			event.preventDefault();
			toggleSheet();
		}
	}

	// Function to navigate to an app and close the sheet
	function navigateToApp(appPath: string) {
		// Close the sheet
		isSheetOpen = false;

		// Use a small timeout to ensure the sheet starts closing before navigation
		setTimeout(() => {
			goto(`/apps/${appPath}`);
		}, 100);
	}

	onMount(() => {
		// Add keyboard event listener when component mounts
		window.addEventListener('keydown', handleKeyDown);

		if (!indexedDbNoticeSeen.current) {
			toast.info('App storage now uses IndexedDB only.', {
				description: 'LocalStorage fallback has been removed for app data.'
			});
			indexedDbNoticeSeen.current = true;
		}

		// Cleanup when component unmounts
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

{#if currentRoute && currentRoute !== 'apps'}
	<AppTracker appLink={currentRoute} />
{/if}

<div class="flex items-start justify-between p-1">
	<div class="relative mt-2 mb-5 flex place-items-center justify-center">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/apps">Apps</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					{#if routeId == currentRoute}
						<Breadcrumb.Page class="capitalize">{routeId}</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Link class="capitalize" href="/apps/{routeId.toLowerCase()}"
							>{routeId.toLowerCase()}</Breadcrumb.Link
						>
					{/if}
					<Badge
						variant="secondary"
						href={`${link}/${routeId.toLowerCase()}`}
						target="_blank"
					>
						<span class="hidden sm:inline"> View Source Code </span>
						<CodeXml size="16" class="sm:mx-1" />
					</Badge>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
	<div>
		<!-- Empty for layout -->
	</div>

	<Sheet.Root bind:open={isSheetOpen}>
		<Sheet.Trigger class="hover:bg-muted order-first mt-2 inline-flex rounded-xl border border-border/60 bg-background px-3 py-2 shadow-sm transition-colors">
			<div class="flex items-center gap-1">
				<PanelRightOpen class="size-5" />
				<span class="sr-only">Open apps menu</span>
				<div class="text-muted-foreground hidden items-center gap-1.5 text-xs md:flex">
					<Keyboard class="size-3.5" />
					<Kbd.Group class="rounded-md bg-muted/50 px-1.5 py-1">
						<Kbd.Root>Alt</Kbd.Root>
						<span class="px-0.5 text-[10px] leading-none">+</span>
						<Kbd.Root>D</Kbd.Root>
					</Kbd.Group>
				</div>
			</div>
		</Sheet.Trigger>
		<Sheet.Content class="w-[300px] sm:w-[400px]">
			<Sheet.Header class="pb-4">
				<Sheet.Title class="text-xl font-semibold">Available Apps</Sheet.Title>
				<Sheet.Description class="text-muted-foreground text-sm leading-6">
					Explore our collection of interactive mini applications built with Svelte.
				</Sheet.Description>
				<div class="border-muted/70 bg-gradient-to-br from-muted/50 to-background mt-3 rounded-xl border p-3 shadow-sm">
					<div class="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
						<div class="flex items-center gap-2">
							<div class="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
								<Keyboard class="size-4" />
							</div>
							<div>
								<p class="text-sm font-medium leading-none">Keyboard shortcuts</p>
								<p class="text-muted-foreground mt-1 text-xs">Fast controls for navigating apps</p>
							</div>
						</div>
						<span class="text-muted-foreground text-[10px] uppercase tracking-[0.24em]">Help</span>
					</div>
					<div class="mt-3 space-y-2 text-xs">
						{#each keyboardShortcuts as shortcut (shortcut.description)}
							<div class="bg-background/80 border-border/60 flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
								<span class="text-muted-foreground shrink-0">{shortcut.description}</span>
								{#if shortcut.keys.length === 1}
									<Kbd.Root>{shortcut.keys[0]}</Kbd.Root>
								{:else}
									<Kbd.Group class="rounded-md bg-muted/60 px-1.5 py-1">
										{#each shortcut.keys as key, index (key + index)}
											<Kbd.Root>{key}</Kbd.Root>
											{#if index < shortcut.keys.length - 1}
												<span class="text-muted-foreground px-0.5 text-[10px] leading-none">+</span>
											{/if}
										{/each}
									</Kbd.Group>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</Sheet.Header>
			<div class="flex flex-col gap-2 overflow-y-auto py-4" style="max-height: calc(80vh - 150px);">
				{#each done() as app (app.name)}
					<Sheet.Description>
						<!-- Updated to use the navigateToApp function -->
						<button
							class="hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-left"
							onclick={() => navigateToApp(app.name)}
						>
							<div class="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
								<span class="text-primary text-xs font-medium"
									>{app.name.charAt(0).toUpperCase()}</span
								>
							</div>
							<span class="capitalize">{app.name.replace(/-/g, ' ')}</span>
						</button>
					</Sheet.Description>
				{/each}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>

<div class="relative mt-6 min-h-screen" transition:fade={{ duration: 150 }}>
	{@render children?.()}
</div>
