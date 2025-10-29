import { LucideTable, LucideBookmarkCheck } from '@lucide/svelte';

// place files you want to import through the `$lib` alias in this folder.
export const site = {
	name: 'Svelte Mini Apps',
	url: 'https://svelte-apps.me',
	image: 'https://i.ibb.co/ZhhhnCz/svelte-badge.png',
	author: 'Michael Obele',
	description: 'A collection of mini applications built with Svelte',
	twitterUsername: 'Dev_Obele',
	githubUsername: 'Michael-Obele',
	repository: 'https://github.com/Michael-Obele/Svelte-MiniApps',
	themeColor: '#1e293b'
};

/**
 * An array of completed mini-apps, each represented by an object containing the app's name,
 * its completion time as an ISO 8601 date string, and optionally an update time.
 */
export const done = [
	{ name: 'random-password-generator', time: '2025-07-15T00:00:00.000Z' },
	{ name: 'github-contribution-tracker', time: '2025-08-20T00:00:00.000Z' },
	{ name: 'qr-code-generator', time: '2025-07-10T00:00:00.000Z' },
	{ name: 'dictionary-app', time: '2025-09-05T00:00:00.000Z' },
	{ name: 'random-emoji-generator', time: '2025-08-01T00:00:00.000Z' },
	{ name: 'currency-converter', time: '2025-07-25T00:00:00.000Z' },
	{ name: 'advanced-emoji-tools', time: '2025-09-15T00:00:00.000Z' },
	{ name: 'budget-tracker', time: '2025-08-10T00:00:00.000Z' },
	{ name: 'todo-list', time: '2025-07-05T00:00:00.000Z' },
	{ name: 'markdown-editor', time: '2025-09-20T00:00:00.000Z' },
	{ name: 'text-summarizer', time: '2025-08-15T00:00:00.000Z' },
	{ name: 'unit-converter', time: '2025-07-20T00:00:00.000Z', update: '2025-10-15T00:00:00.000Z' },
	{ name: 'purchase-tracker', time: '2025-09-10T00:00:00.000Z' },
	{ name: 'medication-tracker', time: '2025-10-05T00:00:00.000Z' },
	{ name: 'smoke-free-tracker', time: '2025-10-11T00:00:00.000Z' }
];
//
export type Project = {
	title: string;
	details: string;
	tag: string;
	difficulty: 'easy' | 'medium' | 'hard';
	link: string;
};

