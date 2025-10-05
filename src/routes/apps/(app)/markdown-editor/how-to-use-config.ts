import {
	FileText,
	Eye,
	Download,
	Sparkles,
	Type,
	Code2,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Start Writing',
		description:
			'Type your content in the editor panel on the left using Markdown syntax. The preview updates instantly!',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Use Markdown',
		description:
			'Format text with <strong>#</strong> for headings, <strong>**</strong> for bold, <strong>*</strong> for italic, and more.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'View & Export',
		description:
			'See your formatted content in real-time on the right. Download as HTML or Markdown when ready.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Markdown Syntax Steps
const markdownSteps: Step[] = [
	{
		number: 1,
		title: 'Headings',
		description:
			'Use <strong># Heading 1</strong>, <strong>## Heading 2</strong>, etc. More # symbols = smaller headings.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Text Formatting',
		description:
			'<strong>**bold**</strong>, <strong>*italic*</strong>, <strong>~~strikethrough~~</strong>, and <strong>`code`</strong> for inline code.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Lists & Links',
		description:
			'Use <strong>-</strong> or <strong>*</strong> for bullet lists, <strong>1.</strong> for numbered lists, and <strong>[text](url)</strong> for links.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Features
const features: Feature[] = [
	{
		icon: Eye,
		title: 'Live Preview',
		description: 'See your formatted content update instantly as you type in the editor.'
	},
	{
		icon: Download,
		title: 'Export Options',
		description:
			'Download your work as Markdown (.md) or HTML (.html) files for sharing or publishing.'
	},
	{
		icon: Code2,
		title: 'Code Blocks',
		description: 'Add syntax-highlighted code blocks using triple backticks with language names.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Use headings to organize your document structure' },
	{ text: 'Add blank lines between paragraphs for better readability' },
	{ text: 'Preview frequently to catch formatting mistakes early' },
	{ text: 'Use lists to break down complex information' },
	{ text: 'Your content is auto-saved as you type in the browser' }
];

export const markdownEditorHowToUse: HowToUseConfig = {
	title: 'Markdown Editor Guide',
	description: 'Learn how to write and format with Markdown',
	storageKey: 'markdown-editor-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: FileText,
			steps: gettingStartedSteps,
			proTip: {
				text: 'New to Markdown? Start simple! Just type normally and add formatting as you learn. The preview shows you exactly how it will look.',
				icon: Type
			}
		},
		{
			value: 'syntax',
			label: 'Syntax',
			icon: Code2,
			steps: markdownSteps
		},
		{
			value: 'tips',
			label: 'Tips',
			icon: Sparkles,
			features,
			tips: quickTips
		}
	]
};
