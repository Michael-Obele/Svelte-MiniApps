import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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



// A writable store that represents a filter state, initially set to false
export let filter = persisted('filter', 'all');

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



/**
 * Scrolls the window to the top of the page with a smooth scrolling effect.
 */
export function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // For smooth scrolling
	});
}

// Define the type for a single budget
export type Budget = {
	name: string;
	amount: string;
	expenses: Expense[];
};

// Define the type for an expense
export type Expense = {
	name: string;
	amount: string;
	done?: boolean;
};

// Store budgets in localStorage
export const budgets = persisted<Budget[]>('budgets', []);

export const budgetCurrency = persisted<string>('budget-currency', '$');