/**
 * Durable queue of user mutations that have not reached the server yet.
 *
 * Distinct from the service worker's network retry: that replays HTTP
 * requests, this replays *user intent* captured while offline, which must
 * survive a reload.
 */
import { browser } from '$app/environment';
import { createDB } from 'svelte-idb';

export interface OutboxEntry {
	id: string;
	app: string;
	op: string;
	payload: unknown;
	createdAt: number;
	attempts: number;
	lastError?: string;
}

const DB_NAME = 'miniapps-sync-outbox';
const STORE_NAME = 'pending';
const DB_VERSION = 1;
const MAX_BACKOFF_MS = 300000; // 5 minutes

interface OutboxStore {
	put(value: OutboxEntry): Promise<unknown>;
	get(key: string): Promise<OutboxEntry | undefined>;
	getAll(): Promise<OutboxEntry[]>;
	delete(key: string): Promise<void>;
}

let store: OutboxStore | null = null;

function getStore(): OutboxStore | null {
	if (!browser) return null;
	if (store) return store;

	const db = createDB({
		name: DB_NAME,
		version: DB_VERSION,
		stores: {
			[STORE_NAME]: {
				keyPath: 'id'
			}
		},
		ssr: 'noop'
	});

	store = (db as unknown as Record<string, OutboxStore>)[STORE_NAME] ?? null;
	return store;
}

/** Exponential backoff, doubling per attempt, capped at five minutes. */
export function backoffMs(attempts: number): number {
	return Math.min(1000 * 2 ** Math.max(0, attempts), MAX_BACKOFF_MS);
}

/** Records a mutation to be replayed against the server. */
export async function enqueue(app: string, op: string, payload: unknown): Promise<OutboxEntry> {
	const entry: OutboxEntry = {
		id: crypto.randomUUID(),
		app,
		op,
		payload,
		createdAt: Date.now(),
		attempts: 0
	};

	await getStore()?.put(entry);
	return entry;
}

/** Every pending mutation, oldest first, so replay preserves causal order. */
export async function listPending(): Promise<OutboxEntry[]> {
	const entries = (await getStore()?.getAll()) ?? [];
	return entries.sort((a, b) => a.createdAt - b.createdAt);
}

/** Records a failed replay so the engine backs off rather than hot-looping. */
export async function markFailed(id: string, error: string): Promise<void> {
	const current = getStore();
	if (!current) return;

	const entry = await current.get(id);
	if (!entry) return;

	await current.put({ ...entry, attempts: entry.attempts + 1, lastError: error });
}

/** Drops an entry after a successful replay. */
export async function remove(id: string): Promise<void> {
	await getStore()?.delete(id);
}
