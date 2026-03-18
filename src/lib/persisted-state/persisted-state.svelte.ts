import { browser } from '$app/environment';
import { createDB } from 'svelte-idb';
import { SvelteSet } from 'svelte/reactivity';

export type PersistedStateOptions = {
	dbName?: string;
	storeName?: string;
	version?: number;
	syncTabs?: boolean;
};

type Subscriber<T> = (value: T) => void;

type PersistedRecord<T> = {
	id: string;
	payload: T;
	updatedAt: number;
};

type PersistedStore<T> = {
	put(value: PersistedRecord<T>): Promise<unknown>;
	get(key: string): Promise<PersistedRecord<T> | undefined>;
	clear(): Promise<void>;
};

export class PersistedState<T> {
	#value = $state<T>(undefined as T);
	#storageKey: string;
	#subscribers = new SvelteSet<Subscriber<T>>();
	#store: PersistedStore<T> | null = null;
	#hydrated = false;
	#lastSerialized = '';
	#channel: BroadcastChannel | null = null;
	#channelName = 'miniapps-indexeddb-state';
	#originId = crypto.randomUUID();

	constructor(storageKey: string, initialValue: T, options: PersistedStateOptions = {}) {
		this.#storageKey = storageKey;
		this.#value = initialValue;
		this.#lastSerialized = JSON.stringify($state.snapshot(this.#value) as T);

		if (!browser) {
			this.#hydrated = true;
			return;
		}

		const storeName = options.storeName ?? 'states';
		const db = createDB({
			name: options.dbName ?? 'miniapps-indexeddb-state',
			version: options.version ?? 1,
			stores: {
				[storeName]: {
					keyPath: 'id'
				}
			},
			ssr: 'noop'
		});

		this.#store = (db as Record<string, PersistedStore<T>>)[storeName] ?? null;

		if (options.syncTabs) {
			this.#channel = new BroadcastChannel(this.#channelName);
			this.#channel.addEventListener('message', this.#handleBroadcastMessage);
		}

		void this.#hydrate();
	}

	get current() {
		return this.#value;
	}

	set current(value: T) {
		this.#setValue(value, true);
	}

	get storageKey() {
		return this.#storageKey;
	}

	subscribe(callback: Subscriber<T>) {
		this.#subscribers.add(callback);
		callback($state.snapshot(this.#value) as T);

		return () => {
			this.#subscribers.delete(callback);
		};
	}

	async reload() {
		await this.#hydrate();
	}

	destroy() {
		this.#subscribers.clear();
		this.#channel?.removeEventListener('message', this.#handleBroadcastMessage);
		this.#channel?.close();
		this.#channel = null;
	}

	#setValue(value: T, shouldPersist: boolean) {
		this.#value = value;
		const snapshot = $state.snapshot(value) as T;
		const serialized = JSON.stringify(snapshot);

		if (serialized === this.#lastSerialized) {
			return;
		}

		this.#lastSerialized = serialized;
		this.#notify(snapshot);

		if (!this.#hydrated || !shouldPersist) {
			return;
		}

		void this.#persist(snapshot);
		this.#channel?.postMessage({
			key: this.#storageKey,
			value: snapshot,
			serialized,
			originId: this.#originId
		});
	}

	#handleBroadcastMessage = (event: MessageEvent) => {
		const data = event.data as
			| {
					key?: string;
					value?: T;
					serialized?: string;
					originId?: string;
			  }
			| undefined;

		if (!data || data.key !== this.#storageKey || data.originId === this.#originId) return;

		this.#lastSerialized = data.serialized ?? JSON.stringify(data.value);
		this.#setValue(data.value as T, false);
	};

	#notify(value: T) {
		const snapshot = $state.snapshot(value) as T;
		for (const subscriber of this.#subscribers) {
			subscriber(snapshot);
		}
	}

	async #hydrate() {
		if (!browser || !this.#store) return;

		const record = await this.#store.get(this.#storageKey);
		this.#hydrated = true;

		if (record) {
			this.#lastSerialized = JSON.stringify(record.payload);
			this.#setValue(record.payload, false);
			return;
		}

		this.#notify(this.#value);
	}

	async #persist(value: T) {
		if (!this.#store) return;

		await this.#store.put({
			id: this.#storageKey,
			payload: value,
			updatedAt: Date.now()
		});
	}
}
