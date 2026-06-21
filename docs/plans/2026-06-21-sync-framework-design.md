# Centralized Sync Framework — Design Document

**Date:** 2026-06-21
**Status:** Approved
**Approach:** A — Class-based SyncManager + Remote Factories, using svelte-idb for local persistence

## Problem

Sync logic is scattered and duplicated across 6+ apps. Each app has ~200 lines of near-identical onMount merge, auto-backup timer, handleBackup/handleSync functions in `+page.svelte`. Different apps use different patterns (timestamp merge, polling, server-first CRUD) with no shared infrastructure. Hard to maintain, understand, or extend.

## Requirements Summary

1. **Full sync framework** — generic, reusable across all apps
2. **One app per PR migration** — each migration independently reviewable
3. **Built-in merge strategies + custom hook** — timestamp, server-wins, local-wins, custom resolver
4. **All three trigger models** — auto-backup (debounced timer), polling (interval + backoff), manual
5. **Server-side factories** — generate query/form/command functions, reduce remote boilerplate
6. **Fresh start acceptable** — new svelte-idb DB names, no migration from old PersistedState keys
7. **Framework first, then workout tracker** — workout tracker uses framework from day one
8. **svelte-idb for local persistence** — use `createReactiveDB` + `liveAll()` directly (not PersistedState wrapper)
9. **`form` for manual backup** (progressive enhancement), **`command` for auto-backup** (programmatic)

## Architecture

Class-based `SyncManager<T>` using Svelte 5 `$state` in class fields + server-side factory functions.

```
src/lib/sync/
├── index.ts                          # Barrel exports
│
├── client/
│   ├── sync-manager.svelte.ts        # SyncManager<T> class — uses $state fields
│   ├── merge-strategies.ts           # timestampMerge, serverWins, localWins + customMerge hook
│   ├── triggers.svelte.ts            # AutoBackupTrigger, PollingTrigger, ManualTrigger
│   └── types.ts                      # SyncConfig, SyncStatus, StoreMap types
│
├── server/
│   ├── create-load-query.ts          # Factory: generates query() for loading app data
│   ├── create-backup-form.ts         # Factory: generates form() for manual backup (progressive enhancement)
│   ├── create-backup-command.ts      # Factory: generates command() for auto-backup (programmatic)
│   ├── prisma-helpers.ts             # Generic upsert/replace/delete helpers per model
│   └── types.ts                      # LoadConfig, BackupConfig types
│
└── README.md                         # Framework docs + migration guide
```

## svelte-idb Integration

Replaces the current `PersistedState` wrapper with `svelte-idb`'s `createReactiveDB` directly.

**Before (PersistedState):**

```typescript
export const sessions = new PersistedState<Session[]>('med-sessions', []);
// sessions.current is reactive but requires manual save logic
```

**After (svelte-idb):**

```typescript
import { createReactiveDB } from 'svelte-idb/svelte';

const db = createReactiveDB({
	name: 'medication-tracker',
	version: 1,
	stores: {
		sessions: { keyPath: 'id' },
		logs: { keyPath: 'id' }
	}
});

export const sessions = db.sessions.liveAll<Session>();
// sessions.current is reactive, auto-updates when db.sessions.put() is called
```

**Key svelte-idb APIs used:**

- `createReactiveDB(config)` — creates reactive IndexedDB database
- `db.store.liveAll()` — returns `ILiveQuery<T[]>` with reactive `.current`, `.loading`, `.error`
- `db.store.put(record)` — upsert (auto-updates liveAll queries)
- `db.store.getAll()` — non-reactive fetch (used by SyncManager for backup)
- `db.store.clear()` — clear all records (used during merge)
- `$state.snapshot()` — required before writing reactive data to IndexedDB (structured clone limitation)

## SyncManager Class (client-side)

