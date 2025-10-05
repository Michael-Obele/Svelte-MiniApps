<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { PersistedState } from 'runed';
	import { Loader2, Plus, TrendingUp, Calendar } from '@lucide/svelte';

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

	// Remote functions import
	import {
		backupPurchaseData,
		loadPurchaseData,
		deletePurchaseItem,
		deletePurchaseRecordById,
		syncPurchaseData
	} from '$lib/remote';

	// Component imports
	import PurchaseTrackerHeader from './PurchaseTrackerHeader.svelte';
	import ItemsView from './ItemsView.svelte';
	import PurchasesView from './PurchasesView.svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { purchaseTrackerHowToUse } from './how-to-use-config';
	import AddEditItemDialog from './AddEditItemDialog.svelte';
	import AddEditPurchaseDialog from './AddEditPurchaseDialog.svelte';
	import PurchaseHistoryDialog from './PurchaseHistoryDialog.svelte';
	import HelpDialog from './HelpDialog.svelte';
	import ConfirmDeleteDialog from './ConfirmDeleteDialog.svelte';

	// Props from load function
	let { data }: { data: PageData } = $props();

	// Authentication and backup state
	let isAuthenticated = $state(!!data.user);
	let hasUnsavedChanges = $state(false);
	let isBackingUp = $state(false);
	let showBackupDialog = $state(false);
	let isRefreshing = $state(false);
	// Reactive state
	let isLoading = $state(true);
	let activeTab = $state<'items' | 'purchases'>('items');
	let showAddItemDialog = $state(false);
	let showAddPurchaseDialog = $state(false);
	let showPurchaseHistoryDialog = $state(false);
	let showHelpDialog = $state(false);
	let showDeleteItemDialog = $state(false);
	let showDeletePurchaseDialog = $state(false);

	// Track if user has seen the how-to guide
	let hasSeenGuide = new PersistedState<boolean>('purchase-tracker-has-seen-guide', false, {
		storage: 'local'
	});
	let itemToDelete = $state<Item | null>(null);
	let purchaseToDelete = $state<PurchaseRecord | null>(null);
	let isDeleting = $state(false);
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
	onMount(() => {
		// For authenticated users, always sync with server data on mount
		if (isAuthenticated && data?.items && data.items.length > 0) {
			const localItemsCount = purchaseState.items.current.length;
			const serverItemsCount = data.items.length;

			// If local storage is empty or server has data, sync from server
			if (localItemsCount === 0 || serverItemsCount > 0) {
				console.log(
					`🔄 Syncing data from server: ${serverItemsCount} items, ${data.purchases?.length || 0} purchases`
				);

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

				if (data?.purchases && data.purchases.length > 0) {
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

				// Reset unsaved changes flag since we just synced
				hasUnsavedChanges = false;
			}
		} else if (!isAuthenticated) {
			// For unauthenticated users, only initialize if local storage is empty
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
		}
		isLoading = false;

		// Show how-to guide for new users
		if (!hasSeenGuide.current) {
			showHelpDialog = true;
		}
	});

	// Toast notification for unsaved changes - shows when user is logged in and has unsaved content
	$effect(() => {
		if (hasUnsavedChanges && isAuthenticated && !isBackingUp) {
			toast('You have unsaved changes! Click the Backup button to save your data.', {
				duration: Infinity,
				action: {
					label: 'Backup Now',
					onClick: () => backupToServer()
				}
			});
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

	// Manual backup to server using remote function
	async function backupToServer() {
		if (!isAuthenticated) {
			toast.error('Please log in to backup your data');
			return;
		}

		try {
			isBackingUp = true;
			showBackupDialog = true;

			// Use remote function to backup data
			const result = await backupPurchaseData({
				items: purchaseState.items.current,
				purchases: purchaseState.purchases.current
			});

			hasUnsavedChanges = false;
			toast.success(
				`Backup successful! Saved ${result.itemsCount} items and ${result.purchasesCount} purchases.`
			);
		} catch (error) {
			console.error('❌ Backup failed:', error);
			toast.error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			isBackingUp = false;
			showBackupDialog = false;
		}
	}

	// Handle deleting item with server sync using remote function
	function handleDeleteItem(item: Item) {
		itemToDelete = item;
		showDeleteItemDialog = true;
	}

	async function confirmDeleteItem() {
		if (!itemToDelete) return;

		isDeleting = true;
		try {
			// Try to delete from server if authenticated
			if (isAuthenticated) {
				try {
					await deletePurchaseItem(itemToDelete.id);
				} catch (error) {
					console.warn('⚠️ Server delete failed, proceeding with local delete:', error);
					// Continue with local delete even if server delete fails
				}
			}

			// Delete from local state (always execute this)
			purchaseState.deleteItem(itemToDelete.id);
			toast.success('Item and all purchase records deleted');
			markUnsavedChanges();
			showDeleteItemDialog = false;
			itemToDelete = null;
		} catch (error) {
			console.error('❌ Delete failed:', error);
			toast.error(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			isDeleting = false;
		}
	}

	function cancelDeleteItem() {
		showDeleteItemDialog = false;
		itemToDelete = null;
	}

	// Handle deleting purchase record with server sync using remote function
	function handleDeletePurchaseRecord(purchase: PurchaseRecord) {
		purchaseToDelete = purchase;
		showDeletePurchaseDialog = true;
	}

	async function confirmDeletePurchase() {
		if (!purchaseToDelete) return;

		isDeleting = true;
		try {
			// Try to delete from server if authenticated
			if (isAuthenticated) {
				try {
					await deletePurchaseRecordById(purchaseToDelete.id);
				} catch (error) {
					console.warn('⚠️ Server delete failed, proceeding with local delete:', error);
					// Continue with local delete even if server delete fails
				}
			}

			// Delete from local state (always execute this)
			purchaseState.deletePurchaseRecord(purchaseToDelete.id);
			toast.success('Purchase record deleted');
			markUnsavedChanges();
			showDeletePurchaseDialog = false;
			purchaseToDelete = null;
		} catch (error) {
			console.error('❌ Delete failed:', error);
			toast.error(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			isDeleting = false;
		}
	}

	function cancelDeletePurchase() {
		showDeletePurchaseDialog = false;
		purchaseToDelete = null;
	}

	// Refresh data from server using remote function
	async function refreshFromServer() {
		if (!isAuthenticated) {
			toast.error('Please log in to refresh data from server');
			return;
		}

		// Warn if there are unsaved changes
		if (hasUnsavedChanges) {
			const confirmRefresh = confirm(
				'You have unsaved changes. Refreshing will override your local changes with server data. Continue?'
			);
			if (!confirmRefresh) {
				return;
			}
		}

		try {
			isRefreshing = true;
			console.log('🔄 Fetching latest data from server...');

			// Use remote function to load data
			const result = await loadPurchaseData();

			// Update local state with server data
			purchaseState.items.current = result.items;
			purchaseState.purchases.current = result.purchases;

			// Reset unsaved changes flag
			hasUnsavedChanges = false;

			toast.success(
				`Data refreshed! Loaded ${result.items.length} items and ${result.purchases.length} purchases.`
			);
			console.log(
				`✅ Successfully refreshed: ${result.items.length} items, ${result.purchases.length} purchases`
			);
		} catch (error) {
			console.error('❌ Refresh failed:', error);
			toast.error(`Refresh failed: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			isRefreshing = false;
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
		{isRefreshing}
		onHelpClick={() => (showHelpDialog = true)}
		onBackupClick={backupToServer}
		onRefreshClick={refreshFromServer}
	/>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin" />
		</div>
	{:else if activeTab === 'items'}
		<ItemsView
			items={purchaseState.items.current}
			bind:searchQuery
			bind:selectedCategory
			onSearchChange={(query) => (searchQuery = query)}
			onCategoryChange={(category) => (selectedCategory = category)}
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
</div>

<PurchaseHistoryDialog
	bind:open={showPurchaseHistoryDialog}
	{selectedItemForHistory}
	purchases={selectedItemPurchases}
	stats={selectedItemForHistory
		? purchaseState.getItemStats(selectedItemForHistory.id)
		: { totalPurchases: 0, totalQuantity: 0, totalSpent: 0, averageCost: 0 }}
	onEditPurchase={openEditPurchaseDialog}
	onDeletePurchase={handleDeletePurchase}
	onAddFirstPurchase={() => {
		showPurchaseHistoryDialog = false;
		if (selectedItemForHistory) openAddPurchaseDialog(selectedItemForHistory);
	}}
	onClose={() => (showPurchaseHistoryDialog = false)}
/>

<ConfirmDeleteDialog
	bind:open={showDeleteItemDialog}
	title="Delete Item"
	description="Are you sure you want to delete this item and all its purchase records? This will permanently remove all associated data."
	itemName={itemToDelete?.name}
	onConfirm={confirmDeleteItem}
	onCancel={cancelDeleteItem}
	{isDeleting}
/>

<ConfirmDeleteDialog
	bind:open={showDeletePurchaseDialog}
	title="Delete Purchase Record"
	description="Are you sure you want to delete this purchase record? This action cannot be undone."
	onConfirm={confirmDeletePurchase}
	onCancel={cancelDeletePurchase}
	{isDeleting}
/>

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

<HowToUseDialog
	bind:open={showHelpDialog}
	onClose={() => (hasSeenGuide.current = true)}
	title={purchaseTrackerHowToUse.title}
	description={purchaseTrackerHowToUse.description}
	tabs={purchaseTrackerHowToUse.tabs}
	showFooterHelpText={purchaseTrackerHowToUse.showFooterHelpText}
/>
