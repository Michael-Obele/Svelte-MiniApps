/**
 * GET /api/flash-files/[slug]
 *
 * Streams a flash file's bytes from Cloudflare R2 to the client.
 *
 * This route exists so we can:
 *   - Enforce the expiry check on every download.
 *   - Bump the per-file download counter.
 *   - Avoid exposing the bucket directly to the public.
 *
 * Files are streamed as-is (no transcoding). The `Content-Type` and
 * `Content-Disposition` headers are forwarded from the original upload.
 */

import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import {
	getFlashFileBySlug,
	incrementDownloadCount,
	cleanupAllExpiredSafe
} from '$lib/server/flash-files';
import { r2 } from '$lib/server/r2';

export const GET: RequestHandler = async ({ params }) => {
	if (!r2.isConfigured()) {
		throw error(503, 'File storage is not configured.');
	}

	// Eager global cleanup: opening any flash file also reaps every
	// other expired entry so the bucket never accumulates stale objects.
	// Failures are non-fatal — we never want cleanup to break a download.
	await cleanupAllExpiredSafe();

	const slug = params.slug;
	if (!slug) throw error(400, 'Missing slug');

	const file = await getFlashFileBySlug(slug);
	if (!file) throw error(404, 'File not found or expired');
	if (!file.storageKey) throw error(500, 'File metadata is incomplete');

	const object = await r2.getObject(file.storageKey);
	if (!object) {
		// Object missing in R2 (e.g. orphaned). Clean up the DB row.
		throw error(404, 'File not found in storage');
	}

	// Bump download counter (fire-and-forget; failures are non-fatal).
	incrementDownloadCount(file.id).catch(() => {});

	const headers = new Headers();
	headers.set('Content-Type', object.contentType);
	headers.set('Content-Length', String(object.size));
	headers.set('Content-Disposition', `attachment; filename="${encodeFilename(file.fileName)}"`);
	headers.set('Cache-Control', 'private, max-age=0, must-revalidate');

	return new Response(object.body, { status: 200, headers });
};

/** Encode a filename for use inside a Content-Disposition header (RFC 5987). */
function encodeFilename(name: string): string {
	const asciiSafe = name.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
	const utf8 = encodeURIComponent(name).replace(/['()]/g, escape).replace(/\*/g, '%2A');
	return `${asciiSafe}; filename*=UTF-8''${utf8}`;
}
