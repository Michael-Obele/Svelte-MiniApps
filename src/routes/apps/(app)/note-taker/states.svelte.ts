import { createAdapter } from '$lib/persisted-state/adapter';
import { syncNoteData } from '$lib/remote';

export interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

// Create adapter instance
export const noteAdapter = createAdapter({
	dbName: 'miniapps-notes-v1',
	storeName: 'notes'
});

// Reactive state
export const notes = $state<{ current: Note[] }>({ current: [] });
export const needsSync = $state({ value: false });

// Initialize
export async function initNotes() {
	await noteAdapter.init();
	const items = await noteAdapter.listItems<Note>();
	notes.current = items
		.map((item) => item.payload)
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// Actions
export async function addNote(title: string, content: string) {
	const now = new Date().toISOString();
	const newNote: Note = {
		id: crypto.randomUUID(),
		title,
		content,
		createdAt: now,
		updatedAt: now
	};

	await noteAdapter.saveItem({
		id: newNote.id,
		payload: newNote,
		createdAt: newNote.createdAt,
		updatedAt: newNote.updatedAt
	});

	notes.current = [newNote, ...notes.current];
	needsSync.value = true;
	return newNote;
}

export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) {
	const note = notes.current.find((n) => n.id === id);
	if (!note) return;

	const updatedNote = {
		...note,
		...updates,
		updatedAt: new Date().toISOString()
	};

	await noteAdapter.saveItem({
		id: updatedNote.id,
		payload: updatedNote,
		createdAt: updatedNote.createdAt,
		updatedAt: updatedNote.updatedAt
	});

	notes.current = notes.current
		.map((n) => (n.id === id ? updatedNote : n))
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

	needsSync.value = true;

	return updatedNote;
}

export async function deleteNoteLocal(id: string) {
	await noteAdapter.deleteItem(id);
	notes.current = notes.current.filter((n) => n.id !== id);
	needsSync.value = true;
}

export async function syncWithRemote() {
	const localItems = await noteAdapter.listItems<Note>();
	const localNotes = localItems.map((i) => i.payload);

	const result = await syncNoteData({ notes: localNotes });

	if (result.success) {
		// Update local DB with merged data
		// We clear all first to ensure we match server state exactly (handling deletions if server deleted)
		// But wait, syncNoteData merges. If I deleted locally, it might come back from server if server has it?
		// The sync logic in remote is: merge, then save to server.
		// It doesn't handle deletions explicitly (tombstones).
		// For this simple app, we accept that "last write wins" or "merge union".

		await noteAdapter.clearAll();

		for (const note of result.notes) {
			await noteAdapter.saveItem({
				id: note.id,
				payload: note,
				createdAt: note.createdAt,
				updatedAt: note.updatedAt
			});
		}

		notes.current = result.notes;
		needsSync.value = false;
		return { success: true, notes: result.notes };
	}
	return { success: false, notes: localNotes };
}
