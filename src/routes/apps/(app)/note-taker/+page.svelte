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
	import CreateNoteDialog from './components/CreateNoteDialog.svelte';
	import EditNoteDialog from './components/EditNoteDialog.svelte';
	import { Plus, Trash2, RefreshCw, Pencil } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let currentUser = $state<{ id: string } | null>(null);
	let isSyncing = $state(false);

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
	let selectedNote = $state<Note | null>(null);

	function openEditDialog(note: Note) {
		selectedNote = note;
		editDialogOpen = true;
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
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">My Notes</h2>
		<div class="flex gap-2">
			{#if currentUser}
				<Button variant="outline" size="icon" onclick={handleSync} disabled={isSyncing}>
					<RefreshCw class={isSyncing ? 'animate-spin' : ''} />
				</Button>
			{/if}
			<Button onclick={() => (createDialogOpen = true)}>
				<Plus class="mr-2 size-4" /> Add Note
			</Button>
		</div>
	</div>

	{#if notes.current.length === 0}
		<Card class="p-6">
			<p class="text-muted-foreground text-center">
				No notes yet. Click "Add Note" to get started.
			</p>
		</Card>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each notes.current as note (note.id)}
				<Card class="flex flex-col p-4 md:p-6">
					<CardHeader>
						<CardTitle>{note.title}</CardTitle>
					</CardHeader>
					<CardContent class="flex-1 pb-4">
						<p class="text-muted-foreground text-sm whitespace-pre-wrap">{note.content}</p>
					</CardContent>
					<CardFooter class="text-muted-foreground flex items-center justify-between gap-2 text-xs">
						<span>{new Date(note.updatedAt).toLocaleDateString()}</span>
						<div class="flex gap-1">
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={() => openEditDialog(note)}
							>
								<Pencil class="size-3" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="text-destructive h-8 w-8"
								onclick={() => handleDelete(note.id)}
							>
								<Trash2 class="size-3" />
							</Button>
						</div>
					</CardFooter>
				</Card>
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
	onSaved={(note: Note) => (notes.current = [note, ...notes.current])}
/>

<EditNoteDialog
	open={editDialogOpen}
	onOpenChange={(open: boolean) => (editDialogOpen = open)}
	{updateNoteForm}
	{noteAdapter}
	note={selectedNote}
	{currentUser}
	onSaved={(note: Note) => {
		notes.current = notes.current.map((n) => (n.id === note.id ? note : n));
		selectedNote = null;
	}}
/>
