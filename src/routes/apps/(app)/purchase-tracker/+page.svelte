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
		Cloud
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
		}
	});

	// Filtered items
	let filteredItems = $derived.by(() => {
		let items = purchaseState.items.current;

		// Filter by search query
		if (searchQuery) {
			items = items.filter(
				(item) =>
					item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Filter by category
		if (selectedCategory !== 'all') {
			items = items.filter((item) => item.category === selectedCategory);
		}

		return items;
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

			const response = await fetch('?/backupToServer', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					items: purchaseState.items.current,
					purchases: purchaseState.purchases.current
				})
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

			const response = await fetch('?/backupToServer', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					items: purchaseState.items.current,
					purchases: purchaseState.purchases.current
				})
			});

			const result = await response.json();

			if (result.success) {
				hasUnsavedChanges = false;
				toast.success(
					`Backup successful! Saved ${result.itemsCount} items and ${result.purchasesCount} purchases.`
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
	<!-- Header -->
	<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Purchase Tracker</h1>
			<p class="mt-1 text-gray-600 dark:text-gray-400">
				Track items and record purchases over time
			</p>
		</div>
		<div class="flex gap-2">
			<Button
				variant={activeTab === 'items' ? 'default' : 'outline'}
				onclick={() => (activeTab = 'items')}
			>
				<Package class="mr-2 h-4 w-4" />
				Items
			</Button>
			<Button
				variant={activeTab === 'purchases' ? 'default' : 'outline'}
				onclick={() => (activeTab = 'purchases')}
			>
				<History class="mr-2 h-4 w-4" />
				Purchase History
			</Button>
			{#if isAuthenticated}
				<Button variant="outline" onclick={backupToServer} disabled={isBackingUp} class="ml-4">
					{#if isBackingUp}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Backing up...
					{:else}
						<Cloud class="mr-2 h-4 w-4" />
						Backup
					{/if}
				</Button>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin" />
		</div>
	{:else}
		<!-- Search and Filter -->
		<div class="mb-6 flex flex-col gap-4 sm:flex-row">
			<div class="flex-1">
				<Input placeholder="Search items..." bind:value={searchQuery} class="w-full" />
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" class="min-w-[140px]">
						{selectedCategory === 'all'
							? 'All Categories'
							: availableCategories.find((c) => c.id === selectedCategory)?.name ||
								'All Categories'}
						<ChevronDown class="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => (selectedCategory = 'all')}>
						All Categories
					</DropdownMenu.Item>
					{#each availableCategories as category}
						<DropdownMenu.Item onclick={() => (selectedCategory = category.id)}>
							{category.icon}
							{category.name}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Button
				onclick={() => {
					showAddItemDialog = true;
					editingItem = null;
					resetItemForm();
				}}
			>
				<Plus class="mr-2 h-4 w-4" />
				Add Item
			</Button>
		</div>

		{#if activeTab === 'items'}
			<!-- Items Grid -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredItems as item (item.id)}
					{@const stats = getItemStats(item)}
					<Card class="transition-shadow hover:shadow-lg">
						<CardHeader class="pb-3">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<CardTitle class="text-lg">{item.name}</CardTitle>
									<div class="mt-1 flex items-center gap-2">
										<Badge variant="secondary" class="text-xs">
											{purchaseState.getAllCategories().find((c) => c.id === item.category)?.icon}
											{purchaseState.getAllCategories().find((c) => c.id === item.category)?.name}
										</Badge>
									</div>
								</div>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="ghost" size="sm">
											<ChevronDown class="h-4 w-4" />
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Item onclick={() => openEditItemDialog(item)}>
											<Edit class="mr-2 h-4 w-4" />
											Edit Item
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => openAddPurchaseDialog(item)}>
											<ShoppingCart class="mr-2 h-4 w-4" />
											Add Purchase
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => openPurchaseHistoryDialog(item)}>
											<History class="mr-2 h-4 w-4" />
											View History
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => handleDeleteItem(item)} class="text-red-600">
											<Trash2 class="mr-2 h-4 w-4" />
											Delete Item
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</CardHeader>
						<CardContent>
							{#if item.description}
								<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
							{/if}

							<div class="space-y-2 text-sm">
								{#if item.defaultUnit}
									<div class="flex justify-between">
										<span class="text-gray-500">Unit:</span>
										<span>{item.defaultUnit}</span>
									</div>
								{/if}
								<div class="flex justify-between">
									<span class="text-gray-500">Currency:</span>
									<span>{item.defaultCurrency}</span>
								</div>
								<div class="space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-gray-500">Total Purchases:</span>
										<span class="font-medium">{stats.totalPurchases}</span>
									</div>
									{#if stats.totalSpent > 0}
										<div class="flex justify-between">
											<span class="text-gray-500">Total Spent:</span>
											<span class="font-medium"
												>{formatCurrency(stats.totalSpent, item.defaultCurrency || 'USD')}</span
											>
										</div>
									{/if}
								</div>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>

			{#if filteredItems.length === 0}
				<div class="py-12 text-center">
					<Package class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No items found</h3>
					<p class="mb-4 text-gray-600 dark:text-gray-400">
						{searchQuery || selectedCategory !== 'all'
							? 'Try adjusting your search or filters.'
							: 'Get started by adding your first item.'}
					</p>
					<Button
						onclick={() => {
							showAddItemDialog = true;
							resetItemForm();
						}}
					>
						<Plus class="mr-2 h-4 w-4" />
						Add Your First Item
					</Button>
				</div>
			{/if}
		{:else}
			<!-- Purchase History View -->
			<div class="space-y-6">
				{#each purchaseState.getPurchasesWithItems() as purchase (purchase.id)}
					<Card>
						<CardContent class="pt-6">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-3">
										<h3 class="font-medium">{purchase.item.name}</h3>
										<Badge variant="secondary" class="text-xs">
											{purchaseState.getAllCategories().find((c) => c.id === purchase.item.category)
												?.icon}
											{purchaseState.getAllCategories().find((c) => c.id === purchase.item.category)
												?.name}
										</Badge>
									</div>
									<div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
										<div>
											<span class="text-gray-500">Quantity:</span>
											<div class="font-medium">
												{purchase.quantity}
												{purchase.item.defaultUnit || 'units'}
											</div>
										</div>
										<div>
											<span class="text-gray-500">Cost:</span>
											<div class="font-medium">
												{formatCurrency(purchase.cost, purchase.currency)}
											</div>
										</div>
										<div>
											<span class="text-gray-500">Date:</span>
											<div class="font-medium">{formatDate(purchase.date)}</div>
										</div>
										<div>
											<span class="text-gray-500">Location:</span>
											<div class="font-medium">{purchase.location || 'N/A'}</div>
										</div>
									</div>
									{#if purchase.notes}
										<div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
											<span class="text-gray-500">Notes:</span>
											{purchase.notes}
										</div>
									{/if}
								</div>
								<Button variant="ghost" size="sm" onclick={() => openEditPurchaseDialog(purchase)}>
									<Edit class="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>

			{#if purchaseState.getPurchasesWithItems().length === 0}
				<div class="py-12 text-center">
					<History class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
						No purchase records
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Add some purchases to your items to see the history here.
					</p>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<!-- Add/Edit Item Dialog -->
<Dialog.Root bind:open={showAddItemDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{editingItem ? 'Edit Item' : 'Add New Item'}</Dialog.Title>
			<Dialog.Description>
				{editingItem ? 'Update the item details.' : 'Create a new item to track purchases for.'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="item-name">Name *</Label>
				<Input id="item-name" bind:value={itemName} placeholder="e.g., Regular Gasoline" />
			</div>
			<div class="grid gap-2">
				<Label for="item-category">Category *</Label>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline" class="w-full justify-between">
							{itemCategory
								? availableCategories.find((c) => c.id === itemCategory)?.name || 'Select category'
								: 'Select category'}
							<ChevronDown class="h-4 w-4" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-full">
						{#each availableCategories as category}
							<DropdownMenu.Item onclick={() => (itemCategory = category.id)}>
								{category.icon}
								{category.name}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="grid gap-2">
				<Label for="item-description">Description</Label>
				<Textarea
					id="item-description"
					bind:value={itemDescription}
					placeholder="Optional description..."
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="item-unit">Default Unit</Label>
					<Input id="item-unit" bind:value={itemDefaultUnit} placeholder="e.g., gallons, liters" />
				</div>
				<div class="grid gap-2">
					<Label for="item-currency">Default Currency</Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="outline" class="w-full justify-between">
								{itemDefaultCurrency}
								<ChevronDown class="h-4 w-4" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							{#each currencyOptions as currency}
								<DropdownMenu.Item onclick={() => (itemDefaultCurrency = currency.code)}>
									{#if currency.icon}
										<img src={currency.icon} alt={currency.symbol} class="mr-2 inline h-4 w-4" />
									{:else}
										{currency.symbol}
									{/if}
									{currency.name}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					showAddItemDialog = false;
					editingItem = null;
				}}
			>
				Cancel
			</Button>
			<Button onclick={editingItem ? handleEditItem : handleAddItem}>
				{editingItem ? 'Update Item' : 'Add Item'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Add/Edit Purchase Dialog -->
<Dialog.Root bind:open={showAddPurchaseDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				{editingPurchase ? 'Edit Purchase Record' : 'Add Purchase Record'}
			</Dialog.Title>
			<Dialog.Description>
				{editingPurchase
					? 'Update the purchase details.'
					: `Record a new purchase for "${selectedItemForPurchase?.name}".`}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if !editingPurchase && selectedItemForPurchase}
				<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
					<div class="font-medium">{selectedItemForPurchase!.name}</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">
						{purchaseState
							.getAllCategories()
							.find((c) => c.id === selectedItemForPurchase!.category)?.name}
						{#if selectedItemForPurchase!.defaultUnit}
							• {selectedItemForPurchase!.defaultUnit}
						{/if}
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="purchase-quantity">Quantity *</Label>
					<Input
						id="purchase-quantity"
						type="number"
						step="0.01"
						bind:value={purchaseQuantity}
						placeholder="0.00"
					/>
				</div>
				<div class="grid gap-2">
					<Label for="purchase-cost">Cost *</Label>
					<Input
						id="purchase-cost"
						type="number"
						step="0.01"
						bind:value={purchaseCost}
						placeholder="0.00"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="purchase-currency">Currency</Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="outline" class="w-full justify-between">
								{purchaseCurrency}
								<ChevronDown class="h-4 w-4" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							{#each currencyOptions as currency}
								<DropdownMenu.Item onclick={() => (purchaseCurrency = currency.code)}>
									{#if currency.icon}
										<img src={currency.icon} alt={currency.symbol} class="mr-2 inline h-4 w-4" />
									{:else}
										{currency.symbol}
									{/if}
									{currency.name}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<div class="grid gap-2">
					<Label for="purchase-date">Date *</Label>
					<Input id="purchase-date" type="date" bind:value={purchaseDate} />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="purchase-location">Location</Label>
				<Input
					id="purchase-location"
					bind:value={purchaseLocation}
					placeholder="e.g., Shell Station"
				/>
			</div>

			<div class="grid gap-2">
				<Label for="purchase-payment">Payment Method</Label>
				<Input
					id="purchase-payment"
					bind:value={purchasePaymentMethod}
					placeholder="e.g., Credit Card"
				/>
			</div>

			<div class="grid gap-2">
				<Label for="purchase-notes">Notes</Label>
				<Textarea id="purchase-notes" bind:value={purchaseNotes} placeholder="Optional notes..." />
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					showAddPurchaseDialog = false;
					editingPurchase = null;
					selectedItemForPurchase = null;
				}}
			>
				Cancel
			</Button>
			<Button onclick={editingPurchase ? handleEditPurchase : handleAddPurchase}>
				{editingPurchase ? 'Update Purchase' : 'Add Purchase'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Purchase History Dialog -->
<Dialog.Root bind:open={showPurchaseHistoryDialog}>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Purchase History</Dialog.Title>
			<Dialog.Description>
				All purchase records for "{selectedItemForHistory?.name}"
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedItemForHistory}
			{@const purchases = purchaseState.getPurchasesForItem(selectedItemForHistory.id)}
			{@const stats = purchaseState.getItemStats(selectedItemForHistory.id)}

			<div class="py-4">
				<!-- Stats -->
				<div
					class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4 dark:bg-gray-800"
				>
					<div class="text-center">
						<div class="text-2xl font-bold">{stats.totalPurchases}</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">Total Purchases</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold">{stats.totalQuantity.toFixed(2)}</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">Total Quantity</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold">
							{formatCurrency(stats.totalSpent, selectedItemForHistory.defaultCurrency || 'USD')}
						</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold">
							{stats.averageCost > 0
								? formatCurrency(stats.averageCost, selectedItemForHistory.defaultCurrency || 'USD')
								: 'N/A'}
						</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">Avg Cost</div>
					</div>
				</div>

				<!-- Purchase List -->
				<div class="space-y-3">
					{#each purchases as purchase (purchase.id)}
						<div class="flex items-center justify-between rounded-lg border p-3">
							<div class="flex-1">
								<div class="flex items-center gap-4 text-sm">
									<div class="font-medium">{formatDate(purchase.date)}</div>
									<div>{purchase.quantity} {selectedItemForHistory.defaultUnit || 'units'}</div>
									<div class="font-medium">{formatCurrency(purchase.cost, purchase.currency)}</div>
									{#if purchase.location}
										<div class="text-gray-600 dark:text-gray-400">{purchase.location}</div>
									{/if}
								</div>
								{#if purchase.notes}
									<div class="mt-1 text-xs text-gray-600 dark:text-gray-400">{purchase.notes}</div>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button variant="ghost" size="sm" onclick={() => openEditPurchaseDialog(purchase)}>
									<Edit class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => handleDeletePurchase(purchase)}
									class="text-red-600 hover:text-red-700"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>

				{#if purchases.length === 0}
					<div class="py-8 text-center">
						<History class="mx-auto mb-2 h-8 w-8 text-gray-400" />
						<p class="text-gray-600 dark:text-gray-400">No purchase records yet</p>
						<Button
							variant="outline"
							size="sm"
							class="mt-2"
							onclick={() => {
								showPurchaseHistoryDialog = false;
								if (selectedItemForHistory) openAddPurchaseDialog(selectedItemForHistory);
							}}
						>
							Add First Purchase
						</Button>
					</div>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showPurchaseHistoryDialog = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
