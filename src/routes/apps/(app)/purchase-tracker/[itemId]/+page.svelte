<script lang="ts">
	import { page } from '$app/state';
	import RouteHead from '@/blocks/RouteHead.svelte';
	import {
		items,
		purchases,
		getAllCategories,
		getPurchasesForItem,
		addPurchaseRecord,
		updatePurchaseRecord,
		type Item,
		type PurchaseRecord
	} from '../states.svelte';
	import {
		getCurrentUser,
		getItem,
		getPurchasesForItem as getServerPurchases,
		createPurchaseForm,
		updatePurchaseForm
	} from '$lib/remote';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { CirclePlus, Trash2, FilePen, ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let currentUser = $state<{
		id: string;
		username: string;
		role: string;
	} | null>(null);

	// Load current user on mount
	$effect(() => {
		getCurrentUser().then((user) => {
			currentUser = user || null;
		});
	});

	const categories = getAllCategories();

	// Get itemId from route params
	const itemId = $derived(page.params.itemId);

	// Find the current item
	let currentItem = $derived.by(() => {
		return items.current.find((i) => i.id === itemId);
	});

	// Get purchases for this item
	let itemPurchases = $derived.by(() => {
		if (!currentItem) return [];
		return getPurchasesForItem(currentItem.id);
	});

	// Dialog states
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let selectedPurchase = $state<PurchaseRecord | null>(null);

	// Cost input state for formatted display
	let costInput = $state('');
	let editCostInput = $state('');

	// Formatted cost displays
	let formattedCost = $derived.by(() => {
		const num = parseFloat(costInput);
		if (isNaN(num) || !currentItem) return '';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currentItem.defaultCurrency || 'USD'
		}).format(num);
	});

	let editFormattedCost = $derived.by(() => {
		const num = parseFloat(editCostInput);
		if (isNaN(num) || !currentItem) return '';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currentItem.defaultCurrency || 'USD'
		}).format(num);
	});

	// Load server data if authenticated
	$effect(() => {
		if (currentUser && itemId) {
			getItem(itemId).then((serverItem) => {
				if (serverItem) {
					// Update item in local state
					const itemIndex = items.current.findIndex((i) => i.id === itemId);
					if (itemIndex >= 0) {
						items.current = items.current.map((i) => (i.id === itemId ? serverItem : i));
					} else {
						items.current = [...items.current, serverItem];
					}
				}
			});

			getServerPurchases(itemId).then((serverPurchases) => {
				if (serverPurchases) {
					// Update purchases in local state
					const otherPurchases = purchases.current.filter((p) => p.itemId !== itemId);
					purchases.current = [...otherPurchases, ...serverPurchases];
				}
			});
		}
	});

	function openCreateDialog() {
		createDialogOpen = true;
	}

	function openEditDialog(purchase: PurchaseRecord) {
		selectedPurchase = purchase;
		editCostInput = purchase.cost.toString();
		editDialogOpen = true;
	}

	function handleDelete(purchaseId: string) {
		if (confirm('Are you sure you want to delete this purchase record?')) {
			purchases.current = purchases.current.filter((p) => p.id !== purchaseId);
			toast.success('Purchase deleted');
		}
	}

	function goBack() {
		window.location.href = '/apps/purchase-tracker';
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	// Local form handlers for unauthenticated users
	function handleLocalCreatePurchase(e: SubmitEvent) {
		e.preventDefault();
		if (!currentItem) return;

		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const purchaseId = addPurchaseRecord(
			currentItem.id,
			parseFloat(formData.get('quantity') as string),
			parseFloat(formData.get('cost') as string),
			currentItem.defaultCurrency || 'USD',
			formData.get('date') as string,
			(formData.get('location') as string) || undefined,
			(formData.get('paymentMethod') as string) || undefined,
			(formData.get('notes') as string) || undefined
		);

		toast.success('Purchase saved (saved locally)');
		createDialogOpen = false;
		costInput = '';
		form.reset();
	}

	function handleLocalUpdatePurchase(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedPurchase || !currentItem) return;

		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		updatePurchaseRecord(selectedPurchase.id, {
			quantity: parseFloat(formData.get('quantity') as string),
			cost: parseFloat(formData.get('cost') as string),
			currency: currentItem.defaultCurrency || 'USD',
			date: formData.get('date') as string,
			location: (formData.get('location') as string) || undefined,
			paymentMethod: (formData.get('paymentMethod') as string) || undefined,
			notes: (formData.get('notes') as string) || undefined
		});

		toast.success('Purchase updated (saved locally)');
		editDialogOpen = false;
		selectedPurchase = null;
		editCostInput = '';
	}
