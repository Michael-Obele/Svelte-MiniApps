import { getRequestEvent, query, form } from '$app/server';
import { prisma } from '$lib/server/db';
import { generateMantra } from '$lib/utility/greetings';
import * as v from 'valibot';
import { error } from '@sveltejs/kit';

// ============================================================================
// QUERIES - Read data from the server
// ============================================================================

/**
 * Get a new random mantra
 */
export const getMantra = query(async () => {
	console.log('Generating new mantra...');
	const mantraQuery = generateMantra();
	console.log(`Generated new mantra: "${mantraQuery}"`);
	return mantraQuery;
});

// ============================================================================
// FORMS - Write data to the server
// ============================================================================

/**
 * Toggle like state for a mantra
 */
export const likeMantra = form(
	v.object({
		mantra: v.pipe(
			v.string(),
			v.minLength(1, 'Mantra is required'),
			v.maxLength(100, 'Mantra must be less than 100 characters')
		)
	}),
	async ({ mantra }) => {
		const event = getRequestEvent();

		if (!event?.locals.user) {
			error(401, 'You must be signed in to like a mantra.');
		}

		try {
			// Use a transaction to ensure atomicity
			const newLikeState = await prisma.$transaction(async (tx) => {
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
				await tx.mantra.create({
					data: {
						content: mantra,
						like: true,
						user: { connect: { id: event.locals.user!.id } }
					}
				});

				console.log(`Created and liked new mantra: "${mantra}"`);
				return true;
			});

			// Update the mantra data in cookies
			interface MantraData {
				mantra: string;
				like: boolean;
			}

			const storedMantraData = event.cookies.get('mantra_data');
			let mantraData: MantraData;

			if (storedMantraData) {
				try {
					const parsed = JSON.parse(storedMantraData) as Partial<MantraData> | null;
					mantraData = {
						mantra: typeof parsed?.mantra === 'string' ? parsed.mantra : mantra,
						like: !!parsed?.like
					};
				} catch {
					mantraData = { mantra, like: false };
				}
			} else {
				mantraData = { mantra, like: false };
			}

			const updatedMantraData = { ...mantraData, like: newLikeState };
			event.cookies.set('mantra_data', JSON.stringify(updatedMantraData), {
				path: '/',
				maxAge: 60 * 60 * 24 // 1 day
			});

			return { like: newLikeState };
		} catch (err: unknown) {
			console.error('Error in likeMantra:', err instanceof Error ? err.message : String(err));

			error(500, 'Failed to update like status. Please try again.');
		}
	}
);
