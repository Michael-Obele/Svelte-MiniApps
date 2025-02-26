import {
	CodeIcon,
	RocketIcon,
	UserIcon,
	SearchIcon,
	WrenchIcon,
	CircleSlashIcon
} from 'lucide-svelte';

export const items = [
	{
		title: 'Offline-First Architecture',
		description:
			'Complete rebuild focusing on offline capabilities and local-first data management. Users can use the nuke button to clear cached data if they notice issues with the app.',
		className: 'md:col-span-2',
		color: 'from-blue-500/20 via-transparent',
		icon: CodeIcon
	},
	{
		title: 'Enhanced Performance',
		description: 'Optimized load times and responsiveness through local data management.',
		className: 'md:col-span-1',
		color: 'from-purple-500/20 via-transparent',
		icon: RocketIcon
	},
	{
		title: 'Svelte 5 Migration',
		description: 'Complete upgrade to Svelte 5 with modern features and optimizations.',
		className: 'md:col-span-1',
		color: 'from-green-500/20 via-transparent',
		icon: SearchIcon
	},
	{
		title: 'Local Data Persistence',
		description: 'Robust local storage implementation with IndexedDB and background sync.',
		className: 'md:col-span-1',
		color: 'from-yellow-500/20 via-transparent',
		icon: WrenchIcon
	},
	{
		title: 'PWA Support',
		description: 'Full Progressive Web App capabilities with offline support and installability.',
		className: 'md:col-span-1',
		color: 'from-red-500/20 via-transparent',
		icon: CircleSlashIcon
	}
];

// Utility function to determine icon style based on type.
export const getTypeStyles = (type: string) => {
	switch (type) {
		case 'breaking':
			return 'text-destructive';
		case 'feature':
			return 'text-green-500';
		case 'improvement':
			return 'text-blue-500';
		case 'deprecation':
			return 'text-yellow-500';
		default:
			return 'text-foreground';
	}
};

export type TimelineItem = {
	date: string;
	title: string;
	description: string;
	items: string[];
	type: 'breaking' | 'feature' | 'improvement' | 'deprecation';
	icon: typeof RocketIcon; // one of the lucide-svelte icons
	color: string;
};

