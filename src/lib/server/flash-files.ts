/**
 * Server-side helpers for the FlashFile feature.
 *
 * These functions own the read/write paths for `FlashFile` metadata and
 * coordinate the deletion of orphaned R2 objects. Remote functions in
 * `flash-text.remote.ts` call into this module.
 */

import { prisma } from '$lib/server/db';
import { r2 } from '$lib/server/r2';
import type { FlashFileItem } from '$lib/types/flash-file';

function toItem(file: {
	id: string;
	slug: string;
	flashTextId: string;
	fileName: string;
	fileSize: number;
	contentType: string;
	downloadCount: number;
	expiresAt: Date;
	createdAt: Date;
	userId: string | null;
}): FlashFileItem {
	return {
		id: file.id,
		slug: file.slug,
		flashTextId: file.flashTextId,
		fileName: file.fileName,
		fileSize: file.fileSize,
		contentType: file.contentType,
		downloadCount: file.downloadCount,
		expiresAt: file.expiresAt.toISOString(),
		createdAt: file.createdAt.toISOString(),
		userId: file.userId
	};
}

/** Generate a short random slug (10 chars, URL-safe). */
export function generateFileSlug(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let slug = '';
	for (let i = 0; i < 10; i++) {
		slug += chars[Math.floor(Math.random() * chars.length)];
	}
	return slug;
}

/**
 * Persist metadata for a freshly-uploaded file. The R2 upload itself happens
 * inside the remote function before this is called; this only records the
 * row that links the public slug to the storage key.
 */
export async function recordFlashFile(params: {
	flashTextId: string;
	fileName: string;
	fileSize: number;
	contentType: string;
	storageKey: string;
	expiresAt: Date;
	userId: string | null;
}): Promise<FlashFileItem> {
	const slug = generateFileSlug();
	const file = await prisma.flashFile.create({
		data: {
			id: crypto.randomUUID(),
			slug,
			flashTextId: params.flashTextId,
			fileName: params.fileName,
			fileSize: params.fileSize,
			contentType: params.contentType,
			storageKey: params.storageKey,
			expiresAt: params.expiresAt,
			userId: params.userId
		}
	});
	return toItem(file);
}

/** List all (non-expired) files attached to a flash text. */
export async function getFilesForFlashText(flashTextId: string): Promise<FlashFileItem[]> {
	const files = await prisma.flashFile.findMany({
		where: {
			flashTextId,
			expiresAt: { gt: new Date() }
		},
		orderBy: { createdAt: 'asc' }
	});
	return files.map(toItem);
}

/** List a user's recent flash files across all their flash texts. */
export async function getUserFlashFiles(userId: string): Promise<FlashFileItem[]> {
	const files = await prisma.flashFile.findMany({
		where: {
			userId,
			expiresAt: { gt: new Date() }
		},
		orderBy: { createdAt: 'desc' },
		take: 50
	});
	return files.map(toItem);
}

/** Resolve a file by its public slug, enforcing expiry and ownership checks. */
export async function getFlashFileBySlug(
	slug: string,
	options: { ownerCheck?: { userId: string } } = {}
): Promise<FlashFileItem | null> {
	const file = await prisma.flashFile.findUnique({ where: { slug } });
	if (!file) return null;

	if (new Date() > file.expiresAt) {
		// Best-effort cleanup; ignore failures since the row is already expired.
		await prisma.flashFile.delete({ where: { id: file.id } }).catch(() => {});
		await r2.deleteObject(file.storageKey).catch(() => {});
		return null;
	}

	if (options.ownerCheck && file.userId !== options.ownerCheck.userId) {
		throw new Error('Not authorized');
	}

	return toItem(file);
}

/** Delete a file (DB + R2). Owner-only. */
export async function deleteFlashFile(id: string, userId: string): Promise<void> {
	const file = await prisma.flashFile.findUnique({ where: { id } });
	if (!file) throw new Error('Not found');
	if (file.userId !== userId) throw new Error('Not authorized');

	await r2.deleteObject(file.storageKey).catch(() => {});
	await prisma.flashFile.delete({ where: { id } });
}

/** Increment the download counter atomically. */
export async function incrementDownloadCount(id: string): Promise<void> {
	await prisma.flashFile.update({
		where: { id },
		data: { downloadCount: { increment: 1 } }
	});
}

/**
 * Best-effort cleanup of expired files: removes the R2 object and the DB row.
 * Designed to be called from the existing hourly Netlify function.
 */
