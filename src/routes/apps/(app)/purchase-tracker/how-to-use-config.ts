import { Package, ShoppingCart, History, Sparkles, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

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
		description: 'Enter how much you bought and what it cost. Date is set to today automatically.',
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
const managementFeatures: Feature[] = [
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

export const purchaseTrackerHowToUse: HowToUseConfig = {
	title: 'Quick Guide',
	description: 'Simple steps to track your purchases effectively',
	storageKey: 'purchase-tracker-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: Package,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with just one or two items you buy frequently. You can always add more later!'
			}
		},
		{
			value: 'record',
			label: 'Record',
			icon: ShoppingCart,
			steps: recordingSteps,
			optionalDetails: [
				{ label: 'Location', description: 'Where you bought it' },
				{ label: 'Payment', description: 'Cash, Card, etc.' },
				{ label: 'Notes', description: 'Any extra details' }
			]
		},
		{
			value: 'tips',
			label: 'Tips',
			icon: Sparkles,
			features: managementFeatures,
			tips: quickTips
		}
	]
};
