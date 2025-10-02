import { getRequestEvent, query, command } from '$app/server';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
import * as v from 'valibot';

// Types matching the purchase tracker state
interface Item {
	id: string;
	name: string;
	category: string;
	description?: string;
	defaultUnit?: string;
	defaultCurrency?: string;
	createdAt: string;
	updatedAt: string;
}

interface PurchaseRecord {
	id: string;
	itemId: string;
	quantity: number;
	cost: number;
	currency: string;
	date: string;
	location?: string;
	paymentMethod?: string;
	notes?: string;
	createdAt: string;
}

// Valibot schemas for validation
const ItemSchema = v.object({
	id: v.string(),
	name: v.string(),
	category: v.string(),
	description: v.optional(v.string()),
	defaultUnit: v.optional(v.string()),
	defaultCurrency: v.optional(v.string()),
	createdAt: v.string(),
	updatedAt: v.string()
});

const PurchaseRecordSchema = v.object({
	id: v.string(),
	itemId: v.string(),
	quantity: v.number(),
	cost: v.number(),
	currency: v.string(),
	date: v.string(),
	location: v.optional(v.string()),
	paymentMethod: v.optional(v.string()),
	notes: v.optional(v.string()),
	createdAt: v.string()
});

const BackupDataSchema = v.object({
	items: v.array(ItemSchema),
	purchases: v.array(PurchaseRecordSchema)
});

// Query to load data from server
export const loadPurchaseData = query(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🔍 Loading items and purchases for user: ${user.id}`);

	const [items, purchases] = await Promise.all([
		prisma.item.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		}),
		prisma.purchaseRecord.findMany({
			where: { userId: user.id },
			include: { item: true },
			orderBy: { date: 'desc' }
		})
	]);

	console.log(
		`📊 Loaded ${items.length} items and ${purchases.length} purchase records for user ${user.id}`
	);

	return {
		items: items.map((item) => ({
			id: item.id,
			name: item.name,
			category: item.category,
			description: item.description || undefined,
			defaultUnit: item.defaultUnit || undefined,
			defaultCurrency: item.defaultCurrency || undefined,
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString()
		})),
		purchases: purchases.map((purchase) => ({
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
		}))
	};
});

// Command to backup data to server
export const backupPurchaseData = command(BackupDataSchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(
		`💾 Starting backup for user ${user.id}: ${data.items.length} items, ${data.purchases.length} purchases`
	);

	try {
		// Delete existing data for this user
		await prisma.purchaseRecord.deleteMany({ where: { userId: user.id } });
		await prisma.item.deleteMany({ where: { userId: user.id } });

		// Insert new items
		if (data.items.length > 0) {
			await prisma.item.createMany({
				data: data.items.map((item) => ({
					id: item.id,
					userId: user.id,
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
		if (data.purchases.length > 0) {
			await prisma.purchaseRecord.createMany({
				data: data.purchases.map((purchase) => ({
					id: purchase.id,
					userId: user.id,
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
			`✅ Backup successful! Saved ${data.items.length} items and ${data.purchases.length} purchases`
		);

		return {
			success: true,
			itemsCount: data.items.length,
			purchasesCount: data.purchases.length
		};
	} catch (error) {
		console.error('❌ Backup error:', error);
		throw new Error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
	}
});

// Command to delete an item
export const deletePurchaseItem = command(v.string(), async (itemId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🗑️ Deleting item ${itemId} for user ${user.id}`);

	// Ensure the item belongs to the current user before deleting
	const item = await prisma.item.findFirst({
		where: {
			id: itemId,
			userId: user.id
		}
	});

	if (!item) {
		throw new Error('Item not found or you do not have permission to delete it');
	}

	// Delete all purchase records for this item first
	await prisma.purchaseRecord.deleteMany({
		where: {
			itemId: itemId,
			userId: user.id
		}
	});

	// Then delete the item
	await prisma.item.delete({
		where: {
			id: itemId
		}
	});

	console.log(`✅ Successfully deleted item ${itemId}`);

	return { success: true, itemId };
});

// Command to delete a purchase record
export const deletePurchaseRecordById = command(v.string(), async (purchaseId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🗑️ Deleting purchase record ${purchaseId} for user ${user.id}`);

	// Ensure the purchase belongs to the current user before deleting
	const purchase = await prisma.purchaseRecord.findFirst({
		where: {
			id: purchaseId,
			userId: user.id
		}
	});

	if (!purchase) {
		throw new Error('Purchase record not found or you do not have permission to delete it');
	}

	await prisma.purchaseRecord.delete({
		where: {
			id: purchaseId
		}
	});

	console.log(`✅ Successfully deleted purchase record ${purchaseId}`);

	return { success: true, purchaseId };
});

// Command to sync data (merge local and server data)
export const syncPurchaseData = command(BackupDataSchema, async (localData) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(
		`🔄 Starting sync for user ${user.id}: ${localData.items.length} local items, ${localData.purchases.length} local purchases`
	);

	try {
		// Get server data
		const [serverItems, serverPurchases] = await Promise.all([
			prisma.item.findMany({ where: { userId: user.id } }),
			prisma.purchaseRecord.findMany({
				where: { userId: user.id },
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
				defaultCurrency: item.defaultCurrency || undefined,
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
		localData.items.forEach((item) => {
			const existing = mergedItems.get(item.id);
			if (!existing || new Date(item.updatedAt) > new Date(existing.updatedAt)) {
				mergedItems.set(item.id, item);
			}
		});

		localData.purchases.forEach((purchase) => {
			const existing = mergedPurchases.get(purchase.id);
			if (!existing || new Date(purchase.createdAt) > new Date(existing.createdAt)) {
				mergedPurchases.set(purchase.id, purchase);
			}
		});

		const finalItems = Array.from(mergedItems.values());
		const finalPurchases = Array.from(mergedPurchases.values());

		// Save merged data back to server
		await prisma.purchaseRecord.deleteMany({ where: { userId: user.id } });
		await prisma.item.deleteMany({ where: { userId: user.id } });

		if (finalItems.length > 0) {
			await prisma.item.createMany({
				data: finalItems.map((item) => ({
					id: item.id,
					userId: user.id,
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
					userId: user.id,
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
			`✅ Sync successful! Merged ${finalItems.length} items and ${finalPurchases.length} purchases`
		);

		return {
			success: true,
			items: finalItems,
			purchases: finalPurchases
		};
	} catch (error) {
		console.error('❌ Sync error:', error);
		throw new Error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
	}
});
