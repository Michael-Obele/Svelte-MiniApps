import { BookOpen, Search, Volume2, Lightbulb, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Enter a Word',
		description: 'Type any English word in the search field.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Search',
		description: 'Click the search button or press Enter to look up the word.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Explore Results',
		description: 'View definitions, examples, synonyms, and pronunciation options.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Using Audio Steps
const audioSteps: Step[] = [
	{
		number: 1,
		title: 'Find Audio Button',
		description: 'Look for the speaker icon (🔊) next to phonetic pronunciations.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Click to Listen',
		description: 'Click the audio button to hear the correct pronunciation.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Practice',
		description: 'Listen multiple times and practice speaking along with the audio.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: BookOpen,
		title: 'Comprehensive Definitions',
		description: 'Get detailed definitions with parts of speech, examples, and usage notes.'
	},
	{
		icon: Search,
		title: 'Smart Search',
		description: 'Search for words, phrases, and get intelligent suggestions for similar terms.'
	},
	{
		icon: Volume2,
		title: 'Audio Pronunciation',
		description: 'Listen to correct pronunciations with phonetic spellings and audio playback.'
	},
	{
		icon: Lightbulb,
		title: 'Synonyms & Antonyms',
		description: 'Discover related words and their opposites to expand your vocabulary.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Try searching for common words to see detailed definitions and examples' },
	{ text: 'Use audio pronunciation to improve your speaking and listening skills' },
	{ text: 'Explore synonyms to find better words for your writing' },
	{ text: 'Check phonetic spellings to understand pronunciation patterns' },
	{ text: 'Look for example sentences to see words used in context' }
];

export const dictionaryAppHowToUse: HowToUseConfig = {
	title: 'Dictionary Guide',
	description: 'Look up words and expand your vocabulary',
	storageKey: 'dictionary-app-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: BookOpen,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with simple words like "hello", "world", or "computer" to explore all features!'
			}
		},
		{
			value: 'audio',
			label: 'Pronunciation',
			icon: Volume2,
			steps: audioSteps,
			optionalDetails: [
				{ label: 'Phonetic Spelling', description: 'Shows pronunciation using the International Phonetic Alphabet' },
				{ label: 'Audio Quality', description: 'High-quality audio recordings from native speakers' },
				{ label: 'Multiple Accents', description: 'Includes both American and British English pronunciations' }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: Lightbulb,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
