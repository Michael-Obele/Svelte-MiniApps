<script lang="ts">
	import RouteHead from '@/blocks/RouteHead.svelte';
	import {
		notes,
		initNotes,
		addNote,
		updateNote,
		deleteNoteLocal,
		syncWithRemote,
		noteAdapter,
		needsSync,
		type Note
	} from './states.svelte';
	import { page } from '$app/state';
	import { getCurrentUser, createNoteForm, updateNoteForm, deleteNote } from '$lib/remote';
	import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import CreateNoteDialog from './components/CreateNoteDialog.svelte';
	import EditNoteDialog from './components/EditNoteDialog.svelte';
	import ViewNoteDialog from './components/ViewNoteDialog.svelte';
	import {
		Plus,
		Trash2,
		RefreshCw,
		Pencil,
		Search,
		Calendar,
		StickyNote,
		Eye
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

	$effect(() => {
		initNotes();
		getCurrentUser().then((user) => {
			currentUser = user || null;
			if (user) {
				handleSync();
			}
		});
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

<div class="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
	<!-- Header Section -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-3xl font-bold tracking-tight">My Notes</h2>
				<p class="text-muted-foreground mt-1 text-sm">Capture your thoughts and ideas</p>
			</div>
			<div class="flex gap-2">
				{#if currentUser}
					<Button variant="outline" size="icon" onclick={handleSync} disabled={isSyncing}>
						<RefreshCw class={isSyncing ? 'animate-spin' : ''} />
					</Button>
				{/if}
				<Button onclick={() => (createDialogOpen = true)}>
					<Plus class="mr-2 size-4" /> New Note
				</Button>
			</div>
		</div>

		<!-- Search Bar -->
		{#if notes.current.length > 0}
			<div class="relative" transition:fade={{ duration: 200 }}>
				<Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
				<Input
					type="text"
					placeholder="Search notes by title or content..."
					class="pl-10"
					bind:value={searchQuery}
				/>
			</div>
		{/if}
	</div>

	<Separator />

	<!-- Notes Grid -->
	{#if notes.current.length === 0}
		<div
			class="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
			transition:fade={{ duration: 300 }}
		>
			<div class="bg-primary/10 mb-4 rounded-full p-4">
				<StickyNote class="text-primary size-12" />
			</div>
			<h3 class="mb-2 text-xl font-semibold">No notes yet</h3>
			<p class="text-muted-foreground mb-6 max-w-sm">
				Start capturing your ideas and thoughts. Click the "New Note" button to create your first
				note.
			</p>
			<Button onclick={() => (createDialogOpen = true)}>
				<Plus class="mr-2 size-4" /> Create Your First Note
			</Button>
		</div>
	{:else if filteredNotes.length === 0}
		<div
			class="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
			transition:fade={{ duration: 300 }}
		>
			<Search class="text-muted-foreground mb-4 size-12" />
			<h3 class="mb-2 text-xl font-semibold">No notes found</h3>
			<p class="text-muted-foreground max-w-sm">
				No notes match your search. Try different keywords or create a new note.
			</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredNotes as note (note.id)}
				<div transition:fly={{ y: 20, duration: 300 }} class="group">
					<Card
						class="flex h-full flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
					>
						<CardHeader class="space-y-2">
							<div class="flex items-start justify-between gap-2">
								<CardTitle class="line-clamp-2 text-xl">{note.title}</CardTitle>
								<div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<Button
										variant="ghost"
										size="icon"
										class="size-8"
										onclick={() => openViewDialog(note)}
									>
										<Eye class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="size-8"
										onclick={() => openEditDialog(note)}
									>
										<Pencil class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="text-destructive hover:text-destructive size-8"
										onclick={() => handleDelete(note.id)}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
							</div>
							<Badge variant="secondary" class="w-fit">
								<Calendar class="mr-1 size-3" />
								{getRelativeTime(note.updatedAt)}
							</Badge>
						</CardHeader>
						<CardContent class="flex-1">
							<p class="text-muted-foreground line-clamp-6 text-sm whitespace-pre-wrap">
								{note.content}
							</p>
						</CardContent>
					</Card>
				</div>
			{/each}
		</div>
	{/if}
</div>

<CreateNoteDialog
	open={createDialogOpen}
	onOpenChange={(open: boolean) => (createDialogOpen = open)}
	{createNoteForm}
	{noteAdapter}
	{currentUser}
/>

<EditNoteDialog
	open={editDialogOpen}
	onOpenChange={(open: boolean) => (editDialogOpen = open)}
	{updateNoteForm}
	{noteAdapter}
	note={selectedNote}
	{currentUser}
/>

<ViewNoteDialog
	open={viewDialogOpen}
	onOpenChange={(open: boolean) => (viewDialogOpen = open)}
	note={selectedNote}
/>
