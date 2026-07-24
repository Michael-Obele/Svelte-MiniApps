import { getFlashTextBySlug } from '$lib/server/flash-text';
import { getFilesForFlashText } from '$lib/server/flash-files';
import { r2 } from '$lib/server/r2';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const flashText = await getFlashTextBySlug(params.slug);

	// Only attempt to load files if the parent text is still valid.
	const files = flashText ? await getFilesForFlashText(flashText.id) : [];

	// Generate short-lived presigned download URLs for each file so the
	// browser can download directly from R2 without a Netlify function
	// invocation. The presigned URLs expire in 5 minutes — plenty of time
	// for the user to click the download button.
	const fileDownloadUrls: Record<string, string> = {};
	if (flashText && files.length > 0 && r2.isConfigured()) {
		await Promise.allSettled(
			files.map(async (file) => {
				if (file.storageKey) {
					const url = await r2.getPresignedDownloadUrl(file.storageKey, 300);
					fileDownloadUrls[file.id] = url;
				}
			})
		);
	}

	return {
		flashText,
		files,
		fileDownloadUrls
	};
};
