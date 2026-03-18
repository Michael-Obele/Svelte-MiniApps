/*
 * Persisted State Adapter (svelte-idb backed)
 * - Uses svelte-idb as the IndexedDB implementation
 * - Keeps a localStorage import path for first-run migrations
 * - Preserves the existing adapter helper API used throughout the app
 */
import { browser } from '$app/environment';
import { createDB } from 'svelte-idb';

export type AdapterOptions = {
	dbName?: string;
	storeName?: string;
	version?: number;
	useLocalStorageFallback?: boolean;
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

const DEFAULT_DB_NAME = 'miniapps-persisted-state';
const DEFAULT_STORE_NAME = 'states';
const DEFAULT_DB_VERSION = 1;
const DEFAULT_USE_LOCALSTORAGE_FALLBACK = true;

type SvelteIdbDatabase = ReturnType<typeof createDB>;
type SvelteIdbStore = {
	put(value: PersistedItem<any>): Promise<unknown>;
	get(key: string): Promise<PersistedItem<any> | undefined>;
	getAll(): Promise<Array<PersistedItem<any>>>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
};

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
	importLocalStorage(prefix?: string): Promise<number>;
}

export function createAdapter(opts?: AdapterOptions): PersistedAdapter {
	const dbName = opts?.dbName ?? DEFAULT_DB_NAME;
	const storeName = opts?.storeName ?? DEFAULT_STORE_NAME;
	const version = opts?.version ?? DEFAULT_DB_VERSION;
	const useLocalStorageFallback = opts?.useLocalStorageFallback ?? DEFAULT_USE_LOCALSTORAGE_FALLBACK;
	let dbInstance: SvelteIdbDatabase | null = null;

	async function init() {
		if (dbInstance) return;

		dbInstance = createDB({
			name: dbName,
			version,
			stores: {
				[storeName]: {
					keyPath: 'id'
				}
			},
			ssr: 'noop'
		});
	}

	async function getDB(): Promise<SvelteIdbDatabase | null> {
		await init();
		return dbInstance;
	}

	function getStore(db: SvelteIdbDatabase): SvelteIdbStore {
		return (db as unknown as Record<string, SvelteIdbStore>)[storeName];
	}

	function createRecord<T>(item: Partial<PersistedItem<T>> & { payload: T }): PersistedItem<T> {
		const now = new Date().toISOString();
		const id = item.id ?? crypto.randomUUID();

		return {
			id,
			createdAt: item.createdAt ?? now,
			updatedAt: item.updatedAt ?? now,
			payload: item.payload,
			schemaVersion: item.schemaVersion ?? 1
		};
	}

	function storageKey(id: string) {
		return `${storeName}:${id}`;
	}

	function readLocalStorageValue<T>(key: string): PersistedItem<T> | null {
		const raw = localStorage.getItem(key);
		if (!raw) return null;

		try {
			const parsed = JSON.parse(raw) as Partial<PersistedItem<T>> | T;

			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'id' in parsed &&
				'payload' in parsed
			) {
				return {
					id: String((parsed as PersistedItem<T>).id),
					createdAt: (parsed as PersistedItem<T>).createdAt ?? new Date().toISOString(),
					updatedAt: (parsed as PersistedItem<T>).updatedAt ?? new Date().toISOString(),
					payload: (parsed as PersistedItem<T>).payload,
					schemaVersion: (parsed as PersistedItem<T>).schemaVersion ?? 1
				};
			}

			return {
				id: key,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				payload: parsed as T,
				schemaVersion: 1
			};
		} catch {
			return {
				id: key,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				payload: raw as T,
				schemaVersion: 1
			};
		}
	}

	async function saveItem<T = any>(item: Partial<PersistedItem<T>> & { payload: T }): Promise<PersistedItem<T>> {
		const record = createRecord(item);
		const db = await getDB();

		if (db) {
			await getStore(db).put(record);
		} else if (browser) {
			localStorage.setItem(storageKey(record.id), JSON.stringify(record));
		}

		return record;
	}

	async function getItem<T = any>(id: string): Promise<PersistedItem<T> | null> {
		const db = await getDB();

		if (db) {
			return ((await getStore(db).get(id)) as PersistedItem<T> | undefined) ?? null;
		}

		if (!browser) return null;
		return readLocalStorageValue<T>(storageKey(id));
	}

	async function listItems<T = any>(): Promise<Array<PersistedItem<T>>> {
		const db = await getDB();

		if (db) {
			return (await getStore(db).getAll()) as Array<PersistedItem<T>>;
		}

		if (!browser) return [];

		const items: Array<PersistedItem<T>> = [];
		for (let index = 0; index < localStorage.length; index++) {
			const key = localStorage.key(index);
			if (!key || !key.startsWith(`${storeName}:`)) continue;
			const value = readLocalStorageValue<T>(key);
			if (value) items.push(value);
		}

		return items;
	}

	async function deleteItem(id: string): Promise<void> {
		const db = await getDB();

		if (db) {
			await getStore(db).delete(id);
		} else if (browser) {
			localStorage.removeItem(storageKey(id));
		}
	}

	async function clearAll(): Promise<void> {
		const db = await getDB();

		if (db) {
			await getStore(db).clear();
			return;
		}

		if (!browser) return;

		const keysToRemove: string[] = [];
		for (let index = 0; index < localStorage.length; index++) {
			const key = localStorage.key(index);
			if (key?.startsWith(`${storeName}:`)) keysToRemove.push(key);
		}

		keysToRemove.forEach((key) => localStorage.removeItem(key));
	}

	function toServerFormat<T = any>(item: PersistedItem<T>): Record<string, any> {
		return {
			id: item.id,
			...((item.payload as any) || {}),
			_createdAt: item.createdAt,
			_updatedAt: item.updatedAt,
			schemaVersion: item.schemaVersion ?? 1
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
		const localItems = await listItems<T>();
		const localPayload = localItems.map((item) => toServerFormat(item));

		if (opts.pushLocalChanges) {
			await opts.pushLocalChanges(localPayload);
		}

		const remoteItems = opts.fetchServerChanges ? await opts.fetchServerChanges() : [];
		const resolver = opts.conflictResolver ?? defaultConflictResolver;

		for (const remote of remoteItems) {
			const localMatch = localItems.find((item) => item.id === remote.id);
			const nextItem = localMatch ? resolver(localMatch, remote) : fromServerFormat<T>(remote);
			await saveItem(nextItem);
		}

		return { pushed: localPayload.length, pulled: remoteItems.length };
	}

	async function importLocalStorage(prefix?: string): Promise<number> {
		if (!browser) return 0;

		const targetPrefix = prefix ?? storeName;
		let imported = 0;

		for (let index = 0; index < localStorage.length; index++) {
			const key = localStorage.key(index);
			if (!key) continue;

			const matchesPrefix = key === targetPrefix || key.startsWith(`${targetPrefix}:`);
			if (!matchesPrefix) continue;

			const raw = localStorage.getItem(key);
			if (!raw) continue;

			try {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed === 'object' && 'payload' in parsed) {
					await saveItem(parsed as Partial<PersistedItem<any>> & { payload: any });
				} else {
					const id = key.includes(':') ? key.slice(key.lastIndexOf(':') + 1) : key;
					await saveItem({ id, payload: parsed });
				}
				localStorage.removeItem(key);
				imported += 1;
			} catch (error) {
				console.warn('Failed to import localStorage key', key, error);
			}
		}

		return imported;
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
	};
}

