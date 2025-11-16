import { onMount } from 'svelte';
import { createAdapter } from './adapter';
import type { AdapterOptions, PersistedItem, SyncOptions } from './adapter';

/**
 * Create a reactive Svelte store backed by the persisted-state adapter
 */
export function createPersistedStore<T = any>(opts?: AdapterOptions & { syncTabs?: boolean }) {
	const adapter = createAdapter(opts);

	// Reactive state for the items (typed)
	type Item = PersistedItem<T>;
	let items = $state([] as Item[]);

	async function reload() {
		await adapter.init();
		items = await adapter.listItems<T>();
		return items;
	}

	async function addItem(payload: T) {
		const saved = await adapter.saveItem({ payload });
		items = [...items, saved];
		return saved;
	}

	async function updateItem(id: string, payload: Partial<T>) {
		const current = items.find((i: Item) => i.id === id);
		if (!current) throw new Error('Item not found');
		const merged = { ...current.payload, ...(payload as T) } as T;
		const saved = await adapter.saveItem({ id, payload: merged });
		items = items.map((i: Item) => (i.id === saved.id ? saved : i));
		return saved;
	}

	async function deleteItem(id: string) {
		await adapter.deleteItem(id);
		items = items.filter((i: Item) => i.id !== id);
	}

	async function clear() {
		await adapter.clearAll();
		items = [];
	}

	async function syncWithServer(syncOpts: SyncOptions<T>) {
		await adapter.init();
		const result = await adapter.syncWithServer(syncOpts);
		// After successful sync, reload local state
		items = await adapter.listItems<T>();
		return result;
	}

	onMount(async () => {
		await reload();
	});

	// If requested, listen to storage events to sync between tabs
	if (opts?.syncTabs) {
		const handler = (e: StorageEvent) => {
			if (!e.key) return;
			const keyPrefix = `${opts?.storeName || 'items'}:`;
			if (e.key.startsWith(keyPrefix)) {
				// reload on changes to store keys
				void reload();
			}
		};
		window.addEventListener('storage', handler);
		// Cleanup on destroy
		onMount(() => {
			return () => window.removeEventListener('storage', handler);
		});
	}

	return {
		items,
		reload,
		addItem,
		updateItem,
		deleteItem,
		clear,
		syncWithServer
	};
}