export const timeline: TimelineItem[] = [
	{
		date: 'February 10, 2025',
		title: 'Svelte Hack 2024 - 4th Place Winner!',
		description: 'Recognized for excellence in Svelte 5 migration with our Migration Magician entry',
		items: [
			'Earned 4th place in the prestigious Svelte Hack 2024 competition',
			'Recognized for our innovative approach to Svelte 4 to Svelte 5 migration',
			'Implemented comprehensive runes adoption across the codebase',
			'Showcased offline-first architecture with robust local data persistence',
			'Demonstrated modern UI/UX with Svelte 5 features and shadcn-svelte components'
		],
		type: 'feature',
		icon: RocketIcon,
		color: 'from-purple-500 to-pink-500'
	},
	{
		date: 'January 16-19, 2025',
		title: 'Enhancements and Refactoring Across Apps',
		description: 'Focused on improving functionality, user interface, and code quality',
		items: [
			'Enhanced Markdown editor with Carta-MD integration for better editing and preview capabilities',
			'Updated currency conversion logic with easy-currencies library for improved accuracy',
			'Refactored NukeButton for better data clearing functionality and visual design',
			'Enhanced GitHub contribution tracker with toast notifications and dynamic year updates',
			'Introduced Partytown for web worker management and Google Tag Manager for analytics',
			'Repositioned GitHub link in footer for better visibility',
			'Refactored GitGraph component for improved responsiveness and code cleanliness',
			'Updated dependencies, including Svelte and TypeScript libraries'
		],
		type: 'improvement',
		icon: CodeIcon,
		color: 'from-blue-500 to-cyan-500'
	},
	{
		date: 'January 1-15, 2025',
		title: 'User Experience and Codebase Refinement',
		description: 'Implemented user-focused features and cleaned up code structure',
		items: [
			'Corrected pluralization logic for GitHub contributions to ensure grammatical accuracy',
			'Added robots.txt for better SEO and web crawler management',
			'Optimized and cleaned up code for GitHub contribution tracker, including unused files',
			'Improved password generator for better readability and consistency',
			'Refactored UI elements for responsive design, notably in the heat map for contributions',
			'Enhanced user role management in registration and session handling',
			'Improved service worker functionality with error handling and update notifications',
			'Removed unused components, interfaces, and imports to streamline the codebase',
			'Refined feature flag logic to include privileged user roles'
		],
		type: 'feature',
		icon: UserIcon,
		color: 'from-green-500 to-lime-500'
	},
	{
		date: 'December 29, 2024 - January 1, 2025',
		title: 'Codebase Refactoring and UX Improvements',
		description:
			'Refactoring for code clarity, adding documentation, and enhancing user experience',
		items: [
			'Refactored import paths for consistency across components',
			'Introduced command dialog components for enhanced command functionality',
			'Updated UI colors to green for a cohesive design',
			'Added keyboard shortcut for search input focus',
			'Enhanced error handling in NukeButton for data integrity',
			'Introduced CONTRIBUTING.md and enhanced README for better contributor guidance',
			'Refactored mantra and welcome components for cleaner state management',
			'Updated dependencies and improved UI with new command shortcut component'
		],
		type: 'deprecation',
		icon: CircleSlashIcon,
		color: 'from-green-500 to-lime-500'
	},
	{
		date: 'December 22-25, 2024',
		title: 'UI Enhancements and Feature Additions',
		description:
			'Focused on improving user interface, adding new features, and enhancing interactivity',
		items: [
			'Enhanced GitHub tracker with dark mode support and better tooltips',
			'Added comprehensive Drawer component suite for improved UI consistency',
			'Updated Navbar for dark mode compatibility',
			'Introduced feature flags with visibility control for dynamic UI management',
			'Improved markdown editor with new components and responsive design',
			'Added currency symbol helper in budget tracker for better financial data presentation',
			'Enhanced service worker logic for better offline experience and caching',
			'Refined state management in reactive declarations for better app performance'
		],
		type: 'feature',
		icon: RocketIcon,
		color: 'from-blue-500 to-indigo-500'
	},
	{
		date: 'December 19-22, 2024',
		title: 'Feature Enhancements and UI Refactoring',
		description:
			'Improved user interaction, added new components, and enhanced service worker functionality',
		items: [
			'Enhanced service worker update mechanism with hash checks and client notifications',
			'Improved budget tracker UI with better input handling and visual feedback',
			'Refactored to-do list with custom UI components for better organization',
			'Added custom columns to to-do list for dynamic task management',
			"Introduced 'Under Construction' component for informing users about ongoing development",
			'Added advanced emoji tools with new context menu and keyboard interactions'
		],
		type: 'feature',
		icon: SearchIcon,
		color: 'from-blue-500 to-indigo-500'
	},
	{
		date: 'December 14-17, 2024',
		title: 'Codebase Refactoring and New Features',
		description: 'Focused on code quality, new functionalities, and project setup',
		items: [
			'Simplified mantra retrieval logic for better readability',
			'Optimized Navbar button whitespace for cleaner UI',
			'Introduced pixel-to-rem conversion setting for responsive design',
			'Added SEO guidelines and constants for enhanced visibility',
			'Implemented to-do list with local storage persistence for task management',
			'Enhanced password management with new UI features and security measures',
			'Refactored OAuth callback handler for GitHub to improve maintainability',
			'Updated service worker hash output path for deployment consistency'
		],
		type: 'improvement',
		icon: WrenchIcon,
		color: 'from-green-500 to-lime-500'
	},
	{
		date: 'December 14, 2024',
		title: 'Mantra Functionality, Database Refactoring, and UI Enhancements',
		description:
			'Introduced new features for user interaction, database changes, and improved UI components',
		items: [
			'Added functionality to like mantras with database updates',
			'Migrated database to SQLite, added Mantras table, and user feedback form',
			'Modularized about-page components for better UX',
			'Removed service-worker-hash.json file to clean up the project structure',
			'Updated service worker hash file path for consistency'
		],
		type: 'breaking',
		icon: CircleSlashIcon,
		color: 'from-blue-500 to-indigo-500'
	},
	{
		date: 'December 12-13, 2024',
		title: 'Service Worker, UI Styling, and Project Setup Enhancements',
		description: 'Focused on improving service worker logic, styling, and project configuration',
		items: [
			'Enhanced service worker notification system with better version management',
			'Simplified service worker hash generation and update logic',
			'Added enhanced-images package for better image handling in Svelte',
			'Introduced new components and images for the about page',
			'Improved HTML and CSS styling for better code readability',
			'Updated build scripts and dependencies for compatibility and efficiency',
			'Added password generation button to the random password generator'
		],
		type: 'improvement',
		icon: WrenchIcon,
		color: 'from-green-500 to-lime-500'
	},
	{
		date: 'December 11, 2024',
		title: 'Enhanced Data Management & Troubleshooting',
		description: 'Improved user control over app data and caching',
		items: [
			'Added comprehensive Nuke Button functionality to clear all cached data',
			'Clear caches, localStorage, sessionStorage, and IndexedDB data',
			'Automatic service worker unregistration for fresh starts',
			'Added user guidance for troubleshooting app issues'
		],
		type: 'breaking',
		icon: CircleSlashIcon,
		color: 'from-red-500 to-orange-500'
	},
	{
		date: 'December 10, 2024',
		title: 'Password Generator Reimplementation & Clipboard Utility',
		description: 'Complete overhaul of password generator and enhanced clipboard functionality',
		items: [
			'Reimplemented password generator with modern UI components and enhanced features',
			'Added versatile copyToClipboard utility function with toast notifications',
			'Implemented dynamic password strength indicators and character options',
			'Integrated slider component for flexible password length control',
			'Refactored emoji and password generators to use the new clipboard utility'
		],
		type: 'feature',
		icon: RocketIcon,
		color: 'from-violet-500 to-fuchsia-500'
	},
	{
		date: 'December 4, 2024',
		title: 'QR Code Generator Enhancement',
		description: 'Major improvements to QR code generation and social links functionality',
		items: [
			'Added QR code display component for improved modularity',
			'Implemented social links database with comprehensive management',
			'Created API endpoints for social links handling',
			'Enhanced QR code generator with text and social links input'
		],
		type: 'feature',
		icon: RocketIcon,
		color: 'from-blue-500 to-cyan-500'
	},
	{
		date: 'December 1-3, 2024',
		title: 'Currency Converter & Emoji Tools',
		description: 'New features and improvements to existing apps',
		items: [
			'Enhanced currency conversion with caching and user-agent rotation',
			'Added advanced emoji transformation features',
			'Implemented emoji checker functionality',
			'Added pattern validation for currency amounts'
		],
		type: 'improvement',
		icon: WrenchIcon,
		color: 'from-orange-500 to-yellow-500'
	},
	{
		date: 'November 29-30, 2024',
		title: 'Core Infrastructure Updates',
		description: 'Major backend and infrastructure improvements',
		items: [
			'Implemented English dictionary with caching',
			'Added health check endpoint',
			'Enhanced service worker functionality',
			'Switched from drizzle-orm to Prisma for better database management'
		],
		type: 'improvement',
		icon: WrenchIcon,
		color: 'from-green-500 to-lime-500'
	},
	{
		date: 'November 24-27, 2024',
		title: 'Authentication & UI Enhancement',
		description: 'Major user experience and authentication improvements',
		items: [
			'Implemented user authentication system',
			'Added user profile components',
			'Created offline page component',
			'Enhanced navbar with user context'
		],
		type: 'feature',
		icon: RocketIcon,
		color: 'from-yellow-500 to-amber-500'
	},
	{
		date: 'November 23-24, 2024',
		title: 'UI/UX Improvements',
		description: 'Enhanced visual feedback and animations',
		items: [
			'Added new Lottie animations for improved UI feedback',
			'Implemented trending, repository, and hover animations',
			'Updated welcome message and about page layout',
			'Added alert component with description support'
		],
		type: 'feature',
		icon: RocketIcon,
		color: 'from-red-500 to-pink-500'
	}
];

export const updates = [
	{
		category: 'Svelte Hack 2024 Achievement',
		items: [
			'4th place winner in the Svelte Hack 2024 Migration Magician category',
			'Recognized for innovative Svelte 5 migration approach and offline-first architecture'
		]
	},
	{
		category: 'Major Refactoring',
		items: [
			'Revamped code quality with widespread component refactors',
			'Optimized service worker and asset caching for improved offline support'
		]
	},
	{
		category: 'User Experience Enhancements',
		items: [
			'Streamlined UI design and navigation for an intuitive experience',
			'Enhanced offline indicators and interaction feedback'
		]
	},

];
