import { prisma } from '$lib/server/db';

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
	};
}