</script>

<RouteHead
	title={currentItem ? `${currentItem.name} - Purchases` : 'Purchases'}
	description="Manage purchase records for this item"
	route="/apps/purchase-tracker/{itemId}"
/>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" onclick={goBack}>
				<ArrowLeft class="size-4" />
			</Button>
			<div>
				<h2 class="text-2xl font-semibold">{currentItem?.name || 'Item Not Found'}</h2>
				{#if currentItem}
					<p class="text-muted-foreground text-sm">
						{categories.find((c) => c.id === currentItem.category)?.name || currentItem.category}
						{#if currentItem.description}
							• {currentItem.description}
						{/if}
					</p>
				{/if}
			</div>
		</div>

		{#if currentItem}
			<Button onclick={openCreateDialog}>
				<CirclePlus class="mr-2 size-4" />
				Add Purchase
			</Button>
		{/if}
	</div>

	{#if !currentItem}
		<Card>
			<CardContent class="pt-6">
				<p class="text-muted-foreground text-center">Item not found.</p>
			</CardContent>
		</Card>
	{:else if itemPurchases.length === 0}
		<Card>
			<CardContent class="pt-6">
				<p class="text-muted-foreground text-center">
					No purchases yet. Click "Add Purchase" to get started.
				</p>
			</CardContent>
		</Card>
	{:else}
		<Card>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Date</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Cost</TableHead>
						<TableHead>Cost per Unit</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Payment Method</TableHead>
						<TableHead>Notes</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each itemPurchases as purchase (purchase.id)}
						<TableRow>
							<TableCell>{formatDate(purchase.date)}</TableCell>
							<TableCell>
								{purchase.quantity}
								{currentItem.defaultUnit || ''}
							</TableCell>
							<TableCell class="font-medium">
								{formatCurrency(purchase.cost, purchase.currency)}
							</TableCell>
							<TableCell class="text-muted-foreground">
								{purchase.quantity > 0
									? formatCurrency(purchase.cost / purchase.quantity, purchase.currency)
									: '-'}
							</TableCell>
							<TableCell class="text-muted-foreground">
								{purchase.location || '-'}
							</TableCell>
							<TableCell class="text-muted-foreground">
								{purchase.paymentMethod || '-'}
							</TableCell>
							<TableCell class="text-muted-foreground">
								{purchase.notes || '-'}
							</TableCell>
							<TableCell class="text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="icon" onclick={() => openEditDialog(purchase)}>
										<FilePen class="size-4" />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => handleDelete(purchase.id)}>
										<Trash2 class="size-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</Card>

		<!-- Summary Card -->
		<div class="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Total Purchases</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-2xl font-bold">{itemPurchases.length}</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Total Quantity</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-2xl font-bold">
						{itemPurchases.reduce((sum, p) => sum + p.quantity, 0)}
						{currentItem.defaultUnit || ''}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Total Spent</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-2xl font-bold">
						{formatCurrency(
							itemPurchases.reduce((sum, p) => sum + p.cost, 0),
							currentItem.defaultCurrency || 'USD'
						)}
					</p>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>

<!-- Create Purchase Dialog -->
{#if currentItem}
	<Dialog open={createDialogOpen} onOpenChange={(open) => (createDialogOpen = open)}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Add New Purchase</DialogTitle>
				<DialogDescription>Record a new purchase for {currentItem.name}.</DialogDescription>
			</DialogHeader>

			<form
				{...currentUser
					? createPurchaseForm.enhance(async ({ form, submit }) => {
							try {
								await submit();
								const result = createPurchaseForm.result as
									| { success: boolean; purchase: PurchaseRecord }
									| undefined;
								if (currentUser && result?.purchase) {
									purchases.current = [...purchases.current, result.purchase];
								}
								toast.success('Purchase created successfully');
								createDialogOpen = false;
								costInput = '';
								form.reset();
							} catch (error) {
								toast.error('Failed to create purchase');
							}
						})
					: {}}
				onsubmit={currentUser ? undefined : handleLocalCreatePurchase}
			>
				<input type="hidden" name="itemId" value={currentItem.id} />

				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="create-quantity">Quantity</Label>
						<Input
							id="create-quantity"
							name="quantity"
							type="number"
							step="0.01"
							required
							placeholder={currentItem.defaultUnit ? `in ${currentItem.defaultUnit}` : ''}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="create-cost">Cost ({currentItem.defaultCurrency || 'USD'})</Label>
						<Input
							id="create-cost"
							name="cost"
							type="number"
							step="0.01"
							required
							bind:value={costInput}
						/>
						{#if formattedCost}
							<p class="text-muted-foreground text-sm">= {formattedCost}</p>
						{/if}
					</div>

					<div class="grid gap-2">
						<Label for="create-date">Date</Label>
						<Input
							id="create-date"
							name="date"
							type="date"
							value={new Date().toISOString().split('T')[0]}
							required
						/>
					</div>

					<div class="grid gap-2">
						<Label for="create-location">Location (optional)</Label>
						<Input id="create-location" name="location" />
					</div>

					<div class="grid gap-2">
						<Label for="create-payment">Payment Method (optional)</Label>
						<Input id="create-payment" name="paymentMethod" />
					</div>

					<div class="grid gap-2">
						<Label for="create-notes">Notes (optional)</Label>
						<Input id="create-notes" name="notes" />
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
						Cancel
					</Button>
					<Button type="submit">Create Purchase</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Edit Purchase Dialog -->
	<Dialog open={editDialogOpen} onOpenChange={(open) => (editDialogOpen = open)}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Edit Purchase</DialogTitle>
				<DialogDescription>Update the purchase details.</DialogDescription>
			</DialogHeader>

			{#if selectedPurchase}
				<form
					{...currentUser
						? updatePurchaseForm.enhance(async ({ form, submit }) => {
								try {
									await submit();
									const result = updatePurchaseForm.result as
										| { success: boolean; purchase: PurchaseRecord }
										| undefined;
									if (currentUser && result?.purchase && selectedPurchase) {
										const purchaseId = selectedPurchase.id;
										purchases.current = purchases.current.map((p) =>
											p.id === purchaseId ? result.purchase : p
										);
									}
									toast.success('Purchase updated successfully');
									editDialogOpen = false;
									selectedPurchase = null;
									editCostInput = '';
								} catch (error) {
									toast.error('Failed to update purchase');
								}
							})
						: {}}
					onsubmit={currentUser ? undefined : handleLocalUpdatePurchase}
				>
					<input type="hidden" name="id" value={selectedPurchase.id} />

					<div class="grid gap-4 py-4">
						<div class="grid gap-2">
							<Label for="edit-quantity">Quantity</Label>
							<Input
								id="edit-quantity"
								name="quantity"
								type="number"
								step="0.01"
								value={selectedPurchase.quantity}
								required
							/>
						</div>

						<div class="grid gap-2">
							<Label for="edit-cost">Cost ({currentItem.defaultCurrency || 'USD'})</Label>
							<Input
								id="edit-cost"
								name="cost"
								type="number"
								step="0.01"
								required
								bind:value={editCostInput}
							/>
							{#if editFormattedCost}
								<p class="text-muted-foreground text-sm">= {editFormattedCost}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="edit-date">Date</Label>
							<Input
								id="edit-date"
								name="date"
								type="date"
								value={selectedPurchase.date}
								required
							/>
						</div>

						<div class="grid gap-2">
							<Label for="edit-location">Location (optional)</Label>
							<Input id="edit-location" name="location" value={selectedPurchase.location || ''} />
						</div>

						<div class="grid gap-2">
							<Label for="edit-payment">Payment Method (optional)</Label>
							<Input
								id="edit-payment"
								name="paymentMethod"
								value={selectedPurchase.paymentMethod || ''}
							/>
						</div>

						<div class="grid gap-2">
							<Label for="edit-notes">Notes (optional)</Label>
							<Input id="edit-notes" name="notes" value={selectedPurchase.notes || ''} />
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onclick={() => {
								editDialogOpen = false;
								selectedPurchase = null;
							}}
						>
							Cancel
						</Button>
						<Button type="submit">Update Purchase</Button>
					</DialogFooter>
				</form>
			{/if}
		</DialogContent>
	</Dialog>
{/if}
