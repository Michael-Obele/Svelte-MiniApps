<script lang="ts">
	import { History, Edit, Trash2, TrendingUp, Package, Calendar } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Card, CardContent } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog';

	import type { Item, PurchaseRecord } from './states.svelte';
	import * as purchaseState from './states.svelte';

	interface Props {
		open: boolean;
		selectedItemForHistory?: Item | null;
		purchases: PurchaseRecord[];
		stats: {
			totalPurchases: number;
			totalQuantity: number;
			totalSpent: number;
			averageCost: number;
		};
		onEditPurchase: (purchase: PurchaseRecord) => void;
		onDeletePurchase: (purchase: PurchaseRecord) => void;
		onAddFirstPurchase: () => void;
		onClose: () => void;
	}

	let {
		open = $bindable(false),
		selectedItemForHistory,
		purchases,
		stats,
		onEditPurchase,
		onDeletePurchase,
		onAddFirstPurchase,
		onClose
	}: Props = $props();

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD'
		}).format(amount);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto w-[90vw] md:w-[60vw] lg:w-[50vw]">
		<Dialog.Header class="space-y-3">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<History class="h-5 w-5 text-primary" />
				</div>
				<div>
					<Dialog.Title class="text-xl font-semibold">Purchase History</Dialog.Title>
					<Dialog.Description class="text-muted-foreground">
						Complete purchase records for <span class="font-medium text-foreground">{selectedItemForHistory?.name}</span>
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		{#if selectedItemForHistory}
			<div class="space-y-6 py-6">
				<!-- Stats Cards -->
				<div class="flex flex-wrap gap-4">
					<Card class="flex-1 min-w-[200px]">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
									<Package class="h-4 w-4 text-muted-foreground" />
								</div>
								<div>
									<div class="text-2xl font-bold">{stats.totalPurchases}</div>
									<div class="text-xs text-muted-foreground">Total Purchases</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card class="flex-1 min-w-[200px]">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
									<TrendingUp class="h-4 w-4 text-muted-foreground" />
								</div>
								<div>
									<div class="text-2xl font-bold">{stats.totalQuantity.toFixed(1)}</div>
									<div class="text-xs text-muted-foreground">Total Quantity</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card class="flex-1 min-w-[200px]">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
									<TrendingUp class="h-4 w-4 text-muted-foreground" />
								</div>
								<div>
									<div class="text-lg font-bold leading-tight">
										{formatCurrency(stats.totalSpent, selectedItemForHistory.defaultCurrency || 'USD')}
									</div>
									<div class="text-xs text-muted-foreground">Total Spent</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card class="flex-1 min-w-[200px]">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
									<Calendar class="h-4 w-4 text-muted-foreground" />
								</div>
								<div>
									<div class="text-lg font-bold leading-tight">
										{stats.averageCost > 0
											? formatCurrency(stats.averageCost, selectedItemForHistory.defaultCurrency || 'USD')
											: 'N/A'}
									</div>
									<div class="text-xs text-muted-foreground">Avg Cost</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Enhanced Purchase Records -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold text-foreground">Purchase Records</h3>
						<Badge variant="secondary" class="text-xs">
							{purchases.length} record{purchases.length !== 1 ? 's' : ''}
						</Badge>
					</div>

					{#each purchases as purchase (purchase.id)}
						<Card class="transition-all duration-200 hover:shadow-sm">
							<CardContent class="p-4">
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1 min-w-0 space-y-2">
										<div class="flex flex-wrap items-center gap-3 text-sm">
											<div class="flex items-center gap-2">
												<Calendar class="h-4 w-4 text-muted-foreground" />
												<span class="font-medium">{formatDate(purchase.date)}</span>
											</div>
											<Badge variant="outline" class="text-xs">
												{purchase.quantity} {selectedItemForHistory.defaultUnit || 'units'}
											</Badge>
											<div class="flex items-center gap-1">
												<span class="font-semibold">
													{formatCurrency(purchase.cost, purchase.currency)}
												</span>
											</div>
										</div>

										{#if purchase.location || purchase.paymentMethod}
											<div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
												{#if purchase.location}
													<span>📍 {purchase.location}</span>
												{/if}
												{#if purchase.paymentMethod}
													<span>💳 {purchase.paymentMethod}</span>
												{/if}
											</div>
										{/if}

										{#if purchase.notes}
											<div class="rounded-md bg-muted/50 p-2">
												<p class="text-sm text-muted-foreground italic">"{purchase.notes}"</p>
											</div>
										{/if}
									</div>

									<div class="flex gap-1">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => onEditPurchase(purchase)}
											class="h-8 w-8 p-0"
										>
											<Edit class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => onDeletePurchase(purchase)}
											class="h-8 w-8 p-0 text-red-500"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>

				{#if purchases.length === 0}
					<Card class="border-dashed">
						<CardContent class="py-12">
							<div class="text-center space-y-4">
								<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
									<History class="h-8 w-8 text-muted-foreground" />
								</div>
								<div class="space-y-2">
									<h3 class="text-lg font-semibold text-foreground">No purchases yet</h3>
									<p class="text-sm text-muted-foreground max-w-sm mx-auto">
										Start tracking your purchases for {selectedItemForHistory.name} to see detailed history and analytics here.
									</p>
								</div>
								<Button
									onclick={onAddFirstPurchase}
									class="mt-4"
								>
									<Package class="mr-2 h-4 w-4" />
									Add First Purchase
								</Button>
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}

		<Dialog.Footer >
			<Button variant="outline" onclick={onClose}>
				Close
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>