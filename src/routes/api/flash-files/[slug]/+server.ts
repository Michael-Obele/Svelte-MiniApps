/**
 * GET /api/flash-files/[slug]
 *
 * Redirects the client to a presigned R2 download URL so the file bytes
 * go directly from R2 to the browser without proxying through a Netlify
 * function. Saves one function invocation per download and avoids
 * burning bandwidth through the serverless infrastructure.
 *
 * We still enforce the expiry check and bump the download counter on the
 * server side (these are lightweight DB ops, not data streaming).
 */

import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getFlashFileBySlug, incrementDownloadCount } from '$lib/server/flash-files';
import { r2 } from '$lib/server/r2';

export const GET: RequestHandler = async ({ params }) => {
	if (!r2.isConfigured()) {
		throw error(503, 'File storage is not configured.');
	}

	const slug = params.slug;
	if (!slug) throw error(400, 'Missing slug');

	const file = await getFlashFileBySlug(slug);
	if (!file) throw error(404, 'File not found or expired');
	if (!file.storageKey) throw error(500, 'File metadata is incomplete');

	// Bump download counter (fire-and-forget; failures are non-fatal).
	incrementDownloadCount(file.id).catch(() => {});

	// Generate a short-lived presigned URL (5 min) and redirect.
	// The client downloads directly from R2 — no data flows through us.
	const presignedUrl = await r2.getPresignedDownloadUrl(file.storageKey, 300);

	throw redirect(302, presignedUrl);
};
