import {
	QrCode,
	Download,
	Share2,
	Sparkles,
	Image,
	Type,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Choose Content Type',
		description:
			'Select from three tabs: <strong>Text/URL</strong> for links and text, <strong>Contact Card</strong> for vCard info, or <strong>Social Links</strong> for multiple social media profiles.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Enter Your Information',
		description:
			'Fill in the fields for your chosen content type. The QR code generates automatically as you type!',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Download Your QR Code',
		description:
			'Click <strong>Download QR Code</strong> to save as a PNG image, or click the QR code itself for a larger preview.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Content Types Steps
const contentTypesSteps: Step[] = [
	{
		number: 1,
		title: 'Text/URL Tab',
		description:
			'Perfect for website links, plain text messages, phone numbers, or any text content you want to encode.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Contact Card Tab',
		description:
			'Create a digital business card with name, phone, email, and website. Generates a vCard format that adds contacts to phones.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Social Links Tab',
		description:
			'Add multiple social media profiles with labels and URLs. Creates a formatted text block with all your links.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Features
const features: Feature[] = [
	{
		icon: QrCode,
		title: 'Instant Generation',
		description: 'QR codes are created in real-time as you type. No waiting, no processing delays.'
	},
	{
		icon: Download,
		title: 'PNG Download',
		description: 'Download your QR code as a high-quality PNG image for printing or digital use.'
	},
	{
		icon: Share2,
		title: 'Multiple Content Types',
		description: 'Support for text, URLs, contact cards (vCard), and social media link collections.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Use high contrast colors (dark on light) for best scanning reliability' },
	{ text: 'Test your QR code with multiple devices before printing' },
	{ text: 'Keep URLs short for simpler, easier-to-scan QR codes' },
	{ text: 'Contact cards automatically add to phone contacts when scanned' },
	{ text: 'QR codes work best when printed at least 2cm × 2cm in size' },
	{ text: 'Social links create a formatted text block with all your profiles' }
];

export const qrCodeGeneratorHowToUse: HowToUseConfig = {
	title: 'QR Code Generator Guide',
	description: 'Learn how to create and customize QR codes',
	storageKey: 'qr-code-generator-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: Type,
			steps: gettingStartedSteps,
			proTip: {
				text: 'For URLs, use URL shorteners first to create smaller, more reliable QR codes that scan faster!',
				icon: QrCode
			}
		},
		{
			value: 'content',
			label: 'Content Types',
			icon: Image,
			steps: contentTypesSteps
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
