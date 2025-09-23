// src/routes/apps/(app)/purchase-tracker/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import type { Item, PurchaseRecord } from './states.svelte';

// Load function to fetch items and purchases
export const load = (async ({ locals }) => {
	const userId = locals.user?.id;
	const user = locals.user;

	// For authenticated users, load their data from the database
	if (userId) {
		try {
			console.log(`🔍 Loading items and purchases for user: ${userId}`);

			const [items, purchases] = await Promise.all([
				prisma.item.findMany({
					where: { userId },
					orderBy: { createdAt: 'desc' }
				}),
				prisma.purchaseRecord.findMany({
					where: { userId },
					include: { item: true },
					orderBy: { date: 'desc' }
				})
			]);

			console.log(
				`📊 Found ${items.length} items and ${purchases.length} purchase records for user ${userId}`
			);

			return {
				items,
				purchases,
				user
			};
		} catch (err) {
			console.error('Error fetching data:', err);
			throw error(500, 'Failed to load data');
		}
	}

	// For unauthenticated users, return empty arrays (they'll use local storage)
	console.log('👤 Unauthenticated user - returning empty data for local storage usage');
	return {
		items: [],
		purchases: [],
		user: null
	};
}) satisfies PageServerLoad; // Actions for form submissions
export const actions = {
	// Load items and purchases from server
	loadData: async ({ locals }) => {
		const userId = locals.user?.id;

		if (!userId) {
			return { success: false, error: 'User not authenticated' };
		}

		try {
			const [items, purchases] = await Promise.all([
				prisma.item.findMany({
					where: { userId },
					orderBy: { createdAt: 'desc' }
				}),
				prisma.purchaseRecord.findMany({
					where: { userId },
					include: { item: true },
					orderBy: { date: 'desc' }
				})
			]);

			return { success: true, items, purchases };
		} catch (err) {
			console.error('Error loading data:', err);
			return { success: false, error: 'Failed to load data' };
		}
	},

	// Save items and purchases to server
	saveData: async ({ request, locals }) => {
		const userId = locals.user?.id;

		if (!userId) {
			return { success: false, error: 'User not authenticated' };
		}

		try {
			const data = await request.formData();
			const itemsData = data.get('items');
			const purchasesData = data.get('purchases');

			if (!itemsData || !purchasesData) {
				return { success: false, error: 'No data provided' };
			}

			const items: Item[] = JSON.parse(itemsData as string);
			const purchases: PurchaseRecord[] = JSON.parse(purchasesData as string);

			// Delete existing data for this user
			await prisma.purchaseRecord.deleteMany({ where: { userId } });
			await prisma.item.deleteMany({ where: { userId } });

			// Insert new items
			if (items.length > 0) {
				await prisma.item.createMany({
					data: items.map((item) => ({
						id: item.id,
						userId,
						name: item.name,
						category: item.category,
						description: item.description,
						defaultUnit: item.defaultUnit,
						defaultCurrency: item.defaultCurrency,
						createdAt: new Date(item.createdAt),
						updatedAt: new Date(item.updatedAt)
					}))
				});
			}

			// Insert new purchase records
			if (purchases.length > 0) {
				await prisma.purchaseRecord.createMany({
					data: purchases.map((purchase) => ({
						id: purchase.id,
						userId,
						itemId: purchase.itemId,
						quantity: purchase.quantity,
						cost: purchase.cost,
						currency: purchase.currency,
						date: new Date(purchase.date),
						location: purchase.location,
						paymentMethod: purchase.paymentMethod,
						notes: purchase.notes,
						createdAt: new Date(purchase.createdAt)
					}))
				});
			}

			console.log(
				`💾 Saved ${items.length} items and ${purchases.length} purchase records for user ${userId}`
			);
			return { success: true };
		} catch (err) {
			console.error('Error saving data:', err);
			return { success: false, error: 'Failed to save data' };
		}
	},

	// Sync data (merge local and server data)
	syncData: async ({ request, locals }) => {
		const userId = locals.user?.id;

		if (!userId) {
			return { success: false, error: 'User not authenticated' };
		}

		try {
			const data = await request.formData();
			const localItemsData = data.get('localItems');
			const localPurchasesData = data.get('localPurchases');

			if (!localItemsData || !localPurchasesData) {
				return { success: false, error: 'No local data provided' };
			}

			const localItems: Item[] = JSON.parse(localItemsData as string);
			const localPurchases: PurchaseRecord[] = JSON.parse(localPurchasesData as string);

			// Get server data
			const [serverItems, serverPurchases] = await Promise.all([
				prisma.item.findMany({ where: { userId } }),
				prisma.purchaseRecord.findMany({
					where: { userId },
					include: { item: true }
				})
			]);

			// Simple merge strategy: keep the most recently updated version
			const mergedItems = new Map<string, Item>();
			const mergedPurchases = new Map<string, PurchaseRecord>();

			// Add server data
			serverItems.forEach((item) =>
				mergedItems.set(item.id, {
					id: item.id,
					name: item.name,
					category: item.category,
					description: item.description || undefined,
					defaultUnit: item.defaultUnit || undefined,
					defaultCurrency: item.defaultCurrency,
					createdAt: item.createdAt.toISOString(),
					updatedAt: item.updatedAt.toISOString()
				})
			);

			serverPurchases.forEach((purchase) =>
				mergedPurchases.set(purchase.id, {
					id: purchase.id,
					itemId: purchase.itemId,
					quantity: purchase.quantity,
					cost: purchase.cost,
					currency: purchase.currency,
					date: purchase.date.toISOString(),
					location: purchase.location || undefined,
					paymentMethod: purchase.paymentMethod || undefined,
					notes: purchase.notes || undefined,
					createdAt: purchase.createdAt.toISOString()
				})
			);

			// Add local data (only if newer)
			localItems.forEach((item) => {
				const existing = mergedItems.get(item.id);
				if (!existing || new Date(item.updatedAt) > new Date(existing.updatedAt)) {
					mergedItems.set(item.id, item);
				}
			});

			localPurchases.forEach((purchase) => {
				const existing = mergedPurchases.get(purchase.id);
				if (!existing || new Date(purchase.createdAt) > new Date(existing.createdAt)) {
					mergedPurchases.set(purchase.id, purchase);
				}
			});

			const finalItems = Array.from(mergedItems.values());
			const finalPurchases = Array.from(mergedPurchases.values());

			// Save merged data back to server
			await prisma.purchaseRecord.deleteMany({ where: { userId } });
			await prisma.item.deleteMany({ where: { userId } });

			if (finalItems.length > 0) {
				await prisma.item.createMany({
					data: finalItems.map((item) => ({
						id: item.id,
						userId,
						name: item.name,
						category: item.category,
						description: item.description,
						defaultUnit: item.defaultUnit,
						defaultCurrency: item.defaultCurrency,
						createdAt: new Date(item.createdAt),
						updatedAt: new Date(item.updatedAt)
					}))
				});
			}

			if (finalPurchases.length > 0) {
				await prisma.purchaseRecord.createMany({
					data: finalPurchases.map((purchase) => ({
						id: purchase.id,
						userId,
						itemId: purchase.itemId,
						quantity: purchase.quantity,
						cost: purchase.cost,
						currency: purchase.currency,
						date: new Date(purchase.date),
						location: purchase.location,
						paymentMethod: purchase.paymentMethod,
						notes: purchase.notes,
						createdAt: new Date(purchase.createdAt)
					}))
				});
			}

			console.log(
				`🔄 Synced ${finalItems.length} items and ${finalPurchases.length} purchase records for user ${userId}`
			);
			return { success: true, items: finalItems, purchases: finalPurchases };
		} catch (err) {
			console.error('Error syncing data:', err);
			return { success: false, error: 'Failed to sync data' };
		}
	},

	// Backup local data to server
	backupToServer: async ({ request, locals }) => {
		console.log('🔍 Backup to server action triggered');
		const userId = locals.user?.id;

		if (!userId) {
			console.log('❌ Authentication required - no user ID found');
			return { success: false, error: 'Authentication required' };
		}

		try {
			const contentType = request.headers.get('content-type') || '';
			console.log('📄 Content-Type:', contentType);

			let items, purchases;

			if (contentType.includes('application/json')) {
				const data = await request.json();
				items = data.items;
				purchases = data.purchases;
				console.log(
					`📊 Received ${items?.length || 0} items and ${purchases?.length || 0} purchases from JSON`
				);
			} else {
				const data = await request.formData();
				const itemsJson = data.get('items')?.toString();
				const purchasesJson = data.get('purchases')?.toString();

				if (itemsJson) {
					items = JSON.parse(itemsJson);
				}
				if (purchasesJson) {
					purchases = JSON.parse(purchasesJson);
				}
			}

			if (
				(!items || !Array.isArray(items) || items.length === 0) &&
				(!purchases || !Array.isArray(purchases) || purchases.length === 0)
			) {
				console.log('❌ No valid data to backup');
				return { success: false, error: 'No data to backup' };
			}

			console.log(
				`✅ Processing ${items?.length || 0} items and ${purchases?.length || 0} purchases for backup`
			);

			// Delete existing data for this user
			await prisma.purchaseRecord.deleteMany({ where: { userId } });
			await prisma.item.deleteMany({ where: { userId } });

			// Insert new items
			if (items && items.length > 0) {
				await prisma.item.createMany({
					data: items.map((item: any) => ({
						id: item.id,
						userId,
						name: item.name,
						category: item.category,
						description: item.description,
						defaultUnit: item.defaultUnit,
						defaultCurrency: item.defaultCurrency,
						createdAt: new Date(item.createdAt),
						updatedAt: new Date(item.updatedAt)
					}))
				});
			}

			// Insert new purchases
			if (purchases && purchases.length > 0) {
				await prisma.purchaseRecord.createMany({
					data: purchases.map((purchase: any) => ({
						id: purchase.id,
						userId,
						itemId: purchase.itemId,
						quantity: purchase.quantity,
						cost: purchase.cost,
						currency: purchase.currency,
						date: new Date(purchase.date),
						location: purchase.location,
						paymentMethod: purchase.paymentMethod,
						notes: purchase.notes,
						createdAt: new Date(purchase.createdAt)
					}))
				});
			}

			console.log(
				`🎉 Backup complete! Saved ${items?.length || 0} items and ${purchases?.length || 0} purchases`
			);
			return {
				success: true,
				itemsCount: items?.length || 0,
				purchasesCount: purchases?.length || 0
			};
		} catch (error) {
			console.error('❌ Backup error:', error);
			return { success: false, error: String(error) };
		}
	},

	// Delete an item
	deleteItem: async ({ request, locals }) => {
		console.log('🗑️ Delete item action triggered');
		const userId = locals.user?.id;

		if (!userId) {
			console.log('❌ Authentication required - no user ID found');
			return { success: false, error: 'Authentication required' };
		}

		try {
			const data = await request.formData();
			const itemId = data.get('itemId')?.toString();

			if (!itemId) {
				return { success: false, error: 'Item ID not provided' };
			}

			// Ensure the item belongs to the current user before deleting
			const item = await prisma.item.findFirst({
				where: {
					id: itemId,
					userId: userId
				}
			});

			if (!item) {
				return {
					success: false,
					error: 'Item not found or you do not have permission to delete it'
				};
			}

			// Delete all purchase records for this item first
			await prisma.purchaseRecord.deleteMany({
				where: {
					itemId: itemId,
					userId: userId
				}
			});

			// Then delete the item
			await prisma.item.delete({
				where: {
					id: itemId
				}
			});

			return { success: true, itemId };
		} catch (error) {
			console.error('❌ Error deleting item:', error);
			return { success: false, error: String(error) };
		}
	},

	// Delete a purchase record
	deletePurchaseRecord: async ({ request, locals }) => {
		console.log('🗑️ Delete purchase record action triggered');
		const userId = locals.user?.id;

		if (!userId) {
			console.log('❌ Authentication required - no user ID found');
			return { success: false, error: 'Authentication required' };
		}

		try {
			const data = await request.formData();
			const purchaseId = data.get('purchaseId')?.toString();

			if (!purchaseId) {
				return { success: false, error: 'Purchase ID not provided' };
			}

			// Ensure the purchase belongs to the current user before deleting
			const purchase = await prisma.purchaseRecord.findFirst({
				where: {
					id: purchaseId,
					userId: userId
				}
			});

			if (!purchase) {
				return {
					success: false,
					error: 'Purchase record not found or you do not have permission to delete it'
				};
			}

			await prisma.purchaseRecord.delete({
				where: {
					id: purchaseId
				}
			});

			return { success: true, purchaseId };
		} catch (error) {
			console.error('❌ Error deleting purchase record:', error);
			return { success: false, error: String(error) };
		}
	}
} satisfies Actions;
