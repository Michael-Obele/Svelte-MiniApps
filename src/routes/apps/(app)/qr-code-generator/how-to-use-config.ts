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
		title: 'Enter Your Content',
		description:
			'Type or paste any text, URL, phone number, or message into the input field. The QR code generates instantly!',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Customize (Optional)',
		description:
			'Adjust the size, colors, and error correction level to match your needs. See changes in real-time.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Download or Share',
		description:
			'Click <strong>Download</strong> to save your QR code as an image, or use share options to distribute it.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Customization Steps
const customizationSteps: Step[] = [
	{
		number: 1,
		title: 'Adjust Size',
		description:
			'Use the size slider to make your QR code larger or smaller based on where you plan to use it.',
		color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
	},
	{
		number: 2,
		title: 'Change Colors',
		description:
			'Pick foreground and background colors to match your brand or design. High contrast works best for scanning.',
		color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
	},
	{
		number: 3,
		title: 'Error Correction',
		description:
			'Choose error correction level: Higher levels allow scanning even if the QR code is partially damaged.',
		color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
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
		title: 'Multiple Formats',
		description: 'Download your QR code as PNG, SVG, or other formats for different use cases.'
	},
	{
		icon: Share2,
		title: 'Easy Sharing',
		description: 'Share QR codes directly via social media, email, or messaging apps.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Use high contrast colors (dark on light) for best scanning reliability' },
	{ text: 'Test your QR code with multiple devices before printing' },
	{ text: 'Keep URLs short for simpler, easier-to-scan QR codes' },
	{ text: 'Higher error correction is better for outdoor or damaged surfaces' },
	{ text: 'QR codes work best when printed at least 2cm × 2cm in size' }
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
			value: 'customize',
			label: 'Customize',
			icon: Image,
			steps: customizationSteps
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
