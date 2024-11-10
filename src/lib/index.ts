// place files you want to import through the `$lib` alias in this folder.
// place files you want to import through the `$lib` alias in this folder.
export const sitename = 'svelte-apps.me';

export const siteurl = 'https://svelte-apps.me/';

export const siteimage = 'https://i.ibb.co/ZhhhnCz/svelte-badge.png';

export const done = [
	'Random Password Generator',
	'GitHub Contribution Tracker',
	'QR Code Generator',
	'English Dictionary App',
	'Random Emoji Generator',
	'Currency Converter',
	'Advanced Emoji Tools',
	'Budget Tracker'
];
//
export type Project = {
	title: string;
	details: string;
	tag: string;
	difficulty: 'easy' | 'medium' | 'hard';
};

export const projects: Project[] = [
	{
		title: 'Unit Converter',
		details: 'Converts between various units (length, temperature, volume, etc.)',
		tag: 'utility',
		difficulty: 'easy'
	},
	{
		title: 'Budget Tracker',
		details: 'Create and manage budgets, track expenses, and monitor your remaining balance.',
		tag: 'finance',
		difficulty: 'medium'
	},
	{
		title: 'Random Password Generator',
		details: 'Generates secure passwords with customizable length and complexity.',
		tag: 'security',
		difficulty: 'easy'
	},
	{
		title: 'Advanced Emoji Tools',
		details: 'This mini-app offers advanced features for working with emojis.',
		tag: 'utility',
		difficulty: 'medium'
	},
	{
		title: 'Color Picker',
		details: 'Lets you choose a color and shows its HEX code or RGB values.',
		tag: 'design',
		difficulty: 'easy'
	},
	{
		title: 'Checklist Maker',
		details: 'Allows you to create checklists and mark items as completed.',
		tag: 'productivity',
		difficulty: 'easy'
	},
	{
		title: 'Text Summarizer',
		details: 'Creates a shorter version of a text by keeping within a word limit.',
		tag: 'utility',
		difficulty: 'easy'
	},
	{
		title: 'Morse Code Translator',
		details: 'Translates between text and Morse code.',
		tag: 'education',
		difficulty: 'easy'
	},
	{
		title: 'Countdown Timer',
		details: 'Sets a timer with a countdown and shows progress visually.',
		tag: 'productivity',
		difficulty: 'medium'
	},
	{
		title: 'Currency Converter',
		details: 'Gets live exchange rates and converts between different currencies.',
		tag: 'finance',
		difficulty: 'medium'
	},
	{
		title: 'BMI Calculator',
		details: 'Calculates your Body Mass Index based on your height and weight.',
		tag: 'health',
		difficulty: 'medium'
	},
	{
		title: 'Music Player',
		details: 'Plays audio files stored on your device and lets you browse them.',
		tag: 'multimedia',
		difficulty: 'medium'
	},
	{
		title: 'QR Code Generator',
		details: 'Creates QR codes that contain URLs, text, or vCards.',
		tag: 'utility',
		difficulty: 'medium'
	},
	{
		title: 'To-Do List with Persistence',
		details: 'Lets you create and manage to-do items, and saves them for later use.',
		tag: 'productivity',
		difficulty: 'medium'
	},
	{
		title: 'Habit Tracker',
		details: 'Tracks your daily habits and shows your progress over time.',
		tag: 'productivity',
		difficulty: 'hard'
	},
	{
		title: 'Photo Editor',
		details: 'Provides basic tools like cropping, resizing, and applying filters to edit photos.',
		tag: 'design',
		difficulty: 'hard'
	},
	{
		title: 'Wikipedia Article Explorer',
		details: 'Lets you search Wikipedia and explore linked articles visually.',
		tag: 'education',
		difficulty: 'hard'
	},
	{
		title: 'Math Equation Solver',
		details: 'Solves simple math equations and shows the steps to get the answer.',
		tag: 'education',
		difficulty: 'hard'
	},
	{
		title: 'Simple Drawing App',
		details: 'Lets you create basic drawings using lines, shapes, and colors.',
		tag: 'design',
		difficulty: 'hard'
	},
	{
		title: 'GitHub Contribution Tracker',
		details:
			'Visualizes your GitHub contributions in a way that is easy to understand and engaging. It helps you track streaks, find patterns, and stay motivated.',
		tag: 'developer-tools',
		difficulty: 'medium'
	},
	{
		title: 'Markdown Editor',
		details:
			'Allows you to edit and view markdown files easily. Great for writing notes, to-do lists, or even creative projects.',
		tag: 'utility',
		difficulty: 'medium'
	},
	{
		title: 'English Dictionary App',
		details:
			'Web app that retrieves word definitions, pronunciation, and audio using an API. It also implements loading effects, error handling, and Web Speech API for audio playback.',
		tag: 'productivity',
		difficulty: 'hard'
	},
	{
		title: 'Pomodoro Timer',
		details:
			'Creates a timer with a countdown and lets you set customizable work/break intervals. It also uses audio notifications to alert you.',
		tag: 'productivity',
		difficulty: 'easy'
	},
	{
		title: 'Random Emoji Generator',
		details: 'Generates a random emoji with a single click.',
		tag: 'fun',
		difficulty: 'easy'
	},
	{
		title: 'Age Calculator',
		details: 'Calculates your age based on the date you were born.',
		tag: 'math',
		difficulty: 'easy'
	},
	{
		title: 'Rock Paper Scissors Game',
		details:
			'Lets you play the classic rock, paper, scissors game against the computer and shows the outcome.',
		tag: 'game',
		difficulty: 'easy'
	},
	{
		title: 'Dice Roll Simulator',
		details: 'Simulates rolling dice and visually shows the result.',
		tag: 'game',
		difficulty: 'easy'
	},
	{
		title: 'Recipe Book Organizer',
		details:
			'Helps you manage your recipes by letting you create, organize, and potentially convert them into instructions.',
		tag: 'productivity',
		difficulty: 'medium'
	}
];

