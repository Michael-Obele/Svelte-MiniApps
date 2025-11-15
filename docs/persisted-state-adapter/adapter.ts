/*
 * Persisted State Adapter (client-only)
 * - Uses dynamic import of `idb` to avoid SSR issues in SvelteKit
 * - Small envelope around payload to keep metadata for sync/migrations
 * - Includes localStorage fallback if IndexedDB unavailable
 */

import type { IDBPDatabase } from 'idb';

export interface PersistedItem<T = any> {
	id: string;
	createdAt: string;
	updatedAt: string;
	payload: T;
	schemaVersion?: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;
let _dbName = 'app-persist';
let _storeName = 'items';
let _dbVersion = 1;
let _useLocalStorageFallback = false;

/**
 * Initialize the IndexedDB database. Falls back to localStorage if IndexedDB is unavailable.
 * Must be called from client-side code (e.g., onMount).
 */
export async function init(opts?: {
	dbName?: string;
	storeName?: string;
	version?: number;
	useLocalStorageFallback?: boolean;
}) {
	if (typeof window === 'undefined') {
		return;
	}

	_dbName = opts?.dbName || _dbName;
	_storeName = opts?.storeName || _storeName;
	_dbVersion = opts?.version || _dbVersion;
	_useLocalStorageFallback = opts?.useLocalStorageFallback ?? true;

	if (dbPromise) return;

	try {
		const mod = await import('idb');
		const { openDB } = mod;

		dbPromise = openDB(_dbName, _dbVersion, {
			upgrade(db: IDBPDatabase, oldVersion: number) {
				if (oldVersion < 1) {
					db.createObjectStore(_storeName, { keyPath: 'id' });
				}
				// Example migration: add index in version 2
				if (oldVersion < 2) {
					const store = db.createObjectStore(_storeName, { keyPath: 'id' });
					store.createIndex('updatedAt', 'updatedAt');
				}
				// Add more migrations as schema evolves
			}
		});
	} catch (error) {
		console.warn('IndexedDB unavailable, falling back to localStorage:', error);
		if (_useLocalStorageFallback) {
			_useLocalStorageFallback = true;
		} else {
			throw new Error('IndexedDB unavailable and fallback disabled');
		}
	}
}

/**
 * Get the database instance, initializing if needed.
 */
async function getDB(): Promise<IDBPDatabase | null> {
	if (typeof window === 'undefined') throw new Error('Persisted adapter must be used in browser');
	if (_useLocalStorageFallback) return null; // Use localStorage
	if (!dbPromise) await init();
	return dbPromise!;
}

/**
 * Save an item to storage.
 */
export async function saveItem<T = any>(
	item: Partial<PersistedItem<T>> & { payload: T }
): Promise<PersistedItem<T>> {
	try {
		const db = await getDB();
		const now = new Date().toISOString();
		const id =
			item.id ||
			(typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: String(Date.now()) + Math.random());

		const record: PersistedItem<T> = {
			id,
			createdAt: item.createdAt || now,
			updatedAt: now,
			payload: item.payload,
			schemaVersion: item.schemaVersion || 1
		};

		if (db) {
			await db.put(_storeName, record);
		} else {
			// localStorage fallback
			localStorage.setItem(`${_storeName}:${id}`, JSON.stringify(record));
		}
		return record;
	} catch (error) {
		throw new Error(`Failed to save item: ${error}`);
	}
}

/**
 * Get an item by ID.
 */
export async function getItem<T = any>(id: string): Promise<PersistedItem<T> | null> {
	try {
		const db = await getDB();
		if (db) {
			return db.get(_storeName, id) as Promise<PersistedItem<T> | null>;
		} else {
			// localStorage fallback
			const stored = localStorage.getItem(`${_storeName}:${id}`);
			return stored ? JSON.parse(stored) : null;
		}
	} catch (error) {
		throw new Error(`Failed to get item: ${error}`);
	}
}

/**
 * List all items.
 */
export async function listItems<T = any>(): Promise<Array<PersistedItem<T>>> {
	try {
		const db = await getDB();
		if (db) {
			return db.getAll(_storeName) as Promise<Array<PersistedItem<T>>>;
		} else {
			// localStorage fallback
			const items: Array<PersistedItem<T>> = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(`${_storeName}:`)) {
					const stored = localStorage.getItem(key);
					if (stored) items.push(JSON.parse(stored));
				}
			}
			return items;
		}
	} catch (error) {
		throw new Error(`Failed to list items: ${error}`);
	}
}

