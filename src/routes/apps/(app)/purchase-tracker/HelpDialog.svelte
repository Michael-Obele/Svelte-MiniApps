<script lang="ts">
	import {
		HelpCircle,
		Package,
		ShoppingCart,
		History,
		Settings,
		ChevronDown,
		Cloud,
		DollarSign,
		Edit
	} from '@lucide/svelte';
	import * as Dialog from '@/ui/dialog';
	import { Button } from '@/ui/button';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<HelpCircle class="h-5 w-5" />
				How to Use Purchase Tracker
			</Dialog.Title>
			<Dialog.Description>
				Learn how to track your purchases effectively with step-by-step guidance.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Getting Started -->
			<div>
				<h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<Package class="h-5 w-5" />
					Getting Started
				</h3>
				<div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">1</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Add Your First Item</strong>
							<p>Click the "Add Item" button to create items you want to track purchases for, like "Regular Gasoline", "Weekly Groceries", or "Coffee Beans".</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">2</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Choose a Category</strong>
							<p>Select from predefined categories like Fuel, Groceries, Dining, or create custom categories that fit your spending habits.</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">3</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Set Default Preferences</strong>
							<p>Configure default units (gallons, pounds, etc.) and currency for each item to make data entry faster.</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Recording Purchases -->
			<div>
				<h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<ShoppingCart class="h-5 w-5" />
					Recording Purchases
				</h3>
				<div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-medium text-green-600 dark:text-green-400">1</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Select an Item</strong>
							<p>From the Items tab, click the dropdown button <ChevronDown class="inline h-3 w-3 mx-1" /> on any item card and choose "Add Purchase" to record a new transaction.</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-medium text-green-600 dark:text-green-400">2</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Enter Purchase Details</strong>
							<p>Fill in quantity, cost, date, and optionally add location, payment method, and notes for better tracking.</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-medium text-green-600 dark:text-green-400">3</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Track Over Time</strong>
							<p>Regularly add purchases to build a comprehensive history of your spending patterns and costs.</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Viewing Data -->
			<div>
				<h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<History class="h-5 w-5" />
					Viewing Your Data
				</h3>
				<div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600 dark:text-purple-400">1</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Items Overview</strong>
							<p>The Items tab shows all your tracked items with purchase statistics including total spent and number of purchases.</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600 dark:text-purple-400">2</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Purchase History</strong>
							<p>Switch to the "Purchase History" tab to see a chronological list of all your recorded purchases across all items.</p>
						</div>
					</div>
					<div class="flex gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600 dark:text-purple-400">3</div>
						<div>
							<strong class="text-gray-900 dark:text-white">Item-Specific History</strong>
							<p>Click "View History" from an item's dropdown menu to see detailed purchase records just for that specific item.</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Tips & Best Practices -->
			<div>
				<h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<HelpCircle class="h-5 w-5" />
					Tips & Best Practices
				</h3>
				<div class="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4">
					<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
						<li class="flex items-start gap-2">
							<span class="text-blue-500 mt-1">•</span>
							<span><strong>Be Consistent:</strong> Use the same categories and units for similar items to make analysis easier.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-blue-500 mt-1">•</span>
							<span><strong>Add Details:</strong> Include location and payment method information for better expense tracking.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-blue-500 mt-1">•</span>
							<span><strong>Regular Updates:</strong> Record purchases soon after they happen while details are fresh in your memory.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-blue-500 mt-1">•</span>
							<span><strong>Review Patterns:</strong> Use the statistics shown on item cards to identify spending trends and optimize purchases.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-blue-500 mt-1">•</span>
							<span><strong>Backup Data:</strong> If you're logged in, use the <Cloud class="inline h-3 w-3 mx-1" /> Backup button to save your data to the cloud.</span>
						</li>
					</ul>
				</div>
			</div>

			<!-- Features Overview -->
			<div>
				<h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<Settings class="h-5 w-5" />
					Key Features
				</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
						<div class="font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
							<Cloud class="h-4 w-4" />
							Offline-First
						</div>
						<div class="text-gray-600 dark:text-gray-400">Works without internet connection, data syncs when online.</div>
					</div>
					<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
						<div class="font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
							<Edit class="h-4 w-4" />
							Auto-Save
						</div>
						<div class="text-gray-600 dark:text-gray-400">Changes are automatically saved to your browser's local storage.</div>
					</div>
					<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
						<div class="font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
							<History class="h-4 w-4" />
							Multi-Tab Sync
						</div>
						<div class="text-gray-600 dark:text-gray-400">Data stays synchronized across multiple browser tabs.</div>
					</div>
					<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
						<div class="font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
							<DollarSign class="h-4 w-4" />
							Multi-Currency
						</div>
						<div class="text-gray-600 dark:text-gray-400">Support for USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, NGN.</div>
					</div>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => open = false}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>