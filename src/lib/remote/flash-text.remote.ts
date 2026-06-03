import { query, command, form } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
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

export const lookupFlashText = query(v.string(), async (slug) => {
	const flashText = await prisma.flashText.findUnique({
		where: { slug }
	});

	if (!flashText) return null;

	if (new Date() > flashText.expiresAt) {
		await prisma.flashText.delete({ where: { id: flashText.id } }).catch(() => {});
		return null;
	}

	return {
		id: flashText.id,
		slug: flashText.slug,
		content: flashText.content,
		expiresAt: flashText.expiresAt.toISOString(),
		createdAt: flashText.createdAt.toISOString(),
		userId: flashText.userId
	} satisfies FlashTextItem;
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
			where: { id: data.id }
		});

		if (!flashText) throw new Error('Not found');
		if (flashText.userId !== user.id) throw new Error('Not authorized');

		await prisma.flashText.delete({ where: { id: data.id } });
		await getUserFlashTexts().refresh();

		return { success: true };
	}
);

// Cleanup expired texts (can be called from a cron or on-request)
export const cleanupExpiredFlashTexts = command(v.object({}), async () => {
	const result = await prisma.flashText.deleteMany({
		where: {
			expiresAt: { lt: new Date() }
		}
	});
	return { deleted: result.count };
});
