/**
 * Drains the outbox against registered handlers whenever the network allows.
 *
 * Handlers are registered by feature modules rather than imported here, so
 * this file stays free of app-specific knowledge.
 */
import { browser } from '$app/environment';
import { listPending, markFailed, remove, backoffMs, type OutboxEntry } from './outbox';

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

type Handler = (payload: unknown) => Promise<unknown>;

const handlers = new Map<string, Handler>();

function handlerKey(app: string, op: string): string {
	return `${app}:${op}`;
}

/** Registers the function that replays one kind of mutation. */
export function registerHandler(app: string, op: string, handler: Handler): void {
	handlers.set(handlerKey(app, op), handler);
}

class SyncState {
	status = $state<SyncStatus>('idle');
	pendingCount = $state(0);
}

export const syncState = new SyncState();

let draining = false;

/** True when an entry has waited out its backoff window. */
function isReady(entry: OutboxEntry): boolean {
	if (entry.attempts === 0) return true;
	return Date.now() - entry.createdAt >= backoffMs(entry.attempts);
}

/** Replays every pending mutation that is not still in backoff. */
export async function drain(): Promise<void> {
	if (!browser || draining) return;

	if (!navigator.onLine) {
		syncState.status = 'offline';
		syncState.pendingCount = (await listPending()).length;
		return;
	}

	draining = true;
	syncState.status = 'syncing';

	try {
		const pending = await listPending();
		syncState.pendingCount = pending.length;

		if (pending.length === 0) {
			syncState.status = 'idle';
			return;
		}

		let failed = false;

		for (const entry of pending) {
			if (!isReady(entry)) continue;

			const handler = handlers.get(handlerKey(entry.app, entry.op));
			// No handler registered — the feature module has not loaded yet.
			if (!handler) continue;

			try {
				await handler(entry.payload);
				await remove(entry.id);
			} catch (error) {
				failed = true;
				await markFailed(entry.id, error instanceof Error ? error.message : String(error));
			}
		}

		syncState.pendingCount = (await listPending()).length;
		syncState.status = failed ? 'error' : 'idle';
	} finally {
		draining = false;
	}
}

/**
 * Starts draining on reconnect and on window focus.
 * Call from a component's `$effect` and return the cleanup function.
 */
export function startSync(): () => void {
	if (!browser) return () => {};

	const onOnline = () => void drain();
	const onFocus = () => void drain();

	window.addEventListener('online', onOnline);
	window.addEventListener('offline', onOnline);
	window.addEventListener('focus', onFocus);
	void drain();

	return () => {
		window.removeEventListener('online', onOnline);
		window.removeEventListener('offline', onOnline);
		window.removeEventListener('focus', onFocus);
	};
}
