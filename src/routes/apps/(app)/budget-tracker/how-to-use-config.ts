import {
	Wallet,
	Receipt,
	TrendingUp,
	DollarSign,
	PlusCircle,
	Eye,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Create a Budget',
		description:
			'Click the <strong>"+ Add Budget"</strong> button in the Budgets section. Give it a name like "Groceries" or "Entertainment" and set an amount.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Choose Currency',
		description:
			'Select your preferred currency from the dropdown. The app supports multiple currencies with symbols.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Start Tracking!',
		description:
			'Your budget is ready! Now you can start adding expenses to track your spending against the budget.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Tracking Expenses Steps
const trackingSteps: Step[] = [
	{
		number: 1,
		title: 'Select Budget',
		description:
			'In the Expenses section, choose which budget this expense belongs to from the dropdown menu.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Add Expense',
		description:
			'Enter a description of the expense and the amount spent. Click <strong>"Add Expense"</strong> to record it.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Watch Progress',
		description:
			'Your budget progress bar updates automatically! See how much you have left and track your spending habits.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Management Features
const managementFeatures: Feature[] = [
	{
		icon: Eye,
		title: 'Monitor Budgets',
		description:
			'Each budget card shows total allocated, spent amount, and remaining balance with a visual progress bar.'
	},
	{
		icon: TrendingUp,
		title: 'View Expenses',
		description:
			'The Expenses section lists all your spending organized by budget with descriptions and amounts.'
	},
	{
		icon: Wallet,
		title: 'Edit & Delete',
		description:
			'Click on any budget or expense to edit details or remove items you no longer need to track.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Create separate budgets for different spending categories' },
	{ text: 'Review your expenses regularly to stay on track' },
	{ text: 'Set realistic budget amounts based on your income' },
	{ text: 'Use descriptive names for expenses to track spending patterns' },
	{ text: 'All data is saved automatically in your browser' }
];

export const budgetTrackerHowToUse: HowToUseConfig = {
	title: 'Budget Tracker Guide',
	description: 'Learn how to manage your budgets and track expenses',
	storageKey: 'budget-tracker-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: Wallet,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with 2-3 main budget categories like "Food", "Transport", and "Entertainment". You can always add more as needed!',
				icon: DollarSign
			}
		},
		{
			value: 'track',
			label: 'Track',
			icon: Receipt,
			steps: trackingSteps
		},
		{
			value: 'tips',
			label: 'Tips',
			icon: TrendingUp,
			features: managementFeatures,
			tips: quickTips
		}
	]
};
