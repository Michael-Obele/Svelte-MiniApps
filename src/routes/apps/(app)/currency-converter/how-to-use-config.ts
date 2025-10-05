import {
	DollarSign,
	ArrowLeftRight,
	RefreshCw,
	TrendingUp,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Select Currencies',
		description:
			'Choose your <strong>"From"</strong> and <strong>"To"</strong> currencies using the dropdowns or type currency codes.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Enter Amount',
		description: 'Input the amount you want to convert in the amount field.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Convert',
		description: 'Click the <strong>"Convert"</strong> button to get instant results.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Advanced Features Steps
const advancedSteps: Step[] = [
	{
		number: 1,
		title: 'Swap Currencies',
		description: 'Use the swap button (↔️) to quickly switch between "From" and "To" currencies.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Force Fresh Rates',
		description:
			'Enable "Force Fresh Rate" to bypass cached rates for the most up-to-date conversion.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'View Exchange Rate',
		description: 'See the current exchange rate and cache status below your conversion result.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: DollarSign,
		title: '150+ Currencies',
		description: 'Convert between all major world currencies with up-to-date exchange rates.'
	},
	{
		icon: ArrowLeftRight,
		title: 'Quick Swap',
		description: 'Instantly swap currencies with one click using the swap button.'
	},
	{
		icon: RefreshCw,
		title: 'Fresh Rates',
		description:
			'Get the latest exchange rates with optional cache bypass for critical conversions.'
	},
	{
		icon: TrendingUp,
		title: 'Rate Display',
		description: 'View detailed exchange rates and cache timestamps for transparency.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Currency codes are automatically formatted to uppercase' },
	{ text: 'Numbers are formatted with thousand separators for readability' },
	{ text: 'Results show both converted amount and exchange rate' },
	{ text: 'Cache helps reduce API calls while maintaining accuracy' },
	{ text: 'Works offline once you have cached rates' }
];

export const currencyConverterHowToUse: HowToUseConfig = {
	title: 'Currency Converter Guide',
	description: 'Convert currencies with real-time exchange rates',
	storageKey: 'currency-converter-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: DollarSign,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with common currencies like USD, EUR, GBP, or JPY for the best experience!'
			}
		},
		{
			value: 'advanced',
			label: 'Advanced',
			icon: TrendingUp,
			steps: advancedSteps,
			optionalDetails: [
				{
					label: 'Cache Duration',
					description: 'Rates are cached for 8 minutes to balance speed and accuracy'
				},
				{ label: 'Rate Source', description: 'Exchange rates provided by reliable financial APIs' },
				{ label: 'Offline Support', description: 'Works offline with previously cached rates' }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: RefreshCw,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
