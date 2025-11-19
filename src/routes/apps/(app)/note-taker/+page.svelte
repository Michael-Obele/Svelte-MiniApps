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
		type Note
	} from './states.svelte';
	import { getCurrentUser, createNoteForm, updateNoteForm, deleteNote } from '$lib/remote';
	import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Plus, Trash2, RefreshCw, Pencil } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let currentUser = $state<{ id: string } | null>(null);
	let isSyncing = $state(false);
	let isSaving = $state(false);

	$effect(() => {
		initNotes();
		getCurrentUser().then((user) => {
			currentUser = user || null;
			if (user) {
				handleSync();
			}
		});
	});

	async function handleSync() {
		if (!currentUser) return;
		isSyncing = true;
		try {
			await syncWithRemote();
			toast.success('Notes synced successfully');
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

	// Local Handlers
	async function handleLocalCreate(e: SubmitEvent) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		isSaving = true;
		try {
			toast.promise(addNote(title, content), {
				loading: 'Saving note locally...',
				success: 'Note saved locally',
				error: 'Failed to save note locally'
			});
			createDialogOpen = false;
			(e.target as HTMLFormElement).reset();
		} catch (error) {
			// toast.promise will display the error toast
		} finally {
			isSaving = false;
		}
	}

	async function handleLocalUpdate(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedNote) return;
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		isSaving = true;
		try {
			toast.promise(updateNote(selectedNote.id, { title, content }), {
				loading: 'Saving note locally...',
				success: 'Note updated locally',
				error: 'Failed to update note locally'
			});
			editDialogOpen = false;
			selectedNote = null;
		} catch (error) {
			// toast.promise will display the error
		} finally {
			isSaving = false;
		}
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

<!-- Create Dialog -->
<Dialog open={createDialogOpen} onOpenChange={(open) => (createDialogOpen = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create Note</DialogTitle>
		</DialogHeader>
		<form
			{...currentUser
				? createNoteForm.enhance(async ({ form, submit }) => {
						isSaving = true;
						try {
							toast.promise(submit(), {
								loading: 'Saving note...',
								success: 'Note saved',
								error: 'Failed to save note'
							});
							const result = createNoteForm.result as { success: boolean; note: Note } | undefined;
							if (result?.note) {
								const n = result.note;
								await noteAdapter.saveItem({
									id: n.id,
									payload: n,
									createdAt: n.createdAt,
									updatedAt: n.updatedAt
								});
								notes.current = [n, ...notes.current];
								createDialogOpen = false;
								form.reset();
							}
						} catch (e) {
							// toast.promise will have shown an error but keep fallback
							toast.error('Failed to create note');
						} finally {
							isSaving = false;
						}
					})
				: {}}
			onsubmit={currentUser ? undefined : handleLocalCreate}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="title">Title</Label>
				<Input id="title" name="title" required />
			</div>
			<div class="space-y-2">
				<Label for="content">Content</Label>
				<Textarea id="content" name="content" rows={5} />
			</div>
			<DialogFooter>
				<Button type="submit" disabled={isSaving}>
					{#if isSaving}
						<RefreshCw class="mr-2 size-4 animate-spin" />
					{/if}
					Save
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Edit Dialog -->
<Dialog open={editDialogOpen} onOpenChange={(open) => (editDialogOpen = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Note</DialogTitle>
		</DialogHeader>
		{#if selectedNote}
			<form
				{...currentUser
					? updateNoteForm.enhance(async ({ form, submit }) => {
							isSaving = true;
							try {
								toast.promise(submit(), {
									loading: 'Saving note...',
									success: 'Note updated',
									error: 'Failed to update note'
								});
								const result = updateNoteForm.result as
									| { success: boolean; note: Note }
									| undefined;
								if (result?.note) {
									const n = result.note;
									await noteAdapter.saveItem({
										id: n.id,
										payload: n,
										createdAt: n.createdAt,
										updatedAt: n.updatedAt
									});
									notes.current = notes.current.map((x) => (x.id === n.id ? n : x));
									editDialogOpen = false;
									selectedNote = null;
								}
							} catch (e) {
								// toast.promise will show an error, fallback message
								toast.error('Failed to update note');
							} finally {
								isSaving = false;
							}
						})
					: {}}
				onsubmit={currentUser ? undefined : handleLocalUpdate}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={selectedNote.id} />
				<div class="space-y-2">
					<Label for="edit-title">Title</Label>
					<Input id="edit-title" name="title" value={selectedNote.title} required />
				</div>
				<div class="space-y-2">
					<Label for="edit-content">Content</Label>
					<Textarea id="edit-content" name="content" value={selectedNote.content} rows={5} />
				</div>
				<DialogFooter>
					<Button type="submit" disabled={isSaving}>
						{#if isSaving}
							<RefreshCw class="mr-2 size-4 animate-spin" />
						{/if}
						Update
					</Button>
				</DialogFooter>
			</form>
		{/if}
	</DialogContent>
</Dialog>
