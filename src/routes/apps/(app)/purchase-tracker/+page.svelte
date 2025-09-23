<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		Loader2,
		Plus,
		TrendingUp,
		Calendar
	} from '@lucide/svelte';

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
	import HowToUseDialog from './HowToUseDialog.svelte';
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

<HowToUseDialog bind:open={showHelpDialog} />

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

<!-- How to Use Dialog -->
<HowToUseDialog bind:open={showHelpDialog} />