```typescript
export class SyncManager<TStores extends string> {
	// Reactive sync state (Svelte 5 $state in class fields)
	needsBackup = $state(false);
	isBackingUp = $state(false);
	isSyncing = $state(false);
	lastSyncAt = $state<number | null>(null);
	syncError = $state<string | null>(null);

	// Private fields
	#db: ReactiveDatabase<any>;
	#stores: TStores[];
	#loadFn: () => Promise<Partial<Record<TStores, any[]>>>;
	#backupForm: FormObject;
	#backupCommand: (data: any) => Promise<{ success: boolean }>;
	#strategy: MergeStrategy;
	#trigger: AutoBackupTrigger | PollingTrigger | ManualTrigger;
	#isAuthenticated: () => boolean;

	constructor(config: SyncConfig<TStores>) {
		/* ... */
	}

	// Merge server data (from +page.server.ts load) with local svelte-idb data
	async syncOnMount(serverData: Partial<Record<TStores, any[]>>): Promise<void>;

	// Manual backup — uses form (progressive enhancement)
	async handleManualBackup(): Promise<void>;

	// Auto backup — uses command (programmatic, called by trigger)
	async handleAutoBackup(): Promise<void>;

	// Manual sync — fetches from server, merges, writes to local
	async handleSync(): Promise<void>;

	markDirty(): void;
	destroy(): void;
}
```

### App usage:

```typescript
// states.svelte.ts
const sync = new SyncManager({
	db,
	stores: ['sessions', 'logs'],
	loadFn: loadMedicationData,
	backupForm: backupMedicationForm,
	backupCommand: backupMedicationCommand,
	strategy: timestampMerge,
	trigger: 'auto-backup',
	autoBackupDelay: 5000,
	isAuthenticated: () => !!data.user
});

// +page.svelte
onMount(() => sync.syncOnMount(data));
onDestroy(() => sync.destroy());
```

## Merge Strategies

```typescript
export interface MergeStrategy {
	merge<T extends { id: string; updatedAt?: string; createdAt?: string }>(
		local: T[],
		server: T[],
		storeName: string
	): T[];
}

// Built-in strategies
export const timestampMerge: MergeStrategy; // last-write-wins by updatedAt
export const serverWins: MergeStrategy; // always use server data
export const localWins: MergeStrategy; // keep local, add only new server records

// Custom resolver hook (for smoke-free-tracker's domain-specific logic)
export function customMerge(
	resolver: (local: any[], server: any[], storeName: string) => any[]
): MergeStrategy;
```

## Trigger Classes

### AutoBackupTrigger

- Debounced timer, fires `handleAutoBackup()` after delay
- Watches `needsBackup` reactively via `$effect`
- Only fires if `isAuthenticated()` returns true
- Default delay: 5000ms

### PollingTrigger

- Interval-based, calls `handleSync()` periodically
- Exponential backoff on failure: base \* 2^failures, capped at max
- Default: 120000ms base, 600000ms max
- Resets on successful sync

### ManualTrigger

- No automatic sync
- App calls `handleManualBackup()` / `handleSync()` explicitly
- Used by purchase-tracker, scenario-tracker

## Server-Side Remote Factories

### createLoadQuery (query — for loading data)

```typescript
export const loadMedicationData = createLoadQuery({
	stores: ['sessions', 'logs'],
	models: {
		sessions: { model: 'medicationSession', include: { medications: true } },
		logs: { model: 'medicationLog' }
	}
});
```

### createBackupForm (form — for manual backup, progressive enhancement)

```typescript
export const backupMedicationForm = createBackupForm({
	models: {
		sessions: { model: 'medicationSession', schema: MedicationSchema },
		logs: { model: 'medicationLog', schema: LogSchema }
	},
	deleteOrder: ['logs', 'sessions']
});
// Form has single hidden field with serialized JSON
// Server handler parses JSON, validates with Valibot, saves to Prisma in transaction
```

### createBackupCommand (command — for auto-backup, programmatic)

```typescript
export const backupMedicationCommand = createBackupCommand({
	models: {
		/* same as form */
	},
	deleteOrder: ['logs', 'sessions']
});
// Accepts structured object directly, validates with Valibot, saves to Prisma in transaction
```

### Remote file after migration (~30 lines vs ~300 before):

```typescript
import { createLoadQuery, createBackupForm, createBackupCommand } from '$lib/sync/server';
import * as v from 'valibot';

const MedicationSchema = v.object({ id: v.string(), name: v.string(), ... });
const LogSchema = v.object({ id: v.string(), status: v.string(), ... });

const config = {
  models: {
    sessions: { model: 'medicationSession', schema: MedicationSchema, include: { medications: true } },
    logs: { model: 'medicationLog', schema: LogSchema },
  },
  deleteOrder: ['logs', 'sessions'] as const,
};

export const loadMedicationData = createLoadQuery({ stores: ['sessions', 'logs'], models: config.models });
export const backupMedicationForm = createBackupForm(config);
export const backupMedicationCommand = createBackupCommand(config);
```

