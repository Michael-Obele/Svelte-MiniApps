# Persisted State Adapter (Prototype)

## Purpose

Small prototype to persist unauthenticated user data in the browser and provide conversion helpers for server sync (Prisma/Drizzle-compatible plain objects).

## What is included

- `plan.md` — design and recommendations.
- Implementation: adapter implementation now lives at `src/lib/persisted-state/adapter.ts` and `src/lib/persisted-state/README.md` (use `$lib/persisted-state` in your app).

## Install

Preferred (bun):

```
bun add idb
```

Or with npm/pnpm:

```
npm i idb
```

## Quick usage

Import functions from the adapter in client code only (e.g. inside `onMount` or event handlers):

```ts
import { init, saveItem, getItem, listItems } from '$lib/persisted-state/adapter';
import { createAdapter } from '$lib/persisted-state/adapter';

await init({ dbName: 'app-store', storeName: 'items' });
await saveItem({ payload: { title: 'Local todo' } });
const all = await listItems();
// Example: create per-app adapter
const budgetAdapter = createAdapter({ dbName: 'miniapps-budget-v1', storeName: 'budget-items' });
await budgetAdapter.init();
await budgetAdapter.saveItem({ payload: { name: 'Spotify', cost: 9.99 } });
```

## Notes & recommendations

- Avoid importing the adapter at module top-level in SvelteKit server routes. Always call `init()` and other functions from client-side code (use `onMount` or event handlers).
- `idb` is light and works well with dynamic imports; Dexie is an alternative if you want live queries.
- The included `toServerFormat` and `fromServerFormat` functions are intentionally simple — adapt them to match your Prisma models.
- Added localStorage fallback for environments where IndexedDB is unavailable.
- Comprehensive error handling with clear error messages.
- Sync uses batch operations for efficiency.

## Next steps

- Wire this adapter into your existing `PersistedState` abstraction.
- Create a server endpoint `/api/sync` to accept pushes and return authoritative items for pulls.
- Add tests and consider migration scripts when bumping schema versions.
