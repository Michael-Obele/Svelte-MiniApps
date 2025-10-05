import {
	Sparkles,
	Search,
	Shuffle,
	CheckCircle,
	Copy,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Transform Text Steps
const transformSteps: Step[] = [
	{
		number: 1,
		title: 'Enter Text',
		description:
			'Type your text in the input field. Use words that correspond to emojis (like "heart", "smile", "thumbs up").',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Choose Action',
		description:
			'Select from <strong>Emojify</strong>, <strong>Unemojify</strong>, <strong>Strip</strong>, or <strong>Extract</strong> options.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Get Result',
		description: 'Click the action button to transform your text and see the result.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Search & Check Steps
const searchSteps: Step[] = [
	{
		number: 1,
		title: 'Search Emojis',
		description: 'Go to the Search tab and type keywords like "happy", "food", or "animal".',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Browse Results',
		description: 'Click on any emoji in the results to copy it to your clipboard.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Check Existence',
		description: 'Use the Check tab to verify if a word or emoji exists in our database.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: Sparkles,
		title: 'Text Transformation',
		description: 'Convert text to emojis, remove emojis, or extract only emojis from text.'
	},
	{
		icon: Search,
		title: 'Smart Search',
		description: 'Search through thousands of emojis using keywords and descriptions.'
	},
	{
		icon: Shuffle,
		title: 'Random Generator',
		description: 'Generate random emojis for fun or inspiration.'
	},
	{
		icon: CheckCircle,
		title: 'Emoji Validation',
		description: 'Check if specific emojis or words exist in our emoji database.'
	},
	{
		icon: Copy,
		title: 'One-Click Copy',
		description: 'Tap any emoji to instantly copy it to your clipboard.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Try words like "heart", "smile", "thumbsup", "rocket", "pizza" for best results' },
	{ text: 'Use the Extract feature to pull emojis out of mixed text' },
	{ text: 'Search works with partial words - try "smile" for smile-related emojis' },
	{ text: 'Random emojis update each time you visit the Random tab' },
	{ text: 'All emojis are clickable for easy copying to clipboard' }
];

export const advancedEmojiToolsHowToUse: HowToUseConfig = {
	title: 'Emoji Tools Guide',
	description: 'Master emoji transformation and discovery',
	storageKey: 'advanced-emoji-tools-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'transform',
			label: 'Transform',
			icon: Sparkles,
			steps: transformSteps,
			proTip: {
				text: 'Combine multiple words for emoji sentences! Try "I heart pizza" → "I ❤️ 🍕"'
			}
		},
		{
			value: 'search',
			label: 'Search & Check',
			icon: Search,
			steps: searchSteps,
			optionalDetails: [
				{
					label: 'Search Database',
					description: 'Contains thousands of emojis with multiple keywords each'
				},
				{ label: 'Validation', description: 'Checks both emoji symbols and text shortcodes' },
				{ label: 'Copy on Click', description: 'Every displayed emoji can be clicked to copy' }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: Shuffle,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
