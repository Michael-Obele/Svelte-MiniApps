import { PersistedState } from 'runed';
import icons from 'currency-icons';

// Types
export interface PurchaseRecord {
	id: string;
	itemId: string;
	quantity: number;
	cost: number;
	currency: string;
	date: string; // ISO date string
	location?: string;
	paymentMethod?: string;
	notes?: string;
	createdAt: string;
}

export interface Item {
	id: string;
	name: string;
	category: string;
	description?: string;
	defaultUnit?: string;
	defaultCurrency?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PurchaseCategory {
	id: string;
	name: string;
	color: string;
	icon: string;
}

// Default categories
export const defaultCategories: PurchaseCategory[] = [
	{ id: 'fuel', name: 'Fuel', color: '#ef4444', icon: '⛽' },
	{ id: 'groceries', name: 'Groceries', color: '#22c55e', icon: '🛒' },
	{ id: 'dining', name: 'Dining Out', color: '#f59e0b', icon: '🍽️' },
	{ id: 'utilities', name: 'Utilities', color: '#3b82f6', icon: '⚡' },
	{ id: 'entertainment', name: 'Entertainment', color: '#8b5cf6', icon: '🎬' },
	{ id: 'shopping', name: 'Shopping', color: '#ec4899', icon: '🛍️' },
	{ id: 'healthcare', name: 'Healthcare', color: '#06b6d4', icon: '🏥' },
	{ id: 'transportation', name: 'Transportation', color: '#84cc16', icon: '🚗' },
	{ id: 'other', name: 'Other', color: '#6b7280', icon: '📦' }
];

// Supported currencies - using currency-icons package
export const supportedCurrencies = [
	'USD',
	'EUR',
	'GBP',
	'JPY',
	'CAD',
	'AUD',
	'CHF',
	'CNY',
	'INR',
	'BRL',
	'NGN'
].map((code) => ({
	code,
	symbol: icons[code]?.symbol || code,
	name: icons[code]?.name || code,
	icon: icons[code]?.icon || ''
}));

// Create persisted states
const itemsState = new PersistedState<Item[]>('purchase-items', [], {
	storage: 'local',
	syncTabs: true
});

const purchasesState = new PersistedState<PurchaseRecord[]>('purchase-records', [], {
	storage: 'local',
	syncTabs: true
});

const customCategoriesState = new PersistedState<PurchaseCategory[]>('purchase-categories', [], {
	storage: 'local',
	syncTabs: true
});

// Item management functions
export function addItem(
	name: string,
	category: string,
	description?: string,
	defaultUnit?: string,
	defaultCurrency = 'USD'
): string {
	const newItem: Item = {
		id: crypto.randomUUID(),
		name,
		category,
		description,
		defaultUnit,
		defaultCurrency,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	itemsState.current = [...itemsState.current, newItem];
	return newItem.id;
}

export function updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) {
	const updatedItems = itemsState.current.map((item) => {
		if (item.id === id) {
			return {
				...item,
				...updates,
				updatedAt: new Date().toISOString()
			};
		}
		return item;
	});

	itemsState.current = updatedItems;
}

export function deleteItem(id: string) {
	// Delete the item
	itemsState.current = itemsState.current.filter((item) => item.id !== id);

	// Delete all purchases for this item
	purchasesState.current = purchasesState.current.filter((purchase) => purchase.itemId !== id);
}

// Purchase record management functions
export function addPurchaseRecord(
	itemId: string,
	quantity: number,
	cost: number,
	currency: string,
	date: string,
	location?: string,
	paymentMethod?: string,
	notes?: string
): string {
	const newPurchase: PurchaseRecord = {
		id: crypto.randomUUID(),
		itemId,
		quantity,
		cost,
		currency,
		date,
		location,
		paymentMethod,
		notes,
		createdAt: new Date().toISOString()
	};

	purchasesState.current = [...purchasesState.current, newPurchase];
	return newPurchase.id;
}

export function updatePurchaseRecord(
	id: string,
	updates: Partial<Omit<PurchaseRecord, 'id' | 'itemId' | 'createdAt'>>
) {
	const updatedPurchases = purchasesState.current.map((purchase) => {
		if (purchase.id === id) {
			return {
				...purchase,
				...updates
			};
		}
		return purchase;
	});

	purchasesState.current = updatedPurchases;
}

export function deletePurchaseRecord(id: string) {
	purchasesState.current = purchasesState.current.filter((purchase) => purchase.id !== id);
}

// Get purchases for a specific item
export function getPurchasesForItem(itemId: string): PurchaseRecord[] {
	return purchasesState.current
		.filter((purchase) => purchase.itemId === itemId)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get all purchases with item information
export function getPurchasesWithItems(): (PurchaseRecord & { item: Item })[] {
	return purchasesState.current
		.map((purchase) => {
			const item = itemsState.current.find((i) => i.id === purchase.itemId);
			if (!item) return null;
			return { ...purchase, item };
		})
		.filter(Boolean) as (PurchaseRecord & { item: Item })[];
}

// Category management
export function addCustomCategory(name: string, color: string, icon: string): string {
	const newCategory: PurchaseCategory = {
		id: crypto.randomUUID(),
		name,
		color,
		icon
	};

	customCategoriesState.current = [...customCategoriesState.current, newCategory];
	return newCategory.id;
}

export function updateCustomCategory(
	id: string,
	updates: Partial<Pick<PurchaseCategory, 'name' | 'color' | 'icon'>>
) {
	const updatedCategories = customCategoriesState.current.map((category) => {
		if (category.id === id) {
			return { ...category, ...updates };
		}
		return category;
	});

	customCategoriesState.current = updatedCategories;
}

export function deleteCustomCategory(id: string) {
	customCategoriesState.current = customCategoriesState.current.filter(
		(category) => category.id !== id
	);
}

// Get all categories (default + custom)
export function getAllCategories(): PurchaseCategory[] {
	return [...defaultCategories, ...customCategoriesState.current];
}

// Get currency info
export function getCurrencyInfo(code: string) {
	return supportedCurrencies.find((c) => c.code === code);
}

// Calculate statistics
export function getItemStats(itemId: string) {
	const purchases = getPurchasesForItem(itemId);
	const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);
	const totalSpent = purchases.reduce((sum, p) => sum + p.cost, 0);
	const averageCost = purchases.length > 0 ? totalSpent / purchases.length : 0;
	const lastPurchase = purchases[0]; // Already sorted by date desc

	return {
		totalPurchases: purchases.length,
		totalQuantity,
		totalSpent,
		averageCost,
		lastPurchase
	};
}

// Reactive state exports
export const items = itemsState;
export const purchases = purchasesState;
export const customCategories = customCategoriesState;