/**
 * Delete an item by ID.
 */
export async function deleteItem(id: string): Promise<void> {
	try {
		const db = await getDB();
		if (db) {
			await db.delete(_storeName, id);
		} else {
			localStorage.removeItem(`${_storeName}:${id}`);
		}
	} catch (error) {
		throw new Error(`Failed to delete item: ${error}`);
	}
}

/**
 * Clear all items.
 */
export async function clearAll(): Promise<void> {
	try {
		const db = await getDB();
		if (db) {
			await db.clear(_storeName);
		} else {
			// localStorage fallback
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(`${_storeName}:`)) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((key) => localStorage.removeItem(key));
		}
	} catch (error) {
		throw new Error(`Failed to clear all items: ${error}`);
	}
}

// Conversion utilities
/**
 * Convert local persisted item to server format (plain object).
 */
export function toServerFormat<T = any>(item: PersistedItem<T>): Record<string, any> {
	return {
		id: item.id,
		...((item.payload as any) || {}),
		_createdAt: item.createdAt,
		_updatedAt: item.updatedAt,
		schemaVersion: item.schemaVersion || 1
	};
}

/**
 * Convert server format to local persisted item.
 */
export function fromServerFormat<T = any>(obj: Record<string, any>): PersistedItem<T> {
	const { id, _createdAt, _updatedAt, schemaVersion, ...payload } = obj as any;
	return {
		id: id || String(payload.id || Date.now()),
		createdAt: _createdAt || new Date().toISOString(),
		updatedAt: _updatedAt || new Date().toISOString(),
		payload: payload as T,
		schemaVersion: schemaVersion || 1
	};
}

export interface SyncOptions<T = any> {
	fetchServerChanges?: () => Promise<Array<Record<string, any>>>;
	pushLocalChanges?: (items: Array<Record<string, any>>) => Promise<any>;
	conflictResolver?: (local: PersistedItem<T>, remote: Record<string, any>) => PersistedItem<T>;
}

/**
 * Sync with server: push local changes and pull/merge server changes.
 */
export async function syncWithServer<T = any>(
	opts: SyncOptions<T>
): Promise<{ pushed: number; pulled: number }> {
	try {
		const local = await listItems<T>();
		const serverPushPayload = local.map((i) => toServerFormat(i));

		if (opts.pushLocalChanges) {
			await opts.pushLocalChanges(serverPushPayload);
		}

		let serverItems: Array<Record<string, any>> = [];
		if (opts.fetchServerChanges) {
			serverItems = await opts.fetchServerChanges();
		}

		const resolver = opts.conflictResolver || defaultConflictResolver;

		// Batch save new/resolved items
		const itemsToSave: PersistedItem<T>[] = [];
		for (const s of serverItems) {
			const localMatch = local.find((l) => l.id === s.id);
			if (!localMatch) {
				itemsToSave.push(fromServerFormat<T>(s));
			} else {
				const resolved = resolver(localMatch, s);
				itemsToSave.push(resolved);
			}
		}

		await Promise.all(itemsToSave.map((item) => saveItem(item)));

		return { pushed: serverPushPayload.length, pulled: serverItems.length };
	} catch (error) {
		throw new Error(`Sync failed: ${error}`);
	}
}

/**
 * Default conflict resolver: last-write-wins.
 */
function defaultConflictResolver<T = any>(
	local: PersistedItem<T>,
	remote: Record<string, any>
): PersistedItem<T> {
	const remoteUpdated = remote._updatedAt ? new Date(remote._updatedAt).getTime() : 0;
	const localUpdated = new Date(local.updatedAt).getTime();

	if (remoteUpdated > localUpdated) {
		return fromServerFormat<T>(remote);
	}
	return local;
}
