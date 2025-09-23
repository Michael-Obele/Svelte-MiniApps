import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock PersistedState to avoid localStorage issues
vi.mock('runed', () => ({
	PersistedState: class MockPersistedState {
		current: any;
		constructor(initial: any) {
			this.current = initial;
		}
	}
}));

// Mock Date to ensure different timestamps
const originalDate = global.Date;
let mockTime = Date.now();

class MockDate extends originalDate {
	constructor(value?: any) {
		if (value === undefined) {
			super(mockTime);
		} else {
			super(value);
		}
	}

	static now() {
		return mockTime;
	}

	toISOString() {
		return new originalDate(mockTime).toISOString();
	}
}

global.Date = MockDate as any;

// Helper to advance mock time
function advanceTime(ms: number = 1) {
	mockTime += ms;
}

import * as purchaseState from './states.svelte';

describe('Purchase Tracker State Management', () => {
	beforeEach(() => {
		// Clear state for each test
		purchaseState.items.current = [];
		purchaseState.purchases.current = [];
		purchaseState.customCategories.current = [];
	});

	it('should add an item', () => {
		const id = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');

		expect(purchaseState.items.current).toHaveLength(1);
		expect(purchaseState.items.current[0].name).toBe('Test Gas');
		expect(purchaseState.items.current[0].category).toBe('fuel');
		expect(purchaseState.items.current[0].defaultUnit).toBe('gallons');
		expect(purchaseState.items.current[0].defaultCurrency).toBe('USD');
		expect(purchaseState.items.current[0]).toHaveProperty('createdAt');
		expect(purchaseState.items.current[0]).toHaveProperty('updatedAt');
	});

	it('should add a purchase record', () => {
		const itemId = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const id = purchaseState.addPurchaseRecord(
			itemId,
			10,
			50.0,
			'USD',
			'2024-01-01',
			'Shell Station',
			'credit',
			'Regular gas purchase'
		);

		expect(purchaseState.purchases.current).toHaveLength(1);
		expect(purchaseState.purchases.current[0].itemId).toBe(itemId);
		expect(purchaseState.purchases.current[0].quantity).toBe(10);
		expect(purchaseState.purchases.current[0].cost).toBe(50.0);
		expect(purchaseState.purchases.current[0].currency).toBe('USD');
		expect(purchaseState.purchases.current[0].location).toBe('Shell Station');
		expect(purchaseState.purchases.current[0].paymentMethod).toBe('credit');
		expect(purchaseState.purchases.current[0].notes).toBe('Regular gas purchase');
		expect(purchaseState.purchases.current[0]).toHaveProperty('createdAt');
	});
	it('should update an item', () => {
		const id = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const item = purchaseState.items.current[0];

		// Advance time to ensure different timestamp
		advanceTime(1000);

		purchaseState.updateItem(id, {
			name: 'Updated Gas',
			category: 'automotive'
		});

		expect(purchaseState.items.current[0].name).toBe('Updated Gas');
		expect(purchaseState.items.current[0].category).toBe('automotive');
		expect(purchaseState.items.current[0].updatedAt).not.toBe(item.updatedAt);
	});

	it('should update a purchase record', () => {
		const itemId = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const purchaseId = purchaseState.addPurchaseRecord(
			itemId,
			10,
			50.0,
			'USD',
			new Date().toISOString()
		);
		const purchase = purchaseState.purchases.current[0];

		purchaseState.updatePurchaseRecord(purchaseId, {
			quantity: 12,
			cost: 60.0
		});

		expect(purchaseState.purchases.current[0].quantity).toBe(12);
		expect(purchaseState.purchases.current[0].cost).toBe(60.0);
	});

	it('should delete an item', () => {
		const id = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');

		expect(purchaseState.items.current).toHaveLength(1);

		purchaseState.deleteItem(id);

		expect(purchaseState.items.current).toHaveLength(0);
	});

	it('should delete a purchase record', () => {
		const itemId = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const purchaseId = purchaseState.addPurchaseRecord(
			itemId,
			10,
			50.0,
			'USD',
			new Date().toISOString()
		);
		expect(purchaseState.purchases.current).toHaveLength(1);

		purchaseState.deletePurchaseRecord(purchaseId);
		expect(purchaseState.purchases.current).toHaveLength(0);
	});

	it('should get purchases for an item', () => {
		const itemId1 = purchaseState.addItem('Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const itemId2 = purchaseState.addItem('Milk', 'groceries', 'Whole milk', 'liters', 'USD');

		purchaseState.addPurchaseRecord(itemId1, 10, 50.0, 'USD', new Date().toISOString());
		purchaseState.addPurchaseRecord(itemId1, 8, 40.0, 'USD', new Date().toISOString());
		purchaseState.addPurchaseRecord(itemId2, 2, 6.0, 'USD', new Date().toISOString());

		const gasPurchases = purchaseState.getPurchasesForItem(itemId1);
		expect(gasPurchases).toHaveLength(2);

		const milkPurchases = purchaseState.getPurchasesForItem(itemId2);
		expect(milkPurchases).toHaveLength(1);
	});

	it('should calculate item stats', () => {
		const itemId = purchaseState.addItem('Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');

		purchaseState.addPurchaseRecord(itemId, 10, 50.0, 'USD', '2024-01-01');
		purchaseState.addPurchaseRecord(itemId, 8, 40.0, 'USD', '2024-01-02');

		const stats = purchaseState.getItemStats(itemId);
		expect(stats.totalPurchases).toBe(2);
		expect(stats.totalQuantity).toBe(18);
		expect(stats.totalSpent).toBe(90.0);
		expect(stats.averageCost).toBe(45.0);
	});

	it('should have supported currencies with proper structure', () => {
		expect(purchaseState.supportedCurrencies).toBeDefined();
		expect(Array.isArray(purchaseState.supportedCurrencies)).toBe(true);
		expect(purchaseState.supportedCurrencies.length).toBeGreaterThan(0);

		const usdCurrency = purchaseState.supportedCurrencies.find((c) => c.code === 'USD');
		expect(usdCurrency).toBeDefined();
		expect(usdCurrency?.code).toBe('USD');
		expect(usdCurrency?.symbol).toBe('$');
		expect(usdCurrency?.name).toBe('United States dollar');
		expect(usdCurrency).toHaveProperty('icon');
	});

	it('should get currency info', () => {
		const usdInfo = purchaseState.getCurrencyInfo('USD');
		expect(usdInfo).toBeDefined();
		expect(usdInfo?.code).toBe('USD');
		expect(usdInfo?.symbol).toBe('$');

		const invalidInfo = purchaseState.getCurrencyInfo('INVALID');
		expect(invalidInfo).toBeUndefined();
	});

	it('should manage custom categories', () => {
		const categoryId = purchaseState.addCustomCategory('Test Category', '#ff0000', '🔥');

		expect(purchaseState.customCategories.current).toHaveLength(1);
		expect(purchaseState.customCategories.current[0].name).toBe('Test Category');
		expect(purchaseState.customCategories.current[0].color).toBe('#ff0000');
		expect(purchaseState.customCategories.current[0].icon).toBe('🔥');

		purchaseState.updateCustomCategory(categoryId, {
			name: 'Updated Category',
			color: '#00ff00'
		});

		expect(purchaseState.customCategories.current[0].name).toBe('Updated Category');
		expect(purchaseState.customCategories.current[0].color).toBe('#00ff00');

		purchaseState.deleteCustomCategory(categoryId);
		expect(purchaseState.customCategories.current).toHaveLength(0);
	});

	it('should get all categories including defaults and custom', () => {
		const customCategoryId = purchaseState.addCustomCategory('Custom Category', '#ff0000', '🔥');

		const allCategories = purchaseState.getAllCategories();
		expect(allCategories.length).toBeGreaterThan(purchaseState.defaultCategories.length);

		const customCategory = allCategories.find((c) => c.id === customCategoryId);
		expect(customCategory).toBeDefined();
		expect(customCategory?.name).toBe('Custom Category');

		// Clean up
		purchaseState.deleteCustomCategory(customCategoryId);
	});

	it('should get purchases with items', () => {
		const itemId = purchaseState.addItem('Test Item', 'fuel', 'Test description', 'gallons', 'USD');
		const purchaseId = purchaseState.addPurchaseRecord(
			itemId,
			10,
			50.0,
			'USD',
			new Date().toISOString()
		);

		const purchasesWithItems = purchaseState.getPurchasesWithItems();
		expect(purchasesWithItems).toHaveLength(1);
		expect(purchasesWithItems[0].itemId).toBe(itemId);
		expect(purchasesWithItems[0].item.name).toBe('Test Item');
		expect(purchasesWithItems[0].item.category).toBe('fuel');
	});

	it('should delete item and associated purchases', () => {
		const itemId = purchaseState.addItem('Test Item', 'fuel', 'Test description', 'gallons', 'USD');
		const purchaseId = purchaseState.addPurchaseRecord(
			itemId,
			10,
			50.0,
			'USD',
			new Date().toISOString()
		);

		expect(purchaseState.items.current).toHaveLength(1);
		expect(purchaseState.purchases.current).toHaveLength(1);

		purchaseState.deleteItem(itemId);

		expect(purchaseState.items.current).toHaveLength(0);
		expect(purchaseState.purchases.current).toHaveLength(0);
	});
});
