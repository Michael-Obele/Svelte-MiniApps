<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import * as DropdownMenu from '@/ui/dropdown-menu';
	import * as Dialog from '@/ui/dialog';

	import type { Item } from './states.svelte';

	interface Props {
		open: boolean;
		editingItem?: Item | null;
		itemName: string;
		itemCategory: string;
		itemDescription: string;
		itemDefaultUnit: string;
		itemDefaultCurrency: string;
		availableCategories: Array<{ id: string; name: string; icon: string }>;
		currencyOptions: Array<{ code: string; name: string; symbol: string; icon?: string }>;
		onSave: () => void;
		onCancel: () => void;
	}

	let {
		open = $bindable(false),
		editingItem,
		itemName = $bindable(''),
		itemCategory = $bindable(''),
		itemDescription = $bindable(''),
		itemDefaultUnit = $bindable(''),
		itemDefaultCurrency = $bindable('USD'),
		availableCategories,
		currencyOptions,
		onSave,
		onCancel
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header class="space-y-3 pb-4">
			<Dialog.Title>{editingItem ? 'Edit Item' : 'Add New Item'}</Dialog.Title>
			<Dialog.Description>
				{editingItem ? 'Update the item details.' : 'Create a new item to track purchases for.'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-6 py-6">
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
					<DropdownMenu.Item onclick={() => itemCategory = category.id}>
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
								<DropdownMenu.Item onclick={() => itemDefaultCurrency = currency.code}>
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
			<Button variant="outline" onclick={onCancel}>
				Cancel
			</Button>
			<Button onclick={onSave}>
				{editingItem ? 'Update Item' : 'Add Item'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>