import { query, command, form } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { r2 } from '$lib/server/r2';
import { getCurrentUser } from './auth.remote';
import {
	getFilesForFlashText,
	getUserFlashFiles,
	deleteFlashFile as deleteFlashFileRecord,
	cleanupAllExpired
} from '$lib/server/flash-files';
import type { FlashFileItem } from '$lib/types/flash-file';
import * as v from 'valibot';

// ============================================================================
// TYPES
// ============================================================================

export interface FlashTextItem {
	id: string;
	slug: string;
	content: string;
	expiresAt: string;
	createdAt: string;
	userId: string | null;
}

export type { FlashFileItem };

// ============================================================================
// UTILITY
// ============================================================================

function generateSlug(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let slug = '';
	for (let i = 0; i < 6; i++) {
		slug += chars[Math.floor(Math.random() * chars.length)];
	}
	return slug;
}

export const getUserFlashTexts = query(async () => {
	const user = await getCurrentUser();
	if (!user) return [];

	const flashTexts = await prisma.flashText.findMany({
		where: {
			userId: user.id,
			expiresAt: { gt: new Date() }
		},
		orderBy: { createdAt: 'desc' }
	});

	return flashTexts.map((ft) => ({
		id: ft.id,
		slug: ft.slug,
		content: ft.content,
		expiresAt: ft.expiresAt.toISOString(),
		createdAt: ft.createdAt.toISOString(),
		userId: ft.userId
	})) satisfies FlashTextItem[];
});

// ============================================================================
// FORMS
// ============================================================================

export const createFlashText = form(
	v.object({
		content: v.pipe(v.string(), v.nonEmpty('Content is required')),
		expiryHours: v.pipe(v.string(), v.nonEmpty('Expiry is required'))
	}),
	async (data) => {
		let userId: string | null = null;
		try {
			const user = await getCurrentUser();
			userId = user?.id ?? null;
		} catch {
			// No auth — anonymous paste
		}

		const expiryHours = parseInt(data.expiryHours, 10);
		const slug = generateSlug();
		const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

		const flashText = await prisma.flashText.create({
			data: {
				id: crypto.randomUUID(),
				slug,
				content: data.content,
				expiresAt,
				userId
			}
		});

		redirect(
			303,
			`/apps/flash-text?slug=${encodeURIComponent(flashText.slug)}&expiresAt=${encodeURIComponent(flashText.expiresAt.toISOString())}`
		);
	}
);

// ============================================================================
// COMMANDS
// ============================================================================

export const deleteFlashText = command(
	v.object({
		id: v.string()
	}),
	async (data) => {
		const user = await getCurrentUser();
		if (!user) throw new Error('Authentication required');

		const flashText = await prisma.flashText.findUnique({
			where: { id: data.id },
			// Capture file storage keys so the R2 bucket doesn't leak orphans
			// when the cascade removes the file rows.
			include: { files: { select: { storageKey: true } } }
		});

		if (!flashText) throw new Error('Not found');
		if (flashText.userId !== user.id) throw new Error('Not authorized');

		// Best-effort R2 cleanup first; tolerate failures so we still
		// remove the DB row even if R2 is temporarily unreachable.
		if (flashText.files.length > 0) {
			await Promise.allSettled(flashText.files.map((f) => r2.deleteObject(f.storageKey))).catch(
				() => {}
			);
		}

		await prisma.flashText.delete({ where: { id: data.id } });
		await getUserFlashTexts().refresh();

		return { success: true };
	}
);

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * One-shot cleanup of every expired flash text and its files (DB + R2).
 * Safe to call from a cron, a remote command, or from any request handler
 * that wants to opportunistically sweep stale entries.
 */
export const cleanupExpiredFlashTexts = command(v.object({}), async () => {
	const result = await cleanupAllExpired();
	return {
		deletedTexts: result.deletedTexts,
		deletedFileRows: result.deletedFileRows,
		deletedR2Objects: result.deletedR2Objects,
		hadMore: result.hadMore
	};
});

// ============================================================================
// FILE QUERIES / COMMANDS
// ============================================================================

/** Returns all (non-expired) files attached to a flash text the user can see. */
export const getFlashTextFiles = query(
	v.pipe(v.string(), v.nonEmpty('Slug is required')),
	async (slug) => {
		const text = await prisma.flashText.findUnique({ where: { slug } });
		if (!text) return [];
		if (new Date() > text.expiresAt) return [];
		return getFilesForFlashText(text.id);
	}
);

/** Returns the authenticated user's recent flash files (across all their texts). */
export const getUserFlashFilesList = query(async (): Promise<FlashFileItem[]> => {
	const user = await getCurrentUser();
	if (!user) return [];
	return getUserFlashFiles(user.id);
});

/** Owner-only: delete a file the user uploaded. */
export const deleteFlashFile = command(
	v.object({ id: v.pipe(v.string(), v.nonEmpty('File id is required')) }),
	async (data) => {
		const user = await getCurrentUser();
		if (!user) throw new Error('Authentication required');
		await deleteFlashFileRecord(data.id, user.id);
		await getUserFlashFilesList().refresh();
		return { success: true };
	}
);