export const projects: Project[] = [
	{
		title: 'Unit Converter',
		details: 'Converts between various units (length, temperature, volume, etc.)',
		tag: 'utility',
		difficulty: 'easy',
		link: 'unit-converter'
	},
	{
		title: 'Budget Tracker',
		details: 'Create and manage budgets, track expenses, and monitor your remaining balance.',
		tag: 'finance',
		difficulty: 'medium',
		link: 'budget-tracker'
	},
	{
		title: 'Purchase Tracker',
		details:
			'Track your purchases over time with detailed records including costs, quantities, and automatic timestamps for better expense management.',
		tag: 'finance',
		difficulty: 'medium',
		link: 'purchase-tracker'
	},
	{
		title: 'Medication Tracker',
		details:
			'Track your medications during treatment sessions. Manage multiple medications, schedule doses, monitor adherence, and never miss a dose.',
		tag: 'health',
		difficulty: 'medium',
		link: 'medication-tracker'
	},
	{
		title: 'Smoke-Free Tracker',
		details:
			'Track your smoke-free journey with real-time streak counting, health milestones, craving management, and motivational support to help you quit smoking.',
		tag: 'health',
		difficulty: 'medium',
		link: 'smoke-free-tracker'
	},
	{
		title: 'Random Password Generator',
		details: 'Generates secure passwords with customizable length and complexity.',
		tag: 'security',
		difficulty: 'easy',
		link: 'random-password-generator'
	},
	{
		title: 'Advanced Emoji Tools',
		details: 'This mini-app offers advanced features for working with emojis.',
		tag: 'utility',
		difficulty: 'medium',
		link: 'advanced-emoji-tools'
	},
	{
		title: 'Color Picker',
		details: 'Lets you choose a color and shows its HEX code or RGB values.',
		tag: 'design',
		difficulty: 'easy',
		link: 'color-picker'
	},
	{
		title: 'Checklist Maker',
		details: 'Allows you to create checklists and mark items as completed.',
		tag: 'productivity',
		difficulty: 'easy',
		link: 'checklist-maker'
	},
	{
		title: 'Text Summarizer',
		details: 'Creates a shorter version of a text by keeping within a word limit.',
		tag: 'utility',
		difficulty: 'easy',
		link: 'text-summarizer'
	},
	{
		title: 'Morse Code Translator',
		details: 'Translates between text and Morse code.',
		tag: 'education',
		difficulty: 'easy',
		link: 'morse-code-translator'
	},
	{
		title: 'Countdown Timer',
		details: 'Sets a timer with a countdown and shows progress visually.',
		tag: 'productivity',
		difficulty: 'medium',
		link: 'countdown-timer'
	},
	{
		title: 'Currency Converter',
		details: 'Gets live exchange rates and converts between different currencies.',
		tag: 'finance',
		difficulty: 'medium',
		link: 'currency-converter'
	},
	{
		title: 'BMI Calculator',
		details: 'Calculates your Body Mass Index based on your height and weight.',
		tag: 'health',
		difficulty: 'medium',
		link: 'bmi-calculator'
	},
	{
		title: 'Music Player',
		details: 'Plays audio files stored on your device and lets you browse them.',
		tag: 'multimedia',
		difficulty: 'medium',
		link: 'music-player'
	},
	{
		title: 'QR Code Generator',
		details: 'Creates QR codes that contain URLs, text, or vCards.',
		tag: 'utility',
		difficulty: 'medium',
		link: 'qr-code-generator'
	},
	{
		title: 'To-Do List with Persistence',
		details: 'Lets you create and manage to-do items, and saves them for later use.',
		tag: 'productivity',
		difficulty: 'medium',
		link: 'todo-list'
	},
	{
		title: 'Habit Tracker',
		details: 'Tracks your daily habits and shows your progress over time.',
		tag: 'productivity',
		difficulty: 'hard',
		link: 'habit-tracker'
	},
	{
		title: 'Photo Editor',
		details: 'Provides basic tools like cropping, resizing, and applying filters to edit photos.',
		tag: 'design',
		difficulty: 'hard',
		link: 'photo-editor'
	},
	{
		title: 'Wikipedia Article Explorer',
		details: 'Lets you search Wikipedia and explore linked articles visually.',
		tag: 'education',
		difficulty: 'hard',
		link: 'wikipedia-explorer'
	},
	{
		title: 'Simple Drawing App',
		details: 'Lets you create basic drawings using lines, shapes, and colors.',
		tag: 'design',
		difficulty: 'hard',
		link: 'drawing-app'
	},
	{
		title: 'GitHub Contribution Tracker',
		details:
			'Visualizes your GitHub contributions in a way that is easy to understand and engaging. It helps you track streaks, find patterns, and stay motivated.',
		tag: 'developer-tools',
		difficulty: 'medium',
		link: 'github-contribution-tracker'
	},
	{
		title: 'Markdown Editor',
		details:
			'Allows you to edit and view markdown files easily. Great for writing notes, to-do lists, or even creative projects.',
		tag: 'utility',
		difficulty: 'medium',
		link: 'markdown-editor'
	},
	{
		title: 'English Dictionary App',
		details:
			'Web app that retrieves word definitions, pronunciation, and audio using an API. It also implements loading effects, error handling, and Web Speech API for audio playback.',
		tag: 'productivity',
		difficulty: 'hard',
		link: 'dictionary-app'
	},
	{
		title: 'Pomodoro Timer',
		details:
			'Creates a timer with a countdown and lets you set customizable work/break intervals. It also uses audio notifications to alert you.',
		tag: 'productivity',
		difficulty: 'easy',
		link: 'pomodoro-timer'
	},
	{
		title: 'Random Emoji Generator',
		details: 'Generates a random emoji with a single click.',
		tag: 'fun',
		difficulty: 'easy',
		link: 'random-emoji-generator'
	},
	{
		title: 'Age Calculator',
		details: 'Calculates your age based on the date you were born.',
		tag: 'math',
		difficulty: 'easy',
		link: 'age-calculator'
	},
	{
		title: 'Rock Paper Scissors Game',
		details:
			'Lets you play the classic rock, paper, scissors game against the computer and shows the outcome.',
		tag: 'game',
		difficulty: 'easy',
		link: 'rock-paper-scissors'
	},
	{
		title: 'Dice Roll Simulator',
		details: 'Simulates rolling dice and visually shows the result.',
		tag: 'game',
		difficulty: 'easy',
		link: 'dice-roller'
	},
	{
		title: 'Recipe Book Organizer',
		details:
			'Helps you manage your recipes by letting you create, organize, and potentially convert them into instructions.',
		tag: 'productivity',
		difficulty: 'medium',
		link: 'recipe-organizer'
	},
	// New Projects
	{
		title: 'Weather App',
		details: 'Displays current weather information based on user location or input city.',
		tag: 'utility',
		difficulty: 'medium',
		link: 'weather-app'
	},
	{
		title: 'Expense Splitter',
		details: 'Helps users split expenses among friends or family and calculates who owes what.',
		tag: 'finance',
		difficulty: 'medium',
		link: 'expense-splitter'
	},
	{
		title: 'Flashcard Quizzer',
		details: 'Allows users to create flashcards for studying and quizzes them on the content.',
		tag: 'education',
		difficulty: 'medium',
		link: 'flashcard-quizzer'
	},
	{
		title: 'Recipe Finder',
		details: 'Lets users search for recipes based on ingredients they have at home.',
		tag: 'productivity',
		difficulty: 'medium',
		link: 'recipe-finder'
	},
	{
		title: 'Fitness Tracker',
		details: 'Tracks workouts, calories burned, and progress over time.',
		tag: 'health',
		difficulty: 'hard',
		link: 'fitness-tracker'
	},
	{
		title: 'Meditation Timer',
		details: 'A timer specifically for meditation sessions with options for different intervals.',
		tag: 'health',
		difficulty: 'easy',
		link: 'meditation-timer'
	}
];

