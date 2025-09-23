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
	{ code: 'USD', name: 'United States dollar', symbol: '$', flag: '🇺🇸', icon: '$' },
	{ code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', icon: '€' },
	{ code: 'GBP', name: 'British pound', symbol: '£', flag: '🇬🇧', icon: '£' },
	{ code: 'JPY', name: 'Japanese yen', symbol: '¥', flag: '🇯🇵', icon: '¥' },
	{ code: 'CAD', name: 'Canadian dollar', symbol: 'C$', flag: '🇨🇦', icon: 'C$' },
	{ code: 'AUD', name: 'Australian dollar', symbol: 'A$', flag: '🇦🇺', icon: 'A$' },
	{ code: 'CHF', name: 'Swiss franc', symbol: 'Fr', flag: '🇨🇭', icon: 'Fr' },
	{ code: 'CNY', name: 'Chinese yuan', symbol: '¥', flag: '🇨🇳', icon: '¥' },
	{ code: 'INR', name: 'Indian rupee', symbol: '₹', flag: '🇮🇳', icon: '₹' },
	{ code: 'BRL', name: 'Brazilian real', symbol: 'R$', flag: '🇧🇷', icon: 'R$' }
];

// Mock state for testing - uses regular arrays instead of PersistedState
class MockPersistedState<T> {
	current: T;

	constructor(initial: T) {
		this.current = initial;
	}
}

// State management
const itemsState = new MockPersistedState<Item[]>([]);
const purchasesState = new MockPersistedState<PurchaseRecord[]>([]);
const customCategoriesState = new MockPersistedState<PurchaseCategory[]>([]);

// Export state objects
export const items = itemsState;
export const purchases = purchasesState;
export const customCategories = customCategoriesState;

// Helper functions
function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}

// Item management functions
export function addItem(
	name: string,
	category: string,
	description?: string,
	defaultUnit?: string,
	defaultCurrency: string = 'USD'
): string {
	const id = generateId();
	const now = new Date().toISOString();

	const item: Item = {
		id,
		name,
		category,
		description,
		defaultUnit,
		defaultCurrency,
		createdAt: now,
		updatedAt: now
	};

	items.current.push(item);
	return id;
}

export function updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) {
	const updatedItems = items.current.map((item) => {
		if (item.id === id) {
			return {
				...item,
				...updates,
				updatedAt: new Date(Date.now() + 1).toISOString() // Ensure different timestamp
			};
		}
		return item;
	});

	items.current = updatedItems;
}

export function deleteItem(id: string): boolean {
	const index = items.current.findIndex((i) => i.id === id);
	if (index === -1) return false;

	items.current.splice(index, 1);

	// Delete associated purchases
	purchases.current = purchases.current.filter((p) => p.itemId !== id);
	return true;
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
	const id = generateId();
	const now = new Date().toISOString();

	const purchase: PurchaseRecord = {
		id,
		itemId,
		quantity,
		cost,
		currency,
		date,
		location,
		paymentMethod,
		notes,
		createdAt: now
	};

	purchases.current.push(purchase);
	return id;
}

export function updatePurchaseRecord(
	id: string,
	updates: Partial<Omit<PurchaseRecord, 'id' | 'itemId' | 'createdAt'>>
) {
	const updatedPurchases = purchases.current.map((purchase) => {
		if (purchase.id === id) {
			return {
				...purchase,
				...updates
			};
		}
		return purchase;
	});

	purchases.current = updatedPurchases;
}

export function deletePurchaseRecord(id: string): boolean {
	const index = purchases.current.findIndex((p) => p.id === id);
	if (index === -1) return false;

	purchases.current.splice(index, 1);
	return true;
}

// Custom category management functions
export function addCustomCategory(name: string, color: string, icon: string): string {
	const id = generateId();

	const category: PurchaseCategory = {
		id,
		name,
		color,
		icon
	};

	customCategories.current.push(category);
	return id;
}

export function updateCustomCategory(
	id: string,
	updates: Partial<Omit<PurchaseCategory, 'id'>>
): boolean {
	const category = customCategories.current.find((c) => c.id === id);
	if (!category) return false;

	Object.assign(category, updates);
	return true;
}

export function deleteCustomCategory(id: string): boolean {
	const index = customCategories.current.findIndex((c) => c.id === id);
	if (index === -1) return false;

	customCategories.current.splice(index, 1);
	return true;
}

// Query functions
export function getPurchasesForItem(itemId: string): PurchaseRecord[] {
	return purchases.current
		.filter((p) => p.itemId === itemId)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPurchasesWithItems(): Array<PurchaseRecord & { item: Item }> {
	return purchases.current
		.map((purchase) => {
			const item = items.current.find((i) => i.id === purchase.itemId);
			if (!item) return null;
			return { ...purchase, item };
		})
		.filter((result): result is PurchaseRecord & { item: Item } => result !== null)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllCategories(): PurchaseCategory[] {
	return [...defaultCategories, ...customCategories.current];
}

export function getItemStats(itemId: string) {
	const itemPurchases = getPurchasesForItem(itemId);

	const totalPurchases = itemPurchases.length;
	const totalQuantity = itemPurchases.reduce((sum, p) => sum + p.quantity, 0);
	const totalSpent = itemPurchases.reduce((sum, p) => sum + p.cost, 0);
	const averageCost = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

	const lastPurchase = itemPurchases[0]; // Already sorted by date desc

	return {
		totalPurchases,
		totalQuantity,
		totalSpent,
		averageCost,
		lastPurchase
	};
}

// Currency functions
export function getCurrencyInfo(code: string) {
	const currency = supportedCurrencies.find((c) => c.code === code);
	return currency || undefined;
}

export function isValidCurrency(code: string): boolean {
	return supportedCurrencies.some((c) => c.code === code);
}
