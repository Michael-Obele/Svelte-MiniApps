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
 * Response (JSON):
 *   { file, upload: { kind: 'single', url } }
 *
 * The file body goes straight from the browser to R2 via the presigned PUT
 * URL. R2 caps a single PUT at 5 GiB and `MAX_FILE_SIZE` is 600 MB, so one
 * request always fits — there is no multipart path.
 *
 * Every file is capped at `MAX_FILE_SIZE` (600 MB) and no account is needed.
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
	deletePendingFlashFile
} from '#lib/server/flash-files.js';
import { r2 } from '#lib/server/r2.js';
import {
	ALLOWED_FILE_PREFIXES,
	MAX_FILE_SIZE,
	STORAGE_BUDGET_BYTES,
	STORAGE_BUDGET_GB,
	formatFileSize
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
	if (size > MAX_FILE_SIZE) {
		throw error(413, `File exceeds maximum size of ${formatFileSize(MAX_FILE_SIZE)}`);
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
	// anonymous, which would break the ownership check below.
	const userId: string | null = locals.user?.id ?? null;

	if (parent.userId && parent.userId !== userId) {
		throw error(
			403,
			'This flash text was created by a signed-in user, so only that user can attach files. ' +
				'Create your own flash text (no account needed) to add files.'
		);
	}

	// ----- 2a. Storage guards -------------------------------------------

	// Freeze new uploads once total stored size reaches the free-plan budget.
	// Files expire on their own (≤ 24 h), freeing the space again — that is
	// what keeps the bucket inside the 10 GB free tier.
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

	// 30 minutes is ample for a file capped at 600 MB over a presigned PUT.
	const uploadUrlExpirySeconds = 1800;

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
	// browser roll a failed upload back), so if signing fails we must remove
	// it again — otherwise the share lists a file whose object was never
	// written (a download then 404s with R2 NoSuchKey).
	try {
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
