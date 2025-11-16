<script lang="ts">
	import RouteHead from '@/blocks/RouteHead.svelte';
	import {
		items,
		getAllCategories,
		deleteItem,
		addItem,
		updateItem,
		type Item
	} from './states.svelte';
	import { getCurrentUser, createItemForm, updateItemForm, getItems } from '$lib/remote';
	import { Card } from '$lib/components/ui/card';
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
	import * as Select from '$lib/components/ui/select';
	import { CirclePlus, Trash2, FilePen } from 'lucide-svelte';
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

	// Dialog states
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let selectedItem = $state<Item | null>(null);

	// Form state for Select components
	let selectedCategory = $state('groceries');
	let selectedCurrency = $state('USD');
	let editCategory = $state('');
	let editCurrency = $state('USD');

	// Load server data if authenticated
	$effect(() => {
		if (currentUser) {
			getItems().then((serverItems) => {
				if (serverItems) {
					items.current = serverItems;
				}
			});
		}
	});

	function openCreateDialog() {
		createDialogOpen = true;
	}

	function openEditDialog(item: Item) {
		selectedItem = item;
		editCategory = item.category;
		editCurrency = item.defaultCurrency || 'USD';
		editDialogOpen = true;
	}

	function handleDelete(itemId: string) {
		if (confirm('Are you sure you want to delete this item and all its purchases?')) {
			deleteItem(itemId);
			toast.success('Item deleted');
		}
	}

	function navigateToPurchases(itemId: string) {
		window.location.href = `/apps/purchase-tracker/${itemId}`;
	}

	// Local form handlers for unauthenticated users
	function handleLocalCreateItem(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const itemId = addItem(
			formData.get('name') as string,
			selectedCategory,
			(formData.get('description') as string) || undefined,
			(formData.get('defaultUnit') as string) || undefined,
			selectedCurrency
		);

		toast.success('Item created successfully (saved locally)');
		createDialogOpen = false;
		selectedCategory = 'groceries';
		selectedCurrency = 'USD';
		form.reset();
	}

	function handleLocalUpdateItem(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedItem) return;

		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		updateItem(selectedItem.id, {
			name: formData.get('name') as string,
			category: editCategory,
			description: (formData.get('description') as string) || undefined,
			defaultUnit: (formData.get('defaultUnit') as string) || undefined,
			defaultCurrency: editCurrency
		});

		toast.success('Item updated successfully (saved locally)');
		editDialogOpen = false;
		selectedItem = null;
	}
</script>

<RouteHead
	title="Purchase Tracker - Items"
	description="Manage your purchase tracking items"
	route="/apps/purchase-tracker"
/>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Items</h2>
		<Button onclick={openCreateDialog}>
			<CirclePlus class="mr-2 size-4" />
			Add Item
		</Button>
	</div>

	{#if items.current.length === 0}
		<Card class="p-6">
			<p class="text-muted-foreground text-center">
				No items yet. Click "Add Item" to get started.
			</p>
		</Card>
	{:else}
		<Card>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Default Unit</TableHead>
						<TableHead>Default Currency</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each items.current as item (item.id)}
						<TableRow
							class="hover:bg-muted/50 cursor-pointer"
							onclick={() => navigateToPurchases(item.id)}
						>
							<TableCell class="font-medium">{item.name}</TableCell>
							<TableCell>
								{categories.find((c) => c.id === item.category)?.name || item.category}
							</TableCell>
							<TableCell class="text-muted-foreground">
								{item.description || '-'}
							</TableCell>
							<TableCell>{item.defaultUnit || '-'}</TableCell>
							<TableCell>{item.defaultCurrency || 'USD'}</TableCell>
							<TableCell class="text-right">
								<div class="flex justify-end gap-2">
									<Button
										variant="ghost"
										size="icon"
										onclick={(e) => {
											e.stopPropagation();
											openEditDialog(item);
										}}
									>
										<FilePen class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onclick={(e) => {
											e.stopPropagation();
											handleDelete(item.id);
										}}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</Card>
	{/if}
</div>

