import { PersistedState } from 'runed';
import type { PersistedItem } from '$lib/persisted-state/adapter';
import { syncNoteData } from '$lib/remote';

export interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

// NOTE: switching to Runed PersistedState for simple cross-tab persistence.
// We keep a minimal adapter wrapper to preserve the same adapter API used
// throughout the app (`init`, `listItems`, `saveItem`, `deleteItem`, `clearAll`).

const persistedNotes = new PersistedState<PersistedItem<Note>[]>('miniapps-notes-v1', [], {
	storage: 'local',
	syncTabs: true
});

export const noteAdapter = {
	async init() {
		// PersistedState requires no async initialization but keep method for compatibility
		return;
	},

	async listItems(): Promise<PersistedItem<Note>[]> {
		// PersistedState stores raw persisted items. Return a shallow clone to avoid accidental mutation.
		return $state.snapshot(persistedNotes.current) as PersistedItem<Note>[];
	},

	async saveItem(
		item: Partial<PersistedItem<Note>> & { payload: Note }
	): Promise<PersistedItem<Note>> {
		const now = new Date().toISOString();
		const id =
			item.id ||
			(typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: String(Date.now()));
		const record: PersistedItem<Note> = {
			id,
			createdAt: item.createdAt || now,
			updatedAt: now,
			payload: item.payload,
			schemaVersion: item.schemaVersion ?? 1
		};

		const current = persistedNotes.current || [];
		const idx = current.findIndex((r) => r.id === id);
		if (idx >= 0) {
			current.splice(idx, 1, record);
			persistedNotes.current = [...current];
		} else {
			persistedNotes.current = [...current, record];
		}

		return record;
	},

	async getItem(id: string): Promise<PersistedItem<Note> | null> {
		return persistedNotes.current.find((r) => r.id === id) ?? null;
	},

	async deleteItem(id: string): Promise<void> {
		persistedNotes.current = persistedNotes.current.filter((r) => r.id !== id);
	},

	async clearAll(): Promise<void> {
		persistedNotes.current = [];
	},

	// For compatibility with previous adapter-based sync format
	toServerFormat(item: PersistedItem<any>) {
		return {
			id: item.id,
			...((item.payload as any) || {}),
			_createdAt: item.createdAt,
			_updatedAt: item.updatedAt,
			schemaVersion: item.schemaVersion || 1
		};
	},

	fromServerFormat(obj: Record<string, any>) {
		const { id, _createdAt, _updatedAt, schemaVersion, ...payload } = obj as any;
		return {
			id: id || String(payload.id || Date.now()),
			createdAt: _createdAt || new Date().toISOString(),
			updatedAt: _updatedAt || new Date().toISOString(),
			payload: payload as any,
			schemaVersion: schemaVersion || 1
		} as PersistedItem<any>;
	}
} as const;

// Reactive state - derived from PersistedState for automatic reactivity
// Cannot export derived state directly, so we export a function that returns the current value
export const notes = {
	get current() {
		return persistedNotes.current
			.map((item) => item.payload)
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}
};
export const needsSync = $state({ value: false });

// Initialize - just ensure adapter is ready, reactive state will update automatically
export async function initNotes() {
	await noteAdapter.init();
	// The reactive notes state will automatically update when persistedNotes changes
}

// Actions - now just update PersistedState, reactive state updates automatically
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

	needsSync.value = true;

	return updatedNote;
}

export async function deleteNoteLocal(id: string) {
	await noteAdapter.deleteItem(id);
	needsSync.value = true;
}

export async function syncWithRemote() {
	const localItems = await noteAdapter.listItems();
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

		// Reactive state will update automatically
		needsSync.value = false;
		return { success: true, notes: result.notes };
	}
	return { success: false, notes: localNotes };
}
