import {
	ListTodo,
	CheckSquare,
	Filter,
	Sparkles,
	Plus,
	Trash2,
	type Icon as IconType
} from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Add a Task',
		description:
			'Type your task in the input field at the top and press <strong>Enter</strong> or click the <strong>Add</strong> button.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Organize Tasks',
		description:
			'Your task appears in the list below. Add as many tasks as you need - they are all saved automatically.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Start Completing!',
		description:
			'Click the checkbox next to any task to mark it as complete. Simple and effective!',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// Managing Tasks Steps
const managingSteps: Step[] = [
	{
		number: 1,
		title: 'Complete Tasks',
		description:
			'Click the <strong>checkbox</strong> to mark tasks as done. Completed tasks show with a line through them.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 2,
		title: 'Edit Tasks',
		description:
			'Click on any task text to edit it directly. Changes save automatically as you type.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	},
	{
		number: 3,
		title: 'Delete Tasks',
		description:
			'Click the <strong>trash icon</strong> next to any task to remove it from your list permanently.',
		color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
	}
];

// Management Features
const managementFeatures: Feature[] = [
	{
		icon: Filter,
		title: 'Filter Tasks',
		description:
			'Use the filter buttons to view <strong>All</strong>, <strong>Active</strong>, or <strong>Completed</strong> tasks only.'
	},
	{
		icon: CheckSquare,
		title: 'Track Progress',
		description:
			'See your progress at a glance with the task counter showing completed vs total tasks.'
	},
	{
		icon: Trash2,
		title: 'Clear Completed',
		description:
			'Use the "Clear Completed" button to quickly remove all finished tasks from your list.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{ text: 'Break large tasks into smaller, manageable pieces' },
	{ text: 'Review and update your list daily for best results' },
	{ text: 'Use clear, actionable language for each task' },
	{ text: 'Your tasks are saved automatically in your browser' },
	{ text: 'Complete tasks regularly to maintain momentum' }
];

export const todoListHowToUse: HowToUseConfig = {
	title: 'Todo List Guide',
	description: 'Learn how to organize and manage your tasks effectively',
	storageKey: 'todo-list-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: Plus,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with 3-5 important tasks for today. You can always add more as you complete them!',
				icon: ListTodo
			}
		},
		{
			value: 'manage',
			label: 'Manage',
			icon: CheckSquare,
			steps: managingSteps
		},
		{
			value: 'tips',
			label: 'Tips',
			icon: Sparkles,
			features: managementFeatures,
			tips: quickTips
		}
	]
};
