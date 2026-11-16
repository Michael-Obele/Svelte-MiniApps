import { locales } from '../locales/data.js';
import { browser } from '$app/env';
import { loadLocale } from 'wuchale/load-utils';
// so that the loaders are registered
import '../locales/main.loader.svelte.js';
import '../locales/js.loader.js';
import type { LayoutLoad } from './$types.js';

export const load: LayoutLoad = async ({ data }) => {
	// Get data from layout server load
	const serverData = data;

	// Client-side: Read locale from localStorage and load catalogs
	// Note: LanguageSwitcher keeps localStorage and cookie in sync
	if (browser) {
		let locale = 'en';

		try {
			const stored = localStorage.getItem('app-locale');
			const matchedLocale = stored ? locales.find((available) => available === stored) : undefined;
			if (matchedLocale) {
				locale = matchedLocale;
			}
		} catch (error) {
			console.warn('Failed to read locale from localStorage:', error);
		}

		// Load the locale catalogs for client-side rendering
		await loadLocale(locale);
	}

	// Return server data along with any additional data
	return {
		...serverData
	};
};
