import {
	LayoutDashboard,
	Target,
	Calendar,
	AlertTriangle,
	Plus,
	Pencil,
	Lightbulb,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'View Your Dashboard',
		description:
			'The <strong>Dashboard</strong> shows your 10-year planning timeline, total time invested, average progress across all options, and active risks.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Explore Default Options',
		description:
			'Three default options are pre-configured: <strong>Freelance Dev</strong>, <strong>Company Job</strong>, and <strong>Luck-Based</strong>. You can customize or add your own.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Add New Options',
		description:
			'Click <strong>Add Option</strong> to create new scenario paths. Set a name, description, color, and initial allocation percentage.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Managing Options Steps
const managingSteps: Step[] = [
	{
		number: 1,
		title: 'Log Activities',
		description:
			'Select an option tab and click <strong>Add Activity</strong> to log work sessions. Track time spent, progress metrics like "$500 earned" or "2 certs completed", and status.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Update Progress',
		description:
			'Click <strong>Edit</strong> on any option to update progress percentage, allocation, and estimated time to completion.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Track Timeline',
		description:
			'Use the <strong>Timeline</strong> tab to log periodic entries about which options you worked on and how you allocated your time.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Risk Management Features
const riskFeatures: Feature[] = [
	{
		icon: AlertTriangle,
		title: 'Track Risks',
		description:
			'Document potential challenges and assumptions in the <strong>Risks</strong> tab. Assign severity levels and mitigation strategies.'
	},
	{
		icon: Target,
		title: 'Link to Options',
		description:
			'Associate risks with specific options or mark them as general risks that affect your overall plan.'
	},
	{
		icon: Lightbulb,
		title: 'Prioritize by Severity',
		description:
			'Risks are color-coded by severity: <strong>Critical</strong> (red), <strong>High</strong> (orange), <strong>Medium</strong> (amber), <strong>Low</strong> (green).'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Update activities weekly to maintain accurate time tracking' },
	{ text: 'Keep allocations totaling 100% for balanced planning' },
	{ text: 'Review and adjust risks as situations change' },
	{ text: 'Use the timeline to spot patterns in your effort distribution' },
	{ text: 'All data is saved locally in your browser and syncs across tabs' }
];

export const scenarioTrackerHowToUse: HowToUseConfig = {
	title: 'Scenario Tracker Guide',
	description: 'Plan your future with multiple life/career options over a 10-year horizon',
	storageKey: 'scenario-tracker-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: LayoutDashboard,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with the default options and customize them based on your actual goals. You can always add or remove options later!',
				icon: Lightbulb
			}
		},
		{
			value: 'manage',
			label: 'Manage',
			icon: Pencil,
			steps: managingSteps
		},
		{
			value: 'risks',
			label: 'Risks',
			icon: AlertTriangle,
			features: riskFeatures,
			tips: quickTips
		}
	]
};
