/*
 * Persisted State Adapter (client-only) — Library copy
 * - Uses dynamic import of `idb` to avoid SSR issues in SvelteKit
 * - Small envelope around payload to keep metadata for sync/migrations
 * - Includes localStorage fallback if IndexedDB unavailable
 */

import type { IDBPDatabase } from 'idb';
export type AdapterOptions = {
	dbName?: string;
	storeName?: string;
	version?: number;
	useLocalStorageFallback?: boolean;
	// optional upgrade hook for custom migrations
	upgrade?: (db: IDBPDatabase, oldVersion: number) => void;
};

export interface PersistedItem<T = any> {
	id: string;
	createdAt: string;
	updatedAt: string;
	payload: T;
	schemaVersion?: number;
}

export interface SyncOptions<T = any> {
	fetchServerChanges?: () => Promise<Array<Record<string, any>>>;
	pushLocalChanges?: (items: Array<Record<string, any>>) => Promise<any>;
	conflictResolver?: (local: PersistedItem<T>, remote: Record<string, any>) => PersistedItem<T>;
}

// Module-level defaults (used by defaultAdapter)
const DEFAULT_DB_NAME = 'app-persist';
const DEFAULT_STORE_NAME = 'items';
const DEFAULT_DB_VERSION = 1;
const DEFAULT_USE_LOCALSTORAGE_FALLBACK = true;

export interface PersistedAdapter {
	init(): Promise<void>;
	saveItem<T = any>(item: Partial<PersistedItem<T>> & { payload: T }): Promise<PersistedItem<T>>;
	getItem<T = any>(id: string): Promise<PersistedItem<T> | null>;
	listItems<T = any>(): Promise<Array<PersistedItem<T>>>;
	deleteItem(id: string): Promise<void>;
	clearAll(): Promise<void>;
	toServerFormat<T = any>(item: PersistedItem<T>): Record<string, any>;
	fromServerFormat<T = any>(obj: Record<string, any>): PersistedItem<T>;
	syncWithServer<T = any>(opts: SyncOptions<T>): Promise<{ pushed: number; pulled: number }>;
	importLocalStorage(prefix?: string): Promise<number>; // imports keys with prefix and returns how many imported
}

