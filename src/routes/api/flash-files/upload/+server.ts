/**
 * PUT /api/flash-files/upload?slug=<parent-slug>
 *
 * Streaming upload endpoint for the FlashFile feature.
 *
 * Headers:
 *   - Content-Type:    the file's MIME type (e.g. image/png)
 *   - X-File-Name:     URL-encoded original file name
 *   - Content-Length:  exact file size in bytes (required; R2 will silently
 *                      truncate a chunked PUT, so we refuse unknown lengths)
 *
 * Body: the raw file bytes. We never buffer the body — `request.body` is a
 * `ReadableStream` that gets streamed straight through to R2, so memory
 * usage stays flat regardless of file size (tested up to 600 MB).
 *
 * This replaces an earlier POST+multipart handler that called
 * `file.arrayBuffer()` and buffered the entire file in RAM.
 */

import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { getFlashTextBySlug } from '$lib/server/flash-text';
import { recordFlashFile } from '$lib/server/flash-files';
import { r2 } from '$lib/server/r2';
import { getCurrentUser } from '$lib/remote/auth.remote';
import { ALLOWED_FILE_PREFIXES, MAX_FILE_SIZE } from '$lib/types/flash-file';

const ALLOWED_ALL = ALLOWED_FILE_PREFIXES.length === 0;

function isAllowedType(contentType: string): boolean {
	if (ALLOWED_ALL) return true;
	return ALLOWED_FILE_PREFIXES.some((prefix) => contentType.startsWith(prefix));
}

export const PUT: RequestHandler = async ({ request, url }) => {
	if (!r2.isConfigured()) {
		throw error(
			503,
			'File storage is not configured. Add R2_* environment variables — see .env.example.'
		);
	}

	// ----- 1. Pull everything we need from headers / query BEFORE we start
	//          reading the body. The body is a stream and we can only consume
	//          it once, so any validation that needs the body has to wait.

	const slug = url.searchParams.get('slug');
	if (!slug) throw error(400, 'Missing parent flash text slug (use ?slug=...)');

	const rawFileName = request.headers.get('x-file-name');
	if (!rawFileName) throw error(400, 'Missing X-File-Name header');
	const fileName = safeDecodeURIComponent(rawFileName);
	if (!fileName) throw error(400, 'Invalid X-File-Name header');

	const contentType = (request.headers.get('content-type') ?? 'application/octet-stream')
		.split(';')[0]
		.trim()
		.toLowerCase();

	const contentLength = Number(request.headers.get('content-length') ?? '0');
	if (!Number.isFinite(contentLength) || contentLength <= 0) {
		throw error(
			411,
			'Missing or invalid Content-Length header. The upload must be a single PUT with a known size.'
		);
	}
	if (contentLength > MAX_FILE_SIZE) {
		throw error(
			413,
			`File exceeds maximum size of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))} MB`
		);
	}
	if (!isAllowedType(contentType)) {
		throw error(415, `File type ${contentType || 'unknown'} is not allowed`);
	}

	if (!request.body) {
		throw error(400, 'Missing request body');
	}

	// ----- 2. Validate the parent text + ownership BEFORE we start the
	//          upload, so a 403/404 doesn't waste a 600 MB upload.

	const parent = await getFlashTextBySlug(slug);
	if (!parent) {
		throw error(404, 'Parent flash text not found or expired');
	}

	let userId: string | null = null;
	try {
		const user = await getCurrentUser();
		userId = user?.id ?? null;
	} catch {
		// Anonymous — only allowed on anonymous flash texts.
	}
	if (parent.userId && parent.userId !== userId) {
		// Be explicit about why this is happening so the user knows what
		// to do. Anonymous + non-owner can create their own flash text
		// and attach to that.
		throw error(
			403,
			'This flash text was created by a signed-in user, so only that user can attach files. ' +
				'Create your own flash text (no account needed) to add files.'
		);
	}

	// ----- 3. Stream the body to R2. `request.body` is a ReadableStream
	//          that we pass straight through; nothing is buffered.

	const storageKey = `flash-files/${parent.id}/${crypto.randomUUID()}-${sanitizeName(fileName)}`;

	try {
		await r2.putObject(
			storageKey,
			request.body,
			contentType,
			{
				flashTextId: parent.id,
				originalName: sanitizeName(fileName)
			},
			contentLength
		);
	} catch (e) {
		console.error('R2 upload failed', e);
		throw error(502, 'Failed to upload file to storage');
	}

	// ----- 4. Record metadata so the file is discoverable.

	const recorded = await recordFlashFile({
		flashTextId: parent.id,
		fileName,
		fileSize: contentLength,
		contentType,
		storageKey,
		expiresAt: new Date(parent.expiresAt),
		userId
	});

	return json({
		slug: recorded.slug,
		fileName: recorded.fileName,
		fileSize: recorded.fileSize,
		contentType: recorded.contentType,
		expiresAt: recorded.expiresAt
	});
};

/**
 * Keep the same defence as before for the storage key, and tolerate the
 * `X-File-Name` header being either URI-encoded (the client) or
 * unencoded (a hand-rolled curl). Falls back to "file" if the name is
 * unusable after sanitisation.
 */
function sanitizeName(name: string): string {
	return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 200) || 'file';
}

function safeDecodeURIComponent(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		// Header was already decoded by the runtime, or contains malformed
		// percent-escapes — just use the raw value.
		return value;
	}
}
