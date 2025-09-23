import { expect, afterEach } from 'vitest';
import * as matchers from 'vitest-dom/matchers';
import { cleanup } from '@testing-library/svelte';

// Add vitest-dom matchers
expect.extend(matchers);

// Automatically cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock localStorage and sessionStorage for testing
class LocalStorageMock {
	private store: Record<string, string> = {};

	constructor() {
		// Initialize with empty arrays for purchase tracker tests
		this.store['purchase-items'] = '[]';
		this.store['purchase-records'] = '[]';
		this.store['purchase-categories'] = '[]';
	}

	clear() {
		this.store = {};
		// Re-initialize after clear
		this.store['purchase-items'] = '[]';
		this.store['purchase-records'] = '[]';
		this.store['purchase-categories'] = '[]';
	}

	getItem(key: string) {
		const value = this.store[key];
		return value === undefined ? null : value;
	}

	setItem(key: string, value: string) {
		this.store[key] = String(value);
	}

	removeItem(key: string) {
		delete this.store[key];
	}

	key(index: number) {
		return Object.keys(this.store)[index] || null;
	}

	get length() {
		return Object.keys(this.store).length;
	}
} // Setup localStorage and sessionStorage mocks
global.localStorage = new LocalStorageMock();
global.sessionStorage = new LocalStorageMock();

// Add event listener and dispatch event for storage events
const originalSetItem = global.localStorage.setItem;
global.localStorage.setItem = function (key, value) {
	const oldValue = this.getItem(key);
	originalSetItem.call(this, key, value);

	// Create a custom storage event since StorageEvent constructor has issues in jsdom
	const storageEvent = new CustomEvent('storage', {
		detail: {
			key,
			oldValue,
			newValue: value,
			storageArea: global.localStorage
		}
	});

	window.dispatchEvent(storageEvent);
};
