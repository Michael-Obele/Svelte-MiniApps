import { prisma } from '$lib/server/db';
import { r2 } from '$lib/server/r2';

export interface FlashTextItem {
	id: string;
	slug: string;
	content: string;
	expiresAt: string;
	createdAt: string;
	userId: string | null;
}

export async function getFlashTextBySlug(slug: string): Promise<FlashTextItem | null> {
	const flashText = await prisma.flashText.findUnique({
		where: { slug },
		// Pull file storage keys so we can clean up the R2 objects when the
		// text expires — the cascade would otherwise orphan the R2 bucket.
		include: {
			files: { select: { storageKey: true } }
		}
	});

	if (!flashText) return null;

	if (new Date() > flashText.expiresAt) {
		// Best-effort: delete the R2 objects, then the DB row (cascade
		// removes the file rows). Both steps tolerate failures so a stuck
		// R2 call doesn't leak the DB row.
		if (flashText.files.length > 0) {
			await Promise.allSettled(flashText.files.map((f) => r2.deleteObject(f.storageKey))).catch(
				() => {}
			);
		}
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
	};
}
