/**
 * POST /api/flash-files/start-upload
 *
 * Lightweight endpoint that validates a file upload request and returns a
 * presigned PUT URL so the browser can upload directly to Cloudflare R2
 * without proxying file data through a Netlify function.
 *
 * Request body (JSON):
 *   { slug, fileName, contentType, contentLength }
 *
 * Response (JSON) — the `upload` union tells the browser how to send the body:
 *   { file, upload: { kind: 'single', url } }
 *   { file, upload: { kind: 'multipart', uploadId, partSize, parts } }
 *
 * Cloudflare R2 caps a single PUT at 5 GiB, so anything at or above
 * `MULTIPART_THRESHOLD` is uploaded in parts via presigned `UploadPart` URLs
 * and assembled by /api/flash-files/finish-upload.
 *
 * Uploads above `LARGE_FILE_THRESHOLD` (600 MB) require a signed-in account:
 * they are the only uploads that can consume the whole free-plan R2 budget.
 *
 * This replaces the old streaming PUT /api/flash-files/upload endpoint.
 * The actual file body goes straight from browser to R2 via the presigned
 * URL, saving one function invocation per upload and not burning bandwidth
 * through the Netlify function infrastructure.
 */

import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { getFlashTextBySlug } from '#lib/server/flash-text.js';
import {
	recordFlashFile,
	getStorageUsage,
	getActiveLargeFile,
	deletePendingFlashFile
} from '#lib/server/flash-files.js';
import { r2 } from '#lib/server/r2.js';
import {
	ALLOWED_FILE_PREFIXES,
	LARGE_FILE_THRESHOLD,
	MULTIPART_THRESHOLD,
	STORAGE_BUDGET_BYTES,
	STORAGE_BUDGET_GB,
	formatFileSize,
	planMultipartUpload,
	resolveEffectiveMaxFileSize
} from '#lib/types/flash-file.js';

const ALLOWED_ALL = ALLOWED_FILE_PREFIXES.length === 0;

