# Persisted State Adapter (Library)

Local-first persistence backed by IndexedDB via `svelte-idb`.

## Primary API

The recommended high-level API is the `PersistedState` class:

```ts
import { PersistedState } from '$lib/persisted-state';

const prefs = new PersistedState('my-prefs', { theme: 'dark' });
prefs.current = { theme: 'light' }; // persisted to IndexedDB automatically
```

`PersistedState` hydrates from IndexedDB, persists on write, and syncs across
tabs via `BroadcastChannel` when `syncTabs: true`.

## Low-level adapter

```ts
import { createAdapter } from '$lib/persisted-state/adapter';

const adapter = createAdapter({
	dbName: 'app-store',
	storeName: 'items'
});

await adapter.init();
await adapter.saveItem({ payload: { title: 'Local todo' } });
const all = await adapter.listItems();
```

`createAdapter(opts)` returns a `PersistedAdapter` with:

- `init()` / `listItems<T>()` / `saveItem(item)` / `getItem(id)` / `deleteItem(id)` / `clearAll()`
- `importLocalStorage(prefix)` — first-run migration from localStorage
- `syncWithServer(syncOpts)` — last-write-wins merge against a server payload
- `toServerFormat(item)` / `fromServerFormat(obj)` — wire format helpers

```ts
// Example: Provide upgrade function if you need custom migrations
const adapter = createAdapter({
	dbName: 'miniapps-budget-v2',
	storeName: 'budgets',
	version: 2,
	upgrade(db, oldVersion) {
		if (oldVersion < 2) {
			// custom logic here - create index or migrate existing records
		}
	}
});
```
