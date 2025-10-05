import { FileText, Settings, Copy, BarChart3, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Enter Text',
		description:
			'Paste or type your text in the input area. A sample text is provided to get started.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Adjust Settings',
		description: 'Use the sliders to set summary ratio (percentage) and maximum word count.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Generate Summary',
		description: 'Click <strong>"Summarize"</strong> to create a concise version of your text.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Customization Steps
const customizationSteps: Step[] = [
	{
		number: 1,
		title: 'Summary Ratio',
		description: 'Control how much of the original text to keep (10-50% recommended).',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Word Limit',
		description: 'Set maximum words for the summary to control length.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'View Statistics',
		description: 'Check word counts and compression ratio in the statistics panel.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: FileText,
		title: 'Smart Summarization',
		description: 'AI-powered text summarization that preserves key information.'
	},
	{
		icon: Settings,
		title: 'Customizable Length',
		description: 'Control summary length with ratio and word limit settings.'
	},
	{
		icon: BarChart3,
		title: 'Statistics Display',
		description: 'View word counts, compression ratios, and summary metrics.'
	},
	{
		icon: Copy,
		title: 'Easy Copy',
		description: 'Copy summarized text with one click for use anywhere.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Start with 20-30% ratio for balanced summaries' },
	{ text: 'Use sample text to test different settings' },
	{ text: 'Longer texts work better for summarization' },
	{ text: 'Check statistics to understand compression effectiveness' },
	{ text: 'Your text and settings are automatically saved' }
];

export const textSummarizerHowToUse: HowToUseConfig = {
	title: 'Text Summarizer Guide',
	description: 'Create concise summaries of long texts',
	storageKey: 'text-summarizer-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: FileText,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Try the sample text first to see how different settings affect the summary quality!'
			}
		},
		{
			value: 'customize',
			label: 'Customization',
			icon: Settings,
			steps: customizationSteps,
			optionalDetails: [
				{ label: 'Ratio Range', description: '10-90% of original text length' },
				{ label: 'Word Limits', description: 'Flexible word count controls' },
				{ label: 'Auto-save', description: 'Settings and text persist between sessions' }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: BarChart3,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