function isAllowedType(contentType: string): boolean {
	if (ALLOWED_ALL) return true;
	return ALLOWED_FILE_PREFIXES.some((prefix) => contentType.startsWith(prefix));
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!r2.isConfigured()) {
		throw error(
			503,
			'File storage is not configured. Add R2_* environment variables — see .env.example.'
		);
	}

	const effectiveMaxFileSize = resolveEffectiveMaxFileSize();

	// ----- 1. Parse and validate input -----------------------------------

	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid JSON body');
	}

	const { slug, fileName, contentType, contentLength } = body as {
		slug?: string;
		fileName?: string;
		contentType?: string;
		contentLength?: number;
	};

	if (!slug || typeof slug !== 'string') throw error(400, 'Missing parent flash text slug');
	if (!fileName || typeof fileName !== 'string') throw error(400, 'Missing fileName');
	if (!contentType || typeof contentType !== 'string') throw error(400, 'Missing contentType');

	const size = typeof contentLength === 'number' && contentLength > 0 ? contentLength : 0;
	if (size <= 0) throw error(411, 'contentLength must be a positive number');

	const parsedContentType = contentType.split(';')[0].trim().toLowerCase();

	// Size check
	if (size > effectiveMaxFileSize) {
		throw error(
			413,
			`File exceeds maximum size of ${Math.round(effectiveMaxFileSize / (1024 * 1024))} MB`
		);
	}

	// MIME type check
	if (!isAllowedType(parsedContentType)) {
		throw error(415, `File type ${parsedContentType || 'unknown'} is not allowed`);
	}

	// ----- 2. Validate parent text + ownership ---------------------------

	const parent = await getFlashTextBySlug(slug);
	if (!parent) {
		throw error(404, 'Parent flash text not found or expired');
	}

	// Read the session straight off the request event. A remote-query call here
	// could resolve to null and silently downgrade a signed-in user to
	// anonymous, which is exactly what the large-upload gate must not do.
	const userId: string | null = locals.user?.id ?? null;

	if (parent.userId && parent.userId !== userId) {
		throw error(
			403,
			'This flash text was created by a signed-in user, so only that user can attach files. ' +
				'Create your own flash text (no account needed) to add files.'
		);
	}

	// ----- 2a. Large uploads require an account --------------------------

	// Anything above the normal 600 MB ceiling is a one-off large upload: it
	// can eat most of the free-plan R2 budget and it needs multipart cleanup,
	// so it stays behind a signed-in account. Small uploads stay anonymous.
	if (size > LARGE_FILE_THRESHOLD && !userId) {
		throw error(
			403,
			`Files over ${formatFileSize(LARGE_FILE_THRESHOLD)} can only be uploaded from a ` +
				'signed-in account. Sign in and try again — smaller files need no account.'
		);
	}

	// ----- 2b. Storage guards -------------------------------------------

	// Only one "large" file (over the normal per-file limit) may be uploaded
	// at a time, so a one-off 6 GB upload can't crowd out everyone else.
	// NOTE: soft guard — two simultaneous large uploads can both slip through.
	if (size > LARGE_FILE_THRESHOLD) {
		const existingLarge = await getActiveLargeFile();
		if (existingLarge) {
			throw error(
				409,
				`Only one large file (over ${formatFileSize(LARGE_FILE_THRESHOLD)}) can be stored at a ` +
					`time. "${existingLarge.fileName}" is active until ${existingLarge.expiresAt.toISOString()}.`
			);
		}
	}

	// Freeze new uploads once total stored size reaches the free-plan budget.
	// Files expire on their own (≤ 24 h), freeing the space again. This is what
	// stops a large file from exhausting the 10 GB free tier.
	const { usedBytes } = await getStorageUsage();
	if (usedBytes + size > STORAGE_BUDGET_BYTES) {
		throw error(
			507,
			`Storage is full (free-plan limit of ${STORAGE_BUDGET_GB} GB). ` +
				`New uploads are paused until existing files expire.`
		);
	}

	// ----- 3. Create DB record + upload target ---------------------------

	const storageKey = `flash-files/${parent.id}/${crypto.randomUUID()}-${sanitizeName(fileName)}`;

	// Large files need longer than the 30-minute default to finish uploading.
	const uploadUrlExpirySeconds = size > LARGE_FILE_THRESHOLD ? 12 * 60 * 60 : 1800;

	const recorded = await recordFlashFile({
		flashTextId: parent.id,
		fileName,
		fileSize: size,
		contentType: parsedContentType,
		storageKey,
		expiresAt: new Date(parent.expiresAt),
		userId
	});

	const file = {
		id: recorded.id,
		slug: recorded.slug,
		fileName: recorded.fileName,
		fileSize: recorded.fileSize,
		contentType: recorded.contentType,
		expiresAt: recorded.expiresAt
	};

	// The row exists before any bytes move (that ordering is what lets the
	// browser roll a failed upload back), so if signing or multipart setup
	// fails we must remove it again — otherwise the share lists a file whose
	// object was never written (a download then 404s with R2 NoSuchKey).
	try {
		if (size >= MULTIPART_THRESHOLD) {
			const uploadId = await r2.startMultipartUpload(
				storageKey,
				parsedContentType || 'application/octet-stream'
			);
			const { partSize, partCount } = planMultipartUpload(size);
			const parts = await r2.getPresignedPartUrls(
				storageKey,
				uploadId,
				Array.from({ length: partCount }, (_, i) => i + 1),
				uploadUrlExpirySeconds
			);
			return json({ file, upload: { kind: 'multipart', uploadId, partSize, parts } });
		}

		const url = await r2.getPresignedUploadUrl(
			storageKey,
			parsedContentType || 'application/octet-stream',
			uploadUrlExpirySeconds
		);
		return json({ file, upload: { kind: 'single', url } });
	} catch {
		await deletePendingFlashFile(recorded.id).catch(() => {});
		throw error(500, 'Could not prepare the upload. Please try again.');
	}
};

/** Strip special characters for use in R2 storage keys. */
function sanitizeName(name: string): string {
	return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 200) || 'file';
}