<!-- Create Item Dialog -->
<Dialog open={createDialogOpen} onOpenChange={(open) => (createDialogOpen = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Add New Item</DialogTitle>
			<DialogDescription>Create a new item to track purchases for.</DialogDescription>
		</DialogHeader>

		<form
			{...currentUser
				? createItemForm.enhance(async ({ form, submit }) => {
						try {
							await submit();
							// Check result after submission
							const result = createItemForm.result as { success: boolean; item: Item } | undefined;
							if (currentUser && result?.item) {
								items.current = [...items.current, result.item];
							}
							toast.success('Item created successfully');
							createDialogOpen = false;
							selectedCategory = 'groceries';
							selectedCurrency = 'USD';
							form.reset();
						} catch (error) {
							toast.error('Failed to create item');
						}
					})
				: {}}
			onsubmit={currentUser ? undefined : handleLocalCreateItem}
		>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="create-name">Name</Label>
					<Input id="create-name" name="name" required />
				</div>

				<div class="grid gap-2">
					<Label for="create-category">Category</Label>
					{#if currentUser}
						{@const categoryIssues = createItemForm.fields.category.issues()}
						{#if categoryIssues}
							{#each categoryIssues as issue, index (index)}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						{/if}
					{/if}
					<Select.Root type="single" bind:value={selectedCategory} name="category" required>
						<Select.Trigger id="create-category">
							{categories.find((c) => c.id === selectedCategory)?.name || 'Select category'}
						</Select.Trigger>
						<Select.Content>
							{#each categories as category (category.id)}
								<Select.Item value={category.id} label={`${category.icon} ${category.name}`}>
									{category.icon}
									{category.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="grid gap-2">
					<Label for="create-description">Description (optional)</Label>
					<Input id="create-description" name="description" />
				</div>

				<div class="grid gap-2">
					<Label for="create-unit">Default Unit (optional)</Label>
					<Input id="create-unit" name="defaultUnit" placeholder="e.g., kg, L, pcs" />
				</div>

				<div class="grid gap-2">
					<Label for="create-currency">Default Currency</Label>
					<Select.Root type="single" bind:value={selectedCurrency} name="defaultCurrency">
						<Select.Trigger id="create-currency">
							{selectedCurrency === 'USD'
								? 'USD - US Dollar'
								: selectedCurrency === 'EUR'
									? 'EUR - Euro'
									: selectedCurrency === 'GBP'
										? 'GBP - British Pound'
										: selectedCurrency === 'JPY'
											? 'JPY - Japanese Yen'
											: selectedCurrency === 'CAD'
												? 'CAD - Canadian Dollar'
												: selectedCurrency === 'AUD'
													? 'AUD - Australian Dollar'
													: selectedCurrency === 'NGN'
														? 'NGN - Nigerian Naira'
														: 'Select currency'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="USD" label="USD - US Dollar">USD - US Dollar</Select.Item>
							<Select.Item value="EUR" label="EUR - Euro">EUR - Euro</Select.Item>
							<Select.Item value="GBP" label="GBP - British Pound">GBP - British Pound</Select.Item>
							<Select.Item value="JPY" label="JPY - Japanese Yen">JPY - Japanese Yen</Select.Item>
							<Select.Item value="CAD" label="CAD - Canadian Dollar"
								>CAD - Canadian Dollar</Select.Item
							>
							<Select.Item value="AUD" label="AUD - Australian Dollar"
								>AUD - Australian Dollar</Select.Item
							>
							<Select.Item value="NGN" label="NGN - Nigerian Naira"
								>NGN - Nigerian Naira</Select.Item
							>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Create Item</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Edit Item Dialog -->
<Dialog open={editDialogOpen} onOpenChange={(open) => (editDialogOpen = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Item</DialogTitle>
			<DialogDescription>Update the item details.</DialogDescription>
		</DialogHeader>

		{#if selectedItem}
			<form
				{...currentUser
					? updateItemForm.enhance(async ({ form, submit }) => {
							try {
								await submit();
								const result = updateItemForm.result as
									| { success: boolean; item: Item }
									| undefined;
								if (currentUser && result?.item && selectedItem) {
									const itemId = selectedItem.id;
									items.current = items.current.map((i) => (i.id === itemId ? result.item : i));
								}
								toast.success('Item updated successfully');
								editDialogOpen = false;
								selectedItem = null;
							} catch (error) {
								toast.error('Failed to update item');
							}
						})
					: {}}
				onsubmit={currentUser ? undefined : handleLocalUpdateItem}
			>
				<input type="hidden" name="id" value={selectedItem.id} />

				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="edit-name">Name</Label>
						<Input id="edit-name" name="name" value={selectedItem.name} required />
					</div>

					<div class="grid gap-2">
						<Label for="edit-category">Category</Label>
						<Select.Root type="single" bind:value={editCategory} name="category" required>
							<Select.Trigger id="edit-category">
								{categories.find((c) => c.id === editCategory)?.name || 'Select category'}
							</Select.Trigger>
							<Select.Content>
								{#each categories as category (category.id)}
									<Select.Item value={category.id} label={`${category.icon} ${category.name}`}>
										{category.icon}
										{category.name}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="grid gap-2">
						<Label for="edit-description">Description (optional)</Label>
						<Input
							id="edit-description"
							name="description"
							value={selectedItem.description || ''}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="edit-unit">Default Unit (optional)</Label>
						<Input
							id="edit-unit"
							name="defaultUnit"
							value={selectedItem.defaultUnit || ''}
							placeholder="e.g., kg, L, pcs"
						/>
					</div>

					<div class="grid gap-2">
						<Label for="edit-currency">Default Currency</Label>
						<Select.Root type="single" bind:value={editCurrency} name="defaultCurrency">
							<Select.Trigger id="edit-currency">
								{editCurrency === 'USD'
									? 'USD - US Dollar'
									: editCurrency === 'EUR'
										? 'EUR - Euro'
										: editCurrency === 'GBP'
											? 'GBP - British Pound'
											: editCurrency === 'JPY'
												? 'JPY - Japanese Yen'
												: editCurrency === 'CAD'
													? 'CAD - Canadian Dollar'
													: editCurrency === 'AUD'
														? 'AUD - Australian Dollar'
														: editCurrency === 'NGN'
															? 'NGN - Nigerian Naira'
															: 'Select currency'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="USD" label="USD - US Dollar">USD - US Dollar</Select.Item>
								<Select.Item value="EUR" label="EUR - Euro">EUR - Euro</Select.Item>
								<Select.Item value="GBP" label="GBP - British Pound"
									>GBP - British Pound</Select.Item
								>
								<Select.Item value="JPY" label="JPY - Japanese Yen">JPY - Japanese Yen</Select.Item>
								<Select.Item value="CAD" label="CAD - Canadian Dollar"
									>CAD - Canadian Dollar</Select.Item
								>
								<Select.Item value="AUD" label="AUD - Australian Dollar"
									>AUD - Australian Dollar</Select.Item
								>
								<Select.Item value="NGN" label="NGN - Nigerian Naira"
									>NGN - Nigerian Naira</Select.Item
								>
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							editDialogOpen = false;
							selectedItem = null;
						}}
					>
						Cancel
					</Button>
					<Button type="submit">Update Item</Button>
				</DialogFooter>
			</form>
		{/if}
	</DialogContent>
</Dialog>
