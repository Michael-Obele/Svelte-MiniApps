import { getFlashTextBySlug } from '$lib/server/flash-text';
import { getFilesForFlashText, cleanupAllExpiredSafe } from '$lib/server/flash-files';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// Eager global cleanup: any expired flash text/file (from ANY user)
	// gets reaped when ANY active one is opened. This keeps the DB and
	// R2 bucket tidy between the hourly Netlify cron runs, and ensures
	// no stale entries linger just because nobody visited them again.
	// Failures are non-fatal — we never want cleanup to break a read.
	await cleanupAllExpiredSafe();

	const flashText = await getFlashTextBySlug(params.slug);

	// Only attempt to load files if the parent text is still valid.
	const files = flashText ? await getFilesForFlashText(flashText.id) : [];

	return {
		flashText,
		files
	};
};
