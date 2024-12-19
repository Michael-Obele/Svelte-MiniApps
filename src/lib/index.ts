// place files you want to import through the `$lib` alias in this folder.
// place files you want to import through the `$lib` alias in this folder.
export const sitename = 'Svelte MiniApps';

export const siteurl = 'https://svelte-apps.me/';

export const siteimage = 'https://i.ibb.co/ZhhhnCz/svelte-badge.png';

export const done = [
	'random-password-generator',
	'github-contribution-tracker',
	'qr-code-generator',
	'english-dictionary-app',
	'random-emoji-generator',
	'currency-converter',
	'advanced-emoji-tools',
	'budget-tracker',
	'todo-list'
];
//
export type Project = {
	title: string;
	details: string;
	tag: string;
	difficulty: 'easy' | 'medium' | 'hard';
	link:string;
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
		details: 'Visualizes your GitHub contributions in a way that is easy to understand and engaging. It helps you track streaks, find patterns, and stay motivated.',
		tag: 'developer-tools',
		difficulty: 'medium',
		link: 'github-contribution-tracker'
	},
	{
		title: 'Markdown Editor',
		details: 'Allows you to edit and view markdown files easily. Great for writing notes, to-do lists, or even creative projects.',
		tag: 'utility',
		difficulty: 'medium',
		link: 'markdown-editor'
	},
	{
		title: 'English Dictionary App',
		details: 'Web app that retrieves word definitions, pronunciation, and audio using an API. It also implements loading effects, error handling, and Web Speech API for audio playback.',
		tag: 'productivity',
		difficulty: 'hard',
		link: 'dictionary-app'
	},
	{
		title: 'Pomodoro Timer',
		details: 'Creates a timer with a countdown and lets you set customizable work/break intervals. It also uses audio notifications to alert you.',
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
		details: 'Lets you play the classic rock, paper, scissors game against the computer and shows the outcome.',
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
		details: 'Helps you manage your recipes by letting you create, organize, and potentially convert them into instructions.',
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

//

export function truncateText(text: string, maxLength: number) {
	const originalText = text || '';
	if (originalText.length > maxLength) {
		return originalText.slice(0, maxLength - 3) + '...';
	}
	return originalText;
}

//
