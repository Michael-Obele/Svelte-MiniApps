/**
 * POST /api/flash-files/finish-upload
 *
 * Closes out a multipart upload that was prepared by /api/flash-files/start-upload.
 *
 * Request body (JSON):
 *   { fileId, uploadId?, action: 'complete' | 'abort' }
 *
 * `complete` re-reads the uploaded parts from R2 with ListParts and assembles
 * them, so the browser never has to read part ETags (they are not exposed
 * across the bucket's CORS boundary). Completion is refused — and the whole
 * upload rolled back — unless every planned part arrived at exactly the
 * expected size, because completing a partial part list would silently
 * truncate the object.
 *
 * `abort` discards the multipart upload and removes the metadata row, so a
 * cancelled or failed upload never leaves a file listed in the share that
 * cannot be downloaded (R2 `NoSuchKey`).
 *
 * `fileId` is the upload capability: it is a random UUID handed only to the
 * uploader, and it stops working once the file has been downloaded or the
 * parent flash text expires.
 */

import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { r2 } from '#lib/server/r2.js';
import { deletePendingFlashFile, getFlashFileRowById } from '#lib/server/flash-files.js';
import { planMultipartUpload } from '#lib/types/flash-file.js';

/** How many times to re-read the part list while R2 catches up. */
const LIST_PARTS_ATTEMPTS = 5;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!r2.isConfigured()) {
		throw error(503, 'File storage is not configured.');
	}

	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid JSON body');
	}

	const { fileId, uploadId, action } = body as {
		fileId?: string;
		uploadId?: string;
		action?: string;
	};

	if (!fileId || typeof fileId !== 'string') throw error(400, 'Missing fileId');
	if (action !== 'complete' && action !== 'abort') {
		throw error(400, "action must be 'complete' or 'abort'");
	}

	const row = await getFlashFileRowById(fileId);
	if (!row) throw error(404, 'Upload not found');

	if (new Date() > row.expiresAt) {
		await deletePendingFlashFile(row.id);
		throw error(410, 'Upload expired');
	}

	// Once somebody has downloaded the file, the capability is spent — it must
	// never allow replacing or removing a file that is in use.
	if (row.downloadCount > 0) {
		throw error(409, 'This file has already been downloaded');
	}

	// Signed-in uploads can only be finished by their owner; account-less
	// uploads are keyed by the unguessable row id alone.
	if (row.userId && row.userId !== locals.user?.id) {
		throw error(403, 'Not authorized');
	}

	if (action === 'abort') {
		if (uploadId && typeof uploadId === 'string') {
			await r2.abortMultipartUpload(row.storageKey, uploadId).catch(() => {});
		}
		await deletePendingFlashFile(row.id);
		return json({ ok: true });
	}

	// ----- complete -------------------------------------------------------

	if (!uploadId || typeof uploadId !== 'string') throw error(400, 'Missing uploadId');

	const fileSize = Number(row.fileSize);
	const { partSize, partCount } = planMultipartUpload(fileSize);

	/** Bytes part `n` must contain. */
	const expectedPartSize = (partNumber: number) =>
		Math.min(partSize, fileSize - (partNumber - 1) * partSize);

	const file = {
		id: row.id,
		slug: row.slug,
		fileName: row.fileName,
		fileSize
	};

	// R2 can acknowledge a part to the browser a moment before ListParts shows
	// it. Re-read a few times rather than completing a short part list.
	let received = await r2.listParts(row.storageKey, uploadId);
	for (let attempt = 1; received && attempt < LIST_PARTS_ATTEMPTS; attempt++) {
		if (isEveryPartPresent(received, partCount, expectedPartSize)) break;
		await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
		received = await r2.listParts(row.storageKey, uploadId);
	}

	// `null` means the upload id is gone: either this completion already
	// succeeded and the browser never saw the response (retry on a flaky
	// connection), or it was aborted. Only a finished object of the right
	// size counts as success — never destroy a 6 GB upload over a lost reply.
	if (received === null) {
		const existing = await r2.headObject(row.storageKey);
		if (existing && existing.size === fileSize) {
			return json({ ok: true, file });
		}
		await deletePendingFlashFile(row.id);
		throw error(409, 'This upload no longer exists. Please upload the file again.');
	}

	if (!isEveryPartPresent(received, partCount, expectedPartSize)) {
		const arrived = received.reduce((sum, part) => sum + part.size, 0);
		await r2.abortMultipartUpload(row.storageKey, uploadId).catch(() => {});
		await deletePendingFlashFile(row.id);
		throw error(
			400,
			`Upload incomplete: received ${arrived} of ${fileSize} bytes. Please upload the file again.`
		);
	}

	const parts = received
		.filter((part) => part.partNumber >= 1 && part.partNumber <= partCount)
		.map((part) => ({ partNumber: part.partNumber, etag: part.etag }));

	await r2.completeMultipartUpload(row.storageKey, uploadId, parts);

	return json({ ok: true, file });
};

/** True when parts 1..partCount all exist and each has its expected size. */
function isEveryPartPresent(
	parts: { partNumber: number; size: number }[],
	partCount: number,
	expectedPartSize: (partNumber: number) => number
): boolean {
	if (parts.length < partCount) return false;
	for (let partNumber = 1; partNumber <= partCount; partNumber++) {
		const part = parts.find((candidate) => candidate.partNumber === partNumber);
		if (!part || part.size !== expectedPartSize(partNumber)) return false;
	}
	return true;
}
