# Persisted State Adapter — Plan

## Goal

Provide a simple, robust client-side persistence adapter for unauthenticated users that:

- Uses IndexedDB (with a lightweight wrapper) for offline storage.
- Is safe to import in a SvelteKit app (client-only usage / dynamic import guards).
- Exposes conversion utilities to map local objects to server shapes compatible with Prisma or Drizzle.
- Is easy to turn into a reusable library later.

## High-level approach

1. Use `idb` (small, battle-tested) as the core IndexedDB helper. Avoid top-level imports that run on the server; use dynamic import and `typeof window` guards.
2. Implement a thin adapter API in TypeScript with these primitives: `init`, `save`, `get`, `list`, `delete`, `clear`, `toServerFormat`, `fromServerFormat`, and `syncWithServer` (helper, pluggable conflict resolution).
3. Keep stored objects as plain JSON-compatible objects with a small envelope: `{ id, createdAt, updatedAt, payload, schemaVersion }`.
4. Provide mapping utilities to convert those envelopes to/from your Prisma/Drizzle model shapes (plain objects). Keep conversions explicit and type-safe.
5. Offer fallbacks: `localStorage` fallback for very small data sets, or fail gracefully if IndexedDB not available.
6. Add comprehensive error handling and JSDoc documentation.

## Sync strategy recommendations

- Start simple: server-authoritative plus optimistic local writes. Use timestamps and last-write-wins conflict resolution for initial MVP.
- For more complex needs (collaborative merging), consider CRDTs or server-side merge logic.

## Schema & migrations

- Keep `schemaVersion` on each item and bump DB version in `openDB(..., version)` when you need structural changes.
- Provide an upgrade hook that can transform or migrate existing items (example included in code).
- Example: Add an index in version 2.

## Packages & install

- Recommended: `idb` (small, actively maintained).
- Alternatives: `Dexie` for richer features (live queries) — ok if you ensure client-only usage; `localForage` for a multi-storage fallback.

Install (preferred with Bun):

```
bun add idb
```

Or npm/yarn:

```
npm i idb
# or
pnpm add idb
```

## Next steps

1. Review the improved prototype `adapter.ts` (client-only idb wrapper with error handling, localStorage fallback, batch sync).
2. Wire it into your existing `PersistedState` logic by calling the adapter functions where you currently persist to localStorage.
3. Implement an API endpoint `/api/sync` that accepts `toServerFormat()` payload and returns authoritative server items to `fromServerFormat()` and merge locally.
4. Add tests and a small migration script when changing schema.

Files added in this folder:

- `plan.md` — this file
- `README.md` — quick usage and recommendations
- `adapter.ts` — TypeScript prototype (client-only) using `idb` with improvements

## Notes & references

- Dexie + SvelteKit issues are usually due to importing Dexie at module top-level (server mode). Guard imports with `if (typeof window !== 'undefined')` or use dynamic imports.
- `idb` is minimal and plays well with dynamic imports and typed DB upgrades.
- Added localStorage fallback for environments where IndexedDB is unavailable (e.g., some older browsers or restricted contexts).
- Error handling added throughout to provide clear error messages.
- Sync now uses batch operations for efficiency.

If you want, I can now: implement server sync endpoints (example `/api/sync`), add a Svelte store wrapper that uses this adapter, or convert this into a small package layout.
