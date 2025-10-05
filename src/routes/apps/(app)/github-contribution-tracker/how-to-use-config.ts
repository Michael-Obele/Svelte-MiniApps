import { Github, Calendar, BarChart3, TrendingUp, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Enter Username',
		description: 'Type a GitHub username in the username field.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Select Year',
		description: 'Choose the year you want to analyze (from 2008 to current year).',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Track Contributions',
		description: 'Click "Track Contributions" to view the contribution graph and statistics.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Understanding Charts Steps
const chartSteps: Step[] = [
	{
		number: 1,
		title: 'Contribution Graph',
		description: 'View the GitHub-style contribution calendar showing daily activity.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Monthly Breakdown',
		description: 'Check the bar chart showing contributions per month.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Statistics Panel',
		description: 'Review total contributions, streaks, and activity patterns.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Key Features
const keyFeatures: Feature[] = [
	{
		icon: Github,
		title: 'GitHub Integration',
		description: 'Connect directly with GitHub to fetch real contribution data.'
	},
	{
		icon: Calendar,
		title: 'Contribution Calendar',
		description: 'Visual calendar showing daily contributions just like GitHub.'
	},
	{
		icon: BarChart3,
		title: 'Monthly Analytics',
		description: 'Bar charts displaying contribution patterns by month.'
	},
	{
		icon: TrendingUp,
		title: 'Activity Insights',
		description: 'Statistics on total contributions, streaks, and activity levels.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Try your own username or explore popular open source contributors' },
	{ text: 'Years from 2008 onwards are supported (when GitHub launched)' },
	{ text: 'Green squares represent contribution levels (darker = more active)' },
	{ text: 'Hover over calendar squares to see exact contribution counts' },
	{ text: 'Use the navigation buttons to explore different years' }
];

export const githubContributionTrackerHowToUse: HowToUseConfig = {
	title: 'GitHub Tracker Guide',
	description: 'Visualize GitHub contribution patterns',
	storageKey: 'github-contribution-tracker-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Get Started',
			icon: Github,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with popular usernames like "torvalds", "gaearon", or "tj" to see impressive contribution graphs!'
			}
		},
		{
			value: 'charts',
			label: 'Understanding Charts',
			icon: BarChart3,
			steps: chartSteps,
			optionalDetails: [
				{
					label: 'Color Coding',
					description: 'Green intensity shows contribution level (light to dark green)'
				},
				{ label: 'Calendar Layout', description: 'Weeks run left to right, months are labeled' },
				{ label: 'Data Source', description: "Uses GitHub's public contribution API" }
			]
		},
		{
			value: 'features',
			label: 'Features',
			icon: TrendingUp,
			features: keyFeatures,
			tips: quickTips
		}
	]
};
