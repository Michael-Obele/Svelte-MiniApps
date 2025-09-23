<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		Loader2,
		Plus,
		TrendingUp,
		Calendar,
		DollarSign,
		Package,
		MapPin,
		CreditCard,
		ChevronDown,
		Edit,
		Trash2,
		History,
		ShoppingCart,
		Cloud,
		HelpCircle,
		Settings
	} from '@lucide/svelte';
	import { PersistedState } from 'runed';

	import RouteHead from '@/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import * as DropdownMenu from '@/ui/dropdown-menu';
	import * as Dialog from '@/ui/dialog';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	import type { Item, PurchaseRecord } from './states.svelte';
	import * as purchaseState from './states.svelte';
	import type { PageData } from './$types.js';

	// Component imports
	import PurchaseTrackerHeader from './PurchaseTrackerHeader.svelte';
	import ItemsView from './ItemsView.svelte';
	import PurchasesView from './PurchasesView.svelte';
	import HelpDialog from './HelpDialog.svelte';
	import AddEditItemDialog from './AddEditItemDialog.svelte';
	import AddEditPurchaseDialog from './AddEditPurchaseDialog.svelte';
	import PurchaseHistoryDialog from './PurchaseHistoryDialog.svelte';

	// Props from load function
	let { data }: { data: PageData } = $props();

	// Authentication and backup state
	let isAuthenticated = $state(!!data.user);
	let hasUnsavedChanges = $state(false);
	let isBackingUp = $state(false);
	let showBackupDialog = $state(false);

	// Auto-backup configuration
	const AUTO_BACKUP_DELAY = 3000; // 3 seconds
	let autoBackupTimer: ReturnType<typeof setTimeout> | null = $state(null);
	let autoBackupCountdown = $state(0);
	const autoBackupEnabled = new PersistedState('purchase-autoBackupEnabled', true, {
		storage: 'local',
		syncTabs: true
	});
	let autoBackupRetryCount = $state(0);
	const MAX_RETRY_ATTEMPTS = 3;

	// Reactive state
	let isLoading = $state(true);
	let activeTab = $state<'items' | 'purchases'>('items');
	let showAddItemDialog = $state(false);
	let showAddPurchaseDialog = $state(false);
	let showPurchaseHistoryDialog = $state(false);
	let showHelpDialog = $state(false);
	let editingItem = $state<Item | null>(null);
	let editingPurchase = $state<PurchaseRecord | null>(null);
	let selectedItemForPurchase = $state<Item | null>(null);
	let selectedItemForHistory = $state<Item | null>(null);
	let searchQuery = $state('');
	let selectedCategory = $state<string>('all');

	// Form state for new item
	let itemName = $state('');
	let itemCategory = $state('');
	let itemDescription = $state('');
	let itemDefaultUnit = $state('');
	let itemDefaultCurrency = $state('USD');

	// Form state for new purchase
	let purchaseQuantity = $state<number | undefined>(undefined);
	let purchaseCost = $state<number | undefined>(undefined);
	let purchaseCurrency = $state('USD');
	let purchaseDate = $state(new Date().toISOString().split('T')[0]);
	let purchaseLocation = $state('');
	let purchasePaymentMethod = $state('');
	let purchaseNotes = $state('');

	// Sync with server data on mount
	$effect(() => {
		if (data?.items && data.items.length > 0 && purchaseState.items.current.length === 0) {
			purchaseState.items.current = data.items.map((item) => ({
				id: item.id,
				name: item.name,
				category: item.category,
				description: item.description || undefined,
				defaultUnit: item.defaultUnit || undefined,
				defaultCurrency: item.defaultCurrency,
				createdAt: item.createdAt.toISOString(),
				updatedAt: item.updatedAt.toISOString()
			}));
		}
		if (
			data?.purchases &&
			data.purchases.length > 0 &&
			purchaseState.purchases.current.length === 0
		) {
			purchaseState.purchases.current = data.purchases.map((purchase) => ({
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
			}));
		}
		isLoading = false;
	});

	// Auto-backup effect - triggers when hasUnsavedChanges becomes true
	$effect(() => {
		if (hasUnsavedChanges && isAuthenticated && !isBackingUp && autoBackupEnabled.current) {
			if (autoBackupTimer) clearTimeout(autoBackupTimer);
			autoBackupCountdown = AUTO_BACKUP_DELAY / 1000;

			autoBackupTimer = setTimeout(async () => {
				await performAutoBackup();
			}, AUTO_BACKUP_DELAY);

			// Cleanup function to clear timer if effect re-runs or component unmounts
			return () => {
				if (autoBackupTimer) {
					clearTimeout(autoBackupTimer);
					autoBackupTimer = null;
				}
			};
		}
	});

	// Get available categories
	let availableCategories = $derived(purchaseState.getAllCategories());

	// Get currency options
	let currencyOptions = $derived(purchaseState.supportedCurrencies);

	// Handle adding new item
	function handleAddItem() {
		if (!itemName.trim() || !itemCategory) {
			toast.error('Please fill in all required fields');
			return;
		}

		const id = purchaseState.addItem(
			itemName.trim(),
			itemCategory,
			itemDescription || undefined,
			itemDefaultUnit || undefined,
			itemDefaultCurrency
		);

		resetItemForm();
		toast.success('Item added successfully!');
		showAddItemDialog = false;
		markUnsavedChanges();
	}

	// Handle editing item
	function handleEditItem() {
		if (!editingItem || !itemName.trim() || !itemCategory) {
			toast.error('Please fill in all required fields');
			return;
		}

		purchaseState.updateItem(editingItem.id, {
			name: itemName.trim(),
			category: itemCategory,
			description: itemDescription || undefined,
			defaultUnit: itemDefaultUnit || undefined,
			defaultCurrency: itemDefaultCurrency
		});

		resetItemForm();
		toast.success('Item updated successfully!');
		showAddItemDialog = false;
		editingItem = null;
		markUnsavedChanges();
	}

	// Handle deleting item with server sync	// Handle adding purchase record
	function handleAddPurchase() {
		if (!selectedItemForPurchase || !purchaseQuantity || !purchaseCost || !purchaseDate) {
			toast.error('Please fill in all required fields');
			return;
		}

		const id = purchaseState.addPurchaseRecord(
			selectedItemForPurchase.id,
			purchaseQuantity,
			purchaseCost,
			purchaseCurrency,
			purchaseDate,
			purchaseLocation || undefined,
			purchasePaymentMethod || undefined,
			purchaseNotes || undefined
		);

		resetPurchaseForm();
		toast.success('Purchase record added successfully!');
		showAddPurchaseDialog = false;
		selectedItemForPurchase = null;
		markUnsavedChanges();
	}

	// Handle editing purchase record
	function handleEditPurchase() {
		if (!editingPurchase || !purchaseQuantity || !purchaseCost || !purchaseDate) {
			toast.error('Please fill in all required fields');
			return;
		}

		purchaseState.updatePurchaseRecord(editingPurchase.id, {
			quantity: purchaseQuantity,
			cost: purchaseCost,
			currency: purchaseCurrency,
			date: purchaseDate,
			location: purchaseLocation || undefined,
			paymentMethod: purchasePaymentMethod || undefined,
			notes: purchaseNotes || undefined
		});

		resetPurchaseForm();
		toast.success('Purchase record updated successfully!');
		showAddPurchaseDialog = false;
		editingPurchase = null;
		selectedItemForPurchase = null;
		markUnsavedChanges();
	}

	// Handle deleting purchase record
	async function handleDeletePurchase(purchase: PurchaseRecord) {
		await handleDeletePurchaseRecord(purchase);
	}

	// Open add purchase dialog for item
	function openAddPurchaseDialog(item: Item) {
		selectedItemForPurchase = item;
		purchaseCurrency = item.defaultCurrency || 'USD';
		showAddPurchaseDialog = true;
	}

	// Open edit purchase dialog
	function openEditPurchaseDialog(purchase: PurchaseRecord) {
		editingPurchase = purchase;
		selectedItemForPurchase =
			purchaseState.items.current.find((i) => i.id === purchase.itemId) || null;
		purchaseQuantity = purchase.quantity;
		purchaseCost = purchase.cost;
		purchaseCurrency = purchase.currency;
		purchaseDate = purchase.date;
		purchaseLocation = purchase.location || '';
		purchasePaymentMethod = purchase.paymentMethod || '';
		purchaseNotes = purchase.notes || '';
		showAddPurchaseDialog = true;
	}

	// Open purchase history dialog
	function openPurchaseHistoryDialog(item: Item) {
		selectedItemForHistory = item;
		showPurchaseHistoryDialog = true;
	}

	// Open edit item dialog
	function openEditItemDialog(item: Item) {
		editingItem = item;
		itemName = item.name;
		itemCategory = item.category;
		itemDescription = item.description || '';
		itemDefaultUnit = item.defaultUnit || '';
		itemDefaultCurrency = item.defaultCurrency || 'USD';
		showAddItemDialog = true;
	}

	// Reset forms
	function resetItemForm() {
		itemName = '';
		itemCategory = '';
		itemDescription = '';
		itemDefaultUnit = '';
		itemDefaultCurrency = 'USD';
	}

	function resetPurchaseForm() {
		purchaseQuantity = undefined;
		purchaseCost = undefined;
		purchaseCurrency = 'USD';
		purchaseDate = new Date().toISOString().split('T')[0];
		purchaseLocation = '';
		purchasePaymentMethod = '';
		purchaseNotes = '';
	}

	// Get purchase history for selected item
	let selectedItemPurchases = $derived.by(() => {
		if (!selectedItemForHistory) return [];
		return purchaseState.getPurchasesForItem(selectedItemForHistory.id);
	});

	// Get item stats
	function getItemStats(item: Item) {
		return purchaseState.getItemStats(item.id);
	}

	// Format currency
	function formatCurrency(amount: number, currency: string) {
		const currencyInfo = purchaseState.getCurrencyInfo(currency);
		return `${currencyInfo?.symbol || currency} ${amount.toFixed(2)}`;
	}

	// Format date
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	// Mark data as having unsaved changes
	function markUnsavedChanges() {
		hasUnsavedChanges = true;
	}

	// Perform auto backup
	async function performAutoBackup() {
		if (!isAuthenticated || isBackingUp) return;

		try {
			isBackingUp = true;
			autoBackupRetryCount = 0;

			const formData = new FormData();
			formData.append('items', JSON.stringify(purchaseState.items.current));
			formData.append('purchases', JSON.stringify(purchaseState.purchases.current));

			const response = await fetch('?/saveData', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.success) {
				hasUnsavedChanges = false;
				console.log('✅ Auto-backup successful');
			} else {
				throw new Error(result.error || 'Backup failed');
			}
		} catch (error) {
			console.error('❌ Auto-backup failed:', error);
			autoBackupRetryCount++;

			if (autoBackupRetryCount < MAX_RETRY_ATTEMPTS) {
				// Retry after a delay
				setTimeout(performAutoBackup, 5000);
			}
		} finally {
			isBackingUp = false;
		}
	}

	// Manual backup to server
	async function backupToServer() {
		if (!isAuthenticated) {
			toast.error('Please log in to backup your data');
			return;
		}

		try {
			isBackingUp = true;
			showBackupDialog = true;

			const formData = new FormData();
			formData.append('items', JSON.stringify(purchaseState.items.current));
			formData.append('purchases', JSON.stringify(purchaseState.purchases.current));

			const response = await fetch('?/saveData', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.success) {
				hasUnsavedChanges = false;
				toast.success(
					`Backup successful! Saved ${purchaseState.items.current.length} items and ${purchaseState.purchases.current.length} purchases.`
				);
			} else {
				throw new Error(result.error || 'Backup failed');
			}
		} catch (error) {
			console.error('❌ Backup failed:', error);
			toast.error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			isBackingUp = false;
			showBackupDialog = false;
		}
	}

	// Handle deleting item with server sync
	async function handleDeleteItem(item: Item) {
		if (!confirm(`Are you sure you want to delete "${item.name}" and all its purchase records?`)) {
			return;
		}

		try {
			if (isAuthenticated) {
				// Delete from server
				const formData = new FormData();
				formData.append('itemId', item.id);

				const response = await fetch('?/deleteItem', {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || 'Failed to delete item');
				}
			}

			// Delete from local state
			purchaseState.deleteItem(item.id);
			toast.success('Item and all purchase records deleted');
			markUnsavedChanges();
		} catch (error) {
			console.error('❌ Delete failed:', error);
			toast.error(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	// Handle deleting purchase record with server sync
	async function handleDeletePurchaseRecord(purchase: PurchaseRecord) {
		if (!confirm('Are you sure you want to delete this purchase record?')) {
			return;
		}

		try {
			if (isAuthenticated) {
				// Delete from server
				const formData = new FormData();
				formData.append('purchaseId', purchase.id);

				const response = await fetch('?/deletePurchaseRecord', {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || 'Failed to delete purchase record');
				}
			}

			// Delete from local state
			purchaseState.deletePurchaseRecord(purchase.id);
			toast.success('Purchase record deleted');
			markUnsavedChanges();
		} catch (error) {
			console.error('❌ Delete failed:', error);
			toast.error(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
</script>

<RouteHead
	title="Purchase Tracker"
	description="Track your purchases over time with detailed records"
	route="/apps/purchase-tracker"
/>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<PurchaseTrackerHeader
		bind:activeTab
		{isAuthenticated}
		{isBackingUp}
		onHelpClick={() => showHelpDialog = true}
		onBackupClick={backupToServer}
	/>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin" />
		</div>
	{:else}
		{#if activeTab === 'items'}
			<ItemsView
				items={purchaseState.items.current}
				bind:searchQuery
				bind:selectedCategory
				onSearchChange={(query) => searchQuery = query}
				onCategoryChange={(category) => selectedCategory = category}
				onAddItem={() => {
					showAddItemDialog = true;
					editingItem = null;
					resetItemForm();
				}}
				onEditItem={openEditItemDialog}
				onAddPurchase={openAddPurchaseDialog}
				onViewHistory={openPurchaseHistoryDialog}
				onDeleteItem={handleDeleteItem}
			/>
		{:else}
			<PurchasesView onEditPurchase={openEditPurchaseDialog} />
		{/if}
	{/if}
</div>

<HelpDialog bind:open={showHelpDialog} />

<AddEditItemDialog
	bind:open={showAddItemDialog}
	{editingItem}
	bind:itemName
	bind:itemCategory
	bind:itemDescription
	bind:itemDefaultUnit
	bind:itemDefaultCurrency
	{availableCategories}
	{currencyOptions}
	onSave={editingItem ? handleEditItem : handleAddItem}
	onCancel={() => {
		showAddItemDialog = false;
		editingItem = null;
	}}
/>

<AddEditPurchaseDialog
	bind:open={showAddPurchaseDialog}
	{editingPurchase}
	{selectedItemForPurchase}
	bind:purchaseQuantity
	bind:purchaseCost
	bind:purchaseCurrency
	bind:purchaseDate
	bind:purchaseLocation
	bind:purchasePaymentMethod
	bind:purchaseNotes
	{currencyOptions}
	{availableCategories}
	onSave={editingPurchase ? handleEditPurchase : handleAddPurchase}
	onCancel={() => {
		showAddPurchaseDialog = false;
		editingPurchase = null;
		selectedItemForPurchase = null;
	}}
/>

<PurchaseHistoryDialog
	bind:open={showPurchaseHistoryDialog}
	{selectedItemForHistory}
	purchases={selectedItemPurchases}
	stats={selectedItemForHistory ? purchaseState.getItemStats(selectedItemForHistory.id) : { totalPurchases: 0, totalQuantity: 0, totalSpent: 0, averageCost: 0 }}
	onEditPurchase={openEditPurchaseDialog}
	onDeletePurchase={handleDeletePurchase}
	onAddFirstPurchase={() => {
		showPurchaseHistoryDialog = false;
		if (selectedItemForHistory) openAddPurchaseDialog(selectedItemForHistory);
	}}
	onClose={() => showPurchaseHistoryDialog = false}
/>

<!-- How to Use Dialog -->
<Dialog.Root bind:open={showHelpDialog}>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<HelpCircle class="h-5 w-5" />
				How to Use Purchase Tracker
			</Dialog.Title>
			<Dialog.Description>
				Learn how to track your purchases effectively with step-by-step guidance.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Getting Started -->
			<div>
				<h3
					class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<Package class="h-5 w-5" />
					Getting Started
				</h3>
				<div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400"
						>
							1
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Add Your First Item</strong>
							<p>
								Click the "Add Item" button to create items you want to track purchases for, like
								"Regular Gasoline", "Weekly Groceries", or "Coffee Beans".
							</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400"
						>
							2
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Choose a Category</strong>
							<p>
								Select from predefined categories like Fuel, Groceries, Dining, or create custom
								categories that fit your spending habits.
							</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400"
						>
							3
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Set Default Preferences</strong>
							<p>
								Configure default units (gallons, pounds, etc.) and currency for each item to make
								data entry faster.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Recording Purchases -->
			<div>
				<h3
					class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<ShoppingCart class="h-5 w-5" />
					Recording Purchases
				</h3>
				<div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-400"
						>
							1
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Select an Item</strong>
							<p>
								From the Items tab, click the dropdown button <ChevronDown
									class="mx-1 inline h-3 w-3"
								/> on any item card and choose "Add Purchase" to record a new transaction.
							</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-400"
						>
							2
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Enter Purchase Details</strong>
							<p>
								Fill in quantity, cost, date, and optionally add location, payment method, and notes
								for better tracking.
							</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-400"
						>
							3
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Track Over Time</strong>
							<p>
								Regularly add purchases to build a comprehensive history of your spending patterns
								and costs.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Viewing Data -->
			<div>
				<h3
					class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<History class="h-5 w-5" />
					Viewing Your Data
				</h3>
				<div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600 dark:bg-purple-900 dark:text-purple-400"
						>
							1
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Items Overview</strong>
							<p>
								The Items tab shows all your tracked items with purchase statistics including total
								spent and number of purchases.
							</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600 dark:bg-purple-900 dark:text-purple-400"
						>
							2
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Purchase History</strong>
							<p>
								Switch to the "Purchase History" tab to see a chronological list of all your
								recorded purchases across all items.
							</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600 dark:bg-purple-900 dark:text-purple-400"
						>
							3
						</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Item-Specific History</strong>
							<p>
								Click "View History" from an item's dropdown menu to see detailed purchase records
								just for that specific item.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Tips & Best Practices -->
			<div>
				<h3
					class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<HelpCircle class="h-5 w-5" />
					Tips & Best Practices
				</h3>
				<div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/50">
					<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
						<li class="flex items-start gap-2">
							<span class="mt-1 text-blue-500">•</span>
							<span
								><strong>Be Consistent:</strong> Use the same categories and units for similar items
								to make analysis easier.</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-1 text-blue-500">•</span>
							<span
								><strong>Add Details:</strong> Include location and payment method information for better
								expense tracking.</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-1 text-blue-500">•</span>
							<span
								><strong>Regular Updates:</strong> Record purchases soon after they happen while details
								are fresh in your memory.</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-1 text-blue-500">•</span>
							<span
								><strong>Review Patterns:</strong> Use the statistics shown on item cards to identify
								spending trends and optimize purchases.</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-1 text-blue-500">•</span>
							<span
								><strong>Backup Data:</strong> If you're logged in, use the <Cloud
									class="mx-1 inline h-3 w-3"
								/> Backup button to save your data to the cloud.</span
							>
						</li>
					</ul>
				</div>
			</div>

			<!-- Features Overview -->
			<div>
				<h3
					class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<Settings class="h-5 w-5" />
					Key Features
				</h3>
				<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
					<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
						<div class="mb-1 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
							<Cloud class="h-4 w-4" />
							Offline-First
						</div>
						<div class="text-gray-600 dark:text-gray-400">
							Works without internet connection, data syncs when online.
						</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
						<div class="mb-1 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
							<Edit class="h-4 w-4" />
							Auto-Save
						</div>
						<div class="text-gray-600 dark:text-gray-400">
							Changes are automatically saved to your browser's local storage.
						</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
						<div class="mb-1 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
							<History class="h-4 w-4" />
							Multi-Tab Sync
						</div>
						<div class="text-gray-600 dark:text-gray-400">
							Data stays synchronized across multiple browser tabs.
						</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
						<div class="mb-1 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
							<DollarSign class="h-4 w-4" />
							Multi-Currency
						</div>
						<div class="text-gray-600 dark:text-gray-400">
							Support for USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, NGN.
						</div>
					</div>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showHelpDialog = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
