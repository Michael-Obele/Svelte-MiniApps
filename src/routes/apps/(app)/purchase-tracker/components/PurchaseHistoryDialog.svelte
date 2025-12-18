<script lang="ts">
	import { History, Edit, Trash2, TrendingUp, Package, Calendar } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Card, CardContent } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog';

	import type { Item, PurchaseRecord } from '../states.svelte';
	import * as purchaseState from '../states.svelte';

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
	<Dialog.Content class="max-h-[90vh] w-[90vw] overflow-y-auto md:w-[60vw] lg:w-[50vw]">
		<Dialog.Header class="space-y-3">
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
					<History class="text-primary h-5 w-5" />
				</div>
				<div>
					<Dialog.Title class="text-xl font-semibold">Purchase History</Dialog.Title>
					<Dialog.Description class="text-muted-foreground">
						Complete purchase records for <span class="text-foreground font-medium"
							>{selectedItemForHistory?.name}</span
						>
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		{#if selectedItemForHistory}
			<div class="space-y-6 py-6">
				<!-- Stats Cards -->
				<div class="flex flex-wrap gap-4">
					<Card class="min-w-[200px] flex-1">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
									<Package class="text-muted-foreground h-4 w-4" />
								</div>
								<div>
									<div class="text-2xl font-bold">{stats.totalPurchases}</div>
									<div class="text-muted-foreground text-xs">Total Purchases</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card class="min-w-[200px] flex-1">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
									<TrendingUp class="text-muted-foreground h-4 w-4" />
								</div>
								<div>
									<div class="text-2xl font-bold">{stats.totalQuantity.toFixed(1)}</div>
									<div class="text-muted-foreground text-xs">Total Quantity</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card class="min-w-[200px] flex-1">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
									<TrendingUp class="text-muted-foreground h-4 w-4" />
								</div>
								<div>
									<div class="text-lg leading-tight font-bold">
										{formatCurrency(
											stats.totalSpent,
											selectedItemForHistory.defaultCurrency || 'USD'
										)}
									</div>
									<div class="text-muted-foreground text-xs">Total Spent</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card class="min-w-[200px] flex-1">
						<CardContent class="p-4">
							<div class="flex items-center gap-3">
								<div class="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
									<Calendar class="text-muted-foreground h-4 w-4" />
								</div>
								<div>
									<div class="text-lg leading-tight font-bold">
										{stats.averageCost > 0
											? formatCurrency(
													stats.averageCost,
													selectedItemForHistory.defaultCurrency || 'USD'
												)
											: 'N/A'}
									</div>
									<div class="text-muted-foreground text-xs">Avg Cost</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Enhanced Purchase Records -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-foreground text-lg font-semibold">Purchase Records</h3>
						<Badge variant="secondary" class="text-xs">
							{purchases.length} record{purchases.length !== 1 ? 's' : ''}
						</Badge>
					</div>

					{#each purchases as purchase (purchase.id)}
						<Card class="transition-all duration-200 hover:shadow-sm">
							<CardContent class="p-4">
								<div class="flex items-start justify-between gap-4">
									<div class="min-w-0 flex-1 space-y-2">
										<div class="flex flex-wrap items-center gap-3 text-sm">
											<div class="flex items-center gap-2">
												<Calendar class="text-muted-foreground h-4 w-4" />
												<span class="font-medium">{formatDate(purchase.date)}</span>
											</div>
											<Badge variant="outline" class="text-xs">
												{purchase.quantity}
												{selectedItemForHistory.defaultUnit || 'units'}
											</Badge>
											<div class="flex items-center gap-1">
												<span class="font-semibold">
													{formatCurrency(purchase.cost, purchase.currency)}
												</span>
											</div>
										</div>

										{#if purchase.location || purchase.paymentMethod}
											<div class="text-muted-foreground flex flex-wrap gap-4 text-xs">
												{#if purchase.location}
													<span>📍 {purchase.location}</span>
												{/if}
												{#if purchase.paymentMethod}
													<span>💳 {purchase.paymentMethod}</span>
												{/if}
											</div>
										{/if}

										{#if purchase.notes}
											<div class="bg-muted/50 rounded-md p-2">
												<p class="text-muted-foreground text-sm italic">"{purchase.notes}"</p>
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
							<div class="space-y-4 text-center">
								<div
									class="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full"
								>
									<History class="text-muted-foreground h-8 w-8" />
								</div>
								<div class="space-y-2">
									<h3 class="text-foreground text-lg font-semibold">No purchases yet</h3>
									<p class="text-muted-foreground mx-auto max-w-sm text-sm">
										Start tracking your purchases for {selectedItemForHistory.name} to see detailed history
										and analytics here.
									</p>
								</div>
								<Button onclick={onAddFirstPurchase} class="mt-4">
									<Package class="mr-2 h-4 w-4" />
									Add First Purchase
								</Button>
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onClose}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
