<script lang="ts">
	import RouteHead from '@/blocks/RouteHead.svelte';
	import {
		notes,
		initNotes,
		deleteNoteLocal,
		syncWithRemote,
		noteAdapter,
		needsSync,
		type Note
	} from './states.svelte';
	import { page } from '$app/state';
	import {
		getCurrentUser,
		createNoteForm,
		updateNoteForm,
		deleteNote,
		getNotes
	} from '$lib/remote';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardFooter,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { CreateNoteDialog, EditNoteDialog, ViewNoteDialog } from './components';
	import {
		Plus,
		Trash2,
		RefreshCw,
		Pencil,
		Search,
		Calendar,
		StickyNote,
		Eye,
		Loader2
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fly, fade } from 'svelte/transition';

	let currentUser = $state<{ id: string } | null>(null);
	let isSyncing = $state(false);
	let searchQuery = $state('');

	// Filter notes based on search query
	let filteredNotes = $derived(
		notes.current.filter(
			(note) =>
				note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				note.content.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Visibility / online detection
	let online = $state(true);
	let visibilityState = $state<DocumentVisibilityState>('visible');

	// Sync scheduling
	let syncInFlight = $state(false);
	let lastSyncAt = $state(0);
	let syncIntervalBaseMs = 120_000; // 2 minute base interval
	let syncIntervalMs = $state(syncIntervalBaseMs);
	let failureCount = $state(0);
	let immediateSyncTimer: number | null = null;

	// Polling state
	let hasRemoteChanges = $state(false);

	$effect(() => {
		initNotes();
		getCurrentUser().then((user) => {
			currentUser = user || null;
			if (user) {
				handleSync();
			}
		});
	});

	// Polling for updates
	$effect(() => {
		if (!currentUser || !online) return;

		const interval = setInterval(async () => {
			try {
				const remoteNotes = await getNotes();

				const localNotes = notes.current;

				let changed = false;
				if (remoteNotes.length !== localNotes.length) {
					changed = true;
				} else {
					const latestRemote = remoteNotes.reduce(
						(prev, curr) => (new Date(curr.updatedAt) > new Date(prev.updatedAt) ? curr : prev),
						remoteNotes[0]
					);

					const latestLocal = localNotes.reduce(
						(prev, curr) => (new Date(curr.updatedAt) > new Date(prev.updatedAt) ? curr : prev),
						localNotes[0]
					);

					if (latestRemote && latestLocal) {
						if (
							new Date(latestRemote.updatedAt).getTime() > new Date(latestLocal.updatedAt).getTime()
						) {
							changed = true;
						}
					} else if (latestRemote || latestLocal) {
						changed = true;
					}
				}

				if (changed && !hasRemoteChanges) {
					hasRemoteChanges = true;
					toast.info('New changes available', {
						action: {
							label: 'Refresh',
							onClick: () => {
								handleSync();
								hasRemoteChanges = false;
							}
						},
						duration: Infinity
					});
				}
			} catch (e) {
				console.error('Polling failed', e);
			}
		}, 10000); // 10 seconds

		return () => clearInterval(interval);
	});

	// Keep track of online/visibility events via bindings
	// svelte:window and svelte:document bindings below will update `online` and `visibilityState`.

	// Throttled/controlled sync runner
	async function attemptSyncIfNeeded() {
		if (!currentUser) return;
		if (!online) return;
		if (visibilityState !== 'visible') return;
		if (!needsSync.value) return;
		if (syncInFlight) return;

		const now = Date.now();
		const minIntervalMs = 10_000; // Don't sync more often than every 10s
		if (now - lastSyncAt < minIntervalMs) return;

		syncInFlight = true;
		try {
			const result = await syncWithRemote();
			if (result?.success) {
				// reset backoff and mark last sync
				lastSyncAt = Date.now();
				failureCount = 0;
				syncIntervalMs = syncIntervalBaseMs;
			} else {
				failureCount += 1;
				syncIntervalMs = Math.min(syncIntervalBaseMs * 2 ** failureCount, 10 * 60_000);
			}
		} catch (e) {
			failureCount += 1;
			syncIntervalMs = Math.min(syncIntervalBaseMs * 2 ** failureCount, 10 * 60_000);
		} finally {
			syncInFlight = false;
		}
	}

	// Immediate debounce trigger when local changes happen
	$effect(() => {
		// Track the flag, and schedule immediate attempt after 5s
		needsSync.value;
		if (!needsSync.value || !currentUser) return;
		if (!page.url.pathname.startsWith('/apps/note-taker')) return; // Only sync on note-taker page
		if (immediateSyncTimer) clearTimeout(immediateSyncTimer);
		immediateSyncTimer = setTimeout(() => {
			attemptSyncIfNeeded();
		}, 5000) as unknown as number;

		return () => {
			if (immediateSyncTimer) clearTimeout(immediateSyncTimer);
		};
	});

	// Periodic interval runner that respects our interval/backoff
	$effect(() => {
		// depends on online, visibility, currentUser and syncIntervalMs
		online;
		visibilityState;
		currentUser;
		syncIntervalMs;

		let intervalId: number | null = null;
		if (
			currentUser &&
			online &&
			visibilityState === 'visible' &&
			page.url.pathname.startsWith('/apps/note-taker')
		) {
			// Run an initial check immediately, then on the interval
			attemptSyncIfNeeded();
			intervalId = setInterval(() => {
				attemptSyncIfNeeded();
			}, syncIntervalMs) as unknown as number;
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});

	async function handleSync() {
		if (!currentUser) return;
		isSyncing = true;
		try {
			const result = await syncWithRemote();
			if (result?.success) {
				toast.success('Notes synced successfully');
			} else {
				toast.error('Failed to sync notes');
			}
		} catch (e) {
			console.error(e);
			toast.error('Failed to sync notes');
		} finally {
			isSyncing = false;
		}
	}

	// Dialogs
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let viewDialogOpen = $state(false);
	let selectedNote = $state<Note | null>(null);

	function openEditDialog(note: Note) {
		selectedNote = note;
		editDialogOpen = true;
	}

	function openViewDialog(note: Note) {
		selectedNote = note;
		viewDialogOpen = true;
	}

	function getRelativeTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return 'just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	async function handleDelete(id: string) {
		if (confirm('Delete this note?')) {
			await deleteNoteLocal(id);
			if (currentUser) {
				try {
					await deleteNote(id);
				} catch (e) {
					console.error('Failed to delete remote note', e);
				}
			}
			toast.success('Note deleted');
		}
	}
</script>

<RouteHead title="Note Taker" description="Capture your thoughts" route="/apps/note-taker" />

<svelte:window bind:online />
<svelte:document bind:visibilityState />

<div class="container mx-auto max-w-6xl space-y-8 p-4 md:p-8">
	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<div class="relative w-full md:w-96">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input placeholder="Search notes..." bind:value={searchQuery} class="pl-9" />
		</div>
		<div class="flex w-full items-center gap-2 md:w-auto">
			{#if currentUser}
				<Button
					variant="outline"
					size="icon"
					onclick={handleSync}
					disabled={isSyncing || !online}
					title="Sync now"
				>
					<RefreshCw class="h-4 w-4 {isSyncing ? 'animate-spin' : ''}" />
				</Button>
			{/if}
			<Button onclick={() => (createDialogOpen = true)} class="w-full md:w-auto">
				<Plus class="mr-2 h-4 w-4" />
				New Note
			</Button>
		</div>
	</div>

	{#if !online}
		<div
			class="flex items-center gap-2 rounded-md bg-yellow-100 px-4 py-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
			transition:fade
		>
			<div class="h-2 w-2 rounded-full bg-yellow-500"></div>
			You are currently offline. Changes will be saved locally and synced when you reconnect.
		</div>
	{/if}

	{#if filteredNotes.length === 0}
		<div class="space-y-4 py-20 text-center" in:fade>
			<div class="bg-muted/30 mx-auto w-fit rounded-full p-6">
				<StickyNote class="text-muted-foreground/50 h-12 w-12" />
			</div>
			<div class="space-y-1">
				<h3 class="text-xl font-semibold">No notes found</h3>
				<p class="text-muted-foreground">
					{searchQuery
						? 'Try adjusting your search query'
						: 'Create your first note to get started'}
				</p>
			</div>
			{#if !searchQuery}
				<Button variant="outline" onclick={() => (createDialogOpen = true)}>Create Note</Button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" in:fade>
			{#each filteredNotes as note (note.id)}
				<div transition:fly={{ y: 20, duration: 300 }}>
					<Card
						class="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
					>
						<CardHeader class="pb-3">
							<div class="flex items-start justify-between gap-2">
								<CardTitle
									class="line-clamp-1 text-lg leading-tight font-semibold"
									title={note.title}
								>
									{note.title}
								</CardTitle>
								{#if !currentUser}
									<Badge variant="secondary" class="h-5 px-1.5 text-[10px]">Local</Badge>
								{/if}
							</div>
							<CardDescription class="flex items-center gap-1 text-xs">
								<Calendar class="h-3 w-3" />
								{new Date(note.updatedAt).toLocaleDateString()}
							</CardDescription>
						</CardHeader>
						<CardContent class="flex-grow pb-3">
							<p class="text-muted-foreground line-clamp-4 text-sm whitespace-pre-wrap">
								{note.content}
							</p>
						</CardContent>
						<CardFooter
							class="flex justify-end gap-1 pt-0 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={() => {
									selectedNote = note;
									viewDialogOpen = true;
								}}
								title="View"
							>
								<Eye class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={() => {
									selectedNote = note;
									editDialogOpen = true;
								}}
								title="Edit"
							>
								<Pencil class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="text-destructive hover:text-destructive h-8 w-8"
								onclick={() => handleDelete(note.id)}
								title="Delete"
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</CardFooter>
					</Card>
				</div>
			{/each}
		</div>
	{/if}
</div>

<CreateNoteDialog
	bind:open={createDialogOpen}
	{createNoteForm}
	{noteAdapter}
	{currentUser}
	onSaved={(note: Note) => {
		needsSync.value = true;
	}}
/>

<EditNoteDialog
	bind:open={editDialogOpen}
	note={selectedNote}
	{updateNoteForm}
	{noteAdapter}
	{currentUser}
	onSaved={(note: Note) => {
		needsSync.value = true;
	}}
/>

<ViewNoteDialog bind:open={viewDialogOpen} note={selectedNote} />
