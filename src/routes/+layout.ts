// import { locales } from 'virtual:wuchale/locales';
// import { browser } from '$app/environment';
// import { loadLocale } from 'wuchale/load-utils';
// // so that the loaders are registered
// import '../locales/loader.svelte.js';
// import type { LayoutLoad } from './$types.js';
// import { ANALYTICS_ID } from '$env/static/private';

// export const load: LayoutLoad = async ({ url, parent }) => {
// 	// Get data from parent layout server load
// 	const parentData = await parent();

// 	const locale = url.searchParams.get('locale') ?? 'en';

// 	if (!locales.includes(locale)) {
// 		return {
// 			...parentData
// 		};
// 	}

// 	if (browser) {
// 		await loadLocale(locale);
// 	}

// 	// Return parent data along with any additional data
// 	return {
// 		...parentData
// 	};
// };
