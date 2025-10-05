import { Shuffle, Copy, RefreshCw, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Generate Emoji',
		description: 'Click the <strong>"Generate"</strong> button to get a random emoji.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'View Details',
		description: 'See the emoji name displayed below the large emoji.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Copy to Clipboard',
		description: 'Click <strong>"Copy"</strong> to copy the emoji to your clipboard.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Usage Tips Steps
const usageSteps: Step[] = [
	{
		number: 1,
		title: 'Quick Access',
		description: 'Generate new emojis instantly with one click.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Copy Anytime',
		description: 'Copy the current emoji without generating a new one.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Learn Names',
		description: 'Discover emoji names you might not know.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: Shuffle,
		title: 'True Random',
		description: 'Generate completely random emojis from our extensive database.'
	},
	{
		icon: RefreshCw,
		title: 'Instant Generation',
		description: 'Get a new emoji with a single button click.'
	},
	{
		icon: Copy,
		title: 'One-Click Copy',
		description: 'Copy emojis to clipboard instantly for use anywhere.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Perfect for adding personality to messages and social media' },
	{ text: 'Great for discovering emojis you never knew existed' },
	{ text: 'Use for fun, productivity, or creative inspiration' },
	{ text: 'Emoji names are shown in readable format (spaces instead of underscores)' },
	{ text: 'Works offline - no internet connection needed' }
];

export const randomEmojiGeneratorHowToUse: HowToUseConfig = {
	title: 'Random Emoji Guide',
	description: 'Generate fun random emojis instantly',
	storageKey: 'random-emoji-generator-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: Shuffle,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Try generating several emojis in a row to find the perfect one for your message!'
			}
		},
		{
			value: 'usage',
			label: 'Usage Tips',
			icon: Copy,
			steps: usageSteps,
			optionalDetails: [
				{ label: 'Database Size', description: 'Contains hundreds of emojis to choose from' },
				{ label: 'Name Format', description: 'Emoji names are converted to readable format' },
				{ label: 'Copy Feedback', description: 'Toast notification confirms successful copying' }
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
