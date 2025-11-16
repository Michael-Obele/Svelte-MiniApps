# Persisted State Adapter (Library)

This is a copy of the `adapter.ts` file for use from `$lib/persisted-state` in SvelteKit.

Quick usage
-----------
Import the functions from library in client code only (e.g., inside `onMount`):

```ts
import { init, saveItem, getItem, listItems } from '$lib/persisted-state/adapter';
// or the default export:
// import persistedAdapter from '$lib/persisted-state';

await init({ dbName: 'app-store', storeName: 'items' });
await saveItem({ payload: { title: 'Local todo' } });
const all = await listItems();

// Example: Svelte store wrapper (per-app)
import { createPersistedStore } from '$lib/persisted-state';
const budgetStore = createPersistedStore({ dbName: 'miniapps-budget-v1', storeName: 'budgets' });

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
await adapter.init();
// `budgetStore.items` is a reactive runes $state array you can use in components
```

Notes
-----
- Keep using `$lib/persisted-state/adapter` for direct imports or `$lib/persisted-state` for default adapter as convenience.
- Remember to call `init()` from client context only (e.g., onMount).