export async function cleanupExpiredFlashFiles(): Promise<{
	deletedR2: number;
	deletedDb: number;
}> {
	const expired = await prisma.flashFile.findMany({
		where: { expiresAt: { lt: new Date() } },
		select: { id: true, storageKey: true }
	});

	if (expired.length === 0) {
		return { deletedR2: 0, deletedDb: 0 };
	}

	// Delete R2 objects first; tolerate failures so we still free DB rows.
	const r2Results = await Promise.allSettled(
		expired.map((f: { id: string; storageKey: string }) => r2.deleteObject(f.storageKey))
	);
	const deletedR2 = r2Results.filter(
		(r: PromiseSettledResult<void>) => r.status === 'fulfilled'
	).length;

	const result = await prisma.flashFile.deleteMany({
		where: { id: { in: expired.map((f: { id: string; storageKey: string }) => f.id) } }
	});

	return { deletedR2, deletedDb: result.count };
}

/**
 * Aggressive, all-in-one cleanup sweep.
 *
 * Called on every public read (the public `f/[slug]` page and the
 * `api/flash-files/[slug]` download route) so that opening *any* active
 * flash text also reaps every expired entry — both DB rows and their
 * backing R2 objects. This keeps the bucket and the database tidy between
 * hourly Netlify cron runs.
 *
 * Bounded per call so a single request can never block the event loop
 * behind a huge delete (the next request will mop up the remainder).
 *
 * @param options.batchSize  Max number of files/texts to handle per call.
 */
export async function cleanupAllExpired(options: { batchSize?: number } = {}): Promise<{
	deletedTexts: number;
	deletedFileRows: number;
	deletedR2Objects: number;
	hadMore: boolean;
}> {
	const batchSize = options.batchSize ?? 100;
	const now = new Date();

	// 1. Find all expired file rows FIRST so we still have their R2 keys.
	//    Deleting the parent text before this query would cascade-remove
	//    the file rows and orphan the R2 objects.
	const expiredFiles = await prisma.flashFile.findMany({
		where: { expiresAt: { lt: now } },
		select: { id: true, storageKey: true },
		take: batchSize
	});

	// 2. Find expired flash texts (their file rows will cascade-delete).
	const expiredTexts = await prisma.flashText.findMany({
		where: { expiresAt: { lt: now } },
		select: { id: true },
		take: batchSize
	});

	let deletedR2Objects = 0;
	if (expiredFiles.length > 0) {
		const r2Results = await Promise.allSettled(
			expiredFiles.map((f) => r2.deleteObject(f.storageKey))
		);
		deletedR2Objects = r2Results.filter((r) => r.status === 'fulfilled').length;
	}

	// 3. Delete the expired texts (cascades to their file rows).
	const deletedTextsResult =
		expiredTexts.length > 0
			? await prisma.flashText.deleteMany({
					where: { id: { in: expiredTexts.map((t) => t.id) } }
				})
			: { count: 0 };

	// 4. Defensive: delete any expired file rows that remain (e.g. parent
	//    text expired but cascade didn't fire, or row survived the in
	//    clause). This is safe to run unconditionally — empty `in` is a no-op.
	const deletedFileRowsResult = await prisma.flashFile.deleteMany({
		where: { id: { in: expiredFiles.map((f) => f.id) } }
	});

	// `hadMore` is true if either table had more expired rows than we
	// processed this call — the next request will pick them up.
	const hadMoreFiles = await prisma.flashFile.count({
		where: { expiresAt: { lt: now } }
	});
	const hadMoreTexts = await prisma.flashText.count({
		where: { expiresAt: { lt: now } }
	});

	return {
		deletedTexts: deletedTextsResult.count,
		deletedFileRows: deletedFileRowsResult.count,
		deletedR2Objects,
		hadMore: hadMoreFiles > 0 || hadMoreTexts > 0
	};
}

/**
 * Eager-cleanup wrapper used on every public read.
 *
 * Cost control: we run a cheap count first and bail out if the backlog
 * is too big — that way a single request can never trigger hundreds of
 * DB + R2 delete calls, which would burn Netlify invocations on a
 * busy site. The hourly `cleanup-flash-texts` cron uses a much larger
 * batch (500) and will mop up anything we skip here.
 *
 * Set `FLASH_CLEANUP_ON_READ=false` in the environment to disable the
 * eager sweep entirely and rely on the cron alone.
 */
export async function cleanupAllExpiredSafe(): Promise<void> {
	if (process.env.FLASH_CLEANUP_ON_READ === 'false') return;

	try {
		const [expiredFileCount, expiredTextCount] = await Promise.all([
			prisma.flashFile.count({ where: { expiresAt: { lt: new Date() } } }),
			prisma.flashText.count({ where: { expiresAt: { lt: new Date() } } })
		]);

		// Skip the eager sweep if the backlog is large — the hourly cron
		// will handle it more efficiently. Threshold of 100 is high enough
		// that normal traffic never trips it, but low enough that even a
		// worst-case backlog is cleared within a few cron ticks.
		if (expiredFileCount + expiredTextCount > 100) return;

		await cleanupAllExpired();
	} catch (error) {
		console.error('Eager flash cleanup failed', error);
	}
}