// Factory to create an adapter for a specific db/store
export function createAdapter(opts?: AdapterOptions): PersistedAdapter {
	const _dbName = opts?.dbName || DEFAULT_DB_NAME;
	const _storeName = opts?.storeName || DEFAULT_STORE_NAME;
	const _dbVersion = opts?.version || DEFAULT_DB_VERSION;
	let _useLocalStorageFallback = opts?.useLocalStorageFallback ?? DEFAULT_USE_LOCALSTORAGE_FALLBACK;
	let dbPromise: Promise<IDBPDatabase> | null = null;

	async function init() {
		if (typeof window === 'undefined') return;
		if (dbPromise) return;
		try {
			const mod = await import('idb');
			const { openDB } = mod;
			dbPromise = openDB(_dbName, _dbVersion, {
				upgrade(db: IDBPDatabase, oldVersion: number) {
					if (oldVersion < 1) {
						db.createObjectStore(_storeName, { keyPath: 'id' });
					}
					if (oldVersion < 2) {
						// Example migration: add an index in version 2
						// If the store doesn't exist, create it with the index
						if (!db.objectStoreNames.contains(_storeName)) {
							const store = db.createObjectStore(_storeName, { keyPath: 'id' });
							store.createIndex('updatedAt', 'updatedAt');
						}
						// If the store already exists, creating an index requires a transaction on that store
						// which isn't necessary for our simple example. Add index creation logic in a migration script if required.
					}
				   // Call optional user-provided upgrade
				   if (opts?.upgrade) {
					   try {
						   opts.upgrade(db, oldVersion);
					   } catch (e) {
						   console.warn('Adapter upgrade hook threw an error:', e);
					   }
				   }
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

	async function getDB(): Promise<IDBPDatabase | null> {
		if (typeof window === 'undefined') throw new Error('Persisted adapter must be used in browser');
		if (_useLocalStorageFallback) return null;
		if (!dbPromise) await init();
		return dbPromise!;
	}

	async function saveItem<T = any>(item: Partial<PersistedItem<T>> & { payload: T }): Promise<PersistedItem<T>> {
		try {
			const db = await getDB();
			const now = new Date().toISOString();
			const id = item.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random());
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
				localStorage.setItem(`${_storeName}:${id}`, JSON.stringify(record));
			}
			return record;
		} catch (error) {
			throw new Error(`Failed to save item: ${error}`);
		}
	}

	async function getItem<T = any>(id: string): Promise<PersistedItem<T> | null> {
		try {
			const db = await getDB();
			if (db) {
				return db.get(_storeName, id) as Promise<PersistedItem<T> | null>;
			} else {
				const stored = localStorage.getItem(`${_storeName}:${id}`);
				return stored ? JSON.parse(stored) : null;
			}
		} catch (error) {
			throw new Error(`Failed to get item: ${error}`);
		}
	}

	async function listItems<T = any>(): Promise<Array<PersistedItem<T>>> {
		try {
			const db = await getDB();
			if (db) {
				return db.getAll(_storeName) as Promise<Array<PersistedItem<T>>>;
			} else {
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

	async function deleteItem(id: string): Promise<void> {
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

	async function clearAll(): Promise<void> {
		try {
			const db = await getDB();
			if (db) {
				await db.clear(_storeName);
			} else {
				const keysToRemove: string[] = [];
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i);
					if (key?.startsWith(`${_storeName}:`)) keysToRemove.push(key);
				}
				keysToRemove.forEach((key) => localStorage.removeItem(key));
			}
		} catch (error) {
			throw new Error(`Failed to clear all items: ${error}`);
		}
	}

	function toServerFormat<T = any>(item: PersistedItem<T>): Record<string, any> {
		return {
			id: item.id,
			...((item.payload as any) || {}),
			_createdAt: item.createdAt,
			_updatedAt: item.updatedAt,
			schemaVersion: item.schemaVersion || 1
		};
	}

	function fromServerFormat<T = any>(obj: Record<string, any>): PersistedItem<T> {
		const { id, _createdAt, _updatedAt, schemaVersion, ...payload } = obj as any;
		return {
			id: id || String(payload.id || Date.now()),
			createdAt: _createdAt || new Date().toISOString(),
			updatedAt: _updatedAt || new Date().toISOString(),
			payload: payload as T,
			schemaVersion: schemaVersion || 1
		};
	}

	async function syncWithServer<T = any>(opts: SyncOptions<T>): Promise<{ pushed: number; pulled: number }> {
		try {
			const local = await listItems<T>();
			const serverPushPayload = local.map((i) => toServerFormat(i));

			if (opts.pushLocalChanges) await opts.pushLocalChanges(serverPushPayload);

			let serverItems: Array<Record<string, any>> = [];
			if (opts.fetchServerChanges) serverItems = await opts.fetchServerChanges();

			const resolver = opts.conflictResolver || defaultConflictResolver;

			const itemsToSave: PersistedItem<T>[] = [];
			for (const s of serverItems) {
				const localMatch = local.find((l) => l.id === s.id);
				if (!localMatch) itemsToSave.push(fromServerFormat<T>(s));
				else itemsToSave.push(resolver(localMatch, s));
			}

			async function importLocalStorage(prefix?: string): Promise<number> {
				// Copy keys from localStorage that match key prefix into DB (migration helper)
				const keyPrefix = prefix ? `${prefix}:` : `${_storeName}:`;
				const imported: string[] = [];
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i);
					if (!key) continue;
					if (key.startsWith(keyPrefix)) {
						const stored = localStorage.getItem(key);
						if (!stored) continue;
						try {
							const obj = JSON.parse(stored);
							if (obj && obj.id && obj.payload !== undefined) {
								await saveItem(obj);
								imported.push(key);
							}
						} catch (e) {
							console.warn('Failed to parse localStorage key', key, e);
						}
					}
				}
				return imported.length;
			}

			await Promise.all(itemsToSave.map((item) => saveItem(item)));
			return { pushed: serverPushPayload.length, pulled: serverItems.length };
		} catch (error) {
			throw new Error(`Sync failed: ${error}`);
		}
	}

	return {
		init,
		saveItem,
		getItem,
		listItems,
		deleteItem,
		clearAll,
		toServerFormat,
		fromServerFormat,
		syncWithServer,
		importLocalStorage
	} as PersistedAdapter;
}

// Default adapter instance for convenience (app-level usage)
let defaultAdapterInstance: PersistedAdapter | null = null;

export function getDefaultAdapter(): PersistedAdapter {
	if (!defaultAdapterInstance) defaultAdapterInstance = createAdapter({ dbName: DEFAULT_DB_NAME, storeName: DEFAULT_STORE_NAME, version: DEFAULT_DB_VERSION, useLocalStorageFallback: DEFAULT_USE_LOCALSTORAGE_FALLBACK });
	return defaultAdapterInstance;
}

export async function init(opts?: AdapterOptions) {
	if (typeof window === 'undefined') return;
	if (!defaultAdapterInstance) defaultAdapterInstance = createAdapter(opts);
	await defaultAdapterInstance.init();
}

// Convenience wrappers that use defaultAdapterInstance
function ensureDefaultAdapter() {
	if (!defaultAdapterInstance) defaultAdapterInstance = createAdapter();
	return defaultAdapterInstance;
}

export const saveItem = async <T = any>(item: Partial<PersistedItem<T>> & { payload: T }) => ensureDefaultAdapter().saveItem(item);
export const getItem = async <T = any>(id: string) => ensureDefaultAdapter().getItem(id);
export const listItems = async <T = any>() => ensureDefaultAdapter().listItems<T>();
export const deleteItem = async (id: string) => ensureDefaultAdapter().deleteItem(id);
export const clearAll = async () => ensureDefaultAdapter().clearAll();
export const toServerFormat = <T = any>(item: PersistedItem<T>) => ensureDefaultAdapter().toServerFormat(item);
export const fromServerFormat = <T = any>(obj: Record<string, any>) => ensureDefaultAdapter().fromServerFormat(obj);
export const syncWithServer = async <T = any>(opts: SyncOptions<T>) => ensureDefaultAdapter().syncWithServer(opts);
export const importLocalStorage = async (prefix?: string) => ensureDefaultAdapter().importLocalStorage(prefix);

// Top-level convenience wrappers exist above and delegate to the default adapter.

// Conversion utilities and sync wrappers are exported above and delegate to the default adapter.

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
