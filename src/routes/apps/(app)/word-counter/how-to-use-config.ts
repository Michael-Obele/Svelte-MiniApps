import { ChartBar, Clock, Copy, Hash, Sparkles, WholeWord } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '#lib/types/how-to-use.js';

const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Add your text',
		description:
			'Paste or type into the editor. Every count on the right updates instantly as you write.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Read the numbers',
		description:
			'See words, characters, sentences, paragraphs, unique words, and estimated reading and speaking time.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Pick a writing limit',
		description:
			'Choose a platform preset to see how much room is left — or how far you have gone over.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

const limitSteps: Step[] = [
	{
		number: 1,
		title: 'Choose a preset',
		description:
			'X, SMS, LinkedIn, and essay presets are built in. Selecting one is enough — nothing else to configure.',
		color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
	},
	{
		number: 2,
		title: 'Watch the bar',
		description: 'The progress bar fills toward your limit and turns red once the text is over it.',
		color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
	},
	{
		number: 3,
		title: 'Trim or keep writing',
		description:
			'The remaining count keeps updating until the draft fits. Switch back to “No limit” for free-form counting.',
		color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
	}
];

const keyFeatures: Feature[] = [
	{
		icon: WholeWord,
		title: 'Live counts',
		description: 'Words, characters with and without spaces, sentences, paragraphs, and lines.'
	},
	{
		icon: Clock,
		title: 'Reading & speaking time',
		description: 'Estimates at 200 words per minute reading and 130 words per minute speaking.'
	},
	{
		icon: Hash,
		title: 'Keyword density',
		description: 'The words that dominate your draft, with stop words filtered out.'
	},
	{
		icon: Copy,
		title: 'One-click copy',
		description: 'Copy the full text back to your clipboard whenever you need it.'
	}
];

const quickTips: Tip[] = [
	{ text: 'Contractions and hyphenated words count as one word' },
	{ text: 'Blank lines separate paragraphs; every line break counts as a line' },
	{ text: 'Decimals like 3.14 are not treated as sentence endings' },
	{ text: 'Your draft and chosen limit are saved in this browser only' },
	{ text: 'Use “Sample” to see the stats fill in with example text' }
];

export const wordCounterHowToUse: HowToUseConfig = {
	title: 'Word Counter Guide',
	description: 'Live counts, reading time, and writing limits',
	storageKey: 'word-counter-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: Sparkles,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Clear the editor and paste a real draft — the keyword panel is most useful on your own writing.'
			}
		},
		{
			value: 'limits',
			label: 'Limits',
			icon: ChartBar,
			steps: limitSteps,
			optionalDetails: [
				{ label: 'X post', description: '280 characters' },
				{ label: 'SMS', description: '160 characters' },
				{ label: 'LinkedIn post', description: '3,000 characters' },
				{ label: 'Essay', description: '1,000 words' },
				{ label: 'No limit', description: 'Count only, no target' }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: Hash,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