/**
 * Truncates a given text to a specified maximum length.
 *
 * If the text exceeds the specified maximum length, it will be truncated and
 * appended with an ellipsis ('...').
 *
 * @param {string} text - The text to be truncated.
 * @param {number} maxLength - The maximum length of the truncated text.
 * @returns {string} The truncated text.
 *
 * @example
 * truncateText('This is a long text.', 10); // returns 'This is a...'
 * truncateText('Short text', 15); // returns 'Short text'
 */
export function truncateText(text: string, maxLength: number): string {
	const originalText = text || '';
	if (originalText.length > maxLength) {
		return originalText.slice(0, maxLength - 3) + '...';
	}
	return originalText;
}

/**
 * Checks if an app is considered "new" (completed within the last 2-3 weeks).
 *
 * @param {string} appName - The name of the app to check.
 * @returns {boolean} True if the app is new, false otherwise.
 */
export function isNewApp(appName: string): boolean {
	const app = done.find((d) => d.name === appName);
	if (!app) return false;

	const completionDate = new Date(app.time);
	const now = new Date();
	const diffTime = now.getTime() - completionDate.getTime();
	const diffDays = diffTime / (1000 * 3600 * 24);

	// Consider an app "new" if it was completed within the last 21 days (3 weeks)
	return diffDays <= 21;
}

/**
 * Checks if an app was recently updated (updated within the last 7 days).
 *
 * @param {string} appName - The name of the app to check.
 * @returns {boolean} True if the app was recently updated, false otherwise.
 */
export function isRecentlyUpdated(appName: string): boolean {
	const app = done.find((d) => d.name === appName);
	if (!app || !app.update) return false;

	const updateDate = new Date(app.update);
	const now = new Date();
	const diffTime = now.getTime() - updateDate.getTime();
	const diffDays = diffTime / (1000 * 3600 * 24);

	// Consider an app "recently updated" if it was updated within the last 7 days
	return diffDays <= 7;
}

/**
 * Returns a greeting message based on the current time and calculates the time until the next greeting period.
 *
 * @returns An object containing the current greeting and milliseconds until the next greeting period.
 */
export function getGreetingAndNextPeriod(): { greeting: string; millisecondsUntilNext: number } {
	const now = new Date();
	const hour = now.getHours();
	let greeting: string;
	let nextHour: number;

	if (hour >= 0 && hour < 5) {
		greeting = 'Good night';
		nextHour = 5;
	} else if (hour >= 5 && hour < 12) {
		greeting = 'Good morning';
		nextHour = 12;
	} else if (hour >= 12 && hour < 18) {
		greeting = 'Good afternoon';
		nextHour = 18;
	} else {
		greeting = 'Good evening';
		nextHour = 29;
	}

	const nextTime = new Date(now);
	nextTime.setHours(nextHour, 0, 0, 0);
	if (nextHour === 29) {
		nextTime.setDate(nextTime.getDate() + 1);
		nextTime.setHours(5, 0, 0, 0);
	}

	const millisecondsUntilNext = nextTime.getTime() - now.getTime();

	return { greeting, millisecondsUntilNext };
}
