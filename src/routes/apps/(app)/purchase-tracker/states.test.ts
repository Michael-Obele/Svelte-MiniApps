import { describe, it, expect, beforeEach } from 'vitest';
import * as purchaseState from './states.svelte';

describe('Purchase Tracker State Management', () => {
	beforeEach(() => {
		// Clear localStorage for persisted state and initialize with empty arrays
		localStorage.clear();
		localStorage.setItem('purchase-items', '[]');
		localStorage.setItem('purchase-records', '[]');
		localStorage.setItem('purchase-categories', '[]');

		// Reset state arrays
		purchaseState.items.current = [];
		purchaseState.purchases.current = [];
	});

	it('should add an item', () => {
		const id = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');

		expect(purchaseState.items.current).toHaveLength(1);
		expect(purchaseState.items.current[0].name).toBe('Test Gas');
		expect(purchaseState.items.current[0].category).toBe('fuel');
		expect(purchaseState.items.current[0].defaultUnit).toBe('gallons');
		expect(purchaseState.items.current[0].defaultCurrency).toBe('USD');
	});

	it('should add a purchase record', () => {
		const itemId = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const purchaseId = purchaseState.addPurchaseRecord(
			itemId,
			10,
			50.0,
			'USD',
			new Date().toISOString(),
			'Shell Station',
			'credit',
			'Regular gas purchase'
		);

		expect(purchaseState.purchases.current).toHaveLength(1);
		expect(purchaseState.purchases.current[0].itemId).toBe(itemId);
		expect(purchaseState.purchases.current[0].quantity).toBe(10);
		expect(purchaseState.purchases.current[0].cost).toBe(50.0);
		expect(purchaseState.purchases.current[0].currency).toBe('USD');
	});

	it('should update an item', () => {
		const id = purchaseState.addItem('Test Gas', 'fuel', 'Regular gasoline', 'gallons', 'USD');
		const item = purchaseState.items.current[0];

		purchaseState.updateItem(id, {
			name: 'Updated Gas',
			category: 'automotive'
		});

		expect(purchaseState.items.current[0].name).toBe('Updated Gas');
		expect(purchaseState.items.current[0].category).toBe('automotive');
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
});
