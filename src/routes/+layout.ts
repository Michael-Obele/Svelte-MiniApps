import { locales } from 'virtual:wuchale/locales';
import { browser } from '$app/environment';
import { loadLocale } from 'wuchale/load-utils';
// so that the loaders are registered
import '../locales/loader.svelte.js';
import type { LayoutLoad } from './$types.js';

export const load: LayoutLoad = async ({ parent }) => {
	// Get data from parent layout server load
	const parentData = await parent();

	// Client-side: Read locale from localStorage and load catalogs
	// Note: LanguageSwitcher keeps localStorage and cookie in sync
	if (browser) {
		let locale = 'en';

		try {
			const stored = localStorage.getItem('app-locale');
			if (stored && locales.includes(stored)) {
				locale = stored;
			}
		} catch (error) {
			console.warn('Failed to read locale from localStorage:', error);
		}

		// Load the locale catalogs for client-side rendering
		await loadLocale(locale);
	}

	// Return parent data along with any additional data
	return {
		...parentData
	};
};