//

export function truncateText(text: string, maxLength: number) {
	const originalText = text || '';
	if (originalText.length > maxLength) {
		return originalText.slice(0, maxLength - 3) + '...';
	}
	return originalText;
}

//

export const googleSVG =
	'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkNhcGFfMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTUwIDE1MDsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzFBNzNFODt9Cgkuc3Qxe2ZpbGw6I0VBNDMzNTt9Cgkuc3Qye2ZpbGw6IzQyODVGNDt9Cgkuc3Qze2ZpbGw6I0ZCQkMwNDt9Cgkuc3Q0e2ZpbGw6IzM0QTg1Mzt9Cgkuc3Q1e2ZpbGw6IzRDQUY1MDt9Cgkuc3Q2e2ZpbGw6IzFFODhFNTt9Cgkuc3Q3e2ZpbGw6I0U1MzkzNTt9Cgkuc3Q4e2ZpbGw6I0M2MjgyODt9Cgkuc3Q5e2ZpbGw6I0ZCQzAyRDt9Cgkuc3QxMHtmaWxsOiMxNTY1QzA7fQoJLnN0MTF7ZmlsbDojMkU3RDMyO30KCS5zdDEye2ZpbGw6I0Y2QjcwNDt9Cgkuc3QxM3tmaWxsOiNFNTQzMzU7fQoJLnN0MTR7ZmlsbDojNDI4MEVGO30KCS5zdDE1e2ZpbGw6IzM0QTM1Mzt9Cgkuc3QxNntjbGlwLXBhdGg6dXJsKCNTVkdJRF8yXyk7fQoJLnN0MTd7ZmlsbDojMTg4MDM4O30KCS5zdDE4e29wYWNpdHk6MC4yO2ZpbGw6I0ZGRkZGRjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDE5e29wYWNpdHk6MC4zO2ZpbGw6IzBENjUyRDtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDIwe2NsaXAtcGF0aDp1cmwoI1NWR0lEXzRfKTt9Cgkuc3QyMXtvcGFjaXR5OjAuMztmaWxsOnVybCgjXzQ1X3NoYWRvd18xXyk7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3QyMntjbGlwLXBhdGg6dXJsKCNTVkdJRF82Xyk7fQoJLnN0MjN7ZmlsbDojRkE3QjE3O30KCS5zdDI0e29wYWNpdHk6MC4zO2ZpbGw6IzE3NEVBNjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDI1e29wYWNpdHk6MC4zO2ZpbGw6I0E1MEUwRTtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDI2e29wYWNpdHk6MC4zO2ZpbGw6I0UzNzQwMDtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDI3e2ZpbGw6dXJsKCNGaW5pc2hfbWFza18xXyk7fQoJLnN0Mjh7ZmlsbDojRkZGRkZGO30KCS5zdDI5e2ZpbGw6IzBDOUQ1ODt9Cgkuc3QzMHtvcGFjaXR5OjAuMjtmaWxsOiMwMDRENDA7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3QzMXtvcGFjaXR5OjAuMjtmaWxsOiMzRTI3MjM7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3QzMntmaWxsOiNGRkMxMDc7fQoJLnN0MzN7b3BhY2l0eTowLjI7ZmlsbDojMUEyMzdFO2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAgICA7fQoJLnN0MzR7b3BhY2l0eTowLjI7fQoJLnN0MzV7ZmlsbDojMUEyMzdFO30KCS5zdDM2e2ZpbGw6dXJsKCNTVkdJRF83Xyk7fQoJLnN0Mzd7ZmlsbDojRkJCQzA1O30KCS5zdDM4e2NsaXAtcGF0aDp1cmwoI1NWR0lEXzlfKTtmaWxsOiNFNTM5MzU7fQoJLnN0Mzl7Y2xpcC1wYXRoOnVybCgjU1ZHSURfMTFfKTtmaWxsOiNGQkMwMkQ7fQoJLnN0NDB7Y2xpcC1wYXRoOnVybCgjU1ZHSURfMTNfKTtmaWxsOiNFNTM5MzU7fQoJLnN0NDF7Y2xpcC1wYXRoOnVybCgjU1ZHSURfMTVfKTtmaWxsOiNGQkMwMkQ7fQo8L3N0eWxlPjxnPjxwYXRoIGNsYXNzPSJzdDE0IiBkPSJNMTIwLDc2LjFjMC0zLjEtMC4zLTYuMy0wLjgtOS4zSDc1Ljl2MTcuN2gyNC44Yy0xLDUuNy00LjMsMTAuNy05LjIsMTMuOWwxNC44LDExLjUgICBDMTE1LDEwMS44LDEyMCw5MCwxMjAsNzYuMUwxMjAsNzYuMXoiLz48cGF0aCBjbGFzcz0ic3QxNSIgZD0iTTc1LjksMTIwLjljMTIuNCwwLDIyLjgtNC4xLDMwLjQtMTEuMUw5MS41LDk4LjRjLTQuMSwyLjgtOS40LDQuNC0xNS42LDQuNGMtMTIsMC0yMi4xLTguMS0yNS44LTE4LjkgICBMMzQuOSw5NS42QzQyLjcsMTExLjEsNTguNSwxMjAuOSw3NS45LDEyMC45eiIvPjxwYXRoIGNsYXNzPSJzdDEyIiBkPSJNNTAuMSw4My44Yy0xLjktNS43LTEuOS0xMS45LDAtMTcuNkwzNC45LDU0LjRjLTYuNSwxMy02LjUsMjguMywwLDQxLjJMNTAuMSw4My44eiIvPjxwYXRoIGNsYXNzPSJzdDEzIiBkPSJNNzUuOSw0Ny4zYzYuNS0wLjEsMTIuOSwyLjQsMTcuNiw2LjlMMTA2LjYsNDFDOTguMywzMy4yLDg3LjMsMjksNzUuOSwyOS4xYy0xNy40LDAtMzMuMiw5LjgtNDEsMjUuMyAgIGwxNS4yLDExLjhDNTMuOCw1NS4zLDYzLjksNDcuMyw3NS45LDQ3LjN6Ii8+PC9nPjwvc3ZnPg==';
