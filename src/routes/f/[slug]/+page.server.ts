import { getFlashTextBySlug } from '$lib/server/flash-text';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const flashText = await getFlashTextBySlug(params.slug);

	if (!flashText) {
		return { flashText: null, slug: params.slug };
	}

	return { flashText, slug: params.slug };
};
