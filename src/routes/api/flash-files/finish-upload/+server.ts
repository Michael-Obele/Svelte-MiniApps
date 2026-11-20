/**
 * POST /api/flash-files/finish-upload
 *
 * Rolls back an upload that /api/flash-files/start-upload prepared but that
 * never produced an object.
 *
 * Request body (JSON):
 *   { fileId, action: 'abort' }
 *
 * A single presigned PUT is its own completion — R2 only creates the object
 * once the whole body has arrived — so this route has nothing to assemble.
 * It exists so a cancelled or failed upload never leaves a file listed in the
 * share that cannot be downloaded (R2 `NoSuchKey`).
 *
 * `fileId` is the upload capability: it is a random UUID handed only to the
 * uploader, and it stops working once the file has been downloaded or the
 * parent flash text expires.
 */

import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { r2 } from '#lib/server/r2.js';
import { deletePendingFlashFile, getFlashFileRowById } from '#lib/server/flash-files.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!r2.isConfigured()) {
		throw error(503, 'File storage is not configured.');
	}

	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid JSON body');
	}

	const { fileId, action } = body as {
		fileId?: string;
		action?: string;
	};

	if (!fileId || typeof fileId !== 'string') throw error(400, 'Missing fileId');
	if (action !== 'abort') {
		throw error(400, "action must be 'abort'");
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

	// Signed-in uploads can only be rolled back by their owner; account-less
	// uploads are keyed by the unguessable row id alone.
	if (row.userId && row.userId !== locals.user?.id) {
		throw error(403, 'Not authorized');
	}

	await deletePendingFlashFile(row.id);
	return json({ ok: true });
};
