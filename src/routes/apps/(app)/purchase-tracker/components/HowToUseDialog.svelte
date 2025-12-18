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

	interface Step {
		number: number;
		title: string;
		description: string;
		color: string;
	}

	interface ManagementFeature {
		icon: typeof Package;
		title: string;
		description: string;
	}

	interface Tip {
		text: string;
	}

	let { open = $bindable(false), onClose }: Props = $props();
	let activeTab = $state('start');

	// Getting Started Steps
	const gettingStartedSteps: Step[] = [
		{
			number: 1,
			title: 'Add an Item',
			description:
				'Click <strong>"Add Item"</strong> button. Name it something like "Coffee" or "Gas".',
			color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
		},
		{
			number: 2,
			title: 'Pick a Category',
			description: 'Choose from Groceries, Fuel, Dining, etc. or create your own.',
			color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
		},
		{
			number: 3,
			title: "That's It!",
			description: "You're ready to track purchases. Set units and currency if you want.",
			color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
		}
	];

	// Recording Purchase Steps
	const recordingSteps: Step[] = [
		{
			number: 1,
			title: 'Find Your Item',
			description: 'On the Items tab, click the <strong>⋮</strong> menu on any item card.',
			color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
		},
		{
			number: 2,
			title: 'Add Purchase',
			description:
				'Enter how much you bought and what it cost. Date is set to today automatically.',
			color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
		},
		{
			number: 3,
			title: 'Save It',
			description: 'Click Save. Your purchase is recorded and statistics update instantly!',
			color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
		}
	];

	// Management Features
	const managementFeatures: ManagementFeature[] = [
		{
			icon: History,
			title: 'View Your Data',
			description:
				'Switch between <strong>Items</strong> and <strong>Purchase History</strong> tabs to see different views.'
		},
		{
			icon: Sparkles,
			title: 'Check Statistics',
			description: 'Each item card shows total spent and number of purchases at a glance.'
		},
		{
			icon: Package,
			title: 'Edit Anytime',
			description: 'Click the <strong>⋮</strong> menu to edit items or view detailed history.'
		}
	];

	// Quick Tips
	const quickTips: Tip[] = [
		{ text: 'Record purchases regularly for accurate tracking' },
		{ text: 'Use consistent categories for easier analysis' },
		{ text: 'Backup your data if logged in (cloud icon in header)' },
		{ text: 'Works offline - no internet needed!' }
	];
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
					{#each gettingStartedSteps as step}
						<div class="flex gap-3">
							<div
								class="flex size-8 flex-shrink-0 items-center justify-center rounded-full font-semibold {step.color}"
							>
								{step.number}
							</div>
							<div class="flex-1">
								<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{step.title}</h4>
								<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
									{@html step.description}
								</p>
							</div>
						</div>
					{/each}
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
					{#each recordingSteps as step}
						<div class="flex gap-3">
							<div
								class="flex size-8 flex-shrink-0 items-center justify-center rounded-full font-semibold {step.color}"
							>
								{step.number}
							</div>
							<div class="flex-1">
								<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{step.title}</h4>
								<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
									{@html step.description}
								</p>
							</div>
						</div>
					{/each}
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
					{#each managementFeatures as feature}
						<div
							class="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
						>
							<h4 class="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
								<feature.icon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
								{feature.title}
							</h4>
							<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
								{@html feature.description}
							</p>
						</div>
					{/each}
				</div>

				<div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/50">
					<h4 class="mb-2 font-semibold text-purple-900 dark:text-purple-300">Quick Tips:</h4>
					<ul class="space-y-1.5">
						{#each quickTips as tip}
							<li class="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-200">
								<span class="mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
								<span class="leading-relaxed">{tip.text}</span>
							</li>
						{/each}
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
