import { getFlashTextBySlug } from '$lib/server/flash-text';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const flashText = await getFlashTextBySlug(params.slug);

	return {
		flashText
	};
};