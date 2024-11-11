import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

/**
 * Scrolls the window to the top of the page with a smooth scrolling effect.
 */
export function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // For smooth scrolling
	});
}
