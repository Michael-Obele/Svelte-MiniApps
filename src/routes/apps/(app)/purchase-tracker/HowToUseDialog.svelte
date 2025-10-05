<script lang="ts">
	import { Package, ShoppingCart, History, HelpCircle, Sparkles } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import * as Dialog from '@/ui/dialog';
	import * as Tabs from '@/ui/tabs';
	import { Badge } from '@/ui/badge';

	interface Props {
		open: boolean;
		onClose?: () => void;
	}

	let { open = $bindable(false), onClose }: Props = $props();
	let activeTab = $state('start');
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-[650px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<HelpCircle class="h-5 w-5" />
				Quick Guide
			</Dialog.Title>
			<Dialog.Description>Simple steps to track your purchases effectively</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root bind:value={activeTab} class="py-4">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="start">
					<Package class="mr-1.5 h-4 w-4" />
					Start
				</Tabs.Trigger>
				<Tabs.Trigger value="record">
					<ShoppingCart class="mr-1.5 h-4 w-4" />
					Record
				</Tabs.Trigger>
				<Tabs.Trigger value="tips">
					<Sparkles class="mr-1.5 h-4 w-4" />
					Tips
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Getting Started Tab -->
			<Tabs.Content value="start" class="space-y-4 pt-4">
				<div class="space-y-4">
					<div class="flex gap-3">
						<div
							class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400"
						>
							1
						</div>
						<div class="flex-1">
							<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">Add an Item</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Click <strong>"Add Item"</strong> button. Name it something like "Coffee" or "Gas".
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<div
							class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400"
						>
							2
						</div>
						<div class="flex-1">
							<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">Pick a Category</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Choose from Groceries, Fuel, Dining, etc. or create your own.
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<div
							class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400"
						>
							3
						</div>
						<div class="flex-1">
							<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">That's It!</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								You're ready to track purchases. Set units and currency if you want.
							</p>
						</div>
					</div>
				</div>

				<div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/50">
					<p class="text-sm text-gray-700 dark:text-gray-300">
						<strong>Pro tip:</strong> Start with just one or two items you buy frequently. You can always
						add more later!
					</p>
				</div>
			</Tabs.Content>

			<!-- Recording Purchases Tab -->
			<Tabs.Content value="record" class="space-y-4 pt-4">
				<div class="space-y-4">
					<div class="flex gap-3">
						<div
							class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600 dark:bg-green-900 dark:text-green-400"
						>
							1
						</div>
						<div class="flex-1">
							<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">Find Your Item</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								On the Items tab, click the <strong>⋮</strong> menu on any item card.
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<div
							class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600 dark:bg-green-900 dark:text-green-400"
						>
							2
						</div>
						<div class="flex-1">
							<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">Add Purchase</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Enter how much you bought and what it cost. Date is set to today automatically.
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<div
							class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600 dark:bg-green-900 dark:text-green-400"
						>
							3
						</div>
						<div class="flex-1">
							<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">Save It</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Click Save. Your purchase is recorded and statistics update instantly!
							</p>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<h4 class="font-semibold text-gray-900 dark:text-white">Optional Details:</h4>
					<div class="grid gap-2 text-sm">
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="font-normal">Location</Badge>
							<span class="text-gray-600 dark:text-gray-400">Where you bought it</span>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="font-normal">Payment</Badge>
							<span class="text-gray-600 dark:text-gray-400">Cash, Card, etc.</span>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="font-normal">Notes</Badge>
							<span class="text-gray-600 dark:text-gray-400">Any extra details</span>
						</div>
					</div>
				</div>
			</Tabs.Content>

			<!-- Tips Tab -->
			<Tabs.Content value="tips" class="space-y-4 pt-4">
				<div class="space-y-3">
					<div class="rounded-lg border p-3">
						<h4 class="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
							<History class="h-4 w-4" />
							View Your Data
						</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Switch between <strong>Items</strong> and <strong>Purchase History</strong> tabs to see
							different views.
						</p>
					</div>

					<div class="rounded-lg border p-3">
						<h4 class="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
							<Sparkles class="h-4 w-4" />
							Check Statistics
						</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Each item card shows total spent and number of purchases at a glance.
						</p>
					</div>

					<div class="rounded-lg border p-3">
						<h4 class="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
							<Package class="h-4 w-4" />
							Edit Anytime
						</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Click the <strong>⋮</strong> menu to edit items or view detailed history.
						</p>
					</div>
				</div>

				<div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/50">
					<h4 class="mb-2 font-semibold text-purple-900 dark:text-purple-300">Quick Tips:</h4>
					<ul class="space-y-1.5 text-sm text-purple-800 dark:text-purple-200">
						<li class="flex items-start gap-2">
							<span>•</span>
							<span>Record purchases regularly for accurate tracking</span>
						</li>
						<li class="flex items-start gap-2">
							<span>•</span>
							<span>Use consistent categories for easier analysis</span>
						</li>
						<li class="flex items-start gap-2">
							<span>•</span>
							<span>Backup your data if logged in (cloud icon in header)</span>
						</li>
						<li class="flex items-start gap-2">
							<span>•</span>
							<span>Works offline - no internet needed!</span>
						</li>
					</ul>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					open = false;
					onClose?.();
				}}>Got It!</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
