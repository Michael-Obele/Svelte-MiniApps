import {
	Clock,
	CheckCircle2,
	TrendingUp,
	Activity,
	XCircle,
	Calendar,
	AlertCircle,
	Pill,
	Edit3,
	RotateCcw,
	Cloud,
	CalendarClock,
	BarChart3,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, StatusIndicator, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Create a Session',
		description:
			'Click <strong>"New Session"</strong> and give it a meaningful name like "Morning Routine", "Weekly Meds", or "Antibiotics Course". You can edit session details or restart ended sessions anytime.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Add Medications',
		description:
			'In your session, click <strong>"Add Medication"</strong>. Include the medication name, dosage (e.g., "500mg"), and frequency (e.g., "twice daily" or "every 8 hours"). The app intelligently suggests schedule times.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Generate Smart Schedules',
		description:
			'Choose between <strong>"Auto Schedule"</strong> (based on frequency) or <strong>"Custom Times"</strong>. The app shows expected total doses and generates your complete medication schedule automatically.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Daily Tracking Steps
const trackingSteps: Step[] = [
	{
		number: 1,
		title: "Check Today's Schedule",
		description:
			'The <strong>"Today"</strong> tab displays all medications due today with their scheduled times and current status. Overdue medications are automatically marked as "missed" after 30 minutes.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Mark as Taken or Skip',
		description:
			'Click the <strong>✓ Taken</strong> button when you take each medication. For missed doses, use <strong>"Skip"</strong> with an optional reason. You can add notes to track side effects or effectiveness.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Reschedule When Needed',
		description: `Click the <strong>📅 Reschedule</strong>  button to move a single dose to a different time or date. Perfect for adjusting your schedule without changing the entire medication routine.`,
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 4,
		title: 'Catch Up from History',
		description:
			'Forgot to log yesterday\'s medications? Visit the <strong>"History"</strong> tab and mark any pending medications as taken or skipped to maintain accurate records.',
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
		title: 'View & Edit History',
		description:
			'The <strong>"History"</strong> tab shows all past medication logs grouped by date. Edit times, undo actions, mark forgotten doses as taken/skipped, or add notes to any entry.'
	},
	{
		icon: BarChart3,
		title: 'View Schedule Details',
		description:
			'Click <strong>"View Schedule"</strong> next to any medication to see all scheduled doses with stats (pending/taken/total). Delete individual doses or clear all pending ones.'
	},
	{
		icon: Edit3,
		title: 'Edit Medications & Schedules',
		description:
			'Modify medication details, adjust dosages, or update schedules. The app intelligently preserves existing logs while updating future ones to prevent duplicates.'
	},
	{
		icon: CalendarClock,
		title: 'Reschedule Individual Doses',
		description:
			'Move single doses to different times or dates without affecting your entire medication schedule. Perfect for one-off adjustments like travel or appointments.'
	},
	{
		icon: RotateCcw,
		title: 'Session Management',
		description:
			'Edit session names/descriptions, end active sessions, or restart completed sessions. Manage multiple treatment periods with full control over your medication history.'
	},
	{
		icon: Cloud,
		title: 'Automatic Backup',
		description:
			'For logged-in users, your data automatically backs up to the cloud 15 seconds after any changes. Manual backup is also available anytime with the cloud icon.'
	},
	{
		icon: TrendingUp,
		title: 'Track Statistics',
		description:
			'The <strong>"Stats"</strong> tab displays adherence rates, current streaks, missed doses, and detailed medication patterns over time.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Set reminders on your phone for critical medications' },
	{ text: 'Review your adherence statistics weekly to identify patterns' },
	{ text: 'Use the notes field to track side effects or effectiveness' },
	{ text: 'The app automatically marks overdue doses as "missed" after 30 minutes' },
	{ text: 'Reschedule individual doses instead of changing entire medication schedules' },
	{ text: 'View detailed schedules to see all upcoming doses and manage pending ones' },
	{ text: 'Edit session details or restart completed sessions anytime' },
	{ text: 'Logged-in users get automatic cloud backup - no manual saving needed' },
	{ text: 'Use frequency descriptions like "twice daily" for automatic time suggestions' },
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
				text: 'Try frequency descriptions like "twice daily", "every 8 hours", or "three times daily" - the app will automatically suggest optimal times and calculate total doses for you!',
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
		},
		{
			value: 'advanced',
			label: 'Advanced',
			icon: BarChart3,
			features: [
				{
					icon: Clock,
					title: 'Smart Auto-Marking',
					description:
						'Overdue medications are automatically marked as "missed" after 30 minutes. No manual intervention needed - the app keeps your records accurate.'
				},
				{
					icon: CalendarClock,
					title: 'Flexible Rescheduling',
					description:
						'Move doses to different times or dates without affecting your entire schedule. Perfect for travel, appointments, or temporary schedule changes.'
				},
				{
					icon: Edit3,
					title: 'History Editing',
					description:
						'Retroactively mark forgotten medications from any past date. Maintain complete adherence records even if you forget to log in real-time.'
				},
				{
					icon: RotateCcw,
					title: 'Session Control',
					description:
						'Full session lifecycle management: create, edit, end, or restart sessions. Manage multiple treatment periods with complete data separation.'
				},
				{
					icon: Cloud,
					title: 'Smart Backup',
					description:
						'Automatic cloud backup triggers 15 seconds after any change for logged-in users. Your data is always safe without manual saving.'
				},
				{
					icon: TrendingUp,
					title: 'Intelligent Scheduling',
					description:
						'AI-powered frequency parsing suggests optimal times ("twice daily" → 9 AM & 9 PM). Auto-calculates total doses and prevents schedule conflicts.'
				}
			],
			tips: [
				{ text: 'The app learns your patterns and suggests better medication times' },
				{ text: 'Use "View Schedule" to see all doses at once and manage bulk operations' },
				{ text: 'Auto-backup works in the background - focus on your health, not saving data' },
				{
					text: 'Reschedule individual doses for temporary changes, edit medications for permanent ones'
				},
				{ text: 'Session restart is perfect for continuing treatments after breaks' }
			]
		}
	]
};