## Config Types

```typescript
// Client
export interface SyncConfig<TStores extends string> {
	db: ReactiveDatabase<any>;
	stores: TStores[];
	loadFn: () => Promise<Partial<Record<TStores, any[]>>>;
	backupForm: FormObject;
	backupCommand: (data: any) => Promise<{ success: boolean }>;
	strategy: MergeStrategy;
	trigger: 'auto-backup' | 'polling' | 'manual';
	autoBackupDelay?: number; // default 5000ms
	pollingInterval?: number; // default 120000ms
	maxPollingInterval?: number; // default 600000ms
	isAuthenticated: () => boolean;
}

// Server
export interface LoadConfig<TStores extends string> {
	stores: TStores[];
	models: Record<TStores, { model: string; include?: object; orderBy?: object }>;
}

export interface BackupConfig<TStores extends string> {
	models: Record<TStores, { model: string; schema: v.GenericSchema }>;
	deleteOrder: readonly TStores[];
}
```

## Migration Plan

### Order (one app per PR):

1. **Framework PR** — Build `src/lib/sync/` (all framework code, no app changes)
2. **Medication tracker** — Pilot migration (most complex sync, best validation)
3. **Smoke-free tracker** — Custom conflict resolution (tests customMerge hook)
4. **Note taker** — Polling trigger (tests PollingTrigger)
5. **Purchase tracker** — Server-first CRUD (tests ManualTrigger)
6. **Scenario tracker** — Imperative sync (tests ManualTrigger + plain objects → svelte-idb)
7. **Budget tracker** — Currently no sync (gets sync for first time)
8. **Workout tracker** — New app, uses framework from day one

### Per-app migration steps:

1. Create app DB with `createReactiveDB` in `states.svelte.ts`
2. Replace `PersistedState` with `db.store.liveAll()`
3. Migrate remote file to use factory functions
4. Create `SyncManager` instance with config
5. Update `+page.svelte` — replace onMount merge + auto-backup with `sync.syncOnMount()` + `sync.handleBackup()`
6. Update `+page.server.ts` — use `loadFn` from migrated remote
7. Run `bun check` + `svelte-autofixer`
8. Test sync for authenticated and guest users

### What gets removed (~200 lines → ~15 lines per app):

- onMount sync/merge logic
- handleBackup/handleSync functions
- scheduleAutoBackup function
- $effect for needsBackup tracking
- needsBackup/isBackingUp/isSyncing state
- autoBackupTimer cleanup

### What stays app-specific:

- Data types (Session, Log, Note, etc.)
- Valibot validation schemas
- Prisma model config (store name → Prisma model mapping)
- Merge strategy choice (most use timestampMerge, smoke-free uses customMerge)
- Trigger type (most use auto-backup, note-taker uses polling, purchase/scenario use manual)
- UI components and layout

## PersistedState Deprecation

1. Keep `PersistedState` during migration (unmigrated apps still use it)
2. Add `@deprecated` JSDoc comments pointing to `svelte-idb/svelte`
3. Remove `src/lib/persisted-state/` in final cleanup PR after all apps migrated

## Edge Cases

- **Guest users:** loadFn returns empty arrays, sync skipped, local svelte-idb data works fully
- **Cross-tab sync:** svelte-idb's ChangeNotifier handles this natively (no BroadcastChannel needed)
- **Conflicts:** timestamp (last-write-wins), custom (domain-specific), server-wins (server source of truth)
- **Network failures:** error caught, syncError set, toast shown, auto-backup retries on next dirty mark
- **SSR safety:** svelte-idb no-ops on server, SyncManager checks `browser` before sync logic
- **Data shape changes:** fresh start (new DB names), server data syncs down on first load

## Testing

- Unit tests for merge strategies (timestamp, serverWins, localWins, custom)
- Unit tests for SyncManager (mock svelte-idb + mock remote functions)
- Unit tests for trigger classes (AutoBackupTrigger timer, PollingTrigger backoff)
- Integration test: migrate medication-tracker, verify sync works
- Quality gates: `bun check` + `svelte-autofixer` + `prettier`
