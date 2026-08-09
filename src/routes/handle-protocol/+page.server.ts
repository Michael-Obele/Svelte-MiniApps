import { redirect, error } from '@sveltejs/kit';
import { resolveProtocolTarget } from '$lib/utility/share-routing';
import { projects } from '$lib/index.svelte';
import type { PageServerLoad } from './$types';

/**
 * Handler for the `web+miniapps:` protocol registered in
 * `static/manifest.json`. The browser forwards the whole custom-scheme URL
 * as the `url` query param.
 */
export const load: PageServerLoad = async ({ url }) => {
	const knownSlugs = projects().map((project) => project.link);
	const target = resolveProtocolTarget(url.searchParams.get('url'), knownSlugs);

	if (!target) {
		error(400, 'Unsupported protocol payload');
	}

	redirect(303, target);
};
