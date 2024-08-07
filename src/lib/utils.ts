import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { writable } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

// An array of contributions for each month, initialized with a count of 0 for each month
export let contributions = writable([
	{ date: 'January', count: 0 },
	{ date: 'February', count: 0 },
	{ date: 'March', count: 0 },
	{ date: 'April', count: 0 },
	{ date: 'May', count: 0 },
	{ date: 'June', count: 0 },
	{ date: 'July', count: 0 },
	{ date: 'August', count: 0 },
	{ date: 'September', count: 0 },
	{ date: 'October', count: 0 },
	{ date: 'November', count: 0 },
	{ date: 'December', count: 0 }
]);

// A writable store that represents a filter state, initially set to false
export let filter = writable('all');

export function stringifyWithBigInt(obj: any) {
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