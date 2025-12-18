<script lang="ts">
	import { Plus, ChevronDown, Package } from '@lucide/svelte';
	import { Input } from '@/ui/input';
	import { Button } from '@/ui/button';
	import * as DropdownMenu from '@/ui/dropdown-menu';

	import type { Item } from '../states.svelte';
	import * as purchaseState from '../states.svelte';
	import ItemCard from './ItemCard.svelte';

	interface Props {
		items: Item[];
		searchQuery: string;
		selectedCategory: string;
		onSearchChange: (query: string) => void;
		onCategoryChange: (category: string) => void;
		onAddItem: () => void;
		onEditItem: (item: Item) => void;
		onAddPurchase: (item: Item) => void;
		onViewHistory: (item: Item) => void;
		onDeleteItem: (item: Item) => void;
	}

	let {
		items,
		searchQuery = $bindable(''),
		selectedCategory = $bindable('all'),
		onSearchChange,
		onCategoryChange,
		onAddItem,
		onEditItem,
		onAddPurchase,
		onViewHistory,
		onDeleteItem
	}: Props = $props();

	// Filtered items based on search and category - using $derived.by for complex filtering logic
	let filteredItems = $derived.by(() => {
		let filtered = items;

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Filter by category
		if (selectedCategory !== 'all') {
			filtered = filtered.filter((item) => item.category === selectedCategory);
		}

		return filtered;
	});

	// Available categories
	let availableCategories = $derived(purchaseState.getAllCategories());
</script>

<!-- Search and Filter -->
<div class="mb-6 flex flex-col gap-4 sm:flex-row">
	<div class="flex-1">
		<Input
			placeholder="Search items..."
			bind:value={searchQuery}
			oninput={(e) => onSearchChange(e.currentTarget.value)}
			class="w-full"
		/>
	</div>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="outline" class="min-w-[140px]">
				{selectedCategory === 'all'
					? 'All Categories'
					: availableCategories.find((c) => c.id === selectedCategory)?.name || 'All Categories'}
				<ChevronDown class="ml-2 h-4 w-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onclick={() => onCategoryChange('all')}>All Categories</DropdownMenu.Item>
			{#each availableCategories as category}
				<DropdownMenu.Item onclick={() => onCategoryChange(category.id)}>
					{category.icon}
					{category.name}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Button onclick={onAddItem}>
		<Plus class="mr-2 h-4 w-4" />
		Add Item
	</Button>
</div>

<!-- Items Grid -->
{#if filteredItems.length > 0}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredItems as item (item.id)}
			<ItemCard
				{item}
				onEdit={onEditItem}
				{onAddPurchase}
				{onViewHistory}
				onDelete={onDeleteItem}
			/>
		{/each}
	</div>
{:else}
	<div class="py-12 text-center">
		<Package class="mx-auto mb-4 h-12 w-12 text-gray-400" />
		<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No items found</h3>
		<p class="mb-4 text-gray-600 dark:text-gray-400">
			{searchQuery || selectedCategory !== 'all'
				? 'Try adjusting your search or filters.'
				: 'Get started by adding your first item.'}
		</p>
		<Button onclick={onAddItem}>
			<Plus class="mr-2 h-4 w-4" />
			{searchQuery || selectedCategory !== 'all' ? 'Add New Item' : 'Add Your First Item'}
		</Button>
	</div>
{/if}
