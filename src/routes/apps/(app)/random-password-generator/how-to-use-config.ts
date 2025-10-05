import { Lock, Settings, Shield, Save, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Set Length',
		description: 'Use the slider to choose your desired password length (8-128 characters).',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Choose Character Types',
		description: 'Select which character types to include: uppercase, lowercase, numbers, symbols.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Generate Password',
		description: 'Click <strong>"Generate Password"</strong> to create a secure password.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Advanced Options Steps
const advancedSteps: Step[] = [
	{
		number: 1,
		title: 'Check Strength',
		description: 'View the password strength indicator and score.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Copy Password',
		description: 'Click the copy button to copy the password to clipboard.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Save Passwords',
		description: 'Save generated passwords securely in your account (login required).',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: Lock,
		title: 'Secure Generation',
		description: 'Cryptographically secure random password generation.'
	},
	{
		icon: Settings,
		title: 'Customizable Options',
		description: 'Control length and character types for different security needs.'
	},
	{
		icon: Shield,
		title: 'Strength Analysis',
		description: 'Real-time password strength evaluation and scoring.'
	},
	{
		icon: Save,
		title: 'Password Storage',
		description: 'Securely save and manage generated passwords in your account.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Use at least 12 characters for strong passwords' },
	{ text: 'Include all character types for maximum security' },
	{ text: 'Avoid using the same password across multiple sites' },
	{ text: 'Save important passwords securely in your account' },
	{ text: 'The strength indicator helps you create better passwords' }
];

export const randomPasswordGeneratorHowToUse: HowToUseConfig = {
	title: 'Password Generator Guide',
	description: 'Create secure passwords with ease',
	storageKey: 'random-password-generator-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: Lock,
			steps: gettingStartedSteps,
			proTip: {
				text: 'For maximum security, use 16+ characters with all character types enabled!'
			}
		},
		{
			value: 'advanced',
			label: 'Advanced Features',
			icon: Settings,
			steps: advancedSteps,
			optionalDetails: [
				{
					label: 'Strength Algorithm',
					description: 'Uses zxcvbn library for accurate strength scoring'
				},
				{ label: 'Secure Storage', description: 'Passwords are hashed before storage' },
				{
					label: 'Character Sets',
					description: 'Uppercase A-Z, lowercase a-z, numbers 0-9, symbols'
				}
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: Shield,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
