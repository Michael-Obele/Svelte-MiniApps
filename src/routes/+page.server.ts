import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

async function updateMantraLikeState(mantra: string, userId: string | undefined): Promise<boolean> {
	try {
		// Use a transaction to ensure atomicity
		return await prisma.$transaction(async (tx) => {
			const existingMantra = await tx.mantra.findUnique({
				where: { content: mantra }
			});

			if (existingMantra) {
				const newLikeState = !existingMantra.like;

				await tx.mantra.update({
					where: { id: existingMantra.id },
					data: { like: newLikeState }
				});

				console.log(`Mantra ${newLikeState ? 'liked' : 'unliked'}: "${mantra}"`);
				return newLikeState;
			}

			// Create new mantra with like state true
			if (!userId) {
				// Provide explicit error so upstream can surface a meaningful message
				throw new Error('User ID is required to create a new mantra');
			}

			await tx.mantra.create({
				data: {
					content: mantra,
					like: true,
					user: { connect: { id: userId } }
				}
			});

			console.log(`Created and liked new mantra: "${mantra}"`);
			return true;
		});
	} catch (error: unknown) {
		// Log the error safely
		console.error(
			'Error updating mantra like state:',
			error instanceof Error ? error.message : String(error)
		);

		// Re-throw with more context for proper error handling upstream.
		type ErrorWithCause = Error & { cause?: unknown };
		const e = new Error(`Failed to update like state for mantra: ${mantra}`) as ErrorWithCause;
		e.cause = error;
		throw e;
	}
}

interface MantraData {
	mantra: string;
	like: boolean;
}

// Note: Svelte Load function

export const load: PageServerLoad = async (event) => {
	return {
		user: event.locals.user
	};
};

export const actions = {
	likeMantra: async (event) => {
		try {
			const formData = await event.request.formData();
			const mantraValue = formData.get('mantra');

			// Basic validation: ensure form value exists and is a string
			if (typeof mantraValue !== 'string' || !mantraValue.trim()) {
				return fail(400, {
					message: 'Mantra is required',
					mantra: typeof mantraValue === 'string' ? mantraValue : ''
				});
			}

			// Validate mantra length to prevent abuse
			const trimmedMantra = mantraValue.trim();
			if (trimmedMantra.length > 100) {
				return fail(400, {
					message: 'Mantra must be less than 100 characters',
					mantra: trimmedMantra
				});
			}

			const newLikeState = await updateMantraLikeState(trimmedMantra, event.locals.user?.id);

			// Update the mantra data in cookies
			const storedMantraData = event.cookies.get('mantra_data');
			let mantraData: MantraData;
			if (storedMantraData) {
				try {
					const parsed = JSON.parse(storedMantraData) as Partial<MantraData> | null;
					mantraData = {
						mantra: typeof parsed?.mantra === 'string' ? parsed.mantra : trimmedMantra,
						like: !!parsed?.like
					};
				} catch {
					mantraData = { mantra: trimmedMantra, like: false };
				}
			} else {
				mantraData = { mantra: trimmedMantra, like: false };
			}

			const updatedMantraData = { ...mantraData, like: newLikeState };
			event.cookies.set('mantra_data', JSON.stringify(updatedMantraData), {
				path: '/',
				maxAge: 60 * 60 * 24 // 1 day
			});

			return { like: newLikeState };
		} catch (error: unknown) {
			console.error(
				'Error in likeMantra action:',
				error instanceof Error ? error.message : String(error)
			);

			// If it's a known user-id missing case, surface a 403
			if (
				typeof error === 'object' &&
				error !== null &&
				(error as { message?: string }).message === 'User ID is required to create a new mantra'
			) {
				return fail(403, {
					message: 'You must be signed in to like a new mantra.'
				});
			}

			return fail(500, {
				message: 'Failed to update like status. Please try again.'
			});
		}
	}
};
