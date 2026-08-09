import { redirect } from '@sveltejs/kit';
import { resolveShareTarget } from '$lib/utility/share-routing';
import type { PageServerLoad } from './$types';

/**
 * Web Share Target endpoint.
 *
 * Declared in `static/manifest.json` as `share_target` with `method: "GET"`,
 * so the shared payload arrives as query params. We inspect it and forward to
 * whichever mini-app is best suited to the content.
 */
export const load: PageServerLoad = async ({ url }) => {
	const target = resolveShareTarget({
		title: url.searchParams.get('title'),
		text: url.searchParams.get('text'),
		url: url.searchParams.get('url')
	});

	redirect(303, target);
};
