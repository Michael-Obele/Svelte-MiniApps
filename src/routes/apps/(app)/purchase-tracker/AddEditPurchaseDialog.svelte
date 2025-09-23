<script lang="ts">
	import { ChevronDown, Edit } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import * as DropdownMenu from '@/ui/dropdown-menu';
	import * as Dialog from '@/ui/dialog';

	import type { Item, PurchaseRecord } from './states.svelte';

	interface Props {
		open: boolean;
		editingPurchase?: PurchaseRecord | null;
		selectedItemForPurchase?: Item | null;
		purchaseQuantity: number | undefined;
		purchaseCost: number | undefined;
		purchaseCurrency: string;
		purchaseDate: string;
		purchaseLocation: string;
		purchasePaymentMethod: string;
		purchaseNotes: string;
		currencyOptions: Array<{ code: string; name: string; symbol: string; icon?: string }>;
		availableCategories: Array<{ id: string; name: string; icon: string }>;
		onSave: () => void;
		onCancel: () => void;
	}

	let {
		open = $bindable(false),
		editingPurchase,
		selectedItemForPurchase,
		purchaseQuantity = $bindable<number | undefined>(undefined),
		purchaseCost = $bindable<number | undefined>(undefined),
		purchaseCurrency = $bindable('USD'),
		purchaseDate = $bindable(new Date().toISOString().split('T')[0]),
		purchaseLocation = $bindable(''),
		purchasePaymentMethod = $bindable(''),
		purchaseNotes = $bindable(''),
		currencyOptions,
		availableCategories,
		onSave,
		onCancel
	}: Props = $props();
</script>

<Dialog.Root bind:open>
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
						{availableCategories.find((c) => c.id === selectedItemForPurchase!.category)?.name}
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
								<DropdownMenu.Item onclick={() => purchaseCurrency = currency.code}>
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
			<Button variant="outline" onclick={onCancel}>
				Cancel
			</Button>
			<Button onclick={onSave}>
				{editingPurchase ? 'Update Purchase' : 'Add Purchase'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>