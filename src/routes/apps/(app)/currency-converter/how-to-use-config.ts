import { ArrowLeftRight, Clock, Globe, History, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Select Currencies',
		description:
			'Choose your <strong>"From"</strong> and <strong>"To"</strong> currencies from the dropdowns. The app remembers your last pair automatically.',
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
		icon: Globe,
		title: 'Global Coverage',
		description: 'Convert between all major world currencies with up-to-date exchange rates.'
	},
	{
		icon: ArrowLeftRight,
		title: 'Quick Swap',
		description: 'Instantly swap currencies with one click using the swap button.'
	},
	{
		icon: History,
		title: 'Remembered Pair',
		description: 'Your last selected currencies are stored locally and restored on revisit.'
	},
	{
		icon: Clock,
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
			icon: Globe,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with common currencies like USD, EUR, GBP, or JPY for the best experience!'
			}
		},
		{
			value: 'advanced',
			label: 'Advanced',
			icon: Clock,
			steps: advancedSteps,
			optionalDetails: [
				{
					label: 'Cache Duration',
					description: 'Rates are cached for 8 minutes to balance speed and accuracy'
				},
				{ label: 'Rate Source', description: 'Exchange rates provided by reliable financial APIs' },
				{ label: 'Offline Support', description: 'Works offline with previously cached rates' },
				{
					label: 'Saved Selection',
					description: 'Your last currency pair is remembered in browser storage'
				}
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: History,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
