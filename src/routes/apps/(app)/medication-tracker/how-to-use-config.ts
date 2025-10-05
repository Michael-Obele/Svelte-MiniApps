import {
	Clock,
	CheckCircle2,
	TrendingUp,
	Activity,
	XCircle,
	Calendar,
	AlertCircle,
	Pill,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, StatusIndicator, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Create a Session',
		description:
			'Click <strong>"New Session"</strong> and give it a meaningful name like "Morning Routine", "Weekly Meds", or "Antibiotics Course".',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Add Medications',
		description:
			'In your session, click <strong>"Add Medication"</strong>. Include the medication name, dosage (e.g., "500mg"), and any special instructions.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Set Schedule Times',
		description:
			'Choose specific times for each medication (e.g., 9:00 AM, 2:00 PM, 9:00 PM). The app will automatically generate your daily schedule.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Daily Tracking Steps
const trackingSteps: Step[] = [
	{
		number: 1,
		title: "Check Today's Schedule",
		description:
			'The <strong>"Today"</strong> tab displays all medications due today with their scheduled times and current status.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Mark as Taken',
		description:
			'Click the <strong>✓ Taken</strong> button when you take each medication. The app records the actual time and you can add optional notes.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Handle Exceptions',
		description:
			'If you miss a dose, use <strong>"Skip"</strong> (with reason) or <strong>"Reschedule"</strong> (to a different time) to keep your tracking accurate.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Status Indicators
const statusIndicators: StatusIndicator[] = [
	{
		variant: 'default',
		bgColor: 'bg-green-500  text-black hover:bg-green-600',
		icon: CheckCircle2,
		label: 'Taken',
		description: 'Medication successfully taken at the recorded time'
	},
	{
		variant: 'secondary',
		icon: XCircle,
		label: 'Skipped',
		description: 'Dose intentionally skipped with optional reason'
	},
	{
		variant: 'destructive',
		icon: AlertCircle,
		label: 'Missed',
		description: 'Overdue medication that needs attention'
	},
	{
		variant: 'outline',
		icon: Clock,
		label: 'Pending',
		description: 'Scheduled medication waiting to be taken'
	}
];

// Management Features
const managementFeatures: Feature[] = [
	{
		icon: Calendar,
		title: 'View History',
		description:
			'The <strong>"History"</strong> tab shows all past medication logs grouped by date. Edit times, undo actions, or add notes to any entry.'
	},
	{
		icon: TrendingUp,
		title: 'Track Statistics',
		description:
			'The <strong>"Stats"</strong> tab displays adherence rates, current streaks, missed doses, and detailed medication patterns over time.'
	},
	{
		icon: Clock,
		title: 'Manage Schedules',
		description:
			'Edit medication details, adjust dosages, modify schedules, or reschedule individual doses from the <strong>"Medications"</strong> tab.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Set reminders on your phone for critical medications' },
	{ text: 'Review your adherence statistics weekly to identify patterns' },
	{ text: 'Use the notes field to track side effects or effectiveness' },
	{ text: 'Backup your data regularly if logged in (cloud icon in header)' },
	{ text: 'The app works offline - perfect for travel and areas with poor connectivity' }
];

export const medicationTrackerHowToUse: HowToUseConfig = {
	title: 'Medication Tracker Guide',
	description: 'Simple steps to manage your medication schedule effectively',
	storageKey: 'medication-tracker-has-seen-guide',
	showFooterHelpText: true,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: Pill,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with just 1-2 medications to get familiar with the system. You can always add more medications and adjust schedules as needed!',
				icon: Pill,
				borderColor: 'border-blue-200 dark:border-blue-800',
				bgColor: 'bg-blue-50 dark:bg-blue-950/50',
				iconColor: 'text-blue-600 dark:text-blue-400',
				textColor: 'text-blue-800 dark:text-blue-200',
				headingColor: 'text-blue-900 dark:text-blue-300'
			}
		},
		{
			value: 'track',
			label: 'Track',
			icon: CheckCircle2,
			steps: trackingSteps,
			statusIndicators
		},
		{
			value: 'manage',
			label: 'Manage',
			icon: Activity,
			features: managementFeatures,
			tips: quickTips
		}
	]
};