let defaultAdapterInstance: PersistedAdapter | null = null;

export function getDefaultAdapter(): PersistedAdapter {
	if (!defaultAdapterInstance) {
		defaultAdapterInstance = createAdapter();
	}

	return defaultAdapterInstance;
}

export async function init(opts?: AdapterOptions) {
	if (!defaultAdapterInstance) {
		defaultAdapterInstance = createAdapter(opts);
	}

	await defaultAdapterInstance.init();
}

function ensureDefaultAdapter() {
	if (!defaultAdapterInstance) {
		defaultAdapterInstance = createAdapter();
	}

	return defaultAdapterInstance;
}

export const saveItem = async <T = any>(item: Partial<PersistedItem<T>> & { payload: T }) =>
	ensureDefaultAdapter().saveItem(item);
export const getItem = async <T = any>(id: string) => ensureDefaultAdapter().getItem<T>(id);
export const listItems = async <T = any>() => ensureDefaultAdapter().listItems<T>();
export const deleteItem = async (id: string) => ensureDefaultAdapter().deleteItem(id);
export const clearAll = async () => ensureDefaultAdapter().clearAll();
export const toServerFormat = <T = any>(item: PersistedItem<T>) =>
	ensureDefaultAdapter().toServerFormat(item);
export const fromServerFormat = <T = any>(obj: Record<string, any>) =>
	ensureDefaultAdapter().fromServerFormat<T>(obj);
export const syncWithServer = async <T = any>(opts: SyncOptions<T>) =>
	ensureDefaultAdapter().syncWithServer(opts);
export const importLocalStorage = async (prefix?: string) =>
	ensureDefaultAdapter().importLocalStorage(prefix);

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