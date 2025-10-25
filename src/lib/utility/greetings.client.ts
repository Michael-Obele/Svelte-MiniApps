/**
 * Client-safe greeting utilities (no Node.js dependencies)
 * These functions can be used in both browser and server contexts
 */

export interface Mantra {
	phrase: string;
}

/**
 * Returns a greeting message based on the current time.
 *
 * @returns A string representing the current time-based greeting.
 */
export const getGreeting = (): string => {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
};

/**
 * Calculates the number of milliseconds until the next time period (morning, afternoon, or evening) based on the current hour.
 *
 * @returns The number of milliseconds until the next time period.
 */
export function getMillisecondsUntilNextPeriod(): number {
	const now = new Date();
	const hour = now.getHours();

	let nextHour: number;
	if (hour >= 0 && hour < 5) {
		nextHour = 5;
	} else if (hour >= 5 && hour < 12) {
		nextHour = 12;
	} else if (hour >= 12 && hour < 18) {
		nextHour = 18;
	} else {
		// Use 29 to roll the date forward by one day when setting hours
		nextHour = 29;
	}

	const nextTime = new Date();
	nextTime.setHours(nextHour, 0, 0, 0);
	if (nextHour === 29) {
		// normalize to 5 AM next day
		nextTime.setDate(nextTime.getDate() + 1);
	}

	return nextTime.getTime() - now.getTime();
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
