import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Scrolls the page smoothly to the element with the specified ID.
 *
 * @param {string} id - The ID of the element to scroll to.
 */
export function scrollToID(id: string): void {
	const element = document.getElementById(id);
	if (element) {
		element.scrollIntoView({
			behavior: 'smooth', // Smooth scrolling animation
			block: 'start' // Align the top of the element to the top of the viewport
		});
	}
}

/**
 * Copies the provided text to the clipboard, displaying a customizable success or error message.
 * Optionally executes success or error callbacks.
 *
 * @param {string} text - The text to be copied to the clipboard.
 * @param {string} [msg='Text copied to clipboard'] - The success message to be displayed.
 * @param {string} [errorMsg='Failed to copy text'] - The error message to be displayed.
 * @param {function} [onSuccess] - The callback function to be executed on success.
 * @param {function} [onError] - The callback function to be executed on error.
 * @returns {Promise<boolean>} A promise resolving to a boolean indicating whether the copy operation was successful.
 */
export const copyToClipboard = async (
	text: string,
	msg: string = 'Text copied to clipboard',
	errorMsg: string = 'Failed to copy text',
	onSuccess?: () => void,
	onError?: (error: Error) => void
): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(msg);
		if (onSuccess) onSuccess(); // Execute the success callback if provided
		return true; // Indicate success
	} catch (err) {
		toast.error(errorMsg);
		if (onError) onError(err as Error); // Execute the error callback if provided
		console.error('Copy to clipboard failed: ', err);
		return false; // Indicate failure
	}
};

/**
 * Converts an object to a JSON string, handling BigInt values by converting them to strings.
 *
 * @param obj - The object to be stringified.
 * @returns The JSON string representation of the object.
 */
export function stringifyWithBigInt(obj: any): string {
	return JSON.stringify(obj, (key, value) => {
		if (typeof value === 'bigint') {
			return value.toString(); // Convert bigint to string
		}
		return value; // Return other values as is
	});
}

export const isLoading = writable(false);
export const savePassword = writable(false);
export const showPassword = writable(false);

export const seenCookie = persisted<boolean>('seen-cookie', false);
export const seenNewAppAlert = persisted<boolean>('seen-new-app-alert', false);

// A writable store that represents a filter state, initially set to false
export let filter = persisted('filter', 'done');

interface User {
	id: string;
	username: string;
	role: string; // Add the role property
}

export const userContext = persisted<User | null>('user', null);

/**
 * Scrolls the window to the top of the page with a smooth scrolling effect.
 */
export function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // For smooth scrolling
	});
}

/**
 * Creates a function that calls the provided function only once.
 * Subsequent calls will be ignored.
 *
 * @param fn - The function to be called once.
 * @returns A function that calls the original function only once.
 */
export function once<T extends Event>(fn: (event: T) => void): (event: T) => void {
	let called = false;

	return function (this: any, event: T) {
		if (!called) {
			called = true;
			fn.call(this, event);
		}
	};
}

// Usage Example for `once`:
/*
<button onclick={once(() => console.log('This will only log once'))}>Click me multiple times</button>
// Or with preventDefault and scrollToID (as requested):
<a href="#heatmap" onclick={once(preventDefault(() => scrollToID('heatmap')))}>Go to Heatmap (only scrolls once)</a>

// Explanation of combined usage:
// 1. `scrollToID('heatmap')`: This function scrolls the page to the element with the ID "heatmap".
// 2. `preventDefault(...)`: This wrapper prevents the default behavior of the <a> tag (which would be to jump to "#heatmap" instantly).  We want the smooth scroll provided by `scrollToID`.
// 3. `once(...)`: This wrapper ensures that the combined scrolling logic (prevent default and scroll) happens only on the first click. Subsequent clicks on the link will have no effect.

// Important Consideration: In Svelte, it's generally recommended to handle navigation through the Svelte router rather than direct DOM manipulation with scrollToID for better UX and SEO. However, this example demonstrates how 'once', 'preventDefault', and 'scrollToID' can be used together.
*/

/**
 * Creates a function that prevents the default action of an event and then calls the provided function.
 *
 * @template T The type of the event.
 * @param fn The function to be called after preventing the default action.
 * @returns A function that prevents the default action and then calls the provided function.
 */
export function preventDefault<T extends Event>(fn: (event: T) => void): (event: T) => void {
	return function (this: any, event: T) {
		// Explicitly define 'this' type
		event.preventDefault();
		fn.call(this, event);
	};
}

// Usage example for `preventDefault`
/*
<form onsubmit={preventDefault((event) => {
  console.log('Form submitted!', event);
  // ... your form handling logic ...
})}>
  </form>


//Or a simpler example
<a href="https://www.google.com" onmousedown={preventDefault(() => console.log('Prevented default link behavior'))}>Click Me but don't go to google</a>
*/

/**
 * Increments the usage count for a specific app and updates the last used timestamp
 *
 * @param appLink - The link identifier for the app
 * @returns The new usage count for the app
 */
export function incrementAppUsage(appLink: string): number {
	// Get current usage data from localStorage
	const appUsageStore = JSON.parse(localStorage.getItem('app-usage-tracker') || '{}');
	const appLastUsedStore = JSON.parse(localStorage.getItem('app-last-used') || '{}');

	// Update usage count
	const currentCount = appUsageStore[appLink] || 0;
	const newCount = currentCount + 1;
	appUsageStore[appLink] = newCount;

	// Update last used timestamp
	appLastUsedStore[appLink] = new Date().toISOString();

	// Save back to localStorage
	localStorage.setItem('app-usage-tracker', JSON.stringify(appUsageStore));
	localStorage.setItem('app-last-used', JSON.stringify(appLastUsedStore));

	return newCount;
}

/**
 * Gets the top most used apps based on usage count
 *
 * @param limit - Maximum number of apps to return
 * @returns Array of favorite apps with usage data
 */
export function getFavoriteApps(limit = 3) {
	const appUsageStore = JSON.parse(localStorage.getItem('app-usage-tracker') || '{}');
	const projects = JSON.parse(localStorage.getItem('projects') || '[]');

	// Convert to array and sort by usage count
	const appEntries = Object.entries(appUsageStore)
		.map(([appLink, count]) => {
			const appInfo = projects.find((p: any) => p.link === appLink);
			return {
				appLink,
				usageCount: count as number,
				appName: appInfo?.title || 'Unknown App',
				appDescription: appInfo?.details || 'No description available'
			};
		})
		.sort((a, b) => b.usageCount - a.usageCount)
		.slice(0, limit);

	return appEntries;
}

/**
 * Gets recent app activity based on last used timestamps
 *
 * @param limit - Maximum number of activities to return
 * @returns Array of recent app activities
 */
export function getRecentActivity(limit = 5) {
	const appLastUsedStore = JSON.parse(localStorage.getItem('app-last-used') || '{}');
	const projects = JSON.parse(localStorage.getItem('projects') || '[]');

	// Convert to array and sort by date
	const activities = Object.entries(appLastUsedStore)
		.map(([appLink, dateStr]) => {
			const appInfo = projects.find((p: any) => p.link === appLink);
			return {
				appLink,
				date: dateStr as string,
				appName: appInfo?.title || 'Unknown App'
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, limit);

	return activities;
}
