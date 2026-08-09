/**
 * Client-safe greeting utilities (no Node.js dependencies)
 * These functions can be used in both browser and server contexts
 */

/**
 * Local mantras shown while the server mantra query is loading or unreachable.
 * The remote query is decorative — the hero must never block on the network.
 */
const FALLBACK_MANTRAS = [
	'Breathe in, spark out',
	'Small steps, big magic',
	'Today is your canvas',
	'Shine your quirky light',
	'Flow like a wild river',
	'Create something whimsical',
	'Dazzle the world today',
	'Dream boldly, start small'
];

/**
 * Returns a stable, deterministic fallback mantra for the given date.
 * Same day → same mantra, so it never flickers between renders.
 */
export function getFallbackMantra(date: Date = new Date()): string {
	const startOfYear = new Date(date.getFullYear(), 0, 0);
	const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
	return FALLBACK_MANTRAS[dayOfYear % FALLBACK_MANTRAS.length];
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
		// @wc-include
		greeting = 'Good night';
		nextHour = 5;
	} else if (hour >= 5 && hour < 12) {
		greeting = 'Good morning';
		nextHour = 12;
	} else if (hour >= 12 && hour < 18) {
		// @wc-include
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
