import { Ruler, ArrowRightLeft, Calculator, Settings, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Select Unit Type',
		description:
			'Choose the type of units you want to convert (length, weight, temperature, etc.).',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Choose Units',
		description:
			'Select the <strong>"From"</strong> and <strong>"To"</strong> units for conversion.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Enter Value',
		description: 'Input the value you want to convert and see the result instantly.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Advanced Usage Steps
const advancedSteps: Step[] = [
	{
		number: 1,
		title: 'Switch Units',
		description: 'Use the swap button (↔️) to quickly reverse the conversion direction.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Clear Values',
		description: 'Use the clear button to reset all inputs and start fresh.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Precision Display',
		description: 'Results show appropriate decimal places based on the unit type.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: Ruler,
		title: 'Multiple Unit Types',
		description: 'Convert between length, weight, temperature, volume, area, and more.'
	},
	{
		icon: ArrowRightLeft,
		title: 'Bidirectional Conversion',
		description: 'Convert in either direction with the convenient swap button.'
	},
	{
		icon: Calculator,
		title: 'Precise Calculations',
		description: 'Accurate conversions with appropriate decimal precision.'
	},
	{
		icon: Settings,
		title: 'Easy Reset',
		description: 'Quick clear and reset functionality for new conversions.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Units are automatically filtered by type for easier selection' },
	{ text: 'Temperature conversions support Celsius, Fahrenheit, and Kelvin' },
	{ text: 'Large numbers are formatted with thousand separators' },
	{ text: 'Results update instantly as you type' },
	{ text: 'Use the swap button to quickly reverse conversions' }
];

export const unitConverterHowToUse: HowToUseConfig = {
	title: 'Unit Converter Guide',
	description: 'Convert between different units easily',
	storageKey: 'unit-converter-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: Ruler,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Try converting between meters and feet, or Celsius and Fahrenheit to get familiar!'
			}
		},
		{
			value: 'advanced',
			label: 'Advanced Usage',
			icon: Calculator,
			steps: advancedSteps,
			optionalDetails: [
				{
					label: 'Supported Types',
					description: 'Length, weight, temperature, volume, area, speed, time'
				},
				{ label: 'Precision', description: 'Automatic decimal places based on unit type' },
				{ label: 'Real-time', description: 'Conversions update as you type' }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: ArrowRightLeft,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
